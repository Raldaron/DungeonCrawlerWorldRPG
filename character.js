const CharacterModule = {
    _archetype: "",
    _class: null,

    init() {
        console.log('Initializing CharacterModule');
        this._archetype = "";
        this._class = null;
    },

    getArchetype() {
        console.log('Getting archetype:', this._archetype);
        return this._archetype;
    },

    setClass(classData) {
        this._class = classData;
        this._archetype = classData.archetype;
        console.log('Class set:', this._class);
        console.log('Archetype set:', this._archetype);
    },

    getCurrentClass() {
        return this._class;
    }
};

export default CharacterModule;