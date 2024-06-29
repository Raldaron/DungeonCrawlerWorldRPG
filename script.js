document.addEventListener('DOMContentLoaded', async () => {
    try {
        const raceSelect = document.getElementById('char-race');
        const classSelect = document.getElementById('char-class');

        window.races = await fetch('races.json').then(response => response.json());
        window.classes = await fetch('classes.json').then(response => response.json());
        window.uniqueAbilities = await fetch('uniqueAbilities.json').then(response => response.json());
        window.buffs = await fetch('buffs.json').then(response => response.json());
        window.spells = await fetch('spells.json').then(response => response.json());
        const weaponsData = await fetch('weapons.json').then(response => response.json());
        const armorData = await fetch('armor.json').then(response => response.json());

        // Initialize items with both weapons and armor data
        window.items = { ...weaponsData.weapons, ...armorData.armor };

        populateSelectOptions(raceSelect, window.races);
        populateSelectOptions(classSelect, window.classes);

        raceSelect.addEventListener('change', () => updateRace(window.races));
        classSelect.addEventListener('change', () => updateClass(window.classes));

        attachEditableFields();
        populateSkills();
        document.getElementById('skill-points').innerText = '25'; // Set initial skill points to 25

        // Initialize equipment functionality
        initializeEquipment();
    } catch (error) {
        console.error('Error loading data:', error);
    }
    document.getElementById('add-to-inventory-btn').addEventListener('click', openSearchModal);
    document.getElementById('open-inventory-btn').addEventListener('click', openInventoryModal);
    document.getElementById('item-search').addEventListener('input', searchItems);

    debugArmorTypes();
    loadInventory();
    updateAttackSection();
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
    console.log("Initializing equipment...");
    updateEquipmentHTML();
    
    const equipmentSlots = document.querySelectorAll('.equipment-slot');
    console.log(`Found ${equipmentSlots.length} equipment slots`);
    equipmentSlots.forEach(slot => {
        const slotName = slot.dataset.slot;
        console.log(`Adding click listener to ${slotName} slot`);
        slot.addEventListener('click', () => {
            console.log(`${slotName} slot clicked`);
            openEquipmentModal(slotName);
        });
        updateEquipmentDisplay(slotName);
    });
    
    logEquippedItems();
    
    console.log("All available items:");
    Object.values(window.items).forEach(item => {
        console.log(`${item.name} (Type: ${item.itemType}, Armor Type: ${item.armorType})`);
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

function isItemValidForSlot(item, slotName) {
    if (item.itemType !== 'Armor') {
        return false;
    }
    
    const armorTypeToSlot = {
        'Face Accessory': 'face-accessory',
        'Neck': 'neck',
        'Fingers': 'fingers',
        'Headgear': 'headgear',
        'Shoulders': 'shoulders',
        'Torso': 'torso',
        'Arms': 'arms',
        'Hands': 'hands',
        'Waist': 'waist',
        'Legs': 'legs',
        'Feet': 'feet',
        'Wrists': 'hands', // Assuming wrist items go on hands slot
        'Shirt': 'torso' // Add this line to handle potential "Shirt" armor type
    };
    
    const mappedSlot = armorTypeToSlot[item.armorType];
    console.log(`Checking item ${item.name}: Armor Type = ${item.armorType}, Mapped Slot = ${mappedSlot}, Requested Slot = ${slotName}`);
    return mappedSlot === slotName;
}

function createCloseButton(modal) {
    const closeButton = document.createElement('button');
    closeButton.textContent = 'Close';
    closeButton.classList.add('close-button');
    closeButton.addEventListener('click', () => {
        modal.style.display = 'none';
    });
    return closeButton;
}

function openEquipmentModal(slotName) {
    const modal = document.getElementById('equipment-modal');
    const modalContent = modal.querySelector('.modal-content');
    modalContent.innerHTML = `
        <h2>Equip ${slotName}</h2>
        <div id="equipment-options"></div>
    `;
    
    const closeButton = createCloseButton(modal);
    modalContent.appendChild(closeButton);
    
    const equipmentOptions = getEquipmentOptions(slotName);
    const optionsContainer = modalContent.querySelector('#equipment-options');
    equipmentOptions.forEach(item => {
        const itemElement = document.createElement('div');
        itemElement.classList.add('equipment-option');
        itemElement.textContent = item.name;
        itemElement.addEventListener('click', () => {
            equipItem(slotName, item);
            updateAttackSection();
            modal.style.display = 'none';
        });
        
        const viewDetailsButton = document.createElement('button');
        viewDetailsButton.textContent = 'View Details';
        viewDetailsButton.addEventListener('click', (event) => {
            event.stopPropagation();
            openItemDetailsModal(item);
        });
        itemElement.appendChild(viewDetailsButton);
        
        optionsContainer.appendChild(itemElement);
    });
    
    modal.style.display = 'block';
}

function getEquipmentOptions(slotName) {
    console.log(`Getting equipment options for slot: ${slotName}`);
    const options = Object.values(window.items).filter(item => isItemValidForSlot(item, slotName));
    console.log(`Found ${options.length} valid items for ${slotName}`);
    options.forEach(item => console.log(` - ${item.name} (${item.armorType})`));
    return options;
}

function openItemDetailsModal(item) {
    const modal = document.createElement('div');
    modal.classList.add('modal');
    const modalContent = document.createElement('div');
    modalContent.classList.add('modal-content');
    
    let itemSpecificDetails = '';
    if (item.itemType === 'Weapon') {
        itemSpecificDetails = `
            <p><strong>Weapon Type:</strong> ${item.weaponType}</p>
            <p><strong>Melee/Ranged:</strong> ${item.meleeRanged}</p>
            <p><strong>Damage Type:</strong> ${item.damageType}</p>
            <p><strong>Damage Amount:</strong> ${item.damageAmount}</p>
            <p><strong>Hands Required:</strong> ${item.handsRequired}</p>
        `;
    } else if (item.itemType === 'Armor') {
        itemSpecificDetails = `
            <p><strong>Armor Type:</strong> ${item.armorType}</p>
            <p><strong>Armor Rating (AR):</strong> ${item.armorRating}</p>
            <p><strong>Tank Modifier:</strong> ${item.tankModifier}</p>
        `;
    }
    
    modalContent.innerHTML = `
    <h2>${abilityName}</h2>
    <div class="ability-description">${ability.description}</div>
    <h3>Effect</h3>
    <div class="ability-description">${ability.effect}</div>
        <h2>${item.name}</h2>
        <p><strong>Description:</strong> ${item.description}</p>
        <p><strong>Item Type:</strong> ${item.itemType}</p>
        <p><strong>Rarity:</strong> ${item.rarity}</p>
        ${itemSpecificDetails}
        <h3>Stat Bonuses:</h3>
        <ul>
            ${Object.entries(item.statBonuses).map(([stat, bonus]) => `<li>${stat}: +${bonus}</li>`).join('')}
        </ul>
        <h3>Skill Bonuses:</h3>
        <ul>
            ${Object.entries(item.skillBonuses).map(([skill, bonus]) => `<li>${skill}: +${bonus}</li>`).join('')}
        </ul>
        <h3>Unique Abilities:</h3>
        <ul>
            ${Object.entries(item.uniqueAbilities).map(([ability, details]) => `<li>${ability}: ${details.description}</li>`).join('')}
        </ul>
        <h3>Buffs:</h3>
        <ul>
            ${Object.entries(item.buffs).map(([buff, details]) => `<li>${buff}: ${details.description}</li>`).join('')}
        </ul>
        <h3>Spells Granted:</h3>
        <ul>
            ${Object.entries(item.spellsGranted).map(([spell, details]) => `<li>${spell}: Mana Cost - ${details.manaCost}</li>`).join('')}
        </ul>
        <p><strong>HP Bonus:</strong> ${item.hpBonus}</p>
        <p><strong>MP Bonus:</strong> ${item.mpBonus}</p>
    `;
    
    const closeButton = createCloseButton(modal);
    modalContent.appendChild(closeButton);
    
    modal.appendChild(modalContent);
    document.body.appendChild(modal);
    modal.style.display = 'block';
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
        const equippedWeapons = equippedItems[slotName];
        equippedWeapons.forEach(weapon => {
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
        });
    });
}

function equipItem(slotName, item) {
    console.log(`Attempting to equip ${item.name} in ${slotName}`);
    const slot = equippedItems[slotName];
    const maxItems = getMaxItemsForSlot(slotName);
    
    if (slot.length < maxItems) {
        if (item.itemType === 'Weapon' && item.handsRequired === 'Two-handed' && slot.length > 0) {
            alert("Can't equip a two-handed weapon when other weapons are equipped.");
            return;
        }
        
        // Remove existing item if the slot can only hold one item
        if (maxItems === 1 && slot.length === 1) {
            const existingItem = slot[0];
            removeItemEffects(existingItem);
            slot.pop();
            addToInventory(existingItem.name, existingItem);
        }
        
        slot.push(item);
        applyItemEffects(item);
        updateEquipmentDisplay(slotName);
        updateAttackSection();
        removeFromInventory(item.name);
        console.log(`Successfully equipped ${item.name} in ${slotName}`);
        debugArmorRating();
    } else {
        console.log(`Failed to equip ${item.name} in ${slotName}. Slot is full.`);
        alert(`Cannot equip more items in ${slotName}. Maximum reached.`);
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
    console.log(`Applying effects for item: ${item.name}`);

    // Apply stat bonuses
    for (const stat in item.statBonuses) {
        const statElement = document.getElementById(stat);
        if (statElement) {
            statElement.innerText = parseInt(statElement.innerText) + item.statBonuses[stat];
        }
    }
    
    // Apply skill bonuses
    for (const skill in item.skillBonuses) {
        const skillElement = document.getElementById(skill.replace(/\s/g, '-').toLowerCase());
        if (skillElement) {
            skillElement.innerText = parseInt(skillElement.innerText) + item.skillBonuses[skill];
        }
    }
    
    // Apply HP and MP bonuses
    if (item.hpBonus) {
        const hpElement = document.getElementById('hp');
        hpElement.innerText = parseInt(hpElement.innerText) + item.hpBonus;
    }
    if (item.mpBonus) {
        const mpElement = document.getElementById('mp');
        mpElement.innerText = parseInt(mpElement.innerText) + item.mpBonus;
    }

    // Apply Armor Rating (AR) bonus
    if (item.armorRating) {
        const arElement = document.getElementById('ar');
        arElement.innerText = parseInt(arElement.innerText) + item.armorRating;
    }
    
    // Add unique abilities
    for (const abilityName in item.uniqueAbilities) {
        addUniqueAbility(abilityName, item.uniqueAbilities[abilityName]);
    }

    // Add buffs
    for (const buffName in item.buffs) {
        addBuff(buffName, item.buffs[buffName]);
    }

    // Add spells
    for (const spellName in item.spellsGranted) {
        addSpell(spellName, item.spellsGranted[spellName]);
    }

    updateDerivedStats();
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
document.getElementById('search-modal').style.display = 'block';
}

function closeSearchModal() {
document.getElementById('search-modal').style.display = 'none';
}

async function searchItems() {
const searchTerm = document.getElementById('item-search').value.toLowerCase();
const resultsContainer = document.getElementById('search-results');
resultsContainer.innerHTML = '';

const filteredItems = Object.entries(window.items).filter(([name, item]) =>
    name.toLowerCase().includes(searchTerm)
);

filteredItems.forEach(([name, item]) => {
    const itemDiv = document.createElement('div');
    itemDiv.textContent = name;
    itemDiv.addEventListener('click', () => {
        addToInventory(name, item);
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
    inventory.push({ name: itemName, quantity: 1, data: itemData });
}
saveInventory();
updateInventoryDisplay();
}

function openInventoryModal() {
document.getElementById('inventory-modal').style.display = 'block';
updateInventoryDisplay();
}

function closeInventoryModal() {
document.getElementById('inventory-modal').style.display = 'none';
}

function updateInventoryDisplay() {
const inventoryItemsContainer = document.getElementById('inventory-items');
inventoryItemsContainer.innerHTML = '';

inventory.sort((a, b) => a.name.localeCompare(b.name));
inventory.forEach(item => {
    const itemDiv = document.createElement('div');
    itemDiv.classList.add('inventory-item');
    itemDiv.innerHTML = `
        <span>${item.name} (x${item.quantity})</span>
        <button onclick="increaseQuantity('${item.name}')">+</button>
        <button onclick="decreaseQuantity('${item.name}')">-</button>
        <button onclick="equipItemFromInventory('${item.name}')">Equip</button>
        <div class="item-details">
            <p>Description: ${item.data.description}</p>
            ${item.data.itemType ? `<p>Item Type: ${item.data.itemType}</p>` : ''}
            ${item.data.weaponType ? `<p>Weapon Type: ${item.data.weaponType}</p>` : ''}
            ${item.data.armorType ? `<p>Armor Type: ${item.data.armorType}</p>` : ''}
            ${item.data.damageAmount ? `<p>Damage: ${item.data.damageAmount} (${item.data.damageType})</p>` : ''}
            ${item.data.armorRating ? `<p>Armor Rating: ${item.data.armorRating}</p>` : ''}
            ${item.data.handsRequired ? `<p>Hands Required: ${item.data.handsRequired}</p>` : ''}
            ${item.data.rarity ? `<p>Rarity: ${item.data.rarity}</p>` : ''}
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
    input.type = 'text';
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
        
        element.style.display = 'block';
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
        'Awareness', 'Empathy', 'Artistry', 'Intimidation', 'Persuasion', 'Close Combat', 'Sense Deception', 'Streetwise',
        'Sleight of hand', 'Stealth', 'Animal Ken', 'Athletics', 'Crafting', 'Disguise', 'Dodge', 'Escape Artistry',
        'Lore', 'Arcana', 'Medicine', 'Firearms', 'Archery', 'Repair', 'Electronics', 'Gadgets', 'Ride', 'Sapper',
        'Scrounging', 'Search', 'Survival', 'Technology', 'Tradecraft', 'Vehicle Operation', 'Investigation'
    ];

    const skillColumns = document.querySelectorAll('.skill-column');
    const numColumns = skillColumns.length;

    skills.sort().forEach((skill, index) => {
        const columnIndex = index % numColumns;
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
        <p>${race.description}</p>
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
    const buffsListElement = document.getElementById('buffs-list');
    buffsListElement.innerHTML = '';

    if (buffs.length === 0) {
        buffsListElement.innerHTML = '<li>No active buffs.</li>';
        return;
    }

    buffs.forEach(buff => {
        const buffItem = document.createElement('li');
        buffItem.innerHTML = `
            <strong>${buff.name}:</strong>
            <p>Description: ${buff.description}</p>
            <p>Effect: ${buff.effect}</p>
        `;
        buffsListElement.appendChild(buffItem);
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
        displayUniqueAbilities(selectedClass.uniqueAbilities);
        displayBuffs(selectedClass.buffs);
        displaySpells(selectedClass.spells);
    }
}

function updateClass(classes) {
    const selectedClassName = document.getElementById('char-class').value;
    const selectedClass = classes[selectedClassName];
    const selectedRaceName = document.getElementById('char-race').value;
    const selectedRace = window.races[selectedRaceName];

    // Remove bonuses from the previously selected class
    const previousClassName = window.previousSelectedClass;
    if (previousClassName && previousClassName !== selectedClassName) {
        const previousClass = classes[previousClassName];
        if (previousClass) {
            removeClassBonuses(previousClass);
        }
    }

    if (!selectedClass) return;

    // Reset stats to base values
    resetCharacterSheet();

    // Apply race and class bonuses
    applyRaceBonuses(selectedRace);
    applyClassBonuses(selectedClass);

    updateDerivedStats();

    // Store the currently selected class for future reference
    window.previousSelectedClass = selectedClassName;
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
        displayUniqueAbilities(selectedRace.uniqueAbilities);
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

async function openBuffsModal() {
    document.getElementById('buffs-modal').style.display = 'block';
    const selectedRaceName = document.getElementById('char-race').value;
    const selectedRace = window.races[selectedRaceName];
    const selectedClassName = document.getElementById('char-class').value;
    const selectedClass = window.classes[selectedClassName];

    const buffsListElement = document.getElementById('buffs-list');
    buffsListElement.innerHTML = '';

    const activeBuffs = [];

    if (selectedRace && selectedRace.buffs) {
        activeBuffs.push(...selectedRace.buffs);
    }

    if (selectedClass && selectedClass.buffs) {
        activeBuffs.push(...selectedClass.buffs);
    }

    activeBuffs.push(...weaponBuffs);

    if (activeBuffs.length > 0) {
        activeBuffs.forEach(buff => {
            const buffDiv = document.createElement('div');
            buffDiv.classList.add('buff-info');

            const buffNameElement = document.createElement('h3');
            buffNameElement.classList.add('buff-name');
            buffNameElement.textContent = buff.name;
            buffDiv.appendChild(buffNameElement);

            const buffDescElement = document.createElement('p');
            buffDescElement.classList.add('buff-description');
            buffDescElement.textContent = `Description: ${buff.description}`;
            buffDiv.appendChild(buffDescElement);

            const buffEffectElement = document.createElement('p');
            buffEffectElement.classList.add('buff-effect');
            buffEffectElement.textContent = `Effect: ${buff.effect}`;
            buffDiv.appendChild(buffEffectElement);

            if (buff.scaling) {
                const buffScalingElement = document.createElement('p');
                buffScalingElement.classList.add('buff-scaling');
                buffScalingElement.textContent = `Scaling: ${buff.scaling}`;
                buffDiv.appendChild(buffScalingElement);
            }

            buffsListElement.appendChild(buffDiv);
        });
    } else {
        buffsListElement.innerHTML = '<div>No active buffs.</div>';
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

    abilitiesContainer.innerHTML = '';

    if (!abilities || abilities.length === 0) return;

    abilities.forEach(ability => {
        const abilityElement = document.createElement('div');
        abilityElement.classList.add('ability');
        abilityElement.innerHTML = `
            <p>${ability}</p>
            <span onclick="openAbilityModal('${ability}')">Details</span>
        `;
        abilitiesContainer.appendChild(abilityElement);
    });
}

function openAbilityModal(abilityName) {
    const ability = window.uniqueAbilities[abilityName];
    const modalContent = document.getElementById('ability-modal-content');
    
    modalContent.innerHTML = `
        <span class="close" onclick="closeModal()">&times;</span>
        <h2 id="ability-modal-title">${abilityName}</h2>
        <div id="ability-modal-description">${ability.description}</div>
        <h3>Effect</h3>
        <div id="ability-modal-effect">${ability.effect}</div>
        <h3>Range</h3>
        <p id="ability-modal-range">${ability.range || 'N/A'}</p>
        <h3>Ability Point Cost</h3>
        <p id="ability-modal-cost">${ability.abilityPointCost || 'N/A'}</p>
        <h3>Cooldown</h3>
        <p id="ability-modal-cooldown">${ability.cooldown || 'N/A'}</p>
    `;
    
    document.getElementById('ability-modal').style.display = 'block';
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

function closeModal() {
    document.querySelectorAll('.modal').forEach(modal => {
        modal.style.display = 'none';
    });
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
