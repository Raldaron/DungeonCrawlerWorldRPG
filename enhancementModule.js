import SkillModule from './skill.js';
import VitalModule from './vital.js';
import CharacterModule from './character.js';
import EquipmentModule from './equipment.js';

const EnhancementModule = {
    enhancements: [],
    unlockedEnhancements: new Set(),

    async init() {
        console.log('Initializing EnhancementModule');
        await this.loadEnhancements();
        this.displayEnhancements();
        this.createEnhancementPopup();
    },

    async loadEnhancements() {
        try {
            const response = await fetch('enhancements.json');
            const data = await response.json();
            this.enhancements = data.enhancements;
            console.log('Enhancements loaded:', this.enhancements);
        } catch (error) {
            console.error('Error loading enhancements:', error);
        }
    },

    refreshEnhancements() {
        console.log('Refreshing enhancements');
        this.displayEnhancements();
    },

    displayEnhancements() {
        console.log('Displaying enhancements');
        const enhancementsGrid = document.getElementById('enhancements-grid');
        if (enhancementsGrid) {
            enhancementsGrid.innerHTML = '';
            this.enhancements.forEach(enhancement => {
                console.log('Checking requirements for:', enhancement.name);
                if (this.meetsRequirements(enhancement)) {
                    console.log('Requirements met for:', enhancement.name);
                    const enhancementCard = this.createEnhancementCard(enhancement);
                    enhancementsGrid.appendChild(enhancementCard);
                    this.checkAndAnnounceNewEnhancement(enhancement);
                } else {
                    console.log('Requirements not met for:', enhancement.name);
                }
            });
        } else {
            console.error('Enhancements grid not found');
        }
    },

    meetsRequirements(enhancement) {
        console.log('Checking requirements for enhancement:', enhancement.name);
        const req = enhancement.requirements;

        // Check skills
        if (req.skills) {
            for (const [skill, level] of Object.entries(req.skills)) {
                const skillLevel = SkillModule.getSkillLevel(skill);
                console.log(`Checking skill: ${skill}, Required: ${level}, Current: ${skillLevel}`);
                if (skillLevel < level) return false;
            }
        }

        // Check vitals
        if (req.vitals) {
            for (const [vital, level] of Object.entries(req.vitals)) {
                const vitalScore = VitalModule.getVitalScore(vital);
                console.log(`Checking vital: ${vital}, Required: ${level}, Current: ${vitalScore}`);
                if (vitalScore < level) return false;
            }
        }

        // Check archetype
        if (req.archetypes && req.archetypes.length > 0) {
            const playerArchetype = CharacterModule.getArchetype();
            console.log(`Checking archetype: Player: "${playerArchetype}", Required: ${req.archetypes.join(' or ')}`);
            if (!req.archetypes.includes(playerArchetype)) {
                console.log('Archetype requirement not met');
                return false;
            }
        }

        // Check equipment
        if (req.equipment) {
            console.log('Checking equipment requirement:', req.equipment);
            const equippedItem = EquipmentModule.getEquippedItem(req.equipment.slot);
            if (!equippedItem || equippedItem.name !== req.equipment.name) {
                console.log('Equipment requirement not met');
                return false;
            }
            console.log('Equipment requirement met:', equippedItem);
        }

        console.log('All requirements met for:', enhancement.name);
        return true;
    },

    createEnhancementCard(enhancement) {
        const card = document.createElement('div');
        card.className = 'enhancement-card';
        card.innerHTML = `
            <h3>${enhancement.name}</h3>
            <p>${enhancement.description}</p>
            <button class="enhancement-details-btn" data-enhancement="${enhancement.name}">Details</button>
        `;
        card.querySelector('.enhancement-details-btn').addEventListener('click', () => this.showEnhancementDetails(enhancement.name));
        return card;
    },

    showEnhancementDetails(enhancementName) {
        console.log('Showing details for enhancement:', enhancementName);
        const enhancement = this.enhancements.find(e => e.name === enhancementName);
        if (enhancement) {
            const modal = document.getElementById('enhancement-detail-modal');
            const content = modal.querySelector('.modal-content');
            content.innerHTML = `
                <span class="close">&times;</span>
                <h2>${enhancement.name}</h2>
                <p>${enhancement.description}</p>
                <h3>Requirements:</h3>
                <ul>
                    ${Object.entries(enhancement.requirements.skills || {}).map(([skill, level]) => `<li>${skill}: ${level}</li>`).join('')}
                    ${Object.entries(enhancement.requirements.vitals || {}).map(([vital, level]) => `<li>${vital}: ${level}</li>`).join('')}
                    ${enhancement.requirements.archetypes ? `<li>Archetype: ${enhancement.requirements.archetypes.join(' OR ')}</li>` : ''}
                    ${enhancement.requirements.equipment ? `<li>Equipment: ${enhancement.requirements.equipment.name} (${enhancement.requirements.equipment.slot})</li>` : ''}
                </ul>
                <h3>Scaling:</h3>
                <div class="enhancement-level-select">
                    <label for="enhancement-level-select">Current Level:</label>
                    <select id="enhancement-level-select">
                        ${this.createLevelOptions(enhancement)}
                    </select>
                </div>
                <div id="enhancement-scaling-content"></div>
            `;
            modal.style.display = 'block';
    
            const closeBtn = content.querySelector('.close');
            closeBtn.onclick = () => {
                modal.style.display = 'none';
            };
    
            window.onclick = (event) => {
                if (event.target == modal) {
                    modal.style.display = 'none';
                }
            };
    
            const levelSelect = document.getElementById('enhancement-level-select');
            levelSelect.addEventListener('change', () => {
                this.updateEnhancementScaling(enhancement, parseInt(levelSelect.value));
            });
    
            // Initialize scaling display with level 1
            this.updateEnhancementScaling(enhancement, 1);
        } else {
            console.error('Enhancement not found:', enhancementName);
        }
    },
    
    createLevelOptions(enhancement) {
        let options = '';
        for (let i = 1; i <= enhancement.scaling.length; i++) {
            options += `<option value="${i}">${i}</option>`;
        }
        return options;
    },
    
    updateEnhancementScaling(enhancement, level) {
        const scalingContent = document.getElementById('enhancement-scaling-content');
        scalingContent.innerHTML = '';
    
        for (let i = 0; i < level; i++) {
            const scale = enhancement.scaling[i];
            const scaleElement = document.createElement('p');
            scaleElement.innerHTML = `<strong>Level ${scale.level}:</strong> ${scale.effect}`;
            scalingContent.appendChild(scaleElement);
        }
    },

    createEnhancementPopup() {
        const popup = document.createElement('div');
        popup.id = 'enhancement-popup';
        popup.className = 'enhancement-popup';
        popup.style.display = 'none';
        document.body.appendChild(popup);
    },

    checkAndAnnounceNewEnhancement(enhancement) {
        if (!this.unlockedEnhancements.has(enhancement.name)) {
            this.unlockedEnhancements.add(enhancement.name);
            this.showEnhancementPopup(enhancement);
        }
    },

    showEnhancementPopup(enhancement) {
        const popup = document.getElementById('enhancement-popup');
        popup.innerHTML = `
            <h2>New Enhancement Unlocked!</h2>
            <h3>${enhancement.name}</h3>
            <p>${enhancement.description}</p>
            <button id="close-enhancement-popup">Close</button>
        `;
        popup.style.display = 'block';
    
        const closeButton = document.getElementById('close-enhancement-popup');
        closeButton.addEventListener('click', () => {
            popup.style.display = 'none';
        });
    
        // Automatically hide the popup after 5 seconds
        setTimeout(() => {
            popup.style.display = 'none';
        }, 5000);
    }
};

export default EnhancementModule;