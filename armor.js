import VitalModule from './vital.js';
import SkillModule from './skill.js';
import AbilityModule from './ability.js';
import TraitModule from './trait.js';
import SpellModule from './spell.js';

const ArmorModule = {
    armor: {},
    selectedSlot: null,

    init() {
        this.loadArmor().then(() => {
            this.updateArmorRating();
        });
        this.setupEventListeners();
        this.createArmorDetailModal();
    },

    loadArmor() {
        return fetch('armor.json')
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

    handleArmorSlotClick(slot) {
        this.selectedSlot = slot.id;
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

    equipArmor(armorKey, slotId = this.selectedSlot) {
        const armor = this.armor[armorKey];
        const slot = document.getElementById(slotId);
        if (slot && armor) {
            // Unequip current item if there is one
            if (slot.dataset.equippedArmor) {
                this.unequipArmor(slotId);
            }
    
            this.updateSlotContent(slot, armor.name);
            slot.dataset.equippedArmor = armorKey;
    
            // Synchronize with EquipmentModule
            EquipmentModule.equippedItems[slotId] = armor;
    
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
    
            // Update EquipmentModule with the new armor
            EquipmentModule.updateEquippedArmor(this.selectedSlot, armor);
            
            // Update Armor Rating
            this.updateArmorRating();
        }
        this.closeModals();
    },
    
    unequipArmor(slotId) {
        const slot = document.getElementById(slotId);
        if (slot) {
            const armorKey = slot.dataset.equippedArmor;
            const armor = this.armor[armorKey];
            
            if (armor) {
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

                
            }
        
            slot.textContent = '';
            slot.dataset.equippedArmor = '';
    
            // Update EquipmentModule to remove the armor
            EquipmentModule.updateEquippedArmor(slotId, null);
            
            // Update Armor Rating
            this.updateArmorRating();
        }
    },

    getEquippedArmor() {
        const equippedArmor = {};
        document.querySelectorAll('.equipment-slot[data-slot-type]').forEach(slot => {
            if (this.isArmorSlot(slot.dataset.slotType)) {
                const armorKey = slot.dataset.equippedArmor;
                if (armorKey) {
                    equippedArmor[slot.id] = armorKey;
                }
            }
        });
        return equippedArmor;
    },
    
    unequipAllArmor() {
        document.querySelectorAll('.equipment-slot[data-slot-type]').forEach(slot => {
            if (this.isArmorSlot(slot.dataset.slotType)) {
                this.unequipArmor(slot.id);
            }
        });
    },
    
    isArmorSlot(slotType) {
        const armorSlotTypes = ['head', 'face', 'neck', 'shoulders', 'torso', 'arm', 'wrist', 'finger', 'waist', 'legs', 'ankle', 'feet', 'toe'];
        return armorSlotTypes.includes(slotType.toLowerCase());
    },

    getEquippedArmorKeys() {
        const equippedArmorKeys = {};
        for (const [slotId, armor] of Object.entries(this.equippedItems)) {
            if (armor) {
                equippedArmorKeys[slotId] = armor.key || armor.name;
            }
        }
        return equippedArmorKeys;
    },

    recalculateArmorRating() {
        let baseAR = 10;
        let totalAR = baseAR;

        document.querySelectorAll('.equipment-slot[data-slot-type]').forEach(slot => {
            const armorKey = slot.dataset.equippedArmor;
            if (armorKey && this.armor[armorKey]) {
                const armor = this.armor[armorKey];
                if (armor && typeof armor.armorRating !== 'undefined') {
                    totalAR += parseInt(armor.armorRating) || 0;
                }
            }
        });

        return totalAR;
    },

    updateArmorRating() {
        const totalAR = this.recalculateArmorRating();
        const armorRatingElement = document.getElementById('armor-rating');
        if (armorRatingElement) {
            armorRatingElement.textContent = totalAR;
        }
        console.log('Updated Armor Rating:', totalAR);
    },
    
    updateSlotContent(slot, armorName) {
        const content = document.createElement('div');
        content.className = 'equipment-slot-content';
        content.textContent = armorName;
    
        // Clear existing content
        slot.innerHTML = '';
        slot.appendChild(content);
    },
    
    resetSlotContent(slot) {
        // Clear the slot content
        slot.innerHTML = '';
    
        // Recreate the slot label
        const slotLabel = document.createElement('span');
        slotLabel.className = 'slot-label';
        slotLabel.textContent = this.getSlotLabel(slot.id);
        slot.appendChild(slotLabel);
    },
    
    getSlotLabel(slotId) {
        // Map slot IDs to their labels
        const slotLabels = {
            'head-slot': 'Head',
            'face-slot': 'Face',
            'neck-slot': 'Neck',
            'shoulders-slot': 'Shoulders',
            'torso-slot': 'Torso',
            'left-arm-slot': 'Left Arm',
            'right-arm-slot': 'Right Arm',
            'left-wrist-slot': 'Left Wrist',
            'right-wrist-slot': 'Right Wrist',
            'left-finger1-slot': 'Left Finger 1',
            'left-finger2-slot': 'Left Finger 2',
            'right-finger1-slot': 'Right Finger 1',
            'right-finger2-slot': 'Right Finger 2',
            'waist-slot': 'Waist',
            'legs-slot': 'Legs',
            'left-ankle-slot': 'Left Ankle',
            'right-ankle-slot': 'Right Ankle',
            'feet-slot': 'Feet',
            'left-toe1-slot': 'Left Toe 1',
            'left-toe2-slot': 'Left Toe 2',
            'right-toe1-slot': 'Right Toe 1',
            'right-toe2-slot': 'Right Toe 2'
        };
    
        return slotLabels[slotId] || 'Unknown Slot';
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
    },

    loadSavedData(data) {
        if (data && data.equippedItems) {
            for (const [slotId, armorKey] of Object.entries(data.equippedItems)) {
                if (this.isArmorSlot(slotId.split('-')[0]) && armorKey) {
                    this.equipArmor(armorKey, slotId);
                }
            }
        }
    }
};

document.addEventListener('DOMContentLoaded', () => {
    ArmorModule.init();
});

export default ArmorModule;