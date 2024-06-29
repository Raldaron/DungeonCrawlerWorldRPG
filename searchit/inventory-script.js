document.addEventListener('DOMContentLoaded', async () => {
    try {
        const [weaponsData, armorData, itemsData, explosivesAmmoData, buffsData, uniqueAbilitiesData, spellsData] = await Promise.all([
            fetch('weapons.json').then(response => response.json()),
            fetch('armor.json').then(response => response.json()),
            fetch('items.json').then(response => response.json()),
            fetch('explosives-ammunition-json.json').then(response => response.json()),
            fetch('buffs.json').then(response => response.json()),
            fetch('uniqueAbilities.json').then(response => response.json()),
            fetch('spells.json').then(response => response.json())
        ]);

        const craftingComponents = {};
        const artifacts = {};
        const otherItems = {};

        // Separate crafting components, artifacts, and other items
        for (const [itemName, itemDetails] of Object.entries(itemsData.items)) {
            if (itemDetails.itemType === 'Crafting Component') {
                craftingComponents[itemName] = itemDetails;
            } else if (itemDetails.rarity === 'Artifact' || itemDetails.itemType === 'Artifact') {
                artifacts[itemName] = itemDetails;
            } else {
                otherItems[itemName] = itemDetails;
            }
        }

        // Check weapons and armor for artifacts
        for (const [itemName, itemDetails] of Object.entries(weaponsData.weapons)) {
            if (itemDetails.rarity === 'Artifact' || itemDetails.itemType === 'Artifact') {
                artifacts[itemName] = itemDetails;
                delete weaponsData.weapons[itemName];
            }
        }
        for (const [itemName, itemDetails] of Object.entries(armorData.armor)) {
            if (itemDetails.rarity === 'Artifact' || itemDetails.itemType === 'Artifact') {
                artifacts[itemName] = itemDetails;
                delete armorData.armor[itemName];
            }
        }

        // Correctly structure the Ammunition data
        const ammunition = {
            "Arrow of Enthusiastic Double Gonorrhea": explosivesAmmoData["Arrow of Enthusiastic Double Gonorrhea"],
            "Bolt of Ophiotaurus": explosivesAmmoData["Bolt of Ophiotaurus"],
            "Bolt of Petrify Rock Class": explosivesAmmoData["Bolt of Petrify Rock Class"]
        };

        const inventory = {
            'Artifacts': artifacts,
            'Weapons': weaponsData.weapons,
            'Armor': armorData.armor,
            'Crafting Components': craftingComponents,
            'Items': otherItems,
            'Explosives': explosivesAmmoData.explosives,
            'Ammunition': ammunition,
            'Buffs': buffsData,
            'Abilities': uniqueAbilitiesData,
            'Spells': spellsData
        };

        displayInventory(inventory);
    } catch (error) {
        console.error('Error loading data:', error);
    }
});

function formatItemName(name) {
    return name.split(/(?=[A-Z])/).join(' ');
}

function displayInventory(inventory) {
    const inventoryContainer = document.getElementById('inventory-container');
    inventoryContainer.innerHTML = ''; // Clear existing content
    
    for (const [category, items] of Object.entries(inventory)) {
        if (Object.keys(items).length === 0) continue; // Skip empty categories

        const categoryElement = document.createElement('div');
        categoryElement.classList.add('category');
        categoryElement.innerHTML = `
            <h2>${category}</h2>
            <div class="item-list"></div>
        `;
        
        const itemList = categoryElement.querySelector('.item-list');
        
        for (const [itemName, itemDetails] of Object.entries(items)) {
            const itemElement = document.createElement('div');
            itemElement.classList.add('item');
            
            const displayName = itemDetails.name || formatItemName(itemName);
            itemElement.textContent = displayName;
            
            itemElement.addEventListener('click', () => openItemModal(displayName, itemDetails, category));
            itemList.appendChild(itemElement);
        }
        
        inventoryContainer.appendChild(categoryElement);
    }
}

function openItemModal(itemName, itemDetails, category) {
    const modal = document.getElementById('item-modal');
    const modalTitle = document.getElementById('modal-title');
    const modalDetails = document.getElementById('modal-details');
    
    modalTitle.textContent = itemName;
    modalDetails.innerHTML = '';
    
    function renderObjectProperties(obj, indent = 0) {
        let html = '';
        for (const [key, value] of Object.entries(obj)) {
            if (key === 'name') continue; // Skip the name property as it's already in the title
            const formattedKey = formatItemName(key);
            if (typeof value === 'object' && value !== null) {
                html += `<p style="margin-left: ${indent}px"><strong>${formattedKey}:</strong></p>`;
                html += renderObjectProperties(value, indent + 20);
            } else {
                html += `<p style="margin-left: ${indent}px"><strong>${formattedKey}:</strong> ${value}</p>`;
            }
        }
        return html;
    }
    
    modalDetails.innerHTML = renderObjectProperties(itemDetails);
    
    modal.style.display = 'block';
    
    const closeBtn = modal.querySelector('.close');
    closeBtn.onclick = () => {
        modal.style.display = 'none';
    };
    
    window.onclick = (event) => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    };
}