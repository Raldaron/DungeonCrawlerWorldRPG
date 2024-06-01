document.addEventListener('DOMContentLoaded', () => {
    let classes = {};
    let races = {};
    let items = []; // Define the items array
    let statBaseValues = {};
    let availableStatPoints = 0;

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

    function initializeStats() {
        for (const stat in statElements) {
            statElements[stat].value = 0; // Set all stats to 0 at initialization
            statBaseValues[stat] = 0;
        }
        availableStatPoints = 60; // Set initial available stat points to 60
        statPointsElement.value = availableStatPoints;
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
        } else {
            statElements[stat].value = oldValue; // Revert to old value if not enough points
            alert('Not enough stat points available.');
        }
    }

    for (const stat in statElements) {
        statElements[stat].addEventListener('input', () => distributeStatPoints(stat));
    }

    initializeStats();

    const editButton = document.querySelector('.edit-button');
    const characterName = document.querySelector('.character-name h2');
    const addItemButton = document.getElementById('add-item-button');
    const itemSelect = document.getElementById('item-select');
    const inventoryList = document.getElementById('inventory-list');
    const meleeActions = document.getElementById('melee-actions');
    const magicActions = document.getElementById('magic-actions');
    const actionDetailsList = document.getElementById('action-details-list');
    const abilitiesList = document.getElementById('abilities-list');
    const raceSelect = document.getElementById('race-select');
    const classSelect = document.getElementById('class-select');
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
    let availableSkillPoints = parseInt(document.getElementById('skill-points').value);
    let currentClassBuffs = {};
    let currentRaceBuffs = {};
    let currentClassAbilities = [];
    let currentRaceAbilities = [];

    for (const skill in skillElements) {
        skillBaseValues[skill] = parseInt(skillElements[skill].value);
    }

    function adjustSkill(skill) {
        const skillElement = skillElements[skill];
        const newValue = parseInt(skillElement.value);
        const oldValue = skillBaseValues[skill];
        const cost = calculateSkillCost(oldValue, newValue);

        if (cost > 0) {
            if (cost <= availableSkillPoints) {
                availableSkillPoints -= cost;
                skillBaseValues[skill] = newValue;
                document.getElementById('skill-points').value = availableSkillPoints;
            } else {
                alert('Not enough skill points available.');
                skillElement.value = oldValue;
            }
        } else {
            const refund = -cost;
            availableSkillPoints += refund;
            skillBaseValues[skill] = newValue;
            document.getElementById('skill-points').value = availableSkillPoints;
        }
    }

    function calculateSkillCost(oldValue, newValue) {
        let cost = 0;
        if (newValue > oldValue) {
            for (let i = oldValue + 1; i <= newValue; i++) {
                cost += i;
            }
        } else {
            for (let i = newValue + 1; i <= oldValue; i++) {
                cost -= i;
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
            availableStatPoints = 60; // Set initial available stat points to 60
            for (const stat in statElements) {
                statElements[stat].value = 0; // Set stats to 0
                statBaseValues[stat] = 0;
            }
        } else {
            const previousLevelStatPoints = (level - 2) * 2; // Calculate stat points for the previous level
            const currentLevelStatPoints = (level - 1) * 2; // Calculate stat points for the current level
            availableStatPoints += (currentLevelStatPoints - previousLevelStatPoints); // Add the difference to available stat points
        }
        document.getElementById('stat-points').value = availableStatPoints; // Update the display of available stat points

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
        document.getElementById('skill-points').value = skillPoints; // Update the display of available skill points
        availableSkillPoints = skillPoints;

        for (const skill in skillElements) {
            skillBaseValues[skill] = parseInt(skillElements[skill].value);
        }
        for (const stat in statElements) {
            statBaseValues[stat] = parseInt(statElements[stat].value);
        }
    }

    Promise.all([
        fetch('classes.json').then(response => response.json()).then(data => classes = data),
        fetch('races.json').then(response => response.json()).then(data => races = data)
    ]).then(() => {
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
    });

    raceSelect.addEventListener('change', () => {
        const selectedRace = raceSelect.value;
        if (selectedRace) {
            const raceData = races[selectedRace];
            currentRaceBuffs = raceData.buffs; // Update current race buffs
            currentRaceAbilities = raceData.abilities || []; // Update current race abilities
            applyBuffs();
            displayAbilities();
        }
    });

    classSelect.addEventListener('change', () => {
        const selectedClass = classSelect.value;
        if (selectedClass) {
            const classData = classes[selectedClass];
            currentClassBuffs = classData.buff; // Update current class buffs
            currentClassAbilities = classData.abilities || []; // Update current class abilities
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
                        <p><strong>Ability Point Cost:</strong> ${ability.cost}</p>
                        <p><strong>Cooldown:</strong> ${ability.cooldown}</p>
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

    document.querySelector('.edit-button').addEventListener('click', () => {
        const characterName = document.querySelector('.character-name h2');
        const newName = prompt('Enter new character name:', characterName.textContent);
        if (newName !== null && newName.trim() !== '') {
            characterName.textContent = newName;
        }
    });

    document.getElementById('add-item-button').addEventListener('click', () => {
        const selectedItemName = document.getElementById('item-select').value;
        const selectedItem = items.find(item => item.name.toLowerCase() === selectedItemName);

        if (selectedItem) {
            const itemDiv = document.createElement('div');
            itemDiv.className = 'inventory-item';
            itemDiv.textContent = selectedItem.name;
            const removeButton = document.createElement('button');
            removeButton.textContent = 'Remove';
            removeButton.className = 'remove-item-button';
            itemDiv.appendChild(removeButton);
            document.getElementById('inventory-list').appendChild(itemDiv);

            for (const [stat, value] of Object.entries(selectedItem.effects)) {
                const statInput = document.getElementById(stat);
                statInput.value = parseInt(statInput.value) + value;
            }

            for (const [category, actions] of Object.entries(selectedItem.actions)) {
                actions.forEach(action => {
                    const actionDiv = document.createElement('div');
                    actionDiv.className = 'action';
                    actionDiv.textContent = action;
                    if (category === 'melee') {
                        document.getElementById('melee-actions').appendChild(actionDiv);
                    } else if (category === 'magic') {
                        document.getElementById('magic-actions').appendChild(actionDiv);
                    }
                });
            }

            removeButton.addEventListener('click', () => {
                itemDiv.remove();
                for (const [stat, value] of Object.entries(selectedItem.effects)) {
                    const statInput = document.getElementById(stat);
                    statInput.value = parseInt(statInput.value) - value;
                }
            });
        }
    });

    initializeStats();
});
