document.addEventListener('DOMContentLoaded', async () => {
    try {
        const raceSelect = document.getElementById('char-race');
        const classSelect = document.getElementById('char-class');

        const races = await fetch('races.json').then(response => response.json());
        const classes = await fetch('classes.json').then(response => response.json());
        const uniqueAbilities = await fetch('uniqueAbilities.json').then(response => response.json());
        const buffs = await fetch('buffs.json').then(response => response.json());
        const spells = await fetch('spells.json').then(response => response.json());

        populateSelectOptions(raceSelect, races);
        populateSelectOptions(classSelect, classes);

        raceSelect.addEventListener('change', () => updateRace(races));
        classSelect.addEventListener('change', () => updateClass(classes));

        window.races = races;
        window.classes = classes;
        window.uniqueAbilities = uniqueAbilities;
        window.buffs = buffs;
        window.spells = spells;

        attachEditableFields();
        populateSkills();
        document.getElementById('skill-points').innerText = '25'; // Set initial skill points to 25
    } catch (error) {
        console.error('Error loading data:', error);
    }
    document.getElementById('add-to-inventory-btn').addEventListener('click', openSearchModal);
    document.getElementById('open-inventory-btn').addEventListener('click', openInventoryModal);
    document.getElementById('item-search').addEventListener('input', searchItems);

    loadInventory();
});

let inventory = [];
let items = ["Sword", "Shield", "Potion", "Helmet", "Armor", "Boots", "Ring", "Amulet", "Bow", "Arrow"]; // Example items

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

    const filteredItems = items.filter(item => item.toLowerCase().includes(searchTerm));
    filteredItems.forEach(item => {
        const itemDiv = document.createElement('div');
        itemDiv.textContent = item;
        itemDiv.addEventListener('click', () => {
            addToInventory(item);
            closeSearchModal();
        });
        resultsContainer.appendChild(itemDiv);
    });
}

function addToInventory(itemName) {
    const existingItem = inventory.find(item => item.name === itemName);
    if (existingItem) {
        existingItem.quantity++;
    } else {
        inventory.push({ name: itemName, quantity: 1 });
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
            <span id="${skill.replace(/\s/g, '-').toLowerCase()}" ondblclick="editField(this)"></span>
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
        <h2 onclick="openRaceModal('${raceName}')">${raceName}</h2>
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
    const buffContainer = document.querySelector('.buff-container');
    buffContainer.innerHTML = '';

    if (!buffs || buffs.length === 0) return;

    buffs.forEach(buff => {
        const buffElement = document.createElement('div');
        buffElement.classList.add('buff');
        buffElement.innerHTML = `
            <p>${buff}</p>
            <span>${window.buffs[buff] ? window.buffs[buff].description : 'Description not available'}</span>
        `;
        buffContainer.appendChild(buffElement);
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

    if (!selectedClass) return;

    // Reset stats to base values
    resetCharacterSheet();

    // Apply race and class bonuses
    applyRaceBonuses(selectedRace);
    applyClassBonuses(selectedClass);

    updateDerivedStats();
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

function openBuffsModal() {
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

    if (activeBuffs.length > 0) {
        activeBuffs.forEach(buffName => {
            const buff = window.buffs[buffName];
            if (buff) {
                const buffDiv = document.createElement('div');
                buffDiv.classList.add('buff-info');

                const buffNameElement = document.createElement('h3');
                buffNameElement.classList.add('buff-name');
                buffNameElement.textContent = buffName;
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
            }
        });
    } else {
        buffsListElement.innerHTML = '<li>No active buffs.</li>';
    }

    document.getElementById('buffs-modal').style.display = 'block';
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
    modalContent.querySelector('#ability-modal-title').innerText = abilityName;
    modalContent.querySelector('#ability-modal-description').innerText = ability.description;
    modalContent.querySelector('#ability-modal-effect').innerText = ability.effect;
    modalContent.querySelector('#ability-modal-range').innerText = ability.range || 'N/A';
    modalContent.querySelector('#ability-modal-cost').innerText = ability.abilityPointCost;
    modalContent.querySelector('#ability-modal-cooldown').innerText = ability.cooldown;
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
        const skillElement = document.getElementById(skill);
        if (skillElement) {
            skillElement.innerText = parseInt(skillElement.innerText) + parseInt(skillBonus[skill]);
        }
    }
}

function openRaceModal(name) {
    const race = window.races[name];
    const modalContent = document.getElementById('race-modal-content');
    modalContent.querySelector('#race-modal-title').innerText = name;
    modalContent.querySelector('#race-modal-description').innerText = race.description;
    modalContent.querySelector('#race-modal-lore').innerText = race.loreElements.join(' ');
    modalContent.querySelector('#race-modal-stat-bonuses').innerText = JSON.stringify(race.statBonus);
    modalContent.querySelector('#race-modal-skill-bonuses').innerText = JSON.stringify(race.skillBonus);
    document.getElementById('race-modal').style.display = 'block';
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

updateDerivedStats();