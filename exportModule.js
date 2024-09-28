// exportModule.js

import RaceClassModule from './RaceClassModule.js';
import LevelModule from './LevelModule.js';
import VitalModule from './vital.js';
import SkillModule from './skill.js';
import EquipmentModule from './equipment.js';
import InventoryModule from './inventory.js';
import SpellModule from './spell.js';
import APModule from './APModule.js';

const ExportModule = {
    exportCharacterData() {
        const characterData = {
            character: {
                name: document.getElementById('character-name').textContent || "Unnamed Character",
                race: RaceClassModule.currentRace,
                class: RaceClassModule.currentClass,
                level: LevelModule.currentLevel,
                vitalBaseScores: VitalModule.baseScores,
                skillBaseScores: SkillModule.baseScores,
                equipment: {
                    weapons: ExportModule.getEquippedWeapons(),
                    armor: ExportModule.getEquippedArmor(),
                    utility: ExportModule.getEquippedUtilityItems()
                },
                inventoryItems: InventoryModule.getInventoryItems(),
                knownSpellKeys: SpellModule.knownSpells,
                ap: APModule.apValue,
                unassignedVitalPoints: VitalModule.availablePoints,
                unassignedSkillPoints: SkillModule.availablePoints
            }
        };
    
        const dataStr = JSON.stringify(characterData, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
        const exportFileDefaultName = 'character_data.json';
    
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
    },

    getEquippedWeapons() {
        const equippedWeapons = EquipmentModule.getEquippedWeapons();
        console.log('Equipped weapons retrieved for export:', equippedWeapons);
        return equippedWeapons;
    },    

    getEquippedArmor() {
        const equippedArmor = {};
        const armorSlots = [
            'head', 'face', 'neck', 'shoulders', 'torso', 'left-arm', 'right-arm',
            'left-wrist', 'right-wrist', 'left-finger1', 'left-finger2',
            'right-finger1', 'right-finger2', 'waist', 'legs', 'left-ankle',
            'right-ankle', 'feet', 'left-toe1', 'left-toe2', 'right-toe1', 'right-toe2'
        ];

        armorSlots.forEach(slotType => {
            const slotId = `${slotType}-slot`;
            const slot = document.getElementById(slotId);
            if (slot && slot.dataset.equippedArmor) {
                equippedArmor[slotId] = slot.dataset.equippedArmor;
            }
        });

        return equippedArmor;
    },

    getEquippedUtilityItems() {
        const equippedUtility = {};
        const utilitySlots = ['utility-slot-1', 'utility-slot-2', 'utility-slot-3', 'utility-slot-4', 'utility-slot-5'];

        utilitySlots.forEach(slotId => {
            const utilityItem = EquipmentModule.getEquippedItemKey(slotId);
            if (utilityItem) {
                equippedUtility[slotId] = utilityItem;
            }
        });

        return equippedUtility;
    }
};

export default ExportModule;