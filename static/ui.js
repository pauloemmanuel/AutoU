class UIManager {
    constructor() {
        this.init();
    }

    init() {
        this.initializeFeatherIcons();
        this.setupKeyboardShortcuts();
    }

    initializeFeatherIcons() {
        // Inicializar ícones Feather quando o DOM estiver carregado
        if (typeof feather !== 'undefined') {
            feather.replace();
        }
    }

    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // ESC para fechar modais
            if (e.key === 'Escape') {
                this.closeAllModals();
            }
            
            // Ctrl/Cmd + N para adicionar email
            if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
                e.preventDefault();
                if (window.emailManager) {
                    window.emailManager.showAddModal();
                }
            }
        });
    }

    closeAllModals() {
        const addEmailModal = document.getElementById('addEmailModal');
        if (addEmailModal && !addEmailModal.classList.contains('hidden')) {
            if (window.emailManager) {
                window.emailManager.hideAddModal();
            }
        }
    }

    showNotification(message, type = 'info') {
        // Criar notificação temporária
        const notification = document.createElement('div');
        notification.className = `fixed top-4 right-4 px-6 py-3 rounded-lg text-white font-medium z-50 transform transition-all duration-300 translate-x-full`;
        
        switch (type) {
            case 'success':
                notification.className += ' bg-green-500';
                break;
            case 'error':
                notification.className += ' bg-red-500';
                break;
            case 'warning':
                notification.className += ' bg-yellow-500';
                break;
            default:
                notification.className += ' bg-blue-500';
        }
        
        notification.textContent = message;
        document.body.appendChild(notification);
        
        // Animar entrada
        setTimeout(() => {
            notification.classList.remove('translate-x-full');
        }, 100);
        
        // Remover após 3 segundos
        setTimeout(() => {
            notification.classList.add('translate-x-full');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
}

// Inicializar quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
    window.uiManager = new UIManager();
    
    // Aguardar um pouco para garantir que os ícones sejam carregados
    setTimeout(() => {
        if (typeof feather !== 'undefined') {
            feather.replace();
        }
    }, 100);
});
