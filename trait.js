const TraitModule = {
    traits: {},
    currentTraits: [],
    raceTraits: [],  // Initialize as an empty array
    classTraits: [], // Initialize as an empty array

    init() {
        console.log('Initializing TraitModule');
        this.loadTraits();
        this.setupEventListeners();
        this.displayTraits();
    },

    loadTraits() {
        fetch('traits.json')
            .then(response => response.json())
            .then(data => {
                this.traits = data.Traits;
                this.displayTraits();
            })
            .catch(error => console.error('Error loading traits:', error));
    },

    setupEventListeners() {
        const activeTraitsButton = document.getElementById('active-traits');
        if (activeTraitsButton) {
            activeTraitsButton.addEventListener('click', () => this.openTraitsModal());
        }

        const traitsModalCloseButton = document.querySelector('#traits-modal .close');
        if (traitsModalCloseButton) {
            traitsModalCloseButton.addEventListener('click', () => this.closeTraitsModal());
        }

        window.addEventListener('click', (event) => {
            if (event.target === document.getElementById('traits-modal')) {
                this.closeTraitsModal();
            }
        });
    },

    openTraitsModal() {
        const modal = document.getElementById('traits-modal');
        const traitsList = document.getElementById('traits-list');
        
        if (!modal || !traitsList) {
            console.error('Traits modal or traits list not found');
            return;
        }
    
        traitsList.innerHTML = '';
    
        this.currentTraits.forEach(traitName => {
            const trait = this.traits[traitName];
            if (trait) {
                const traitElement = this.createTraitListItem(traitName, trait);
                traitsList.appendChild(traitElement);
            }
        });
    
        modal.style.display = 'block';
    },

    closeTraitsModal() {
        const modal = document.getElementById('traits-modal');
        if (modal) {
            modal.style.display = 'none';
        }
    },

    updateTraitsGrid(gridId) {
        const traitsGrid = document.getElementById(gridId);
        if (traitsGrid) {
            traitsGrid.innerHTML = '';

            this.currentTraits.forEach(traitName => {
                const trait = this.traits[traitName];
                if (trait) {
                    const traitCard = this.createTraitCard(traitName, trait);
                    traitsGrid.appendChild(traitCard);
                }
            });
        } else {
            console.error(`TraitModule: Traits grid not found: ${gridId}`);
        }
    },

    createTraitCard(traitName, trait) {
        const traitCard = document.createElement('div');
        traitCard.className = 'trait-card';
        traitCard.dataset.traitName = traitName;
        traitCard.innerHTML = `<h4>${trait.name}</h4>`;
        traitCard.addEventListener('click', () => this.showTraitDetails(traitName));
        return traitCard;
    },

    createTraitListItem(traitName, trait) {
        const traitElement = document.createElement('div');
        traitElement.className = 'trait-item';
        traitElement.innerHTML = `
            <h3>${trait.name}</h3>
            <p>${trait.description || ''}</p>
        `;
        return traitElement;
    },

    showTraitDetails(traitName) {
        const trait = this.traits[traitName];
        if (!trait) return;

        const modal = document.getElementById('trait-detail-modal');
        const content = modal.querySelector('.modal-content');

        if (!modal || !content) {
            console.error('Trait detail modal or content not found');
            return;
        }

        content.innerHTML = `
            <span class="close">&times;</span>
            <h2>${trait.name}</h2>
            ${trait.description ? `<p><strong>Description:</strong> ${trait.description}</p>` : ''}
            ${trait.effect ? `<p><strong>Effect:</strong> ${trait.effect}</p>` : ''}
        `;

        const closeButton = content.querySelector('.close');
        if (closeButton) {
            closeButton.addEventListener('click', () => this.closeTraitModal());
        }

        modal.style.display = 'block';
    },

    closeTraitModal() {
        const modal = document.getElementById('trait-detail-modal');
        if (modal) {
            modal.style.display = 'none';
        }
    },

    updateRaceTraits(newTraits) {
        console.log('Updating race traits:', newTraits);
        this.raceTraits = Array.isArray(newTraits) ? newTraits : [];
        this.updateAllTraits();
    },

    updateClassTraits(newTraits) {
        console.log('Updating class traits:', newTraits);
        this.classTraits = Array.isArray(newTraits) ? newTraits : [];
        this.updateAllTraits();
    },

    updateEquipmentTraits(equipmentTraits) {
        // Remove any existing equipment traits
        this.currentTraits = this.currentTraits.filter(trait => !this.equipmentTraits.includes(trait));
        // Add new equipment traits
        this.equipmentTraits = equipmentTraits;
        this.currentTraits = [...new Set([...this.currentTraits, ...this.equipmentTraits])];
        this.displayTraits();
    },

    updateAllTraits() {
        console.log('Updating all traits');
        this.currentTraits = [
            ...new Set([
                ...this.traitSources.race,
                ...this.traitSources.class,
                ...Object.values(this.traitSources.weapons).flat(),
                ...Object.values(this.traitSources.armor).flat(),
                ...Object.values(this.traitSources.items).flat()
            ])
        ];
        this.displayTraits();
    },
    
    updateTraits(source, itemKey, traits) {
        if (!this.currentTraits[source]) {
            this.currentTraits[source] = {};
        }
        this.currentTraits[source][itemKey] = traits;
        this.displayTraits();
    },

    removeTraits(source, itemKey) {
        if (this.currentTraits[source] && this.currentTraits[source][itemKey]) {
            delete this.currentTraits[source][itemKey];
            this.displayTraits();
        }
    },
    
    displayTraits() {
        const traitsGrid = document.getElementById('traits-grid');
        if (traitsGrid) {
            traitsGrid.innerHTML = '';
            Object.values(this.currentTraits).forEach(sourceTraits => {
                Object.values(sourceTraits).flat().forEach(traitName => {
                    const trait = this.traits[traitName];
                    if (trait) {
                        const traitCard = this.createTraitCard(traitName, trait);
                        traitsGrid.appendChild(traitCard);
                    }
                });
            });
        }
    },

    getAllTraitData() {
        return {
            currentTraits: this.currentTraits,
            raceTraits: this.raceTraits,
            classTraits: this.classTraits,
            equipmentTraits: this.equipmentTraits
        };
    },

    loadSavedData(data) {
        if (data) {
            this.currentTraits = data.currentTraits || [];
            this.raceTraits = data.raceTraits || [];
            this.classTraits = data.classTraits || [];
            this.equipmentTraits = data.equipmentTraits || [];
            this.displayTraits();
        }
    }
};

export default TraitModule;