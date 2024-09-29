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
    equippedItems: {}, // Ensure the equippedItems is initialized here

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
        this.calculateTotalArmorRating();
        window.addEventListener('resize', this.resizeItemNames.bind(this));
    },

    // Add equipItem functionality
    equipItem(itemKey, slotId) {
        console.log(`Attempting to equip item: ${itemKey} to slot ${slotId}`);
        const item = this.items[itemKey];

        if (!item) {
            console.error(`Item not found: ${itemKey}`);
            return;
        }

        if (slotId === undefined) {
            console.error('slotId is undefined. Cannot equip item without a slot.');
            return;
        }

        const slot = document.getElementById(slotId);

        if (!slot) {
            console.warn(`Slot element not found: ${slotId}. Proceeding with equip logic anyway.`);
        }

        // Unequip current item if there is one
        if (slot && slot.dataset.equippedItem) {
            this.unequipItem(slotId);
        }

        // Update equippedItems
        this.equippedItems[slotId] = item;

        console.log(`Item ${itemKey} equipped successfully to ${slotId}`);
        console.log('Updated equipped items:', this.equippedItems);

        // Apply item bonuses
        this.applyItemBonuses(item);

        // Handle equipment spells
        this.handleEquipmentSpells(item, true);

        // Handle related module updates
        this.updateRelatedModules(item);

        // Handle item actions
        if (item.itemType === 'Weapon') {
            ActionModule.addAction(item);
        }

        // Update UI if slot element exists
        if (slot) {
            this.updateSlotContent(slot, item);
            slot.dataset.equippedItem = itemKey;
        }

        this.closeModals();
        this.refreshDisplays();
        EnhancementModule.refreshEnhancements();
        this.calculateTotalArmorRating();
    },

    unequipItem(slotId) {
        console.log(`Unequipping item from slot: ${slotId}`);
        const slot = document.getElementById(slotId);
        if (slot) {
            const itemKey = slot.dataset.equippedItem;
            if (itemKey) {
                const item = this.items[itemKey];
                if (item) {
                    this.removeItemBonuses(item);
                    this.handleEquipmentSpells(item, false);
                    if (item.itemType === 'Weapon') {
                        ActionModule.removeAction(item.name);
                    }
                }
            }

            // Clear slot content but keep the label
            const slotLabel = slot.dataset.slotType || slot.id;
            slot.innerHTML = `<div class="slot-label">${this.formatSlotLabel(slotLabel)}</div>`;
            slot.dataset.equippedItem = '';

            // Remove from equippedItems
            delete this.equippedItems[slotId];

            console.log(`Item unequipped from slot ${slotId}`);
            console.log('Updated equipped items:', this.equippedItems);

            // Re-add the event listener
            slot.addEventListener('click', () => this.handleSlotClick(slot));
        }
        this.calculateTotalArmorRating();
    },

    handleEquipmentSpells(item, isEquipping) {
        console.log('handleEquipmentSpells called with item:', item, 'isEquipping:', isEquipping);
        if (item.spellsGranted && Array.isArray(item.spellsGranted)) {
            console.log('Item has spells to grant:', item.spellsGranted);
            if (isEquipping) {
                console.log('Adding equipment spells:', item.spellsGranted);
                SpellModule.addEquipmentSpells(item.spellsGranted);
            } else {
                console.log('Removing equipment spells:', item.spellsGranted);
                SpellModule.removeEquipmentSpells(item.spellsGranted);
            }
        } else {
            console.log('Item does not have spells to grant');
        }
    },

    // Add getEquippedItemKey method
    getEquippedItemKey(slotId) {
        return this.equippedItems[slotId] || null;
    },

    loadItems() {
        console.log('Loading items');
        return Promise.all([
            fetch('weapons.json').then(response => response.json()),
            fetch('armor.json').then(response => response.json()),
        ])
            .then(([weaponsData, armorData]) => {
                console.log('Loaded weapons:', weaponsData.weapons);
                console.log('Loaded armor:', armorData.armor);
                this.items = { ...weaponsData.weapons, ...armorData.armor };
                console.log('All items loaded:', this.items);
            })
            .catch(error => console.error('Error loading items:', error));
    },

    setupEventListeners() {
        console.log('Setting up event listeners for EquipmentModule');

        // Equipment slot listeners
        document.querySelectorAll('.equipment-slot').forEach(slot => {
            if (!slot.id.startsWith('utility-slot-')) {
                slot.addEventListener('click', event => this.handleSlotClick(event.currentTarget));
            }
        });

        // Equipment modal listeners
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

        // Close modals when clicking outside
        window.addEventListener('click', event => {
            if (event.target.classList.contains('modal')) {
                this.closeModals();
            }
        });

        // Equipment navigation buttons
        const navButtons = document.querySelectorAll('.equipment-nav-btn');
        navButtons.forEach(button => {
            button.addEventListener('click', () => {
                const section = button.dataset.section;
                this.switchEquipmentSection(section);
            });
        });

        // Item cards container listener
        const itemCardsContainer = document.getElementById('item-cards-container');
        if (itemCardsContainer) {
            itemCardsContainer.addEventListener('click', event => {
                const target = event.target;
                if (target.classList.contains('equip-btn')) {
                    const itemKey = target.dataset.itemKey;
                    this.equipItem(itemKey, this.selectedSlot);
                } else if (target.classList.contains('details-btn')) {
                    const itemKey = target.dataset.itemKey;
                    this.showItemDetails(itemKey);
                }
            });
        }

        // Item detail modal listener
        const itemDetailModal = document.getElementById('item-detail-modal');
        if (itemDetailModal) {
            const closeButton = itemDetailModal.querySelector('.close');
            if (closeButton) {
                closeButton.addEventListener('click', () => {
                    itemDetailModal.style.display = 'none';
                });
            }
        }

        // Equip/Unequip button in item detail modal
        const equipUnequipButton = document.getElementById('equip-unequip-button');
        if (equipUnequipButton) {
            equipUnequipButton.addEventListener('click', () => {
                const itemKey = document.getElementById('item-detail-title').dataset.itemKey;
                const isEquipped = equipUnequipButton.textContent === 'Unequip';
                if (isEquipped) {
                    this.unequipItem(this.selectedSlot);
                } else {
                    if (this.selectedSlot === undefined) {
                        console.error('No slot selected. Cannot equip item.');
                        return;
                    }
                    this.equipItem(itemKey, this.selectedSlot);
                }
                itemDetailModal.style.display = 'none';
            });
        }

        // Collapsible sections listeners
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

        // Collapsible headers listeners
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

        console.log('Event listeners set up for EquipmentModule');
    },

    handleSlotClick(slot) {
        console.log('Equipment slot clicked:', slot.id);
        this.selectedSlot = slot.id;
        const equippedItemKey = slot.dataset.equippedItem;
        const slotType = slot.dataset.slotType;
        console.log('Slot type:', slotType, 'Equipped item:', equippedItemKey);

        if (equippedItemKey) {
            this.showItemDetails(equippedItemKey, slot.id);
        } else if (slotType) {
            this.showEquipmentModal(slotType);
        } else {
            console.error('Slot type is undefined');
        }
    },

    showItemDetails(itemKey, slotId = null) {
        console.log('showItemDetails called with:', { itemKey, slotId });
        const item = this.items[itemKey];
        if (!item) {
            console.error(`Item with key ${itemKey} not found`);
            return;
        }
        console.log('Item found:', item);
        const isEquipped = slotId !== null;
        this.displayItemDetailModal(item, isEquipped, slotId);
    },

    handleSlotClick(slot) {
        console.log('Equipment slot clicked:', slot.id);
        this.selectedSlot = slot.id;
        const equippedItemKey = slot.dataset.equippedItem;
        const slotType = slot.dataset.slotType;
        console.log('Slot type:', slotType, 'Equipped item:', equippedItemKey);

        if (equippedItemKey) {
            this.showItemDetails(equippedItemKey, slot.id);
        } else if (slotType) {
            this.showEquipmentModal(slotType);
        } else {
            console.error('Slot type is undefined');
        }
    },

    showItemDetails(itemKey, slotId = null) {
        console.log('showItemDetails called with:', { itemKey, slotId });
        const item = this.items[itemKey];
        if (!item) {
            console.error(`Item with key ${itemKey} not found`);
            return;
        }
        console.log('Item found:', item);
        const isEquipped = slotId !== null;
        this.displayItemDetailModal(item, isEquipped, slotId);
    },

    displayItemDetailModal(item, isEquipped, slotId) {
        console.log('Displaying item details:', item);
        const modal = document.getElementById('item-detail-modal');
        if (!modal) {
            console.error('Item detail modal not found');
            return;
        }

        // Set title and rarity
        document.getElementById('item-detail-title').textContent = item.name;
        document.getElementById('item-rarity').textContent = item.rarity || 'Common';

        // General Info
        document.getElementById('item-description').textContent = item.description || 'No description available.';
        document.getElementById('item-type').textContent = `Type: ${item.itemType || 'Unknown'}`;
        document.getElementById('item-subtype').textContent = `Subtype: ${item.weaponType || item.armorType || 'N/A'}`;

        // Item Details
        this.setElementText('item-effect', item.effect, 'Effect');
        this.setElementText('item-duration', item.duration, 'Duration');
        this.setElementText('item-range', item.range, 'Range');
        this.setElementText('item-damage', item.damageAmount, 'Damage');
        this.setElementText('item-damage-type', item.damageType, 'Damage Type');
        this.setElementText('item-blast-radius', item.blastRadius, 'Blast Radius');
        this.setElementText('item-trigger-mechanism', item.triggerMechanism, 'Trigger Mechanism');
        this.setElementText('item-armor-rating', item.armorRating, 'Armor Rating');
        this.setElementText('item-tank-modifier', item.tankModifier, 'Tank Modifier');
        this.setElementText('item-hands-required', item.handsRequired, 'Hands Required');
        this.setElementText('item-melee-ranged', item.meleeRanged, 'Melee/Ranged');
        this.setElementText('item-magic-nonmagical', item.magicNonMagical, 'Magical/Non-Magical');
        this.setElementText('item-casting-time', item.CastingTime, 'Casting Time');
        this.setElementText('item-mana-cost', item.ManaPointCost, 'Mana Cost');
        this.setElementText('item-cooldown', item.Cooldown, 'Cooldown');
        this.setElementText('item-spell-casting-modifier', item.SpellCastingModifier, 'Spellcasting Modifier');

        // Bonuses
        this.populateBonuses('item-vital-bonuses', item.vitalBonus, 'Vital Bonuses');
        this.populateBonuses('item-skill-bonuses', item.skillBonus, 'Skill Bonuses');
        this.setElementText('item-hp-bonus', item.hpBonus, 'HP Bonus');
        this.setElementText('item-mp-bonus', item.mpBonus, 'MP Bonus');

        // Special Properties
        this.setElementText('item-abilities', this.formatArray(item.abilities), 'Abilities');
        this.setElementText('item-traits', this.formatArray(item.traits), 'Traits');
        this.setElementText('item-spells-granted', this.formatArray(item.spellsGranted), 'Spells Granted');
        this.setElementText('item-additional-effects', this.formatArray(item.additionalEffects), 'Additional Effects');
        
        // Scroll-specific fields
        if (item.itemType === 'Scroll') {
            this.setElementText('item-scroll-scaling', item.Scaling, 'Scaling');
        } else {
            document.getElementById('item-scroll-scaling').style.display = 'none';
        }

        // Set up equip/unequip button
        const equipButton = document.getElementById('equip-unequip-button');
        equipButton.textContent = isEquipped ? 'Unequip' : 'Equip';
        equipButton.onclick = () => {
            if (isEquipped) {
                this.unequipItem(slotId);
            } else {
                this.equipItem(item.name, this.selectedSlot);
            }
            modal.style.display = 'none';
        };

        modal.style.display = 'block';
    },

    setElementText(elementId, value, label = '') {
        const element = document.getElementById(elementId);
        if (element) {
            if (value && value !== 'N/A') {
                element.textContent = label ? `${label}: ${value}` : value;
                element.style.display = 'block';
            } else {
                element.style.display = 'none';
            }
        }
    },

    populateBonuses(elementId, bonuses, label) {
        const element = document.getElementById(elementId);
        if (element) {
            if (bonuses && typeof bonuses === 'object' && Object.keys(bonuses).length > 0) {
                element.innerHTML = `<h4>${label}</h4><ul>` +
                    Object.entries(bonuses)
                        .map(([key, value]) => `<li>${key}: +${value}</li>`)
                        .join('') +
                    '</ul>';
                element.style.display = 'block';
            } else {
                element.style.display = 'none';
            }
        }
    },

    formatArray(arr) {
        if (Array.isArray(arr) && arr.length > 0) {
            return arr.join(', ');
        }
        return null;
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

        card.querySelector('.equip-btn').addEventListener('click', () => {
            console.log('Equip button clicked for item:', key);
            this.equipItem(key, this.selectedSlot);
        });
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

    updateEquippedArmor(slotId, armor) {
        if (armor) {
            this.equippedItems[slotId] = armor;
        } else {
            delete this.equippedItems[slotId];
        }
        this.calculateTotalArmorRating();
    },

    calculateTotalArmorRating() {
        let totalAR = this.baseArmorRating;
        for (const [slot, item] of Object.entries(this.equippedItems)) {
            if (item && item.armorRating) {
                totalAR += parseInt(item.armorRating) || 0;
            }
        }
        this.totalArmorRating = totalAR;
        this.updateArmorRatingDisplay();
    },

    updateArmorRatingDisplay() {
        const arElement = document.getElementById('armor-rating');
        if (arElement) {
            arElement.textContent = this.totalArmorRating;
        } else {
            console.error('Armor Rating element not found');
        }
    },

    formatSlotLabel(label) {
        return label.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    },

    updateSlotContent(slot, item) {
        const content = document.createElement('div');
        content.className = 'equipment-slot-content';

        if (item) {
            content.textContent = typeof item === 'string' ? item : item.name;
        } else {
            const slotLabel = slot.dataset.slotType || slot.id;
            content.innerHTML = `<div class="slot-label">${this.formatSlotLabel(slotLabel)}</div>`;
        }

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
        this.updateAllEquipmentSlots();
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
        return Object.values(this.equippedItems).some(equippedItem =>
            equippedItem && this.items[itemKey] && equippedItem.name === this.items[itemKey].name
        );
    },

    // Find which slot has an item equipped
    getEquippedSlot(itemKey) {
        return Object.keys(this.equippedItems).find(slotId => {
            const equippedItem = this.equippedItems[slotId];
            return equippedItem && equippedItem.name === this.items[itemKey].name;
        });
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
        const equippedData = {
            weapons: {},
            armor: {},
            utility: {}
        };

        for (const [slotId, item] of Object.entries(this.equippedItems)) {
            if (item) {
                const itemKey = item.key || item.name; // Use key if available, otherwise use name
                if (slotId === 'primary-weapon' || slotId === 'secondary-weapon') {
                    equippedData.weapons[slotId] = itemKey;
                } else if (slotId.startsWith('utility-slot-')) {
                    equippedData.utility[slotId] = itemKey;
                } else {
                    equippedData.armor[slotId] = itemKey;
                }
            }
        }

        return {
            equippedItems: equippedData,
            items: this.items  // This includes all available items
        };
    },

    refreshDisplays() {
        this.updateAllEquipmentSlots();
    },

    updateAllEquipmentSlots() {
        for (const [slotId, item] of Object.entries(this.equippedItems)) {
            if (item) {
                const slot = document.getElementById(slotId);
                if (slot) {
                    this.updateSlotContent(slot, item.name);
                }
            }
        }
    },

    loadSavedData(data) {
        if (data) {
            this.equippedItems = {};
            for (const [slotId, itemKey] of Object.entries(data.equippedItems)) {
                if (itemKey) {
                    this.equipItem(itemKey, slotId);
                }
            }
            this.items = data.items || {};
            this.refreshDisplays();
        }
    },

    unequipAllItems() {
        Object.keys(this.equippedItems).forEach(slotId => {
            if (slotId.includes('weapon')) {
                this.unequipItem(slotId);
            }
        });
    },

    // Add this function to your EquipmentModule if it doesn't exist

    getEquippedItemKey(slotId) {
        const slot = document.getElementById(slotId);
        if (slot && slot.dataset.equippedItem) {
            return slot.dataset.equippedItem;
        }
        return null;
    },

    getEquippedItemKeys() {
        const equippedItemKeys = {};
        for (const [slotId, item] of Object.entries(this.equippedItems)) {
            if (item) {
                equippedItemKeys[slotId] = item.name;
            }
        }
        return equippedItemKeys;
    },

    getEquippedWeaponKeys() {
        const equippedWeaponKeys = {};
        for (const [slotId, weapon] of Object.entries(this.equippedItems)) {
            if (weapon && (slotId === 'primary-weapon' || slotId === 'secondary-weapon')) {
                equippedWeaponKeys[slotId] = weapon.key || weapon.name;
            }
        }
        return equippedWeaponKeys;
    },

    getEquippedWeapons() {
        const equippedWeapons = {};
        for (const [slotId, item] of Object.entries(this.equippedItems)) {
            if (item && (slotId === 'primary-weapon' || slotId === 'secondary-weapon')) {
                equippedWeapons[slotId] = item.key || item.name; // Use key if available, otherwise use name
            }
        }
        return equippedWeapons;
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
