let selectorInstance = null;

    function clearAllUI() {
      document.getElementById('csv-error').textContent = '';
      document.getElementById('status-bar').innerHTML = '';
      document.getElementById('warnings').innerHTML = '';
      document.getElementById('autumnspring-list').innerHTML = '';
      document.getElementById('autumn-list').innerHTML = '';
      document.getElementById('spring-list').innerHTML = '';
      document.getElementById('current-selection').innerHTML = '';
    }

    async function loadModulesFromFile(csvFile) {
      // Always robustly clear UI before loading
      if (selectorInstance) selectorInstance.destroy();
      selectorInstance = null;
      clearAllUI();
      try {
        const resp = await fetch(csvFile);
        if (!resp.ok) throw new Error(`Could not load ${csvFile}: ${resp.statusText}`);
        const csvData = await resp.text();
        const modules = parseCSV(csvData);
        selectorInstance = new ModuleSelector(modules);
      } catch (err) {
        document.getElementById('csv-error').textContent = err.message;
        document.getElementById('status-bar').innerHTML = '';
      }
    }

    // Permalink helpers
    function setDatasetInURL(value) {
      const url = new URL(window.location);
      url.searchParams.set('dataset', value);
      window.history.replaceState({}, '', url);
    }

    function getDatasetFromURL(defaultValue) {
      const params = new URLSearchParams(window.location.search);
      return params.get('dataset') || defaultValue;
    }

    document.addEventListener("DOMContentLoaded", () => {
      const datasetSelect = document.getElementById("dataset");
      const initialValue = getDatasetFromURL(datasetSelect.value);
      datasetSelect.value = initialValue;
      loadModulesFromFile(initialValue);
      datasetSelect.addEventListener("change", (e) => {
        const selectedValue = e.target.value;
        setDatasetInURL(selectedValue);
        loadModulesFromFile(selectedValue);
      });
    });

    function parseCSV(data) {
      const [header, ...rows] = data.trim().split("\n");
      const keys = header.split(",").map(k => k.trim());
      return rows
        .map(row => {
          let vals = [];
          let curr = "", inQuotes = false;
          for (let i = 0; i < row.length; ++i) {
            let ch = row[i];
            if (ch === '"') { inQuotes = !inQuotes; continue; }
            if (ch === "," && !inQuotes) { vals.push(curr.trim()); curr = ""; }
            else curr += ch;
          }
          vals.push(curr.trim());
          let obj = {};
          keys.forEach((k, idx) => obj[k] = (vals[idx] || ""));
          ["exclude", "group"].forEach(key => {
            obj[key] = obj[key]
              ? obj[key].split(/[,/]/).map(s => s.trim()).filter(Boolean)
              : [];
          });
          obj.credits = Number(obj.credits);
          obj.term = obj.term.trim();
          obj.core = obj.core.trim();
          obj.or = obj.or.trim();
          obj.type = obj.type.trim();
          return obj;
        });
    }

    function termsForModule(mod) {
      if (/Autumn\+Spring/i.test(mod.term)) return ["AutumnSpring"];
      if (/Autumn/i.test(mod.term) && !/Spring/i.test(mod.term)) return ["Autumn"];
      if (/Spring/i.test(mod.term) && !/Autumn/i.test(mod.term)) return ["Spring"];
      return [];
    }

    class ModuleSelector {
      constructor(modules) {
        this.modules = modules;
        this.selected = new Set();
        this.creditByTerm = { Autumn: 0, Spring: 0 };
        this.exclusions = {};
        this.groupMap = {};
        this.codeMap = {};

        // Detect "or" groups for core modules
        this.orGroups = this.getOrGroups();
        const codesInOrCore = new Set(this.orGroups.flat().filter(code =>
          this.modules.find(m => m.code === code && m.core === 'core')
        ));

        // Only select non-mutually-exclusive core modules by default
        modules.forEach(m => {
          this.codeMap[m.code] = m;
          m.exclude.forEach(e => {
            this.exclusions[m.code] = this.exclusions[m.code] || [];
            this.exclusions[m.code].push(e);
          });
          m.group.forEach(g => {
            this.groupMap[m.code] = this.groupMap[m.code] || [];
            this.groupMap[m.code].push(g);
          });
          // Only select as default if core and NOT part of any mutually exclusive group
          if (m.core === 'core' && !codesInOrCore.has(m.code)) {
            this.selectModule(m.code);
          }
        });

        this.statusBar = document.getElementById("status-bar");
        this.warnings = document.getElementById("warnings");
        this.autumnSpringList = document.getElementById("autumnspring-list");
        this.autumnList = document.getElementById("autumn-list");
        this.springList = document.getElementById("spring-list");
        this.selectedList = document.getElementById("current-selection");

        this.renderGrid();
        this.updateStatus();
        this.updateSelectedList();
      }

      // Robustly clear all containers/UI and null this instance
      destroy() {
        if (this.statusBar) this.statusBar.innerHTML = '';
        if (this.warnings) this.warnings.innerHTML = '';
        if (this.autumnSpringList) this.autumnSpringList.innerHTML = '';
        if (this.autumnList) this.autumnList.innerHTML = '';
        if (this.springList) this.springList.innerHTML = '';
        if (this.selectedList) this.selectedList.innerHTML = '';
      }

      getOrGroups() {
        let groups = {};
        this.modules.forEach(m => {
          if (m.or) {
            const ids = m.or.split("/").map(s => s.trim());
            if (ids.length > 1) groups[m.or] = ids;
          }
        });
        return Object.values(groups);
      }

      requireOrCoreSelection() {
        // Require at least one selection in every mutually exclusive group that contains a 'core' module
        for (let group of this.orGroups) {
          if (group.some(code => this.codeMap[code].core === "core")) {
            if (!group.some(code => this.selected.has(code))) return group;
          }
        }
        return null;
      }

      canSelect(module) {
        if (this.selected.has(module.code)) return true;
        const requiredOr = this.requireOrCoreSelection();
        // Only allow picking core 'or' modules if none has been selected yet
        if (requiredOr && !requiredOr.includes(module.code)) return false;
        for (let sel of this.selected) {
          const selMod = this.codeMap[sel];
          if (selMod.exclude.includes(module.code) || module.exclude.includes(sel)) return false;
        }
        let candidateCodes = this.findGroupMembers(module.code).filter(c => !this.selected.has(c));
        let candidateModules = candidateCodes.map(code => this.codeMap[code]);
        let tempCredit = { ...this.creditByTerm };
        for (const m of candidateModules) {
          let tFor = [];
          if (/Autumn\+Spring/i.test(m.term)) tFor = ["Autumn", "Spring"];
          else if (/Autumn/i.test(m.term) && !/Spring/i.test(m.term)) tFor = ["Autumn"];
          else if (/Spring/i.test(m.term) && !/Autumn/i.test(m.term)) tFor = ["Spring"];
          tFor.forEach(term => {
            tempCredit[term] = (tempCredit[term] || 0) + m.credits / tFor.length;
          });
        }
        if (tempCredit.Autumn > 60 || tempCredit.Spring > 60) return false;
        return true;
      }

      findGroupMembers(code) {
        const groupCodes = new Set([code]);
        const thisMod = this.codeMap[code];
        thisMod.group.forEach(g => groupCodes.add(g));
        this.modules.forEach(m => {
          if (m.group.includes(code)) groupCodes.add(m.code);
        });
        return Array.from(groupCodes);
      }

      handleModuleClick(module, e) {
        e.preventDefault();
        // Prevent selecting disabled/greyed out modules (unless already selected)
        if (!this.selected.has(module.code) && !this.canSelect(module)) return;
        // Prevent deselection of core modules
        if (this.selected.has(module.code)) {
          if (module.core === "core") return;
          this.deselectModule(module.code, true);
        } else {
          this.selectModule(module.code, true);
        }
        this.updateStatus();
        this.updateSelectedList();
        this.renderGrid();
      }

      selectModule(code, recurse = false) {
        if (this.selected.has(code)) return;
        const allGroupMembers = this.findGroupMembers(code);
        allGroupMembers.forEach(c => {
          if (!this.selected.has(c)) {
            if (c !== code) this.selectModule(c, true);
            else {
              const mod = this.codeMap[c];
              this.selected.add(c);
              let tFor = [];
              if (/Autumn\+Spring/i.test(mod.term)) tFor = ["Autumn", "Spring"];
              else if (/Autumn/i.test(mod.term) && !/Spring/i.test(mod.term)) tFor = ["Autumn"];
              else if (/Spring/i.test(mod.term) && !/Autumn/i.test(mod.term)) tFor = ["Spring"];
              tFor.forEach(term => {
                this.creditByTerm[term] = (this.creditByTerm[term] || 0) + mod.credits / tFor.length;
              });
            }
          }
        });
        for (let group of this.orGroups) {
          if (group.includes(code)) {
            group.forEach(other => { if (other !== code) this.deselectModule(other); });
          }
        }
      }

      deselectModule(code, recurse = false) {
        if (!this.selected.has(code)) return;
        const allGroupMembers = this.findGroupMembers(code);
        allGroupMembers.forEach(c => {
          if (this.selected.has(c)) {
            if (c !== code) this.deselectModule(c, true);
            else {
              const mod = this.codeMap[c];
              this.selected.delete(c);
              let tFor = [];
              if (/Autumn\+Spring/i.test(mod.term)) tFor = ["Autumn", "Spring"];
              else if (/Autumn/i.test(mod.term) && !/Spring/i.test(mod.term)) tFor = ["Autumn"];
              else if (/Spring/i.test(mod.term) && !/Autumn/i.test(mod.term)) tFor = ["Spring"];
              tFor.forEach(term => {
                this.creditByTerm[term] -= mod.credits / tFor.length;
              });
            }
          }
        });
      }

      renderGrid() {
        this.autumnSpringList.innerHTML = "";
        this.autumnList.innerHTML = "";
        this.springList.innerHTML = "";

        const createCard = module => {
          const isAutumnSpring = /Autumn\+Spring/i.test(module.term);
          const creditLabel = isAutumnSpring
            ? `${module.credits}<sup class="split-credit">(${module.credits/2}+${module.credits/2})</sup> credit`
            : `${module.credits} credit`;
          const card = document.createElement("div");
          card.className = "module-card";
          if (this.selected.has(module.code)) {
            card.classList.add("selected");
          } else if (module.core === 'core') {
            card.classList.add("core");
          }
          if (!this.canSelect(module) && !this.selected.has(module.code)) card.classList.add("disabled");

          card.innerHTML = `
            <div class="mod-row">
              <span class="code">${module.code}</span>
              <span class="mod-type">${module.type}</span>
              <span class="credit">${creditLabel}</span>
            </div>
            <div class="mod-title">${module.name}</div>
          `;
          card.addEventListener("click", this.handleModuleClick.bind(this, module));
          return card;
        };

        this.modules.forEach(module => {
          const terms = termsForModule(module);
          if (terms.includes("AutumnSpring")) this.autumnSpringList.appendChild(createCard(module));
          if (terms.includes("Autumn")) this.autumnList.appendChild(createCard(module));
          if (terms.includes("Spring")) this.springList.appendChild(createCard(module));
        });
      }

      updateStatus() {
        let statusMsg = `
          <b>Autumn:</b> ${this.creditByTerm.Autumn || 0}/60 credits &nbsp; | &nbsp;
          <b>Spring:</b> ${this.creditByTerm.Spring || 0}/60 credits
        `;
        const requiredOr = this.requireOrCoreSelection();
        this.warnings.innerHTML = "";
        if (requiredOr) {
          this.warnings.innerHTML = `<div class="warning">Please select one of: <b>${requiredOr.map(code => this.codeMap[code].name).join(" or ")}</b> to continue.</div>`;
        } else if ((this.creditByTerm.Autumn || 0) > 60 || (this.creditByTerm.Spring || 0) > 60) {
          this.warnings.innerHTML = `<div class="warning">Credit limit exceeded! Max 60 credits per term.</div>`;
        }
        this.statusBar.innerHTML = statusMsg;
      }

      updateSelectedList() {
        let html = "<h3>Current Selection</h3>";
        if (!this.selected.size) {
          html += "<div>No modules selected.</div>";
        } else {
          html += "<ul>";
          Array.from(this.selected)
            .map(code => this.codeMap[code])
            .sort((a, b) => a.term.localeCompare(b.term) || a.name.localeCompare(b.name))
            .forEach(m => {
              html += `<li>${m.type.charAt(0).toUpperCase() + m.type.slice(1)} - ${m.name} (${m.code}) - ${m.credits} credit, ${m.term}</li>`;
            });
          html += "</ul>";
        }
        this.selectedList.innerHTML = html;
      }
    }