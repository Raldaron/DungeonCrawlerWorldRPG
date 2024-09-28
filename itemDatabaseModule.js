const ItemDatabaseModule = {
    items: {},
    initialized: false,

    async init() {
        if (this.initialized) return;
        console.log('Initializing ItemDatabaseModule');
        await this.loadAllItems();
        this.initialized = true;
    },

    async loadAllItems() {
        const fileNames = [
            'weapons.json',
            'armor.json',
            'potions.json',
            'throwables.json',
            'explosives.json',
            'scrolls.json',
            'crafting_components.json',
            'traps.json',
            'ammunition.json'
        ];
    
        for (const fileName of fileNames) {
            try {
                const response = await fetch(fileName);
                const data = await response.json();
                console.log(`Loaded data from ${fileName}:`, data);
                const category = this.getCategoryFromFileName(fileName);
                this.processItemData(data, category);
            } catch (error) {
                console.error(`Error loading ${fileName}:`, error);
            }
        }
    
        console.log('All items loaded:', this.items);
    },
    
    getCategoryFromFileName(fileName) {
        const name = fileName.split('.')[0];
        if (name === 'crafting_components') {
            return 'CraftingComponents';
        }
        return name.charAt(0).toUpperCase() + name.slice(1);
    },

    processItemData(data, category) {
        console.log(`Processing ${category} data:`, data);
        if (typeof data === 'object' && data !== null) {
            // Check if the data has a nested structure
            const itemsObject = data[category.toLowerCase()] || data.craftingcomponents || data;
            for (const [key, item] of Object.entries(itemsObject)) {
                if (typeof item === 'object' && item !== null) {
                    this.items[key] = { ...item, itemType: category, name: item.name || key, key: key };
                }
            }
        } else {
            console.error(`Invalid data structure for ${category}`);
        }
    },

    getItemsByType(type) {
        const normalizedType = type.toLowerCase();
        const items = Object.values(this.items).filter(item => 
            item && item.itemType && item.itemType.toLowerCase() === normalizedType
        );
        console.log(`Getting items for type ${type}:`, items);
        return items;
    },

    getItem(itemKey) {
        return this.items[itemKey];
    }
};

export default ItemDatabaseModule;
