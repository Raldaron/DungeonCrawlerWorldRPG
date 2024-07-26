// CharacterModule
const CharacterModule = (function () {
    let characterData = {
        name: "Crawler # 3,281,130",
        level: 1,
        race: "Human",
        class: "Boring Ol' Fighter",
        armorRating: 10,
        currentHp: 50,
        totalHp: 50,
        currentMp: 30,
        totalMp: 30,
        abilityPointPool: 5,
        currentViews: 100,
        followers: 50,
        favorites: 20,
        availableVitalPoints: 12,
        availableSkillPoints: 18,
        vitals: {
            strength: 0,
            dexterity: 0,
            stamina: 0,
            intelligence: 0,
            perception: 0,
            wit: 0,
            charisma: 0,
            manipulation: 0,
            appearance: 0
        },
        raceBonuses: {},
        classBonuses: {},
        currentRaceBonuses: {},
        currentClassBonuses: {},
        manualAdjustments: {},
        equippedItems: {},
    };

    function setVitals(vital, value) {
        if (characterData.vitals.hasOwnProperty(vital)) {
            characterData.vitals[vital] = value;
        }
    }

    function getVitals() {
        return { ...characterData.vitals };
    }

    function calculatePointsForLevelChange(oldLevel, newLevel) {
        let vitalPoints = 0;
        let skillPoints = 0;
        const start = Math.min(oldLevel, newLevel) + 1;
        const end = Math.max(oldLevel, newLevel);
        const isLevelUp = newLevel > oldLevel;

        for (let i = start; i <= end; i++) {
            let vitalDelta, skillDelta;
            if (i <= 20) {
                vitalDelta = 2;
                skillDelta = 4;
            } else if (i <= 40) {
                vitalDelta = 4;
                skillDelta = 6;
            } else if (i <= 60) {
                vitalDelta = 6;
                skillDelta = 8;
            } else {
                vitalDelta = 8;
                skillDelta = 10;
            }

            vitalPoints += isLevelUp ? vitalDelta : -vitalDelta;
            skillPoints += isLevelUp ? skillDelta : -skillDelta;
        }

        console.log(`Calculated points change - Vital: ${vitalPoints}, Skill: ${skillPoints}`);
        return { vitalPoints, skillPoints };
    }

    function applyBonuses(bonuses, type, isRemoving = false) {
        bonuses.forEach(bonus => {
            const [stat, value] = bonus.split(': +');
            const bonusValue = parseInt(value);
            const lowerStat = stat.toLowerCase();

            if (isRemoving) {
                characterData[`${type}Bonuses`][lowerStat] = (characterData[`${type}Bonuses`][lowerStat] || 0) - bonusValue;
                const currentValue = getVitals()[lowerStat];
                setVitals(lowerStat, currentValue - bonusValue);
            } else {
                characterData[`${type}Bonuses`][lowerStat] = (characterData[`${type}Bonuses`][lowerStat] || 0) + bonusValue;
                const currentValue = getVitals()[lowerStat];
                setVitals(lowerStat, currentValue + bonusValue);
            }
        });
    }

    function calculateTotalBonuses() {
        const totalBonuses = {};
        for (const stat in characterData.raceBonuses) {
            totalBonuses[stat] = (totalBonuses[stat] || 0) + characterData.raceBonuses[stat];
        }
        for (const stat in characterData.classBonuses) {
            totalBonuses[stat] = (totalBonuses[stat] || 0) + characterData.classBonuses[stat];
        }
        return totalBonuses;
    }

    function applyPercentageVitalBonus(percentage) {
        const vitals = getVitals();
        for (const vital in vitals) {
            const baseValue = vitals[vital];
            const bonusValue = Math.floor(baseValue * (percentage / 100));
            setVitals(vital, baseValue + bonusValue);
        }
    }

    function removePercentageVitalBonus(percentage) {
        const vitals = getVitals();
        for (const vital in vitals) {
            const currentValue = vitals[vital];
            const originalValue = Math.floor(currentValue / (1 + percentage / 100));
            setVitals(vital, originalValue);
        }
    }

    return {
        getData: function () {
            return characterData;
        },
        updateData: function (key, value) {
            if (characterData.hasOwnProperty(key)) {
                const oldValue = characterData[key];
                characterData[key] = value;

                if (key === 'level') {
                    const newLevel = parseInt(value);
                    const oldLevel = parseInt(oldValue);
                    console.log(`Level changed from ${oldLevel} to ${newLevel}`);
                    if (newLevel !== oldLevel) {
                        const { vitalPoints, skillPoints } = calculatePointsForLevelChange(oldLevel, newLevel);

                        // Ensure we don't deduct more points than available
                        characterData.availableVitalPoints = Math.max(0, characterData.availableVitalPoints + vitalPoints);
                        characterData.availableSkillPoints = Math.max(0, characterData.availableSkillPoints + skillPoints);

                        console.log(`Updated points - Vital: ${characterData.availableVitalPoints}, Skill: ${characterData.availableSkillPoints}`);

                        // Ensure UI is updated
                        UIModule.updateField('available-vital-points', characterData.availableVitalPoints);
                        UIModule.updateField('available-skill-points', characterData.availableSkillPoints);
                        UIModule.updateField('character-level', newLevel);
                    }
                }
            }
        },
        deductSkillPoints: function (amount) {
            if (characterData.availableSkillPoints >= amount) {
                characterData.availableSkillPoints -= amount;
                UIModule.updateField('available-skill-points', characterData.availableSkillPoints);
                return true;
            }
            return false;
        },

        addSkillPoints: function (amount) {
            characterData.availableSkillPoints += amount;
            UIModule.updateField('available-skill-points', characterData.availableSkillPoints);
        },
        setCurrentBonuses: function (type, bonuses) {
            if (type === 'race') {
                characterData.currentRaceBonuses = bonuses;
            } else if (type === 'class') {
                characterData.currentClassBonuses = bonuses;
            }
        },
        getCurrentBonuses: function (type) {
            return type === 'race' ? characterData.currentRaceBonuses : characterData.currentClassBonuses;
        },
        updateVitals: function (newBonuses, type) {
            // Remove old bonuses
            if (type === 'race') {
                applyBonuses(Object.values(characterData.currentRaceBonuses), 'race', true);
                characterData.currentRaceBonuses = newBonuses;
            } else if (type === 'class') {
                applyBonuses(Object.values(characterData.currentClassBonuses), 'class', true);
                characterData.currentClassBonuses = newBonuses;
            }

            // Apply new bonuses
            applyBonuses(newBonuses, type);

            // Reapply manual adjustments
            this.applyManualAdjustments();
        },
        setVitals: function (vital, value) {
            if (characterData.vitals.hasOwnProperty(vital)) {
                characterData.vitals[vital] = value;
            }
        },
        getAvailablePoints: function (type) {
            console.log(`Getting ${type} points:`, type === 'vital' ? this.getData().availableVitalPoints : this.getData().availableSkillPoints);
            return type === 'vital' ? this.getData().availableVitalPoints : this.getData().availableSkillPoints;
        },
        updateField: function(fieldId, value) {
            const element = document.getElementById(fieldId);
            if (element) {
                element.textContent = value;
                console.log(`Updated ${fieldId} to ${value}`);
            } else {
                console.error(`Element with id ${fieldId} not found`);
            }
        },
        deductPoints: function (type, amount) {
            console.log(`Deducting ${amount} ${type} points`);
            if (type === 'vital' && this.getData().availableVitalPoints >= amount) {
                this.getData().availableVitalPoints -= amount;
                UIModule.updateField('available-vital-points', this.getData().availableVitalPoints);
            } else if (type === 'skill' && this.getData().availableSkillPoints >= amount) {
                this.getData().availableSkillPoints -= amount;
                UIModule.updateField('available-skill-points', this.getData().availableSkillPoints);
            }
            console.log(`After deduction: ${type} points =`, this.getAvailablePoints(type));
        },
        
        addPoints: function (type, amount) {
            console.log(`Adding ${amount} ${type} points`);
            if (type === 'vital') {
                this.getData().availableVitalPoints += amount;
                UIModule.updateField('available-vital-points', this.getData().availableVitalPoints);
            } else if (type === 'skill') {
                this.getData().availableSkillPoints += amount;
                UIModule.updateField('available-skill-points', this.getData().availableSkillPoints);
            }
            console.log(`After addition: ${type} points =`, this.getAvailablePoints(type));
        },
        getVitals: function () {
            return { ...characterData.vitals };
        },
        applyPercentageVitalBonus: function (percentage) {
            applyPercentageVitalBonus(percentage);
            this.applyManualAdjustments();
            UIModule.updateVitalsDisplay();
        },

        removePercentageVitalBonus: function (percentage) {
            removePercentageVitalBonus(percentage);
            this.applyManualAdjustments();
            UIModule.updateVitalsDisplay();
        },
        updateBonuses: function (newBonuses, type) {
            applyBonuses(newBonuses, type);
            const totalBonuses = calculateTotalBonuses();

            // Update skills with new total bonuses
            UIModule.updateSkills(totalBonuses);
        },
        applyManualAdjustments: function () {
            Object.keys(characterData.manualAdjustments).forEach(vital => {
                if (characterData.vitals.hasOwnProperty(vital)) {
                    characterData.vitals[vital] += characterData.manualAdjustments[vital];
                }
            });
        }
    };
})();

// DataLoadingModule
const DataLoadingModule = (function () {
    let abilitiesData = {};
    let traitsData = {};
    let spellsData = {};

    function loadAbilitiesData() {
        console.log('Attempting to load abilities data');
        return fetch('abilities.json')
            .then(response => response.json())
            .then(data => {
                abilitiesData = data.uniqueability;
                console.log('Abilities data loaded:', abilitiesData);
            })
            .catch(error => console.error('Error loading abilities data:', error));
    }

    function loadTraitsData() {
        console.log('Attempting to load traits data');
        return fetch('traits.json')
            .then(response => response.json())
            .then(data => {
                traitsData = data.Traits;
                console.log('Traits data loaded:', traitsData);
            })
            .catch(error => console.error('Error loading traits data:', error));
    }

    function loadSpellsData() {
        console.log('Attempting to load spells data');
        return fetch('spells.json')
            .then(response => response.json())
            .then(data => {
                spellsData = data.spells;
                console.log('Spells data loaded:', spellsData);
            })
            .catch(error => console.error('Error loading spells data:', error));
    }

    function populateDropdown(url, selectElementId, type) {
        return fetch(url)
            .then(response => response.json())
            .then(data => {
                const selectElement = document.getElementById(selectElementId);
                const spanElement = document.getElementById(selectElementId.replace('-input', ''));

                if (!selectElement || !spanElement) {
                    console.error(`Elements for ${type} not found`);
                    return;
                }

                selectElement.innerHTML = '';

                Object.keys(data).forEach(key => {
                    const option = document.createElement('option');
                    option.value = key;
                    option.textContent = data[key].name;
                    selectElement.appendChild(option);
                });

                spanElement.ondblclick = function () {
                    UIModule.editField(this.id);
                };

                selectElement.addEventListener('change', () => {
                    const selectedData = data[selectElement.value];
                    CharacterModule.updateData(type, selectElement.value);
                    spanElement.textContent = selectElement.options[selectElement.selectedIndex].text;

                    if (type === 'race') {
                        const raceAbilities = selectedData.abilities.map(abilityName => abilitiesData[abilityName]);
                        UIModule.updateRaceInfo(selectedData, raceAbilities);
                    } else if (type === 'class') {
                        const classAbilities = selectedData.abilities.map(abilityName => abilitiesData[abilityName]);
                        UIModule.updateClassInfo(selectedData, classAbilities);
                    }

                    const traits = selectedData.traits.map(traitName => {
                        return traitsData[traitName] || {
                            name: traitName,
                            description: 'Description not available',
                            effect: 'Effect not available'
                        };
                    });

                    UIModule.updateTraits(traits, type);
                    UIModule.updateStats(selectedData, type);
                    UIModule.updateSkills(selectedData);

                    selectElement.classList.add('hidden');
                    spanElement.classList.remove('hidden');
                });
            })
            .catch(error => console.error(`Error fetching ${type} data:`, error));
    }

    return {
        loadDropdowns: function () {
            return Promise.all([loadAbilitiesData(), loadTraitsData(), loadSpellsData()])
                .then(() => {
                    console.log('All data loaded, populating dropdowns');
                    return Promise.all([
                        populateDropdown('races.json', 'character-race-input', 'race'),
                        populateDropdown('classes.json', 'character-class-input', 'class')
                    ]);
                })
                .catch(error => console.error('Error in loadDropdowns:', error));
        },
        getAbilitiesData: function () {
            return abilitiesData;
        },
        getTraitsData: function () {
            return traitsData;
        },
        getSpellsData: function () {
            return spellsData;
        }
    };
})();

// UIModule
// UIModule
const UIModule = (function() {
    let raceAbilities = [];
    let classAbilities = [];
    let raceTraits = [];
    let classTraits = [];

    function updateField(fieldId, value) {
        const element = document.getElementById(fieldId);
        if (element) {
            element.textContent = value;
        } else {
            console.error(`Element with id ${fieldId} not found`);
        }
    }

    function updateGauge(needleId, value, max) {
        const needle = document.getElementById(needleId);
        if (needle) {
            const degree = (value / max) * 180;
            needle.style.transform = `rotate(${degree}deg)`;
        } else {
            console.error(`Gauge needle with id ${needleId} not found`);
        }
    }

    function updateCharacterInfo(data) {
        updateField('character-name', data.name);
        updateField('character-level', data.level);
        updateField('armor-rating', data.armorRating);
        updateField('current-hp', data.currentHp);
        updateField('total-hp', data.totalHp);
        updateField('current-mp', data.currentMp);
        updateField('total-mp', data.totalMp);
        updateField('ability-point-pool', data.abilityPointPool);
        updateGauge('current-views-needle', data.currentViews, 1000);
        updateField('followers', data.followers);
        updateField('favorites', data.favorites);
        updateField('available-vital-points', data.availableVitalPoints);
        updateField('available-skill-points', data.availableSkillPoints);
        updateEquippedItems(data.equippedItems);
        initializeActionsTab();
    }

    function initializeActionsTab() {
        const actionsTab = document.getElementById('Actions');
        if (!actionsTab) {
            console.error('Actions tab not found');
            return;
        }

        actionsTab.innerHTML = `
            <div class="sub-section major-actions">
                <h3>Major Actions</h3>
            </div>
            <div class="sub-section minor-actions">
                <h3>Minor Actions</h3>
            </div>
            <div class="sub-section reactions">
                <h3>Reactions</h3>
            </div>
        `;
    }

    function updateRaceInfo(raceData, raceAbilitiesData) {
        updateField('race-name', raceData.name);
        updateField('race-description', raceData.description);
        updateField('race-lore', raceData.lore);
        updateField('stat-bonuses', raceData.vitalBonus.join(', '));
        updateField('skill-bonuses', raceData.skillBonus.join(', '));
        updateField('race-traits', raceData.traits.join(', '));
        updateField('race-abilities', raceData.abilities.join(', '));

        raceAbilities = raceAbilitiesData;
        raceTraits = raceData.traits.map(traitName => DataLoadingModule.getTraitsData()[traitName] || {
            name: traitName,
            description: 'Description not available',
            effect: 'Effect not available'
        });

        updateAbilitiesDisplay();
        updateTraitsDisplay();
        updateStats(raceData, 'race');
        updateSkills(raceData);
    }

    function updateEquippedItems(equippedItems) {
        for (const [slot, item] of Object.entries(equippedItems)) {
            const slotElement = document.getElementById(`${slot}-slot`);
            if (slotElement) {
                slotElement.textContent = item ? item.name : 'Empty';
                if (item) {
                    slotElement.onclick = () => InventoryModule.openEquippedItemModal(item, slot);
                } else {
                    slotElement.onclick = () => InventoryModule.showEquippableItems(slot);
                }
            }
        }
    }

    function updateClassInfo(classData, classAbilitiesData) {
        updateField('class-name', classData.name);
        updateField('class-description', classData.description);
        updateField('class-archetype', classData.archetype);
        updateField('class-primary-vitals', classData.primaryVitals.join(', '));
        updateField('class-vital-bonuses', classData.vitalBonus.join(', '));
        updateField('class-skill-bonuses', classData.skillBonus.join(', '));
        updateField('class-traits', classData.traits.join(', '));
        updateField('class-abilities', classData.abilities.join(', '));

        classAbilities = classAbilitiesData;
        classTraits = classData.traits.map(traitName => DataLoadingModule.getTraitsData()[traitName] || {
            name: traitName,
            description: 'Description not available',
            effect: 'Effect not available'
        });

        updateAbilitiesDisplay();
        updateTraitsDisplay();
        updateStats(classData, 'class');
        updateSkills(classData);
    }

    function updateAbilitiesDisplay() {
        const abilitiesContainer = document.getElementById('abilities-container');
        if (abilitiesContainer) {
            abilitiesContainer.innerHTML = '';

            if (raceAbilities.length > 0) {
                const raceHeader = document.createElement('h3');
                raceHeader.textContent = 'Race Abilities';
                abilitiesContainer.appendChild(raceHeader);
                raceAbilities.forEach(ability => {
                    if (ability) {
                        const abilityCard = createAbilityCard(ability);
                        abilitiesContainer.appendChild(abilityCard);
                    }
                });
            }

            if (classAbilities.length > 0) {
                const classHeader = document.createElement('h3');
                classHeader.textContent = 'Class Abilities';
                abilitiesContainer.appendChild(classHeader);
                classAbilities.forEach(ability => {
                    if (ability) {
                        const abilityCard = createAbilityCard(ability);
                        abilitiesContainer.appendChild(abilityCard);
                    }
                });
            }
        } else {
            console.error('Abilities container not found');
        }
    }

    function updateTraitsDisplay() {
        const traitsContainer = document.getElementById('traits-list');
        if (traitsContainer) {
            traitsContainer.innerHTML = '';

            if (raceTraits.length > 0) {
                const raceHeader = document.createElement('h3');
                raceHeader.textContent = 'Race Traits';
                traitsContainer.appendChild(raceHeader);
                raceTraits.forEach(trait => {
                    if (trait) {
                        const traitCard = createTraitCard(trait);
                        traitsContainer.appendChild(traitCard);
                    }
                });
            }

            if (classTraits.length > 0) {
                const classHeader = document.createElement('h3');
                classHeader.textContent = 'Class Traits';
                traitsContainer.appendChild(classHeader);
                classTraits.forEach(trait => {
                    if (trait) {
                        const traitCard = createTraitCard(trait);
                        traitsContainer.appendChild(traitCard);
                    }
                });
            }
        } else {
            console.error('Traits container not found');
        }
    }

    function updateStats(data, type) {
        CharacterModule.updateVitals(data.vitalBonus, type);
        CharacterModule.applyManualAdjustments();

        const vitals = CharacterModule.getVitals();
        Object.keys(vitals).forEach(vital => {
            const statElement = document.getElementById(`${vital}-score`);
            if (statElement) {
                statElement.textContent = vitals[vital];
            }
        });
    }

    function updateSkills(totalBonuses) {
        const skillElements = document.querySelectorAll('.skill-box');
        skillElements.forEach(skillElement => {
            const skillName = skillElement.querySelector('.skill-name').textContent.toLowerCase();
            const skillScoreElement = skillElement.querySelector('.skill-score');
            const baseScore = parseInt(skillScoreElement.dataset.baseScore || '0');
            const bonus = totalBonuses[skillName] || 0;
            const newScore = baseScore + bonus;

            skillScoreElement.textContent = newScore;
            skillScoreElement.dataset.score = newScore;
            skillScoreElement.dataset.bonus = bonus;
        });
    }

    function updateTraits(newTraits, source) {
        const traitsContainer = document.getElementById('traits-list');
        if (traitsContainer) {
            newTraits.forEach(trait => {
                const existingTrait = traitsContainer.querySelector(`[data-trait-name="${trait.name}"]`);
                if (!existingTrait) {
                    const traitCard = createTraitCard(trait);
                    traitCard.dataset.source = source;
                    traitsContainer.appendChild(traitCard);
                }
            });
        } else {
            console.error('Traits container not found');
        }
    }

    function updateAbilities(newAbilities) {
        const abilitiesContainer = document.getElementById('abilities-container');
        if (abilitiesContainer) {
            newAbilities.forEach(ability => {
                const existingAbility = abilitiesContainer.querySelector(`[data-ability-name="${ability.Name}"]`);
                if (!existingAbility) {
                    const abilityCard = createAbilityCard(ability);
                    abilitiesContainer.appendChild(abilityCard);
                }
            });
        } else {
            console.error('Abilities container not found');
        }
    }

    function createAbilityCard(ability) {
        const card = document.createElement('div');
        card.className = 'ability-card';

        const header = document.createElement('div');
        header.className = 'ability-header';

        const title = document.createElement('h3');
        title.textContent = ability.Name;

        const toggleButton = document.createElement('button');
        toggleButton.textContent = '+';
        toggleButton.className = 'toggle-button';

        header.appendChild(title);
        header.appendChild(toggleButton);

        const content = document.createElement('div');
        content.className = 'ability-content hidden';

        const levelSelect = document.createElement('select');
        levelSelect.className = 'level-select';
        for (let i = 1; i <= 10; i++) {
            const option = document.createElement('option');
            option.value = i;
            option.textContent = `Level ${i}`;
            levelSelect.appendChild(option);
        }

        content.innerHTML = `
            <p><strong>Description:</strong> ${ability.Description}</p>
            <p><strong>Effect:</strong> ${ability.Effect}</p>
            <p><strong>Range:</strong> ${ability.Range}</p>
            <p><strong>Damage:</strong> ${ability.Damage} ${ability.DamageType}</p>
            <p><strong>Ability Point Cost:</strong> ${ability.AbilityPointCost}</p>
            <p><strong>Cooldown:</strong> ${ability.Cooldown}</p>
            <p><strong>Current Level:</strong></p>
            <div class="scaling-content"></div>
        `;

        content.querySelector('p:last-of-type').appendChild(levelSelect);

        const scalingContent = content.querySelector('.scaling-content');

        levelSelect.addEventListener('change', () => {
            const selectedLevel = parseInt(levelSelect.value);
            updateScaling(ability.Scaling, selectedLevel, scalingContent);
        });

        card.appendChild(header);
        card.appendChild(content);

        toggleButton.addEventListener('click', () => {
            content.classList.toggle('hidden');
            toggleButton.textContent = content.classList.contains('hidden') ? '+' : '-';
        });

        return card;
    }

    function updateScaling(scaling, selectedLevel, scalingContent) {
        scalingContent.innerHTML = '<h4>Scaling:</h4><ul>';
        for (let i = 0; i < scaling.length; i++) {
            const level = parseInt(scaling[i].split(':')[0].replace('Level ', ''));
            if (level <= selectedLevel) {
                scalingContent.innerHTML += `<li>${scaling[i]}</li>`;
            }
        }
        scalingContent.innerHTML += '</ul>';
    }

    function createTraitCard(trait) {
        const card = document.createElement('div');
        card.className = 'trait-card';

        const header = document.createElement('div');
        header.className = 'trait-header';

        const title = document.createElement('h3');
        title.textContent = trait.name;

        const toggleButton = document.createElement('button');
        toggleButton.textContent = '+';
        toggleButton.className = 'toggle-button';

        header.appendChild(title);
        header.appendChild(toggleButton);

        const content = document.createElement('div');
        content.className = 'trait-content hidden';

        content.innerHTML = `
            <p><strong>Description:</strong> ${trait.description || 'Description not available'}</p>
            <p><strong>Effect:</strong> ${trait.effect || 'Effect not available'}</p>
        `;

        card.appendChild(header);
        card.appendChild(content);

        toggleButton.addEventListener('click', () => {
            content.classList.toggle('hidden');
            toggleButton.textContent = content.classList.contains('hidden') ? '+' : '-';
        });

        return card;
    }

    function updateVitalsDisplay() {
        const vitals = CharacterModule.getVitals();
        for (const [vital, value] of Object.entries(vitals)) {
            const vitalElement = document.getElementById(`${vital}-score`);
            if (vitalElement) {
                vitalElement.textContent = value;
            }
        }
    }

    function updateSkillsDisplay() {
        const skills = document.querySelectorAll('.skill-box');
        skills.forEach(skillBox => {
            const skillName = skillBox.querySelector('.skill-name').textContent.toLowerCase();
            const scoreElement = skillBox.querySelector('.skill-score');
            const baseScore = parseInt(scoreElement.dataset.baseScore) || 0;
            const bonus = parseInt(scoreElement.dataset.bonus) || 0;
            const totalScore = baseScore + bonus;
            scoreElement.textContent = totalScore;
            scoreElement.dataset.score = totalScore;
        });
    }

    function updateSkillScore(skillName, bonus) {
        console.log(`Attempting to update skill: ${skillName} with bonus: ${bonus}`);
        const skillBoxes = document.querySelectorAll('.skill-box');
        let found = false;
        
        skillBoxes.forEach(box => {
            const nameElement = box.querySelector('.skill-name');
            if (nameElement && nameElement.textContent.toLowerCase() === skillName.toLowerCase()) {
                found = true;
                const scoreElement = box.querySelector('.skill-score');
                const baseScore = parseInt(scoreElement.dataset.baseScore) || 0;
                const currentBonus = parseInt(scoreElement.dataset.bonus) || 0;
                const newBonus = currentBonus + bonus;
                const newTotalScore = baseScore + newBonus;
    
                console.log(`Updating ${skillName}: Base Score: ${baseScore}, Current Bonus: ${currentBonus}, New Bonus: ${newBonus}, New Total: ${newTotalScore}`);
    
                scoreElement.textContent = newTotalScore;
                scoreElement.dataset.score = newTotalScore;
                scoreElement.dataset.bonus = newBonus;
            }
        });
    
        if (!found) {
            console.warn(`Skill '${skillName}' not found`);
        }
    }

    function editField(fieldId) {
        const spanElement = document.getElementById(fieldId);
        const inputElement = document.getElementById(`${fieldId}-input`);

        if (spanElement && inputElement) {
            spanElement.classList.add('hidden');
            inputElement.classList.remove('hidden');

            if (inputElement.tagName === 'SELECT') {
                const options = inputElement.options;
                for (let i = 0; i < options.length; i++) {
                    if (options[i].text === spanElement.textContent) {
                        inputElement.selectedIndex = i;
                        break;
                    }
                }
            } else {
                inputElement.value = spanElement.textContent;
            }

            inputElement.focus();
        }
    }

    function saveField(fieldId) {
        const spanElement = document.getElementById(fieldId);
        const inputElement = document.getElementById(`${fieldId}-input`);

        if (spanElement && inputElement) {
            if (inputElement.tagName === 'SELECT') {
                spanElement.textContent = inputElement.options[inputElement.selectedIndex].text;
            } else {
                spanElement.textContent = inputElement.value;
            }

            spanElement.classList.remove('hidden');
            inputElement.classList.add('hidden');

            CharacterModule.updateData(fieldId.replace('-', ''), inputElement.value);
        }
    }

    function populateSkills() {
        const skills = [
            'acrobatics', 'alchemy', 'alertness', 'animal ken',
            'arcana', 'archery', 'athletics', 'awareness',
            'block', 'close combat', 'concentration', 'crafting',
            'deception', 'detect trap', 'disguise', 'dodge', 'empathy', 'endurance',
            'engineering', 'firearms', 'hold breath', 'intimidation',
            'investigation', 'lore', 'medicine', 'melee', 'nature',
            'parry', 'performance', 'persuasion', 'ranged combat', 'resilience',
            'sapper', 'scrounge', 'seduction', 'sense deception', 'sleight of hand',
            'stealth', 'subterfuge', 'survival', 'tactics', 'tracking'
        ];
    
        const skillsContainer = document.getElementById('skills-container');
        if (skillsContainer) {
            skillsContainer.innerHTML = '';
    
            skills.forEach(skill => {
                const skillBox = document.createElement('div');
                skillBox.className = 'skill-box';
    
                const skillName = document.createElement('span');
                skillName.className = 'skill-name';
                skillName.textContent = skill;
    
                const scoreContainer = document.createElement('div');
                scoreContainer.className = 'skill-score-container';
    
                const skillScore = document.createElement('span');
                skillScore.className = 'skill-score';
                skillScore.textContent = '0';
                skillScore.dataset.baseScore = '0';
                skillScore.dataset.score = '0';
                skillScore.dataset.bonus = '0';
    
                const buttonsContainer = document.createElement('div');
                buttonsContainer.className = 'skill-buttons hidden';
    
                const incrementBtn = document.createElement('button');
                incrementBtn.className = 'skill-increment';
                incrementBtn.textContent = '+';
    
                const decrementBtn = document.createElement('button');
                decrementBtn.className = 'skill-decrement';
                decrementBtn.textContent = '-';
    
                buttonsContainer.appendChild(incrementBtn);
                buttonsContainer.appendChild(decrementBtn);
    
                scoreContainer.appendChild(skillScore);
                scoreContainer.appendChild(buttonsContainer);
    
                skillBox.appendChild(skillName);
                skillBox.appendChild(scoreContainer);
                skillsContainer.appendChild(skillBox);
            });
        } else {
            console.error('Skills container not found');
        }
    }

    function updateSpells(newSpells) {
        const spellsContainer = document.getElementById('spells-container');
        if (spellsContainer) {
            newSpells.forEach(spell => {
                const existingSpell = spellsContainer.querySelector(`[data-spell-name="${spell.Name}"]`);
                if (!existingSpell) {
                    const spellCard = createSpellCard(spell);
                    spellsContainer.appendChild(spellCard);
                }
            });
        } else {
            console.error('Spells container not found');
        }
    }

    function createSpellCard(spell) {
        const card = document.createElement('div');
        card.className = 'spell-card';
        const header = document.createElement('div');
        header.className = 'spell-header';
        const title = document.createElement('h3');
        title.textContent = spell.Name;
        const toggleButton = document.createElement('button');
        toggleButton.textContent = '+';
        toggleButton.className = 'toggle-button';
        header.appendChild(title);
        header.appendChild(toggleButton);
        const content = document.createElement('div');
        content.className = 'spell-content hidden';
        content.innerHTML = `
            <p><strong>Description:</strong> ${spell.Description || 'N/A'}</p>
            <p><strong>Effect:</strong> ${spell.Effect || 'N/A'}</p>
            <p><strong>Range:</strong> ${spell.Range || 'N/A'}</p>
            <p><strong>Damage:</strong> ${spell.Damage || 'N/A'}</p>
            <p><strong>Damage Type:</strong> ${spell.DamageType || 'N/A'}</p>
            <p><strong>Casting Time:</strong> ${spell.CastingTime || 'N/A'}</p>
            <p><strong>Ability Point Cost:</strong> ${spell.AbilityPointCost || 'N/A'}</p>
            <p><strong>Cooldown:</strong> ${spell.Cooldown || 'N/A'}</p>
            <p><strong>Scaling:</strong> ${spell.Scaling || 'N/A'}</p>
            <p><strong>Spellcasting Modifier:</strong> ${spell.SpellCastingModifier || 'N/A'}</p>
        `;
        card.appendChild(header);
        card.appendChild(content);
        toggleButton.addEventListener('click', () => {
            content.classList.toggle('hidden');
            toggleButton.textContent = content.classList.contains('hidden') ? '+' : '-';
        });
        return card;
    }

    return {
        updateCharacterInfo,
        updateStats,
        updateSkills,
        updateRaceInfo,
        updateClassInfo,
        updateTraits,
        updateAbilitiesDisplay,
        updateSkillScore: updateSkillScore,
        updateTraitsDisplay,
        updateAbilities,
        editField,
        saveField,
        populateSkills,
        updateField,
        updateSkillScore,
        updateSpells,
        updateVitalsDisplay,
        updateSkillsDisplay,
        updateSkillScore,
        createSpellCard,
        updateEquippedItems: updateEquippedItems
    };
})();


// TabModule
const TabModule = (function () {
    return {
        openTab: function (event, tabName) {
            const tabcontents = document.querySelectorAll('.tabcontent');
            tabcontents.forEach(tabcontent => tabcontent.classList.remove('active'));

            const tablinks = document.querySelectorAll('.tablink');
            tablinks.forEach(tablink => tablink.classList.remove('active'));

            const targetTab = document.getElementById(tabName);
            if (targetTab) {
                targetTab.classList.add('active');
                event.currentTarget.classList.add('active');

                if (tabName === 'Main') {
                    this.openSubTab(event, 'Actions');
                    populateActions();
                }
            }
        },
        openSubTab: function (event, subTabName) {
            const subTabContents = document.querySelectorAll('.subtabcontent');
            subTabContents.forEach(subTabContent => subTabContent.classList.remove('active'));

            const subTabLinks = document.querySelectorAll('.subtablink');
            subTabLinks.forEach(subTabLink => subTabLink.classList.remove('active'));

            const targetSubTab = document.getElementById(subTabName);
            if (targetSubTab) {
                targetSubTab.classList.add('active');
                event.currentTarget.classList.add('active');
            } else {
                console.error(`SubTab ${subTabName} not found`);
            }
        }
    };
})();



const InventoryModule = (() => {
    let inventoryData = {
        weapons: {},
        armor: {},
        items: {},
        explosives: {},
        throwables: {},
        scrolls: {},
        potions: {},
        ammunition: {},
        craftingComponents: {}
    };

    let utilitySlots = Array(10).fill(null);

    function initializeUtilitySlots() {
        for (let i = 1; i <= 10; i++) {
            const slotElement = document.getElementById(`utility-slot-${i}`);
            if (slotElement) {
                updateSlotDisplay(slotElement, utilitySlots[i - 1]);
            }
        }
    }

    function showEquippableItems(slotType) {
        console.log("showEquippableItems called with slotType:", slotType);
    
        const modal = document.getElementById('category-modal');
        const title = document.getElementById('category-title');
        const itemsContainer = document.getElementById('category-items');
        const searchInput = document.getElementById('item-search');
    
        title.textContent = `Equippable Items for ${slotType}`;
        itemsContainer.innerHTML = '';
    
        let items = {};
        let jsonKeys = [];
    
        if (slotType === 'weapon') {
            items = inventoryData.weapons;
            jsonKeys = ['weapons'];
        } else if (slotType === 'utility') {
            items = {
                ...inventoryData.throwables,
                ...inventoryData.potions,
                ...inventoryData.scrolls,
                ...inventoryData.craftingComponents,
                ...inventoryData.explosives,
                ...inventoryData.ammunition,
                ...inventoryData.items
            };
            jsonKeys = ['throwables', 'potions', 'scrolls', 'crafting_components', 'explosives', 'ammunition', 'items'];
        } else {
            items = inventoryData.armor;
            jsonKeys = ['armor'];
        }
    
        console.log("Items for this category:", items);
        console.log("Number of items:", Object.keys(items).length);
    
        filterItems('', title.textContent, jsonKeys, items, itemsContainer, slotType);
    
        searchInput.value = '';
        searchInput.addEventListener('input', (e) => {
            filterItems(e.target.value, title.textContent, jsonKeys, items, itemsContainer, slotType);
        });
    
        modal.style.display = 'block';
    }

    function setupEquipmentSlotListeners() {
        const equipmentSlots = document.querySelectorAll('.equipment-slot');
        console.log("Found equipment slots:", equipmentSlots.length);
        equipmentSlots.forEach(slot => {
            console.log("Slot:", slot, "Attributes:", slot.attributes);
            slot.addEventListener('click', (event) => {
                console.log("Clicked slot:", event.currentTarget, "Attributes:", event.currentTarget.attributes);
                const slotType = event.currentTarget.getAttribute('data-slot-type') || event.currentTarget.getAttribute('slot-type');
                if (slotType) {
                    showEquippableItems(slotType);
                } else {
                    console.error("No slot type attribute found on clicked element", event.currentTarget);
                }
            });
        });
    }

    function updateSlotDisplay(slotElement, item) {
        if (item) {
            slotElement.innerHTML = `
                <img src="${item.icon || 'default-icon.png'}" alt="${item.name}">
                <span class="utility-slot-count">${item.count}</span>
            `;
        } else {
            slotElement.innerHTML = 'Empty';
        }
    }

    function equipToUtilitySlot(item) {
        console.log("Equipping to utility slot:", item);

        const emptySlotIndex = utilitySlots.findIndex(slot => !slot);
        if (emptySlotIndex !== -1) {
            utilitySlots[emptySlotIndex] = {
                name: item.name || 'Unknown Item',
                description: item.description || 'No description available',
                icon: item.icon || 'default-icon.png',
                count: 1,
                itemType: item.itemType || 'unknown'
            };
            const slotElement = document.getElementById(`utility-slot-${emptySlotIndex + 1}`);
            if (slotElement) {
                updateSlotDisplay(slotElement, utilitySlots[emptySlotIndex]);
            }
        } else {
            const existingSlotIndex = utilitySlots.findIndex(slot => slot.name === item.name);
            if (existingSlotIndex !== -1) {
                utilitySlots[existingSlotIndex].count++;
                const slotElement = document.getElementById(`utility-slot-${existingSlotIndex + 1}`);
                if (slotElement) {
                    updateSlotDisplay(slotElement, utilitySlots[existingSlotIndex]);
                }
            } else {
                alert('No empty utility slots available');
                return false;
            }
        }
        console.log("Item equipped to utility slot successfully");
        return true;
    }

    function useUtilitySlot(index) {
        const item = utilitySlots[index];
        if (item) {
            createMinorActionCard(item);
            item.count--;
            if (item.count === 0) {
                utilitySlots[index] = null;
            }
            updateSlotDisplay(document.getElementById(`utility-slot-${index + 1}`), utilitySlots[index]);
        }
    }

    function openEquippedItemModal(item, slot) {
        openItemDetailModal(item);
        const equipButtons = document.getElementById('equip-buttons');
        equipButtons.innerHTML = '';
        const unequipButton = document.createElement('button');
        unequipButton.textContent = 'Unequip';
        unequipButton.onclick = () => unequipItem(item, slot);
        equipButtons.appendChild(unequipButton);
    }

    function unequipItem(slotType) {
        const characterData = CharacterModule.getData();
        const item = characterData.equippedItems[slotType];
        if (item) {
            removeItemBonuses(item);
            removeItemAbilities(item);
            removeItemTraits(item);
            removeItemSpells(item);
            delete characterData.equippedItems[slotType];
    
            const slot = document.getElementById(`${slotType}-slot`);
            if (slot) {
                slot.textContent = 'Empty';
                slot.onclick = () => InventoryModule.showEquippableItems(slotType);
            }
    
            console.log(`Item unequipped from ${slotType} slot`);
        }
    }

    function removeAbilities(item) {
        if (item.abilities) {
            item.abilities.forEach(ability => {
                // Remove ability from character
                // This would depend on how abilities are stored and managed in your character system
            });
        }
    }

    function removeTraits(item) {
        if (item.traits) {
            item.traits.forEach(trait => {
                // Remove trait from character
                // This would depend on how traits are stored and managed in your character system
            });
        }
    }

    function removeSpells(item) {
        if (item.spellsGranted) {
            item.spellsGranted.forEach(spell => {
                // Remove spell from character
                // This would depend on how spells are stored and managed in your character system
            });
        }
    }

    function createMinorActionCard(item) {
        const actionsTab = document.getElementById('Actions');
        const minorActionsSection = actionsTab.querySelector('.minor-actions');
        const actionCard = document.createElement('div');
        actionCard.className = 'minor-action-card';

        let cardContent = `
            <span class="close-btn">&times;</span>
            <h4>${item.name}</h4>
            <p><strong>Type:</strong> ${item.itemType}</p>
            <p><strong>Rarity:</strong> ${item.rarity || 'N/A'}</p>
            <p><strong>Description:</strong> ${item.description || 'No description available'}</p>
            <p><strong>Effect:</strong> ${item.effect || 'N/A'}</p>
            <p><strong>Duration:</strong> ${item.duration || 'N/A'}</p>
            <p><strong>Range:</strong> ${item.range || 'N/A'}</p>
        `;

        if (item.damage) {
            cardContent += `<p><strong>Damage:</strong> ${item.damage} ${item.damageType || ''}</p>`;
        }

        if (item.vitalBonus && Object.keys(item.vitalBonus).length > 0) {
            cardContent += `<p><strong>Vital Bonuses:</strong> ${JSON.stringify(item.vitalBonus)}</p>`;
        }

        if (item.skillBonus && Object.keys(item.skillBonus).length > 0) {
            cardContent += `<p><strong>Skill Bonuses:</strong> ${JSON.stringify(item.skillBonus)}</p>`;
        }

        if (item.abilities && item.abilities.length > 0) {
            cardContent += `<p><strong>Abilities:</strong> ${item.abilities.join(', ')}</p>`;
        }

        cardContent += `<button class="use-action-btn">Use</button>`;

        actionCard.innerHTML = cardContent;

        actionCard.querySelector('.close-btn').onclick = () => actionCard.remove();
        actionCard.querySelector('.use-action-btn').onclick = () => {
            console.log(`Used ${item.name}`);
            actionCard.remove();
        };

        minorActionsSection.appendChild(actionCard);
    }

    function equipWeapon(weapon, slot) {
        console.log("Equipping weapon:", weapon);
    
        const slotElement = document.getElementById(`${slot}-weapon-slot`);
        if (!slotElement) {
            console.error(`Weapon slot not found: ${slot}`);
            return;
        }
    
        slotElement.innerHTML = `
            <div class="equipped-weapon">
                <h5>${weapon.name}</h5>
                <p>Damage: ${weapon.damageAmount} ${weapon.damageType}</p>
                <p>Range: ${weapon.meleeRanged}</p>
            </div>
        `;
    
        applyItemBonuses(weapon);
        addItemAbilities(weapon);
        addItemTraits(weapon);
        addItemSpells(weapon);
    
        displayWeaponAction(weapon, slot);
    
        document.getElementById('item-detail-modal').style.display = 'none';
    }

    function equipArmor(item, slotType) {
        console.log(`Equipping ${item.name} to ${slotType} slot`);
        const slot = document.getElementById(`${slotType}-slot`);
        if (slot) {
            // Unequip any existing item in this slot
            const existingItem = CharacterModule.getData().equippedItems[slotType];
            if (existingItem) {
                unequipItem(slotType);
            }
    
            slot.textContent = item.name;
            slot.onclick = () => InventoryModule.openEquippedItemModal(item, slotType);
    
            applyItemBonuses(item);
            addItemAbilities(item);
            addItemTraits(item);
            addItemSpells(item);
    
            console.log(`${item.name} equipped successfully to ${slotType} slot`);
            return true;
        } else {
            console.error(`Slot not found: ${slotType}-slot`);
            return false;
        }
    }

    function applyItemBonuses(item) {
        console.log("Applying bonuses for item:", item.name);
    
        if (item.vitalBonus) {
            if (item.vitalBonus.allStats) {
                const allStatsBonus = item.vitalBonus.allStats;
                const vitals = CharacterModule.getVitals();
                for (const vital in vitals) {
                    const currentValue = vitals[vital];
                    const newValue = Math.round(currentValue * (1 + allStatsBonus));
                    CharacterModule.setVitals(vital, newValue);
                    console.log(`Applied ${allStatsBonus * 100}% bonus to ${vital}: ${currentValue} -> ${newValue}`);
                }
            } else {
                for (const [vital, bonus] of Object.entries(item.vitalBonus)) {
                    const currentValue = CharacterModule.getVitals()[vital] || 0;
                    const newValue = currentValue + bonus;
                    CharacterModule.setVitals(vital, newValue);
                    console.log(`Applied bonus to ${vital}: ${currentValue} -> ${newValue}`);
                }
            }
        }
    
        if (item.skillBonus) {
            for (const [skill, bonus] of Object.entries(item.skillBonus)) {
                console.log(`Applying skill bonus: ${skill} +${bonus}`);
                UIModule.updateSkillScore(skill, bonus);
            }
        }
    
        if (item.armorRating) {
            const currentArmorRating = CharacterModule.getData().armorRating || 0;
            const newArmorRating = currentArmorRating + item.armorRating;
            CharacterModule.updateData('armorRating', newArmorRating);
            console.log(`Updated Armor Rating: ${currentArmorRating} -> ${newArmorRating}`);
        }
    
        UIModule.updateCharacterInfo(CharacterModule.getData());
        UIModule.updateVitalsDisplay();
        UIModule.updateSkillsDisplay();
    }

    function addItemAbilities(item) {
        const abilitiesData = DataLoadingModule.getAbilitiesData();
        const abilitiesToAdd = (item.abilities || []).map(abilityName => abilitiesData[abilityName]).filter(ability => ability);
        UIModule.updateAbilities(abilitiesToAdd);
    }
    
    function addItemTraits(item) {
        const traitsData = DataLoadingModule.getTraitsData();
        const traitsToAdd = (item.traits || []).map(traitName => traitsData[traitName]).filter(trait => trait);
        UIModule.updateTraits(traitsToAdd, 'item');
    }
    
    function addItemSpells(item) {
        const spellsData = DataLoadingModule.getSpellsData();
        const spellsToAdd = (item.spellsGranted || []).map(spellName => {
            const spell = spellsData[spellName];
            return spell ? { ...spell, Name: spellName } : null;
        }).filter(spell => spell);
        UIModule.updateSpells(spellsToAdd);
    }

    function loadInventoryData() {
        return Promise.all([
            fetch('weapons.json').then(response => response.json()),
            fetch('armor.json').then(response => response.json()),
            fetch('throwables.json').then(response => response.json()),
            fetch('potions.json').then(response => response.json()),
            fetch('traps.json').then(response => response.json()),
            fetch('scrolls.json').then(response => response.json()),
            fetch('explosives.json').then(response => response.json()),
            fetch('crafting_components.json').then(response => response.json()),
            fetch('ammunition.json').then(response => response.json())
        ]).then(([weapons, armor, throwables, potions, traps, scrolls, explosives, craftingComponents, ammunition]) => {
            inventoryData.weapons = weapons.weapons;
            inventoryData.armor = armor.armor;
            inventoryData.throwables = throwables.throwables;
            inventoryData.potions = potions.potions;
            inventoryData.traps = traps.traps;
            inventoryData.scrolls = scrolls.scrolls;
            inventoryData.explosives = explosives.explosives;
            inventoryData.craftingComponents = craftingComponents.crafting_components;
            inventoryData.ammunition = ammunition.ammunition;
            console.log("Inventory data loaded:", inventoryData);
            console.log("Scrolls data:", inventoryData.scrolls);
            createCategoryIcons();
        }).catch(error => console.error('Error loading inventory data:', error));
    }

    function createCategoryIcons() {
        const container = document.getElementById('inventory-categories');
        container.innerHTML = '';
        const categories = [
            { name: 'Weapons', icon: 'weapons-icon.webp', jsonKey: 'weapons' },
            { name: 'Armor', icon: 'armor_icon.webp', jsonKey: 'armor' },
            { name: 'Throwables', icon: 'throwables_icon.webp', jsonKey: 'throwables' },
            { name: 'Potions', icon: 'Potions_icon.webp', jsonKey: 'potions' },
            { name: 'Traps', icon: 'traps_icon.webp', jsonKey: 'traps' },
            { name: 'Scrolls', icon: 'scrolls_icon.webp', jsonKey: 'scrolls' },
            { name: 'Explosives', icon: 'explosives_icon.webp', jsonKey: 'explosives' },
            { name: 'Crafting', icon: 'crafting-components_icon.webp', jsonKey: 'craftingComponents' },
            { name: 'Ammunition', icon: 'ammunition_icon.webp', jsonKey: 'ammunition' }
        ];

        categories.forEach(category => {
            const div = document.createElement('div');
            div.className = 'inventory-category';
            div.dataset.category = category.name;
            div.dataset.jsonKey = category.jsonKey;
            div.innerHTML = `
                <img src="${category.icon}" alt="${category.name}">
                <span>${category.name}</span>
            `;
            container.appendChild(div);
        });
    }

    function openCategoryModal(categoryName, jsonKey) {
        const modal = document.getElementById('category-modal');
        const title = document.getElementById('category-title');
        const itemsContainer = document.getElementById('category-items');
        const searchInput = document.getElementById('item-search');
    
        title.textContent = categoryName;
        itemsContainer.innerHTML = '';
    
        const items = inventoryData[jsonKey];
    
        if (!items) {
            console.error(`No items found for category: ${categoryName}`);
            return;
        }
    
        console.log(`Opening category modal for ${categoryName}:`, items);
    
        if (jsonKey === 'weapons') {
            displayWeaponsByType(items, itemsContainer);
        } else {
            displayGenericItems(items, itemsContainer);
        }
    
        searchInput.value = '';
        searchInput.addEventListener('input', (e) => filterItems(e.target.value, categoryName, jsonKey, items, itemsContainer));
    
        modal.style.display = 'block';
    }

    function displayWeaponsByType(weapons, container) {
        const weaponTypes = {};

        Object.entries(weapons).forEach(([key, weapon]) => {
            if (!weaponTypes[weapon.weaponType]) {
                weaponTypes[weapon.weaponType] = [];
            }
            weaponTypes[weapon.weaponType].push({ key, ...weapon });
        });

        Object.entries(weaponTypes).forEach(([weaponType, weapons]) => {
            const typeSection = document.createElement('div');
            typeSection.className = 'weapon-type';
            typeSection.innerHTML = `<h3>${weaponType}</h3>`;

            const itemGrid = document.createElement('div');
            itemGrid.className = 'item-grid';

            weapons.forEach(weapon => {
                const itemCard = createItemCard(weapon);
                itemGrid.appendChild(itemCard);
            });

            typeSection.appendChild(itemGrid);
            container.appendChild(typeSection);
        });
    }

    function displayGenericItems(items, container) {
        console.log("Displaying generic items:", items);
        const itemGrid = document.createElement('div');
        itemGrid.className = 'item-grid';
        Object.entries(items).forEach(([key, item]) => {
            console.log("Creating card for item:", item);
            const itemCard = createItemCard(item);
            itemGrid.appendChild(itemCard);
        });
        container.appendChild(itemGrid);
    }

    function createItemCard(item) {
        console.log("Creating item card for:", item);
        const itemCard = document.createElement('div');
        itemCard.className = 'item-card';
        itemCard.innerHTML = `
            <div class="item-name">${item.Name || item.name || 'Unnamed Item'}</div>
            <div class="item-type">${item.itemType || 'Scroll'}</div>
        `;
        itemCard.addEventListener('click', () => openItemDetailModal(item));
        return itemCard;
    }

    function filterItems(searchTerm, categoryName, jsonKey, items, container) {
        container.innerHTML = '';
        console.log("Filtering items:", items);
        const filteredItems = Object.entries(items).filter(([key, item]) => {
            const nameMatch = (item.Name || item.name || '').toLowerCase().includes(searchTerm.toLowerCase());
            const descriptionMatch = (item.Description || item.description || '').toLowerCase().includes(searchTerm.toLowerCase());
            return nameMatch || descriptionMatch;
        });
    
        if (jsonKey === 'weapons') {
            displayWeaponItems(filteredItems, container);
        } else {
            displayGenericItems(Object.fromEntries(filteredItems), container);
        }
    }

    function displayWeaponItems(filteredItems, container) {
        const weaponTypes = {};
        filteredItems.forEach(([key, weapon]) => {
            if (!weaponTypes[weapon.weaponType]) {
                weaponTypes[weapon.weaponType] = [];
            }
            weaponTypes[weapon.weaponType].push({ key, ...weapon });
        });

        Object.entries(weaponTypes).forEach(([weaponType, weapons]) => {
            const typeSection = document.createElement('div');
            typeSection.className = 'weapon-type';
            typeSection.innerHTML = `<h3>${weaponType}</h3>`;

            const itemGrid = document.createElement('div');
            itemGrid.className = 'item-grid';

            weapons.forEach(weapon => {
                const itemCard = createItemCard(weapon);
                itemGrid.appendChild(itemCard);
            });

            typeSection.appendChild(itemGrid);
            container.appendChild(typeSection);
        });
    }

    // Add these functions to the InventoryModule

function createWeaponInfo(item) {
    return `
        <div class="item-detail-section">
            <h3>Weapon Details</h3>
            <p><strong>Weapon Type:</strong> ${item.weaponType || 'N/A'}</p>
            <p><strong>Damage:</strong> ${item.damageAmount || 'N/A'} ${item.damageType || ''}</p>
            <p><strong>Range:</strong> ${item.meleeRanged || 'N/A'}</p>
            <p><strong>Hands Required:</strong> ${item.handsRequired || 'N/A'}</p>
            <p><strong>Magic/Non-Magical:</strong> ${item.magicNonMagical || 'N/A'}</p>
        </div>
    `;
}

function createArmorInfo(item) {
    return `
        <div class="item-detail-section">
            <h3>Armor Details</h3>
            <p><strong>Armor Type:</strong> ${item.armorType || 'N/A'}</p>
            <p><strong>Armor Rating:</strong> ${item.armorRating || 'N/A'}</p>
            <p><strong>Tank Modifier:</strong> ${item.tankModifier || 'N/A'}</p>
        </div>
    `;
}

function createAmmunitionInfo(item) {
    return `
        <div class="item-detail-section">
            <h3>Ammunition Details</h3>
            <p><strong>Range:</strong> ${item.range || 'N/A'}</p>
            <p><strong>Damage:</strong> ${item.damage || 'N/A'} ${item.damageType || ''}</p>
            ${item.radius ? `<p><strong>Blast Radius:</strong> ${item.radius} feet</p>` : ''}
            ${item.triggerMechanism ? `<p><strong>Trigger Mechanism:</strong> ${item.triggerMechanism}</p>` : ''}
        </div>
    `;
}

function createCraftingComponentInfo(item) {
    return `
        <div class="item-detail-section">
            <h3>Crafting Component Details</h3>
            <p><strong>Effect:</strong> ${item.effect || 'N/A'}</p>
            <p><strong>Duration:</strong> ${item.duration || 'N/A'}</p>
            <p><strong>Range:</strong> ${item.range || 'N/A'}</p>
        </div>
    `;
}

function createExplosiveInfo(item) {
    return `
        <div class="item-detail-section">
            <h3>Explosive Details</h3>
            <p><strong>Effect:</strong> ${item.effect || 'N/A'}</p>
            <p><strong>Duration:</strong> ${item.duration || 'N/A'}</p>
            <p><strong>Range:</strong> ${item.range || 'N/A'}</p>
        </div>
    `;
}

function createPotionInfo(item) {
    return `
        <div class="item-detail-section">
            <h3>Potion Details</h3>
            <p><strong>Effect:</strong> ${item.effect || 'N/A'}</p>
            <p><strong>Duration:</strong> ${item.duration || 'N/A'}</p>
            ${item.hpBonus ? `<p><strong>HP Bonus:</strong> ${item.hpBonus}</p>` : ''}
            ${item.mpBonus ? `<p><strong>MP Bonus:</strong> ${item.mpBonus}</p>` : ''}
        </div>
    `;
}

function createThrowableInfo(item) {
    return `
        <div class="item-detail-section">
            <h3>Throwable Details</h3>
            <p><strong>Effect:</strong> ${item.effect || 'N/A'}</p>
            <p><strong>Duration:</strong> ${item.duration || 'N/A'}</p>
            <p><strong>Range:</strong> ${item.range || 'N/A'}</p>
        </div>
    `;
}

function createTrapInfo(item) {
    return `
        <div class="item-detail-section">
            <h3>Trap Details</h3>
            <p><strong>Effect:</strong> ${item.effect || 'N/A'}</p>
            <p><strong>Duration:</strong> ${item.duration || 'N/A'}</p>
            <p><strong>Range:</strong> ${item.range || 'N/A'}</p>
        </div>
    `;
}

    function openItemDetailModal(item) {
        console.log("Opening item detail modal for:", item);
        const modal = document.getElementById('item-detail-modal');
        const title = document.getElementById('item-detail-name');
        const info = document.getElementById('item-detail-info');
        const equipButtons = document.getElementById('equip-buttons');
        
        title.textContent = item.Name || item.name || 'Unnamed Item';

        let infoHTML = `
            <div class="item-detail-grid">
                <div class="item-detail-section">
                    <h3>Basic Info</h3>
                    <p><strong>Type:</strong> ${item.itemType || 'Scroll'}</p>
                    <p><strong>Rarity:</strong> ${item.rarity || 'N/A'}</p>
                    ${item.Description || item.description ? `<p><strong>Description:</strong> ${item.Description || item.description}</p>` : ''}
                </div>`;

        infoHTML += createItemTypeSpecificInfo(item);
        infoHTML += createBonusesInfo(item);
        infoHTML += createSpecialPropertiesInfo(item);

        infoHTML += '</div>';
        info.innerHTML = infoHTML;

        equipButtons.innerHTML = '';
        createEquipButtons(item, equipButtons);

        modal.style.display = 'block';
    }

    function createItemTypeSpecificInfo(item) {
        console.log("Creating specific info for item:", item);
        let html = '';
        if (item.itemType === 'Scroll' || !item.itemType) {
            html = createScrollInfo(item);
        } else {
            switch (item.itemType) {
                case 'Weapon':
                    html = createWeaponInfo(item);
                    break;
                case 'Armor':
                    html = createArmorInfo(item);
                    break;
                case 'Ammunition':
                    html = createAmmunitionInfo(item);
                    break;
                case 'Crafting Component':
                    html = createCraftingComponentInfo(item);
                    break;
                case 'Explosive':
                    html = createExplosiveInfo(item);
                    break;
                case 'Potion':
                    html = createPotionInfo(item);
                    break;
                case 'Throwable':
                    html = createThrowableInfo(item);
                    break;
                case 'Trap':
                    html = createTrapInfo(item);
                    break;
                default:
                    html = '<p>No additional information available for this item type.</p>';
            }
        }
        return html;
    }
    

    function createScrollInfo(item) {
        return `
            <div class="item-detail-section">
                <h3>Scroll Details</h3>
                <p><strong>Effect:</strong> ${item.Effect || 'N/A'}</p>
                <p><strong>Range:</strong> ${item.Range || 'N/A'}</p>
                <p><strong>Damage:</strong> ${item.Damage || 'N/A'}</p>
                <p><strong>Damage Type:</strong> ${item.DamageType || 'N/A'}</p>
                <p><strong>Casting Time:</strong> ${item.CastingTime || 'N/A'}</p>
                <p><strong>Ability Point Cost:</strong> ${item.AbilityPointCost || 'N/A'}</p>
                <p><strong>Cooldown:</strong> ${item.Cooldown || 'N/A'}</p>
                <p><strong>Scaling:</strong> ${item.Scaling || 'N/A'}</p>
                <p><strong>Spellcasting Modifier:</strong> ${item.SpellCastingModifier || 'N/A'}</p>
            </div>
        `;
    }

    function createBonusesInfo(item) {
        let html = '';
        if (item.vitalBonus && Object.keys(item.vitalBonus).length > 0) {
            html += `
                <div class="item-detail-section">
                    <h3>Vital Bonuses</h3>
                    <ul>
                        ${Object.entries(item.vitalBonus).map(([key, value]) => `<li>${key}: ${value}</li>`).join('')}
                    </ul>
                </div>`;
        }
        if (item.skillBonus && Object.keys(item.skillBonus).length > 0) {
            html += `
                <div class="item-detail-section">
                    <h3>Skill Bonuses</h3>
                    <ul>
                        ${Object.entries(item.skillBonus).map(([key, value]) => `<li>${key}: ${value}</li>`).join('')}
                    </ul>
                </div>`;
        }
        return html;
    }

    function createSpecialPropertiesInfo(item) {
        let html = '';
        if (item.abilities && item.abilities.length > 0) {
            html += `
                <div class="item-detail-section">
                    <h3>Abilities</h3>
                    <ul>
                        ${item.abilities.map(ability => `<li>${ability}</li>`).join('')}
                    </ul>
                </div>`;
        }
        if (item.traits && item.traits.length > 0) {
            html += `
                <div class="item-detail-section">
                    <h3>Traits</h3>
                    <ul>
                        ${item.traits.map(trait => `<li>${trait}</li>`).join('')}
                    </ul>
                </div>`;
        }
        return html;
    }

    function createEquipButtons(item, equipButtons) {
        if (item.itemType === 'Weapon') {
            const primaryButton = document.createElement('button');
            primaryButton.textContent = 'Equip as Primary Weapon';
            primaryButton.onclick = () => equipWeapon(item, 'primary');

            const secondaryButton = document.createElement('button');
            secondaryButton.textContent = 'Equip as Secondary Weapon';
            secondaryButton.onclick = () => equipWeapon(item, 'secondary');

            equipButtons.appendChild(primaryButton);
            equipButtons.appendChild(secondaryButton);
        } else if (item.itemType === 'Armor') {
            const button = document.createElement('button');
            button.textContent = `Equip to ${item.armorType}`;
            button.onclick = () => equipArmor(item, item.armorType.toLowerCase());
            equipButtons.appendChild(button);
        } else {
            const equipButton = document.createElement('button');
            equipButton.textContent = 'Equip Item';
            equipButton.onclick = () => {
                if (equipItem(item)) {
                    document.getElementById('item-detail-modal').style.display = 'none';
                }
            };
            equipButtons.appendChild(equipButton);
        }
    }

    function equipItem(item) {
        console.log("Equipping item:", item);
    
        let equipped = false;
    
        if (item.itemType === 'Weapon') {
            equipped = equipWeapon(item, 'primary');
        } else if (item.itemType === 'Armor') {
            equipped = equipArmor(item, item.armorType.toLowerCase());
        } else if (['Throwable', 'Scroll', 'Potion', 'Explosive', 'Ammunition', 'Crafting Component'].includes(item.itemType)) {
            equipped = equipToUtilitySlot(item);
        } else {
            // For items that don't fit into the above categories
            applyItemBonuses(item);
            addItemAbilities(item);
            addItemTraits(item);
            addItemSpells(item);
            equipped = true;
        }
    
        if (equipped) {
            // Update the character data to reflect the newly equipped item
            const characterData = CharacterModule.getData();
            if (!characterData.equippedItems) {
                characterData.equippedItems = {};
            }
            characterData.equippedItems[item.armorType ? item.armorType.toLowerCase() : item.itemType] = item;
            
            // Update the UI
            UIModule.updateCharacterInfo(characterData);
            UIModule.updateEquippedItems(characterData.equippedItems);
    
            console.log("Item equipped successfully");
        } else {
            console.log("Failed to equip item");
        }
    
        return equipped;
    }

    function init() {
        loadInventoryData().then(() => {
            initializeUtilitySlots();
            createCategoryIcons();
            setupEquipmentSlotListeners();

            const categoriesContainer = document.getElementById('inventory-categories');
            if (categoriesContainer) {
                categoriesContainer.addEventListener('click', handleCategoryClick);
            }
        });

        document.querySelectorAll('.close').forEach(closeBtn => {
            closeBtn.onclick = function() {
                this.closest('.modal').style.display = 'none';
            }
        });

        window.onclick = function(event) {
            if (event.target.classList.contains('modal')) {
                event.target.style.display = 'none';
            }
        }
    }

    function handleCategoryClick(event) {
        const categoryElement = event.target.closest('.inventory-category');
        if (categoryElement) {
            const categoryName = categoryElement.dataset.category;
            const jsonKey = categoryElement.dataset.jsonKey;
            openCategoryModal(categoryName, jsonKey);
        }
    }

    function applyPercentageVitalBonus(percentage) {
        const vitals = CharacterModule.getVitals();
        for (const vital in vitals) {
            const currentValue = vitals[vital];
            const newValue = Math.floor(currentValue * (1 + percentage));
            CharacterModule.setVitals(vital, newValue);
        }
    }

    function removePercentageVitalBonus(percentage) {
        const vitals = CharacterModule.getVitals();
        for (const vital in vitals) {
            const currentValue = vitals[vital];
            const originalValue = Math.floor(currentValue / (1 + percentage));
            CharacterModule.setVitals(vital, originalValue);
        }
    }

    function removeBonuses(item) {
        if (item.vitalBonus && item.vitalBonus.allStats) {
            CharacterModule.removePercentageVitalBonus(item.vitalBonus.allStats);
        }

        for (const [vital, bonus] of Object.entries(item.vitalBonus || {})) {
            if (vital !== 'allStats') {
                const currentValue = CharacterModule.getVitals()[vital];
                CharacterModule.setVitals(vital, currentValue - bonus);
            }
        }

        for (const [skill, bonus] of Object.entries(item.skillBonus || {})) {
            UIModule.updateSkillScore(skill, -bonus);
        }

        UIModule.updateCharacterInfo(CharacterModule.getData());
        UIModule.updateVitalsDisplay();
        UIModule.updateSkillsDisplay();
    }



    return {
        init: init,
        equipWeapon: equipWeapon,
        equipArmor: equipArmor,
        equipItem: equipItem,
        showEquippableItems: showEquippableItems,
        openEquippedItemModal: openEquippedItemModal,
        applyItemBonuses,
        removeBonuses
    };
})();

// Main script
document.addEventListener('DOMContentLoaded', () => {
    // Initialize character data
    const characterData = CharacterModule.getData();
    UIModule.updateCharacterInfo(characterData);

    // Populate skills
    UIModule.populateSkills();

    function populateActions() {
        const actionsTab = document.getElementById('Actions');
        if (!actionsTab) {
            console.error('Actions tab not found');
            return;
        }

        const majorActionsSection = actionsTab.querySelector('.major-actions');
        if (!majorActionsSection) {
            console.error('Major Actions section not found');
            return;
        }

        // Clear existing content
        majorActionsSection.innerHTML = '<h3>Major Actions</h3>';

        // Add attack action
        const attackAction = document.createElement('div');
        attackAction.className = 'action attack-action';
        attackAction.innerHTML = `
            <h4>Attack</h4>
            <p>Make a basic attack against a target.</p>
            <button class="use-action-btn">Use Action</button>
        `;
        majorActionsSection.appendChild(attackAction);

        // Add event listener to the attack action button
        const useActionBtn = attackAction.querySelector('.use-action-btn');
        useActionBtn.addEventListener('click', handleAttackAction);
    }

    function handleAttackAction() {
        console.log('Attack action used');
        // Implement basic attack logic here
    }

    // Load dropdowns and initialize selections
    DataLoadingModule.loadDropdowns()
        .then(() => {
            const raceSelect = document.getElementById('character-race-input');
            const classSelect = document.getElementById('character-class-input');

            if (raceSelect && raceSelect.options.length > 0) {
                raceSelect.selectedIndex = 0;
                raceSelect.dispatchEvent(new Event('change'));
            } else {
                console.error('Race dropdown not found or empty');
            }

            if (classSelect && classSelect.options.length > 0) {
                classSelect.selectedIndex = 0;
                classSelect.dispatchEvent(new Event('change'));
            } else {
                console.error('Class dropdown not found or empty');
            }
        })
        .catch(error => console.error('Error initializing dropdowns:', error));

    const levelInput = document.getElementById('character-level-input');
    if (levelInput) {
        levelInput.addEventListener('change', function () {
            const newLevel = parseInt(this.value);
            CharacterModule.updateData('level', newLevel);
        });
    } else {
        console.error('Level input element not found');
    }

    // Set up tab navigation
    const defaultTab = document.querySelector('.tablink');
    const defaultSubtab = document.querySelector('.subtablink');

    if (defaultTab) {
        defaultTab.click();
    } else {
        console.error('Default tab not found');
    }

    if (defaultSubtab) {
        defaultSubtab.click();
    } else {
        console.error('Default subtab not found');
    }

    // Set up event listeners for tabs
    document.querySelectorAll('.tablink').forEach(tablink => {
        tablink.addEventListener('click', (event) => {
            TabModule.openTab(event, event.target.textContent.trim());
        });
    });

    document.querySelectorAll('.subtablink').forEach(subtablink => {
        subtablink.addEventListener('click', (event) => {
            TabModule.openSubTab(event, event.target.textContent.trim());
        });
    });

    // Event listeners for editable fields
    document.body.addEventListener('dblclick', (event) => {
        if (event.target.tagName === 'SPAN' && event.target.id) {
            UIModule.editField(event.target.id);
        }
    });

    document.body.addEventListener('blur', (event) => {
        if ((event.target.tagName === 'INPUT' || event.target.tagName === 'SELECT') && event.target.id.includes('-input')) {
            UIModule.saveField(event.target.id.replace('-input', ''));
        }
    }, true);

    // Skills management
const skillsContainer = document.getElementById('skills-container');

skillsContainer.addEventListener('dblclick', (event) => {
    const scoreContainer = event.target.closest('.skill-score-container');
    if (scoreContainer) {
        const buttons = scoreContainer.querySelector('.skill-buttons');
        buttons.classList.toggle('hidden');
    }
});

skillsContainer.addEventListener('click', (event) => {
    if (event.target.classList.contains('skill-increment') || event.target.classList.contains('skill-decrement')) {
        const skillBox = event.target.closest('.skill-box');
        const scoreElement = skillBox.querySelector('.skill-score');
        const baseScore = parseInt(scoreElement.dataset.baseScore);
        const bonus = parseInt(scoreElement.dataset.bonus);
        const characterLevel = parseInt(CharacterModule.getData().level);
        const maxSkillScore = Math.min(15);
        const availablePoints = CharacterModule.getAvailablePoints('skill');

        if (event.target.classList.contains('skill-increment')) {
            if (baseScore < maxSkillScore && availablePoints > 0) {
                const newBaseScore = Math.min(baseScore + 1, maxSkillScore);
                const pointsUsed = newBaseScore - baseScore;
                scoreElement.dataset.baseScore = newBaseScore;
                scoreElement.textContent = newBaseScore + bonus;
                CharacterModule.deductPoints('skill', pointsUsed);
            }
        } else if (event.target.classList.contains('skill-decrement')) {
            if (baseScore > 0) {
                const newBaseScore = baseScore - 1;
                scoreElement.dataset.baseScore = newBaseScore;
                scoreElement.textContent = newBaseScore + bonus;
                CharacterModule.addPoints('skill', 1);
            }
        }
    }
});

// Vital stats management
document.querySelectorAll('.stat-score-container').forEach(container => {
    const statScore = container.querySelector('.stat-score');
    const buttons = container.querySelector('.stat-buttons');

    statScore.addEventListener('dblclick', () => {
        buttons.classList.toggle('hidden');
    });

    const incrementBtn = container.querySelector('.stat-increment');
    const decrementBtn = container.querySelector('.stat-decrement');

    incrementBtn.addEventListener('click', () => {
        console.log('Increment button clicked');
        const currentScore = parseInt(statScore.textContent);
        const characterLevel = parseInt(CharacterModule.getData().level);
        const maxVitalScore = 5; // Changed this line
        const availablePoints = CharacterModule.getAvailablePoints('vital');
        console.log('Current score:', currentScore, 'Max score:', maxVitalScore, 'Available points:', availablePoints);

        if (currentScore < maxVitalScore && availablePoints > 0) {
            const newScore = currentScore + 1;
            const pointsUsed = 1;
            console.log('New score:', newScore, 'Points used:', pointsUsed);
            statScore.textContent = newScore;
            CharacterModule.deductPoints('vital', pointsUsed);
            console.log('After deduction, available points:', CharacterModule.getAvailablePoints('vital'));
        }
    });

    decrementBtn.addEventListener('click', () => {
        const currentScore = parseInt(statScore.textContent);
        if (currentScore > 0) {
            const newScore = currentScore - 1;
            statScore.textContent = newScore;
            CharacterModule.addPoints('vital', 1);
            console.log('After addition, available points:', CharacterModule.getAvailablePoints('vital'));
        }
    });
});

    // Initialize Inventory
    InventoryModule.init();
});
