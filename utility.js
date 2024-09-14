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

    displayItemDetailModal(item, isEquipped, slotId) {
        const modal = document.getElementById('utility-item-detail-modal');
        if (!modal) {
            console.error('Utility item detail modal not found');
            return;
        }

        const content = modal.querySelector('.modal-content');
        if (!content) {
            console.error('Modal content not found');
            return;
        }

        content.innerHTML = `
            <span class="close">&times;</span>
            <div class="item-detail-header">
                <h2 id="utility-item-detail-title">${item.name || item.itemName || 'Unknown Item'}</h2>
                <p id="utility-item-rarity">${item.rarity || 'Common'}</p>
            </div>
            <div class="item-detail-body">
                <div class="item-image-container">
                    <img id="utility-item-image" src="${item.imageUrl || '/path/to/default/image.png'}" alt="${item.name || item.itemName}">
                </div>
                <div class="item-info">
                    ${this.formatField('Description', item.description)}
                    ${this.formatField('Type', item.itemType)}
                    <div class="item-stats">
                        ${this.formatField('Effect', item.effect)}
                        ${this.formatField('Duration', item.duration)}
                        ${this.formatField('Range', item.range)}
                        ${this.formatField('Damage', item.damage)}
                        ${this.formatField('Damage Type', item.damageType)}
                        ${this.formatField('Blast Radius', item.blastRadius)}
                        ${this.formatField('Trigger Mechanism', item.triggerMechanism)}
                        ${this.formatField('Casting Time', item.CastingTime)}
                        ${this.formatField('Mana Point Cost', item.ManaPointCost)}
                        ${this.formatField('Cooldown', item.Cooldown)}
                        ${this.formatField('Spell Casting Modifier', item.SpellCastingModifier)}
                    </div>
                    ${this.formatCollapsibleSection('Vital Bonuses', item.vitalBonus)}
                    ${this.formatCollapsibleSection('Skill Bonuses', item.skillBonus)}
                    ${this.formatCollapsibleSection('Abilities', item.abilities)}
                    ${this.formatCollapsibleSection('Traits', item.traits)}
                    ${this.formatCollapsibleSection('Stat Buffs', item.statBuffs)}
                    ${this.formatCollapsibleSection('Skill Buffs', item.skillBuffs)}
                    ${this.formatCollapsibleSection('HP Buffs', item.hpBuffs)}
                    ${this.formatCollapsibleSection('MP Buffs', item.mpBuffs)}
                    ${this.formatCollapsibleSection('Scaling', item.Scaling)}
                </div>
            </div>
            <div class="item-actions">
                <button id="utility-equip-unequip-button">${isEquipped ? 'Unequip' : 'Equip'}</button>
            </div>
        `;

        const equipButton = content.querySelector('#utility-equip-unequip-button');
        equipButton.onclick = () => {
            if (isEquipped) {
                this.unequipItem(slotId);
            } else {
                this.equipItem(item.name || item.itemName);
            }
            modal.style.display = 'none';
        };

        // Set up collapsible sections
        this.setupCollapsibles();

        modal.style.display = 'block';

        const closeButton = content.querySelector('.close');
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

    displayScrollDetailModal(scroll, isEquipped, slotId) {
        console.log('Displaying scroll details:', scroll);
    
        let modal = document.getElementById('utility-item-detail-modal');
        if (!modal) {
            console.log('Utility item detail modal not found, creating dynamically');
            modal = document.createElement('div');
            modal.id = 'utility-item-detail-modal';
            modal.className = 'modal';
            document.body.appendChild(modal);
        }
    
        let content = modal.querySelector('.modal-content');
        if (!content) {
            console.log('Modal content not found, creating dynamically');
            content = document.createElement('div');
            content.className = 'modal-content';
            modal.appendChild(content);
        }
    
        content.innerHTML = `
            <span class="close">&times;</span>
            <div class="item-detail-header">
                <h2 id="item-detail-title">${scroll.Name || 'Unknown Scroll'}</h2>
                <p id="item-rarity">${scroll.rarity || 'Common'}</p>
            </div>
            <div class="item-detail-body">
                <div class="item-image-container">
                    <img id="item-image" src="${scroll.imageUrl || '/path/to/default/scroll-image.png'}" alt="${scroll.Name}">
                </div>
                <div class="item-info">
                    ${this.formatField('Description', scroll.Description)}
                    ${this.formatField('Type', 'Scroll')}
                    <div class="item-stats">
                        ${this.formatField('Effect', scroll.Effect)}
                        ${this.formatField('Range', scroll.Range)}
                        ${this.formatField('Damage', scroll.Damage)}
                        ${this.formatField('Damage Type', scroll.DamageType)}
                        ${this.formatField('Casting Time', scroll.CastingTime)}
                        ${this.formatField('Mana Point Cost', scroll.ManaPointCost)}
                        ${this.formatField('Cooldown', scroll.Cooldown)}
                        ${this.formatField('Spell Casting Modifier', scroll.SpellCastingModifier)}
                    </div>
                    ${this.formatScrollScaling(scroll.Scaling)}
                </div>
            </div>
            <div class="item-actions">
                <button id="equip-unequip-button">${isEquipped ? 'Unequip' : 'Equip'}</button>
            </div>
        `;
    
        const equipButton = content.querySelector('#equip-unequip-button');
        equipButton.onclick = () => {
            if (isEquipped) {
                this.unequipItem(slotId);
            } else {
                this.equipItem(scroll.Name);
            }
            modal.style.display = 'none';
        };
    
        const closeButton = content.querySelector('.close');
        if (closeButton) {
            closeButton.onclick = () => {
                modal.style.display = 'none';
            };
        }
    
        this.setupCollapsibles();
    
        modal.style.display = 'block';
    
        window.onclick = (event) => {
            if (event.target == modal) {
                modal.style.display = 'none';
            }
        };
    },
    
    formatField(label, value) {
        if (value && value !== 'N/A' && value !== 0) {
            return `<div class="stat-group"><span class="stat-label">${label}:</span> <span class="stat-value">${value}</span></div>`;
        }
        return '';
    },
    
    formatScrollScaling(scaling) {
        if (scaling && scaling.length > 0) {
            return `
                <div class="collapsible-section">
                    <button class="collapsible">Scaling</button>
                    <div class="collapsible-content">
                        <p>${scaling.replace(/<br>/g, '<br>')}</p>
                    </div>
                </div>
            `;
        }
        return '';
    },
    
    setupCollapsibles() {
        const collapsibles = document.getElementsByClassName('collapsible');
        for (let i = 0; i < collapsibles.length; i++) {
            collapsibles[i].addEventListener('click', function() {
                this.classList.toggle('active');
                const content = this.nextElementSibling;
                if (content.style.maxHeight) {
                    content.style.maxHeight = null;
                } else {
                    content.style.maxHeight = content.scrollHeight + "px";
                }
            });
        }
    },
    
    formatCollapsibleSection(title, data) {
        if (data && data.length > 0) {
            return `
                <div class="collapsible-section">
                    <button class="collapsible">${title}</button>
                    <div class="collapsible-content">
                        <p>${data.replace(/<br>/g, '<br>')}</p>
                    </div>
                </div>
            `;
        }
        return '';
    },

    formatStat(label, value) {
        if (value && value !== 'N/A') {
            return `<div class="stat-group"><span class="stat-label">${label}:</span> <span class="stat-value">${value}</span></div>`;
        }
        return '';
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