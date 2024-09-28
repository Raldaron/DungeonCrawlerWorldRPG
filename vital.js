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
    currentLevel: 1,

    init() {
        console.log('Initializing VitalModule');
        this.initializeScores();
        this.updateAllVitalScores();
        this.populateVitals();
        this.setupEventListeners();
        this.updateAvailablePoints();
        
        // Delay the HP and MP updates to ensure DOM elements are ready
        setTimeout(() => {
            this.updateHPMPDisplays();
        }, 100);
    },

    updateLevel(newLevel) {
        this.currentLevel = newLevel;
        this.updateAllVitalScores();
    },

    updateAllVitalScores() {
        this.vitals.forEach(vital => {
            const baseScore = this.baseScores[vital] || 0;
            const raceBonus = this.raceBonuses[vital] || 0;
            const classBonus = this.classBonuses[vital] || 0;
            const armorBonus = (this.equippedScores.armor && this.equippedScores.armor[vital]) || 0;
            const weaponBonus = (this.equippedScores.weapon && this.equippedScores.weapon[vital]) || 0;

            this.displayScores[vital] = baseScore + raceBonus + classBonus + armorBonus + weaponBonus;
            this.updateVitalScore(vital);
        });

        // Update HP and MP after all vitals are calculated
        this.updateHPMPDisplays();
    },

    calculateTotalHP() {
        const staminaScore = this.displayScores.stamina || 0;
        return (staminaScore * 5) + (this.currentLevel * 3);
    },

    calculateTotalMP() {
        const intelligenceScore = this.displayScores.intelligence || 0;
        return (intelligenceScore * 5) + (this.currentLevel * 2);
    },

    updateHPMPDisplays() {
        this.updateHPDisplay();
        this.updateMPDisplay();
    },

    updateHPDisplay() {
        const currentHPElement = document.getElementById('current-hp');
        const maxHPElement = document.getElementById('max-hp');
        if (currentHPElement && maxHPElement) {
            const maxHP = this.calculateTotalHP();
            const currentHP = parseInt(currentHPElement.textContent, 10);
            if (isNaN(currentHP) || currentHP > maxHP) {
                currentHPElement.textContent = maxHP;
            }
            maxHPElement.textContent = maxHP;
        } else {
            console.error('HP elements not found. current-hp:', currentHPElement, 'max-hp:', maxHPElement);
        }
    },

    updateMPDisplay() {
        const currentMPElement = document.getElementById('current-mp');
        const maxMPElement = document.getElementById('max-mp');
        if (currentMPElement && maxMPElement) {
            const maxMP = this.calculateTotalMP();
            const currentMP = parseInt(currentMPElement.textContent, 10);
            if (isNaN(currentMP) || currentMP > maxMP) {
                currentMPElement.textContent = maxMP;
            }
            maxMPElement.textContent = maxMP;
        } else {
            console.error('MP elements not found. current-mp:', currentMPElement, 'max-mp:', maxMPElement);
        }
    },

    incrementVital(vitalName) {
        if (this.availablePoints > 0) {
            this.baseScores[vitalName] = (this.baseScores[vitalName] || 0) + 1;
            this.availablePoints--;
            this.updateAllVitalScores();
            this.updateAvailablePoints();
            EnhancementModule.refreshEnhancements();
            
            if (vitalName === 'stamina' || vitalName === 'intelligence') {
                this.updateHPMPDisplays();
            }
        }
    },

    decrementVital(vitalName) {
        if (this.baseScores[vitalName] > 0) {
            this.baseScores[vitalName]--;
            this.availablePoints++;
            this.updateAllVitalScores();
            this.updateAvailablePoints();
            EnhancementModule.refreshEnhancements();
            
            if (vitalName === 'stamina' || vitalName === 'intelligence') {
                this.updateHPMPDisplays();
            }
        }
    },

    getVitalScore(vitalName) {
        const normalizedVitalName = vitalName.toLowerCase();
        if (this.displayScores.hasOwnProperty(normalizedVitalName)) {
            return this.displayScores[normalizedVitalName];
        } else {
            return 0;
        }
    },

    setVitalScore(vitalName, score) {
        const normalizedVitalName = vitalName.toLowerCase();
    
        if (this.vitals.includes(normalizedVitalName)) {
            this.baseScores[normalizedVitalName] = score;
            this.updateAllVitalScores();
    
            // Additional logic for specific vital names
            if (normalizedVitalName === 'stamina') {
                this.updateHPDisplay();
            } else if (normalizedVitalName === 'intelligence') {
                this.updateMPDisplay();
            }
        } else {
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

    updateVitalScore(vitalName) {
        const scoreElement = document.getElementById(`${vitalName}-score`);
        if (scoreElement) {
            scoreElement.textContent = this.displayScores[vitalName];
        } else {
            console.warn(`Score element not found for vital: ${vitalName}`);
        }
    },

    updateAvailablePoints() {
        const availablePointsElement = document.getElementById('available-vital-points');
        if (availablePointsElement) {
            availablePointsElement.textContent = this.availablePoints;
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
        this.raceBonuses = bonuses;
        this.updateAllVitalScores();
    },

    updateClassVitalBonuses(bonuses) {
        this.classBonuses = bonuses;
        this.updateAllVitalScores();
    },

    updateSingleItemBonus(itemType, bonuses) {
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

    getBaseScores() {
        return { ...this.baseScores };
    },
    
    getUnassignedPoints() {
        return this.availablePoints;
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

export function updateHPMPOnLevelChange() {
    VitalModule.updateHPDisplay();
    VitalModule.updateMPDisplay();
}

export default VitalModule;