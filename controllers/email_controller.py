"""
Email Controller - Responsável pela categorização automática de emails
"""

from typing import Dict, Any
import PyPDF2
import io


class EmailController:
    def categorize_email(self, content: str, subject: str = "") -> Dict[str, Any]:
        """
        Categoriza o conteúdo do email
        
        Args:
            content (str): Conteúdo do email para análise
            subject (str): Assunto do email (opcional)
            
        Returns:
            Dict[str, Any]: Resultado da categorização
        """
        return {
            "category": "Produtivo"
        }
    
    def process_pdf_file(self, file_content: bytes) -> Dict[str, Any]:
        """
        Processa arquivo PDF e extrai texto para categorização
        
        Args:
            file_content (bytes): Conteúdo do arquivo PDF em bytes
            
        Returns:
            Dict[str, Any]: Resultado da categorização do PDF
        """
        # Lê o arquivo PDF
        pdf_reader = PyPDF2.PdfReader(io.BytesIO(file_content))
        
        # Extrai texto de todas as páginas
        text_content = ""
        for page in pdf_reader.pages:
            text_content += page.extract_text() + "\n"
        
        if not text_content.strip():
            raise Exception("Não foi possível extrair texto do PDF")
        
        # Categoriza o conteúdo extraído
        return self.categorize_email(text_content)
    
    def process_txt_file(self, file_content: bytes) -> Dict[str, Any]:
        """
        Processa arquivo TXT e extrai texto para categorização
        
        Args:
            file_content (bytes): Conteúdo do arquivo TXT em bytes
            
        Returns:
            Dict[str, Any]: Resultado da categorização do TXT
        """
        # Decodifica o conteúdo do arquivo TXT
        text_content = file_content.decode('utf-8')
        
        if not text_content.strip():
            raise Exception("Arquivo TXT está vazio")
        
        # Categoriza o conteúdo extraído
        return self.categorize_email(text_content)
    
    def process_direct_text(self, subject: str, content: str) -> Dict[str, Any]:
        """
        Processa texto digitado diretamente para categorização
        
        Args:
            subject (str): Assunto do email
            content (str): Conteúdo do email
            
        Returns:
            Dict[str, Any]: Resultado da categorização do texto
        """
        # Categoriza o conteúdo
        return self.categorize_email(content, subject)