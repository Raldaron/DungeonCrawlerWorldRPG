// enhancementAnnouncementModule.js

const EnhancementAnnouncementModule = {
    enhancementModule: null,
    currentEnhancement: null,

    init() {
        console.log('Initializing EnhancementAnnouncementModule');
        this.createAnnouncementModal();
    },

    setEnhancementModule(module) {
        console.log('Setting EnhancementModule');
        this.enhancementModule = module;
    },

    createAnnouncementModal() {
        const modal = document.createElement('div');
        modal.id = 'enhancement-announcement-modal';
        modal.className = 'enhancement-modal';
        modal.innerHTML = `
            <div class="enhancement-modal-content">
                <h2>New Enhancement Unlocked!</h2>
                <p id="enhancement-announcement-message"></p>
            </div>
        `;
        document.body.appendChild(modal);
    },

    announceNewEnhancement(enhancement) {
        console.log('Announcing new enhancement:', enhancement.name);
        const modal = document.getElementById('enhancement-announcement-modal');
        const message = document.getElementById('enhancement-announcement-message');
        message.textContent = `${enhancement.name}`;
        modal.classList.add('show');

        this.currentEnhancement = enhancement;

        // Auto-close the modal after 5 seconds
        setTimeout(() => {
            this.closeModal();
        }, 5000);
    },

    closeModal() {
        const modal = document.getElementById('enhancement-announcement-modal');
        modal.classList.remove('show');
    }
};

export default EnhancementAnnouncementModule;