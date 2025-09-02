from flask import Flask, render_template, request, jsonify
from controllers.email_controller import EmailController
import os

app = Flask(__name__)
email_controller = EmailController()

# Configuração para upload de arquivos
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max

@app.route('/')
def index():
    return render_template('dashboard.html')

@app.route('/login')
def login():
    return render_template('login.html')

@app.route('/api/process-pdf', methods=['POST'])
def process_pdf():
    """API endpoint para processar arquivos PDF"""
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'Nenhum arquivo enviado'}), 400

        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'Nenhum arquivo selecionado'}), 400

        if not file.filename.lower().endswith('.pdf'):
            return jsonify({'error': 'Arquivo deve ser um PDF'}), 400

        file_content = file.read()
        result = email_controller.process_file(file_content, 'pdf')

        return jsonify(result)

    except Exception as e:
        return jsonify({'error': f'Erro ao processar PDF: {str(e)}'}), 500

@app.route('/api/process-txt', methods=['POST'])
def process_txt():
    """API endpoint para processar arquivos TXT"""
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'Nenhum arquivo enviado'}), 400

        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'Nenhum arquivo selecionado'}), 400

        if not file.filename.lower().endswith('.txt'):
            return jsonify({'error': 'Arquivo deve ser um TXT'}), 400

        file_content = file.read()
        result = email_controller.process_file(file_content, 'txt')

        return jsonify(result)

    except Exception as e:
        return jsonify({'error': f'Erro ao processar TXT: {str(e)}'}), 500

@app.route('/api/process-text', methods=['POST'])
def process_text():
    """API endpoint para processar texto digitado diretamente"""
    try:
        data = request.get_json()
        subject = data.get('subject', '')
        content = data.get('content', '')
        
        if not content:
            return jsonify({'error': 'Conteúdo do email é obrigatório'}), 400
        
        result = email_controller.process_direct_text(subject, content)
        
        return jsonify(result)
        
    except Exception as e:
        return jsonify({'error': f'Erro ao processar texto: {str(e)}'}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
