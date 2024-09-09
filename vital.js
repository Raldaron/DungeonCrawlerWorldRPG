import EnhancementModule from './enhancementModule.js';

const VitalModule = {
    availablePoints: 12,
    baseScores: {},
    raceBonuses: {},
    classBonuses: {},
    equippedScores: {
        armor: {},
        weapons: {}
    },
    displayScores: {},
    vitalCategories: {
        Physical: ['strength', 'dexterity', 'stamina'],
        Mental: ['intelligence', 'perception', 'wit'],
        Social: ['charisma', 'manipulation', 'appearance']
    },
    vitals: ['strength', 'dexterity', 'stamina', 'intelligence', 'perception', 'wit', 'charisma', 'manipulation', 'appearance'],

    init() {
        console.log('Initializing VitalModule');
        this.initializeScores();
        this.updateAllVitalScores();
        this.populateVitals();
        this.setupEventListeners();
        this.updateAvailablePoints();
    },

    initializeScores() {
        this.vitals.forEach(vital => {
            if (typeof this.baseScores[vital] === 'undefined') {
                this.baseScores[vital] = 0;
            }
            if (typeof this.displayScores[vital] === 'undefined') {
                this.displayScores[vital] = 0;
            }
        });
    },

    getVitalScore(vitalName) {
        return this.displayScores[vitalName.toLowerCase()] || 0;
    },

    setVitalScore(vitalName, score) {
        const normalizedVitalName = vitalName.toLowerCase();
        if (this.vitals.includes(normalizedVitalName)) {
            this.baseScores[normalizedVitalName] = score;
            this.updateAllVitalScores();
        } else {
            console.warn(`Vital '${vitalName}' not found. Unable to set score.`);
        }
    },

    initializeScores() {
        this.vitals.forEach(vital => {
            if (typeof this.baseScores[vital] === 'undefined') {
                this.baseScores[vital] = 0;
            }
            if (typeof this.displayScores[vital] === 'undefined') {
                this.displayScores[vital] = 0;
            }
        });
    },

    populateVitals() {
        const vitalsContainer = document.getElementById('vitals-container');
        if (vitalsContainer) {
            vitalsContainer.innerHTML = '';
            
            for (const [category, vitals] of Object.entries(this.vitalCategories)) {
                const categoryContainer = document.createElement('div');
                categoryContainer.className = 'vital-category';
                categoryContainer.innerHTML = `<h4 class="category-title">${category}</h4>`;
                
                const vitalsGrid = document.createElement('div');
                vitalsGrid.className = 'vitals-grid';
                
                vitals.forEach(vital => {
                    const vitalCard = document.createElement('div');
                    vitalCard.className = 'vital-card';
                    vitalCard.innerHTML = `
                        <div class="vital-name">${vital}</div>
                        <div class="vital-score" id="${vital}-score">${this.displayScores[vital] || 0}</div>
                        <div class="vital-buttons">
                            <button class="vital-button decrement" data-vital="${vital}">-</button>
                            <button class="vital-button increment" data-vital="${vital}">+</button>
                        </div>
                    `;
                    vitalsGrid.appendChild(vitalCard);
                });
                
                categoryContainer.appendChild(vitalsGrid);
                vitalsContainer.appendChild(categoryContainer);
            }
        } else {
            console.error('Vitals container not found');
        }
    },

    setupEventListeners() {
        console.log('Setting up vital event listeners');
        document.querySelectorAll('.vital-button').forEach(button => {
            button.addEventListener('click', (event) => {
                event.preventDefault();
                event.stopPropagation();
                const vitalName = event.target.dataset.vital;
                console.log(`Vital button clicked for ${vitalName}`);
                if (button.classList.contains('increment')) {
                    this.incrementVital(vitalName);
                } else if (button.classList.contains('decrement')) {
                    this.decrementVital(vitalName);
                }
            });
        });
    },

    incrementVital(vitalName) {
        console.log(`Incrementing vital: ${vitalName}`);
        if (this.availablePoints > 0) {
            this.baseScores[vitalName] = (this.baseScores[vitalName] || 0) + 1;
            this.availablePoints--;
            this.updateAllVitalScores();
            this.updateAvailablePoints();
            EnhancementModule.refreshEnhancements();
        }
    },

    decrementVital(vitalName) {
        console.log(`Decrementing vital: ${vitalName}`);
        if (this.baseScores[vitalName] > 0) {
            this.baseScores[vitalName]--;
            this.availablePoints++;
            this.updateAllVitalScores();
            this.updateAvailablePoints();
            EnhancementModule.refreshEnhancements();
        }
    },

    updateAllVitalScores() {
        console.log('Updating all vital scores');
        this.vitals.forEach(vital => {
            const baseScore = this.baseScores[vital] || 0;
            const raceBonus = this.raceBonuses[vital] || 0;
            const classBonus = this.classBonuses[vital] || 0;
            const armorBonus = (this.equippedScores.armor && this.equippedScores.armor[vital]) || 0;
            const weaponBonus = (this.equippedScores.weapon && this.equippedScores.weapon[vital]) || 0;

            this.displayScores[vital] = baseScore + raceBonus + classBonus + armorBonus + weaponBonus;
            console.log(`Updating ${vital}: base=${baseScore}, race=${raceBonus}, class=${classBonus}, armor=${armorBonus}, weapon=${weaponBonus}, total=${this.displayScores[vital]}`);
            this.updateVitalScore(vital);
        });
    },

    updateVitalScore(vitalName) {
        const scoreElement = document.getElementById(`${vitalName}-score`);
        if (scoreElement) {
            scoreElement.textContent = this.displayScores[vitalName];
            console.log(`Updated ${vitalName} score to ${this.displayScores[vitalName]}`);
        } else {
            console.warn(`Score element not found for vital: ${vitalName}`);
        }
    },

    updateAvailablePoints() {
        const availablePointsElement = document.getElementById('available-vital-points');
        if (availablePointsElement) {
            availablePointsElement.textContent = this.availablePoints;
            console.log(`Updated available points to ${this.availablePoints}`);
        } else {
            console.warn('Available points element not found');
        }
    },

    setAvailablePoints(points) {
        this.availablePoints = points;
        this.updateAvailablePoints();
    },

    editAvailablePoints() {
        const currentPoints = this.availablePoints;
        const newPoints = prompt(`Enter new value for available vital points:`, currentPoints);
        if (newPoints !== null && !isNaN(newPoints)) {
            this.setAvailablePoints(parseInt(newPoints, 10));
        }
    },

    updateRaceVitalBonuses(bonuses) {
        console.log('Updating race vital bonuses:', bonuses);
        this.raceBonuses = bonuses;
        this.updateAllVitalScores();
    },

    updateClassVitalBonuses(bonuses) {
        console.log('Updating class vital bonuses:', bonuses);
        this.classBonuses = bonuses;
        this.updateAllVitalScores();
    },

    updateSingleItemBonus(itemType, bonuses) {
        console.log(`Updating ${itemType} vital bonuses:`, bonuses);
        if (!this.equippedScores[itemType]) {
            this.equippedScores[itemType] = {};
        }
        for (const [vital, bonus] of Object.entries(bonuses)) {
            const normalizedVital = vital.toLowerCase();
            this.equippedScores[itemType][normalizedVital] = 
                (this.equippedScores[itemType][normalizedVital] || 0) + bonus;
            console.log(`Updated ${itemType} bonus for ${normalizedVital}: ${this.equippedScores[itemType][normalizedVital]}`);
        }
        this.updateAllVitalScores();
    },

    removeSingleItemBonus(itemType, bonuses) {
        console.log(`Removing ${itemType} vital bonuses:`, bonuses);
        if (this.equippedScores[itemType]) {
            for (const [vital, bonus] of Object.entries(bonuses)) {
                const normalizedVital = vital.toLowerCase();
                if (this.equippedScores[itemType][normalizedVital]) {
                    this.equippedScores[itemType][normalizedVital] -= bonus;
                    if (this.equippedScores[itemType][normalizedVital] <= 0) {
                        delete this.equippedScores[itemType][normalizedVital];
                    }
                    console.log(`Removed ${itemType} bonus for ${normalizedVital}: ${this.equippedScores[itemType][normalizedVital] || 0}`);
                }
            }
        }
        this.updateAllVitalScores();
    },

    updateBaseScores(raceBonus, classBonus) {
        this.vitals.forEach(vital => {
            const raceBonusValue = raceBonus[vital] || 0;
            const classBonusValue = classBonus[vital] || 0;
            this.baseScores[vital] = (this.baseScores[vital] || 0) + raceBonusValue + classBonusValue;
            this.updateVitalScore(vital);
        });
        this.updateAvailablePoints();
    },

    updateEquippedScores(armorBonus, weaponBonus) {
        this.vitals.forEach(vital => {
            this.equippedScores.armor[vital] = armorBonus[vital] || 0;
            this.equippedScores.weapons[vital] = weaponBonus[vital] || 0;
            this.updateVitalScore(vital);
        });
    },

    getAllVitalData() {
        return {
            baseScores: this.baseScores,
            availablePoints: this.availablePoints,
            raceBonuses: this.raceBonuses,
            classBonuses: this.classBonuses,
            equippedScores: this.equippedScores
        };
    },

    loadSavedData(data) {
        if (data) {
            this.baseScores = data.baseScores || {};
            this.availablePoints = data.availablePoints || 12;
            this.raceBonuses = data.raceBonuses || {};
            this.classBonuses = data.classBonuses || {};
            this.equippedScores = data.equippedScores || { armor: {}, weapons: {} };
            this.updateAllVitalScores();
            this.updateAvailablePoints();
        }
    }
};

export default VitalModule;