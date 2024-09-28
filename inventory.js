import ItemDatabaseModule from './itemDatabaseModule.js';
import EquipmentModule from './equipment.js';

const InventoryModule = {
    playerInventory: {},
    currentCategory: 'Weapons',

    async init() {
        console.log('Initializing InventoryModule');
        await ItemDatabaseModule.init();
        this.loadPlayerInventory();
        this.createItemDetailModal();
        this.setupEventListeners();
        this.displayInventory();
    },

    loadPlayerInventory() {
        // For now, we'll start with an empty inventory
        this.playerInventory = {};
    },

    createItemDetailModal() {
        let modal = document.getElementById('item-detail-modal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'item-detail-modal';
            modal.className = 'modal';
            modal.innerHTML = `
                <div class="modal-content">
                    <span class="close">&times;</span>
                    <h2 id="item-detail-title"></h2>
                    <div id="item-detail-content"></div>
                    <button id="equip-unequip-button"></button>
                </div>
            `;
            document.body.appendChild(modal);

            const closeButton = modal.querySelector('.close');
            closeButton.addEventListener('click', () => {
                modal.style.display = 'none';
            });

            window.addEventListener('click', (event) => {
                if (event.target == modal) {
                    modal.style.display = 'none';
                }
            });
        }
    },

    setupEventListeners() {
        const addToInventoryBtn = document.getElementById('add-to-inventory-btn');
        addToInventoryBtn.addEventListener('click', () => this.openAddItemModal());

        const addItemModal = document.getElementById('add-item-modal');
        const itemDetailModal = document.getElementById('item-detail-modal');
        const closeButtons = document.querySelectorAll('.modal .close');

        closeButtons.forEach(button => {
            button.addEventListener('click', () => {
                addItemModal.style.display = 'none';
                itemDetailModal.style.display = 'none';
            });
        });

        window.addEventListener('click', (event) => {
            if (event.target === addItemModal) {
                addItemModal.style.display = 'none';
            }
            if (event.target === itemDetailModal) {
                itemDetailModal.style.display = 'none';
            }
        });

        const tabButtons = document.querySelectorAll('.tab-button');
        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                this.currentCategory = button.dataset.category;
                this.updateActiveTab();
                this.displayItemList();
            });
        });

        const itemSearch = document.getElementById('item-search');
        itemSearch.addEventListener('input', () => this.displayItemList());
    },

    openAddItemModal() {
        const modal = document.getElementById('add-item-modal');
        modal.style.display = 'block';
        this.updateActiveTab();
        this.displayItemList();
    },

    updateActiveTab() {
        const tabs = document.querySelectorAll('.tab-button');
        tabs.forEach(tab => {
            if (tab.dataset.category === this.currentCategory) {
                tab.classList.add('active');
            } else {
                tab.classList.remove('active');
            }
        });
    },

    displayItemList() {
        const itemList = document.getElementById('item-list');
        const searchQuery = document.getElementById('item-search').value.toLowerCase();
    
        itemList.innerHTML = '';
    
        console.log('Current category:', this.currentCategory);
        const items = ItemDatabaseModule.getItemsByType(this.currentCategory === 'Crafting' ? 'CraftingComponents' : this.currentCategory);
    
        if (!items || items.length === 0) {
            itemList.innerHTML = '<p>No items found in this category.</p>';
            return;
        }
    
        items.forEach(item => {
            if (item && item.name && item.name.toLowerCase().includes(searchQuery)) {
                const itemElement = document.createElement('div');
                itemElement.classList.add('item-list-entry');
                itemElement.innerHTML = `
                    <span>${item.name}</span>
                    <input type="number" min="1" value="1" class="item-quantity">
                    <button class="add-item-btn">Add</button>
                    <button class="item-details-btn">Details</button>
                `;
    
                const addBtn = itemElement.querySelector('.add-item-btn');
                addBtn.addEventListener('click', () => {
                    const quantity = parseInt(itemElement.querySelector('.item-quantity').value);
                    this.addItem(item.key, quantity);
                });
    
                const detailsBtn = itemElement.querySelector('.item-details-btn');
                detailsBtn.addEventListener('click', () => this.showItemDetails(item.key));
    
                itemList.appendChild(itemElement);
            }
        });
    
        if (itemList.children.length === 0) {
            itemList.innerHTML = '<p>No items match your search.</p>';
        }
    },

    displayInventory() {
        const inventoryItems = document.getElementById('inventory-items');
        inventoryItems.innerHTML = '';

        console.log('Displaying inventory:', this.playerInventory);

        Object.entries(this.playerInventory).forEach(([itemKey, inventoryItem]) => {
            const item = ItemDatabaseModule.getItem(itemKey);
            console.log('Inventory item:', itemKey, item);
            if (item) {
                const itemCard = document.createElement('div');
                itemCard.classList.add('inventory-item-card');
                itemCard.innerHTML = `
                    <div class="item-name">${item.name}</div>
                    <div class="item-quantity">Quantity: ${inventoryItem.quantity}</div>
                `;
                itemCard.addEventListener('click', () => {
                    console.log('Item card clicked:', itemKey);
                    this.showItemDetails(itemKey);
                });
                inventoryItems.appendChild(itemCard);
            }
        });
    },

    addItem(itemKey, quantity = 1) {
        const item = ItemDatabaseModule.getItem(itemKey);
        if (item) {
            if (this.playerInventory[itemKey]) {
                this.playerInventory[itemKey].quantity += quantity;
            } else {
                this.playerInventory[itemKey] = { itemKey, quantity };
            }
            console.log(`Added ${quantity} ${item.name} to inventory`);
            this.displayInventory();
        } else {
            console.error(`Item ${itemKey} not found in the database`);
        }
    },

    showItemDetails(itemKey) {
        console.log('Showing details for item:', itemKey);
        const item = ItemDatabaseModule.getItem(itemKey);
        if (!item) {
            console.error(`Item ${itemKey} not found in the database`);
            return;
        }

        const modal = document.getElementById('item-detail-modal');
        if (!modal) {
            console.error('Item detail modal not found');
            return;
        }

        // Populate general info
        this.setElementText('item-detail-title', item.name || item.itemName);
        this.setElementText('item-rarity', item.rarity);
        this.setElementText('item-description', item.description);
        this.setElementText('item-type', item.itemType, 'Type');
        this.setElementText('item-subtype', item.weaponType || item.armorType, 'Subtype');

        // Populate item-specific info
        this.setElementText('item-effect', item.effect, 'Effect');
        this.setElementText('item-duration', item.duration, 'Duration');
        this.setElementText('item-range', item.range || item.Range, 'Range');
        this.setElementText('item-damage', item.damage || item.damageAmount, 'Damage');
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

        // Populate bonuses
        this.populateBonuses('item-vital-bonuses', item.vitalBonus || item.statBuffs, 'Vital Bonuses');
        this.populateBonuses('item-skill-bonuses', item.skillBonus || item.skillBuffs, 'Skill Bonuses');
        this.setElementText('item-hp-bonus', item.hpBonus || (item.hpBuffs && item.hpBuffs[0]), 'HP Bonus');
        this.setElementText('item-mp-bonus', item.mpBonus || (item.mpBuffs && item.mpBuffs[0]), 'MP Bonus');

        // Populate special properties
        this.setElementText('item-abilities', this.formatArray(item.abilities), 'Abilities');
        this.setElementText('item-traits', this.formatArray(item.traits), 'Traits');
        this.setElementText('item-spells-granted', this.formatArray(item.spellsGranted), 'Spells Granted');
        this.setElementText('item-additional-effects', this.formatArray(item.additionalEffects), 'Additional Effects');

        // Handle scroll-specific fields
        if (item.itemType === 'Scroll') {
            this.setElementText('item-scroll-scaling', item.Scaling, 'Scaling');
        }

        // Set up equip/unequip button
        const equipButton = document.getElementById('equip-unequip-button');
        if (equipButton) {
            equipButton.textContent = this.isItemEquipped(itemKey) ? 'Unequip' : 'Equip';
            equipButton.onclick = () => this.toggleEquipItem(itemKey);
            equipButton.style.display = 'block';
        }

        this.hideEmptySections();

        modal.style.display = 'block';
    },

    setElementText(elementId, value, label = '') {
        const element = document.getElementById(elementId);
        if (element) {
            if (this.isValidValue(value)) {
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
                        .filter(([key, value]) => this.isValidValue(value))
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
            return arr.filter(item => this.isValidValue(item)).join(', ');
        }
        return null;
    },

    isValidValue(value) {
        return value !== undefined &&
            value !== null &&
            value !== '' &&
            value !== 'N/A' &&
            value !== 'None' &&
            value !== 'Undefined' &&
            value !== '0' &&
            value !== 0 &&
            !(Array.isArray(value) && value.length === 0) &&
            !(typeof value === 'object' && Object.keys(value).length === 0);
    },

    hideEmptySections() {
        const sections = document.querySelectorAll('.item-detail-section');
        sections.forEach(section => {
            const visibleChildren = Array.from(section.children).filter(child =>
                child.tagName !== 'H3' && getComputedStyle(child).display !== 'none'
            );
            if (visibleChildren.length === 0) {
                section.style.display = 'none';
            } else {
                section.style.display = 'block';
            }
        });
    },

    isItemEquipped(itemKey) {
        return EquipmentModule.isItemEquipped(itemKey);
    },

    toggleEquipItem(itemKey) {
        const item = ItemDatabaseModule.getItem(itemKey);
        if (!item) return;

        if (this.isItemEquipped(itemKey)) {
            EquipmentModule.unequipItem(itemKey);
            this.addItem(itemKey, 1);
        } else {
            if (EquipmentModule.equipItem(itemKey)) {
                this.removeItem(itemKey, 1);
            }
        }

        // Update the button text
        const equipButton = document.getElementById('equip-unequip-button');
        if (equipButton) {
            equipButton.textContent = this.isItemEquipped(itemKey) ? 'Unequip' : 'Equip';
        }

        // Refresh the inventory display
        this.displayInventory();
    },

    removeItem(itemKey, quantity = 1) {
        if (this.playerInventory[itemKey]) {
            this.playerInventory[itemKey].quantity -= quantity;
            if (this.playerInventory[itemKey].quantity <= 0) {
                delete this.playerInventory[itemKey];
            }
            this.displayInventory();
        }
    },

    formatKey(key) {
        return key.split(/(?=[A-Z])/).join(' ').replace(/\b\w/g, l => l.toUpperCase());
    },

    formatValue(value) {
        if (Array.isArray(value)) {
            return value.join(', ');
        } else if (typeof value === 'object' && value !== null) {
            return Object.entries(value).map(([k, v]) => `${this.formatKey(k)}: ${v}`).join(', ');
        }
        return value;
    },

    getAllInventoryData() {
        return {
            playerInventory: this.playerInventory,
            currentCategory: this.currentCategory
        };
    },

    loadSavedData(data) {
        if (data) {
            this.playerInventory = data.playerInventory || {};
            this.currentCategory = data.currentCategory || 'Weapons';
            this.displayInventory();
        }
    },

    getInventoryItems() {
        return Object.entries(this.playerInventory).map(([itemKey, inventoryItem]) => ({
            name: itemKey,
            quantity: inventoryItem.quantity
        }));
    },
};

export default InventoryModule;