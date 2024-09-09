import ActionModule from './actionModule.js';

const UtilityModule = {
    utilityItems: {},
    itemTypes: new Set(),

    init() {
        console.log('Initializing UtilityModule');
        this.loadUtilityItems().then(() => {
            console.log('Utility items loaded');
            this.setupEventListeners();
            this.initializeUtilitySlots();
            this.populateItemTypeFilter();
        });
    },

    loadUtilityItems() {
        const files = ['throwables.json', 'explosives.json', 'potions.json', 'scrolls.json', 'ammunition.json', 'crafting_components.json', 'traps.json'];
        return Promise.all(files.map(file => fetch(file).then(response => response.json())))
            .then(data => {
                data.forEach(json => {
                    this.processJsonData(json);
                });
                console.log('Utility items loaded:', this.utilityItems);
            })
            .catch(error => console.error('Error loading utility items:', error));
    },

    processJsonData(json) {
        const processItem = (key, item) => {
            if (typeof item === 'object' && item !== null) {
                if (item.name || item.Name || item.itemName) {
                    item.name = item.name || item.Name || item.itemName;
                    item.itemType = item.itemType || this.getItemTypeFromKey(key);
                    item.abilities = Array.isArray(item.abilities) ? item.abilities : [];
                    this.utilityItems[key] = item;
                    this.itemTypes.add(item.itemType);
                } else {
                    Object.entries(item).forEach(([subKey, subItem]) => {
                        processItem(subKey, subItem);
                    });
                }
            }
        };

        Object.entries(json).forEach(([key, value]) => {
            processItem(key, value);
        });
    },

    getItemTypeFromKey(key) {
        if (key.startsWith('Scroll-')) return 'Scroll';
        if (key.toLowerCase().includes('explosive')) return 'Explosive';
        if (key.toLowerCase().includes('throwable')) return 'Throwable';
        if (key.toLowerCase().includes('potion')) return 'Potion';
        if (key.toLowerCase().includes('ammunition')) return 'Ammunition';
        if (key.toLowerCase().includes('trap')) return 'Trap';
        return 'Utility';
    },

    createUtilityCard(key, item) {
        const card = document.createElement('div');
        card.className = 'utility-card';
        card.innerHTML = `
            <h3 title="${item.name}">${item.name}</h3>
            <p>${item.itemType || 'Unknown type'}</p>
            <div class="utility-card-buttons">
                <button class="equip-btn" data-item-key="${key}">Equip</button>
                <button class="details-btn" data-item-key="${key}">Details</button>
            </div>
        `;

        const equipButton = card.querySelector('.equip-btn');
        equipButton.addEventListener('click', () => {
            console.log('Equip button clicked for item:', key);
            this.equipItem(key);
        });

        const detailsButton = card.querySelector('.details-btn');
        detailsButton.addEventListener('click', () => {
            console.log('Details button clicked for item:', key);
            this.showItemDetails(key);
        });

        return card;
    },

    setupEventListeners() {
        console.log('Setting up event listeners for UtilityModule');
        document.querySelectorAll('.equipment-slot[id^="utility-slot-"]').forEach(slot => {
            slot.addEventListener('click', (event) => {
                event.stopPropagation();
                this.handleSlotClick(event.currentTarget);
            });
        });
        const utilityModal = document.getElementById('utility-modal');
        const itemDetailModal = document.getElementById('item-detail-modal');

        if (utilityModal) {
            utilityModal.querySelector('.close').addEventListener('click', () => this.closeModals());
            const searchInput = utilityModal.querySelector('#utility-search');
            if (searchInput) {
                searchInput.addEventListener('input', () => this.filterUtilityItems());
            }
            const typeFilter = utilityModal.querySelector('#utility-type-filter');
            if (typeFilter) {
                typeFilter.addEventListener('change', () => this.filterUtilityItems());
            }
        }
        if (itemDetailModal) {
            itemDetailModal.querySelector('.close').addEventListener('click', () => this.closeModals());
        }

        window.addEventListener('click', (event) => {
            if (event.target.classList.contains('modal')) {
                this.closeModals();
            }
        });
    },

    handleSlotClick(slot) {
        console.log('Utility slot clicked:', slot.id);
        const equippedItemKey = slot.dataset.equippedItem;
        if (equippedItemKey) {
            this.showItemDetails(equippedItemKey, slot.id);
        } else {
            this.showUtilityModal();
        }
    },

    showUtilityModal() {
        console.log('Showing utility modal');
        const modal = document.getElementById('utility-modal');
        const container = document.getElementById('utility-cards-container');
        const searchInput = document.getElementById('utility-search');
        const typeFilter = document.getElementById('utility-type-filter');

        if (!modal || !container || !searchInput || !typeFilter) {
            console.error('Modal, container, search input, or type filter not found');
            return;
        }

        searchInput.value = '';
        typeFilter.value = '';
        container.innerHTML = '';
        container.className = 'utility-cards-grid';

        this.displayUtilityItems(this.utilityItems);

        modal.style.display = 'block';
    },

    filterUtilityItems() {
        const searchQuery = document.getElementById('utility-search').value.toLowerCase();
        const selectedType = document.getElementById('utility-type-filter').value;

        const filteredItems = Object.entries(this.utilityItems).reduce((acc, [key, item]) => {
            const matchesSearch = item.name.toLowerCase().includes(searchQuery);
            const matchesType = selectedType === '' || item.itemType === selectedType;
            if (matchesSearch && matchesType) {
                acc[key] = item;
            }
            return acc;
        }, {});

        this.displayUtilityItems(filteredItems);
    },

    displayUtilityItems(items) {
        const container = document.getElementById('utility-cards-container');
        if (!container) {
            console.error('Utility cards container not found');
            return;
        }

        container.innerHTML = '';
        if (Object.keys(items).length === 0) {
            container.innerHTML = '<p>No matching utility items found</p>';
            return;
        }

        for (const [key, item] of Object.entries(items)) {
            const card = this.createUtilityCard(key, item);
            container.appendChild(card);
        }
    },

    populateItemTypeFilter() {
        const typeFilter = document.getElementById('utility-type-filter');
        if (typeFilter) {
            typeFilter.innerHTML = '<option value="">All Types</option>';
            this.itemTypes.forEach(type => {
                const option = document.createElement('option');
                option.value = type;
                option.textContent = type;
                typeFilter.appendChild(option);
            });
        }
    },

    initializeUtilitySlots() {
        console.log('Initializing utility slots');
        document.querySelectorAll('.equipment-slot[id^="utility-slot-"]').forEach(slot => {
            const equippedItemKey = slot.dataset.equippedItem;
            if (equippedItemKey && this.utilityItems[equippedItemKey]) {
                console.log('Initializing slot:', slot.id, 'with item:', equippedItemKey);
                this.updateSlotContent(slot, equippedItemKey);
            }
        });
    },

    findEmptyUtilitySlot() {
        const slots = document.querySelectorAll('.equipment-slot[id^="utility-slot-"]');
        for (let slot of slots) {
            const slotContent = slot.querySelector('.equipment-slot-content');
            if (!slotContent || slotContent.textContent.trim() === '') {
                console.log('Found empty slot:', slot.id);
                return slot;
            }
        }
        console.log('No empty slots found');
        return null;
    },

    equipItem(itemKey) {
        console.log('equipItem called with key:', itemKey);
        const item = this.utilityItems[itemKey];
        console.log('Equipping item:', item);

        const emptySlot = this.findEmptyUtilitySlot();
        if (emptySlot) {
            console.log('Equipping item to slot:', emptySlot.id);
            this.updateSlotContent(emptySlot, itemKey);
            if (item.itemType.toLowerCase() === 'scroll') {
                ActionModule.addAction({
                    ...item,
                    type: 'scroll'
                });
            } else {
                ActionModule.addAction(item);
            }
            this.closeModals();
        } else {
            console.error('No empty utility slots available');
            alert('No empty utility slots available. Please unequip an item first.');
        }
    },

    unequipItem(slotId) {
        const slot = document.getElementById(slotId);
        if (slot) {
            const itemKey = slot.dataset.equippedItem;
            if (itemKey) {
                const item = this.utilityItems[itemKey];
                if (item) {
                    ActionModule.removeAction(item.name);
                }
            }
            const slotContent = slot.querySelector('.equipment-slot-content');
            if (slotContent) {
                slotContent.textContent = '';
            }
            slot.dataset.equippedItem = '';
            console.log(`Unequipped item from slot ${slotId}`);
        }
        this.closeModals();
    },

    updateSlotContent(slot, itemKey) {
        const item = this.utilityItems[itemKey];
        let slotContent = slot.querySelector('.equipment-slot-content');
        if (!slotContent) {
            slotContent = document.createElement('div');
            slotContent.className = 'equipment-slot-content';
            slot.appendChild(slotContent);
        }
        slotContent.textContent = item.name;

        if (item.count && item.count > 1) {
            const countElement = document.createElement('span');
            countElement.className = 'equipment-slot-count';
            countElement.textContent = item.count;
            slotContent.appendChild(countElement);
        }
        slot.dataset.equippedItem = itemKey;
        console.log(`Updated slot ${slot.id} with item ${itemKey}`);
    },

    showItemDetails(itemKey, slotId) {
        console.log('showItemDetails called with key:', itemKey);
        const item = this.utilityItems[itemKey];
        if (!item) {
            console.error(`Item with key ${itemKey} not found`);
            return;
        }
        console.log('Item details:', item);
        if (item.itemType === 'Scroll') {
            this.displayScrollDetailModal(item, !!slotId, slotId);
        } else {
            this.displayItemDetailModal(item, !!slotId, slotId);
        }
    },

    displayScrollDetailModal(scroll, isEquipped, slotId) {
        const modal = document.getElementById('utility-item-detail-modal');
        if (!modal) {
            console.error('Utility item detail modal not found');
            return;
        }

        document.getElementById('utility-item-detail-title').textContent = scroll.Name || 'Unknown Scroll';
        document.getElementById('utility-item-rarity').textContent = scroll.rarity || 'N/A';
        document.getElementById('utility-item-description').textContent = scroll.Description || 'No description available';
        document.getElementById('utility-item-type').textContent = `Type: Scroll`;
        document.getElementById('utility-item-effect').textContent = `Effect: ${scroll.Effect || 'N/A'}`;
        document.getElementById('utility-item-duration').textContent = `Duration: ${scroll.duration || 'N/A'}`;
        document.getElementById('utility-item-range').textContent = `Range: ${scroll.Range || 'N/A'}`;
        document.getElementById('utility-item-damage').textContent = `Damage: ${scroll.Damage || 'N/A'}`;
        document.getElementById('utility-item-damage-type').textContent = `Damage Type: ${scroll.DamageType || 'N/A'}`;
        document.getElementById('utility-item-casting-time').textContent = `Casting Time: ${scroll.CastingTime || 'N/A'}`;
        document.getElementById('utility-item-cooldown').textContent = `Cooldown: ${scroll.Cooldown || 'N/A'}`;
        document.getElementById('utility-item-spell-modifier').textContent = `Spell Casting Modifier: ${scroll.SpellCastingModifier || 'N/A'}`;

        this.updateBonusesSection(scroll);

        document.getElementById('utility-item-abilities').textContent = `Abilities: ${this.formatArray(scroll.abilities)}`;
        document.getElementById('utility-item-traits').textContent = `Traits: ${this.formatArray(scroll.traits)}`;

        const equipButton = document.getElementById('utility-equip-unequip-button');
        equipButton.textContent = isEquipped ? 'Unequip' : 'Equip';
        equipButton.onclick = () => {
            if (isEquipped) {
                this.unequipItem(slotId);
            } else {
                this.equipItem(scroll.Name);
            }
            modal.style.display = 'none';
        };

        modal.style.display = 'block';

        const closeButton = modal.querySelector('.close');
        if (closeButton) {
            closeButton.onclick = () => {
                modal.style.display = 'none';
            };
        }

        window.onclick = (event) => {
            if (event.target == modal) {
                modal.style.display = 'none';
            }
        };
    },

    displayItemDetailModal(item, isEquipped, slotId) {
        const modal = document.getElementById('utility-item-detail-modal');
        if (!modal) {
            console.error('Utility item detail modal not found');
            return;
        }

        document.getElementById('utility-item-detail-title').textContent = item.name || 'Unknown Item';
        document.getElementById('utility-item-rarity').textContent = item.rarity || 'N/A';
        document.getElementById('utility-item-description').textContent = item.description || 'No description available';
        document.getElementById('utility-item-type').textContent = `Type: ${item.itemType || 'Unknown'}`;
        document.getElementById('utility-item-effect').textContent = `Effect: ${item.effect || 'N/A'}`;
        document.getElementById('utility-item-duration').textContent = `Duration: ${item.duration || 'N/A'}`;
        document.getElementById('utility-item-range').textContent = `Range: ${item.range || 'N/A'}`;

        this.updateBonusesSection(item);

        document.getElementById('utility-item-abilities').textContent = `Abilities: ${this.formatArray(item.abilities)}`;
        document.getElementById('utility-item-traits').textContent = `Traits: ${this.formatArray(item.traits)}`;

        const equipButton = document.getElementById('utility-equip-unequip-button');
        equipButton.textContent = isEquipped ? 'Unequip' : 'Equip';
        equipButton.onclick = () => {
            if (isEquipped) {
                this.unequipItem(slotId);
            } else {
                this.equipItem(item.name);
            }
            modal.style.display = 'none';
        };

        modal.style.display = 'block';

        const closeButton = modal.querySelector('.close');
        if (closeButton) {
            closeButton.onclick = () => {
                modal.style.display = 'none';
            };
        }

        window.onclick = (event) => {
            if (event.target == modal) {
                modal.style.display = 'none';
            }
        };
    },

    updateBonusesSection(item) {
        const vitalBonusesElement = document.getElementById('utility-item-vital-bonuses');
        const skillBonusesElement = document.getElementById('utility-item-skill-bonuses');

        vitalBonusesElement.innerHTML = '<h4>Vital Bonuses:</h4>';
        if (item.vitalBonus && Object.keys(item.vitalBonus).length > 0) {
            for (const [vital, bonus] of Object.entries(item.vitalBonus)) {
                vitalBonusesElement.innerHTML += `<p>${vital}: +${bonus}</p>`;
            }
        } else {
            vitalBonusesElement.innerHTML += '<p>None</p>';
        }

        skillBonusesElement.innerHTML = '<h4>Skill Bonuses:</h4>';
        if (item.skillBonus && Object.keys(item.skillBonus).length > 0) {
            for (const [skill, bonus] of Object.entries(item.skillBonus)) {
                skillBonusesElement.innerHTML += `<p>${skill}: +${bonus}</p>`;
            }
        } else {
            skillBonusesElement.innerHTML += '<p>None</p>';
        }

        document.getElementById('utility-item-hp-bonus').textContent = `HP Bonus: ${item.hpBonus || 0}`;
        document.getElementById('utility-item-mp-bonus').textContent = `MP Bonus: ${item.mpBonus || 0}`;
    },

    formatArray(arr) {
        if (Array.isArray(arr) && arr.length > 0) {
            return arr.join(', ');
        }
        return 'None';
    },

    formatValue(value) {
        if (Array.isArray(value)) {
            return value.join(', ');
        } else if (typeof value === 'object' && value !== null) {
            return Object.entries(value).map(([k, v]) => `${k}: ${v}`).join(', ');
        }
        return value;
    },

    debugUtilitySlots() {
        const slots = document.querySelectorAll('.equipment-slot[id^="utility-slot-"]');
        console.log('Debugging utility slots:');
        slots.forEach(slot => {
            const slotContent = slot.querySelector('.equipment-slot-content');
            console.log(`Slot ${slot.id}:`, {
                content: slotContent ? slotContent.textContent : 'No content div',
                equippedItem: slot.dataset.equippedItem || 'None'
            });
        });
    },

    closeModals() {
        console.log('Closing modals');
        document.querySelectorAll('.modal').forEach(modal => {
            modal.style.display = 'none';
        });
    }
};

export default UtilityModule;