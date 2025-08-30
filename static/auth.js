class AuthManager {
    constructor() {
        this.isAuthenticated = false;
        this.correctPassword = 'autou';
        this.init();
    }

    init() {
        this.checkAuthStatus();
        this.bindEvents();
    }

    checkAuthStatus() {
        const authStatus = localStorage.getItem('autou_authenticated');
        if (authStatus === 'true') {
            this.isAuthenticated = true;
            this.hideAuthModal();
            this.showMainContent();
        } else {
            this.showAuthModal();
        }
    }

    bindEvents() {
        const authForm = document.getElementById('authForm');
        const passwordInput = document.getElementById('passwordInput');
        const logoutBtn = document.getElementById('logoutBtn');

        authForm.addEventListener('submit', (e) => this.handleAuth(e));
        passwordInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.handleAuth(e);
            }
        });
        logoutBtn.addEventListener('click', () => this.logout());
    }

    handleAuth(e) {
        e.preventDefault();
        const password = document.getElementById('passwordInput').value.toLowerCase();
        const authError = document.getElementById('authError');

        if (password === this.correctPassword) {
            this.isAuthenticated = true;
            localStorage.setItem('autou_authenticated', 'true');
            this.hideAuthModal();
            this.showMainContent();
            this.clearAuthError();
        } else {
            this.showAuthError();
            document.getElementById('passwordInput').value = '';
        }
    }

    showAuthError() {
        const authError = document.getElementById('authError');
        authError.classList.remove('hidden');
    }

    clearAuthError() {
        const authError = document.getElementById('authError');
        authError.classList.add('hidden');
    }

    showAuthModal() {
        const authModal = document.getElementById('authModal');
        authModal.classList.remove('hidden');
        document.getElementById('passwordInput').focus();
    }

    hideAuthModal() {
        const authModal = document.getElementById('authModal');
        authModal.classList.add('hidden');
    }

    showMainContent() {
        const mainContent = document.querySelector('main');
        const header = document.querySelector('header');
        if (mainContent && header) {
            mainContent.style.display = 'block';
            header.style.display = 'flex';
        }
    }

    logout() {
        this.isAuthenticated = false;
        localStorage.removeItem('autou_authenticated');
        this.showAuthModal();
        this.hideMainContent();
    }

    hideMainContent() {
        const mainContent = document.querySelector('main');
        const header = document.querySelector('header');
        if (mainContent && header) {
            mainContent.style.display = 'none';
            header.style.display = 'none';
        }
    }
}

// Inicializar quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
    window.authManager = new AuthManager();
});
