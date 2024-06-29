document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Fetch data from various JSON files
        const [racesData, classesData, uniqueAbilitiesData, buffsData, spellsData, weaponsData, armorData, itemsData, explosivesAmmoData] = await Promise.all([
            fetch('races.json').then(response => response.json()),
            fetch('classes.json').then(response => response.json()),
            fetch('uniqueAbilities.json').then(response => response.json()),
            fetch('buffs.json').then(response => response.json()),
            fetch('spells.json').then(response => response.json()),
            fetch('weapons.json').then(response => response.json()),
            fetch('armor.json').then(response => response.json()),
            fetch('items.json').then(response => response.json()),
            fetch('explosives-ammunition-json.json').then(response => response.json())
        ]);

        // Store fetched data in global window object
        window.races = racesData;
        window.classes = classesData;
        window.uniqueAbilities = uniqueAbilitiesData;
        window.buffs = buffsData;
        window.spells = spellsData;

        // Initialize items with both weapons and armor data
        window.items = { 
            ...weaponsData.weapons, 
            ...armorData.armor, 
            ...itemsData.items, 
            ...explosivesAmmoData.explosives, 
            ...explosivesAmmoData["Arrow of Enthusiastic Double Gonorrhea"]
        };

        // Populate dropdowns and setup event listeners
        const raceSelect = document.getElementById('char-race');
        const classSelect = document.getElementById('char-class');
        populateSelectOptions(raceSelect, window.races);
        populateSelectOptions(classSelect, window.classes);
        raceSelect.addEventListener('change', () => updateRace(window.races));
        classSelect.addEventListener('change', () => updateClass(window.classes));

        // Additional initializations and event listeners
        attachEditableFields();
        populateSkills();
        document.getElementById('skill-points').innerText = '25'; // Set initial skill points to 25
        initializeEquipment();

        // Event listeners for inventory and item search functionalities
        document.getElementById('add-to-inventory-btn').addEventListener('click', openSearchModal);
        document.getElementById('open-inventory-btn').addEventListener('click', openInventoryModal);
        document.getElementById('item-search').addEventListener('input', searchItems);

        // Further initializations
        debugArmorTypes();
        loadInventory();
        initializeDetailsButtons();  // This function will set up modal event listeners for dynamic data
        updateAttackSection();
    } catch (error) {
        console.error('Error loading data:', error);
    }
});


let inventory = [];
let equippedItems = {
    'primary-weapon': [],
    'secondary-weapon': [],
    'headgear': [],
    'face-accessory': [],
    'neck': [],
    'shoulders': [],
    'torso': [],
    'arms': [],
    'hands': [],
    'waist': [],
    'legs': [],
    'feet': [],
    'fingers': [],
    'utility': []
};
let weaponBuffs = [];



function initializeEquipment() {
    const equipmentSlots = document.querySelectorAll('.equipment-slot, .utility-slot');
    equipmentSlots.forEach(slot => {
        slot.addEventListener('click', () => {
            const slotName = slot.dataset.slot;
            openEquipmentModal(slotName);
        });
    });

    // Initialize utility slot buttons
    const utilitySlots = document.querySelectorAll('.utility-slot');
    utilitySlots.forEach(slot => {
        const incrementBtn = slot.querySelector('.increment');
        const decrementBtn = slot.querySelector('.decrement');
        
        if (incrementBtn) {
            incrementBtn.addEventListener('click', (event) => {
                event.stopPropagation(); // Prevent opening the modal
                incrementUtilityItem(slot.dataset.slot);
            });
        }
        
        if (decrementBtn) {
            decrementBtn.addEventListener('click', (event) => {
                event.stopPropagation(); // Prevent opening the modal
                decrementUtilityItem(slot.dataset.slot);
            });
        }
    });
}

function initializeDetailsButtons() {
    document.querySelectorAll('.buff .details-btn').forEach(button => {
        button.addEventListener('click', function() {
            const buffName = this.getAttribute('data-buff-name');
            openBuffModal(buffName);
        });
    });

    document.querySelectorAll('.ability .details-btn').forEach(button => {
        button.addEventListener('click', function() {
            const abilityName = this.getAttribute('data-ability-name');
            openAbilityModal(abilityName);
        });
    });
}

function debugArmorTypes() {
    console.log("Debugging Armor Types:");
    const armorTypes = new Set();
    Object.values(window.items).forEach(item => {
        if (item.itemType === 'Armor') {
            armorTypes.add(item.armorType);
        }
    });
    console.log("Unique Armor Types found:", Array.from(armorTypes));
}

function updateStatPoints(statElement, change) {
    const statPointsElement = document.getElementById('stat-points');
    let currentPoints = parseInt(statPointsElement.innerText);
    let currentStatValue = parseInt(statElement.innerText);
    let maxStatValue = 15; // Maximum stat value at character creation

    if (change > 0 && currentPoints >= change) {
        let newValue = Math.min(currentStatValue + change, maxStatValue);
        let actualChange = newValue - currentStatValue;
        statElement.innerText = newValue;
        statPointsElement.innerText = currentPoints - actualChange;
    } else if (change < 0 && currentStatValue + change >= 0) {
        statElement.innerText = currentStatValue + change;
        statPointsElement.innerText = currentPoints - change;
    }
}


function updateSkillPoints(skillElement, change) {
    const skillPointsElement = document.getElementById('skill-points');
    let currentPoints = parseInt(skillPointsElement.innerText);
    let currentSkillValue = parseInt(skillElement.innerText);

    if (change > 0) {
        let costToIncrease = calculateSkillIncreaseCost(currentSkillValue, change);
        if (currentPoints >= costToIncrease) {
            skillElement.innerText = currentSkillValue + change;
            skillPointsElement.innerText = currentPoints - costToIncrease;
        }
    } else if (change < 0 && currentSkillValue + change >= 0) {
        let refund = calculateSkillIncreaseCost(currentSkillValue + change, -change);
        skillElement.innerText = currentSkillValue + change;
        skillPointsElement.innerText = currentPoints + refund;
    }
}

function updateClass(classes) {
    const selectedClassName = document.getElementById('char-class').value;
    const selectedClass = classes[selectedClassName];
    const selectedRaceName = document.getElementById('char-race').value;
    const selectedRace = window.races[selectedRaceName];

    if (!selectedClass) {
        console.error('No class selected or class not found');
        return;
    }

    // Display class information
    displayClassInfo(selectedClassName, selectedClass);

    // Reset stats to base values before applying new bonuses
    resetCharacterSheet();

    // Apply race bonuses (in case they were reset)
    if (selectedRace) {
        applyRaceBonuses(selectedRace);
    }

    // Apply class bonuses
    applyStatBonuses(selectedClass.statBonus);
    applyArApBonuses(selectedClass.statBonus);
    applyHpMpBonuses(selectedClass.hpBonus, selectedClass.mpBonus);
    applySkillBonuses(selectedClass.skillBonus);

    // Display unique abilities
    displayUniqueAbilities(selectedClass.uniqueAbilities, 'class');

    // Display buffs
    if (selectedClass.buffs) {
        displayBuffs(selectedClass.buffs);
    }

    // Display spells
    if (selectedClass.spells) {
        displaySpells(selectedClass.spells);
    }

    // Update derived stats
    updateDerivedStats();

    // Store the currently selected class for future reference
    window.previousSelectedClass = selectedClassName;

    console.log(`Class updated to ${selectedClassName}`);
}

function calculateSkillIncreaseCost(currentLevel, increase) {
    let cost = 0;
    for (let i = 0; i < increase; i++) {
        cost += currentLevel + i + 1;
    }
    return cost;
}

function openClassModal(className) {
    const classData = window.classes[className];
    const modalContent = document.getElementById('class-modal-content');
    modalContent.innerHTML = `
        <span class="close" onclick="closeModal()">&times;</span>
        <h2>${className}</h2>
        <p>${classData.description}</p>
        <h3>Stat Bonuses</h3>
        <p>${JSON.stringify(classData.statBonus)}</p>
        <h3>Skill Bonuses</h3>
        <p>${JSON.stringify(classData.skillBonus)}</p>
        <!-- Add more class details as needed -->
    `;
    document.getElementById('class-modal').style.display = 'block';
}

function updateEquipmentHTML() {
    const equipmentContainer = document.querySelector('.equipment-grid');
    if (!equipmentContainer) {
        console.error('Equipment grid container not found');
        return;
    }
    equipmentContainer.innerHTML = `
        <div class="equipment-slot" data-slot="utility" data-count="9">
            <h3>Utility (9)</h3>
            <div class="item-list"></div>
        </div>
        <div class="equipment-slot" data-slot="primary-weapon" data-count="2">
            <h3>Primary Weapon (2)</h3>
            <div class="item-list"></div>
        </div>
        <div class="equipment-slot" data-slot="secondary-weapon" data-count="2">
            <h3>Secondary Weapon (2)</h3>
            <div class="item-list"></div>
        </div>
        <div class="equipment-slot" data-slot="headgear" data-count="1">
            <h3>Headgear (1)</h3>
            <div class="item-list"></div>
        </div>
        <div class="equipment-slot" data-slot="face-accessory" data-count="1">
            <h3>Face Accessory (1)</h3>
            <div class="item-list"></div>
        </div>
        <div class="equipment-slot" data-slot="neck" data-count="1">
            <h3>Neck (1)</h3>
            <div class="item-list"></div>
        </div>
        <div class="equipment-slot" data-slot="shoulders" data-count="1">
            <h3>Shoulders (1)</h3>
            <div class="item-list"></div>
        </div>
        <div class="equipment-slot" data-slot="torso" data-count="1">
            <h3>Torso (1)</h3>
            <div class="item-list"></div>
        </div>
        <div class="equipment-slot" data-slot="arms" data-count="1">
            <h3>Arms (1)</h3>
            <div class="item-list"></div>
        </div>
        <div class="equipment-slot" data-slot="hands" data-count="1">
            <h3>Hands (1)</h3>
            <div class="item-list"></div>
        </div>
        <div class="equipment-slot" data-slot="waist" data-count="1">
            <h3>Waist (1)</h3>
            <div class="item-list"></div>
        </div>
        <div class="equipment-slot" data-slot="legs" data-count="1">
            <h3>Legs (1)</h3>
            <div class="item-list"></div>
        </div>
        <div class="equipment-slot" data-slot="feet" data-count="1">
            <h3>Feet (1)</h3>
            <div class="item-list"></div>
        </div>
        <div class="equipment-slot" data-slot="fingers" data-count="4">
            <h3>Fingers (4)</h3>
            <div class="item-list"></div>
        </div>
    `;
}

function incrementUtilityItem(slotName) {
    const slot = document.querySelector(`[data-slot="${slotName}"]`);
    const itemElement = slot.querySelector('.equipment-item');
    if (itemElement) {
        let quantity = parseInt(itemElement.dataset.quantity) || 1;
        itemElement.dataset.quantity = quantity + 1;
        itemElement.textContent = `${itemElement.textContent.split(' (')[0]} (${quantity + 1})`;
    }
}

function decrementUtilityItem(slotName) {
    const slot = document.querySelector(`[data-slot="${slotName}"]`);
    const itemElement = slot.querySelector('.equipment-item');
    if (itemElement) {
        let quantity = parseInt(itemElement.dataset.quantity) || 1;
        if (quantity > 1) {
            itemElement.dataset.quantity = quantity - 1;
            itemElement.textContent = `${itemElement.textContent.split(' (')[0]} (${quantity - 1})`;
        } else {
            itemElement.remove();
        }
    }
}

function isItemValidForSlot(item, slotName) {
    if (item.itemType === 'Weapon') {
        return slotName === 'primary-weapon' || slotName === 'secondary-weapon';
    } else if (item.itemType === 'Armor') {
        const armorTypeToSlot = {
            'Face Accessory': 'face-accessory',
            'Neck': 'neck',
            'Fingers': ['finger-1', 'finger-2', 'finger-3', 'finger-4'],
            'Headgear': 'headgear',
            'Shoulders': 'shoulders',
            'Torso': 'torso',
            'Arms': 'arms',
            'Hands': ['l-hand', 'r-hand'],
            'Waist': 'waist',
            'Legs': 'legs',
            'Feet': ['l-foot', 'r-foot'],
            'Wrists': ['l-hand', 'r-hand']
        };
        
        const mappedSlot = armorTypeToSlot[item.armorType];
        if (Array.isArray(mappedSlot)) {
            return mappedSlot.includes(slotName);
        }
        return mappedSlot === slotName;
    } else if (slotName.startsWith('utility-')) {
        return ['Throwable', 'Scroll', 'Potion', 'Crafting Component'].includes(item.itemType);
    }
    
    return false;
}

function renderPropertyList(obj, title) {
    if (!obj || Object.keys(obj).length === 0) return '';

    const items = Object.entries(obj)
        .map(([key, value]) => {
            const displayValue = typeof value === 'object' && value.description ? value.description : value;
            if (displayValue && displayValue !== '0' && displayValue !== 'None' && displayValue !== 'N/A') {
                return `<li>${key}: ${displayValue}</li>`;
            }
            return '';
        })
        .filter(item => item !== '')
        .join('');

    return items ? `<h3>${title}</h3><ul>${items}</ul>` : '';
}

function createCloseButton(modal) {
    const closeButton = document.createElement('button');
    closeButton.textContent = 'Close';
    closeButton.classList.add('close-button');
    closeButton.addEventListener('click', () => {
        if (modal.id === 'item-details-modal') {
            closeItemDetailsModal();
        } else {
            modal.style.display = 'none';
        }
        document.body.style.overflow = 'auto';
    });
    return closeButton;
}

function renderUncategorizedItems(items) {
    let html = '';
    items.forEach(item => {
        html += `
            <div class="equipment-option">
                <span class="item-name">${item.name}</span>
                <button class="view-details-btn" onclick="openItemDetailsModal(${JSON.stringify(item).replace(/"/g, '&quot;')})">View Details</button>
            </div>
        `;
    });
    return html;
}

function openEquipmentModal(slotName) {
    const modal = document.getElementById('equipment-modal');
    const modalContent = modal.querySelector('.modal-content');
    modalContent.innerHTML = ''; // Clear previous content

    const title = document.createElement('h2');
    title.textContent = `Equip ${slotName.replace('-', ' ')}`;
    modalContent.appendChild(title);

    const closeBtn = document.createElement('span');
    closeBtn.className = 'close';
    closeBtn.innerHTML = '&times;';
    closeBtn.onclick = closeEquipmentModal;
    modalContent.appendChild(closeBtn);

    const equipmentOptions = getEquipmentOptions(slotName);
    const optionsContainer = document.createElement('div');
    optionsContainer.id = 'equipment-options';

    if (slotName.startsWith('utility-')) {
        const categorizedItems = categorizeItems(equipmentOptions);
        optionsContainer.innerHTML = renderCategorizedItems(categorizedItems);
    } else {
        optionsContainer.innerHTML = renderUncategorizedItems(equipmentOptions);
    }

    modalContent.appendChild(optionsContainer);

    // Add event listeners for equipping items and viewing details
    optionsContainer.querySelectorAll('.equipment-option').forEach(option => {
        option.addEventListener('click', (event) => {
            const itemName = option.querySelector('.item-name').textContent.trim();
            const item = equipmentOptions.find(i => i.name === itemName);
            if (item) {
                if (event.target.classList.contains('view-details-btn')) {
                    openItemDetailsModal(item);
                } else {
                    equipItem(slotName, item);
                }
            }
        });
    });

    modal.style.display = 'block';
}

function getEquipmentOptions(slotName) {
    console.log(`Getting equipment options for slot: ${slotName}`);
    let options = [];

    if (slotName.startsWith('utility-')) {
        options = Object.values(window.items).filter(item => 
            item.itemType === 'Explosive' || 
            item.itemType === 'Ammunition' || 
            item.itemType === 'Throwable' ||
            item.itemType === 'Potion' ||
            item.itemType === 'Scroll' ||
            item.itemType === 'Crafting Component'
        );
    } else {
        options = Object.values(window.items).filter(item => isItemValidForSlot(item, slotName));
    }

    console.log(`Found ${options.length} valid items for ${slotName}`);
    options.forEach(item => console.log(` - ${item.name} (${item.itemType})`));
    return options;
}

function categorizeItems(items) {
    const categories = {
        'Explosive': [],
        'Ammunition': [],
        'Throwable': [],
        'Potion': [],
        'Scroll': [],
        'Crafting Component': [],
        'Other': []
    };

    items.forEach(item => {
        if (categories.hasOwnProperty(item.itemType)) {
            categories[item.itemType].push(item);
        } else {
            categories['Other'].push(item);
        }
    });

    return categories;
}

function renderCategorizedItems(categorizedItems) {
    let html = '';
    for (const [category, items] of Object.entries(categorizedItems)) {
        if (items.length > 0) {
            html += `<h3>${category}</h3>`;
            html += '<ul>';
            items.forEach(item => {
                html += `
                    <li class="equipment-option">
                        <span class="item-name">${item.name}</span>
                        <button class="view-details-btn">View Details</button>
                    </li>
                `;
            });
            html += '</ul>';
        }
    }
    return html;
}

function openItemDetailsModal(item) {
    const modal = document.getElementById('item-details-modal');
    const modalContent = modal.querySelector('.modal-content');
    
    let itemSpecificDetails = '';
    if (item.itemType === 'Weapon') {
        itemSpecificDetails = `
            ${item.weaponType ? `<p><strong>Weapon Type:</strong> ${item.weaponType}</p>` : ''}
            ${item.meleeRanged ? `<p><strong>Melee/Ranged:</strong> ${item.meleeRanged}</p>` : ''}
            ${item.damageType ? `<p><strong>Damage Type:</strong> ${item.damageType}</p>` : ''}
            ${item.damageAmount ? `<p><strong>Damage Amount:</strong> ${item.damageAmount}</p>` : ''}
            ${item.handsRequired ? `<p><strong>Hands Required:</strong> ${item.handsRequired}</p>` : ''}
        `;
    } else if (item.itemType === 'Armor') {
        itemSpecificDetails = `
            ${item.armorType ? `<p><strong>Armor Type:</strong> ${item.armorType}</p>` : ''}
            ${item.armorRating && item.armorRating !== '0' ? `<p><strong>Armor Rating (AR):</strong> ${item.armorRating}</p>` : ''}
            ${item.tankModifier && item.tankModifier !== '0' ? `<p><strong>Tank Modifier:</strong> ${item.tankModifier}</p>` : ''}
        `;
    } else {
        // For items from items.json
        itemSpecificDetails = `
            ${item.effect && item.effect !== 'N/A' ? `<p><strong>Effect:</strong> ${item.effect}</p>` : ''}
            ${item.duration && item.duration !== 'N/A' ? `<p><strong>Duration:</strong> ${item.duration}</p>` : ''}
            ${item.range && item.range !== 'N/A' ? `<p><strong>Range:</strong> ${item.range}</p>` : ''}
            ${item.damage && item.damage !== 'N/A' ? `<p><strong>Damage:</strong> ${item.damage}</p>` : ''}
        `;
    }
    
    modalContent.innerHTML = `
        <h2>${item.name}</h2>
        <p><strong>Description:</strong> ${item.description}</p>
        <p><strong>Item Type:</strong> ${item.itemType}</p>
        <p><strong>Rarity:</strong> ${item.rarity}</p>
        ${itemSpecificDetails}
        ${renderPropertyList(item.statBonuses, 'Stat Bonuses')}
        ${renderPropertyList(item.skillBonuses, 'Skill Bonuses')}
        ${renderPropertyList(item.uniqueAbilities, 'Unique Abilities')}
        ${renderPropertyList(item.buffs, 'Buffs')}
        ${renderPropertyList(item.spellsGranted, 'Spells Granted')}
        ${item.hpBonus && item.hpBonus !== '0' && item.hpBonus !== 'None' && item.hpBonus !== 'N/A' ? `<p><strong>HP Bonus:</strong> ${item.hpBonus}</p>` : ''}
        ${item.mpBonus && item.mpBonus !== '0' && item.mpBonus !== 'None' && item.mpBonus !== 'N/A' ? `<p><strong>MP Bonus:</strong> ${item.mpBonus}</p>` : ''}
    `;
    
    const closeButton = createCloseButton(modal);
    modalContent.appendChild(closeButton);
    
    // Set the z-index to be higher than the inventory modal
    modal.style.zIndex = '1002';
    modalContent.style.zIndex = '1003';
    
    modal.style.display = 'block';

    // Prevent scrolling on the background
    document.body.style.overflow = 'hidden';

    // Close the modal when clicking outside of it
    modal.onclick = function(event) {
        if (event.target == modal) {
            closeItemDetailsModal();
        }
    }
}

function closeItemDetailsModal() {
    const modal = document.getElementById('item-details-modal');
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
}

function processText(text) {
    return text.replace(/\n/g, '<br>');
}

function updateAttackSection() {
    const actionContainer = document.querySelector('.action-container');
    actionContainer.innerHTML = ''; // Clear existing content
    
    // Check primary and secondary weapon slots
    const weaponSlots = ['primary-weapon', 'secondary-weapon'];
    weaponSlots.forEach(slotName => {
        const slot = document.querySelector(`[data-slot="${slotName}"]`);
        const itemList = slot.querySelector('.item-list');
        const equippedWeapon = itemList.querySelector('.equipment-item');
        
        if (equippedWeapon) {
            const weaponName = equippedWeapon.textContent;
            const weapon = Object.values(window.items).find(item => item.name === weaponName && item.itemType === 'Weapon');
            
            if (weapon) {
                const attackCard = document.createElement('div');
                attackCard.classList.add('attack-card');
                attackCard.innerHTML = `
                    <h3>${weapon.name}</h3>
                    <p><strong>Weapon Type:</strong> ${weapon.weaponType}</p>
                    <p><strong>Rarity:</strong> ${weapon.rarity}</p>
                    <p><strong>Melee/Ranged:</strong> ${weapon.meleeRanged}</p>
                    <p><strong>Damage Type:</strong> ${weapon.damageType}</p>
                    <p><strong>Damage Amount:</strong> ${weapon.damageAmount}</p>
                    <button class="view-details-btn">View Details</button>
                `;
                
                const viewDetailsBtn = attackCard.querySelector('.view-details-btn');
                viewDetailsBtn.addEventListener('click', () => openItemDetailsModal(weapon));
                
                actionContainer.appendChild(attackCard);
            }
        }
    });
}

function equipItem(slotName, item) {
    console.log(`Equipping ${item.name} to ${slotName}`);

    const slot = document.querySelector(`[data-slot="${slotName}"]`);
    if (!slot) {
        console.error(`Slot ${slotName} not found`);
        return;
    }

    const itemList = slot.querySelector('.item-list');
    if (!itemList) {
        console.error(`Item list not found in slot ${slotName}`);
        return;
    }

    if (slotName.startsWith('utility-')) {
        handleUtilitySlot(itemList, item);
    } else {
        handleRegularSlot(itemList, item);
    }

    // Remove from inventory
    removeFromInventory(item.name);

    // Apply item effects
    applyItemEffects(item);

    // Update attack section if a weapon was equipped
    if (item.itemType === 'Weapon') {
        updateAttackSection();
    }

    // Close the equipment modal
    closeEquipmentModal();

    // Update character sheet
    updateCharacterSheet();

    // Ensure body scrolling is enabled
    document.body.style.overflow = 'auto';

    console.log(`Successfully equipped ${item.name} to ${slotName}`);
}

function handleRegularSlot(itemList, item) {
    itemList.innerHTML = ''; // Clear existing item
    const itemElement = document.createElement('div');
    itemElement.classList.add('equipment-item');
    itemElement.textContent = item.name;
    itemList.appendChild(itemElement);
}


function handleUtilitySlot(itemList, item) {
    let existingItem = itemList.querySelector('.equipment-item');
    if (existingItem && existingItem.dataset.itemName === item.name) {
        let quantity = parseInt(existingItem.dataset.quantity) || 1;
        existingItem.dataset.quantity = quantity + 1;
        existingItem.textContent = `${item.name} (${quantity + 1})`;
    } else {
        itemList.innerHTML = ''; // Clear existing items
        const itemElement = document.createElement('div');
        itemElement.classList.add('equipment-item');
        itemElement.dataset.itemName = item.name;
        itemElement.dataset.quantity = 1;
        itemElement.textContent = `${item.name} (1)`;
        itemList.appendChild(itemElement);
    }
}

function closeEquipmentModal() {
    const modal = document.getElementById('equipment-modal');
    modal.style.display = 'none';
    document.body.style.overflow = 'auto'; // Re-enable scrolling
}

function removeFromInventory(itemName) {
    const index = inventory.findIndex(item => item.name === itemName);
    if (index !== -1) {
        inventory.splice(index, 1);
        updateInventoryDisplay();
    } else {
        console.warn(`Item ${itemName} not found in inventory`);
    }
}

function getMaxItemsForSlot(slotName) {
    switch (slotName) {
        case 'primary-weapon':
        case 'secondary-weapon':
            return 2;
        case 'utility':
            return 9;
        case 'fingers':
            return 4;
        default:
            return 1;
    }
}

function applyItemEffects(item) {
    console.log(`Applying effects for ${item.name}`);

    // Apply stat bonuses
    if (item.statBonuses) {
        for (const [stat, bonus] of Object.entries(item.statBonuses)) {
            const statElement = document.getElementById(stat);
            if (statElement) {
                statElement.textContent = parseInt(statElement.textContent) + bonus;
            }
        }
    }

    // Apply skill bonuses
    if (item.skillBonuses) {
        for (const [skill, bonus] of Object.entries(item.skillBonuses)) {
            const skillElement = document.querySelector(`.skill[data-skill="${skill}"] span`);
            if (skillElement) {
                skillElement.textContent = parseInt(skillElement.textContent) + bonus;
            }
        }
    }

    // Apply armor rating bonus
    if (item.armorRating) {
        const arElement = document.getElementById('ar');
        if (arElement) {
            arElement.textContent = parseInt(arElement.textContent) + item.armorRating;
        }
    }

    // Apply unique abilities
    if (item.uniqueAbilities) {
        const abilityContainer = document.querySelector('.ability-container');
        for (const [abilityName, abilityDetails] of Object.entries(item.uniqueAbilities)) {
            const abilityElement = document.createElement('div');
            abilityElement.classList.add('ability');
            abilityElement.innerHTML = `
                <h3>${abilityName}</h3>
                <button class="details-btn">Details</button>
            `;
            const detailsBtn = abilityElement.querySelector('.details-btn');
            detailsBtn.addEventListener('click', function(event) {
                event.stopPropagation(); // Prevent event bubbling
                openAbilityModal(abilityName, abilityDetails);
            });
            abilityContainer.appendChild(abilityElement);
        }
    }

    // Apply buffs
    if (item.buffs) {
        const buffContainer = document.querySelector('.buff-container');
        for (const [buffName, buffDetails] of Object.entries(item.buffs)) {
            const buffElement = document.createElement('div');
            buffElement.classList.add('buff');
            buffElement.innerHTML = `
                <h3>${buffName}</h3>
                <button class="details-btn">Details</button>
            `;
            const detailsBtn = buffElement.querySelector('.details-btn');
            detailsBtn.addEventListener('click', function(event) {
                event.stopPropagation(); // Prevent event bubbling
                openBuffModal(buffName, buffDetails);
            });
            buffContainer.appendChild(buffElement);
        }
    }

    console.log(`Applied effects for ${item.name}`);
}

function updateEquipmentDisplay(slotName) {
    console.log(`Updating equipment display for slot: ${slotName}`);
    const slot = document.querySelector(`.equipment-slot[data-slot="${slotName}"]`);
    if (!slot) {
        console.error(`No slot found for ${slotName}`);
        return;
    }
    const itemList = slot.querySelector('.item-list');
    itemList.innerHTML = '';

    equippedItems[slotName].forEach(item => {
        const itemElement = document.createElement('div');
        itemElement.classList.add('equipment-item');
        itemElement.textContent = item.name;
        itemElement.addEventListener('click', () => {
            unequipItem(slotName, item);
        });
        itemList.appendChild(itemElement);
    });
    console.log(`Updated ${slotName} slot with ${equippedItems[slotName].length} items`);
}

function unequipItem(slotName, item) {
    console.log(`Attempting to unequip ${item.name} from ${slotName}`);
    const slot = equippedItems[slotName];
    const index = slot.indexOf(item);
    if (index > -1) {
        slot.splice(index, 1);
        removeItemEffects(item);
        updateEquipmentDisplay(slotName);
        updateAttackSection();
        addToInventory(item.name, item);
        console.log(`Successfully unequipped ${item.name} from ${slotName}`);
        debugArmorRating();
    } else {
        console.log(`Failed to unequip ${item.name}. Item not found in ${slotName}`);
    }
}

function debugArmorRating() {
    console.log("Current Armor Rating (AR):", document.getElementById('ar').innerText);
    console.log("Equipped items affecting AR:");
    for (const [slot, items] of Object.entries(equippedItems)) {
        items.forEach(item => {
            if (item.armorRating) {
                console.log(`- ${item.name} in ${slot}: +${item.armorRating} AR`);
            }
        });
    }
}

function removeItemEffects(item) {
    console.log(`Removing effects for item: ${item.name}`);

    // Remove stat bonuses
    for (const stat in item.statBonuses) {
        const statElement = document.getElementById(stat);
        if (statElement) {
            statElement.innerText = parseInt(statElement.innerText) - item.statBonuses[stat];
        }
    }

    // Remove skill bonuses
    for (const skill in item.skillBonuses) {
        const skillElement = document.getElementById(skill.replace(/\s/g, '-').toLowerCase());
        if (skillElement) {
            skillElement.innerText = parseInt(skillElement.innerText) - item.skillBonuses[skill];
        }
    }

    // Remove HP and MP bonuses
    if (item.hpBonus) {
        const hpElement = document.getElementById('hp');
        hpElement.innerText = parseInt(hpElement.innerText) - item.hpBonus;
    }
    if (item.mpBonus) {
        const mpElement = document.getElementById('mp');
        mpElement.innerText = parseInt(mpElement.innerText) - item.mpBonus;
    }

    // Remove Armor Rating (AR) bonus
    if (item.armorRating) {
        const arElement = document.getElementById('ar');
        arElement.innerText = parseInt(arElement.innerText) - item.armorRating;
    }

    // Remove unique abilities
    for (const abilityName in item.uniqueAbilities) {
        removeUniqueAbility(abilityName);
    }

    // Remove buffs
    for (const buffName in item.buffs) {
        removeBuff(buffName);
    }

    // Remove spells
    for (const spellName in item.spellsGranted) {
        removeSpell(spellName);
    }

    updateDerivedStats();
}

function addUniqueAbility(name, ability) {
    console.log(`Adding unique ability: ${name}`);
    let abilitiesContainer = document.querySelector('.ability-container');

    if (!abilitiesContainer) {
        const abilitiesSection = document.createElement('section');
        abilitiesSection.classList.add('abilities');
        abilitiesSection.innerHTML = `
            <h2>Unique Abilities</h2>
            <div class="ability-container"></div>
        `;
        document.querySelector('.container').appendChild(abilitiesSection);
        abilitiesContainer = abilitiesSection.querySelector('.ability-container');
    }

    const abilityElement = document.createElement('div');
    abilityElement.classList.add('ability');
    abilityElement.innerHTML = `
        <p>${name}</p>
        <span onclick="openAbilityModal('${name}')">Details</span>
    `;
    abilitiesContainer.appendChild(abilityElement);
}

function removeUniqueAbility(name) {
const abilitiesContainer = document.querySelector('.ability-container');
if (abilitiesContainer) {
    const abilityElement = Array.from(abilitiesContainer.children).find(el => el.querySelector('p').textContent === name);
    if (abilityElement) {
        abilitiesContainer.removeChild(abilityElement);
    }
}

// If no abilities left, remove the entire section
if (abilitiesContainer && abilitiesContainer.children.length === 0) {
    document.querySelector('.abilities').remove();
}
}

function addBuff(name, buff) {
    console.log(`Adding buff: ${name}`);
    let buffsContainer = document.querySelector('.buff-container');

    if (!buffsContainer) {
        const buffsSection = document.createElement('section');
        buffsSection.classList.add('buffs');
        buffsSection.innerHTML = `
            <h2>Active Buffs</h2>
            <div class="buff-container"></div>
        `;
        document.querySelector('.container').appendChild(buffsSection);
        buffsContainer = buffsSection.querySelector('.buff-container');
    }

    const buffElement = document.createElement('div');
    buffElement.classList.add('buff');
    buffElement.innerHTML = `
        <p>${name}</p>
        <span>${buff.description || 'No description available'}</span>
    `;
    buffsContainer.appendChild(buffElement);
}

function removeBuff(name) {
const buffsContainer = document.querySelector('.buff-container');
if (buffsContainer) {
    const buffElement = Array.from(buffsContainer.children).find(el => el.querySelector('p').textContent === name);
    if (buffElement) {
        buffsContainer.removeChild(buffElement);
    }
}

// If no buffs left, remove the entire section
if (buffsContainer && buffsContainer.children.length === 0) {
    document.querySelector('.buffs').remove();
}
}

function debugItemEffects(item) {
    console.log('Debugging item effects:');
    console.log('Unique Abilities:', item.uniqueAbilities);
    console.log('Buffs:', item.buffs);
    console.log('Spells Granted:', item.spellsGranted);
}

function addSpell(name, spell) {
    console.log(`Adding spell: ${name}`);
    let spellsContainer = document.querySelector('.spell-container');

    if (!spellsContainer) {
        const spellsSection = document.createElement('section');
        spellsSection.classList.add('spells');
        spellsSection.innerHTML = `
            <h2>Spells</h2>
            <div class="spell-container"></div>
        `;
        document.querySelector('.container').appendChild(spellsSection);
        spellsContainer = spellsSection.querySelector('.spell-container');
    }

    const spellElement = document.createElement('div');
    spellElement.classList.add('spell');
    spellElement.innerHTML = `
        <p onclick="openSpellModal('${name}')">${name}</p>
    `;
    spellsContainer.appendChild(spellElement);
}

function removeSpell(name) {
const spellsContainer = document.querySelector('.spell-container');
if (spellsContainer) {
    const spellElement = Array.from(spellsContainer.children).find(el => el.querySelector('p').textContent === name);
    if (spellElement) {
        spellsContainer.removeChild(spellElement);
    }
}

// If no spells left, remove the entire section
if (spellsContainer && spellsContainer.children.length === 0) {
    document.querySelector('.spells').remove();
}
}

async function loadWeapons() {
try {
    const weapons = await fetch('weapons.json').then(response => response.json());
    return weapons;
} catch (error) {
    console.error('Error loading weapons:', error);
    return [];
}
}

function openSearchModal() {
    const modal = document.getElementById('search-modal');
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';

    modal.onclick = function(event) {
        if (event.target == modal) {
            closeSearchModal();
        }
    };
}

function closeSearchModal() {
    document.getElementById('search-modal').style.display = 'none';
    document.body.style.overflow = 'auto';
}

async function searchItems() {
    const searchTerm = document.getElementById('item-search').value.toLowerCase();
    const resultsContainer = document.getElementById('search-results');
    resultsContainer.innerHTML = '';

    const filteredItems = Object.entries(window.items).filter(([name, item]) =>
        name.toLowerCase().includes(searchTerm) || item.name.toLowerCase().includes(searchTerm)
    );

    filteredItems.forEach(([key, item]) => {
        const itemDiv = document.createElement('div');
        itemDiv.textContent = item.name;
        itemDiv.addEventListener('click', () => {
            addToInventory(item.name, item);
            closeSearchModal();
        });
        resultsContainer.appendChild(itemDiv);
    });
}

function addToInventory(itemName, itemData) {
    const existingItem = inventory.find(item => item.name === itemName);
    if (existingItem) {
        existingItem.quantity++;
    } else {
        inventory.push({ name: itemName, quantity: 1, ...itemData });
    }
    saveInventory();
    updateInventoryDisplay();
}

function openInventoryModal() {
    const modal = document.getElementById('inventory-modal');
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';

    modal.onclick = function(event) {
        if (event.target == modal) {
            closeInventoryModal();
        }
    };
    updateInventoryDisplay();
}

function closeInventoryModal() {
    document.getElementById('inventory-modal').style.display = 'none';
    document.body.style.overflow = 'auto';
}

function updateInventoryDisplay() {
    const inventoryItemsContainer = document.getElementById('inventory-items');
    inventoryItemsContainer.innerHTML = '';

    inventory.forEach(item => {
        const itemDiv = document.createElement('div');
        itemDiv.classList.add('inventory-item');
        itemDiv.innerHTML = `
            <span>${item.name} (x${item.quantity})</span>
            <button onclick="increaseQuantity('${item.name}')">+</button>
            <button onclick="decreaseQuantity('${item.name}')">-</button>
            <button onclick="equipItemFromInventory('${item.name}')">Equip</button>
            <div class="item-details">
                <p>Description: ${item.description}</p>
                <p>Item Type: ${item.itemType}</p>
                <p>Rarity: ${item.rarity}</p>
                ${item.damage ? `<p>Damage: ${item.damage}</p>` : ''}
                ${item.range ? `<p>Range: ${item.range}</p>` : ''}
                ${item.effect ? `<p>Effect: ${item.effect}</p>` : ''}
            </div>
        `;
        inventoryItemsContainer.appendChild(itemDiv);
    });
}

function increaseQuantity(itemName) {
const item = inventory.find(item => item.name === itemName);
if (item) {
    item.quantity++;
    saveInventory();
    updateInventoryDisplay();
}
}

function decreaseQuantity(itemName) {
const item = inventory.find(item => item.name === itemName);
if (item && item.quantity > 0) {
    item.quantity--;
    if (item.quantity === 0) {
        inventory = inventory.filter(invItem => invItem.name !== itemName);
    }
    saveInventory();
    updateInventoryDisplay();
}
}

function equipItemFromInventory(itemName) {
const item = inventory.find(item => item.name === itemName);
if (item) {
    const slotName = getAppropriateSlotForItem(item.data);
    if (slotName) {
        equipItem(slotName, item.data);
        updateEquipmentDisplay(slotName);
        updateAttackSection();
    } else {
        alert("Cannot find an appropriate slot for this item.");
    }
}
}

function getAppropriateSlotForItem(item) {
    switch (item.itemType) {
        case 'Weapon':
            return 'primary-weapon'; // You might want to check if primary is full and use secondary if needed
        case 'Armor':
            if (item.armorType === 'Face Accessory') {
                return 'face-accessory';
            }
            return item.armorType.toLowerCase().replace(/\s+/g, '-');
        case 'Magic Item':
            // You might need more logic here depending on the specific types of magic items
            return 'utility';
        default:
            return 'utility';
    }
}

function logEquippedItems() {
    console.log("Currently equipped items:");
    for (const [slot, items] of Object.entries(equippedItems)) {
        console.log(`${slot}: ${items.map(item => item.name).join(', ')}`);
    }
}

function saveInventory() {
localStorage.setItem('inventory', JSON.stringify(inventory));
}

async function loadInventory() {
const savedInventory = localStorage.getItem('inventory');
if (savedInventory) {
    inventory = JSON.parse(savedInventory);
}

updateInventoryDisplay();
}

function attachEditableFields() {
document.querySelectorAll('.stat span').forEach(span => {
    span.ondblclick = () => editField(span);
});

document.querySelectorAll('.skill span').forEach(span => {
    span.ondblclick = () => editField(span);
});
}

function updateRace(races) {
    const selectedRaceName = document.getElementById('char-race').value;
    const selectedRace = races[selectedRaceName];
    const selectedClassName = document.getElementById('char-class').value;
    const selectedClass = window.classes[selectedClassName];

    // Remove bonuses from the previously selected race
    const previousRaceName = window.previousSelectedRace;
    if (previousRaceName && previousRaceName !== selectedRaceName) {
        const previousRace = races[previousRaceName];
        if (previousRace) {
            removeRaceBonuses(previousRace);
        }
    }

    if (!selectedRace) {
        clearRaceInfo();
        return;
    }

    displayRaceInfo(selectedRaceName, selectedRace);

    applyRaceBonuses(selectedRace);
    applyClassBonuses(selectedClass);

    updateDerivedStats();
    displayUniqueAbilities();

    // Store the currently selected race for future reference
    window.previousSelectedRace = selectedRaceName;
}

function removeRaceBonuses(previousRace) {
if (previousRace) {
    removeStatBonuses(previousRace.statBonus);
    removeArApBonuses(previousRace.statBonus);
    removeSkillBonuses(previousRace.skillBonus);
    removeUniqueAbilities(previousRace.uniqueAbilities);
}
}

function editField(element) {
    const currentText = element.innerText;
    const input = document.createElement('input');
    input.type = 'number';
    input.value = currentText;
    input.onblur = () => {
        const newValue = parseInt(input.value);
        const oldValue = parseInt(currentText);
        const change = newValue - oldValue;
        
        if (element.closest('.stat')) {
            updateStatPoints(element, change);
        } else if (element.closest('.skill')) {
            updateSkillPoints(element, change);
        } else {
            element.innerText = input.value;
        }
        
        element.style.display = 'inline';
        input.remove();
        updateDerivedStats();
    };
    input.onkeypress = (e) => {
        if (e.key === 'Enter') {
            input.blur();
        }
    };
    element.style.display = 'none';
    element.parentNode.insertBefore(input, element);
    input.focus();
}


function populateSkills() {
    const skills = [
        'Acrobatics', 'Alchemy', 'Animal Ken', 'Arcana', 'Archery', 'Artistry', 'Athletics', 'Awareness', 'Close Combat', 
        'Crafting', 'Deception', 'Disguise', 'Dodge', 'Electronics', 'Empathy', 'Engineering', 'Escape Artistry', 
        'Firearms', 'Gadgets', 'Intimidation', 'Investigation', 'Lore', 'Medicine', 'Nature', 'Persuasion', 'Repair', 
        'Ride', 'Sapper', 'Scrounging', 'Search', 'Sense Deception', 'Sleight of Hand', 'Stealth', 'Streetwise', 
        'Survival', 'Technology', 'Tracking', 'Tradecraft', 'Vehicle Operation'
    ];

    const skillColumns = document.querySelectorAll('.skill-column');
    const numColumns = skillColumns.length;
    const skillsPerColumn = Math.ceil(skills.length / numColumns);

    skills.sort().forEach((skill, index) => {
        const columnIndex = Math.floor(index / skillsPerColumn);
        const skillElement = document.createElement('div');
        skillElement.classList.add('skill');
        skillElement.innerHTML = `
            <p>${skill}:</p>
            <span id="${skill.replace(/\s/g, '-').toLowerCase()}" ondblclick="editField(this)">0</span>
        `;
        skillColumns[columnIndex].appendChild(skillElement);
    });

    attachEditableFields();
}


function populateSelectOptions(selectElement, data) {
    selectElement.innerHTML = '<option value="">Select an option</option>';
    Object.keys(data).forEach(key => {
        const option = document.createElement('option');
        option.value = key;
        option.textContent = key;
        selectElement.appendChild(option);
    });
}

function displayRaceInfo(raceName, race) {
    const raceInfoContainer = document.getElementById('selected-race');
    if (raceInfoContainer) {
        raceInfoContainer.remove();
    }
    const newRaceInfoContainer = document.createElement('div');
    newRaceInfoContainer.id = 'selected-race';
    newRaceInfoContainer.innerHTML = `
        <h2>${raceName}</h2>
        <button onclick="openRaceModal('${raceName}')">More Info</button>
    `;
    document.querySelector('.character-info').appendChild(newRaceInfoContainer);
}

function clearRaceInfo() {
    const raceInfoContainer = document.getElementById('selected-race');
    if (raceInfoContainer) {
        raceInfoContainer.remove();
    }
}

function displayBuffs(buffs) {
    let buffsContainer = document.querySelector('.buff-container');

    if (!buffsContainer) {
        const buffsSection = document.createElement('section');
        buffsSection.classList.add('buffs');
        buffsSection.innerHTML = `
            <h2>Buffs</h2>
            <div class="buff-container"></div>
        `;
        document.querySelector('.container').appendChild(buffsSection);
        buffsContainer = buffsSection.querySelector('.buff-container');
    }

    buffsContainer.innerHTML = ''; // Clear existing buffs

    Object.entries(buffs).forEach(([buffName, buffDetails]) => {
        const buffElement = document.createElement('div');
        buffElement.classList.add('buff');
        buffElement.innerHTML = `
            <h3>${buffName}</h3>
            <button class="details-btn" onclick="openBuffModal('${buffName}')">Details</button>
        `;
        buffsContainer.appendChild(buffElement);
    });
}

function openRaceModal(raceName) {
    const race = window.races[raceName];
    const modalContent = document.getElementById('race-modal-content');
    modalContent.querySelector('#race-modal-title').innerText = raceName;
    modalContent.querySelector('#race-modal-description').innerText = race.description;
    modalContent.querySelector('#race-modal-lore').innerText = race.loreElements.join(' ');
    modalContent.querySelector('#race-modal-stat-bonuses').innerText = JSON.stringify(race.statBonus);
    modalContent.querySelector('#race-modal-skill-bonuses').innerText = JSON.stringify(race.skillBonus);
    document.getElementById('race-modal').style.display = 'block';
}

function applyClassBonuses(selectedClass) {
    if (selectedClass) {
        applyStatBonuses(selectedClass.statBonus);
        applyArApBonuses(selectedClass.statBonus);
        applyHpMpBonuses(selectedClass.hpBonus, selectedClass.mpBonus);
        applySkillBonuses(selectedClass.skillBonus);
        displayUniqueAbilities(selectedClass.uniqueAbilities, 'class');
        displayBuffs(selectedClass.buffs);
        displaySpells(selectedClass.spells);
    }
}

function displayUniqueAbilities(abilities) {
    let abilitiesContainer = document.querySelector('.ability-container');

    if (!abilitiesContainer) {
        const abilitiesSection = document.createElement('section');
        abilitiesSection.classList.add('abilities');
        abilitiesSection.innerHTML = `
            <h2>Unique Abilities</h2>
            <div class="ability-container"></div>
        `;
        document.querySelector('.container').appendChild(abilitiesSection);
        abilitiesContainer = abilitiesSection.querySelector('.ability-container');
    }

    abilitiesContainer.innerHTML = ''; // Clear existing abilities

    Object.entries(abilities).forEach(([abilityName, abilityDetails]) => {
        const abilityElement = document.createElement('div');
        abilityElement.classList.add('ability');
        abilityElement.innerHTML = `
            <h3>${abilityName}</h3>
            <button class="details-btn" onclick="openAbilityModal('${abilityName}')">Details</button>
        `;
        abilitiesContainer.appendChild(abilityElement);
    });
}

function updateRace(races) {
    const selectedRaceName = document.getElementById('char-race').value;
    const selectedRace = races[selectedRaceName];
    const selectedClassName = document.getElementById('char-class').value;
    const selectedClass = window.classes[selectedClassName];

    // Remove bonuses from the previously selected race
    const previousRaceName = window.previousSelectedRace;
    if (previousRaceName && previousRaceName !== selectedRaceName) {
        const previousRace = races[previousRaceName];
        if (previousRace) {
            removeRaceBonuses(previousRace);
        }
    }

    if (!selectedRace) {
        clearRaceInfo();
        return;
    }

    displayRaceInfo(selectedRaceName, selectedRace);

    applyRaceBonuses(selectedRace);
    applyClassBonuses(selectedClass);

    updateDerivedStats();

    // Store the currently selected race for future reference
    window.previousSelectedRace = selectedRaceName;
}

function applyHpMpBonuses(hpBonus, mpBonus) {
    const hpElement = document.getElementById('hp');
    const mpElement = document.getElementById('mp');

    if (hpBonus) {
        const baseHp = parseInt(hpElement.innerText);
        const bonusHp = parseInt(hpBonus.replace(/\D/g, ''));
        hpElement.innerText = baseHp + bonusHp;
    }

    if (mpBonus) {
        const baseMp = parseInt(mpElement.innerText);
        const bonusMp = parseInt(mpBonus.replace(/\D/g, ''));
        mpElement.innerText = baseMp + bonusMp;
    }
}

function applyRaceBonuses(selectedRace) {
    if (selectedRace) {
        applyStatBonuses(selectedRace.statBonus);
        applyArApBonuses(selectedRace.statBonus);
        applySkillBonuses(selectedRace.skillBonus);
        displayUniqueAbilities(selectedRace.uniqueAbilities, 'race');
    }
}

function removeClassBonuses(previousClass) {
    if (previousClass) {
        removeStatBonuses(previousClass.statBonus);
        removeArApBonuses(previousClass.statBonus);
        removeHpMpBonuses(previousClass.hpBonus, previousClass.mpBonus);
        removeSkillBonuses(previousClass.skillBonus);
        removeUniqueAbilities(previousClass.uniqueAbilities);
        removeBuffs(previousClass.buffs);
        removeSpells(previousClass.spells);
    }
}

function removeStatBonuses(statBonus) {
    for (const stat in statBonus) {
        if (stat === 'ar' || stat === 'ap') continue;
        const statElement = document.getElementById(stat);
        if (statElement) {
            statElement.innerText = parseInt(statElement.innerText) - parseInt(statBonus[stat]);
        }
    }
}

function removeArApBonuses(statBonus) {
    const arElement = document.getElementById('ar');
    const apElement = document.getElementById('ap');

    if (statBonus.ar) {
        arElement.innerText = parseInt(arElement.innerText) - parseInt(statBonus.ar);
    }
    if (statBonus.ap) {
        apElement.innerText = parseInt(apElement.innerText) - parseInt(statBonus.ap);
    }
}

function removeHpMpBonuses(hpBonus, mpBonus) {
    const hpElement = document.getElementById('hp');
    const mpElement = document.getElementById('mp');

    if (hpBonus) {
        hpElement.innerText = parseInt(hpElement.innerText) - parseInt(hpBonus.replace(/\D/g, ''));
    }
    if (mpBonus) {
        mpElement.innerText = parseInt(mpElement.innerText) - parseInt(mpBonus.replace(/\D/g, ''));
    }
}

function removeSkillBonuses(skillBonus) {
    for (const skill in skillBonus) {
        const skillElement = document.getElementById(skill.replace(/\s/g, '-').toLowerCase());
        if (skillElement) {
            skillElement.innerText = parseInt(skillElement.innerText) - parseInt(skillBonus[skill]);
        }
    }
}

function displaySpells(spells) {
    const spellContainer = document.querySelector('.spell-container');
    spellContainer.innerHTML = '';

    if (!spells || spells.length === 0) return;

    spells.forEach(spell => {
        const spellElement = document.createElement('div');
        spellElement.classList.add('spell');
        spellElement.innerHTML = `
            <p onclick="openSpellModal('${spell}')">${spell}</p>
        `;
        spellContainer.appendChild(spellElement);
    });
}

function openSpellModal(spellName) {
    const spell = window.spells[spellName];
    const modalContent = document.getElementById('spell-modal-content');
    modalContent.querySelector('#spell-modal-title').innerText = spellName;
    modalContent.querySelector('#spell-modal-description').innerText = spell.description;
    modalContent.querySelector('#spell-modal-effect').innerText = spell.effect;
    modalContent.querySelector('#spell-modal-cost').innerText = spell.manaCost;
    document.getElementById('spell-modal').style.display = 'block';
}

function openBuffModal(buffName) {
    const buffDetails = window.buffs[buffName];
    const modal = document.getElementById('buff-modal');
    document.getElementById('buff-modal-title').textContent = buffName;
    document.getElementById('buff-modal-description').textContent = buffDetails.description;
    document.getElementById('buff-modal-effect').textContent = buffDetails.effect;
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

function displayUniqueAbilities(abilities, source) {
    console.log(`Displaying abilities for ${source}:`, abilities);
    let abilitiesContainer = document.querySelector('.ability-container');

    if (!abilitiesContainer) {
        console.error('Abilities container not found');
        return;
    }

    // Remove existing abilities from this source
    const existingAbilities = abilitiesContainer.querySelectorAll(`.ability[data-source="${source}"]`);
    existingAbilities.forEach(ability => ability.remove());

    if (!abilities || (Array.isArray(abilities) && abilities.length === 0) || (typeof abilities === 'object' && Object.keys(abilities).length === 0)) {
        console.log(`No abilities found for ${source}`);
        return;
    }

    const abilitiesArray = Array.isArray(abilities) ? abilities : Object.values(abilities);

    abilitiesArray.forEach(ability => {
        const abilityElement = document.createElement('div');
        abilityElement.classList.add('ability');
        abilityElement.dataset.source = source;
        abilityElement.innerHTML = `
            <p>${ability.name || 'Unnamed Ability'}</p>
            <span onclick="openAbilityModal('${ability.name}', '${source}')">Details</span>
        `;
        abilitiesContainer.appendChild(abilityElement);
    });
}

function openAbilityModal(abilityName) {
    const ability = uniqueAbilities[abilityName];
    if (!ability) {
        console.error(`Ability ${abilityName} not found`);
        return;
    }

    const modalContent = document.getElementById('ability-modal-content');
    modalContent.querySelector('#ability-modal-title').textContent = abilityName;
    modalContent.querySelector('#ability-modal-description').textContent = ability.description;
    modalContent.querySelector('#ability-modal-effect').textContent = ability.effect || 'No effect specified';
    modalContent.querySelector('#ability-modal-range').textContent = ability.range || 'Not specified';
    modalContent.querySelector('#ability-modal-cost').textContent = ability.abilityPointCost || 'Not specified';
    modalContent.querySelector('#ability-modal-cooldown').textContent = ability.cooldown || 'Not specified';

    document.getElementById('ability-modal').style.display = 'block';
}

function closeModal() {
    document.querySelectorAll('.modal').forEach(modal => {
        modal.style.display = 'none';
    });
    document.body.style.overflow = 'auto'; // Re-enable scrolling
}

function displayClassInfo(className, classData) {
    const classInfoContainer = document.getElementById('selected-class');
    if (classInfoContainer) {
        classInfoContainer.remove();
    }
    const newClassInfoContainer = document.createElement('div');
    newClassInfoContainer.id = 'selected-class';
    newClassInfoContainer.innerHTML = `
        <h2>${className}</h2>
        <button onclick="openClassModal('${className}')">More Info</button>
    `;
    document.querySelector('.character-info').appendChild(newClassInfoContainer);
}

function resetCharacterSheet() {
    document.querySelectorAll('.stat span').forEach(span => {
        if (span.id === 'ar') {
            span.innerText = '10';
        } else if (span.id === 'ap') {
            span.innerText = '0';
        } else {
            span.innerText = '1';
        }
    });

    document.querySelectorAll('.skill span').forEach(span => {
        span.innerText = '0';
    });

    // Reset HP and MP
    document.getElementById('hp').innerText = '0';
    document.getElementById('mp').innerText = '0';

    // Clear unique abilities section
    const abilitiesContainer = document.querySelector('.ability-container');
    if (abilitiesContainer) {
        abilitiesContainer.innerHTML = '';
    }

    // Clear buffs section
    const buffContainer = document.querySelector('.buff-container');
    if (buffContainer) {
        buffContainer.innerHTML = '';
    }

    // Clear spells section
    const spellContainer = document.querySelector('.spell-container');
    if (spellContainer) {
        spellContainer.innerHTML = '';
    }

    // Reset level, stat points, and skill points
    document.getElementById('char-level').innerText = '1';
    document.getElementById('stat-points').innerText = '60';
    document.getElementById('skill-points').innerText = '25';
}

function applyArApBonuses(statBonus) {
    const arElement = document.getElementById('ar');
    const apElement = document.getElementById('ap');

    if (statBonus.ar) {
        arElement.innerText = parseInt(arElement.innerText) + parseInt(statBonus.ar);
    }
    if (statBonus.ap) {
        apElement.innerText = parseInt(apElement.innerText) + parseInt(statBonus.ap);
    }
}

function applyStatBonuses(statBonus) {
    for (const stat in statBonus) {
        if (stat === 'ar' || stat === 'ap') continue;
        const statElement = document.getElementById(stat);
        if (statElement) {
            statElement.innerText = parseInt(statElement.innerText) + parseInt(statBonus[stat]);
        }
    }
}

function applySkillBonuses(skillBonus) {
    for (const skill in skillBonus) {
        const skillElement = document.getElementById(skill.replace(/\s/g, '-').toLowerCase());
        if (skillElement) {
            skillElement.innerText = parseInt(skillElement.innerText) + parseInt(skillBonus[skill]);
        }
    }
}

function attachModalEventListeners() {
    document.querySelectorAll('.ability .details-btn').forEach(button => {
        button.addEventListener('click', function() {
            const abilityName = this.getAttribute('data-ability-name');
            openAbilityModal(abilityName);
        });
    });

    document.querySelectorAll('.buff .details-btn').forEach(button => {
        button.addEventListener('click', function() {
            const buffName = this.getAttribute('data-buff-name');
            openBuffModal(buffName);
        });
    });
}

function openBuffModal(buffName) {
    const buff = buffs[buffName];
    if (!buff) {
        console.error(`Buff ${buffName} not found`);
        return;
    }

    const modalContent = document.getElementById('buff-modal-content');
    modalContent.querySelector('#buff-modal-title').textContent = buffName;
    modalContent.querySelector('#buff-modal-description').textContent = buff.description;
    modalContent.querySelector('#buff-modal-effect').textContent = buff.effect || 'No effect specified';

    document.getElementById('buff-modal').style.display = 'block';
}

function incrementLevel() {
    const levelElement = document.getElementById('char-level');
    let currentLevel = parseInt(levelElement.innerText);
    currentLevel += 1;
    levelElement.innerText = currentLevel;

    const statPointsElement = document.getElementById('stat-points');
    const skillPointsElement = document.getElementById('skill-points');

    let statPoints = parseInt(statPointsElement.innerText);
    let skillPoints = parseInt(skillPointsElement.innerText);

    statPoints += 2;
    skillPoints += getSkillPointsForLevel(currentLevel);

    statPointsElement.innerText = statPoints;
    skillPointsElement.innerText = skillPoints;

    updateDerivedStats();
}


function decrementLevel() {
    const levelElement = document.getElementById('char-level');
    let currentLevel = parseInt(levelElement.innerText);
    if (currentLevel > 1) {
        currentLevel -= 1;
        levelElement.innerText = currentLevel;

        const statPointsElement = document.getElementById('stat-points');
        const skillPointsElement = document.getElementById('skill-points');

        let statPoints = parseInt(statPointsElement.innerText);
        let skillPoints = parseInt(skillPointsElement.innerText);

        statPoints -= 2;
        skillPoints -= getSkillPointsForLevel(currentLevel + 1);

        statPointsElement.innerText = statPoints;
        skillPointsElement.innerText = skillPoints;
    }
}

function getSkillPointsForLevel(level) {
    if (level >= 21) return 14;
    if (level >= 16) return 12;
    if (level >= 11) return 10;
    if (level >= 6) return 8;
    return 6;
}

function updateDerivedStats() {
    const stamina = parseInt(document.getElementById('stamina').innerText);
    const intelligence = parseInt(document.getElementById('intelligence').innerText);
    const hpElement = document.getElementById('hp');
    const mpElement = document.getElementById('mp');

    hpElement.innerText = stamina * 5;
    mpElement.innerText = intelligence * 5;
}

// Initialize the character sheet
document.addEventListener('DOMContentLoaded', () => {
    loadInventory();
    initializeEquipment();
    updateDerivedStats();
});
