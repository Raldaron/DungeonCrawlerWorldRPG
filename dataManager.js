// dataManager.js

import VitalModule from './vital.js';
import SkillModule from './skill.js';
import EquipmentModule from './equipment.js';
import ArmorModule from './armor.js';
import UtilityModule from './utility.js';
import SpellModule from './spell.js';
import App from './script.js';

const DataManager = {
    exportCharacterData() {
        console.log('Exporting character data');
        const characterData = {
            header: {
                name: document.getElementById('character-name').textContent,
                race: App.RaceClassModule.currentRace,
                class: App.RaceClassModule.currentClass,
                level: App.LevelModule.currentLevel,
                unspentVitalPoints: VitalModule.availablePoints,
                unspentSkillPoints: SkillModule.availablePoints,
                currentHP: parseInt(document.getElementById('current-hp').textContent),
                currentMP: parseInt(document.getElementById('current-mp').textContent),
                currentAP: App.APModule.apValue
            },
            stats: {
                vitalBaseScores: VitalModule.baseScores,
                skillBaseScores: SkillModule.baseScores
            },
            equipment: {
                weapons: EquipmentModule.getEquippedWeapons(),
                armor: ArmorModule.getEquippedArmor(),
            },
            utilityItems: UtilityModule.getEquippedUtilityItems(),
            spells: {
                knownSpells: SpellModule.knownSpells
            }
        };
    
        console.log('Character data:', characterData);
    
        const dataStr = JSON.stringify(characterData, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        const exportFileDefaultName = 'character_data.json';
    
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        document.body.appendChild(linkElement); // Append to body
        linkElement.click();
        document.body.removeChild(linkElement); // Remove after clicking
    },

    importCharacterData(file) {
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const characterData = JSON.parse(event.target.result);
                
                // Update character header information
                document.getElementById('character-name').textContent = characterData.header.name;
                App.RaceClassModule.updateRaceInfo(characterData.header.race);
                App.RaceClassModule.updateClassInfo(characterData.header.class);
                App.LevelModule.updateLevel(characterData.header.level);
                VitalModule.setAvailablePoints(characterData.header.unspentVitalPoints);
                SkillModule.setAvailablePoints(characterData.header.unspentSkillPoints);
                document.getElementById('current-hp').textContent = characterData.header.currentHP;
                document.getElementById('current-mp').textContent = characterData.header.currentMP;
                App.APModule.updateAPDisplay(characterData.header.currentAP);
                
                // Update vital and skill base scores
                VitalModule.baseScores = characterData.stats.vitalBaseScores;
                SkillModule.baseScores = characterData.stats.skillBaseScores;
                
                // Update equipment
                EquipmentModule.unequipAllWeapons();
                ArmorModule.unequipAllArmor();
                UtilityModule.unequipAllUtilityItems();
                
                EquipmentModule.equipWeapons(characterData.equipment.weapons);
                ArmorModule.equipArmor(characterData.equipment.armor);
                UtilityModule.equipUtilityItems(characterData.utilityItems);
                
                // Update spells
                SpellModule.knownSpells = characterData.spells.knownSpells;
                
                // Refresh all displays
                App.refreshAllDisplays();
                
                console.log('Character data imported successfully');
            } catch (error) {
                console.error('Error importing character data:', error);
                alert('Error importing character data. Please check the file format.');
            }
        };
        reader.readAsText(file);
    }
};

export default DataManager;