const ItemDatabaseModule = {
    items: {},
    initialized: false,  // Add this flag

    async init() {
        if (this.initialized) return;  // Add this check
        console.log('Initializing ItemDatabaseModule');
        await this.loadAllItems();
        this.initialized = true;  // Set the flag after initialization
    },

    async loadAllItems() {
        const fileNames = [
            'weapons.json',
            'armor.json',
            'potions.json',
            'throwables.json',
            'explosives.json',
            'scrolls.json',
            'crafting_components.json'
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
        return name.charAt(0).toUpperCase() + name.slice(1);
    },

    processItemData(data, category) {
        console.log(`Processing ${category} data:`, data);
        if (typeof data === 'object' && data !== null) {
            // Check if the data has a nested structure
            if (data[category.toLowerCase()]) {
                // Process nested structure
                for (const [key, item] of Object.entries(data[category.toLowerCase()])) {
                    if (typeof item === 'object' && item !== null) {
                        this.items[key] = { ...item, itemType: category, name: item.name || key, key: key };
                    }
                }
            } else {
                // Process flat structure
                for (const [key, item] of Object.entries(data)) {
                    if (typeof item === 'object' && item !== null) {
                        this.items[key] = { ...item, itemType: category, name: item.name || key, key: key };
                    }
                }
            }
        } else {
            console.error(`Invalid data structure for ${category}`);
        }
    },

    getItem(itemKey) {
        return this.items[itemKey];
    },

    getItemsByType(type) {
        const normalizedType = type.toLowerCase();
        const items = Object.values(this.items).filter(item => 
            item && item.itemType && item.itemType.toLowerCase() === normalizedType
        );
        console.log(`Getting items for type ${type}:`, items);
        return items;
    }
};

export default ItemDatabaseModule;