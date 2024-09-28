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
import UIModule from './UIModule.js';
import LevelModule from './LevelModule.js';
import RaceClassModule from './RaceClassModule.js';
import APModule from './APModule.js';
import ExportModule from './exportModule.js';
import ImportModule from './importModule.js';

const App = {
    VitalModule,
    SkillModule,
    LevelModule,
    APModule,
    RaceClassModule,
    CharacterModule,
    UIModule,

    async init() {
        console.log('Initializing App');
        
        // Initialize modules that don't depend on others first
        TabModule.init();
        this.UIModule.init();
        
        // Initialize EnhancementAnnouncementModule first
        EnhancementAnnouncementModule.init();
        
        // Initialize modules with potential async operations
        await Promise.all([
            itemDatabaseModule.init(),
            InventoryModule.init(),
            EquipmentModule.init(),
            SpellModule.init()
        ]);
        
        // Initialize modules that might depend on the above
        this.VitalModule.init();
        this.SkillModule.init();
        this.LevelModule.init();
        this.CharacterModule.init();
        this.RaceClassModule.init();
        this.APModule.init();
        
        // Initialize remaining modules
        UtilityModule.init();
        ArmorModule.init();
        AbilityModule.init();
        TraitModule.init();
        ActionModule.init();
    
        // Initialize EnhancementModule after other modules
        await EnhancementModule.init();
    
        EquipmentModule.exposeToGlobalScope();
    
        this.loadSavedData();
        this.setupEventListeners();
    
        console.log('All modules initialized');
    
        // Trigger an update of all vital scores after everything is initialized
        this.VitalModule.updateAllVitalScores();
    
        const exportButton = document.getElementById('export-character');
        if (exportButton) {
            exportButton.addEventListener('click', ExportModule.exportCharacterData);
        } else {
            console.warn('Export character button not found');
        }
    
        // Remove the import functionality if elements are not present
        // const importButton = document.getElementById('import-character-btn');
        // const importInput = document.getElementById('import-character');
    
        // if (importButton && importInput) {
        //     importButton.addEventListener('click', () => importInput.click());
    
        //     importInput.addEventListener('change', (event) => {
        //         const file = event.target.files[0];
        //         if (file) {
        //             this.importCharacterData(file);
        //         }
        //     });
        // } else {
        //     console.warn('Import character button or input not found');
        // }
    },

    saveAllData() {
        const characterData = {
            level: LevelModule.currentLevel,
            vitals: VitalModule.getAllVitalData(),
            skills: SkillModule.getAllSkillData(),
            race: RaceClassModule.currentRace,
            class: RaceClassModule.currentClass,
            equipment: EquipmentModule.getAllEquipmentData(),
            inventory: InventoryModule.getAllInventoryData(),
            spells: SpellModule.getAllSpellData(),
            abilities: AbilityModule.getAllAbilityData(),
            traits: TraitModule.getAllTraitData(),
            ap: APModule.apValue
        };
    },

    setupExportButton() {
        const exportButton = document.getElementById('export-character');
        if (exportButton) {
            exportButton.addEventListener('click', ExportModule.exportCharacterData);
        } else {
            console.error('Export button not found');
        }
    },

    loadSavedData(characterData) {
        if (characterData) {
            LevelModule.loadSavedData(characterData.level);
            VitalModule.loadSavedData(characterData.vitals);
            SkillModule.loadSavedData(characterData.skills);
            
            // Update race and class selections
            if (characterData.race) {
                RaceClassModule.setSelectedRace(characterData.race);
            }
            if (characterData.class) {
                RaceClassModule.setSelectedClass(characterData.class);
            }
            
            EquipmentModule.loadSavedData(characterData.equipment);
            InventoryModule.loadSavedData(characterData.inventory);
            SpellModule.loadSavedData(characterData.spells);
            AbilityModule.loadSavedData(characterData.abilities);
            TraitModule.loadSavedData(characterData.traits);
            APModule.loadSavedData(characterData.ap);
    
            // Update other modules that might depend on race and class
            RaceClassModule.loadSavedData(characterData.race, characterData.class);
    
            this.displayInitialData();
            
            // Refresh the UI to reflect the updated race and class
            this.updateRaceClassDisplay();
        }
    },
    
    updateRaceClassDisplay() {
        const raceContainer = document.getElementById('race-container');
        const classContainer = document.getElementById('class-container');
        
        if (raceContainer) {
            raceContainer.textContent = `Race: ${RaceClassModule.getCurrentRaceName()}`;
        }
        
        if (classContainer) {
            classContainer.textContent = `Class: ${RaceClassModule.getCurrentClassName()}`;
        }
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
    
        // Remove the refresh enhancements button listener if the button doesn't exist
        // const refreshEnhancementsButton = document.getElementById('refresh-enhancements');
        // if (refreshEnhancementsButton) {
        //     refreshEnhancementsButton.addEventListener('click', () => {
        //         console.log('Manually refreshing enhancements');
        //         this.debugCharacterInfo();
        //         EnhancementModule.refreshEnhancements();
        //     });
        // } else {
        //     console.warn('Refresh enhancements button not found');
        // }
    },

    debugCharacterInfo() {
        console.log('--- Debug Character Info ---');
        console.log('Current Class:', RaceClassModule.currentClass);
        console.log('Current Archetype:', CharacterModule.getArchetype());
        console.log('Class Data:', CharacterModule.getCurrentClass());
        console.log('---------------------------');
    }
};

window.App = App;

document.addEventListener('DOMContentLoaded', async () => {
    console.log('DOM fully loaded and parsed');
    try {
        await App.init();
    } catch (error) {
        console.error('Error during initialization:', error);
    }
});

document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM fully loaded, initializing modules');
    LevelModule.init();
    ImportModule.init();
    const exportButton = document.getElementById('export-character');
    if (exportButton) {
        exportButton.addEventListener('click', ExportModule.exportCharacterData);
    } else {
        console.error('Export button not found');
    }
});

document.addEventListener('DOMContentLoaded', () => {
    const editableFields = document.querySelectorAll('.info-item span[contenteditable="true"]');
  
    editableFields.forEach(field => {
      field.addEventListener('blur', () => {
        const fieldId = field.id;
        const value = field.textContent.trim();
  
        // Validate and update the field value
        switch (fieldId) {
          case 'character-ap':
          case 'character-hp':
          case 'character-mp':
            const numValue = parseInt(value, 10);
            if (!isNaN(numValue) && numValue >= 0) {
              field.textContent = numValue;
              // You can add additional logic here to update the character's stats
              console.log(`Updated ${fieldId.replace('character-', '').toUpperCase()} to ${numValue}`);
            } else {
              // Revert to the previous value if input is invalid
              field.textContent = field.getAttribute('data-previous-value') || '0';
              console.error(`Invalid input for ${fieldId}`);
            }
            break;
          case 'character-level':
            const levelValue = parseInt(value, 10);
            if (!isNaN(levelValue) && levelValue > 0) {
              field.textContent = levelValue;
              // You can add additional logic here to update the character's level
              console.log(`Updated character level to ${levelValue}`);
            } else {
              // Revert to the previous value if input is invalid
              field.textContent = field.getAttribute('data-previous-value') || '1';
              console.error('Invalid input for character level');
            }
            break;
          default:
            // For other fields like character name, just update the content
            console.log(`Updated ${fieldId} to ${value}`);
        }
      });
  
      // Store the previous value before editing
      field.addEventListener('focus', () => {
        field.setAttribute('data-previous-value', field.textContent.trim());
      });
  
      // Prevent line breaks in editable spans
      field.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          field.blur();
        }
      });
    });
  });

export default App;