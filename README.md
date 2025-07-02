Generate a dynamic user interface which allows users to select from a number of modules for an undergraduate university course. 

All logic should be defined within a seperate CSV file in the following format.
The meaning of the headings is as follows:
credits = how much a module is worth 
term = if a module runs in the Autumn, Spring, Or both Autumn+SPring terms.
type = theory or practice 
code = the unique module identifier. 
name = human readable name of the module
core = can be a 'core' module which is selected by default or an 'optional' module. A core module can also be a choice of this or another as defined in the 'or' heading.
or = the module must be a choice of this or another
exclude = modules that cannot be selected with this module
group = modules that must be selected with this module

The UI should:
1. allow a user to click anywhere on a module to select it.
2. selected modules should be highlighted in green. 
3. Display currently selected module.
4. The interface must prevent users from selecting further modules if the running credit total will be greater than 60 for each term.
5. Make sure the user can click anywhere on a module and not just a tick box.

THE DATA
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
30,Autumn,Practice,MA3023,Animation & Visual Effects 1,option,,,
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
