const SpellModule = {
    allSpells: {},
    knownSpells: [],
    learnedSpells: [], // Add this line
    grantedSpells: [], // Add this line

    init() {
        console.log('Initializing SpellModule');
        return this.loadSpells()
            .then(() => {
                this.setupEventListeners();
                this.updateKnownSpells(); // Update this to use both arrays
            })
            .catch(error => console.error('Error initializing SpellModule:', error));
    },

    loadSpells() {
        console.log('Loading spells...');
        return fetch('spells.json')
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                console.log('Spells loaded:', data);
                if (!data.spells || Object.keys(data.spells).length === 0) {
                    throw new Error('No spells found in the loaded data');
                }
                this.allSpells = data.spells;
                this.populateFilters();
            })
            .catch(error => {
                console.error('Error loading spells:', error);
                throw error;
            });
    },
    
    displaySpells() {
        console.log('Displaying spells in Arcana tab');
        const container = document.getElementById('arcana-spells-container');
        if (container) {
            container.innerHTML = '';
            if (Object.keys(this.allSpells).length === 0) {
                console.log('No spells loaded yet');
                container.innerHTML = '<p>No spells available. Please try reloading the page.</p>';
                return;
            }
            Object.entries(this.allSpells).forEach(([key, spell]) => {
                const spellCard = this.createArcanaSpellCard(key, spell);
                container.appendChild(spellCard);
            });
        } else {
            console.error('Arcana spells container not found');
        }
    },

    setupEventListeners() {
        console.log('Setting up event listeners');
        const searchInput = document.getElementById('spell-search');
        if (searchInput) {
            searchInput.addEventListener('input', () => this.filterSpells());
        } else {
            console.warn('Search input not found');
        }

        ['archetype', 'damage-type', 'casting-time', 'spellcasting-modifier'].forEach(filterType => {
            const filter = document.getElementById(`spell-filter-${filterType}`);
            if (filter) {
                filter.addEventListener('change', () => {
                    console.log(`${filterType} filter changed`);
                    this.filterSpells();
                });
            } else {
                console.warn(`Filter element not found: spell-filter-${filterType}`);
            }
        });
    },

    populateFilters() {
        console.log('Populating filters...');
        const archetypes = new Set(['Barbarian', 'Bard', 'Cleric', 'Fighter', 'Monk', 'Necromancer', 'Ranger', 'Rogue', 'Sorcerer', 'Wizard']);
        const damageTypes = new Set();
        const castingTimes = new Set();
        const spellcastingModifiers = new Set();
    
        Object.values(this.allSpells).forEach(spell => {
            if (spell.DamageType) damageTypes.add(spell.DamageType);
            if (spell.CastingTime) castingTimes.add(spell.CastingTime);
            if (spell.SpellCastingModifier) spellcastingModifiers.add(spell.SpellCastingModifier);
        });
    
        this.populateFilterOptions('spell-filter-archetype', archetypes);
        this.populateFilterOptions('spell-filter-damage-type', damageTypes);
        this.populateFilterOptions('spell-filter-casting-time', castingTimes);
        this.populateFilterOptions('spell-filter-spellcasting-modifier', spellcastingModifiers);
    },

    populateFilterOptions(filterId, options) {
        console.log(`Populating filter: ${filterId}`, options);
        const filter = document.getElementById(filterId);
        if (filter) {
            filter.innerHTML = `<option value="">All ${filter.id.split('-').pop().replace(/([A-Z])/g, ' $1').trim()}s</option>`;
            Array.from(options).sort((a, b) => a.toString().localeCompare(b.toString())).forEach(option => {
                const optionElement = document.createElement('option');
                optionElement.value = option;
                optionElement.textContent = option;
                filter.appendChild(optionElement);
            });
        } else {
            console.error(`Filter element not found: ${filterId}`);
        }
    },

    displayKnownSpells() {
        const container = document.getElementById('known-spells-container');
        if (container) {
            container.innerHTML = '';
            this.knownSpells.forEach(spellKey => {
                const spellCard = this.createKnownSpellCard(spellKey);
                container.appendChild(spellCard);
            });
        } else {
            console.error('Known spells container not found');
        }
    },

    updateKnownSpells() {
        console.log('Updating known spells in Spells subtab');
        const container = document.getElementById('known-spells-container');
        if (container) {
            container.innerHTML = '';
            const allKnownSpells = [...new Set([...this.learnedSpells, ...this.grantedSpells])];
            allKnownSpells.forEach(spellKey => {
                const spellCard = this.createKnownSpellCard(spellKey, this.learnedSpells.includes(spellKey));
                container.appendChild(spellCard);
            });
        } else {
            console.error('Known spells container not found');
        }
    },
    
    updateSpellsSubtab() {
        const spellsContainer = document.getElementById('known-spells-container');
        if (spellsContainer) {
            spellsContainer.innerHTML = '';
            spellsContainer.className = 'spells-grid';
            const allKnownSpells = [...new Set([...this.learnedSpells, ...this.grantedSpells])];
            allKnownSpells.forEach(spellKey => {
                const spellCard = this.createKnownSpellCard(spellKey, this.learnedSpells.includes(spellKey));
                spellsContainer.appendChild(spellCard);
            });
        }
    },

    addEquipmentSpells(spells) {
        spells.forEach(spellName => {
            if (this.allSpells[spellName] && !this.grantedSpells.includes(spellName)) {
                this.grantedSpells.push(spellName);
            }
        });
        this.updateKnownSpells();
    },
    
    removeEquipmentSpells(spells) {
        this.grantedSpells = this.grantedSpells.filter(spellName => !spells.includes(spellName));
        this.updateKnownSpells();
    },

    createKnownSpellCard(spellKey, isLearned) {
        const spell = this.allSpells[spellKey];
        const card = document.createElement('div');
        card.className = `spell-card known-spell-card ${isLearned ? 'learned-spell' : 'granted-spell'}`;
        card.innerHTML = `
            <div class="spell-name">${spell.Name}</div>
            <div class="spell-cooldown">Cooldown: ${spell.Cooldown || 'N/A'}</div>
            <div class="spell-source">${isLearned ? 'Learned' : 'Granted'}</div>
        `;
    
        card.addEventListener('click', () => this.showSpellDetails(spellKey, true));
    
        return card;
    },

    createArcanaSpellCard(key, spell) {
        const card = document.createElement('div');
        card.className = 'spell-card arcana-spell-card';
        card.innerHTML = `
            <div class="spell-name">${spell.Name}</div>
            <div class="spell-cooldown">Cooldown: ${spell.Cooldown || 'N/A'}</div>
            <div class="spell-buttons">
                <button class="learn-spell-btn" data-spell-key="${key}">Learn Spell</button>
                <button class="view-details-btn">View Details</button>
            </div>
        `;
    
        card.querySelector('.learn-spell-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            this.learnSpell(key);
        });
    
        card.querySelector('.view-details-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            this.showSpellDetails(key);
        });
    
        return card;
    },

    showSpellDetails(key, isKnownSpell = false) {
        const spell = this.allSpells[key];
        const modal = document.getElementById('spell-modal');
        const modalTitle = document.getElementById('spell-modal-title');
        const modalContent = document.getElementById('spell-modal-content');

        if (!modal || !modalTitle || !modalContent) {
            console.error('Spell modal elements not found');
            return;
        }

        modalTitle.textContent = spell.Name;

        const fields = [
            { id: 'spell-description', key: 'Description', label: 'Description' },
            { id: 'spell-effect', key: 'Effect', label: 'Effect' },
            { id: 'spell-range', key: 'Range', label: 'Range' },
            { id: 'spell-damage', key: 'Damage', label: 'Damage' },
            { id: 'spell-damage-type', key: 'DamageType', label: 'Damage Type' },
            { id: 'spell-casting-time', key: 'CastingTime', label: 'Casting Time' },
            { id: 'spell-ap-cost', key: 'AbilityPointCost', label: 'AP Cost' },
            { id: 'spell-cooldown', key: 'Cooldown', label: 'Cooldown' },
            { id: 'spell-modifier', key: 'SpellCastingModifier', label: 'Modifier' }
        ];

        fields.forEach(field => {
            const element = document.getElementById(field.id);
            if (element) {
                if (spell[field.key] && spell[field.key] !== 'N/A') {
                    element.innerHTML = `<strong>${field.label}:</strong> ${spell[field.key]}`;
                    element.style.display = 'block';
                } else {
                    element.style.display = 'none';
                }
            }
        });

        const scalingList = document.getElementById('spell-scaling-list');
    const scalingContainer = document.getElementById('spell-scaling');
    if (scalingList && scalingContainer) {
        if (Array.isArray(spell.Scaling) && spell.Scaling.length > 0) {
            scalingContainer.style.display = 'block';
        } else {
            scalingContainer.style.display = 'none';
        }
    }

    const levelControl = document.getElementById('spell-level-control');
    if (levelControl) {
        levelControl.style.display = isKnownSpell ? 'flex' : 'none';
    }

    const currentLevelSpan = document.getElementById('current-spell-level');
    if (currentLevelSpan) {
        currentLevelSpan.textContent = '1';
    }

    const decreaseBtn = document.getElementById('decrease-spell-level');
    const increaseBtn = document.getElementById('increase-spell-level');
    if (decreaseBtn && increaseBtn) {
        decreaseBtn.onclick = () => this.changeSpellLevel(spell, -1);
        increaseBtn.onclick = () => this.changeSpellLevel(spell, 1);
    }

        modal.style.display = 'block';

        // Close button functionality
        const closeBtn = modal.querySelector('.close');
        if (closeBtn) {
            closeBtn.onclick = () => {
                modal.style.display = 'none';
            };
        }

        // Close modal when clicking outside
        window.onclick = (event) => {
            if (event.target == modal) {
                modal.style.display = 'none';
            }
        };

        // Initialize scaling display
        this.updateSpellDetails(spell, 1);
    },

    changeSpellLevel(spell, change) {
        const currentLevelSpan = document.getElementById('current-spell-level');
        if (currentLevelSpan) {
            let currentLevel = parseInt(currentLevelSpan.textContent);
            currentLevel = Math.max(1, Math.min(20, currentLevel + change));
            currentLevelSpan.textContent = currentLevel;
    
            this.updateSpellDetails(spell, currentLevel);
        }
    },
    
    updateSpellDetails(spell, level) {
        const scalingList = document.getElementById('spell-scaling-list');
        if (scalingList) {
            scalingList.innerHTML = ''; // Clear existing list items
    
            spell.Scaling.forEach((scale, index) => {
                const [levelText, effect] = scale.split(':');
                const scaleLevel = index + 1;
                
                // Only create and show list item if there's content and the level is reached
                if (effect.trim() !== '' && scaleLevel <= level) {
                    const li = document.createElement('li');
                    li.textContent = scale;
                    li.dataset.level = scaleLevel;
                    scalingList.appendChild(li);
                }
            });
        }
    
        // Update other spell details based on the current level
        // This could include updating damage, range, or other properties that scale with level
        // You may need to implement this part based on your specific spell data structure
    },

    learnSpell(spellKey) {
        if (!this.learnedSpells.includes(spellKey)) {
            this.learnedSpells.push(spellKey);
            this.updateKnownSpells();
            this.updateSpellsSubtab();
            alert(`You've learned the spell: ${this.allSpells[spellKey].Name}`);
        } else {
            alert(`You already know the spell: ${this.allSpells[spellKey].Name}`);
        }
    },

    filterSpells() {
        console.log('Filtering spells...');
        const searchTerm = document.getElementById('spell-search').value.toLowerCase();
        const archetypeFilter = document.getElementById('spell-filter-archetype').value;
        const damageTypeFilter = document.getElementById('spell-filter-damage-type').value;
        const castingTimeFilter = document.getElementById('spell-filter-casting-time').value;
        const spellcastingModifierFilter = document.getElementById('spell-filter-spellcasting-modifier').value;
    
        console.log('Filter values:', {
            searchTerm,
            archetypeFilter,
            damageTypeFilter,
            castingTimeFilter,
            spellcastingModifierFilter
        });
    
        const filteredSpells = Object.entries(this.allSpells).filter(([key, spell]) => {
            const nameMatch = spell.Name.toLowerCase().includes(searchTerm);
            const archetypeMatch = !archetypeFilter || (spell.Archetype && spell.Archetype.split(',').map(a => a.trim()).includes(archetypeFilter));
            const damageTypeMatch = !damageTypeFilter || spell.DamageType === damageTypeFilter;
            const castingTimeMatch = !castingTimeFilter || spell.CastingTime === castingTimeFilter;
            const spellcastingModifierMatch = !spellcastingModifierFilter || spell.SpellCastingModifier === spellcastingModifierFilter;
    
            return nameMatch && archetypeMatch && damageTypeMatch && castingTimeMatch && spellcastingModifierMatch;
        });
    
        console.log('Filtered spells:', filteredSpells);
    
        const container = document.getElementById('arcana-spells-container');
        if (container) {
            container.innerHTML = '';
            filteredSpells.forEach(([key, spell]) => {
                const spellCard = this.createArcanaSpellCard(key, spell);
                container.appendChild(spellCard);
            });
        } else {
            console.error('Arcana spells container not found');
        }
    },

    getAllSpellData() {
        return {
            learnedSpells: this.learnedSpells
        };
    },

    getKnownSpellKeys() {
        return [...this.knownSpells];
    },

    loadSavedData(data) {
        if (data) {
            this.learnedSpells = data.learnedSpells || [];
            this.updateKnownSpells();
        }
    }
};

export default SpellModule;