// Import necessary modules
import ActionModule from './actionModule.js';
import VitalModule from './vital.js';
import SkillModule from './skill.js';
import AbilityModule from './ability.js';
import TraitModule from './trait.js';
import SpellModule from './spell.js';
import EnhancementModule from './enhancementModule.js';

// Define the EquipmentModule
const EquipmentModule = {
    items: {},
    equippedItems: {},
    selectedSlot: null,

    async init() {
        console.log('Initializing EquipmentModule');
        this.equippedItems = {
            // Weapons
            'primary-weapon': null,
            'secondary-weapon': null,

            // Armor
            'head': null,
            'face': null,
            'neck': null,
            'shoulders': null,
            'torso': null,
            'left-arm': null,
            'right-arm': null,
            'left-wrist': null,
            'right-wrist': null,
            'left-hand': null,
            'right-hand': null,
            'finger-1': null,
            'finger-2': null,
            'finger-3': null,
            'finger-4': null,
            'waist': null,
            'legs': null,
            'left-ankle': null,
            'right-ankle': null,
            'left-foot': null,
            'right-foot': null,
            'toe-1': null,
            'toe-2': null,
            'toe-3': null,
            'toe-4': null,

            // Utility
            'utility-slot-1': null,
            'utility-slot-2': null,
            'utility-slot-3': null,
            'utility-slot-4': null,
            'utility-slot-5': null
        };

        await this.loadItems();
        this.setupEventListeners();
        this.initializeEquippedItems();
        this.populateEquipmentSlots();
        this.switchEquipmentSection('weapons');
        window.addEventListener('resize', this.resizeItemNames.bind(this));
    },

    loadItems() {
        console.log('Loading items');
        return Promise.all([
            fetch('weapons.json').then(response => response.json()),
            fetch('armor.json').then(response => response.json()),
        ])
            .then(([weaponsData, armorData]) => {
                this.items = { ...weaponsData.weapons, ...armorData.armor };
                console.log('All items loaded:', this.items);
            })
            .catch(error => console.error('Error loading items:', error));
    },

    setupEventListeners() {
        console.log('Setting up event listeners for EquipmentModule');
        document.querySelectorAll('.equipment-slot').forEach(slot => {
            if (!slot.id.startsWith('utility-slot-')) {
                slot.addEventListener('click', event => this.handleSlotClick(event.currentTarget));
            }
        });

        // Event listener for the equipment modal
        const equipmentModal = document.getElementById('equipment-modal');
        if (equipmentModal) {
            const closeButton = equipmentModal.querySelector('.close');
            if (closeButton) {
                closeButton.addEventListener('click', this.closeModals.bind(this));
            }
            const searchInput = document.getElementById('item-search');
            if (searchInput) {
                searchInput.addEventListener('input', e => this.filterItems(e.target.value));
            }
        } else {
            console.error('Equipment modal not found');
        }

        // Event listener for closing modals when clicking outside
        window.addEventListener('click', event => {
            if (event.target.classList.contains('modal')) {
                this.closeModals();
            }
        });

        // Event listeners for equipment navigation buttons
        const navButtons = document.querySelectorAll('.equipment-nav-btn');
        navButtons.forEach(button => {
            button.addEventListener('click', () => {
                const section = button.dataset.section;
                this.switchEquipmentSection(section);
            });
        });

        // Event listeners for equip and details buttons in the equipment modal
        const itemCardsContainer = document.getElementById('item-cards-container');
        if (itemCardsContainer) {
            itemCardsContainer.addEventListener('click', event => {
                const target = event.target;
                if (target.classList.contains('equip-btn')) {
                    const itemKey = target.dataset.itemKey;
                    this.equipItem(itemKey);
                } else if (target.classList.contains('details-btn')) {
                    const itemKey = target.dataset.itemKey;
                    this.showItemDetails(itemKey);
                }
            });
        }

        // Event listener for the item detail modal
        const itemDetailModal = document.getElementById('item-detail-modal');
        if (itemDetailModal) {
            const closeButton = itemDetailModal.querySelector('.close');
            if (closeButton) {
                closeButton.addEventListener('click', () => {
                    itemDetailModal.style.display = 'none';
                });
            }
        }

        // Event listener for equip/unequip button in item detail modal
        const equipUnequipButton = document.getElementById('equip-unequip-button');
        if (equipUnequipButton) {
            equipUnequipButton.addEventListener('click', () => {
                const itemKey = document.getElementById('item-detail-title').dataset.itemKey;
                const isEquipped = equipUnequipButton.textContent === 'Unequip';
                if (isEquipped) {
                    this.unequipItem(this.selectedSlot);
                } else {
                    this.equipItem(itemKey);
                }
                itemDetailModal.style.display = 'none';
            });
        }

        // Add event listeners for collapsible sections
        document.querySelectorAll('.collapsible').forEach(collapsible => {
            collapsible.addEventListener('click', () => {
                collapsible.classList.toggle('active');
                const content = collapsible.querySelector('.collapsible-content');
                if (content.style.display === 'block') {
                    content.style.display = 'none';
                    collapsible.querySelector('.toggle-icon').textContent = '+';
                } else {
                    content.style.display = 'block';
                    collapsible.querySelector('.toggle-icon').textContent = '-';
                }
            });
        });

        document.querySelectorAll('.collapsible h3').forEach(header => {
            header.addEventListener('click', () => {
                const content = header.nextElementSibling;
                const toggleIcon = header.querySelector('.toggle-icon');
                if (content.style.maxHeight) {
                    content.style.maxHeight = null;
                    toggleIcon.textContent = '+';
                } else {
                    content.style.maxHeight = content.scrollHeight + "px";
                    toggleIcon.textContent = '-';
                }
            });
        });
    },

    handleSlotClick(slot) {
        console.log('Equipment slot clicked:', slot.id);
        if (slot.id.startsWith('utility-slot-')) {
            console.log('Utility slot clicked, ignoring in EquipmentModule');
            return;
        }
        this.selectedSlot = slot.id;
        const equippedItemKey = slot.dataset.equippedItem;
        const slotType = slot.dataset.slotType;
        console.log('Slot type:', slotType);

        if (equippedItemKey) {
            this.showItemDetails(equippedItemKey, slot.id);
        } else if (slotType) {
            this.showEquipmentModal(slotType);
        } else {
            console.error('Slot type is undefined');
        }
    },

    showItemDetails(itemKey, slotId = null) {
        const item = this.items[itemKey];
        const isEquipped = slotId !== null || this.isItemEquipped(itemKey);
        const equippedSlotId = slotId || this.getEquippedSlot(itemKey);
        this.displayItemDetailModal(item, isEquipped, equippedSlotId);
    },

    displayItemDetailModal(item, isEquipped, slotId) {
        const modal = document.getElementById('item-detail-modal');
        const title = document.getElementById('item-detail-title');
        const rarity = document.getElementById('item-rarity');
        const description = document.getElementById('item-description');
        const type = document.getElementById('item-type');
        const subtype = document.getElementById('item-subtype');
        const damage = document.getElementById('item-damage');
        const damageType = document.getElementById('item-damage-type');
        const range = document.getElementById('item-range');
        const handsRequired = document.getElementById('item-hands-required');
        const armorRating = document.getElementById('item-armor-rating');
        const tankModifier = document.getElementById('item-tank-modifier');
        const vitalBonuses = document.getElementById('item-vital-bonuses');
        const skillBonuses = document.getElementById('item-skill-bonuses');
        const hpBonus = document.getElementById('item-hp-bonus');
        const mpBonus = document.getElementById('item-mp-bonus');
        const abilities = document.getElementById('item-abilities');
        const traits = document.getElementById('item-traits');
        const spellsGranted = document.getElementById('item-spells-granted');
        const equipUnequipButton = document.getElementById('equip-unequip-button');

        if (!modal || !title || !equipUnequipButton) {
            console.error('Item detail modal elements not found');
            return;
        }

        title.textContent = item.name;
        title.dataset.itemKey = item.name; // Store the item key for later use

        rarity.textContent = item.rarity || 'N/A';
        description.textContent = item.description || 'No description available.';
        type.textContent = `Type: ${item.itemType || 'N/A'}`;
        subtype.textContent = `Subtype: ${item.weaponType || item.armorType || 'N/A'}`;
        damage.textContent = `Damage: ${item.damageAmount || 'N/A'}`;
        damageType.textContent = `Damage Type: ${item.damageType || 'N/A'}`;
        range.textContent = `Range: ${item.range || 'N/A'}`;
        handsRequired.textContent = `Hands Required: ${item.handsRequired || 'N/A'}`;
        armorRating.textContent = `Armor Rating: ${item.armorRating || 'N/A'}`;
        tankModifier.textContent = `Tank Modifier: ${item.tankModifier || 'N/A'}`;

        vitalBonuses.innerHTML = this.formatBonuses(item.vitalBonus);
        skillBonuses.innerHTML = this.formatBonuses(item.skillBonus);

        hpBonus.textContent = `HP Bonus: ${item.hpBonus || '0'}`;
        mpBonus.textContent = `MP Bonus: ${item.mpBonus || '0'}`;

        abilities.textContent = `Abilities: ${this.formatArray(item.abilities)}`;
        traits.textContent = `Traits: ${this.formatArray(item.traits)}`;
        spellsGranted.textContent = `Spells Granted: ${this.formatArray(item.spellsGranted)}`;

        equipUnequipButton.textContent = isEquipped ? 'Unequip' : 'Equip';

        modal.style.display = 'block';
    },

    formatArray(arr) {
        if (Array.isArray(arr) && arr.length > 0) {
            return arr.join(', ');
        }
        return 'None';
    },

    handleItemAction(itemKey, isEquipping) {
        const item = this.items[itemKey];
        if (item && item.itemType === 'Weapon') {
            if (isEquipping) {
                ActionModule.addAction(item);
            } else {
                ActionModule.removeAction(item.name);
            }
        }
    },

    formatBonuses(bonuses) {
        if (!bonuses || Object.keys(bonuses).length === 0) {
            return 'None';
        }
        return Object.entries(bonuses)
            .map(([key, value]) => `<div><strong>${this.capitalizeFirstLetter(key)}:</strong> ${value}</div>`)
            .join('');
    },

    capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    },


    initializeEquippedItems() {
        console.log('Initializing equipped items');
        document.querySelectorAll('.equipment-slot').forEach(slot => {
            const equippedItemKey = slot.dataset.equippedItem;
            if (equippedItemKey && this.items[equippedItemKey]) {
                this.equippedItems[slot.id] = this.items[equippedItemKey];
                this.updateSlotContent(slot, equippedItemKey);
                this.applyItemBonuses(this.items[equippedItemKey]);
            }
        });
    },

    // Populate UI slots with equipment options
    populateEquipmentSlots() {
        console.log('Populating equipment slots');
        const equipmentContainer = document.querySelector('.equipment-container');
        if (!equipmentContainer) {
            console.error('Equipment container not found');
            return;
        }

        // Make sure all sections are present
        ['weapons', 'armor', 'utility'].forEach(sectionName => {
            const section = equipmentContainer.querySelector(`.${sectionName}-section`);
            if (!section) {
                console.error(`${sectionName} section not found`);
            }
        });

        this.setupWeaponSlots();
        this.setupArmorSlots();
        this.setupUtilitySlots();

        this.resizeItemNames();
    },

    // Remove bonuses from an unequipped item
    removeItemBonuses(item) {
        console.log('Removing item bonuses:', item);
        if (item.vitalBonus) {
            console.log('Removing vital bonuses:', item.vitalBonus);
            VitalModule.removeSingleItemBonus(item.itemType.toLowerCase(), item.vitalBonus);
        }
        if (item.skillBonus) {
            console.log('Removing skill bonuses:', item.skillBonus);
            SkillModule.removeSingleItemBonus(item.itemType.toLowerCase(), item.skillBonus);
        }
        if (item.abilities && Array.isArray(item.abilities)) {
            AbilityModule.removeEquipmentAbilities(item.abilities);
        }
        if (item.traits && Array.isArray(item.traits)) {
            TraitModule.removeTraits(item.itemType.toLowerCase(), item.name);
        }
    },

    applyItemBonuses(item) {
        console.log('Applying item bonuses:', item);
        if (item.vitalBonus) {
            console.log('Applying vital bonuses:', item.vitalBonus);
            VitalModule.updateSingleItemBonus(item.itemType.toLowerCase(), item.vitalBonus);
        }
        if (item.skillBonus) {
            console.log('Applying skill bonuses:', item.skillBonus);
            SkillModule.updateSingleItemBonus(item.itemType.toLowerCase(), item.skillBonus);
        }
        if (item.abilities && Array.isArray(item.abilities)) {
            AbilityModule.addEquipmentAbilities(item.abilities);
        }
        if (item.traits && Array.isArray(item.traits)) {
            TraitModule.updateTraits(item.itemType.toLowerCase(), item.name, item.traits);
        }
        // Remove any call to ActionModule.addAction here if it exists
    },

    createItemDetailModal() {
        const modal = document.createElement('div');
        modal.id = 'item-detail-modal';
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <span class="close">&times;</span>
                <h2 id="item-detail-title"></h2>
                <div id="item-detail-content"></div>
            </div>
        `;
        document.body.appendChild(modal);

        const closeButton = modal.querySelector('.close');
        closeButton.addEventListener('click', () => this.closeModals());
    },

    // Show modal for equipment selection
    showEquipmentModal(slotType) {
        console.log('Showing equipment modal for:', slotType);
        const modal = document.getElementById('equipment-modal');
        const container = document.getElementById('item-cards-container');
        const searchInput = document.getElementById('item-search');

        if (!modal || !container || !searchInput) {
            console.error('Equipment modal elements not found');
            return;
        }

        searchInput.value = '';
        container.innerHTML = '';

        console.log('All items:', this.items);
        const filteredItems = Object.entries(this.items).filter(([key, item]) => {
            if (!item || !item.itemType) {
                console.warn(`Item ${key} has no itemType:`, item);
                return false;
            }
            return item.itemType.toLowerCase() === slotType.toLowerCase();
        });
        console.log('Filtered items:', filteredItems);

        if (filteredItems.length === 0) {
            container.innerHTML = '<p>No matching items found</p>';
        } else {
            filteredItems.forEach(([key, item]) => {
                console.log('Creating card for item:', item);
                const card = this.createItemCard(key, item);
                container.appendChild(card);
            });
        }

        modal.style.display = 'block';
    },

    // Create a card for an item
    createItemCard(key, item) {
        const card = document.createElement('div');
        card.className = 'item-card';
        card.innerHTML = `
            <h3>${item.name || 'Unnamed item'}</h3>
            <p>${item.itemType || 'Unknown type'}</p>
            <div class="item-card-buttons">
                <button class="equip-btn" data-item-key="${key}">Equip</button>
                <button class="details-btn" data-item-key="${key}">Details</button>
            </div>
        `;

        card.querySelector('.equip-btn').addEventListener('click', () => this.equipItem(key));
        card.querySelector('.details-btn').addEventListener('click', () => this.showItemDetails(key));

        return card;
    },

    getEquippedItem(equipmentReq) {
        console.log('Searching for equipped item:', equipmentReq);
        console.log('Current equipped items:', this.equippedItems);

        for (const [slotId, item] of Object.entries(this.equippedItems)) {
            console.log(`Checking slot ${slotId}:`, item);
            if (item && this.itemMatchesRequirements(item, equipmentReq)) {
                console.log('Matching item found:', item);
                return item;
            }
        }

        console.log('No matching item found in equipped items');
        return null;
    },

    itemMatchesRequirements(item, requirements) {
        console.log('Checking item against requirements:', item, requirements);

        if (!item) {
            console.log('Item is null or undefined');
            return false;
        }

        if (requirements.itemType && item.itemType !== requirements.itemType) {
            console.log(`Item type mismatch: required ${requirements.itemType}, got ${item.itemType}`);
            return false;
        }
        if (requirements.armorType && item.armorType !== requirements.armorType) {
            console.log(`Armor type mismatch: required ${requirements.armorType}, got ${item.armorType}`);
            return false;
        }
        if (requirements.name && !item.name.toLowerCase().startsWith(requirements.name.toLowerCase())) {
            console.log(`Name mismatch: required starts with ${requirements.name}, got ${item.name}`);
            return false;
        }

        console.log('Item matches all requirements');
        return true;
    },

    equipItem(itemKey) {
        console.log(`Equipping item: ${itemKey}`);
        const item = this.items[itemKey];
        const slot = document.getElementById(this.selectedSlot);
        
        if (!slot || !item) {
            console.error(`Failed to equip item: ${itemKey}. Slot or item not found.`);
            return;
        }
    
        // Unequip current item if there is one
        if (slot.dataset.equippedItem) {
            this.unequipItem(this.selectedSlot);
        }
    
        // Update slot content and dataset
        this.updateSlotContent(slot, item);
        slot.dataset.equippedItem = itemKey;
        
        // Update equippedItems
        this.equippedItems[this.selectedSlot] = item;
        
        console.log(`Item ${itemKey} equipped successfully to ${this.selectedSlot}`);
        console.log('Updated equipped items:', this.equippedItems);
    
        // Apply item bonuses
        this.applyItemBonuses(item);
        
        // Handle equipment spells
        this.handleEquipmentSpells(item, true);
        
        // Update related modules
        this.updateRelatedModules(item);
    
        // Handle item actions
        if (item.itemType === 'Weapon') {
            ActionModule.addAction(item);
        }
    
        this.closeModals();
        this.refreshDisplays();
        EnhancementModule.refreshEnhancements();
    },
    
    unequipItem(slotId) {
    const slot = document.getElementById(slotId);
    if (slot) {
        const itemKey = slot.dataset.equippedItem;
        if (itemKey) {
            const item = this.items[itemKey];
            if (item) {
                console.log('Removing bonuses for item:', item);
                this.removeItemBonuses(item);
                this.handleEquipmentSpells(item, false);
                // Handle item actions
                this.handleItemAction(itemKey, false);
            }
        }

            // Clear slot content and dataset
            slot.innerHTML = '';
            slot.dataset.equippedItem = '';

            // Remove from equippedItems
            delete this.equippedItems[slotId];

            console.log(`Item unequipped from slot ${slotId}`);
            console.log('Updated equipped items:', this.equippedItems);
        }
    },

    updateSlotContent(slot, item) {
        const content = document.createElement('div');
        content.className = 'equipment-slot-content';
        content.textContent = item.name;

        // Clear existing content
        slot.innerHTML = '';
        slot.appendChild(content);
    },

    updateRelatedModules(item) {
        if (item.abilities && Array.isArray(item.abilities)) {
            console.log(`Adding abilities from ${item.name}:`, item.abilities);
            AbilityModule.addEquipmentAbilities(item.abilities);
        }
        if (item.traits && Array.isArray(item.traits)) {
            TraitModule.updateTraits(item.itemType.toLowerCase(), item.name, item.traits);
        }
    },

    refreshDisplays() {
        VitalModule.updateAllVitalScores();
        SkillModule.updateAllSkillScores();
        AbilityModule.displayCurrentAbilities();
        TraitModule.displayTraits();
        ActionModule.displayActions();
    },

    // Add this method to the EquipmentModule object
    handleEquipmentSpells(item, isEquipping) {
        if (item.spellsGranted && Array.isArray(item.spellsGranted)) {
            if (isEquipping) {
                SpellModule.addEquipmentSpells(item.spellsGranted);
            } else {
                SpellModule.removeEquipmentSpells(item.spellsGranted);
            }
        }
    },

    // Format values for display
    formatValue(value) {
        if (Array.isArray(value)) {
            return value.join(', ');
        } else if (typeof value === 'object' && value !== null) {
            return Object.entries(value).map(([k, v]) => `${k}: ${v}`).join(', ');
        }
        return value;
    },

    isItemEquipped(itemKey) {
        return Object.values(this.equippedItems).some(item => item && item.name === this.items[itemKey].name);
    },

    // Find which slot has an item equipped
    getEquippedSlot(itemKey) {
        return Object.keys(this.equippedItems).find(slotId => this.equippedItems[slotId].name === itemKey);
    },

    setupWeaponSlots() {
        this.setupSlots('.weapons-section .equipment-slot');
    },

    setupArmorSlots() {
        this.setupSlots('.armor-section .equipment-slot');
    },

    setupUtilitySlots() {
        this.setupSlots('.utility-section .equipment-slot');
    },

    setupSlots(selector) {
        const slots = document.querySelectorAll(selector);
        slots.forEach(slot => {
            slot.addEventListener('click', (event) => this.handleSlotClick(event.currentTarget));
        });
    },

    switchEquipmentSection(sectionName) {
        console.log(`Switching to ${sectionName} section`);
        const sections = document.querySelectorAll('.equipment-section');
        const buttons = document.querySelectorAll('.equipment-nav-btn');

        sections.forEach(section => {
            section.style.display = section.classList.contains(`${sectionName}-section`) ? 'block' : 'none';
        });

        buttons.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.section === sectionName);
        });
    },

    filterItems(query) {
        const container = document.getElementById('item-cards-container');
        const lowercaseQuery = query.toLowerCase();

        container.innerHTML = '';

        Object.entries(this.items).forEach(([key, item]) => {
            if (item.name.toLowerCase().includes(lowercaseQuery) || item.itemType.toLowerCase().includes(lowercaseQuery)) {
                const card = this.createItemCard(key, item);
                container.appendChild(card);
            }
        });

        if (container.children.length === 0) {
            container.innerHTML = '<p>No matching items found</p>';
        }
    },

    // Close all modal windows
    closeModals() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.style.display = 'none';
        });
    },

    getAllEquipmentData() {
        return {
            equippedItems: this.equippedItems,
            items: this.items  // This includes all available items
        };
    },

    loadSavedData(data) {
        if (data) {
            this.equippedItems = data.equippedItems || {};
            this.items = data.items || {};
            this.restoreEquippedItems();
        }
    },

    restoreEquippedItems() {
        Object.entries(this.equippedItems).forEach(([slotId, item]) => {
            if (item) {
                const slot = document.getElementById(slotId);
                if (slot) {
                    this.updateSlotContent(slot, item.name);
                    slot.dataset.equippedItem = item.name;
                    this.applyItemBonuses(item);
                }
            }
        });
        this.refreshDisplays();
    },

    // Expose this module to the global scope for accessibility
    exposeToGlobalScope() {
        console.log('Exposing EquipmentModule to global scope');
        window.EquipmentModule = this;
    },

    resizeItemNames() {
        const slotContents = document.querySelectorAll('.equipment-slot-content');
        slotContents.forEach(content => {
            const slot = content.closest('.equipment-slot');
            const slotWidth = slot.offsetWidth;
            const slotHeight = slot.offsetHeight;
            let fontSize = 0.8;

            content.style.fontSize = `${fontSize}rem`;

            while (content.scrollWidth > slotWidth || content.scrollHeight > slotHeight - 20) {
                fontSize -= 0.05;
                content.style.fontSize = `${fontSize}rem`;
                if (fontSize <= 0.5) break; // Set a minimum font size
            }
        });
    }
};

// Initialize the module when the document is ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM fully loaded');
    EquipmentModule.init();
    EquipmentModule.exposeToGlobalScope();
});

// Export the EquipmentModule
export default EquipmentModule;