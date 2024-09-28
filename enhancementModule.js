// enhancementModule.js

import EnhancementAnnouncementModule from './enhancementAnnouncementModule.js';
import VitalModule from './vital.js';
import SkillModule from './skill.js';
import CharacterModule from './character.js';
import EquipmentModule from './equipment.js';
import ActionModule from './actionModule.js';

const EnhancementModule = {
    enhancements: [],
    unlockedEnhancements: new Set(),
    activeEnhancements: {},

    async init() {
        await this.loadEnhancements();
        this.displayEnhancements();
        this.createEnhancementPopup();
        EnhancementAnnouncementModule.setEnhancementModule(this);
        this.checkAndApplyEnhancements();
    },

    async loadEnhancements() {
        try {
            const response = await fetch('enhancements.json');
            const data = await response.json();
            this.enhancements = data.enhancements;
        } catch (error) {}
    },

    refreshEnhancements() {
        this.checkAndApplyEnhancements();
        this.displayEnhancements();
    },

    displayEnhancements() {
        const enhancementsGrid = document.getElementById('enhancements-grid');
        if (enhancementsGrid) {
            enhancementsGrid.innerHTML = '';
            this.enhancements.forEach(enhancement => {
                const level = this.meetsRequirements(enhancement);
                if (level > 0) {
                    const enhancementCard = this.createEnhancementCard(enhancement, level);
                    enhancementsGrid.appendChild(enhancementCard);
                    this.checkAndAnnounceNewEnhancement(enhancement);
                }
            });
        }
    },

    meetsRequirements(enhancement) {
        const req = enhancement.requirements;
        let maxLevel = 0;

        // Check skills
        if (req.skills) {
            for (const [skill, level] of Object.entries(req.skills)) {
                const skillLevel = SkillModule.getSkillLevel(skill);
                if (skillLevel < level) return 0;
            }
        }

        // Check vitals
        if (req.vitals) {
            for (const [vital, level] of Object.entries(req.vitals)) {
                const vitalScore = VitalModule.getVitalScore(vital);
                if (vitalScore < level) return 0;
            }
        }

        // Check archetype
        if (req.archetypes && req.archetypes.length > 0) {
            const playerArchetype = CharacterModule.getArchetype();
            if (!req.archetypes.includes(playerArchetype)) {
                return 0;
            }
        }

        // Check equipment
        if (req.equipment) {
            const equippedItem = EquipmentModule.getEquippedItem(req.equipment.slot);
            if (!equippedItem || equippedItem.name !== req.equipment.name) {
                return 0;
            }
        }

        // Determine the highest level of enhancement that can be applied
        for (let i = enhancement.scaling.length; i > 0; i--) {
            if (this.meetsScalingRequirements(enhancement, i)) {
                maxLevel = i;
                break;
            }
        }

        return maxLevel;
    },

    meetsScalingRequirements(enhancement, level) {
        return true; // Placeholder
    },

    createEnhancementCard(enhancement) {
        const card = document.createElement('div');
        card.className = 'enhancement-card';
        card.innerHTML = `
          <h3>${enhancement.name}</h3>
          <p>${enhancement.description}</p>
        `;
        card.addEventListener('click', () => this.showEnhancementDetails(enhancement.name));
        return card;
    },

    checkAndAnnounceNewEnhancement(enhancement) {
        if (!this.unlockedEnhancements.has(enhancement.name)) {
            this.unlockedEnhancements.add(enhancement.name);
            EnhancementAnnouncementModule.announceNewEnhancement(enhancement);
        }
    },

    showEnhancementDetails(enhancementName) {
        const enhancement = this.enhancements.find(e => e.name === enhancementName);
        if (!enhancement) {
            return;
        }

        const modal = document.getElementById('enhancement-detail-modal');
        const title = document.getElementById('enhancement-detail-title');
        const description = document.getElementById('enhancement-detail-description');
        const requirements = document.getElementById('enhancement-detail-requirements');
        const levelSelect = document.getElementById('enhancement-level-select');
        const scalingContent = document.getElementById('enhancement-scaling-content');

        title.textContent = enhancement.name;

        if (enhancement.description && enhancement.description !== 'N/A') {
            description.textContent = enhancement.description;
            description.style.display = 'block';
        } else {
            description.style.display = 'none';
        }

        if (Object.keys(enhancement.requirements).length > 0) {
            let requirementsHTML = '<h3>Requirements:</h3><ul>';
            Object.entries(enhancement.requirements).forEach(([key, value]) => {
                if (typeof value === 'object') {
                    const subRequirements = Object.entries(value)
                        .filter(([, v]) => v && v !== 'N/A')
                        .map(([k, v]) => `${k}: ${v}`)
                        .join(', ');
                    if (subRequirements) {
                        requirementsHTML += `<li>${key}: ${subRequirements}</li>`;
                    }
                } else if (value && value !== 'N/A') {
                    requirementsHTML += `<li>${key}: ${value}</li>`;
                }
            });
            requirementsHTML += '</ul>';
            requirements.innerHTML = requirementsHTML;
            requirements.style.display = 'block';
        } else {
            requirements.style.display = 'none';
        }

        levelSelect.innerHTML = '';
        for (let i = 1; i <= 20; i++) {
            const option = document.createElement('option');
            option.value = i;
            option.textContent = `Level ${i}`;
            levelSelect.appendChild(option);
        }

        this.updateScalingContent(enhancement, 1);

        levelSelect.addEventListener('change', (event) => {
            this.updateScalingContent(enhancement, parseInt(event.target.value));
        });

        modal.style.display = 'block';
    },

    updateScalingContent(enhancement, level) {
        const scalingContent = document.getElementById('enhancement-scaling-content');
        let scalingHTML = '<h3>Effects:</h3><ul>';

        const validScaling = enhancement.scaling.filter(scale => scale.effect && scale.effect !== 'N/A');

        if (validScaling.length > 0) {
            validScaling.forEach((scale) => {
                if (scale.level <= level) {
                    scalingHTML += `<li><strong>Level ${scale.level}:</strong> ${scale.effect}</li>`;
                }
            });
            scalingHTML += '</ul>';
            scalingContent.innerHTML = scalingHTML;
            scalingContent.style.display = 'block';
        } else {
            scalingContent.style.display = 'none';
        }
    },

    createEnhancementPopup() {
        const popup = document.createElement('div');
        popup.id = 'enhancement-popup';
        popup.className = 'enhancement-popup';
        popup.style.display = 'none';
        document.body.appendChild(popup);
    },

    showEnhancementPopup(enhancement) {
        const popup = document.getElementById('enhancement-popup');
        if (popup) {
            popup.innerHTML = `
                <h2>New Enhancement Unlocked!</h2>
                <h3>${enhancement.name}</h3>
                <p>${enhancement.description}</p>
                <button id="close-enhancement-popup">Close</button>
            `;
            popup.style.display = 'block';

            const closeButton = document.getElementById('close-enhancement-popup');
            if (closeButton) {
                closeButton.addEventListener('click', () => {
                    popup.style.display = 'none';
                });
            }

            setTimeout(() => {
                popup.style.display = 'none';
            }, 5000);
        }
    },

    checkAndApplyEnhancements() {
        this.enhancements.forEach(enhancement => {
            const level = this.meetsRequirements(enhancement);
            if (level > 0) {
                this.activeEnhancements[enhancement.name] = level;
                this.applyEnhancement(enhancement, level);
            } else if (this.activeEnhancements[enhancement.name]) {
                delete this.activeEnhancements[enhancement.name];
                this.removeEnhancement(enhancement);
            }
        });
        ActionModule.updateAllActions();
    },

    applyEnhancement(enhancement, level) {
        ActionModule.applyEnhancementToActions(enhancement, level);
    },

    removeEnhancement(enhancement) {
        ActionModule.removeEnhancementFromActions(enhancement);
    },

    getActiveEnhancements() {
        return this.activeEnhancements;
    }
};

export default EnhancementModule;
