document.addEventListener('DOMContentLoaded', () => {
    let classes = {};
    let races = {};
    let weapons = {};
    let items = [];
    let wearables = [];
    let statBaseValues = {};
    let availableStatPoints = 0;
    let availableSkillPoints = 0;

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
    const skillPointsElement = document.getElementById('skill-points');

    function saveData() {
        const data = {
            statBaseValues,
            availableStatPoints,
            availableSkillPoints,
            currentArmorRating,
            skillBaseValues,
            currentClass,
            currentRace,
            currentClassBuffs,
            currentRaceBuffs,
            currentClassAbilities,
            currentRaceAbilities,
            equippedWeapon,
            inventory,
            equippedWearables
        };
        localStorage.setItem('characterData', JSON.stringify(data));
    }

    function loadData() {
        const data = JSON.parse(localStorage.getItem('characterData'));
        if (data) {
            statBaseValues = data.statBaseValues;
            availableStatPoints = data.availableStatPoints;
            availableSkillPoints = data.availableSkillPoints;
            currentArmorRating = data.currentArmorRating;
            skillBaseValues = data.skillBaseValues;
            currentClass = data.currentClass;
            currentRace = data.currentRace;
            currentClassBuffs = data.currentClassBuffs;
            currentRaceBuffs = data.currentRaceBuffs;
            currentClassAbilities = data.currentClassAbilities;
            currentRaceAbilities = data.currentRaceAbilities;
            equippedWeapon = data.equippedWeapon;
            inventory = data.inventory;
            equippedWearables = data.equippedWearables;

            for (const stat in statElements) {
                statElements[stat].value = statBaseValues[stat];
            }
            statPointsElement.value = availableStatPoints;
            skillPointsElement.value = availableSkillPoints;

            applyBuffs();
            updateDerivedStats();
            updateInventoryDisplay();
            updateWearablesDisplay();
            if (equippedWeapon) {
                displayWeaponAction(equippedWeapon);
                equippedWeaponDiv.innerHTML = `<p>${equippedWeapon.weaponName}</p>`;
                unequipWeaponButton.style.display = 'block';
            }
        }
    }

    function initializeStats() {
        for (const stat in statElements) {
            statElements[stat].value = 0;
            statBaseValues[stat] = 0;
        }
        availableStatPoints = 60;
        availableSkillPoints = 25;
        statPointsElement.value = availableStatPoints;
        skillPointsElement.value = availableSkillPoints;
    }

    function updateStatPoints() {
        let usedStatPoints = 0;
        for (const stat in statElements) {
            usedStatPoints += parseInt(statElements[stat].value) - statBaseValues[stat];
        }
        statPointsElement.value = availableStatPoints - usedStatPoints;
        saveData();
    }

    function distributeStatPoints(stat) {
        const newValue = parseInt(statElements[stat].value);
        const oldValue = statBaseValues[stat];
        const newAvailableStatPoints = availableStatPoints - (newValue - oldValue);

        if (newAvailableStatPoints >= 0) {
            statBaseValues[stat] = newValue;
            availableStatPoints = newAvailableStatPoints;
            updateStatPoints();
        } else {
            statElements[stat].value = oldValue;
            alert('Not enough stat points available.');
        }
    }

    function updateDerivedStats() {
        const staminaValue = parseInt(statElements.stamina.value);
        const intelligenceValue = parseInt(statElements.intelligence.value);

        derivedStatElements.hp.value = staminaValue * 5; // HP = Stamina * 5
        derivedStatElements.mp.value = intelligenceValue * 5; // MP = Intelligence * 5
        saveData();
    }

    for (const stat in statElements) {
        statElements[stat].addEventListener('input', () => {
            distributeStatPoints(stat);
            updateDerivedStats(); // Ensure this is called whenever stats are updated
        });
    }

    initializeStats();

    const editButton = document.querySelector('.edit-button');
    const characterName = document.querySelector('.character-name h2');
    const addItemButton = document.getElementById('add-item-button');
    const addWearableButton = document.getElementById('add-wearable-button');
    const itemSelect = document.getElementById('item-select');
    const wearableSelect = document.getElementById('wearable-select');
    const inventoryList = document.getElementById('inventory-list');
    const abilitiesList = document.getElementById('abilities-list');
    const raceSelect = document.getElementById('race-select');
    const classSelect = document.getElementById('class-select');
    const weaponSelect = document.getElementById('weapon-select');
    const weaponList = document.getElementById('weapon-list');
    const addWeaponButton = document.getElementById('add-weapon-button');
    const equippedWeaponDiv = document.getElementById('equipped-weapon');
    const unequipWeaponButton = document.getElementById('unequip-weapon-button');
    const weaponActionsList = document.getElementById('weapon-actions-list');
    const derivedStatElements = {
        hp: document.getElementById('hp'),
        mp: document.getElementById('mp'),
        ar: document.getElementById('ar')
    };

    const skillElements = {
        insight: document.getElementById('insight'),
        performance: document.getElementById('performance'),
        intimidation: document.getElementById('intimidation'),
        leadership: document.getElementById('leadership'),
        persuasion: document.getElementById('persuasion'),
        senseDeception: document.getElementById('sense-deception'),
        streetwise: document.getElementById('streetwise'),
        melee: document.getElementById('melee'),
        pugilism: document.getElementById('pugilism'),
        sleightOfHand: document.getElementById('sleight-of-hand'),
        stealth: document.getElementById('stealth'),
        athletics: document.getElementById('athletics'),
        dodge: document.getElementById('dodge'),
        ride: document.getElementById('ride'),
        parry: document.getElementById('parry'),
        archery: document.getElementById('archery'),
        firearms: document.getElementById('firearms'),
        awareness: document.getElementById('awareness'),
        search: document.getElementById('search'),
        animalKen: document.getElementById('animal-ken'),
        survival: document.getElementById('survival'),
        scrounging: document.getElementById('scrounging'),
        crafting: document.getElementById('crafting'),
        repair: document.getElementById('repair'),
        sapper: document.getElementById('sapper'),
        nerdLore: document.getElementById('nerd-lore'),
        medicine: document.getElementById('medicine'),
        technology: document.getElementById('technology'),
        disguise: document.getElementById('disguise'),
        escapeArtistry: document.getElementById('escape-artistry'),
        vehicleOperation: document.getElementById('vehicle-operation')
    };

    let currentClass = null;
    let currentRace = null;
    let skillBaseValues = {};
    let currentClassBuffs = {};
    let currentRaceBuffs = {};
    let currentClassAbilities = [];
    let currentRaceAbilities = [];
    let equippedWeapon = null;
    let inventory = [];
    let equippedWearables = [];

    for (const skill in skillElements) {
        skillBaseValues[skill] = parseInt(skillElements[skill].value);
    }

    editButton.addEventListener('click', () => {
        // Create an input field for editing the name
        const input = document.createElement('input');
        input.type = 'text';
        input.value = characterNameElement.textContent;
        input.id = 'character-name-input';

        // Replace the character name element with the input field
        characterNameElement.replaceWith(input);
        input.focus();

        // Save the new name on blur (when clicking outside the input)
        input.addEventListener('blur', () => {
            saveCharacterName(input.value);
        });

        // Save the new name on Enter key press
        input.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
                saveCharacterName(input.value);
            }
        });
    });

    function saveCharacterName(newName) {
        // Replace the input field with the updated character name
        const nameElement = document.createElement('h2');
        nameElement.id = 'character-name';
        nameElement.textContent = newName;

        const input = document.getElementById('character-name-input');
        input.replaceWith(nameElement);

        // Save the new name to localStorage
        const data = JSON.parse(localStorage.getItem('characterData')) || {};
        data.characterName = newName;
        localStorage.setItem('characterData', JSON.stringify(data));
    }

    function loadCharacterName() {
        const data = JSON.parse(localStorage.getItem('characterData'));
        if (data && data.characterName) {
            characterNameElement.textContent = data.characterName;
        }
    }

    loadCharacterName();

    function adjustSkill(skill) {
        const skillElement = skillElements[skill];
        const newValue = parseInt(skillElement.value);
        const oldValue = skillBaseValues[skill];
        const cost = calculateSkillCost(oldValue, newValue);

        if (cost > 0) {
            if (cost <= availableSkillPoints) {
                availableSkillPoints -= cost;
                skillBaseValues[skill] = newValue;
                skillPointsElement.value = availableSkillPoints;
            } else {
                alert('Not enough skill points available.');
                skillElement.value = oldValue;
            }
        } else {
            const refund = -cost;
            availableSkillPoints += refund;
            skillBaseValues[skill] = newValue;
            skillPointsElement.value = availableSkillPoints;
        }
        saveData();
    }

    function calculateSkillCost(oldValue, newValue) {
        let cost = 0;
        if (newValue > oldValue) {
            for (let i = oldValue + 1; i <= newValue; i++) {
                cost += i;
            }
        } else {
            for (let i = oldValue - 1; i >= newValue; i--) {
                cost += i;
            }
        }
        return cost;
    }

    for (const skill in skillElements) {
        skillElements[skill].addEventListener('input', () => adjustSkill(skill));
    }

    document.getElementById('level').addEventListener('input', updateLevel);

    function updateLevel() {
        const level = parseInt(document.getElementById('level').value);

        if (level === 1) {
            availableStatPoints = 60;
            availableSkillPoints = 25;
            for (const stat in statElements) {
                statElements[stat].value = 0;
                statBaseValues[stat] = 0;
            }
        } else {
            const previousLevelStatPoints = (level - 2) * 2;
            const currentLevelStatPoints = (level - 1) * 2;
            availableStatPoints += (currentLevelStatPoints - previousLevelStatPoints);

            let skillPoints;
            if (level <= 5) {
                skillPoints = 25 + (level - 1) * 6; // Starting skill points 25 + 6 per level up to level 5
            } else if (level <= 10) {
                skillPoints = 25 + 5 * 6 + (level - 5) * 8;
            } else if (level <= 15) {
                skillPoints = 25 + 5 * 6 + 5 * 8 + (level - 10) * 10;
            } else if (level <= 20) {
                skillPoints = 25 + 5 * 6 + 5 * 8 + 5 * 10 + (level - 15) * 12;
            } else {
                skillPoints = 25 + 5 * 6 + 5 * 8 + 5 * 10 + 5 * 12 + (level - 20) * 14;
            }
            availableSkillPoints = skillPoints;
        }

        document.getElementById('stat-points').value = availableStatPoints;
        document.getElementById('skill-points').value = availableSkillPoints;

        for (const skill in skillElements) {
            skillBaseValues[skill] = parseInt(skillElements[skill].value);
        }
        for (const stat in statElements) {
            statBaseValues[stat] = parseInt(statElements[stat].value);
        }

               // Apply buffs and update derived stats after leveling up
               applyBuffs();
               updateDerivedStats();
               saveData();
           }
       
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
       
               // Load data from localStorage if it exists
               loadData();
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
                   saveData();
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
                   saveData();
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
               saveData();
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
               saveData();
           }
       
           function applyWeaponEffects(weapon) {
               for (const [stat, value] of Object.entries(weapon.statBuffs)) {
                   const statElement = document.getElementById(stat);
                   if (statElement) {
                       statElement.value = parseInt(statElement.value) + value;
                   }
               }
       
               weapon.weaponAbilities.forEach(ability => {
                   const abilityDiv = document.createElement('div');
                   abilityDiv.className = 'ability';
                   abilityDiv.innerHTML = `
                       <div class="ability-inner">
                           <div class="ability-front">
                               <h4>${ability.abilityName}</h4>
                           </div>
                           <div class="ability-back">
                               <h4>${ability.abilityName}</h4>
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
               saveData();
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
               saveData();
           }
       
           function displayWeaponAction(weapon) {
               weaponActionsList.innerHTML = `
                   <div class="action">
                       <h4>Attack with ${weapon.weaponName}</h4>
                       <p>Type: ${weapon.weaponType}</p>
                       <p>Damage: ${weapon.damageAmount} (${weapon.damageType})</p>
                       <p>Range: ${weapon.meleeRanged === 'Melee' ? 'Melee' : 'Ranged'}</p>
                       ${weapon.weaponAbilities.length ? `<p>Unique Abilities: ${weapon.weaponAbilities.map(ability => `<strong>${ability.abilityName}</strong>: ${ability.description}`).join('<br>')}</p>` : ''}
                   </div>
               `;
               saveData();
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
               saveData();
           }
       
           function unequipWeapon() {
               if (equippedWeapon) {
                   removeWeaponEffects(equippedWeapon);
                   equippedWeapon = null;
                   equippedWeaponDiv.innerHTML = '<p>No weapon equipped.</p>';
                   unequipWeaponButton.style.display = 'none';
                   weaponActionsList.innerHTML = '';
               }
               saveData();
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
       
                   weaponDiv.addEventListener('click', () => {
                       weaponDiv.classList.toggle('flipped');
                       if (weaponDiv.classList.contains('flipped')) {
                           const requirements = Object.entries(selectedWeapon.statSkillRequirements)
                               .filter(([_, value]) => value > 0)
                               .map(([stat, value]) => `${stat}: ${value}`)
                               .join(', ');
       
                           const statBuffs = Object.entries(selectedWeapon.statBuffs)
                               .filter(([_, value]) => value > 0)
                               .map(([stat, value]) => `${stat}: ${value}`)
                               .join(', ');
       
                           const skillBuffs = Object.entries(selectedWeapon.skillBuffs)
                               .filter(([_, value]) => value > 0)
                               .map(([skill, value]) => `${skill}: ${value}`)
                               .join(', ');
       
                           const uniqueAbilities = selectedWeapon.weaponAbilities
                               .map(ability => `<strong>${ability.abilityName}</strong>`)
                               .join(', ');
       
                           weaponDiv.innerHTML = `
                               <div class="inventory-item-front">
                                   <h4>${selectedWeaponName}</h4>
                                   <button class="equip-weapon-button">Equip</button>
                               </div>
                               <div class="inventory-item-back">
                                   <p>${selectedWeapon.description}</p>
                                   ${requirements ? `<p>Requirements: ${requirements}</p>` : ''}
                                   ${statBuffs ? `<p>Stat Buffs: ${statBuffs}</p>` : ''}
                                   ${skillBuffs ? `<p>Skill Buffs: ${skillBuffs}</p>` : ''}
                                   ${uniqueAbilities ? `<p>Unique Abilities: ${uniqueAbilities}</p>` : ''}
                               </div>
                           `;
                           const newEquipButton = weaponDiv.querySelector('.equip-weapon-button');
                           newEquipButton.addEventListener('click', () => {
                               equipWeapon(selectedWeapon, selectedWeaponName);
                           });
                       } else {
                           weaponDiv.innerHTML = `
                               <h4>${selectedWeaponName}</h4>
                               <button class="equip-weapon-button">Equip</button>
                           `;
                           const newEquipButton = weaponDiv.querySelector('.equip-weapon-button');
                           newEquipButton.addEventListener('click', () => {
                               equipWeapon(selectedWeapon, selectedWeaponName);
                           });
                       }
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
               saveData();
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
               saveData();
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
               saveData();
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
               saveData();
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
               saveData();
           }
       
           function equipWearable(wearable, wearableName) {
            // Check if the item is already equipped
            if (equippedWearables.find(w => w.itemName === wearableName)) {
                alert("This item is already equipped.");
                return;
            }
    
            // Add the wearable to the equipped wearables list
            equippedWearables.push(wearable);
            applyWearableEffects(wearable);
            updateWearablesDisplay();
            saveData();
        }
    
        function unequipWearable(wearable, wearableDiv) {
            removeWearableEffects(wearable);
            equippedWearables = equippedWearables.filter(w => w.itemName !== wearable.itemName);
            wearableDiv.remove();
            updateWearablesDisplay();
            saveData();
        }
    
        function updateWearablesDisplay() {
            const wearablesList = document.getElementById('wearables-list');
            wearablesList.innerHTML = ''; // Clear the list to prevent duplicates
    
            equippedWearables.forEach(wearable => {
                const wearableDiv = document.createElement('div');
                wearableDiv.className = 'inventory-item';
                wearableDiv.textContent = wearable.itemName;
    
                const unequipButton = document.createElement('button');
                unequipButton.textContent = 'Unequip';
                unequipButton.className = 'unequip-wearable-button';
                wearableDiv.appendChild(unequipButton);
    
                wearablesList.appendChild(wearableDiv);
    
                unequipButton.addEventListener('click', () => {
                    unequipWearable(wearable, wearableDiv);
                });
            });
        }
    
        addWearableButton.addEventListener('click', () => {
            const selectedWearableName = wearableSelect.value;
            const selectedWearable = wearables.find(wearable => wearable.itemName === selectedWearableName);
    
            if (selectedWearable) {
                equipWearable(selectedWearable, selectedWearableName);
            }
        });
    
        initializeStats();
        updateDerivedStats();
    });
       
              
       