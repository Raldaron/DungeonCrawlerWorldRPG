// RaceClassModule.js
import VitalModule from './vital.js';
import SkillModule from './skill.js';
import AbilityModule from './ability.js';
import TraitModule from './trait.js';
import CharacterModule from './character.js';
import EnhancementModule from './enhancementModule.js';

const RaceClassModule = {
    races: {},
    classes: {},
    currentRace: null,
    currentClass: null,

    init() {
        console.log('Initializing RaceClassModule');
        Promise.all([this.loadRaces(), this.loadClasses()])
            .then(() => this.setupEventListeners())
            .catch(error => console.error('Error initializing RaceClassModule:', error));
    },

    loadRaces() {
        return fetch('races.json')
            .then(response => response.json())
            .then(data => {
                console.log('Races loaded:', data);
                this.races = data;
                this.populateRaceDropdown();
            })
            .catch(error => console.error('Error loading races:', error));
    },

    loadClasses() {
        return fetch('classes.json')
            .then(response => response.json())
            .then(data => {
                console.log('Classes loaded:', data);
                this.classes = data;
                this.populateClassDropdown();
            })
            .catch(error => console.error('Error loading classes:', error));
    },

    populateRaceDropdown() {
        const raceSelect = document.getElementById('race-select');
        if (!raceSelect) {
            console.error('Race select element not found');
            return;
        }
        raceSelect.innerHTML = '<option value="">Select a race</option>';
        Object.entries(this.races).forEach(([key, race]) => {
            const option = document.createElement('option');
            option.value = key;
            option.textContent = race.name;
            raceSelect.appendChild(option);
        });
        console.log('Race dropdown populated');
    },

    populateClassDropdown() {
        const classSelect = document.getElementById('class-select');
        if (!classSelect) {
            console.error('Class select element not found');
            return;
        }
        classSelect.innerHTML = '<option value="">Select a class</option>';
        Object.entries(this.classes).forEach(([key, cls]) => {
            const option = document.createElement('option');
            option.value = key;
            option.textContent = cls.name;
            classSelect.appendChild(option);
        });
        console.log('Class dropdown populated');
    },

    setupEventListeners() {
        document.getElementById('race-select')?.addEventListener('change', (e) => this.updateRaceInfo(e.target.value));
        document.getElementById('class-select')?.addEventListener('change', (e) => this.updateClassInfo(e.target.value));
    },

    updateRaceInfo(raceKey) {
        const race = this.races[raceKey];
        if (race) {
            document.getElementById('race-name').textContent = race.name;
            document.getElementById('race-description').textContent = race.description;
            document.getElementById('race-lore').textContent = race.lore;
            document.getElementById('stat-bonuses').textContent = race.vitalBonus.join(', ');
            document.getElementById('skill-bonuses').textContent = race.skillBonus.join(', ');
            document.getElementById('race-traits').textContent = race.traits.join(', ');
            document.getElementById('race-abilities').textContent = race.abilities.join(', ');

            VitalModule.updateRaceVitalBonuses(this.parseVitalBonuses(race.vitalBonus));
            SkillModule.updateRaceBonuses(this.parseSkillBonuses(race.skillBonus));
            SkillModule.updateAllSkillScores();

            if (race.abilities && Array.isArray(race.abilities)) {
                AbilityModule.updateAbilities('race', race.abilities);
            }
            if (race.traits && Array.isArray(race.traits)) {
                TraitModule.updateTraits('race', null, race.traits);
            }

            this.currentRace = raceKey;
        }
    },

    updateClassInfo(classKey) {
        const cls = this.classes[classKey];
        if (cls) {
            document.getElementById('class-name').textContent = cls.name;
            document.getElementById('class-description').textContent = cls.description;
            document.getElementById('class-archetype').textContent = cls.archetype;
            document.getElementById('class-primary-vitals').textContent = cls.primaryVitals.join(', ');
            document.getElementById('class-vital-bonuses').textContent = cls.vitalBonus.join(', ');
            document.getElementById('class-skill-bonuses').textContent = cls.skillBonus.join(', ');
            document.getElementById('class-traits').textContent = cls.traits.join(', ');
            document.getElementById('class-abilities').textContent = cls.abilities.join(', ');

            VitalModule.updateClassVitalBonuses(this.parseVitalBonuses(cls.vitalBonus));
            SkillModule.updateClassBonuses(this.parseSkillBonuses(cls.skillBonus));
            SkillModule.updateAllSkillScores();

            if (cls.abilities && Array.isArray(cls.abilities)) {
                AbilityModule.updateAbilities('class', cls.abilities);
            }
            if (cls.traits && Array.isArray(cls.traits)) {
                TraitModule.updateTraits('class', null, cls.traits);
            }

            this.currentClass = classKey;
            CharacterModule.setClass(cls);
            
            console.log('Class updated:', cls);
            console.log('Current archetype:', CharacterModule.getArchetype());

            EnhancementModule.refreshEnhancements();
            this.applyClassBonuses(classKey);
        }
    },

    parseVitalBonuses(bonuses) {
        return bonuses.reduce((acc, bonus) => {
            const [vital, value] = bonus.split(': ');
            acc[vital.toLowerCase()] = parseInt(value);
            return acc;
        }, {});
    },

    parseSkillBonuses(bonuses) {
        return bonuses.reduce((acc, bonus) => {
            const [skill, value] = bonus.split(': ');
            acc[this.normalizeSkillName(skill)] = parseInt(value);
            return acc;
        }, {});
    },
    
    normalizeSkillName(skillName) {
        return skillName.toLowerCase().replace(/\s+/g, '-');
    },

    getCurrentRaceBonuses() {
        if (this.currentRace) {
            const race = this.races[this.currentRace];
            return {
                vitals: this.parseVitalBonuses(race.vitalBonus),
                skills: this.parseSkillBonuses(race.skillBonus)
            };
        }
        return { vitals: {}, skills: {} };
    },

    getCurrentClassBonuses() {
        if (this.currentClass) {
            const cls = this.classes[this.currentClass];
            return {
                vitals: this.parseVitalBonuses(cls.vitalBonus),
                skills: this.parseSkillBonuses(cls.skillBonus)
            };
        }
        return { vitals: {}, skills: {} };
    },

    getCurrentRace() {
        return this.currentRace;
    },

    getCurrentClass() {
        return this.currentClass;
    },

    displayRaceClassInfo() {
        if (this.currentRace) {
            document.getElementById('race-name').textContent = this.races[this.currentRace].name;
            document.getElementById('race-description').textContent = this.races[this.currentRace].description;
            // Update other race-related elements...
        }
    
        if (this.currentClass) {
            document.getElementById('class-name').textContent = this.classes[this.currentClass].name;
            document.getElementById('class-description').textContent = this.classes[this.currentClass].description;
            // Update other class-related elements...
        }
    },

    resetRaceAndClass() {
        this.currentRace = null;
        this.currentClass = null;
        VitalModule.resetRaceBonuses();
        VitalModule.resetClassBonuses();
        SkillModule.resetRaceBonuses();
        SkillModule.resetClassBonuses();
        AbilityModule.resetRaceAbilities();
        AbilityModule.resetClassAbilities();
        TraitModule.resetRaceTraits();
        TraitModule.resetClassTraits();
    },

    loadSavedData(race, characterClass) {
        console.log(`Loading saved data for race: ${race} and class: ${characterClass}`);
        
        // Update race
        const raceSelect = document.getElementById('race-select');
        if (raceSelect) {
            raceSelect.value = race;
            this.updateRaceInfo(race);
        }

        // Update class
        const classSelect = document.getElementById('class-select');
        if (classSelect) {
            classSelect.value = characterClass;
            this.updateClassInfo(characterClass);
        }

        // Ensure bonuses are applied
        this.applyRaceAndClassBonuses();
    },

    applyRaceAndClassBonuses() {
        const race = this.races[this.currentRace];
        const characterClass = this.classes[this.currentClass];

        if (race) {
            VitalModule.updateRaceVitalBonuses(this.parseVitalBonuses(race.vitalBonus));
            SkillModule.updateRaceBonuses(this.parseSkillBonuses(race.skillBonus));
        }

        if (characterClass) {
            VitalModule.updateClassVitalBonuses(this.parseVitalBonuses(characterClass.vitalBonus));
            SkillModule.updateClassBonuses(this.parseSkillBonuses(characterClass.skillBonus));
        }

        VitalModule.updateAllVitalScores();
        SkillModule.updateAllSkillScores();
    },

    applyRaceBonuses(raceKey) {
        const race = this.races[raceKey];
        if (race) {
            const vitalBonuses = this.parseVitalBonuses(race.vitalBonus);
            const skillBonuses = this.parseSkillBonuses(race.skillBonus);
            
            VitalModule.updateRaceVitalBonuses(vitalBonuses);
            SkillModule.updateRaceBonuses(skillBonuses);
            
            // Update abilities and traits
            if (race.abilities && Array.isArray(race.abilities)) {
                AbilityModule.updateAbilities('race', race.abilities);
            }
            if (race.traits && Array.isArray(race.traits)) {
                TraitModule.updateTraits('race', null, race.traits);
            }
        }
    },

    setSelectedRace(raceKey) {
        const raceSelect = document.getElementById('race-select');
        if (raceSelect) {
            raceSelect.value = raceKey;
            this.updateRaceInfo(raceKey);
        }
    },

    setSelectedClass(classKey) {
        const classSelect = document.getElementById('class-select');
        if (classSelect) {
            classSelect.value = classKey;
            this.updateClassInfo(classKey);
        }
    },
    
    applyClassBonuses(classKey) {
        const cls = this.classes[classKey];
        if (cls) {
            const vitalBonuses = this.parseVitalBonuses(cls.vitalBonus);
            const skillBonuses = this.parseSkillBonuses(cls.skillBonus);
            
            VitalModule.updateClassVitalBonuses(vitalBonuses);
            SkillModule.updateClassBonuses(skillBonuses);
            
            // Update abilities and traits
            if (cls.abilities && Array.isArray(cls.abilities)) {
                AbilityModule.updateAbilities('class', cls.abilities);
            }
            if (cls.traits && Array.isArray(cls.traits)) {
                TraitModule.updateTraits('class', null, cls.traits);
            }
            
            CharacterModule.setClass(cls);
        }
    },
};

export default RaceClassModule;