import VitalModule from './vital.js';
import SkillModule from './skill.js';

const UIModule = {
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
            subtablink.addEventListener('click', (event) => this.openSubTab(event.target.dataset.subtab));
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
        if (!element) {
            console.error(`Element with id ${fieldId} not found`);
            return;
        }
        const currentValue = element.textContent;
        let newValue;
    
        if (fieldId === 'character-ap' || fieldId === 'current-hp' || fieldId === 'current-mp') {
            newValue = prompt(`Enter new value for ${fieldId.replace('character-', '').replace('current-', '').toUpperCase()}:`, currentValue);
            if (newValue !== null && !isNaN(newValue)) {
                newValue = parseInt(newValue, 10);
    
                // Specific handling for AP
                if (fieldId === 'character-ap') {
                    App.APModule.updateAPDisplay(newValue);
    
                // Specific handling for HP and MP
                } else {
                    const maxValue = parseInt(document.getElementById(fieldId === 'current-hp' ? 'max-hp' : 'max-mp').textContent, 10);
                    if (newValue > maxValue) {
                        newValue = maxValue;
                    }
                    element.textContent = newValue;
    
                    if (fieldId === 'current-hp') {
                        VitalModule.updateHPDisplay();
                    } else if (fieldId === 'current-mp') {
                        VitalModule.updateMPDisplay();
                    }
                }
            }
        } else {
            // Handle other editable fields
            newValue = prompt(`Enter new value for ${fieldId}:`, currentValue);
            if (newValue !== null) {
                element.textContent = newValue;
    
                switch (fieldId) {
                    case 'character-name':
                        console.log('Character name updated to:', newValue);
                        break;
                    case 'character-level':
                        App.LevelModule.updateLevel(parseInt(newValue, 10));
                        break;
                    case 'available-vital-points':
                        VitalModule.setAvailablePoints(parseInt(newValue, 10));
                        break;
                    case 'available-skill-points':
                        SkillModule.setAvailablePoints(parseInt(newValue, 10));
                        break;
                }
            }
        }
    }    
};

export default UIModule;