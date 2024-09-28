// importModule.js

import VitalModule from './vital.js';
import SkillModule from './skill.js';
import EquipmentModule from './equipment.js';
import ArmorModule from './armor.js';
import UtilityModule from './utility.js';
import InventoryModule from './inventory.js';
import SpellModule from './spell.js';
import APModule from './APModule.js';
import RaceClassModule from './RaceClassModule.js';
import LevelModule from './LevelModule.js';
import AbilityModule from './ability.js';
import TraitModule from './trait.js';

const ImportModule = {
    importCharacterData(jsonData) {
        try {
            const data = JSON.parse(jsonData);
            const character = data.character;

            // Update character name
            document.getElementById('character-name').textContent = character.name;

            // Update race and class
            this.updateRaceAndClass(character.race, character.class);

            // Update level
            LevelModule.updateLevel(character.level);

            // Update vital scores
            VitalModule.loadSavedData({
                baseScores: character.vitalBaseScores,
                availablePoints: character.unassignedVitalPoints
            });

            // Update skill scores
            SkillModule.loadSavedData({
                baseScores: character.skillBaseScores,
                availablePoints: character.unassignedSkillPoints
            });

            // Update equipment
            this.updateEquipment(character.equipment);

            // Update inventory
            InventoryModule.loadSavedData({
                playerInventory: character.inventoryItems.reduce((acc, item) => {
                    acc[item.name] = { itemKey: item.name, quantity: item.quantity };
                    return acc;
                }, {})
            });

            // Update known spells
            SpellModule.loadSavedData({
                learnedSpells: character.knownSpellKeys || []
            });

            // Update AP
            APModule.loadSavedData(character.ap);

            // Refresh all displays
            this.refreshAllDisplays();

            console.log('Character data imported successfully');
        } catch (error) {
            console.error('Error importing character data:', error);
            alert('Error importing character data. Please check the file format.');
        }
    },

    updateRaceAndClass(race, characterClass) {
        if (race) {
            RaceClassModule.updateRaceInfo(race);
        }
        if (characterClass) {
            RaceClassModule.updateClassInfo(characterClass);
        }
    },

    updateEquipment(equipment) {
        // Reset all equipment slots to their default state
        this.resetAllEquipmentSlots();

        // Equip weapons
        if (equipment.weapons) {
            for (const [slotId, itemKey] of Object.entries(equipment.weapons)) {
                if (itemKey) {
                    EquipmentModule.equipItem(itemKey, slotId);
                }
            }
        }

        // Equip armor
        if (equipment.armor) {
            for (const [slotId, itemKey] of Object.entries(equipment.armor)) {
                if (itemKey) {
                    ArmorModule.equipArmor(itemKey, slotId);
                }
            }
        }

        // Equip utility items
        if (equipment.utility) {
            for (const [slotId, itemKey] of Object.entries(equipment.utility)) {
                if (itemKey) {
                    UtilityModule.equipItem(itemKey, slotId);
                }
            }
        }
    },

    resetAllEquipmentSlots() {
        const allSlots = document.querySelectorAll('.equipment-slot');
        allSlots.forEach(slot => {
            const slotLabel = slot.dataset.slotType || slot.id.replace('-slot', '').replace(/-/g, ' ');
            slot.innerHTML = `<div class="slot-label">${this.capitalizeWords(slotLabel)}</div>`;
            slot.dataset.equippedItem = '';
            // Ensure the slot is clickable
            slot.style.pointerEvents = 'auto';
        });
    },

    capitalizeWords(str) {
        return str.replace(/\b\w/g, l => l.toUpperCase());
    },

    refreshAllDisplays() {
        VitalModule.updateAllVitalScores();
        SkillModule.updateAllSkillScores();
        EquipmentModule.refreshDisplays();
        ArmorModule.updateArmorRating();
        UtilityModule.initializeUtilitySlots();
        InventoryModule.displayInventory();
        SpellModule.updateKnownSpells();
        APModule.updateAPDisplay();
        AbilityModule.displayCurrentAbilities();
        TraitModule.displayTraits();
    },

    handleFileImport(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                this.importCharacterData(e.target.result);
            };
            reader.readAsText(file);
        }
    },

    handleNameChange(newName) {
        const fileName = `${newName}.json`;
        fetch(fileName)
            .then(response => {
                if (!response.ok) {
                    throw new Error('File not found');
                }
                return response.text();
            })
            .then(data => {
                this.importCharacterData(data);
            })
            .catch(error => {
                console.log(`No character data found for ${newName}`);
                // If no file is found, the app continues normally without importing
            });
    },

    init() {
        const importInput = document.createElement('input');
        importInput.type = 'file';
        importInput.accept = '.json';
        importInput.style.display = 'none';
        importInput.addEventListener('change', (event) => this.handleFileImport(event));
        document.body.appendChild(importInput);

        const importButton = document.createElement('button');
        importButton.textContent = 'Import Character';
        importButton.addEventListener('click', () => importInput.click());
        document.body.appendChild(importButton);

        // Add event listener for character name changes
        const characterNameElement = document.getElementById('character-name');
        characterNameElement.addEventListener('blur', (event) => {
            this.handleNameChange(event.target.textContent.trim());
        });
    }
};

export default ImportModule;