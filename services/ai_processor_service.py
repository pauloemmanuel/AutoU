"""
Service responsável pela classificação e geração de respostas usando IA
"""

import os
from typing import Dict, Any
from dotenv import load_dotenv
from huggingface_hub import InferenceClient

# Load environment variables
load_dotenv()

# Constants
LABELS = ['produtivo', 'improdutivo']
CLASSIFICATION_MODEL = "openai/gpt-oss-120b"

# Initialize Hugging Face client
client = InferenceClient(
    provider="fireworks-ai",
    api_key=os.getenv("HUGGINGFACE_API_KEY"),
)

class AIProcessorService:
    def process_email(self, email_content: str) -> Dict[str, Any]:
        """
        Processa um email, realizando a classificação e gerando uma sugestão de resposta
        
        Args:
            email_content: Conteúdo do email para processamento
            
        Returns:
            Dicionário com a classificação, confiança e sugestão de resposta
        """
        try:
            prompt = f"""Analise o seguinte email e classifique como PRODUTIVO (requer ação/resposta) 
            ou IMPRODUTIVO (não requer ação imediata). Em seguida, gere uma resposta profissional e apropriada 
            em português com base na classificação. 

            Email: {email_content}

            Responda no seguinte formato JSON:
            {{
                \"classification\": \"produtivo\" ou \"improdutivo\",
                \"response\": \"sugestão de resposta\"
            }}"""

            completion = client.chat.completions.create(
                model=CLASSIFICATION_MODEL,
                messages=[{"role": "user", "content": prompt}]
            )

            result = completion.choices[0].message.content.strip()
            return eval(result)  # Converte o JSON retornado em um dicionário
        except Exception as e:
            print(f"Erro no processamento do email: {str(e)}")
            return {
                "error": str(e),
                "classification": LABELS[1],
                "suggested_response": "Desculpe, não foi possível gerar uma resposta automática neste momento."
            }
