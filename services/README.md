# Serviço RoBERTa-large-MNLI para Classificação de Emails

Este serviço utiliza o modelo **RoBERTa-large-MNLI** da Facebook AI para classificar emails automaticamente entre duas categorias: **"productive"** e **"improductive"**.

## 🚀 Características

- **Modelo**: RoBERTa-large-MNLI (Zero-shot Classification)
- **Arquitetura**: Transformer-based language model
- **Treinamento**: Multi-Genre Natural Language Inference (MNLI) corpus
- **Licença**: MIT
- **Idioma**: Inglês (mas funciona bem com português)
- **Resposta**: Apenas a categoria (productive/improductive)

## 📦 Instalação

```bash
pip install transformers torch numpy
```

## 🔧 Uso Básico

### 1. Importar o Serviço

```python
from services.roberta_classifier import RobertaClassifier, classify_email_roberta
```

### 2. Classificar um Email

```python
# Método 1: Usando a classe
classifier = RobertaClassifier()
result = classifier.classify_email(
    content="Preciso de ajuda com o projeto de desenvolvimento",
    subject="Solicitação de Ajuda"
)

print(f"Categoria: {result['category']}")
# Saída: Categoria: productive
```

### 3. Função de Conveniência

```python
# Método 2: Função direta
result = classify_email_roberta(
    content="Reunião de equipe amanhã às 10h",
    subject="Agendamento"
)

print(f"Categoria: {result['category']}")
# Saída: Categoria: productive
```

## 📊 Estrutura da Resposta

```json
{
    "category": "productive"
}
```

**Simples assim!** Apenas a categoria, sem scores, confiança ou detalhes extras.

## 🎯 Categorias

- **`productive`**: Emails relacionados a trabalho, projetos, reuniões, tarefas, etc.
- **`improductive`**: Spam, promoções, conteúdo irrelevante, etc.

## 🔍 Como Funciona

O modelo usa **zero-shot classification**, que significa que ele pode classificar textos em categorias que não viu durante o treinamento. Ele usa o template:

> "This text is about {} work or activities."

Onde `{}` é substituído por cada categoria candidata.

## 📈 Exemplos de Classificação

### Email Produtivo ✅
```
Assunto: Reunião de Planejamento
Conteúdo: Gostaria de agendar uma reunião para discutir o projeto...
Resultado: {"category": "productive"}
```

### Email Improdutivo ❌
```
Assunto: URGENTE! Você ganhou um prêmio!
Conteúdo: Parabéns! Clique aqui para receber R$ 50.000...
Resultado: {"category": "improductive"}
```

## 🚀 Funcionalidades Avançadas

### Classificação em Lote

```python
classifier = RobertaClassifier()
texts = [
    "Reunião de equipe amanhã",
    "Promoção imperdível!",
    "Relatório mensal concluído"
]

results = classifier.classify_batch(texts)
# Retorna: [{"category": "productive"}, {"category": "improductive"}, {"category": "productive"}]
```

## ⚠️ Considerações

1. **Primeira Execução**: O modelo será baixado automaticamente (~1.5GB)
2. **Memória**: Requer pelo menos 4GB de RAM
3. **GPU**: Opcional, mas acelera a inferência
4. **Idioma**: Otimizado para inglês, mas funciona com português

## 🧪 Testando

Execute o arquivo de teste:

```bash
python test_roberta_service.py
```

## 📚 Referências

- [Modelo no Hugging Face](https://huggingface.co/roberta-large-mnli)
- [Paper RoBERTa](https://arxiv.org/abs/1907.11692)
- [Documentação Transformers](https://huggingface.co/docs/transformers/)

## 🤝 Contribuições

Sinta-se à vontade para contribuir com melhorias no serviço!
