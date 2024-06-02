document.addEventListener('DOMContentLoaded', () => {
    let classes = {};
    let races = {};
    let weapons = {};
    let items = [];
    let wearables = [];
    let statBaseValues = {};
    let availableStatPoints = 0;

    const baseArmorRating = 10;
    let currentArmorRating = baseArmorRating;
    
    const statElements = {
        strength: document.getElementById('strength'),
        dexterity: document.getElementById('dexterity'),
        stamina: document.getElementById('stamina'),
        intelligence: document.getElementById('intelligence'),
        perception: document.getElementById('perception'),
        wit: document.getElementById('wit'),
        charisma: document.getElementById('charisma'),
        manipulation: document.getElementById('manipulation'),
        appearance: document.getElementById('appearance')
    };

    const statPointsElement = document.getElementById('stat-points');
    const derivedStatElements = {
        hp: document.getElementById('hp'),
        mp: document.getElementById('mp'),
        ar: document.getElementById('ar')
    };

    function initializeStats() {
        for (const stat in statElements) {
            statElements[stat].value = 10;  // Set default stat values
            statBaseValues[stat] = 10;
        }
        availableStatPoints = 60;
        statPointsElement.value = availableStatPoints;
        updateDerivedStats();
        loadCharacterSheet();
    }

    function updateStatPoints() {
        let usedStatPoints = 0;
        for (const stat in statElements) {
            usedStatPoints += parseInt(statElements[stat].value) - statBaseValues[stat];
        }
        statPointsElement.value = availableStatPoints - usedStatPoints;
    }

    function distributeStatPoints(stat) {
        const newValue = parseInt(statElements[stat].value);
        const oldValue = statBaseValues[stat];
        const newAvailableStatPoints = availableStatPoints - (newValue - oldValue);

        if (newAvailableStatPoints >= 0) {
            statBaseValues[stat] = newValue;
            availableStatPoints = newAvailableStatPoints;
            updateStatPoints();
            updateDerivedStats();
            saveCharacterSheet();
        } else {
            statElements[stat].value = oldValue;
            alert('Not enough stat points available.');
        }
    }

    function updateDerivedStats() {
        const stamina = parseInt(statElements.stamina.value);
        const intelligence = parseInt(statElements.intelligence.value);
        
        derivedStatElements.hp.value = stamina * 5;
        derivedStatElements.mp.value = intelligence * 5;
        saveCharacterSheet();
    }

    for (const stat in statElements) {
        statElements[stat].addEventListener('input', () => distributeStatPoints(stat));
    }

    const characterName = document.querySelector('.character-name h2');
    const characterNameEditButton = document.querySelector('.character-name .edit-button');

    characterNameEditButton.addEventListener('click', () => {
        const newName = prompt('Enter new character name:', characterName.textContent);
        if (newName) {
            characterName.textContent = newName;
            saveCharacterSheet();
        }
    });

    function saveCharacterSheet() {
        const characterData = {
            name: characterName.textContent,
            level: document.getElementById('level').value,
            stats: {},
            derivedStats: {
                hp: derivedStatElements.hp.value,
                mp: derivedStatElements.mp.value,
                ar: derivedStatElements.ar.value
            },
            statPoints: statPointsElement.value,
            skillPoints: document.getElementById('skill-points').value,
            inventory: inventory,
            equippedWeapon: equippedWeapon ? equippedWeapon.name : null,
            equippedWearables: equippedWearables.map(wearable => wearable.name)
        };

        for (const stat in statElements) {
            characterData.stats[stat] = statElements[stat].value;
        }

        localStorage.setItem('characterSheet', JSON.stringify(characterData));
    }

    function loadCharacterSheet() {
        const savedData = localStorage.getItem('characterSheet');
        if (savedData) {
            const characterData = JSON.parse(savedData);
            characterName.textContent = characterData.name;
            document.getElementById('level').value = characterData.level;
            for (const stat in characterData.stats) {
                statElements[stat].value = characterData.stats[stat];
                statBaseValues[stat] = parseInt(characterData.stats[stat]);
            }
            derivedStatElements.hp.value = characterData.derivedStats.hp;
            derivedStatElements.mp.value = characterData.derivedStats.mp;
            derivedStatElements.ar.value = characterData.derivedStats.ar;
            statPointsElement.value = characterData.statPoints;
            document.getElementById('skill-points').value = characterData.skillPoints;
            availableStatPoints = parseInt(characterData.statPoints);
            loadInventory(characterData.inventory);
            if (characterData.equippedWeapon) {
                equipWeapon(weapons[characterData.equippedWeapon], characterData.equippedWeapon);
            }
            characterData.equippedWearables.forEach(wearableName => {
                equipWearable(wearables.find(w => w.name === wearableName), wearableName);
            });
        }
    }

    function loadInventory(savedInventory) {
        inventory = savedInventory || [];
        updateInventoryDisplay();
    }

    // Other existing functions for managing inventory, wearables, etc.

    initializeStats();

    document.getElementById('level').addEventListener('input', updateLevel);

    function updateLevel() {
        const level = parseInt(document.getElementById('level').value);

        if (level === 1) {
            availableStatPoints = 60;
            for (const stat in statElements) {
                statElements[stat].value = 10;
                statBaseValues[stat] = 10;
            }
        } else {
            const previousLevelStatPoints = (level - 2) * 2;
            const currentLevelStatPoints = (level - 1) * 2;
            availableStatPoints += (currentLevelStatPoints - previousLevelStatPoints);
        }
        statPointsElement.value = availableStatPoints;

        let skillPoints;
        if (level <= 5) {
            skillPoints = level * 6;
        } else if (level <= 10) {
            skillPoints = 5 * 6 + (level - 5) * 8;
        } else if (level <= 15) {
            skillPoints = 5 * 6 + 5 * 8 + (level - 10) * 10;
        } else if (level <= 20) {
            skillPoints = 5 * 6 + 5 * 8 + 5 * 10 + (level - 15) * 12;
        } else {
            skillPoints = 5 * 6 + 5 * 8 + 5 * 10 + 5 * 12 + (level - 20) * 14;
        }
        document.getElementById('skill-points').value = skillPoints;
        availableSkillPoints = skillPoints;

        for (const skill in skillElements) {
            skillBaseValues[skill] = parseInt(skillElements[skill].value);
        }
        for (const stat in statElements) {
            statBaseValues[stat] = parseInt(statElements[stat].value);
        }
        updateDerivedStats();
        saveCharacterSheet();
    }

    // Add event listeners to save character sheet data on change
    document.querySelectorAll('input').forEach(input => {
        input.addEventListener('change', saveCharacterSheet);
    });

    // Initialize data loading and saving
    Promise.all([
        fetch('classes.json').then(response => response.json()).then(data => classes = data),
        fetch('races.json').then(response => response.json()).then(data => races = data),
        fetch('weapons.json').then(response => response.json()).then(data => weapons = data),
        fetch('items.json').then(response => response.json()).then(data => items = data),
        fetch('wearables.json').then(response => response.json()).then(data => wearables = data)
    ]).then(() => {
        // Populate the dropdowns
        for (const className in classes) {
            const option = document.createElement('option');
            option.value = className;
            option.textContent = className.charAt(0).toUpperCase() + className.slice(1);
            classSelect.appendChild(option);
        }

        for (const raceName in races) {
            const option = document.createElement('option');
            option.value = raceName;
            option.textContent = raceName.charAt(0).toUpperCase() + raceName.slice(1);
            raceSelect.appendChild(option);
        }

        for (const weaponName in weapons) {
            const option = document.createElement('option');
            option.value = weaponName;
            option.textContent = weaponName;
            weaponSelect.appendChild(option);
        }

        items.forEach(item => {
            const option = document.createElement('option');
            option.value = item.itemName;
            option.textContent = item.itemName;
            itemSelect.appendChild(option);
        });

        wearables.forEach(wearable => {
            const option = document.createElement('option');
            option.value = wearable.itemName;
            option.textContent = wearable.itemName;
            wearableSelect.appendChild(option);
        });

        loadCharacterSheet();
    }).catch(error => {
        console.error('Error loading data:', error);
    });

    raceSelect.addEventListener('change', () => {
        const selectedRace = raceSelect.value;
        if (selectedRace) {
            const raceData = races[selectedRace];
            currentRaceBuffs = raceData.buffs;
            currentRaceAbilities = raceData.abilities || [];
            applyBuffs();
            displayAbilities();
        }
    });

    classSelect.addEventListener('change', () => {
        const selectedClass = classSelect.value;
        if (selectedClass) {
            const classData = classes[selectedClass];
            currentClassBuffs = classData.buff;
            currentClassAbilities = classData.abilities || [];
            applyBuffs();
            displayAbilities();
        }
    });

    function resetBuffs() {
        for (const stat in statBaseValues) {
            statElements[stat].value = statBaseValues[stat];
        }
    }

    function applyBuffs() {
        resetBuffs();
        for (const stat in currentRaceBuffs) {
            if (statElements[stat]) {
                statElements[stat].value = parseInt(statElements[stat].value) + currentRaceBuffs[stat];
            }
        }
        for (const stat in currentClassBuffs) {
            if (statElements[stat]) {
                statElements[stat].value = parseInt(statElements[stat].value) + currentClassBuffs[stat];
            }
        }
        updateDerivedStats();
    }

    function displayAbilities() {
        const abilitiesList = document.getElementById('abilities-list');
        abilitiesList.innerHTML = '';
        const allAbilities = [...currentRaceAbilities, ...currentClassAbilities];
        allAbilities.forEach(ability => {
            const abilityDiv = document.createElement('div');
            abilityDiv.className = 'ability';
            abilityDiv.innerHTML = `
                <div class="ability-inner">
                    <div class="ability-front">
                        <h4>${ability.name}</h4>
                    </div>
                    <div class="ability-back">
                        <h4>${ability.name}</h4>
                        <p>${ability.description}</p>
                        <p><strong>Effect:</strong> ${ability.effect}</p>
                    </div>
                </div>
            `;
            abilitiesList.appendChild(abilityDiv);

            abilityDiv.addEventListener('click', () => {
                abilityDiv.classList.toggle('flipped');
                abilityDiv.classList.toggle('expanded');
            });
        });
    }

    function applyWeaponEffects(weapon) {
        for (const [stat, value] of Object.entries(weapon.statBuffs)) {
            const statElement = document.getElementById(stat);
            if (statElement) {
                statElement.value = parseInt(statElement.value) + value;
            }
        }

        weapon.uniqueAbilities.forEach(ability => {
            const abilityDiv = document.createElement('div');
            abilityDiv.className = 'ability';
            abilityDiv.innerHTML = `
                <div class="ability-inner">
                    <div class="ability-front">
                        <h4>${ability.name}</h4>
                    </div>
                    <div class="ability-back">
                        <h4>${ability.name}</h4>
                        <p>${ability.description}</p>
                        <p><strong>Effect:</strong> ${ability.effect}</p>
                    </div>
                </div>
            `;
            abilitiesList.appendChild(abilityDiv);

            abilityDiv.addEventListener('click', () => {
                abilityDiv.classList.toggle('flipped');
                abilityDiv.classList.toggle('expanded');
            });
        });
    }

    function removeWeaponEffects(weapon) {
        for (const [stat, value] of Object.entries(weapon.statBuffs)) {
            const statElement = document.getElementById(stat);
            if (statElement) {
                statElement.value = parseInt(statElement.value) - value;
            }
        }

        const abilityElements = abilitiesList.getElementsByClassName('ability');
        while (abilityElements.length > 0) {
            abilityElements[0].remove();
        }
    }

    function displayWeaponAction(weapon) {
        weaponActionsList.innerHTML = `
            <div class="action">
                <h4>Attack with ${weapon.name}</h4>
                <p>Type: ${weapon.type}</p>
                <p>Damage: ${weapon.damageAmount} (${weapon.damageType})</p>
                <p>Range: ${weapon.melee ? 'Melee' : 'Ranged'}</p>
                <p>Hands Required: ${weapon.handsRequired}</p>
                <p>Rarity: ${weapon.rarity}</p>
                ${weapon.requirements ? `<p>Requirements: ${Object.entries(weapon.requirements).map(([stat, value]) => `${stat}: ${value}`).join(', ')}</p>` : ''}
                ${weapon.statBuffs ? `<p>Stat Buffs: ${Object.entries(weapon.statBuffs).map(([stat, value]) => `${stat}: ${value}`).join(', ')}</p>` : ''}
                ${weapon.skillBuffs ? `<p>Skill Buffs: ${Object.entries(weapon.skillBuffs).map(([skill, value]) => `${skill}: ${value}`).join(', ')}</p>` : ''}
                ${weapon.uniqueAbilities.length ? `<p>Unique Abilities: ${weapon.uniqueAbilities.map(ability => `<strong>${ability.name}</strong>: ${ability.description}`).join('<br>')}</p>` : ''}
                ${weapon.spellAccess.length ? `<p>Spell Access: ${weapon.spellAccess.join(', ')}</p>` : ''}
                ${weapon.hpBuffs.length ? `<p>HP Buffs: ${weapon.hpBuffs.join(', ')}</p>` : ''}
                ${weapon.mpBuffs.length ? `<p>MP Buffs: ${weapon.mpBuffs.join(', ')}</p>` : ''}
            </div>
        `;
    }

    function equipWeapon(weapon, weaponName) {
        if (equippedWeapon) {
            removeWeaponEffects(equippedWeapon);
        }
        equippedWeapon = weapon;
        equippedWeaponDiv.innerHTML = `<p>${weaponName}</p>`;
        unequipWeaponButton.style.display = 'block';
        applyWeaponEffects(weapon);
        displayWeaponAction(weapon);
        saveCharacterSheet();
    }

    function unequipWeapon() {
        if (equippedWeapon) {
            removeWeaponEffects(equippedWeapon);
            equippedWeapon = null;
            equippedWeaponDiv.innerHTML = '<p>No weapon equipped.</p>';
            unequipWeaponButton.style.display = 'none';
            weaponActionsList.innerHTML = '';
            saveCharacterSheet();
        }
    }

    addWeaponButton.addEventListener('click', () => {
        const selectedWeaponName = weaponSelect.value;
        const selectedWeapon = weapons[selectedWeaponName];

        if (selectedWeapon) {
            const weaponDiv = document.createElement('div');
            weaponDiv.className = 'inventory-item';
            weaponDiv.textContent = selectedWeaponName;

            const equipButton = document.createElement('button');
            equipButton.textContent = 'Equip';
            equipButton.className = 'equip-weapon-button';
            weaponDiv.appendChild(equipButton);

            weaponList.appendChild(weaponDiv);

            equipButton.addEventListener('click', () => {
                equipWeapon(selectedWeapon, selectedWeaponName);
            });

            const removeButton = document.createElement('button');
            removeButton.textContent = 'Remove';
            removeButton.className = 'remove-item-button';
            weaponDiv.appendChild(removeButton);

            removeButton.addEventListener('click', () => {
                if (equippedWeapon === selectedWeapon) {
                    unequipWeapon();
                }
                weaponDiv.remove();
                saveCharacterSheet();
            });
        }
    });

    unequipWeaponButton.addEventListener('click', () => {
        unequipWeapon();
    });

    function applyItemEffects(item) {
        for (const [stat, value] of Object.entries(item.statBuffs)) {
            const statElement = document.getElementById(stat);
            if (statElement) {
                statElement.value = parseInt(statElement.value) + value;
            }
        }

        for (const [skill, value] of Object.entries(item.skillBuffs)) {
            const skillElement = document.getElementById(skill);
            if (skillElement) {
                skillElement.value = parseInt(skillElement.value) + value;
            }
        }

        item.uniqueAbilities.forEach(ability => {
            const abilityDiv = document.createElement('div');
            abilityDiv.className = 'ability';
            abilityDiv.innerHTML = `
                <div class="ability-inner">
                    <div class="ability-front">
                        <h4>${ability.name}</h4>
                    </div>
                    <div class="ability-back">
                        <h4>${ability.name}</h4>
                        <p>${ability.description}</p>
                        <p><strong>Effect:</strong> ${ability.effect}</p>
                    </div>
                </div>
            `;
            abilitiesList.appendChild(abilityDiv);

            abilityDiv.addEventListener('click', () => {
                abilityDiv.classList.toggle('flipped');
                abilityDiv.classList.toggle('expanded');
            });
        });

        // Apply HP and MP buffs
        item.hpBuffs.forEach(buff => {
            const hpElement = document.getElementById('hp');
            if (hpElement) {
                hpElement.value = parseInt(hpElement.value) + buff;
            }
        });

        item.mpBuffs.forEach(buff => {
            const mpElement = document.getElementById('mp');
            if (mpElement) {
                mpElement.value = parseInt(mpElement.value) + buff;
            }
        });
        saveCharacterSheet();
    }

    function removeItemEffects(item) {
        for (const [stat, value] of Object.entries(item.statBuffs)) {
            const statElement = document.getElementById(stat);
            if (statElement) {
                statElement.value = parseInt(statElement.value) - value;
            }
        }

        for (const [skill, value] of Object.entries(item.skillBuffs)) {
            const skillElement = document.getElementById(skill);
            if (skillElement) {
                skillElement.value = parseInt(skillElement.value) - value;
            }
        }

        const abilityElements = abilitiesList.getElementsByClassName('ability');
        while (abilityElements.length > 0) {
            abilityElements[0].remove();
        }

        // Remove HP and MP buffs
        item.hpBuffs.forEach(buff => {
            const hpElement = document.getElementById('hp');
            if (hpElement) {
                hpElement.value = parseInt(hpElement.value) - buff;
            }
        });

        item.mpBuffs.forEach(buff => {
            const mpElement = document.getElementById('mp');
            if (mpElement) {
                mpElement.value = parseInt(mpElement.value) - buff;
            }
        });
        saveCharacterSheet();
    }

    function useItem(item, itemName) {
        const itemIndex = inventory.findIndex(i => i.name === itemName);
        if (itemIndex !== -1) {
            applyItemEffects(item);
            inventory[itemIndex].count--;
            if (inventory[itemIndex].count <= 0) {
                inventory.splice(itemIndex, 1);
            }
            updateInventoryDisplay();
            saveCharacterSheet();
        }
    }

    function addItemToInventory(item, itemName) {
        const existingItemIndex = inventory.findIndex(i => i.name === itemName);
        if (existingItemIndex !== -1) {
            inventory[existingItemIndex].count++;
        } else {
            inventory.push({ name: itemName, item: item, count: 1 });
        }
        updateInventoryDisplay();
        saveCharacterSheet();
    }

    function updateInventoryDisplay() {
        inventoryList.innerHTML = '';
        inventory.forEach(({ name, item, count }) => {
            const itemDiv = document.createElement('div');
            itemDiv.className = 'inventory-item';
            itemDiv.textContent = `${name} (x${count})`;

            const useButton = document.createElement('button');
            useButton.textContent = 'Use';
            useButton.className = 'use-item-button';
            itemDiv.appendChild(useButton);

            inventoryList.appendChild(itemDiv);

            useButton.addEventListener('click', () => {
                useItem(item, name);
            });

            const removeButton = document.createElement('button');
            removeButton.textContent = 'Remove';
            removeButton.className = 'remove-item-button';
            itemDiv.appendChild(removeButton);

            removeButton.addEventListener('click', () => {
                removeItemEffects(item);
                const itemIndex = inventory.findIndex(i => i.name === name);
                if (itemIndex !== -1) {
                    inventory.splice(itemIndex, 1);
                }
                updateInventoryDisplay();
                saveCharacterSheet();
            });
        });
    }

    addItemButton.addEventListener('click', () => {
        const selectedItemName = itemSelect.value;
        const selectedItem = items.find(item => item.itemName === selectedItemName);

        if (selectedItem) {
            addItemToInventory(selectedItem, selectedItemName);
        }
    });

    function applyWearableEffects(wearable) {
        for (const [stat, value] of Object.entries(wearable.statBuffs)) {
            const statElement = document.getElementById(stat);
            if (statElement) {
                statElement.value = parseInt(statElement.value) + value;
            }
        }

        for (const [skill, value] of Object.entries(wearable.skillBuffs)) {
            const skillElement = document.getElementById(skill);
            if (skillElement) {
                skillElement.value = parseInt(skillElement.value) + value;
            }
        }

        wearable.uniqueAbilities.forEach(ability => {
            const abilityDiv = document.createElement('div');
            abilityDiv.className = 'ability';
            abilityDiv.innerHTML = `
                <div class="ability-inner">
                    <div class="ability-front">
                        <h4>${ability.name}</h4>
                    </div>
                    <div class="ability-back">
                        <h4>${ability.name}</h4>
                        <p>${ability.description}</p>
                        <p><strong>Effect:</strong> ${ability.effect}</p>
                    </div>
                </div>
            `;
            abilitiesList.appendChild(abilityDiv);

            abilityDiv.addEventListener('click', () => {
                abilityDiv.classList.toggle('flipped');
                abilityDiv.classList.toggle('expanded');
            });
        });

        // Apply HP and MP buffs
        wearable.hpBuffs.forEach(buff => {
            const hpElement = document.getElementById('hp');
            if (hpElement) {
                hpElement.value = parseInt(hpElement.value) + buff;
            }
        });

        wearable.mpBuffs.forEach(buff => {
            const mpElement = document.getElementById('mp');
            if (mpElement) {
                mpElement.value = parseInt(mpElement.value) + buff;
            }
        });

        if (wearable.armorRating > baseArmorRating) {
            currentArmorRating += (wearable.armorRating - baseArmorRating);
        }
        derivedStatElements.ar.value = currentArmorRating;
        saveCharacterSheet();
    }

    function removeWearableEffects(wearable) {
        for (const [stat, value] of Object.entries(wearable.statBuffs)) {
            const statElement = document.getElementById(stat);
            if (statElement) {
                statElement.value = parseInt(statElement.value) - value;
            }
        }

        for (const [skill, value] of Object.entries(wearable.skillBuffs)) {
            const skillElement = document.getElementById(skill);
            if (skillElement) {
                skillElement.value = parseInt(skillElement.value) - value;
            }
        }

        const abilityElements = abilitiesList.getElementsByClassName('ability');
        while (abilityElements.length > 0) {
            abilityElements[0].remove();
        }

        // Remove HP and MP buffs
        wearable.hpBuffs.forEach(buff => {
            const hpElement = document.getElementById('hp');
            if (hpElement) {
                hpElement.value = parseInt(hpElement.value) - buff;
            }
        });

        wearable.mpBuffs.forEach(buff => {
            const mpElement = document.getElementById('mp');
            if (mpElement) {
                mpElement.value = parseInt(mpElement.value) - buff;
            }
        });

        if (wearable.armorRating > baseArmorRating) {
            currentArmorRating -= (wearable.armorRating - baseArmorRating);
        }
        derivedStatElements.ar.value = currentArmorRating;
        saveCharacterSheet();
    }

    function equipWearable(wearable, wearableName) {
        if (equippedWearables.find(w => w.itemName === wearableName)) {
            alert("This item is already equipped.");
            return;
        }

        equippedWearables.push(wearable);
        applyWearableEffects(wearable);

        const wearableDiv = document.createElement('div');
        wearableDiv.className = 'inventory-item';
        wearableDiv.textContent = wearableName;

        const unequipButton = document.createElement('button');
        unequipButton.textContent = 'Unequip';
        unequipButton.className = 'unequip-wearable-button';
        wearableDiv.appendChild(unequipButton);

        inventoryList.appendChild(wearableDiv);

        unequipButton.addEventListener('click', () => {
            unequipWearable(wearable, wearableDiv);
            saveCharacterSheet();
        });
    }

    function unequipWearable(wearable, wearableDiv) {
        removeWearableEffects(wearable);
        equippedWearables = equippedWearables.filter(w => w.itemName !== wearable.itemName);
        wearableDiv.remove();
        saveCharacterSheet();
    }

    addWearableButton.addEventListener('click', () => {
        const selectedWearableName = wearableSelect.value;
        const selectedWearable = wearables.find(wearable => wearable.itemName === selectedWearableName);

        if (selectedWearable) {
            equipWearable(selectedWearable, selectedWearableName);
        }
    });

    initializeStats();



});
