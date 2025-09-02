"""
Service responsável pelo processamento de diferentes tipos de arquivos
"""

import io
import PyPDF2
from typing import Dict, Any

class FileProcessorService:
    def process_pdf_file(self, file_content: bytes) -> str:
        """
        Processa arquivo PDF e extrai texto
        
        Args:
            file_content (bytes): Conteúdo do arquivo PDF em bytes
            
        Returns:
            str: Texto extraído do PDF
        """
        # Lê o arquivo PDF
        pdf_reader = PyPDF2.PdfReader(io.BytesIO(file_content))
        
        # Extrai texto de todas as páginas
        text_content = ""
        for page in pdf_reader.pages:
            text_content += page.extract_text() + "\n"
        
        if not text_content.strip():
            raise Exception("Não foi possível extrair texto do PDF")
        
        return text_content
    
    def process_txt_file(self, file_content: bytes) -> str:
        """
        Processa arquivo TXT e extrai texto
        
        Args:
            file_content (bytes): Conteúdo do arquivo TXT em bytes
            
        Returns:
            str: Texto extraído do arquivo TXT
        """
        # Decodifica o conteúdo do arquivo TXT
        text_content = file_content.decode('utf-8')
        
        if not text_content.strip():
            raise Exception("Arquivo TXT está vazio")
        
        return text_content
