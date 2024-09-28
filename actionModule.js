// actionModule.js

import EnhancementModule from './enhancementModule.js';

const ActionModule = {
    actions: [],

    init() {
        console.log('Initializing ActionModule');
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
        } else if (item.itemType === 'Throwable') {
            this.addThrowableAction(item);
        } else if (item.itemType === 'Potion') {
            this.addPotionAction(item);
        } else if (item.itemType === 'Ammunition') {
            this.addAmmunitionAction(item);
        } else {
            console.warn('Unknown item type:', item.itemType);
            return;
        }
        this.displayActions();
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
            name: scroll.name,
            manaCost: scroll.AbilityPointCost
        });
    },

    addExplosiveAction(explosive) {
        this.actions.push({
            type: 'explosive',
            name: explosive.name,
            damage: explosive.damage,
            damageType: explosive.damageType
        });
    },

    addThrowableAction(throwable) {
        this.actions.push({
            type: 'throwable',
            name: throwable.name,
            effect: throwable.effect
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
            name: ammunition.itemName,
            damage: ammunition.damage
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

        switch (action.type) {
            case 'weapon':
                card.innerHTML = `
                    <h3>${action.name}</h3>
                    <p>${action.enhancedDamageAmount || action.damageAmount} - ${action.damageType}</p>
                `;
                break;
            case 'scroll':
                card.innerHTML = `
                    <h3>${action.name}</h3>
                    <p>Mana Cost: ${action.manaCost}</p>
                `;
                break;
            case 'explosive':
                card.innerHTML = `
                    <h3>${action.name}</h3>
                    <p>${action.enhancedDamage || action.damage} - ${action.damageType}</p>
                `;
                break;
            case 'throwable':
                card.innerHTML = `
                    <h3>${action.name}</h3>
                    <p>Effect: ${action.effect}</p>
                `;
                break;
            case 'potion':
                card.innerHTML = `
                    <h3>${action.name}</h3>
                    <p>Effect: ${action.effect}</p>
                    <p>Duration: ${action.duration}</p>
                `;
                break;
            case 'ammunition':
                card.innerHTML = `
                    <h3>${action.name}</h3>
                    <p>Damage: ${action.enhancedDamage || action.damage}</p>
                `;
                break;
            default:
                console.warn('Unknown action type:', action.type);
                return null;
        }

        card.addEventListener('click', () => this.showActionDetails(action));
        return card;
    },

    showActionDetails(action) {
        if (['weapon', 'ammunition'].includes(action.type)) {
            this.showWeaponDetails(action);
        } else {
            this.showUtilityItemDetails(action);
        }
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
        document.getElementById('item-damage').textContent = `Damage: ${action.enhancedDamageAmount || action.damageAmount || 'N/A'}`;
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

        this.updateBonusesSection(action, 'utility-item-vital-bonuses', 'utility-item-skill-bonuses', 'utility-item-hp-bonus', 'utility-item-mp-bonus');

        document.getElementById('utility-item-abilities').textContent = `Abilities: ${this.formatArray(action.abilities)}`;
        document.getElementById('utility-item-traits').textContent = `Traits: ${this.formatArray(action.traits)}`;

        const equipButton = document.getElementById('utility-equip-unequip-button');
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

    updateAllActions() {
        this.actions.forEach(action => this.updateAction(action));
        this.displayActions();
    },

    updateAction(action) {
        const enhancements = EnhancementModule.getActiveEnhancements();
        for (const [enhancementName, level] of Object.entries(enhancements)) {
            const enhancement = EnhancementModule.enhancements.find(e => e.name === enhancementName);
            if (enhancement) {
                this.applyEnhancementToAction(action, enhancement, level);
            }
        }
    },

    applyEnhancementToAction(action, enhancement, level) {
        if (enhancement.name === "Pugilism" && action.damageType === "bare-knuckle") {
            const damageIncrease = 1 + (level * 0.25);
            action.enhancedDamageAmount = `${action.damageAmount} x ${damageIncrease.toFixed(2)}`;
        }
        // Add more enhancement applications here for different types of enhancements
    },

    applyEnhancementToActions(enhancement, level) {
        this.actions.forEach(action => this.applyEnhancementToAction(action, enhancement, level));
        this.displayActions();
    },

    removeEnhancementFromActions(enhancement) {
        this.actions.forEach(action => {
            if (action.enhancedDamageAmount && enhancement.name === "Pugilism" && action.damageType === "bare-knuckle") {
                delete action.enhancedDamageAmount;
            }
            // Remove other enhancement effects as needed
        });
        this.displayActions();
    }
};

export default ActionModule;