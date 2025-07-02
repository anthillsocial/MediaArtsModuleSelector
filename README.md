# Undergraduate Module Selector

This project provides a dynamic web-based interface for undergraduate students to select modules for their course, following rules defined in external CSV files.

## Features

- **CSV-driven logic:** All rules and modules are defined in CSV files that can be swapped using a dropdown menu.
- **Visual, interactive selection:** Click anywhere on a module card to select or deselect it (where allowed).
- **Credit enforcement:** Prevents users from exceeding the 60-credit limit per term.
- **Mutual exclusions & grouping:** Handles mutually exclusive modules (`or`), required module combinations (`group`), and incompatible modules (`exclude`).
- **Core and optional modules:** Core modules are highlighted, and some may be pre-selected.
- **Permalinks:** The chosen dataset is reflected in the URL, enabling shareable direct links to a dataset.
- **Current selection summary:** Displays all selected modules in a summary panel.

## CSV Data Format

Each row in the CSV represents a module. Required columns:

| Column   | Description                                                                                 |
|----------|---------------------------------------------------------------------------------------------|
| credits  | Module credit value (e.g. 15 or 30)                                                         |
| term     | Which term the module runs in: `Autumn`, `Spring`, or `Autumn+Spring`                       |
| type     | `theory` or `practice`                                                                      |
| code     | Unique module code (e.g. `MA3811`)                                                          |
| name     | Human-readable module name                                                                  |
| core     | `core` if the module is compulsory, `option` if optional                                    |
| or       | Mutually exclusive module group (e.g. `MA3801/MA3061` means only one can be selected)       |
| exclude  | Modules that cannot be taken together (comma or slash-separated codes)                      |
| group    | Modules that must be selected together (comma or slash-separated codes)                     |

### Example

```csv
credits,term,type,code,name,core,or,exclude,group
30,Autumn+Spring,Practice,MA3811,"Entrepreneurship, Creative Thinking, Digital Marketing",core,,,
30,Autumn+Spring,Practice,MA3801,Advanced Digital Media,core,MA3801/MA3061,,
30,Autumn+Spring,Theory,MA3061,Dissertation,core,MA3061/MA3801,,
30,Autumn+Spring,Practice,MA3005,Advanced Screenwriting,option,,MA3807,
30,Autumn+Spring,Practice,MA3006,Producing Film & TV,option,,,MA31XX
30,Autumn+Spring,Practice,MA3007,Advanced Editing,option,,,
30,Autumn+Spring,Practice,MA3122,Creative Sound to Picture,option,,,MA3022
30,Autumn+Spring,Practice,MA31XX,Collaboration Project,option,,,
30,Autumn+Spring,Practice,MA3807,Advanced Virtual Production,option,,,
30,Autumn,Practice,MA3004,Documentary 1,option,,"MA3005,MA3807",
30,Autumn,Practice,MA3020,Contemporary Digital Practice 1,option,,,MA3120
30,Autumn,Practice,MA3022,Creative Sound Art & Design,option,,,MA3122
30,Autumn,Practice,MA3023,Animation & Visual Effects 1,option,,,MA3024
30,Autumn,Practice,MA3028,Promo 1,option,,,
15,Autumn,Theory,MA3050,Beyond Documentary,option,,,
15,Autumn,Theory,MA3081,Film Style & Interpretation : Realism,option,,,
15,Autumn,Theory,MA3086,Political Cinema,option,,,
15,Spring,Theory,MA3044,Music Video,option,,,
15,Spring,Theory,MA3055,Film Form,option,,,
15,Spring,Theory,MA3092,Poetics of Contemporary TV,option,,,
15,Spring,Theory,MA3806,"Digital Images, People, AI",option,,,
30,Spring,Practice,MA3102,Documentary 2,option,,MA3005/MA3807,MA3004
30,Spring,Practice,MA3120,Contemporary Digital Practice 2,option,,,MA3020
30,Spring,Practice,MA3024,Animation & Visual Effects 2,option,,,MA3023
30,Spring,Practice,MA3029,Promo 2,option,,,MA3023
```