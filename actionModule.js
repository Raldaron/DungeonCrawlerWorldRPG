const ActionModule = {
    actions: [],

    init() {
        console.log('Initializing ActionModule');
        this.actions = [];
        this.displayActions();
    },

    addAction(item) {
        console.log('Adding action for item:', item);
        if (item.itemType === 'Weapon') {
            this.addWeaponAction(item);
        } else if (item.itemType === 'Scroll') {
            this.addScrollAction(item);
        } else if (item.itemType === 'Explosive') {
            this.addExplosiveAction(item);
        } else if (item.itemType === 'Throwable' || item.itemType === 'throwable') {
            this.addThrowableAction(item);
        } else if (item.itemType === 'Potion') {
            this.addPotionAction(item);
        } else if (item.itemType === 'Ammunition') {
            this.addAmmunitionAction(item);
        } else if (item.itemType === 'Trap') {
            this.addTrapAction(item);
        } else {
            console.warn('Unknown item type:', item.itemType);
            return;
        }
        this.displayActions();
    },
    
    // Add this method to handle trap actions
    addTrapAction(trap) {
        this.actions.push({
            type: 'trap',
            name: trap.name,
            effect: trap.effect,
            duration: trap.duration,
            range: trap.range
        });
    },

    removeAction(itemName) {
        console.log('Removing action for item:', itemName);
        this.actions = this.actions.filter(action => action.name !== itemName);
        this.displayActions();
    },

    addWeaponAction(weapon) {
        this.actions.push({
            type: 'weapon',
            name: weapon.name,
            damageAmount: weapon.damageAmount,
            damageType: weapon.damageType
        });
    },

    addScrollAction(scroll) {
        this.actions.push({
            type: 'scroll',
            name: scroll.Name,
            description: scroll.Description,
            effect: scroll.Effect,
            range: scroll.Range,
            damage: scroll.Damage,
            damageType: scroll.DamageType,
            castingTime: scroll.CastingTime,
            manaCost: scroll.AbilityPointCost,
            cooldown: scroll.Cooldown,
            spellCastingModifier: scroll.SpellCastingModifier
        });
    },

    addExplosiveAction(explosive) {
        this.actions.push({
            type: 'explosive',
            name: explosive.name,
            damage: explosive.damage,
            damageType: explosive.damageType,
            range: explosive.range,
            effect: explosive.effect
        });
    },

    addThrowableAction(throwable) {
        this.actions.push({
            type: 'throwable',
            name: throwable.name,
            effect: throwable.effect,
            range: throwable.range,
            duration: throwable.duration
        });
    },

    addPotionAction(potion) {
        this.actions.push({
            type: 'potion',
            name: potion.name,
            effect: potion.effect,
            duration: potion.duration
        });
    },

    addAmmunitionAction(ammunition) {
        this.actions.push({
            type: 'ammunition',
            name: ammunition.name,
            damage: ammunition.damage,
            effect: ammunition.effect
        });
    },

    displayActions() {
        console.log('Displaying actions:', this.actions);
        const actionsContainer = document.getElementById('actions-grid');
        if (actionsContainer) {
            actionsContainer.innerHTML = '';
            if (this.actions.length === 0) {
                actionsContainer.innerHTML = '<p>No actions available</p>';
            } else {
                this.actions.forEach(action => {
                    const actionCard = this.createActionCard(action);
                    actionsContainer.appendChild(actionCard);
                });
            }
        } else {
            console.error('Actions container (actions-grid) not found');
        }
    },

    createActionCard(action) {
        const card = document.createElement('div');
        card.className = 'action-card';
        
        let cardContent = '';
        
        switch (action.type) {
            case 'weapon':
                cardContent = `
                    <h3>${action.name}</h3>
                    <p>Type: Weapon</p>
                    <p>Damage: ${action.damageAmount} ${action.damageType}</p>
                `;
                break;
            case 'scroll':
                cardContent = `
                    <h3>${action.name}</h3>
                    <p>Type: Scroll</p>
                    <p>Effect: ${this.truncateText(action.effect, 50)}</p>
                    <p>Mana Cost: ${action.manaCost}</p>
                    <p>Cooldown: ${action.cooldown}</p>
                `;
                break;
            case 'explosive':
                cardContent = `
                    <h3>${action.name}</h3>
                    <p>Type: Explosive</p>
                    <p>Damage: ${action.damage} ${action.damageType}</p>
                    <p>Range: ${action.range}</p>
                    <p>Effect: ${this.truncateText(action.effect, 50)}</p>
                `;
                break;
            case 'throwable':
                cardContent = `
                    <h3>${action.name}</h3>
                    <p>Type: Throwable</p>
                    <p>Effect: ${this.truncateText(action.effect, 50)}</p>
                    <p>Range: ${action.range}</p>
                    <p>Duration: ${action.duration}</p>
                `;
                break;
            case 'potion':
                cardContent = `
                    <h3>${action.name}</h3>
                    <p>Type: Potion</p>
                    <p>Effect: ${this.truncateText(action.effect, 50)}</p>
                    <p>Duration: ${action.duration}</p>
                `;
                break;
            case 'ammunition':
                cardContent = `
                    <h3>${action.name}</h3>
                    <p>Type: Ammunition</p>
                    <p>Damage: ${action.damage}</p>
                    <p>Effect: ${this.truncateText(action.effect, 50)}</p>
                `;
                break;
            default:
                cardContent = `
                    <h3>${action.name}</h3>
                    <p>Type: ${action.type}</p>
                `;
        }
        
        card.innerHTML = cardContent;
        
        card.addEventListener('click', () => this.showActionDetails(action));
        return card;
    },

    truncateText(text, maxLength) {
        if (text.length <= maxLength) return text;
        return text.substr(0, maxLength) + '...';
    },

    showActionDetails(action) {
        const modal = document.getElementById('action-detail-modal');
        if (!modal) {
            console.error('Action detail modal not found');
            return;
        }

        const modalContent = modal.querySelector('.modal-content');
        modalContent.innerHTML = `
            <span class="close">&times;</span>
            <h2>${action.name}</h2>
            <p><strong>Type:</strong> ${action.type}</p>
            ${this.getActionDetailsContent(action)}
        `;

        modal.style.display = 'block';

        const closeButton = modal.querySelector('.close');
        closeButton.onclick = () => {
            modal.style.display = 'none';
        };

        window.onclick = (event) => {
            if (event.target == modal) {
                modal.style.display = 'none';
            }
        };
    },

    getActionDetailsContent(action) {
        switch (action.type) {
            case 'weapon':
                return `
                    <p><strong>Damage:</strong> ${action.damageAmount} ${action.damageType}</p>
                `;
            case 'scroll':
                return `
                    <p><strong>Effect:</strong> ${action.effect}</p>
                    <p><strong>Range:</strong> ${action.range}</p>
                    <p><strong>Damage:</strong> ${action.damage || 'N/A'}</p>
                    <p><strong>Damage Type:</strong> ${action.damageType || 'N/A'}</p>
                    <p><strong>Casting Time:</strong> ${action.castingTime}</p>
                    <p><strong>Mana Cost:</strong> ${action.manaCost}</p>
                    <p><strong>Cooldown:</strong> ${action.cooldown}</p>
                    <p><strong>Spell Casting Modifier:</strong> ${action.spellCastingModifier}</p>
                `;
            case 'explosive':
                return `
                    <p><strong>Damage:</strong> ${action.damage} ${action.damageType}</p>
                    <p><strong>Range:</strong> ${action.range}</p>
                    <p><strong>Effect:</strong> ${action.effect}</p>
                `;
            case 'throwable':
                return `
                    <p><strong>Effect:</strong> ${action.effect}</p>
                    <p><strong>Range:</strong> ${action.range}</p>
                    <p><strong>Duration:</strong> ${action.duration}</p>
                `;
            case 'potion':
                return `
                    <p><strong>Effect:</strong> ${action.effect}</p>
                    <p><strong>Duration:</strong> ${action.duration}</p>
                `;
            case 'ammunition':
                return `
                    <p><strong>Damage:</strong> ${action.damage}</p>
                    <p><strong>Effect:</strong> ${action.effect}</p>
                `;
            default:
                return '<p>No additional details available.</p>';
        }
    },

    showUtilityItemDetails(action) {
        const modal = document.getElementById('utility-item-detail-modal');
        if (!modal) {
            console.error('Utility item detail modal not found');
            return;
        }

        document.getElementById('utility-item-detail-title').textContent = action.name;
        document.getElementById('utility-item-rarity').textContent = action.rarity || 'N/A';
        document.getElementById('utility-item-description').textContent = action.description || 'No description available';
        document.getElementById('utility-item-type').textContent = `Type: ${action.type}`;
        document.getElementById('utility-item-effect').textContent = `Effect: ${action.effect || 'N/A'}`;
        document.getElementById('utility-item-duration').textContent = `Duration: ${action.duration || 'N/A'}`;
        document.getElementById('utility-item-range').textContent = `Range: ${action.range || 'N/A'}`;

        if (action.type === 'scroll') {
            document.getElementById('utility-item-damage').textContent = `Damage: ${action.damage || 'N/A'}`;
            document.getElementById('utility-item-damage-type').textContent = `Damage Type: ${action.damageType || 'N/A'}`;
            document.getElementById('utility-item-casting-time').textContent = `Casting Time: ${action.castingTime || 'N/A'}`;
            document.getElementById('utility-item-mana-cost').textContent = `Mana Cost: ${action.manaCost || 'N/A'}`;
            document.getElementById('utility-item-cooldown').textContent = `Cooldown: ${action.cooldown || 'N/A'}`;
            document.getElementById('utility-item-spell-modifier').textContent = `Spell Casting Modifier: ${action.spellCastingModifier || 'N/A'}`;
        }

        this.updateBonusesSection(action, 'utility-item-vital-bonuses', 'utility-item-skill-bonuses', 'utility-item-hp-bonus', 'utility-item-mp-bonus');

        document.getElementById('utility-item-abilities').textContent = `Abilities: ${this.formatArray(action.abilities)}`;
        document.getElementById('utility-item-traits').textContent = `Traits: ${this.formatArray(action.traits)}`;

        const equipButton = document.getElementById('utility-equip-unequip-button');
        equipButton.style.display = 'none';

        modal.style.display = 'block';

        this.setupModalCloseHandlers(modal);
    },

    showScrollDetails(scroll) {
        const modal = document.getElementById('utility-item-detail-modal');
        if (!modal) {
            console.error('Utility item detail modal not found');
            return;
        }
    
        document.getElementById('utility-item-detail-title').textContent = scroll.name;
        document.getElementById('utility-item-rarity').textContent = scroll.rarity || 'N/A';
        document.getElementById('utility-item-description').textContent = scroll.description || 'No description available';
        document.getElementById('utility-item-type').textContent = `Type: Scroll`;
        document.getElementById('utility-item-effect').textContent = `Effect: ${scroll.effect || 'N/A'}`;
        document.getElementById('utility-item-range').textContent = `Range: ${scroll.range || 'N/A'}`;
        document.getElementById('utility-item-damage').textContent = `Damage: ${scroll.damage || 'N/A'}`;
        document.getElementById('utility-item-damage-type').textContent = `Damage Type: ${scroll.damageType || 'N/A'}`;
        document.getElementById('utility-item-casting-time').textContent = `Casting Time: ${scroll.castingTime || 'N/A'}`;
        document.getElementById('utility-item-mana-cost').textContent = `Mana Cost: ${scroll.manaCost || 'N/A'}`;
        document.getElementById('utility-item-cooldown').textContent = `Cooldown: ${scroll.cooldown || 'N/A'}`;
        document.getElementById('utility-item-spell-modifier').textContent = `Spell Casting Modifier: ${scroll.spellCastingModifier || 'N/A'}`;
    
        this.updateBonusesSection(scroll, 'utility-item-vital-bonuses', 'utility-item-skill-bonuses', 'utility-item-hp-bonus', 'utility-item-mp-bonus');
    
        document.getElementById('utility-item-abilities').textContent = `Abilities: ${this.formatArray(scroll.abilities)}`;
        document.getElementById('utility-item-traits').textContent = `Traits: ${this.formatArray(scroll.traits)}`;
    
        const equipButton = document.getElementById('utility-equip-unequip-button');
        equipButton.style.display = 'none';
    
        modal.style.display = 'block';
    
        this.setupModalCloseHandlers(modal);
    },

    showWeaponDetails(action) {
        const modal = document.getElementById('item-detail-modal');
        if (!modal) {
            console.error('Item detail modal not found');
            return;
        }

        document.getElementById('item-detail-title').textContent = action.name;
        document.getElementById('item-rarity').textContent = action.rarity || 'N/A';
        document.getElementById('item-description').textContent = action.description || 'No description available';
        document.getElementById('item-type').textContent = `Type: ${action.type}`;
        document.getElementById('item-subtype').textContent = `Subtype: ${action.subtype || 'N/A'}`;
        document.getElementById('item-damage').textContent = `Damage: ${action.damageAmount || 'N/A'}`;
        document.getElementById('item-damage-type').textContent = `Damage Type: ${action.damageType || 'N/A'}`;
        document.getElementById('item-range').textContent = `Range: ${action.range || 'N/A'}`;
        document.getElementById('item-hands-required').textContent = `Hands Required: ${action.handsRequired || 'N/A'}`;
        document.getElementById('item-armor-rating').textContent = `Armor Rating: ${action.armorRating || 'N/A'}`;
        document.getElementById('item-tank-modifier').textContent = `Tank Modifier: ${action.tankModifier || 'N/A'}`;

        this.updateBonusesSection(action, 'item-vital-bonuses', 'item-skill-bonuses', 'item-hp-bonus', 'item-mp-bonus');

        document.getElementById('item-abilities').textContent = `Abilities: ${this.formatArray(action.abilities)}`;
        document.getElementById('item-traits').textContent = `Traits: ${this.formatArray(action.traits)}`;
        document.getElementById('item-spells-granted').textContent = `Spells Granted: ${this.formatArray(action.spellsGranted)}`;

        const equipButton = document.getElementById('equip-unequip-button');
        equipButton.style.display = 'none';

        modal.style.display = 'block';

        this.setupModalCloseHandlers(modal);
    },

    updateBonusesSection(item, vitalBonusesId, skillBonusesId, hpBonusId, mpBonusId) {
        const vitalBonusesElement = document.getElementById(vitalBonusesId);
        const skillBonusesElement = document.getElementById(skillBonusesId);
        
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

        document.getElementById(hpBonusId).textContent = `HP Bonus: ${item.hpBonus || 0}`;
        document.getElementById(mpBonusId).textContent = `MP Bonus: ${item.mpBonus || 0}`;
    },

    setupModalCloseHandlers(modal) {
        const closeBtn = modal.querySelector('.close');
        if (closeBtn) {
            closeBtn.onclick = () => {
                modal.style.display = 'none';
            };
        }

        window.onclick = (event) => {
            if (event.target == modal) {
                modal.style.display = 'none';
            }
        };
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

    capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    },

    loadSavedData(data) {
        if (data && data.actions) {
            this.actions = data.actions;
            this.displayActions();
        }
    },

    getAllActionData() {
        return {
            actions: this.actions.map(action => {
                // Create a copy of the action object
                const actionCopy = { ...action };
                
                // Remove any circular references or functions
                delete actionCopy.element;
                
                return actionCopy;
            })
        };
    }
};

export default ActionModule;