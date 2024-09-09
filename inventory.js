import ItemDatabaseModule from './itemDatabaseModule.js';
import EquipmentModule from './equipment.js';

const InventoryModule = {
    playerInventory: {},
    currentCategory: 'Weapons',

    async init() {
        console.log('Initializing InventoryModule');
        await ItemDatabaseModule.init();
        this.loadPlayerInventory();
        this.setupEventListeners();
        this.displayInventory();
    },

    loadPlayerInventory() {
        // For now, we'll start with an empty inventory
        this.playerInventory = {};
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
        const items = ItemDatabaseModule.getItemsByType(this.currentCategory);
        
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
                    this.addItem(item.key, quantity);  // Use item.key instead of item.name
                });
    
                const detailsBtn = itemElement.querySelector('.item-details-btn');
                detailsBtn.addEventListener('click', () => this.showItemDetails(item.key));  // Use item.key instead of item.name
    
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
        const modalItemName = document.getElementById('item-detail-title');
        const modalItemDetails = document.getElementById('item-detail-content');
    
        if (!modal || !modalItemName || !modalItemDetails) {
            console.error('One or more modal elements not found');
            return;
        }
    
        modalItemName.textContent = item.name;
        modalItemDetails.innerHTML = '';
    
        for (const [key, value] of Object.entries(item)) {
            if (key !== 'name') {
                const detailElement = document.createElement('p');
                detailElement.innerHTML = `<strong>${key}:</strong> ${value}`;
                modalItemDetails.appendChild(detailElement);
            }
        }
    
        // Add Equip/Unequip button
        const equipButton = document.createElement('button');
        equipButton.id = 'equip-unequip-button';
        equipButton.textContent = this.isItemEquipped(itemKey) ? 'Unequip' : 'Equip';
        equipButton.addEventListener('click', () => this.toggleEquipItem(itemKey));
        modalItemDetails.appendChild(equipButton);
    
        modal.style.display = 'block';
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

    getItemDetailsForCategory(item) {
        switch (item.itemType.toLowerCase()) {
            case 'armor':
                return this.getArmorDetails(item);
            case 'weapons':
                return this.getWeaponDetails(item);
            case 'potions':
                return this.getPotionDetails(item);
            case 'scrolls':
                return this.getScrollDetails(item);
            case 'throwables':
                return this.getThrowableDetails(item);
            case 'explosives':
                return this.getExplosiveDetails(item);
            case 'crafting components':
                return this.getCraftingComponentDetails(item);
            case 'ammunition':
                return this.getAmmunitionDetails(item);
            default:
                return item;
        }
    },

    getArmorDetails(item) {
        return {
            name: item.name,
            armorType: item.armorType,
            armorRating: item.armorRating,
            tankModifier: item.tankModifier,
            vitalBonus: item.vitalBonus,
            skillBonus: item.skillBonus,
            hpBonus: item.hpBonus,
            mpBonus: item.mpBonus,
            abilities: item.abilities,
            traits: item.traits,
            spellsGranted: item.spellsGranted,
            description: item.description
        };
    },

    getWeaponDetails(item) {
        return {
            name: item.name,
            damageType: item.damageType,
            damageAmount: item.damageAmount,
            vitalBonus: item.vitalBonus,
            skillBonus: item.skillBonus,
            hpBonus: item.hpBonus,
            mpBonus: item.mpBonus,
            abilities: item.abilities,
            traits: item.traits,
            spellsGranted: item.spellsGranted,
            description: item.description
        };
    },

    getPotionDetails(item) {
        return {
            name: item.name,
            description: item.description,
            effect: item.effect,
            duration: item.duration,
            range: item.range,
            vitalBonus: item.vitalBonus,
            skillBonus: item.skillBonus,
            hpBonus: item.hpBonus,
            mpBonus: item.mpBonus,
            abilities: item.abilities,
            traits: item.traits,
            spellsGranted: item.spellsGranted
        };
    },

    getScrollDetails(item) {
        return {
            name: item.name,
            description: item.description,
            effect: item.effect,
            range: item.range,
            damageType: item.damageType,
            damage: item.damage,
            castingTime: item.castingTime,
            abilityPointCost: item.abilityPointCost,
            cooldown: item.cooldown,
            scaling: item.scaling,
            spellCastingModifier: item.spellCastingModifier
        };
    },

    getThrowableDetails(item) {
        return {
            name: item.name,
            description: item.description,
            effect: item.effect,
            duration: item.duration,
            range: item.range
        };
    },

    getExplosiveDetails(item) {
        return {
            name: item.name,
            description: item.description,
            effect: item.effect,
            duration: item.duration,
            range: item.range,
            damageType: item.damageType,
            damage: item.damage,
            blastRadius: item.blastRadius,
            triggerMechanism: item.triggerMechanism
        };
    },

    getCraftingComponentDetails(item) {
        return {
            name: item.name,
            description: item.description,
            rarity: item.rarity
        };
    },

    getAmmunitionDetails(item) {
        return {
            name: item.name,
            effect: item.effect,
            additionalEffects: item.additionalEffects
        };
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
};

export default InventoryModule;