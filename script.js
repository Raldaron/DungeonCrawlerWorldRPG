document.addEventListener('DOMContentLoaded', async () => {
    try {
        const raceSelect = document.getElementById('char-race');
        const classSelect = document.getElementById('char-class');

        window.races = await fetch('races.json').then(response => response.json());
        window.classes = await fetch('classes.json').then(response => response.json());
        window.uniqueAbilities = await fetch('uniqueAbilities.json').then(response => response.json());
        window.buffs = await fetch('buffs.json').then(response => response.json());
        window.spells = await fetch('spells.json').then(response => response.json());

        // Use Promise.allSettled to handle potential missing files
        const [weaponsData, armorData, explosivesAmmoData] = await Promise.all([
            fetch('weapons.json').then(response => response.json()),
            fetch('armor.json').then(response => response.json()),
            fetch('explosives-ammunition-json.json').then(response => response.json())
        ]);

        // Initialize items with available data
        window.items = {
            ...(weaponsData.weapons || {}),
            ...(armorData.armor || {}),
            ...Object.fromEntries(
                Object.entries(explosivesAmmoData).flatMap(([category, items]) => 
                    Object.entries(items).map(([name, item]) => [name, { ...item, itemType: category }])
                )
            )
        };

        populateSelectOptions(raceSelect, window.races);
        populateSelectOptions(classSelect, window.classes);

        raceSelect.addEventListener('change', updateRace);
        classSelect.addEventListener('change', updateClass);

        // Initialize character stats
        initializeCharacterStats();

        // Set up event listeners for other UI elements
        document.getElementById('add-to-inventory-btn').addEventListener('click', openSearchModal);
        document.getElementById('open-inventory-btn').addEventListener('click', openInventoryModal);
        document.getElementById('item-search').addEventListener('input', searchItems);

        // Set up equipment slots
        updateEquipmentHTML();

        // Load and set up skills
        const skills = await fetch('skills.json').then(response => response.json());
        setupSkills(skills);

        // Initialize inventory
        window.inventory = [];

        // Set up notes autosave
        setupNotesAutosave();

          // Load saved inventory
          const savedInventory = localStorage.getItem('inventory');
          if (savedInventory) {
              inventory = JSON.parse(savedInventory);
          }
          updateInventoryDisplay();

        // Additional initialization code can be added here

    } catch (error) {
        console.error('Error loading data:', error);
    }
});

function populateSelectOptions(selectElement, options) {
    selectElement.innerHTML = '<option value="">Select an option</option>';
    for (const [key, value] of Object.entries(options)) {
        const option = document.createElement('option');
        option.value = key;
        option.textContent = key;
        selectElement.appendChild(option);
    }
}

function initializeCharacterStats() {
    // Initialize base stats, derived stats, etc.
    // This function should set up the initial state of your character sheet
}

function setupSkills(skills) {
    // Set up the skills section of your character sheet
    // This function should create and populate the skills UI
}

function setupNotesAutosave() {
    const notesTextarea = document.getElementById('quest-notes');
    notesTextarea.addEventListener('input', () => {
        localStorage.setItem('questNotes', notesTextarea.value);
    });

    // Load saved notes if any
    const savedNotes = localStorage.getItem('questNotes');
    if (savedNotes) {
        notesTextarea.value = savedNotes;
    }
}


// Global variables
let inventory = [];
let equippedItems = {
    'utility': [],
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
    'fingers': []
};
let weaponBuffs = [];

function initializeInventorySystem() {
    console.log("Initializing inventory system...");
    if (!window.items || Object.keys(window.items).length === 0) {
        console.log("No items data available. Skipping equipment initialization.");
        return;
    }
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
        console.log(`${item.name} (Type: ${item.itemType}, Armor Type: ${item.armorType || 'N/A'})`);
    });
}

function createRaceInfoContainer() {
    const container = document.createElement('div');
    container.id = 'selected-race';
    document.querySelector('.character-info').appendChild(container);
    return container;
}

function createBuffsContainer() {
    const container = document.createElement('div');
    container.classList.add('buff-container');
    document.querySelector('.container').appendChild(container);
    return container;
}

function openBuffsModal() {
    const modal = document.getElementById('buffs-modal');
    const buffsListElement = document.getElementById('buffs-list');
    buffsListElement.innerHTML = '';

    const activeBuffs = [];
    const selectedRaceName = document.getElementById('char-race').value;
    const selectedClassName = document.getElementById('char-class').value;

    if (selectedRaceName && window.races[selectedRaceName]) {
        activeBuffs.push(...window.races[selectedRaceName].buffs);
    }

    if (selectedClassName && window.classes[selectedClassName]) {
        activeBuffs.push(...(window.classes[selectedClassName].buffs || []));
    }

    if (activeBuffs.length > 0) {
        activeBuffs.forEach(buff => {
            const buffElement = document.createElement('li');
            buffElement.innerHTML = `
                <strong>${buff.name}</strong>
                <p>${buff.description}</p>
                <p><strong>Effect:</strong> ${buff.effect}</p>
            `;
            buffsListElement.appendChild(buffElement);
        });
    } else {
        buffsListElement.innerHTML = '<li>No active buffs</li>';
    }

    modal.style.display = 'block';
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
    if (item.itemType === 'Weapon') {
        return slotName === 'primary-weapon' || slotName === 'secondary-weapon';
    }

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
        'Wrists': 'hands',
        'Shirt': 'torso'
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
            addToInventory(existingItem);
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
        itemElement.innerHTML = `
            <span>${item.name}</span>
            <button onclick="showItemDetails('${item.name}', true)">Details</button>
            <button onclick="unequipItem('${slotName}', '${item.name}')">Unequip</button>
        `;
        itemList.appendChild(itemElement);
    });
}

function unequipItem(slotName, itemName) {
    console.log(`Attempting to unequip ${itemName} from ${slotName}`);
    const slot = equippedItems[slotName];
    const item = slot.find(i => i.name === itemName);
    if (item) {
        const index = slot.indexOf(item);
        slot.splice(index, 1);
        removeItemEffects(item);
        updateEquipmentDisplay(slotName);
        updateAttackSection();
        addToInventory(item);
        console.log(`Successfully unequipped ${itemName} from ${slotName}`);
        debugArmorRating();
    } else {
        console.log(`Failed to unequip ${itemName}. Item not found in ${slotName}`);
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

function openSearchModal() {
    document.getElementById('search-modal').style.display = 'block';
}

function closeSearchModal() {
    document.getElementById('search-modal').style.display = 'none';
}

function searchItems() {
    const searchTerm = document.getElementById('item-search').value.toLowerCase();
    const resultsContainer = document.getElementById('search-results');
    resultsContainer.innerHTML = '';

    const filteredItems = Object.entries(window.items).filter(([name, item]) =>
        name.toLowerCase().includes(searchTerm) || 
        (item.description && item.description.toLowerCase().includes(searchTerm)) ||
        (item.itemType && item.itemType.toLowerCase().includes(searchTerm))
    );

    filteredItems.forEach(([name, item]) => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'search-result-item';
        itemDiv.innerHTML = `
            <h3>${name}</h3>
            <p>${item.itemType || 'Unknown Type'}</p>
            <p>${item.description || 'No description available.'}</p>
        `;
        itemDiv.addEventListener('click', () => {
            addToInventory(item);
            closeSearchModal();
        });
        resultsContainer.appendChild(itemDiv);
    });
}

function addToInventory(item) {
    const existingItem = inventory.find(invItem => invItem.name === item.name);
    if (existingItem) {
        existingItem.quantity++;
    } else {
        inventory.push({ ...item, quantity: 1 });
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
    inventory.forEach((item, index) => {
        const itemDiv = document.createElement('div');
        itemDiv.classList.add('inventory-item');
        itemDiv.innerHTML = `
            <span>${item.name} (x${item.quantity})</span>
            <button onclick="decrementItem(${index})">-</button>
            <button onclick="incrementItem(${index})">+</button>
            <button onclick="showItemDetails('${item.name}', false)">Details</button>
            <button onclick="equipItemFromInventory('${item.name}')">Equip</button>
        `;
        inventoryItemsContainer.appendChild(itemDiv);
    });
}

function incrementItem(index) {
    if (index >= 0 && index < inventory.length) {
        inventory[index].quantity++;
        saveInventory();
        updateInventoryDisplay();
    }
}

function decrementItem(index) {
    if (index >= 0 && index < inventory.length) {
        inventory[index].quantity--;
        if (inventory[index].quantity <= 0) {
            inventory.splice(index, 1);
        }
        saveInventory();
        updateInventoryDisplay();
    }
}

function openModal(content) {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <span class="close" onclick="this.closest('.modal').remove()">&times;</span>
            ${content.outerHTML || content}
        </div>
    `;
    document.body.appendChild(modal);
    modal.style.display = 'block';
}

function showItemDetails(itemName, isEquipped) {
    const item = isEquipped
        ? Object.values(equippedItems).flat().find(i => i.name === itemName)
        : inventory.find(i => i.name === itemName);

    if (!item) {
        console.error(`Item not found: ${itemName}`);
        return;
    }

    const modalContent = document.createElement('div');
    modalContent.innerHTML = `
        <h2>${item.name || 'Unknown Item'}</h2>
        <p><strong>Description:</strong> ${item.description || 'No description available'}</p>
        <p><strong>Type:</strong> ${item.itemType || 'Unknown'}</p>
        <p><strong>Rarity:</strong> ${item.rarity || 'Unknown'}</p>
        ${item.armorRating ? `<p><strong>Armor Rating:</strong> ${item.armorRating}</p>` : ''}
        ${item.damageAmount ? `<p><strong>Damage:</strong> ${item.damageAmount} ${item.damageType || ''}</p>` : ''}
        ${item.range ? `<p><strong>Range:</strong> ${item.range} feet</p>` : ''}
        ${item.radius ? `<p><strong>Radius:</strong> ${item.radius} feet</p>` : ''}
        ${item.triggerMechanism ? `<p><strong>Trigger Mechanism:</strong> ${item.triggerMechanism}</p>` : ''}
        <h3>Additional Effects</h3>
        <ul>
            ${item.additionalEffects ? item.additionalEffects.map(effect => `<li><strong>${effect.name}:</strong> ${effect.description}</li>`).join('') : 'None'}
        </ul>
        <h3>Stat Bonuses</h3>
        <ul>
            ${Object.entries(item.statBonuses || {}).map(([stat, bonus]) => `<li>${stat}: +${bonus}</li>`).join('')}
        </ul>
        <h3>Skill Bonuses</h3>
        <ul>
            ${Object.entries(item.skillBonuses || {}).map(([skill, bonus]) => `<li>${skill}: +${bonus}</li>`).join('')}
        </ul>
        ${item.skillRequirements ? `
        <h3>Skill Requirements</h3>
        <ul>
            ${Object.entries(item.skillRequirements).map(([skill, level]) => `<li>${skill}: Level ${level}</li>`).join('')}
        </ul>
        ` : ''}
    `;

    openModal(modalContent);
}


function equipItemFromInventory(itemName) {
    const item = inventory.find(item => item.name === itemName);
    if (item) {
        const slotName = getAppropriateSlotForItem(item);
        if (slotName) {
            equipItem(slotName, item);
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

function useExplosive(explosiveName) {
    const explosive = inventory.find(item => item.name === explosiveName && item.itemType === "Explosive");
    if (explosive) {
        console.log(`Using ${explosiveName}`);
        // Implement the logic for using the explosive
        // This might involve calculating damage, applying effects, etc.
        // For now, we'll just log the usage and remove one from inventory
        explosive.quantity--;
        if (explosive.quantity <= 0) {
            inventory = inventory.filter(item => item.name !== explosiveName);
        }
        saveInventory();
        updateInventoryDisplay();
        // You would typically call a function here to apply the explosive's effects in the game
        alert(`${explosiveName} has been used!`);
    } else {
        console.error(`Explosive not found in inventory: ${explosiveName}`);
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

function loadInventory() {
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

let currentRace = null;
let currentClass = null;


function updateRace() {
    const selectedRaceName = document.getElementById('char-race').value;
    const selectedRace = window.races[selectedRaceName];

    if (currentRace) {
        removeRaceBonuses(currentRace);
    }

    if (!selectedRace) {
        clearRaceInfo();
        currentRace = null;
        return;
    }

    displayRaceInfo(selectedRaceName, selectedRace);
    applyRaceBonuses(selectedRace);
    updateDerivedStats();

    currentRace = selectedRace;
}

function removeRaceBonuses(race) {
    for (const [stat, bonus] of Object.entries(race.statBonus)) {
        const statElement = document.getElementById(stat);
        if (statElement) {
            statElement.innerText = parseInt(statElement.innerText) - parseInt(bonus);
        }
    }

    for (const [skill, bonus] of Object.entries(race.skillBonus)) {
        const skillElement = document.getElementById(skill.replace(/\s/g, '-').toLowerCase());
        if (skillElement) {
            skillElement.innerText = parseInt(skillElement.innerText) - parseInt(bonus);
        }
    }

    // Remove other race-specific bonuses (e.g., unique abilities, buffs) here
}

function applyRaceBonuses(race) {
    // Apply stat bonuses
    for (const [stat, bonus] of Object.entries(race.statBonus)) {
        const statElement = document.getElementById(stat);
        if (statElement) {
            statElement.innerText = parseInt(statElement.innerText) + parseInt(bonus);
        }
    }

    // Apply skill bonuses
    for (const [skill, bonus] of Object.entries(race.skillBonus)) {
        const skillElement = document.getElementById(skill.replace(/\s/g, '-').toLowerCase());
        if (skillElement) {
            skillElement.innerText = parseInt(skillElement.innerText) + parseInt(bonus);
        }
    }

    // Display unique abilities
    displayUniqueAbilities(race.uniqueAbilities);

    // Apply buffs
    applyBuffs(race.buffs);
}

function applyBuffs(buffs) {
    let buffsContainer = document.querySelector('.buff-container') || createBuffsContainer();
    buffsContainer.innerHTML = '';

    buffs.forEach(buff => {
        const buffElement = document.createElement('div');
        buffElement.classList.add('buff');
        buffElement.innerHTML = `
            <p>${buff.name}</p>
            <span>${buff.description}</span>
        `;
        buffsContainer.appendChild(buffElement);
    });
}

function editField(element) {
    const currentText = element.innerText;
    const input = document.createElement('input');
    input.type = 'text';
    input.value = currentText;
    input.onblur = () => {
        element.innerText = input.value;
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
        'Acrobatics', 'Animal Ken', 'Arcana', 'Archery', 'Artistry', 'Athletics', 'Awareness', 'Bomb Surgeon', 'Close Combat', 'Crafting', 'Deception', 'Disguise', 'Detect Trap', 'Dodge', 'Electronics', 'Empathy', 'Engineering', 'Escape Artistry', 'Explosives Handling', 'Firearms', 'Gadgets', 'Investigation', 'Larceny', 'Leadership', 'Lore', 'Medicine', 'Melee', 'Performance', 'Persuasion', 'Pugilism', 'Repair', 'Ride', 'Sapper', 'Scrounging', 'Search', 'Sense Deception', 'Sleight of Hand', 'Stealth', 'Streetwise', 'Survival', 'Tactics', 'Technology', 'Tradecraft', 'Vehicle Operation'
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
    const raceInfoContainer = document.getElementById('selected-race') || createRaceInfoContainer();
    raceInfoContainer.innerHTML = `
    <h2>${raceName}</h2>
    <button onclick="openRaceModal('${raceName}')">More Info</button>
`;
}

function clearRaceInfo() {
    const raceInfoContainer = document.getElementById('selected-race');
    if (raceInfoContainer) {
        raceInfoContainer.innerHTML = '';
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

    buffsContainer.innerHTML = '';

    if (!buffs || buffs.length === 0) return;

    buffs.forEach(buff => {
        const buffElement = document.createElement('div');
        buffElement.classList.add('buff');
        buffElement.innerHTML = `
        <p>${buff}</p>
        <span>${window.buffs[buff].description}</span>
    `;
        buffsContainer.appendChild(buffElement);
    });
}

function openRaceModal(raceName) {
    const race = window.races[raceName];
    const modalContent = document.getElementById('race-modal-content');

    modalContent.querySelector('#race-modal-title').innerText = raceName;
    modalContent.querySelector('#race-modal-description').innerText = race.description;
    modalContent.querySelector('#race-modal-lore').innerText = race.loreElements.join('\n\n');

    // Populate stat bonuses
    const statBonusesList = modalContent.querySelector('#race-modal-stat-bonuses');
    statBonusesList.innerHTML = '';
    for (const [stat, bonus] of Object.entries(race.statBonus)) {
        if (bonus !== 0) {
            const li = document.createElement('li');
            li.textContent = `${stat.charAt(0).toUpperCase() + stat.slice(1)}: ${bonus > 0 ? '+' : ''}${bonus}`;
            statBonusesList.appendChild(li);
        }
    }

    // Populate skill bonuses
    const skillBonusesList = modalContent.querySelector('#race-modal-skill-bonuses');
    skillBonusesList.innerHTML = '';
    for (const [skill, bonus] of Object.entries(race.skillBonus)) {
        const li = document.createElement('li');
        li.textContent = `${skill.charAt(0).toUpperCase() + skill.slice(1)}: +${bonus}`;
        skillBonusesList.appendChild(li);
    }

    // Populate unique abilities
    const abilitiesList = modalContent.querySelector('#race-modal-abilities');
    abilitiesList.innerHTML = '';
    race.uniqueAbilities.forEach(ability => {
        const li = document.createElement('li');
        li.innerHTML = `
            <p class="ability-name"><strong>${ability.name}</strong></p>
            <p class="ability-description">${ability.description}</p>
            <p class="ability-effect"><strong>Effect:</strong> ${ability.effect}</p>
        `;
        abilitiesList.appendChild(li);
    });

    // Populate buffs
    const buffsList = modalContent.querySelector('#race-modal-buffs');
    buffsList.innerHTML = '';
    race.buffs.forEach(buff => {
        const li = document.createElement('li');
        li.innerHTML = `
            <p class="buff-name"><strong>${buff.name}</strong></p>
            <p class="buff-description">${buff.description}</p>
            <p class="buff-effect"><strong>Effect:</strong> ${buff.effect}</p>
        `;
        buffsList.appendChild(li);
    });

    document.getElementById('race-modal').style.display = 'block';
}

function applyClassBonuses(classData) {
    // Apply stat bonuses
    for (const [stat, bonus] of Object.entries(classData.statBonus)) {
        const statElement = document.getElementById(stat);
        if (statElement) {
            statElement.innerText = parseInt(statElement.innerText) + parseInt(bonus);
        }
    }

    // Apply skill bonuses
    for (const [skill, bonus] of Object.entries(classData.skillBonus)) {
        const skillElement = document.getElementById(skill.replace(/\s/g, '-').toLowerCase());
        if (skillElement) {
            skillElement.innerText = parseInt(skillElement.innerText) + parseInt(bonus);
        }
    }

    // Apply HP and MP bonuses
    const hpElement = document.getElementById('hp');
    const mpElement = document.getElementById('mp');
    hpElement.innerText = parseInt(hpElement.innerText) + parseInt(classData.hpBonus);
    mpElement.innerText = parseInt(mpElement.innerText) + parseInt(classData.mpBonus);

    // Display unique abilities
    displayUniqueAbilities(classData.uniqueAbilities);

    // Apply buffs
    applyBuffs(classData.buffs);

    // Display spells
    displaySpells(classData.spells);
}

function updateClass() {
    const selectedClassName = document.getElementById('char-class').value;
    const selectedClass = window.classes[selectedClassName];

    if (currentClass) {
        removeClassBonuses(currentClass);
    }

    if (!selectedClass) {
        clearClassInfo();
        currentClass = null;
        return;
    }

    applyClassBonuses(selectedClass);
    displayClassInfo(selectedClassName, selectedClass);
    updateDerivedStats();

    currentClass = selectedClass;
}

function openClassModal(className) {
    const classData = window.classes[className];
    const modalContent = document.getElementById('class-modal-content');

    modalContent.innerHTML = `
        <span class="close" onclick="closeModal()">&times;</span>
        <h2>${className}</h2>
        <p>${classData.description}</p>
        <h3>Stat Bonuses</h3>
        <ul>${Object.entries(classData.statBonus).map(([stat, bonus]) => `<li>${stat}: +${bonus}</li>`).join('')}</ul>
        <h3>Skill Bonuses</h3>
        <ul>${Object.entries(classData.skillBonus).map(([skill, bonus]) => `<li>${skill}: +${bonus}</li>`).join('')}</ul>
        <h3>Unique Abilities</h3>
        <ul>${classData.uniqueAbilities.map(ability => `
            <li>
                <strong>${ability.name}</strong>
                <p>${ability.description}</p>
                <p><strong>Effect:</strong> ${ability.effect}</p>
            </li>`).join('')}
        </ul>
        <h3>Buffs</h3>
        <ul>${classData.buffs ? classData.buffs.map(buff => `
            <li>
                <strong>${buff.name}</strong>
                <p>${buff.description}</p>
                <p><strong>Effect:</strong> ${buff.effect}</p>
            </li>`).join('') : 'None'}
        </ul>
        <h3>Spells</h3>
        <ul>${classData.spells ? classData.spells.map(spell => `
            <li>
                <strong>${spell.name}</strong>
                <p>${spell.description}</p>
                <p><strong>Effect:</strong> ${spell.effect}</p>
                <p><strong>Mana Cost:</strong> ${spell.manaCost}</p>
            </li>`).join('') : 'None'}
        </ul>
    `;

    document.getElementById('class-modal').style.display = 'block';
}

function displayClassInfo(className, classData) {
    const classInfoContainer = document.getElementById('selected-class') || createClassInfoContainer();
    classInfoContainer.innerHTML = `
        <h2>${className}</h2>
        <button onclick="openClassModal('${className}')">More Info</button>
    `;
}

function createClassInfoContainer() {
    const container = document.createElement('div');
    container.id = 'selected-class';
    document.querySelector('.character-info').appendChild(container);
    return container;
}

function removeClassBonuses(classData) {
    // Remove stat bonuses
    for (const [stat, bonus] of Object.entries(classData.statBonus)) {
        const statElement = document.getElementById(stat);
        if (statElement) {
            statElement.innerText = parseInt(statElement.innerText) - parseInt(bonus);
        }
    }

    // Remove skill bonuses
    for (const [skill, bonus] of Object.entries(classData.skillBonus)) {
        const skillElement = document.getElementById(skill.replace(/\s/g, '-').toLowerCase());
        if (skillElement) {
            skillElement.innerText = parseInt(skillElement.innerText) - parseInt(bonus);
        }
    }

    // Remove HP and MP bonuses
    const hpElement = document.getElementById('hp');
    const mpElement = document.getElementById('mp');
    hpElement.innerText = parseInt(hpElement.innerText) - parseInt(classData.hpBonus);
    mpElement.innerText = parseInt(mpElement.innerText) - parseInt(classData.mpBonus);

    // Remove unique abilities, buffs, and spells
    clearUniqueAbilities();
    clearBuffs();
    clearSpells();
}

function clearRaceInfo() {
    // Clear race-specific information display
}

function clearClassInfo() {
    clearUniqueAbilities();
    clearBuffs();
    clearSpells();
}

function clearUniqueAbilities() {
    const abilitiesContainer = document.querySelector('.ability-container');
    if (abilitiesContainer) {
        abilitiesContainer.innerHTML = '';
    }
}

function clearBuffs() {
    // Clear applied buffs
}

function clearSpells() {
    // Clear displayed spells
}

function displayUniqueAbilities(abilities) {
    const abilitiesContainer = document.querySelector('.ability-container') || createAbilitiesContainer();
    abilitiesContainer.innerHTML = '';

    abilities.forEach(ability => {
        const abilityElement = document.createElement('div');
        abilityElement.classList.add('ability');
        abilityElement.innerHTML = `
            <p>${ability.name}</p>
            <span class="ability-details" onclick="openAbilityModal('${ability.name}')">Details</span>
        `;
        abilitiesContainer.appendChild(abilityElement);
    });
}

function removeUniqueAbilities(abilities) {
    const abilitiesContainer = document.querySelector('.ability-container');
    if (abilitiesContainer) {
        abilities.forEach(ability => {
            const abilityElement = abilitiesContainer.querySelector(`[data-ability="${ability}"]`);
            if (abilityElement) {
                abilityElement.remove();
            }
        });
    }
}

function openAbilityModal(abilityName) {
    const ability = findAbilityByName(abilityName);
    if (!ability) {
        console.error(`Ability not found: ${abilityName}`);
        return;
    }

    const modalContent = document.getElementById('ability-modal-content');

    modalContent.innerHTML = `
        <span class="close" onclick="closeModal()">&times;</span>
        <h2 id="ability-modal-title">${ability.name}</h2>
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


function findAbilityByName(abilityName) {
    for (const race of Object.values(window.races)) {
        const ability = race.uniqueAbilities.find(a => a.name === abilityName);
        if (ability) return ability;
    }
    for (const classData of Object.values(window.classes)) {
        const ability = classData.uniqueAbilities.find(a => a.name === abilityName);
        if (ability) return ability;
    }
    return null;
}

function displaySpells(spells) {
    const spellsContainer = document.querySelector('.spell-container') || createSpellsContainer();
    spellsContainer.innerHTML = '';

    spells.forEach(spell => {
        const spellElement = document.createElement('div');
        spellElement.classList.add('spell');
        spellElement.innerHTML = `
            <p>${spell.name}</p>
            <span class="spell-details" onclick="openSpellModal('${spell.name}')">Details</span>
        `;
        spellsContainer.appendChild(spellElement);
    });
}

function removeSpells(spells) {
    const spellsContainer = document.querySelector('.spell-container');
    if (spellsContainer) {
        Object.keys(spells).forEach(spellName => {
            const spellElement = spellsContainer.querySelector(`[data-spell="${spellName}"]`);
            if (spellElement) {
                spellElement.remove();
            }
        });
    }
}

function findSpellByName(spellName) {
    for (const classData of Object.values(window.classes)) {
        const spell = classData.spells.find(s => s.name === spellName);
        if (spell) return spell;
    }
    return null;
}

function openSpellModal(spellName) {
    const spell = findSpellByName(spellName);
    if (!spell) {
        console.error(`Spell not found: ${spellName}`);
        return;
    }
    const modalContent = document.getElementById('spell-modal-content');
    modalContent.querySelector('#spell-modal-title').innerText = spell.name;
    modalContent.querySelector('#spell-modal-description').innerText = spell.description;
    modalContent.querySelector('#spell-modal-effect').innerText = spell.effect;
    modalContent.querySelector('#spell-modal-cost').innerText = spell.manaCost;
    document.getElementById('spell-modal').style.display = 'block';
}

function createAbilitiesContainer() {
    const container = document.createElement('div');
    container.classList.add('ability-container');
    document.querySelector('.abilities').appendChild(container);
    return container;
}

function createSpellsContainer() {
    const container = document.createElement('div');
    container.classList.add('spell-container');
    document.querySelector('.spells').appendChild(container);
    return container;
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

    // Update HP (base HP + stamina bonus)
    const baseHp = parseInt(hpElement.innerText);
    hpElement.innerText = baseHp + (stamina * 5);

    // Update MP (base MP + intelligence bonus)
    const baseMp = parseInt(mpElement.innerText);
    mpElement.innerText = baseMp + (intelligence * 5);
}

// Initialize the character sheet
document.addEventListener('DOMContentLoaded', () => {
    loadInventory();
    initializeInventorySystem();
    updateDerivedStats();
});