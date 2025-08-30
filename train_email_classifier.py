from datasets import load_dataset, ClassLabel
from transformers import AutoTokenizer, AutoModelForSequenceClassification, Trainer, TrainingArguments
import numpy as np
from sklearn.metrics import accuracy_score, f1_score

# Caminho do dataset CSV
csv_file = 'emails_classificados.csv'  # Deve ter colunas: text,label

# Carregar dataset
dataset = load_dataset('csv', data_files={'data': csv_file})['data']

# Ajustar os labels para classificação binária
labels = ClassLabel(names=['productive', 'improductive'])

def encode_labels(example):
    label = example['label']
    if label is None or label.strip() not in labels.names:
        example['label'] = -1  # marcador inválido
    else:
        example['label'] = labels.str2int(label.strip())
    return example

dataset = dataset.map(encode_labels)
dataset = dataset.filter(lambda x: x['label'] != -1)

# Dividir em treino/validação (80/20)
dataset = dataset.train_test_split(test_size=0.2, seed=42)

# Tokenizador
model_name = "neuralmind/bert-base-portuguese-cased"
tokenizer = AutoTokenizer.from_pretrained(model_name)

def preprocess(examples):
    return tokenizer(examples['text'], truncation=True, padding='max_length', max_length=128)

tokenized = dataset.map(preprocess, batched=True)

# Modelo
model = AutoModelForSequenceClassification.from_pretrained(model_name, num_labels=2)

# Função de métricas
def compute_metrics(eval_pred):
    logits, labels_ = eval_pred
    preds = np.argmax(logits, axis=-1)
    return {
        'accuracy': accuracy_score(labels_, preds),
        'f1': f1_score(labels_, preds)
    }

# Configuração de treinamento
args = TrainingArguments(
    output_dir='output',
    evaluation_strategy='epoch',
    save_strategy='epoch',
    num_train_epochs=3,
    per_device_train_batch_size=8,
    per_device_eval_batch_size=8,
    logging_dir='logs',
    logging_steps=10,
    load_best_model_at_end=True,
    metric_for_best_model='accuracy'
)

# Trainer
trainer = Trainer(
    model=model,
    args=args,
    train_dataset=tokenized['train'],
    eval_dataset=tokenized['test'],
    compute_metrics=compute_metrics,
    tokenizer=tokenizer
)

# Treinar
trainer.train()

# Salvar modelo final
trainer.save_model('email-classifier-pt-br')
tokenizer.save_pretrained('email-classifier-pt-br')
