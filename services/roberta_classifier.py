"""
Serviço de Classificação usando RoBERTa-large-MNLI
Classifica emails entre "productive" e "improductive"
"""

from huggingface_hub import InferenceClient
from typing import Dict, Any
import os
from dotenv import load_dotenv



class RobertaClassifier:
    def __init__(self, api_key: str):
        """
        Inicializa o classificador usando a API do Hugging Face
        """
        self.api_key = api_key
    self.model_id = "facebook/bart-large-mnli"
    self.client = InferenceClient(token=self.api_key)
    self.candidate_labels = ['productive', 'improductive']

    def classify_email(self, content: str, subject: str = "") -> Dict[str, Any]:
        """
        Classifica o email usando a API do Hugging Face via huggingface_hub
        """
        full_text = f"{subject} {content}".strip()
        if not full_text:
            raise ValueError("Texto vazio para classificação")
        result = self.client.zero_shot_classification(
            full_text,
            self.candidate_labels,
            hypothesis_template="This text is about {} work or activities.",
            model=self.model_id
        )
        return {"category": result['labels'][0]}

    def classify_batch(self, texts: list, subject: str = "") -> list:
        """
        Classifica múltiplos textos em lote usando a API do Hugging Face
        """
        results = []
        for text in texts:
            result = self.classify_email(text, subject)
            results.append(result)
        return results



# Função de conveniência para uso direto
def classify_email_roberta(content: str, subject: str = "", api_key: str = "") -> Dict[str, Any]:
    """
    Função de conveniência para classificar um email usando a API do Hugging Face
    """
    if not api_key:
        raise ValueError("É necessário fornecer a chave de API do Hugging Face.")
    classifier = RobertaClassifier(api_key)
    return classifier.classify_email(content, subject)


if __name__ == "__main__":
    # Carrega variáveis do .env
    load_dotenv()
    API_KEY = os.getenv("HUGGINGFACE_API_KEY")
    if not API_KEY:
        raise ValueError("A variável HUGGINGFACE_API_KEY não está definida no .env")
    classifier = RobertaClassifier(API_KEY)
    productive_email = """
    Assunto: Reunião de Planejamento do Projeto
    
    Olá equipe,
    
    Gostaria de agendar uma reunião para discutir o planejamento do projeto de desenvolvimento.
    Precisamos revisar os objetivos, definir as metas e estabelecer os prazos.
    
    Por favor, confirmem sua disponibilidade para amanhã às 14h.
    
    Abraços,
    João
    """
    result = classifier.classify_email(productive_email, "Reunião de Planejamento")
    print(f"Categoria: {result['category']}")
