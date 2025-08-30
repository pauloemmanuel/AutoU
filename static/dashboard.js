class DashboardManager {
    constructor() {
        this.init();
    }

    init() {
        this.bindEvents();
    }

    bindEvents() {
        const uploadPdfBtn = document.getElementById('uploadPdfBtn');
        const uploadTxtBtn = document.getElementById('uploadTxtBtn');
        const textInputBtn = document.getElementById('textInputBtn');
        const fileInput = document.getElementById('fileInput');
        const processFileBtn = document.getElementById('processFileBtn');
        const processTextBtn = document.getElementById('processTextBtn');

        uploadPdfBtn.addEventListener('click', () => this.showFileUpload('pdf'));
        uploadTxtBtn.addEventListener('click', () => this.showFileUpload('txt'));
        textInputBtn.addEventListener('click', () => this.showTextInput());
        fileInput.addEventListener('change', (e) => this.handleFileSelection(e));
        processFileBtn.addEventListener('click', () => this.processFile());
        processTextBtn.addEventListener('click', () => this.processText());
    }

    showFileUpload(fileType) {
        this.hideAllAreas();
        const fileUploadArea = document.getElementById('fileUploadArea');
        const fileInput = document.getElementById('fileInput');
        
        fileUploadArea.classList.remove('hidden');
        fileInput.accept = fileType === 'pdf' ? '.pdf' : '.txt';
        
        // Reset file info
        document.getElementById('fileInfo').classList.add('hidden');
        fileInput.value = '';
    }

    showTextInput() {
        this.hideAllAreas();
        document.getElementById('textInputArea').classList.remove('hidden');
        
        // Reset form
        document.getElementById('emailSubjectInput').value = '';
        document.getElementById('emailContentInput').value = '';
    }

    hideAllAreas() {
        document.getElementById('fileUploadArea').classList.add('hidden');
        document.getElementById('textInputArea').classList.add('hidden');
        document.getElementById('fileInfo').classList.add('hidden');
    }

    handleFileSelection(event) {
        const file = event.target.files[0];
        if (file) {
            const selectedFileName = document.getElementById('selectedFileName');
            selectedFileName.textContent = file.name;
            document.getElementById('fileInfo').classList.remove('hidden');
        }
    }

    async processFile() {
        const fileInput = document.getElementById('fileInput');
        const file = fileInput.files[0];
        
        if (!file) {
            this.showMessage('Por favor, selecione um arquivo', 'error');
            return;
        }

        try {
            this.showLoading(true);
            
            const formData = new FormData();
            formData.append('file', file);
            
            const endpoint = file.name.toLowerCase().endsWith('.pdf') ? '/api/process-pdf' : '/api/process-txt';
            
            const response = await fetch(endpoint, {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Erro ao processar arquivo');
            }

            const result = await response.json();
            this.showResult(result);
            
        } catch (error) {
            console.error('Erro ao processar arquivo:', error);
            this.showMessage(`Erro ao processar arquivo: ${error.message}`, 'error');
        } finally {
            this.showLoading(false);
        }
    }

    async processText() {
        const subject = document.getElementById('emailSubjectInput').value.trim();
        const content = document.getElementById('emailContentInput').value.trim();
        
        if (!content) {
            this.showMessage('Por favor, digite o conteúdo do email', 'error');
            return;
        }

        try {
            this.showLoading(true);
            
            const response = await fetch('/api/process-text', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ subject, content })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Erro ao processar texto');
            }

            const result = await response.json();
            this.showResult(result);
            
        } catch (error) {
            console.error('Erro ao processar texto:', error);
            this.showMessage(`Erro ao processar texto: ${error.message}`, 'error');
        } finally {
            this.showLoading(false);
        }
    }

    showResult(result) {
        const category = result.category;
        const confidence = result.confidence;
        const reason = result.reason;
        const extractedText = result.extracted_text;
        
        // Remove resultados anteriores
        const existingResult = document.querySelector('.result-card');
        if (existingResult) {
            existingResult.remove();
        }
        
        // Cria o HTML do resultado com animação
        const resultHTML = `
            <div class="result-card space-y-6 opacity-0 scale-95 transform transition-all duration-500 ease-out">
                <div class="flex justify-center">
                    <div class="w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center">
                        <i data-feather="check-circle" class="w-8 h-8 text-white"></i>
                    </div>
                </div>
                
                <div class="text-center">
                    <h2 class="text-2xl font-bold text-gray-900 mb-2">Resultado da Análise</h2>
                    <div class="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${
                        category === 'Produtivo' ? 'bg-green-100 text-green-800' :
                        category === 'Improdutivo' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                    } animate-pulse">
                        ${category}
                    </div>
                </div>
                
                <div class="space-y-4">
                    <div class="text-center">
                        <p class="text-sm text-gray-600">Confiança: <span class="font-medium text-gray-900">${Math.round(confidence * 100)}%</span></p>
                        <p class="text-sm text-gray-600 mt-1">${reason}</p>
                    </div>
                    
                    ${extractedText ? `
                        <div class="border-t pt-4">
                            <h4 class="text-sm font-medium text-gray-700 mb-2">Texto Analisado:</h4>
                            <div class="bg-gray-50 rounded-lg p-3 max-h-40 overflow-y-auto">
                                <p class="text-sm text-gray-600">${extractedText}</p>
                            </div>
                        </div>
                    ` : ''}
                </div>
                
                <div class="text-center">
                    <button class="close-result bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-200">
                        Fechar
                    </button>
                </div>
            </div>
        `;
        
        // Substitui o conteúdo principal pelo resultado
        const mainContentContainer = document.querySelector('.main-content');
        if (mainContentContainer) {
            mainContentContainer.innerHTML = resultHTML;
        }
        
        // Adiciona event listener para fechar
        const closeBtn = document.querySelector('.close-result');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.closeResult());
        }
        
        // Anima a entrada do resultado
        setTimeout(() => {
            const resultCard = document.querySelector('.result-card');
            if (resultCard) {
                resultCard.classList.remove('opacity-0', 'scale-95');
                resultCard.classList.add('opacity-100', 'scale-100');
            }
        }, 100);
        
        // Reinicializa os ícones Feather
        if (typeof feather !== 'undefined') {
            feather.replace();
        }
    }

    closeResult() {
        const resultCard = document.querySelector('.result-card');
        if (resultCard) {
            // Anima a saída
            resultCard.classList.add('opacity-0', 'scale-95');
            resultCard.classList.remove('opacity-100', 'scale-100');
            
            // Remove após a animação e restaura o conteúdo principal
            setTimeout(() => {
                resultCard.remove();
                this.restoreMainContent();
            }, 300);
        }
    }

    showMessage(message, type = 'info') {
        // Remove mensagens anteriores
        const existingMessage = document.querySelector('.message-toast');
        if (existingMessage) {
            existingMessage.remove();
        }
        
        const messageHTML = `
            <div class="message-toast fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg ${
                type === 'error' ? 'bg-red-500 text-white' : 'bg-blue-500 text-white'
            }">
                ${message}
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', messageHTML);
        
        // Remove a mensagem após 5 segundos
        setTimeout(() => {
            const messageEl = document.querySelector('.message-toast');
            if (messageEl) {
                messageEl.remove();
            }
        }, 5000);
    }

    showLoading(show) {
        const buttons = document.querySelectorAll('#processFileBtn, #processTextBtn');
        buttons.forEach(button => {
            if (show) {
                button.disabled = true;
                button.innerHTML = `
                    <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processando...
                `;
            } else {
                button.disabled = false;
                button.innerHTML = button.id === 'processFileBtn' ? 'Processar Arquivo' : 'Processar Email';
            }
        });
    }

    restoreMainContent() {
        // Restaura o conteúdo principal
        const mainContainer = document.querySelector('main .flex.justify-center');
        if (mainContainer) {
            mainContainer.innerHTML = `
                <div class="w-full max-w-4xl">
                    <div class="border-2 border-dashed border-gray-300 rounded-2xl p-12 text-center hover:border-gray-400 transition-colors duration-200">
                        <div class="space-y-6 main-content">
                            <div class="flex justify-center">
                                <div class="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                                    <i data-feather="upload" class="w-8 h-8 text-white"></i>
                                </div>
                            </div>
                            
                            <div>
                                <h2 class="text-2xl font-bold text-gray-900 mb-2">Adicionar Email</h2>
                                <p class="text-gray-600">Faça upload de um arquivo ou digite o texto diretamente</p>
                            </div>

                            <div class="flex flex-col sm:flex-row gap-4 justify-center">
                                <button id="uploadPdfBtn" class="flex items-center justify-center px-6 py-3 border border-red-300 text-red-700 bg-red-50 rounded-lg hover:bg-red-100 transition-colors duration-200">
                                    <i data-feather="file-text" class="w-5 h-5 mr-2"></i>
                                    PDF
                                </button>
                                <button id="uploadTxtBtn" class="flex items-center justify-center px-6 py-3 border border-blue-300 text-blue-700 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors duration-200">
                                    <i data-feather="file-text" class="w-5 h-5 mr-2"></i>
                                    TXT
                                </button>
                                <button id="textInputBtn" class="flex items-center justify-center px-6 py-3 border border-gray-300 text-gray-700 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200">
                                    <i data-feather="edit-3" class="w-5 h-5 mr-2"></i>
                                    Texto Direto
                                </button>
                            </div>

                            <div class="hidden" id="fileUploadArea">
                                <input type="file" id="fileInput" class="hidden" accept=".pdf,.txt">
                                <div class="mt-4">
                                    <label for="fileInput" class="cursor-pointer">
                                        <div class="px-6 py-4 border-2 border-dashed border-blue-300 rounded-lg hover:border-blue-400 transition-colors duration-200">
                                            <p class="text-blue-600 font-medium">Clique para selecionar arquivo</p>
                                            <p class="text-sm text-gray-500 mt-1">ou arraste e solte aqui</p>
                                        </div>
                                    </label>
                                </div>
                            </div>

                            <div class="hidden" id="textInputArea">
                                <div class="mt-4 space-y-4">
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-2 text-left">Assunto</label>
                                        <input type="text" id="emailSubjectInput" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Digite o assunto do email">
                                    </div>
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-2 text-left">Conteúdo</label>
                                        <textarea id="emailContentInput" rows="8" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none" placeholder="Digite o conteúdo do email"></textarea>
                                    </div>
                                    <button id="processTextBtn" class="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-200">
                                        Processar Email
                                    </button>
                                </div>
                            </div>

                            <div class="hidden" id="fileInfo">
                                <div class="bg-gray-50 rounded-lg p-4">
                                    <p class="text-sm text-gray-600">Arquivo selecionado: <span id="selectedFileName" class="font-medium text-gray-900"></span></p>
                                    <button id="processFileBtn" class="mt-3 w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-200">
                                        Processar Arquivo
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            
            // Reinicializa os event listeners
            this.bindEvents();
            
            // Reinicializa os ícones Feather
            if (typeof feather !== 'undefined') {
                feather.replace();
            }
        }
    }
}

// Inicializar quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
    window.dashboardManager = new DashboardManager();
});
