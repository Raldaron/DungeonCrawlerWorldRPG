import EnhancementModule from './enhancementModule.js';

const SkillModule = {
    baseScores: {},
    raceBonuses: {},
    classBonuses: {},
    equippedScores: {
        armor: {},
        weapons: {}
    },
    displayScores: {},
    availablePoints: 18,
    initialized: false,

    init() {
        if (this.initialized) return;
        console.log('Initializing SkillModule');
        this.loadInitialData();
        this.setupEventListeners();
        this.updateAllSkillScores();
        this.updateAvailablePoints();
        this.initialized = true;
        this.skills = {
            "Acrobatics": 0,
            "Alchemy": 0,
            "Animal Ken": 0,
            "Archery": 0,
            "Arcana": 0,
            "Artillery": 0,
            "Athletics": 0,
            "Awareness": 0,
            "Block": 0,
            "Close Combat": 0,
            "Deception": 0,
            "Disguise": 0,
            "Dodge": 0,
            "Endurance": 0,
            "Engineering": 0,
            "Empathy": 0,
            "Explosives Handling": 0,
            "Firearms": 0,
            "Hold Breath": 0,
            "Intimidation": 0,
            "Investigation": 0,
            "Lore": 0,
            "Medicine": 0,
            "Melee": 0,
            "Nature": 0,
            "Parry": 0,
            "Perception": 0,
            "Performance": 0,
            "Persuasion": 0,
            "Pugilism": 0,
            "Ranged Combat": 0,
            "Resilience": 0,
            "Sapper": 0,
            "Scrounge": 0,
            "Seduction": 0,
            "Sense Deception": 0,
            "Sleight of Hand": 0,
            "Stealth": 0,
            "Subterfuge": 0,
            "Tactics": 0,
            "Tracking": 0
        };
    },

    updateRaceBonuses(bonuses) {
        this.raceBonuses = bonuses || {};
        this.updateAllSkillScores();
    },

    updateClassBonuses(bonuses) {
        console.log('Updating class skill bonuses:', bonuses);
        this.classBonuses = bonuses;
        this.updateAllSkillScores();
    },

    updateSkillScore(skill) {
        const scoreElement = document.querySelector(`.skill-card[data-skill="${skill}"] .skill-score`);
        if (scoreElement) {
            scoreElement.textContent = this.displayScores[skill];
        }
    },

    incrementSkill(skill) {
        if (this.availablePoints > 0) {
            this.baseScores[skill] = (this.baseScores[skill] || 0) + 1;
            this.availablePoints--;
            this.updateAllSkillScores();
            this.updateAvailablePoints();
            EnhancementModule.refreshEnhancements();
        }
    },

    decrementSkill(skill) {
        if (this.baseScores[skill] > 0) {
            this.baseScores[skill]--;
            this.availablePoints++;
            this.updateAllSkillScores();
            this.updateAvailablePoints();
            EnhancementModule.refreshEnhancements();
        }
    },

    updateAvailablePoints() {
        const availablePointsElement = document.getElementById('available-skill-points');
        if (availablePointsElement) {
            availablePointsElement.textContent = this.availablePoints;
        }
    },

    setAvailablePoints(points) {
        this.availablePoints = points;
        this.updateAvailablePoints();
    },

    updateSingleItemBonus(itemType, bonuses) {
        console.log(`Updating ${itemType} skill bonuses:`, bonuses);
        if (!this.equippedScores[itemType]) {
            this.equippedScores[itemType] = {};
        }
        for (const [skill, bonus] of Object.entries(bonuses)) {
            const normalizedSkill = this.normalizeSkillName(skill);
            this.equippedScores[itemType][normalizedSkill] = 
                (this.equippedScores[itemType][normalizedSkill] || 0) + bonus;
        }
        this.updateAllSkillScores();
    },

    removeSingleItemBonus(itemType, bonuses) {
        console.log(`Removing ${itemType} skill bonuses:`, bonuses);
        if (this.equippedScores[itemType]) {
            for (const [skill, bonus] of Object.entries(bonuses)) {
                const normalizedSkill = this.normalizeSkillName(skill);
                if (this.equippedScores[itemType][normalizedSkill]) {
                    this.equippedScores[itemType][normalizedSkill] -= bonus;
                    if (this.equippedScores[itemType][normalizedSkill] <= 0) {
                        delete this.equippedScores[itemType][normalizedSkill];
                    }
                }
            }
        }
        this.updateAllSkillScores();
    },

    normalizeSkillName(skillName) {
        return skillName.toLowerCase().replace(/\s+/g, '-');
    },

    updateEquipmentBonuses(item, isEquipping) {
        console.log('Updating equipment bonuses:', item, isEquipping);
        const bonuses = item.skillBonus || {};
        const multiplier = isEquipping ? 1 : -1;
        const itemType = item.itemType.toLowerCase();

        if (!this.equippedScores[itemType]) {
            this.equippedScores[itemType] = {};
        }

        for (const [skill, bonus] of Object.entries(bonuses)) {
            const normalizedSkill = this.normalizeSkillName(skill);
            this.equippedScores[itemType][normalizedSkill] =
                (this.equippedScores[itemType][normalizedSkill] || 0) + (bonus * multiplier);

            console.log(`Updated ${itemType} bonus for ${normalizedSkill}: ${this.equippedScores[itemType][normalizedSkill]}`);
        }

        this.updateAllSkillScores();
    },

    loadInitialData() {
        const skillCards = document.querySelectorAll('.skill-card');
        skillCards.forEach(card => {
            const skillName = card.dataset.skill;
            this.baseScores[skillName] = 0;
            this.displayScores[skillName] = 0;
        });
        console.log('Initial skill data loaded:', this.baseScores);
    },

    setupEventListeners() {
        document.querySelectorAll('.skill-card').forEach(card => {
            const skillName = card.dataset.skill;

            card.querySelector('.increment').addEventListener('click', () => this.incrementSkill(skillName));
            card.querySelector('.decrement').addEventListener('click', () => this.decrementSkill(skillName));
        });
    },

    updateEquippedScores(itemBonuses, itemType) {
        console.log(`Updating ${itemType} bonuses:`, itemBonuses);
        const normalizedBonuses = {};
        for (const [skill, bonus] of Object.entries(itemBonuses)) {
            const normalizedSkill = this.normalizeSkillName(skill);
            normalizedBonuses[normalizedSkill] = bonus;
        }
        this.equippedScores[itemType] = { ...this.equippedScores[itemType], ...normalizedBonuses };
        this.updateAllSkillScores();
    },

    removeEquippedScores(itemType) {
        console.log(`Removing ${itemType} bonuses`);
        this.equippedScores[itemType] = {};
        this.updateAllSkillScores();
    },

    updateAllSkillScores() {
        console.log('Updating all skill scores');
        console.log('Current equipped scores:', this.equippedScores);

        document.querySelectorAll('.skill-card').forEach(card => {
            const skill = this.normalizeSkillName(card.dataset.skill);
            const baseScore = this.baseScores[skill] || 0;
            const raceBonus = this.raceBonuses[skill] || 0;
            const classBonus = this.classBonuses[skill] || 0;
            const armorBonus = (this.equippedScores.armor && this.equippedScores.armor[skill]) || 0;
            const weaponBonus = (this.equippedScores.weapon && this.equippedScores.weapon[skill]) || 0;

            const totalScore = baseScore + raceBonus + classBonus + armorBonus + weaponBonus;
            console.log(`Updating ${skill}: base=${baseScore}, race=${raceBonus}, class=${classBonus}, armor=${armorBonus}, weapon=${weaponBonus}, total=${totalScore}`);

            this.displayScores[skill] = totalScore;
            this.updateSkillScore(skill);
        });
    },

    getSkillLevel(skillName) {
        const normalizedSkillName = this.normalizeSkillName(skillName);
        const baseScore = this.baseScores[normalizedSkillName] || 0;
        const raceBonus = this.raceBonuses[normalizedSkillName] || 0;
        const classBonus = this.classBonuses[normalizedSkillName] || 0;
        const armorBonus = (this.equippedScores.armor && this.equippedScores.armor[normalizedSkillName]) || 0;
        const weaponBonus = (this.equippedScores.weapons && this.equippedScores.weapons[normalizedSkillName]) || 0;

        const totalScore = baseScore + raceBonus + classBonus + armorBonus + weaponBonus;
        console.log(`Getting skill level for ${skillName}: Base: ${baseScore}, Race: ${raceBonus}, Class: ${classBonus}, Armor: ${armorBonus}, Weapon: ${weaponBonus}, Total: ${totalScore}`);
        return totalScore;
    },

    setSkillLevel(skillName, level) {
        if (skillName in this.skills) {
            this.skills[skillName] = level;
        } else {
            console.warn(`Skill '${skillName}' not found. Unable to set level.`);
        }
    },

    getAllSkillData() {
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
            this.availablePoints = data.availablePoints || 18;
            this.raceBonuses = data.raceBonuses || {};
            this.classBonuses = data.classBonuses || {};
            this.equippedScores = data.equippedScores || { armor: {}, weapons: {} };
            this.updateAllSkillScores();
            this.updateAvailablePoints();
        }
    }
};

export default SkillModule;