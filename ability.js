// Ability Module
const AbilityModule = {
    allAbilities: {},
    currentAbilities: {
        race: [],
        class: [],
        equipment: []
    },
    eventListenersAttached: false,

    init() {
        console.log('AbilityModule init called');
        this.loadAbilities()
            .then(() => {
                this.setupEventListeners();
                this.displayCurrentAbilities();
            })
            .catch(error => console.error('Error initializing AbilityModule:', error));
    },

    loadAbilities() {
        console.log('Loading abilities');
        return fetch('abilities.json')
            .then(response => response.json())
            .then(data => {
                this.allAbilities = data.uniqueability;
                console.log('Abilities loaded:', this.allAbilities);
            })
            .catch(error => console.error('Error loading abilities:', error));
    },
    
    setupEventListeners() {
        console.log('Setting up AbilityModule event listeners');
        if (this.eventListenersAttached) {
            console.log('Event listeners already attached, skipping');
            return;
        }

        const activeAbilitiesElement = document.getElementById('active-abilities');
        if (activeAbilitiesElement) {
            activeAbilitiesElement.addEventListener('click', () => this.openAbilitiesModal());
        }

        const closeButton = document.querySelector('#ability-modal .close');
        if (closeButton) {
            closeButton.addEventListener('click', () => this.closeAbilityModal());
        }

        window.addEventListener('click', (event) => {
            if (event.target === document.getElementById('ability-modal')) {
                this.closeAbilityModal();
            }
        });

        this.eventListenersAttached = true;
    },

    updateAbilities(source, newAbilities) {
        if (source in this.currentAbilities) {
            this.currentAbilities[source] = newAbilities;
        }
        this.displayCurrentAbilities();
    },

    addEquipmentAbilities(abilities) {
        console.log('Adding equipment abilities:', abilities);
        this.currentAbilities.equipment = [...new Set([...this.currentAbilities.equipment, ...abilities])];
        this.updateAbilitiesGrid();
    },

    removeEquipmentAbilities(abilities) {
        console.log('Removing equipment abilities:', abilities);
        this.currentAbilities.equipment = this.currentAbilities.equipment.filter(ability => !abilities.includes(ability));
        this.updateAbilitiesGrid();
    },

    updateAbilitiesGrid() {
        const grid = document.getElementById('abilities-grid-main');
        if (grid) {
            grid.innerHTML = '';
            const allCurrentAbilities = this.getAllCurrentAbilities();

            allCurrentAbilities.forEach(abilityName => {
                const ability = this.allAbilities[abilityName];
                if (ability) {
                    const card = this.createAbilityCard(abilityName, ability);
                    grid.appendChild(card);
                } else {
                    console.warn(`AbilityModule: Ability not found: ${abilityName}`);
                }
            });
        } else {
            console.error(`AbilityModule: Abilities grid not found`);
        }
    },

    createAbilityCard(abilityName, ability) {
        const card = document.createElement('div');
        card.className = 'ability-card';
        card.innerHTML = `
            <div class="ability-name">${ability.Name || abilityName}</div>
            <div class="ability-cooldown">Cooldown: ${ability.Cooldown || 'N/A'}</div>
        `;
        card.addEventListener('click', () => this.showAbilityDetails(abilityName));
        return card;
    },

    getAllCurrentAbilities() {
        return [...new Set([
            ...this.currentAbilities.race,
            ...this.currentAbilities.class,
            ...this.currentAbilities.equipment
        ])];
    },

    showAbilityDetails(abilityName) {
        const ability = this.allAbilities[abilityName];
        if (!ability) {
            console.error(`Ability ${abilityName} not found`);
            return;
        }
    
        const modal = document.getElementById('ability-modal');
        const content = document.getElementById('ability-modal-content');
    
        if (!modal || !content) {
            console.error('Ability modal elements not found');
            return;
        }
    
        content.innerHTML = this.createAbilityModalContent(ability);
        
        const levelSelect = document.getElementById('ability-level-select');
        if (levelSelect) {
            levelSelect.addEventListener('change', () => this.updateAbilityDisplay(ability, parseInt(levelSelect.value)));
        }
        
        this.updateAbilityDisplay(ability, 1);  // Start at level 1
        
        modal.style.display = 'block';
    },

    createAbilityModalContent(ability) {
        let html = `
            <div class="ability-modal-grid">
                <h2 class="ability-name">${ability.Name || 'Unknown Ability'}</h2>
                <p class="ability-description">${ability.Description || 'No description available.'}</p>
                ${this.formatField('APC', ability.AbilityPointCost)}
                ${this.formatField('Damage', ability.Damage, ability.DamageType)}
                ${this.formatField('Range', ability.Range)}
                ${this.formatField('Cooldown', ability.Cooldown)}
                <div class="ability-level-select">
                    <label for="ability-level-select">Current Level:</label>
                    <select id="ability-level-select">
                        ${this.createLevelOptions(ability)}
                    </select>
                </div>
                <p class="ability-effect"></p>
            </div>
        `;

        return html;
    },

    createLevelOptions(ability) {
        if (!ability.Scaling || !Array.isArray(ability.Scaling) || ability.Scaling.length === 0) {
            return '<option value="1">1</option>';
        }
        
        let options = '';
        for (let i = 1; i <= ability.Scaling.length; i++) {
            options += `<option value="${i}">${i}</option>`;
        }
        return options;
    },

    formatField(label, value, subValue = '') {
        if (value && value !== 'N/A') {
            let content = `<strong>${label}:</strong> ${value}`;
            if (subValue) {
                content += ` ${subValue}`;
            }
            return `<p class="ability-${label.toLowerCase()}">${content}</p>`;
        }
        return '';
    },

    updateAbilityDisplay(ability, level) {
        const effectElement = document.querySelector('.ability-effect');
        if (effectElement) {
            let effect = ability.Effect || 'No effect description available.';
            effect += '\n\n'; // Add two line breaks after the base effect

            if (ability.Scaling && Array.isArray(ability.Scaling)) {
                for (let i = 0; i < ability.Scaling.length; i++) {
                    if (ability.Scaling[i] && ability.Scaling[i].trim() !== '') {
                        // Add each non-empty scaling level on a new line
                        effect += `<strong>Level ${i + 1}:</strong> ${ability.Scaling[i]}\n`;
                    }
                }
            } else {
                effect += 'No scaling information available.';
            }
            
            // Use innerHTML to preserve line breaks and bold formatting
            effectElement.innerHTML = effect.replace(/\n/g, '<br>');
        }
    
        this.updateDynamicContent(ability, level);
    },

    updateDynamicContent(ability, level) {
        const content = document.getElementById('ability-modal-content');
        if (!content) return;

        // Update APC
        const apcElement = content.querySelector('.ability-apc');
        if (apcElement) {
            let updatedCost = this.calculateScaledValue(ability.AbilityPointCost, level);
            apcElement.innerHTML = this.formatField('APC', updatedCost);
        }

        // Update Damage
        const damageElement = content.querySelector('.ability-damage');
        if (damageElement) {
            let updatedDamage = this.calculateScaledValue(ability.Damage, level);
            damageElement.innerHTML = this.formatField('Damage', updatedDamage, ability.DamageType);
        }

        // Update current level display
        const levelSelect = document.getElementById('ability-level-select');
        if (levelSelect) {
            levelSelect.value = level;
        }
    },

    displayCurrentAbilities() {
        const grid = document.getElementById('abilities-grid-main');
        if (grid) {
            grid.innerHTML = '';
            const allCurrentAbilities = this.getAllCurrentAbilities();
    
            allCurrentAbilities.forEach(abilityName => {
                const ability = this.allAbilities[abilityName];
                if (ability) {
                    const card = this.createAbilityCard(abilityName, ability);
                    grid.appendChild(card);
                } else {
                    console.warn(`AbilityModule: Ability not found: ${abilityName}`);
                }
            });
        } else {
            console.error(`AbilityModule: Abilities grid not found`);
        }
    },

    calculateScaledValue(value, level) {
        if (typeof value === 'string' && value.includes('level')) {
            return value.replace('level', level);
        }
        return value;
    },

    calculateScaledDamage(damageFormula, level) {
        return damageFormula.replace('level', level);
    },

    calculateScaledCost(costFormula, level) {
        return costFormula.replace('level', level);
    },

    openAbilitiesModal() {
        const modal = document.getElementById('abilities-modal');
        if (modal) {
            modal.style.display = 'block';
        }
    },

    closeAbilityModal() {
        const modal = document.getElementById('ability-modal');
        if (modal) {
            modal.style.display = 'none';
        }
    },

    getAllAbilityData() {
        return {
            currentAbilities: this.currentAbilities
        };
    },

    loadSavedData(data) {
        if (data) {
            this.currentAbilities = data.currentAbilities || {
                race: [],
                class: [],
                equipment: []
            };
            this.displayCurrentAbilities();
        }
    }
};

export default AbilityModule;