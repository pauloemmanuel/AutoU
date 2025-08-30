class EmailManager {
    constructor() {
        this.emails = [];
        this.storageKey = 'iamail_emails';
        this.init();
    }

    init() {
        this.loadEmails();
        this.bindEvents();
        this.renderEmails();
    }

    loadEmails() {
        const stored = localStorage.getItem(this.storageKey);
        if (stored) {
            try {
                this.emails = JSON.parse(stored);
            } catch (e) {
                console.error('Erro ao carregar emails:', e);
                this.emails = [];
            }
        }
    }

    saveEmails() {
        localStorage.setItem(this.storageKey, JSON.stringify(this.emails));
    }

    addEmail(title, content, category) {
        const newEmail = {
            id: Date.now(),
            title: title.trim(),
            content: content.trim(),
            category: category,
            createdAt: new Date().toISOString()
        };

        this.emails.push(newEmail);
        this.saveEmails();
        this.renderEmails();
        return newEmail;
    }

    deleteEmail(id) {
        this.emails = this.emails.filter(email => email.id !== id);
        this.saveEmails();
        this.renderEmails();
    }

    bindEvents() {
        const addEmailForm = document.getElementById('addEmailForm');
        const addEmailBtn = document.getElementById('addEmailBtn');
        const closeAddModal = document.getElementById('closeAddModal');
        const cancelAddBtn = document.getElementById('cancelAddBtn');
        const uploadPdfBtn = document.getElementById('uploadPdfBtn');
        const pdfFileInput = document.getElementById('pdfFileInput');

        addEmailBtn.addEventListener('click', () => this.showAddModal());
        addEmailForm.addEventListener('submit', (e) => this.handleAddEmail(e));
        closeAddModal.addEventListener('click', () => this.hideAddModal());
        cancelAddBtn.addEventListener('click', () => this.hideAddModal());
        uploadPdfBtn.addEventListener('click', () => pdfFileInput.click());
        pdfFileInput.addEventListener('change', (e) => this.handlePdfSelection(e));
    }

    showAddModal() {
        const modal = document.getElementById('addEmailModal');
        modal.classList.remove('hidden');
        document.getElementById('emailTitleInput').focus();
    }

    hideAddModal() {
        const modal = document.getElementById('addEmailModal');
        modal.classList.add('hidden');
        document.getElementById('addEmailForm').reset();
        document.getElementById('pdfFileName').classList.add('hidden');
        document.getElementById('pdfFileInput').value = '';
    }

    handlePdfSelection(event) {
        const file = event.target.files[0];
        if (file) {
            const fileName = document.getElementById('pdfFileName');
            fileName.textContent = file.name;
            fileName.classList.remove('hidden');
            
            // Preenche o título automaticamente com o nome do arquivo
            const titleInput = document.getElementById('emailTitleInput');
            if (!titleInput.value) {
                titleInput.value = file.name.replace('.pdf', '');
            }
        }
    }

    async handleAddEmail(e) {
        e.preventDefault();
        const title = document.getElementById('emailTitleInput').value;
        const content = document.getElementById('emailContentInput').value;
        const pdfFile = document.getElementById('pdfFileInput').files[0];

        if (!title) {
            alert('Título é obrigatório');
            return;
        }

        if (!content && !pdfFile) {
            alert('Adicione conteúdo ou selecione um PDF');
            return;
        }

        try {
            let category, finalContent;

            if (pdfFile) {
                // Processa PDF
                const formData = new FormData();
                formData.append('pdf_file', pdfFile);

                const response = await fetch('/api/upload-pdf', {
                    method: 'POST',
                    body: formData
                });

                if (!response.ok) {
                    throw new Error('Erro ao processar PDF');
                }

                const result = await response.json();
                category = result.category;
                finalContent = result.extracted_text;
                
                // Preenche o campo de conteúdo com o texto extraído
                document.getElementById('emailContentInput').value = finalContent;
            } else {
                // Processa texto normal
                const response = await fetch('/api/categorize-email', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ content: content })
                });

                if (!response.ok) {
                    throw new Error('Erro ao categorizar email');
                }

                const result = await response.json();
                category = result.category;
                finalContent = content;
            }

            // Adiciona o email com a categoria retornada pela API
            this.addEmail(title, finalContent, category);
            this.hideAddModal();
            
        } catch (error) {
            console.error('Erro ao processar email:', error);
            alert('Erro ao processar email: ' + error.message);
        }
    }

    renderEmails() {
        const emailList = document.getElementById('emailList');
        const emptyState = document.getElementById('emptyState');

        if (this.emails.length === 0) {
            emailList.innerHTML = '';
            emptyState.classList.remove('hidden');
            return;
        }

        emptyState.classList.add('hidden');
        emailList.innerHTML = this.emails.map(email => this.createEmailHTML(email)).join('');
        
        // Adicionar event listeners para os botões de deletar
        this.emails.forEach(email => {
            const deleteBtn = document.getElementById(`delete-${email.id}`);
            if (deleteBtn) {
                deleteBtn.addEventListener('click', () => this.deleteEmail(email.id));
            }
        });
        
        // Reinicializar ícones Feather após renderizar o HTML
        if (typeof feather !== 'undefined') {
            feather.replace();
        }
    }

    createEmailHTML(email) {
        const date = new Date(email.createdAt).toLocaleDateString('pt-BR');
        const isProductive = email.category === 'Produtivo';
        const categoryColor = isProductive ? 'bg-green-500' : 'bg-red-400';
        const categoryLetter = isProductive ? 'P' : 'I';
        
        return `
            <div class="px-6 py-4 hover:bg-gray-50 transition-colors duration-200">
                <div class="flex items-start justify-between">
                    <div class="flex-1">
                        <div class="space-y-2">
                            <div class="flex items-center space-x-3">
                                <div class="w-10 h-10 ${categoryColor} rounded-full flex items-center justify-center">
                                    <span class="text-white font-bold text-sm">${categoryLetter}</span>
                                </div>
                                <div>
                                    <h3 class="text-sm font-medium text-gray-900">${email.title}</h3>
                                    <p class="text-xs text-gray-400">Adicionado em ${date}</p>
                                </div>
                            </div>
                            <div class="ml-13">
                                <p class="text-sm text-gray-600 leading-relaxed">${email.content}</p>
                            </div>
                        </div>
                    </div>
                    <button 
                        id="delete-${email.id}"
                        class="text-red-500 hover:text-red-700 transition-colors duration-200 p-2 rounded-lg hover:bg-red-50"
                        title="Excluir email"
                    >
                        <i data-feather="trash-2" class="w-4 h-4"></i>
                    </button>
                </div>
            </div>
        `;
    }
}

// Inicializar quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
    window.emailManager = new EmailManager();
});
