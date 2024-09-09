import VitalModule from './vital.js';
import SkillModule from './skill.js';
import AbilityModule from './ability.js';
import TraitModule from './trait.js';
import SpellModule from './spell.js';

const ArmorModule = {
    armor: {},
    selectedSlot: null,

    init() {
        this.loadArmor();
        this.setupEventListeners();
        this.createArmorDetailModal();
    },

    loadArmor() {
        fetch('armor.json')
            .then(response => response.json())
            .then(data => {
                this.armor = data.armor;
                console.log('Armor loaded:', this.armor);
            })
            .catch(error => console.error('Error loading armor:', error));
    },

    setupEventListeners() {
        document.querySelectorAll('.equipment-slot[data-slot-type]').forEach(slot => {
            if (this.isArmorSlot(slot.dataset.slotType)) {
                slot.addEventListener('click', () => this.handleArmorSlotClick(slot));
            }
        });

        const armorModal = document.getElementById('armor-modal');
        if (armorModal) {
            armorModal.querySelector('.close').addEventListener('click', () => this.closeArmorModal());
            document.getElementById('armor-search').addEventListener('input', (e) => this.filterArmor(e.target.value));
        }
    },

    createArmorDetailModal() {
        let modal = document.getElementById('armor-detail-modal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'armor-detail-modal';
            modal.className = 'modal';
            modal.innerHTML = `
                <div class="modal-content">
                    <span class="close">&times;</span>
                    <h2 id="armor-detail-title"></h2>
                    <div id="armor-detail-content"></div>
                    <button id="armor-action-button"></button>
                </div>
            `;
            document.body.appendChild(modal);

            const closeBtn = modal.querySelector('.close');
            closeBtn.addEventListener('click', () => {
                modal.style.display = 'none';
            });

            window.addEventListener('click', (event) => {
                if (event.target == modal) {
                    modal.style.display = 'none';
                }
            });

            const actionButton = document.getElementById('armor-action-button');
            actionButton.addEventListener('click', () => this.handleArmorAction());
        }
    },

    isArmorSlot(slotType) {
        const armorSlotTypes = ['head', 'face', 'neck', 'shoulders', 'torso', 'arm', 'wrist', 'finger', 'waist', 'legs', 'ankle', 'feet', 'toe'];
        return armorSlotTypes.includes(slotType.toLowerCase());
    },

    handleArmorSlotClick(slot) {
        const slotType = slot.dataset.slotType.toLowerCase();
        const equippedArmorKey = slot.dataset.equippedArmor;
        if (equippedArmorKey) {
            this.showArmorDetails(equippedArmorKey, true);
        } else {
            this.showEquippableArmor(slotType, slot.id);
        }
    },

    showEquippableArmor(slotType, slotId) {
        this.selectedSlot = slotId;
        const modal = document.getElementById('armor-modal');
        const container = document.getElementById('armor-cards-container');
        const searchInput = document.getElementById('armor-search');

        if (!modal || !container || !searchInput) {
            console.error('Armor modal elements not found');
            return;
        }

        searchInput.value = '';
        container.innerHTML = '';

        const filteredArmor = Object.entries(this.armor).filter(([key, armor]) =>
            armor.armorType.toLowerCase() === slotType
        );

        if (filteredArmor.length === 0) {
            container.innerHTML = '<p>No matching armor found</p>';
        } else {
            filteredArmor.forEach(([key, armor]) => {
                const card = this.createArmorCard(key, armor);
                container.appendChild(card);
            });
        }

        modal.style.display = 'block';
    },

    createArmorCard(key, armor) {
        const card = document.createElement('div');
        card.className = 'armor-card';
        card.innerHTML = `
            <h3>${armor.name || 'Unnamed armor'}</h3>
            <p>${armor.armorType || 'Unknown type'}</p>
            <div class="armor-card-buttons">
                <button class="equip-btn" data-armor-key="${key}">Equip</button>
                <button class="details-btn" data-armor-key="${key}">Details</button>
            </div>
        `;

        card.querySelector('.equip-btn').addEventListener('click', () => this.equipArmor(key));
        card.querySelector('.details-btn').addEventListener('click', () => this.showArmorDetails(key, false));

        return card;
    },

    equipArmor(armorKey) {
        const armor = this.armor[armorKey];
        const slot = document.getElementById(this.selectedSlot);
        if (slot) {
            // Unequip current item if there is one
            if (slot.dataset.equippedArmor) {
                this.unequipArmor(slot.id);
            }

            slot.textContent = armor.name;
            slot.dataset.equippedArmor = armorKey;

            // Update vital and skill scores
            if (armor.vitalBonus) {
                VitalModule.updateSingleItemBonus('armor', armor.vitalBonus);
            }
            if (armor.skillBonus) {
                SkillModule.updateEquippedScores(armor.skillBonus, 'armor');
            }

            // Update abilities and traits
            if (armor.abilities && Array.isArray(armor.abilities)) {
                AbilityModule.addEquipmentAbilities(armor.abilities);
            }
            if (armor.traits && Array.isArray(armor.traits)) {
                TraitModule.updateTraits('armor', armorKey, armor.traits);
            }

            // Add spells granted by the armor
            if (armor.spellsGranted && Array.isArray(armor.spellsGranted)) {
                SpellModule.addEquipmentSpells(armor.spellsGranted);
            }
        }
        this.closeModals();
    },
    
    unequipArmor(slotId) {
        const slot = document.getElementById(slotId);
        if (slot) {
            const armorKey = slot.dataset.equippedArmor;
            const armor = this.armor[armorKey];
            
            // Remove bonuses
            if (armor.vitalBonus) {
                VitalModule.removeSingleItemBonus('armor', armor.vitalBonus);
            }
            if (armor.skillBonus) {
                SkillModule.removeEquippedScores('armor');
            }
            
            // Remove abilities and traits
            if (armor.abilities && Array.isArray(armor.abilities)) {
                AbilityModule.removeEquipmentAbilities(armor.abilities);
            }
            if (armor.traits && Array.isArray(armor.traits)) {
                TraitModule.removeTraits('armor', armorKey);
            }
    
            // Remove spells granted by the armor
            if (armor.spellsGranted && Array.isArray(armor.spellsGranted)) {
                SpellModule.removeEquipmentSpells(armor.spellsGranted);
            }
    
            slot.textContent = '';
            slot.dataset.equippedArmor = '';
        }
    },

    showArmorDetails(armorKey, isEquipped) {
        const armor = this.armor[armorKey];
        this.displayArmorDetailModal(armor, isEquipped);
    },

    displayArmorDetailModal(armor, isEquipped) {
        const modal = document.getElementById('armor-detail-modal');
        const title = document.getElementById('armor-detail-title');
        const content = document.getElementById('armor-detail-content');
        const actionButton = document.getElementById('armor-action-button');

        if (!modal || !title || !content || !actionButton) {
            console.error('Armor detail modal elements not found');
            return;
        }

        title.textContent = armor.name;
        content.innerHTML = '';

        const armorProperties = [
            { key: 'armorType', label: 'Armor Type' },
            { key: 'armorRating', label: 'Armor Rating' },
            { key: 'tankModifier', label: 'Tank Modifier' },
            { key: 'vitalBonus', label: 'Vital Bonuses' },
            { key: 'skillBonus', label: 'Skill Bonuses' },
            { key: 'abilities', label: 'Abilities' },
            { key: 'traits', label: 'Traits' },
            { key: 'spellsGranted', label: 'Spells Granted' },
            { key: 'hpBonus', label: 'HP Bonus' },
            { key: 'mpBonus', label: 'MP Bonus' },
            { key: 'description', label: 'Description' }
        ];

        armorProperties.forEach(({ key, label }) => {
            if (armor[key] && armor[key] !== 'N/A' && armor[key] !== 0) {
                const detailElement = document.createElement('p');
                detailElement.innerHTML = `<strong>${label}:</strong> ${this.formatValue(armor[key])}`;
                content.appendChild(detailElement);
            }
        });

        actionButton.textContent = isEquipped ? 'Unequip' : 'Equip';
        actionButton.dataset.action = isEquipped ? 'unequip' : 'equip';
        actionButton.dataset.armorKey = armor.name;

        modal.style.display = 'block';
    },

    handleArmorAction() {
        const actionButton = document.getElementById('armor-action-button');
        const action = actionButton.dataset.action;
        const armorKey = actionButton.dataset.armorKey;

        if (action === 'equip') {
            this.equipArmor(armorKey);
        } else if (action === 'unequip') {
            this.unequipArmor(this.selectedSlot);
        }

        this.closeModals();
    },

    formatValue(value) {
        if (Array.isArray(value)) {
            return value.join(', ');
        } else if (typeof value === 'object' && value !== null) {
            return Object.entries(value).map(([k, v]) => `${k}: ${v}`).join(', ');
        }
        return value;
    },

    closeModals() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.style.display = 'none';
        });
    },

    closeArmorModal() {
        document.getElementById('armor-modal').style.display = 'none';
    },

    filterArmor(query) {
        const container = document.getElementById('armor-cards-container');
        const lowercaseQuery = query.toLowerCase();

        container.innerHTML = '';

        Object.entries(this.armor).forEach(([key, armor]) => {
            if (armor.name.toLowerCase().includes(lowercaseQuery) || armor.armorType.toLowerCase().includes(lowercaseQuery)) {
                const card = this.createArmorCard(key, armor);
                container.appendChild(card);
            }
        });

        if (container.children.length === 0) {
            container.innerHTML = '<p>No matching armor found</p>';
        }
    }
};

document.addEventListener('DOMContentLoaded', () => {
    ArmorModule.init();
});

export default ArmorModule;