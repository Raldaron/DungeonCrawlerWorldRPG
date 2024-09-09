import TabModule from './tab.js';
import SpellModule from './spell.js';
import UtilityModule from './utility.js';
import ArmorModule from './armor.js';
import AbilityModule from './ability.js';
import EquipmentModule from './equipment.js';
import VitalModule from './vital.js';
import SkillModule from './skill.js';
import TraitModule from './trait.js';
import ActionModule from './actionModule.js';
import itemDatabaseModule from './itemDatabaseModule.js';
import InventoryModule from './inventory.js';
import EnhancementModule from './enhancementModule.js';
import EnhancementAnnouncementModule from './enhancementAnnouncementModule.js';
import CharacterModule from './character.js';

const LocalStorageManager = {
    saveData(key, data) {
        localStorage.setItem(key, JSON.stringify(data));
    },

    loadData(key) {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : null;
    },

    clearData(key) {
        localStorage.removeItem(key);
    },

    clearAllData() {
        localStorage.clear();
    }
};

const App = {
    async init() {
        console.log('Initializing App');
        await Promise.all([
            itemDatabaseModule.init(),
            InventoryModule.init(),
            SkillModule.init(),
            EquipmentModule.init(),
            SpellModule.init()
        ]);

        VitalModule.init();
        TabModule.init();
        UtilityModule.init();
        ArmorModule.init();
        AbilityModule.init();
        EnhancementModule.init();
        EnhancementAnnouncementModule.init();
        TraitModule.init();
        ActionModule.init();
        this.LevelModule.init();
        CharacterModule.init();
        this.RaceClassModule.init();
        this.UIModule.init();
        this.APModule.init();

        EquipmentModule.exposeToGlobalScope();

        this.loadSavedData();
        this.setupEventListeners();

        console.log('All modules initialized');

        const exportButton = document.getElementById('export-character');
        exportButton.addEventListener('click', () => this.exportCharacterData());

        const importButton = document.getElementById('import-character-btn');
        const importInput = document.getElementById('import-character');

        importButton.addEventListener('click', () => importInput.click());

        importInput.addEventListener('change', (event) => {
            const file = event.target.files[0];
            if (file) {
                this.importCharacterData(file);
            }
        });
    },

    saveAllData() {
        const characterData = {
            level: this.LevelModule.currentLevel,
            vitals: VitalModule.getAllVitalData(),
            skills: SkillModule.getAllSkillData(),
            race: this.RaceClassModule.currentRace,
            class: this.RaceClassModule.currentClass,
            equipment: EquipmentModule.getAllEquipmentData(),
            inventory: InventoryModule.getAllInventoryData(),
            spells: SpellModule.getAllSpellData(),
            abilities: AbilityModule.getAllAbilityData(),
            traits: TraitModule.getAllTraitData(),
            ap: this.APModule.apValue
        };
        LocalStorageManager.saveData('characterData', characterData);
    },

    loadSavedData(characterData) {
        if (characterData) {
            this.LevelModule.loadSavedData(characterData.level);
            VitalModule.loadSavedData(characterData.vitals);
            SkillModule.loadSavedData(characterData.skills);
            this.RaceClassModule.loadSavedData(characterData.race, characterData.class);
            EquipmentModule.loadSavedData(characterData.equipment);
            InventoryModule.loadSavedData(characterData.inventory);
            SpellModule.loadSavedData(characterData.spells);
            AbilityModule.loadSavedData(characterData.abilities);
            TraitModule.loadSavedData(characterData.traits);
            this.APModule.loadSavedData(characterData.ap);
            ActionModule.loadSavedData(characterData.actions);  // Add this line

            this.displayInitialData();
        }
    },

    exportCharacterData() {
        const characterData = {
            level: {
                currentLevel: this.LevelModule.currentLevel,
                vitalPoints: this.LevelModule.vitalPoints,
                skillPoints: this.LevelModule.skillPoints
            },
            vitals: VitalModule.getAllVitalData(),
            skills: SkillModule.getAllSkillData(),
            race: this.RaceClassModule.currentRace,
            class: this.RaceClassModule.currentClass,
            equipment: EquipmentModule.getAllEquipmentData(),
            inventory: InventoryModule.getAllInventoryData(),
            spells: SpellModule.getAllSpellData(),
            abilities: AbilityModule.getAllAbilityData(),
            traits: TraitModule.getAllTraitData(),
            ap: this.APModule.apValue,
            actions: ActionModule.getAllActionData()  // Add this line
        };

        const dataStr = JSON.stringify(characterData, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);

        const exportFileDefaultName = 'character_data.json';

        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
    },

    importCharacterData(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const characterData = JSON.parse(e.target.result);
                this.loadSavedData(characterData);
                console.log('Character data imported successfully');
            } catch (error) {
                console.error('Error parsing character data:', error);
            }
        };
        reader.readAsText(file);
    },

    displayInitialData() {
        VitalModule.updateAllVitalScores();
        SkillModule.updateAllSkillScores();
        ActionModule.displayActions();
        AbilityModule.displayCurrentAbilities();
        TraitModule.displayTraits();
        SpellModule.displayKnownSpells();
        EnhancementModule.displayEnhancements();
    },

    setupEventListeners() {
        document.querySelectorAll('.subtablink').forEach(subtab => {
            subtab.addEventListener('click', (event) => {
                TabModule.openSubTab(event.target.dataset.subtab);
            });
        });

        window.addEventListener('click', (event) => {
            if (event.target.classList.contains('modal')) {
                // Add logic here to close the modal if needed
            }
        });

        // Add event listener for saving data
        document.addEventListener('change', this.saveAllData.bind(this));
        document.addEventListener('click', this.saveAllData.bind(this));

        TabModule.openTab('Main');
        TabModule.openSubTab('Actions');
    },

    UIModule: {
        init() {
            this.setupEventListeners();
            this.openTab('Main');
            this.openSubTab('Vitals');
        },

        setupEventListeners() {
            document.querySelectorAll('.tablink').forEach(tablink => {
                tablink.addEventListener('click', (event) => this.openTab(event.target.dataset.tab));
            });

            document.querySelectorAll('.subtablink').forEach(subtablink => {
                subtablink.addEventListener('click', (event) => this.openSubTab(event.target.textContent));
            });
        },

        openTab(tabName) {
            document.querySelectorAll('.tabcontent').forEach(tab => tab.style.display = "none");
            document.querySelectorAll('.tablink').forEach(link => link.classList.remove("active"));

            const selectedTab = document.getElementById(tabName);
            if (selectedTab) {
                selectedTab.style.display = "block";
            } else {
                console.error(`Tab ${tabName} not found`);
            }

            document.querySelector(`.tablink[data-tab="${tabName}"]`)?.classList.add("active");

            if (tabName === 'Stats') {
                this.openSubTab('Vitals');
            }
        },

        openSubTab(subtabName) {
            document.querySelectorAll('.subtabcontent').forEach(tab => tab.style.display = "none");
            document.querySelectorAll('.subtablink').forEach(link => link.classList.remove("active"));

            const selectedSubtab = document.getElementById(subtabName);
            if (selectedSubtab) {
                selectedSubtab.style.display = "block";
            } else {
                console.error(`Subtab ${subtabName} not found`);
            }

            document.querySelector(`.subtablink[data-subtab="${subtabName}"]`)?.classList.add("active");

            if (subtabName === 'Skills') {
                SkillModule.updateAllSkillScores();
            }
        },

        editField(fieldId) {
            const element = document.getElementById(fieldId);
            const currentValue = element.textContent;
            const newValue = prompt(`Enter new value for ${fieldId}:`, currentValue);

            if (newValue !== null) {
                element.textContent = newValue;
                const numValue = parseInt(newValue, 10);

                switch (fieldId) {
                    case 'character-level':
                        App.LevelModule.updateLevel(numValue);
                        break;
                    case 'available-vital-points':
                        VitalModule.setAvailablePoints(numValue);
                        break;
                    case 'available-skill-points':
                        SkillModule.setAvailablePoints(numValue);
                        break;
                }
            }
        }
    },

    LevelModule: {
        currentLevel: 1,
        vitalPoints: 12,
        skillPoints: 18,

        init() {
            this.updateLevel(1);
            this.setupEventListeners();
        },

        setupEventListeners() {
            document.getElementById('character-level')?.addEventListener('dblclick', () => this.promptLevelChange());
        },

        promptLevelChange() {
            const newLevel = prompt(`Enter new level (1-100):`, this.currentLevel);
            if (newLevel !== null) {
                const level = parseInt(newLevel, 10);
                if (!isNaN(level) && level >= 1 && level <= 100) {
                    this.updateLevel(level);
                } else {
                    alert('Please enter a valid level between 1 and 100.');
                }
            }
        },

        updateLevel(newLevel) {
            const oldLevel = this.currentLevel;
            this.currentLevel = newLevel;
            document.getElementById('character-level').textContent = this.currentLevel;

            const [vitalPointsGained, skillPointsGained] = this.calculatePointsGained(oldLevel, newLevel);
            this.vitalPoints += vitalPointsGained;
            this.skillPoints += skillPointsGained;

            VitalModule.setAvailablePoints(this.vitalPoints);
            SkillModule.setAvailablePoints(this.skillPoints);
        },

        calculatePointsGained(oldLevel, newLevel) {
            const levelRanges = [
                { max: 10, vitalPoints: 1, skillPoints: 2 },
                { max: 20, vitalPoints: 2, skillPoints: 4 },
                { max: 30, vitalPoints: 3, skillPoints: 6 },
                { max: 40, vitalPoints: 4, skillPoints: 8 },
                { max: 50, vitalPoints: 5, skillPoints: 10 },
                { max: 60, vitalPoints: 6, skillPoints: 12 },
                { max: 70, vitalPoints: 7, skillPoints: 14 },
                { max: 80, vitalPoints: 8, skillPoints: 16 },
                { max: 90, vitalPoints: 9, skillPoints: 18 },
                { max: 100, vitalPoints: 10, skillPoints: 20 },
            ];

            return levelRanges.reduce((acc, range) => {
                const levelsInRange = Math.min(newLevel, range.max) - Math.max(oldLevel, range.max - 9);
                if (levelsInRange > 0) {
                    acc[0] += levelsInRange * range.vitalPoints;
                    acc[1] += levelsInRange * range.skillPoints;
                }
                return acc;
            }, [0, 0]);
        },

        loadSavedData(data) {
            if (data) {
                this.currentLevel = data.currentLevel || 1;
                this.vitalPoints = data.vitalPoints || 12;
                this.skillPoints = data.skillPoints || 18;
                this.updateLevel(this.currentLevel);
            }
        }
    },

    RaceClassModule: {
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
                // ... (existing UI update code)
    
                this.currentClass = classKey;
                
                // Update CharacterModule
                CharacterModule.setClass(cls);
                
                console.log('Class updated:', cls);
                console.log('Current archetype:', CharacterModule.getArchetype());
    
                // Refresh enhancements after updating class
                EnhancementModule.refreshEnhancements();
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

        loadSavedData(race, classData) {
            if (race) this.updateRaceInfo(race);
            if (classData) this.updateClassInfo(classData);
        },
    },

    APModule: {
        apValue: 0,

        init() {
            this.apContainer = document.getElementById('ap-container');
            this.apValue = document.getElementById('ap-value');
            this.apButtons = document.getElementById('ap-buttons');
            this.apIncrement = document.getElementById('ap-increment');
            this.apDecrement = document.getElementById('ap-decrement');

            this.setupEventListeners();
            this.updateAPDisplay();
        },

        setupEventListeners() {
            this.apContainer.addEventListener('click', () => this.toggleAPButtons());
            this.apIncrement.addEventListener('click', (e) => {
                e.stopPropagation();
                this.changeAP(1);
            });
            this.apDecrement.addEventListener('click', (e) => {
                e.stopPropagation();
                this.changeAP(-1);
            });
            document.addEventListener('click', (e) => {
                if (!this.apContainer.contains(e.target)) {
                    this.hideAPButtons();
                }
            });
        },

        toggleAPButtons() {
            this.apButtons.classList.toggle('hidden');
        },

        hideAPButtons() {
            this.apButtons.classList.add('hidden');
        },

        changeAP(delta) {
            const apElement = document.getElementById('character-ap');
            if (apElement) {
                let currentAP = parseInt(apElement.textContent, 10) || 0;
                currentAP += delta;
                this.updateAPDisplay(currentAP);
            } else {
                console.error('AP element not found');
            }
        },

        updateAPDisplay(ap) {
            const apElement = document.getElementById('character-ap');
            if (apElement) {
                apElement.textContent = ap;
            } else {
                console.error('AP element not found');
            }
        },

        loadSavedData(data) {
            if (data !== undefined) {
                this.apValue = data;
                this.updateAPDisplay(this.apValue);
            }
        },
    },

    debugCharacterInfo() {
        console.log('--- Debug Character Info ---');
        console.log('Current Class:', RaceClassModule.currentClass);
        console.log('Current Archetype:', CharacterModule.getArchetype());
        console.log('Class Data:', CharacterModule.getCurrentClass());
        console.log('---------------------------');
    }
};


document.addEventListener('DOMContentLoaded', async () => {
    console.log('DOM fully loaded and parsed');
    try {
        await App.init();
    } catch (error) {
        console.error('Error during initialization:', error);
    }
});

export default App;

// UI-related functionality
const UIModule = {
    init() {
        this.setupEventListeners();
        this.openTab('Main');
        this.openSubTab('Vitals'); // Open the default subtab
    },

    setupEventListeners() {
        document.querySelectorAll('.tablink').forEach(tablink => {
            tablink.addEventListener('click', (event) => this.openTab(event.target.dataset.tab));
        });

        document.querySelectorAll('.subtablink').forEach(subtablink => {
            subtablink.addEventListener('click', (event) => this.openSubTab(event.target.textContent));
        });
    },

    openTab(tabName) {
        const tabcontent = document.getElementsByClassName("tabcontent");
        for (let i = 0; i < tabcontent.length; i++) {
            tabcontent[i].style.display = "none";
        }

        const tablinks = document.getElementsByClassName("tablink");
        for (let i = 0; i < tablinks.length; i++) {
            tablinks[i].classList.remove("active");
        }

        const selectedTab = document.getElementById(tabName);
        if (selectedTab) {
            selectedTab.style.display = "block";
        } else {
            console.error(`Tab ${tabName} not found`);
        }

        const activeTabLink = document.querySelector(`.tablink[data-tab="${tabName}"]`);
        if (activeTabLink) {
            activeTabLink.classList.add("active");
        }

        // If opening the Stats tab, also open the default subtab
        if (tabName === 'Stats') {
            this.openSubTab('Vitals');
        }
    },

    openSubTab(subtabName) {
        const subtabcontent = document.getElementsByClassName("subtabcontent");
        for (let i = 0; i < subtabcontent.length; i++) {
            subtabcontent[i].style.display = "none";
        }

        const subtablinks = document.getElementsByClassName("subtablink");
        for (let i = 0; i < subtablinks.length; i++) {
            subtablinks[i].classList.remove("active");
        }

        const selectedSubtab = document.getElementById(subtabName);
        if (selectedSubtab) {
            selectedSubtab.style.display = "block";
        } else {
            console.error(`Subtab ${subtabName} not found`);
        }

        const activeSubtabLink = document.querySelector(`.subtablink[data-subtab="${subtabName}"]`);
        if (activeSubtabLink) {
            activeSubtabLink.classList.add("active");
        }

        // Add this block to update skills when switching to the Skills subtab
        if (subtabName === 'Skills') {
            SkillModule.updateAllSkillScores();
        }
    },

    editField(fieldId) {
        if (fieldId === 'available-vital-points') {
            VitalModule.editAvailablePoints();
        } else {
            // Handle other editable fields here
            const element = document.getElementById(fieldId);
            const currentValue = element.textContent;
            const newValue = prompt(`Enter new value for ${fieldId}:`, currentValue);

            if (newValue !== null) {
                element.textContent = newValue;

                // Update related modules if necessary
                if (fieldId === 'character-level') {
                    LevelModule.updateLevel(parseInt(newValue, 10));
                } else if (fieldId === 'available-skill-points') {
                    SkillModule.setAvailablePoints(parseInt(newValue, 10));
                }
            }
        }
    }
};

// Level Module
const LevelModule = {
    currentLevel: 1,
    vitalPoints: 12, // Starting vital points
    skillPoints: 18, // Starting skill points

    init() {
        this.updateLevel(1); // Initialize at level 1
        this.setupEventListeners();
    },

    setupEventListeners() {
        const levelElement = document.getElementById('character-level');
        levelElement.addEventListener('dblclick', () => this.promptLevelChange());
    },

    promptLevelChange() {
        const newLevel = prompt(`Enter new level (1-100):`, this.currentLevel);
        if (newLevel !== null) {
            const level = parseInt(newLevel, 10);
            if (!isNaN(level) && level >= 1 && level <= 100) {
                this.updateLevel(level);
            } else {
                alert('Please enter a valid level between 1 and 100.');
            }
        }
    },

    updateLevel(newLevel) {
        const oldLevel = this.currentLevel;
        this.currentLevel = newLevel;
        document.getElementById('character-level').textContent = this.currentLevel;

        // Calculate and update vital and skill points
        const [vitalPointsGained, skillPointsGained] = this.calculatePointsGained(oldLevel, newLevel);
        this.vitalPoints += vitalPointsGained;
        this.skillPoints += skillPointsGained;

        // Update available points displays
        VitalModule.setAvailablePoints(this.vitalPoints);
        SkillModule.setAvailablePoints(this.skillPoints);
    },

    calculatePointsGained(oldLevel, newLevel) {
        const levelRanges = [
            { max: 10, vitalPoints: 1, skillPoints: 2 },
            { max: 20, vitalPoints: 2, skillPoints: 4 },
            { max: 30, vitalPoints: 3, skillPoints: 6 },
            { max: 40, vitalPoints: 4, skillPoints: 8 },
            { max: 50, vitalPoints: 5, skillPoints: 10 },
            { max: 60, vitalPoints: 6, skillPoints: 12 },
            { max: 70, vitalPoints: 7, skillPoints: 14 },
            { max: 80, vitalPoints: 8, skillPoints: 16 },
            { max: 90, vitalPoints: 9, skillPoints: 18 },
            { max: 100, vitalPoints: 10, skillPoints: 20 },
        ];

        let vitalPointsGained = 0;
        let skillPointsGained = 0;

        for (let level = oldLevel + 1; level <= newLevel; level++) {
            const range = levelRanges.find(r => level <= r.max);
            vitalPointsGained += range.vitalPoints;
            skillPointsGained += range.skillPoints;
        }

        return [vitalPointsGained, skillPointsGained];
    }
};

// RaceClass Module
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

    loadSavedData(race, classData) {
        if (race) {
            const raceSelect = document.getElementById('race-select');
            if (raceSelect) {
                raceSelect.value = race;
                this.updateRaceInfo(race);
            }
        }
        if (classData) {
            const classSelect = document.getElementById('class-select');
            if (classSelect) {
                classSelect.value = classData;
                this.updateClassInfo(classData);
            }
        }
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

            const raceVitalBonuses = this.parseVitalBonuses(race.vitalBonus);
            VitalModule.updateRaceVitalBonuses(raceVitalBonuses);

            const raceSkillBonuses = this.parseSkillBonuses(race.skillBonus);
            SkillModule.updateRaceBonuses(raceSkillBonuses);
            SkillModule.updateAllSkillScores();  // Added this line

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

            const classVitalBonuses = this.parseVitalBonuses(cls.vitalBonus);
            VitalModule.updateClassVitalBonuses(classVitalBonuses);

            const classSkillBonuses = this.parseSkillBonuses(cls.skillBonus);
            SkillModule.updateClassBonuses(classSkillBonuses);
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
        }
    },

    parseVitalBonuses(bonuses) {
        const result = {};
        bonuses.forEach(bonus => {
            const [vital, value] = bonus.split(': ');
            result[vital.toLowerCase()] = parseInt(value);
        });
        return result;
    },

    parseSkillBonuses(bonuses) {
        const result = {};
        bonuses.forEach(bonus => {
            const [skill, value] = bonus.split(': ');
            result[skill.toLowerCase()] = parseInt(value);
        });
        return result;
    }
};

// AP Module
const APModule = {
    apValue: 0,

    init() {
        this.apContainer = document.getElementById('ap-container');
        this.apValue = document.getElementById('ap-value');
        this.apButtons = document.getElementById('ap-buttons');
        this.apIncrement = document.getElementById('ap-increment');
        this.apDecrement = document.getElementById('ap-decrement');

        this.setupEventListeners();
        this.updateAPDisplay();
    },

    setupEventListeners() {
        this.apContainer.addEventListener('click', () => this.toggleAPButtons());
        this.apIncrement.addEventListener('click', (e) => {
            e.stopPropagation();
            this.changeAP(1);
        });
        this.apDecrement.addEventListener('click', (e) => {
            e.stopPropagation();
            this.changeAP(-1);
        });
        document.addEventListener('click', (e) => {
            if (!this.apContainer.contains(e.target)) {
                this.hideAPButtons();
            }
        });
    },

    toggleAPButtons() {
        this.apButtons.classList.toggle('hidden');
    },

    hideAPButtons() {
        this.apButtons.classList.add('hidden');
    },

    setupAPListeners() {
        const apContainer = document.getElementById('ap-container');
        const apElement = document.getElementById('character-ap');
        const incrementButton = document.getElementById('ap-increment');
        const decrementButton = document.getElementById('ap-decrement');

        if (apContainer && apElement && incrementButton && decrementButton) {
            apContainer.addEventListener('click', () => {
                document.getElementById('ap-buttons').classList.toggle('hidden');
            });

            incrementButton.addEventListener('click', (e) => {
                e.stopPropagation();
                this.changeAP(1);
            });

            decrementButton.addEventListener('click', (e) => {
                e.stopPropagation();
                this.changeAP(-1);
            });
        } else {
            console.error('One or more AP elements not found');
        }
    },

    changeAP(delta) {
        const apElement = document.getElementById('character-ap');
        if (apElement) {
            let currentAP = parseInt(apElement.textContent, 10) || 0; // Use 0 if parsing fails
            currentAP += delta;
            this.updateAPDisplay(currentAP);
        } else {
            console.error('AP element not found');
        }
    },

    updateAPDisplay(ap) {
        const apElement = document.getElementById('character-ap');
        if (apElement) {
            apElement.textContent = ap;
        } else {
            console.error('AP element not found');
        }
    },

};

document.getElementById('refresh-enhancements').addEventListener('click', () => {
    console.log('Manually refreshing enhancements');
    App.debugCharacterInfo();
    EnhancementModule.refreshEnhancements();
});

document.addEventListener('DOMContentLoaded', async () => {
    console.log('DOM fully loaded and parsed');
    try {
        // Initialize modules that don't depend on others first
        APModule.init();
        TabModule.init();
        UIModule.init();

        // Initialize modules that might have asynchronous operations
        await Promise.all([
            InventoryModule.init(),
            UtilityModule.init(),
            EquipmentModule.init(),
            SpellModule.init()
        ]);

        // Initialize modules that might depend on the above modules
        VitalModule.init();
        ArmorModule.init();
        AbilityModule.init();
        RaceClassModule.init();

        // Finally, initialize the main App
        await App.init();

        console.log('All modules initialized successfully');
    } catch (error) {
        console.error('Error during initialization:', error);
    }

    const exportButton = document.getElementById('export-character');
    exportButton.addEventListener('click', () => App.exportCharacterData());

    const importButton = document.getElementById('import-character-btn');
    const importInput = document.getElementById('import-character');

    importButton.addEventListener('click', () => importInput.click());

    importInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
            App.importCharacterData(file);
        }
    });
});