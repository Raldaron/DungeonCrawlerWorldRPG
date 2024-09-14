// itemDetailModal.js

import EquipmentModule from './equipment.js';
import InventoryModule from './inventory.js';
import VitalModule from './vital.js';
import SkillModule from './skill.js';
import EnhancementModule from './enhancementModule.js';

const ItemDetailModal = {
    modal: null,
    currentItem: null,

    init() {
        console.log('Initializing ItemDetailModal');
        this.modal = document.getElementById('item-detail-modal');
        const closeBtn = this.modal.querySelector('.close');
        closeBtn.onclick = () => this.closeModal();

        window.onclick = (event) => {
            if (event.target == this.modal) {
                this.closeModal();
            }
        };

        this.setupCollapsibles();
    },

    showItemDetails(item, isEquipped = false) {
        console.log('Showing item details:', item);
        this.currentItem = item;
        const title = document.getElementById('item-detail-title');
        const rarity = document.getElementById('item-rarity');
        const image = document.getElementById('item-image');
        const description = document.getElementById('item-description');
        const type = document.getElementById('item-type');
        const damage = document.getElementById('item-damage');
        const armorRating = document.getElementById('item-armor-rating');
        const vitalBonuses = document.getElementById('vital-bonuses');
        const skillBonuses = document.getElementById('skill-bonuses');
        const abilities = document.getElementById('item-abilities');
        const traits = document.getElementById('item-traits');
        const actionButton = document.getElementById('equip-unequip-button');

        title.textContent = item.name;
        rarity.textContent = item.rarity || 'Common';
        image.src = item.imageUrl || '/path/to/default/image.png';
        description.textContent = item.description || 'No description available.';
        type.textContent = item.itemType || 'Unknown';
        damage.textContent = item.damageAmount ? `${item.damageAmount} ${item.damageType}` : 'N/A';
        armorRating.textContent = item.armorRating || 'N/A';

        console.log('Vital bonuses:', item.vitalBonus);
        console.log('Skill bonuses:', item.skillBonus);

        this.populateVitalBonuses(vitalBonuses, item.vitalBonus);
        this.populateSkillBonuses(skillBonuses, item.skillBonus);
        this.populateList(abilities, item.abilities);
        this.populateList(traits, item.traits);

        actionButton.textContent = isEquipped ? 'Unequip' : 'Equip';
        actionButton.onclick = () => this.handleEquipUnequip(isEquipped);

        this.modal.style.display = 'block';
    },

    populateVitalBonuses(container, bonuses) {
        console.log('Populating vital bonuses:', bonuses);
        container.innerHTML = '';
        if (bonuses && typeof bonuses === 'object' && Object.keys(bonuses).length > 0) {
            const list = document.createElement('ul');
            for (const [vital, value] of Object.entries(bonuses)) {
                const listItem = document.createElement('li');
                listItem.textContent = `${vital}: +${value}`;
                list.appendChild(listItem);
            }
            container.appendChild(list);
        } else {
            container.textContent = 'No vital bonuses';
        }
        console.log('Vital bonuses container:', container.innerHTML);
    },
    
    populateSkillBonuses(container, bonuses) {
        console.log('Populating skill bonuses:', bonuses);
        container.innerHTML = '';
        if (bonuses && typeof bonuses === 'object' && Object.keys(bonuses).length > 0) {
            const list = document.createElement('ul');
            for (const [skill, value] of Object.entries(bonuses)) {
                const listItem = document.createElement('li');
                listItem.textContent = `${skill}: +${value}`;
                list.appendChild(listItem);
            }
            container.appendChild(list);
        } else {
            container.textContent = 'No skill bonuses';
        }
        console.log('Skill bonuses container:', container.innerHTML);
    },

    populateList(container, items) {
        container.innerHTML = '';
        if (items && items.length > 0) {
            const list = document.createElement('ul');
            items.forEach(item => {
                const listItem = document.createElement('li');
                listItem.textContent = item;
                list.appendChild(listItem);
            });
            container.appendChild(list);
        } else {
            container.textContent = 'None';
        }
    },

    handleEquipUnequip(isEquipped) {
        if (isEquipped) {
            EquipmentModule.unequipItem(this.currentItem.name);
            InventoryModule.addItem(this.currentItem.name, 1);
        } else {
            if (EquipmentModule.equipItem(this.currentItem.name)) {
                InventoryModule.removeItem(this.currentItem.name, 1);
            }
        }
        VitalModule.updateAllVitalScores();
        SkillModule.updateAllSkillScores();
        EnhancementModule.refreshEnhancements();
        this.closeModal();
    },

    closeModal() {
        this.modal.style.display = 'none';
    },

    setupCollapsibles() {
        console.log('Setting up collapsibles');
        const collapsibles = document.getElementsByClassName('collapsible');
        for (let i = 0; i < collapsibles.length; i++) {
            collapsibles[i].addEventListener('click', function() {
                this.classList.toggle('active');
                const content = this.nextElementSibling;
                if (content.style.maxHeight) {
                    content.style.maxHeight = null;
                } else {
                    content.style.maxHeight = content.scrollHeight + "px";
                }
                console.log('Collapsible clicked:', this, 'Content:', content, 'MaxHeight:', content.style.maxHeight);
            });
        }
    }
};

export default ItemDetailModal;