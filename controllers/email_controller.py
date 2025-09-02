from typing import Dict, Any
from services.file_processor_service import FileProcessorService
from services.ai_processor_service import AIProcessorService


class EmailController:
    def __init__(self):
        self.file_processor = FileProcessorService()
        self.ai_processor = AIProcessorService()
    
    def process_file(self, file_content: bytes, file_type: str) -> Dict[str, Any]:
        """
        Processa um arquivo (PDF ou TXT) e retorna sua classificação
        
        Args:
            file_content (bytes): Conteúdo do arquivo em bytes
            file_type (str): Tipo do arquivo ('pdf' ou 'txt')
            
        Returns:
            Dict[str, Any]: Resultado da classificação e sugestão de resposta
        """
        if file_type == 'pdf':
            text_content = self.file_processor.process_pdf_file(file_content)
        elif file_type == 'txt':
            text_content = self.file_processor.process_txt_file(file_content)
        else:
            raise ValueError("Tipo de arquivo não suportado")
            
        return self.ai_processor.process_email(text_content)
    
    def process_direct_text(self, subject: str, content: str) -> Dict[str, Any]:
        """
        Processa texto digitado diretamente para categorização
        
        Args:
            subject (str): Assunto do email
            content (str): Conteúdo do email
            
        Returns:
            Dict[str, Any]: Resultado da classificação e sugestão de resposta
        """
        text = (f"Assunto: {subject}\n\n" if subject else "") + content
        return self.ai_processor.process_email(text)