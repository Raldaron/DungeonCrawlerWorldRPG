// enhancementAnnouncementModule.js

const EnhancementAnnouncementModule = {
    init() {
        this.createAnnouncementModal();
    },

    createAnnouncementModal() {
        const modal = document.createElement('div');
        modal.id = 'enhancement-announcement-modal';
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <span class="close">&times;</span>
                <h2>Congratulations!</h2>
                <p id="enhancement-announcement-message"></p>
                <button id="view-enhancement-details">View Details</button>
            </div>
        `;
        document.body.appendChild(modal);

        const closeBtn = modal.querySelector('.close');
        closeBtn.onclick = () => {
            this.closeModal();
        };

        window.onclick = (event) => {
            if (event.target == modal) {
                this.closeModal();
            }
        };

        const viewDetailsBtn = modal.querySelector('#view-enhancement-details');
        viewDetailsBtn.onclick = () => {
            this.viewEnhancementDetails();
        };
    },

    announceNewEnhancement(enhancement) {
        const modal = document.getElementById('enhancement-announcement-modal');
        const message = document.getElementById('enhancement-announcement-message');
        message.textContent = `You have unlocked a new enhancement: ${enhancement.name}!`;
        modal.style.display = 'block';

        // Store the current enhancement for the details view
        this.currentEnhancement = enhancement;

        // Disable close button and overlay click for 3 seconds
        const closeBtn = modal.querySelector('.close');
        closeBtn.style.pointerEvents = 'none';
        modal.style.pointerEvents = 'none';

        setTimeout(() => {
            closeBtn.style.pointerEvents = 'auto';
            modal.style.pointerEvents = 'auto';
        }, 3000);
    },

    closeModal() {
        const modal = document.getElementById('enhancement-announcement-modal');
        if (modal.style.pointerEvents === 'auto') {
            modal.style.display = 'none';
        }
    },

    viewEnhancementDetails() {
        if (this.currentEnhancement) {
            EnhancementModule.showEnhancementDetails(this.currentEnhancement.name);
        }
        document.getElementById('enhancement-announcement-modal').style.display = 'none';
    }
};

export default EnhancementAnnouncementModule;