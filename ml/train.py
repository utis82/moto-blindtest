#!/usr/bin/env python3
"""
Fine-tuning de Phi-3 Mini pour extraction de métadonnées de motos
Optimisé pour RTX 4070 Laptop (8GB VRAM)
"""
import torch
import json
from pathlib import Path
from transformers import (
    AutoTokenizer,
    AutoModelForCausalLM,
    TrainingArguments,
    Trainer,
    BitsAndBytesConfig
)
from peft import LoraConfig, get_peft_model, prepare_model_for_kbit_training
from datasets import load_dataset

# Configuration
MODEL_NAME = "microsoft/Phi-3-mini-4k-instruct"
OUTPUT_DIR = "models/moto-metadata-extractor"
DATA_DIR = "data"

# Configuration quantization 4-bit pour économiser VRAM
bnb_config = BitsAndBytesConfig(
    load_in_4bit=True,
    bnb_4bit_use_double_quant=True,
    bnb_4bit_quant_type="nf4",
    bnb_4bit_compute_dtype=torch.bfloat16
)

# Configuration LoRA (Low-Rank Adaptation)
lora_config = LoraConfig(
    r=16,  # Rang des matrices LoRA
    lora_alpha=32,
    target_modules=["q_proj", "v_proj", "k_proj", "o_proj"],
    lora_dropout=0.05,
    bias="none",
    task_type="CAUSAL_LM"
)

def load_and_prepare_data():
    """Charge et prépare le dataset"""
    print("📥 Chargement du dataset...")

    dataset = load_dataset(
        "json",
        data_files={
            "train": f"{DATA_DIR}/train.jsonl",
            "validation": f"{DATA_DIR}/val.jsonl"
        }
    )

    print(f"   Train: {len(dataset['train'])} exemples")
    print(f"   Val: {len(dataset['validation'])} exemples")

    return dataset

def format_prompt(example):
    """Formate l'exemple pour l'entraînement"""
    return {
        "text": f"<|user|>\n{example['input']}<|end|>\n<|assistant|>\n{example['output']}<|end|>"
    }

def train_model():
    """Entraîne le modèle"""
    print("🚀 Démarrage de l'entraînement Phi-3 Mini...")
    print(f"   GPU: {torch.cuda.get_device_name(0)}")
    print(f"   VRAM disponible: {torch.cuda.get_device_properties(0).total_memory / 1024**3:.1f} GB")

    # Charger le tokenizer
    print("\n📝 Chargement du tokenizer...")
    tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME, trust_remote_code=True)
    tokenizer.pad_token = tokenizer.eos_token
    tokenizer.padding_side = "right"

    # Charger le modèle en 4-bit
    print("\n🧠 Chargement du modèle en quantization 4-bit...")
    model = AutoModelForCausalLM.from_pretrained(
        MODEL_NAME,
        quantization_config=bnb_config,
        device_map="auto",
        trust_remote_code=True,
        torch_dtype=torch.bfloat16,
        use_cache=False  # Désactiver le cache KV pour l'entraînement
    )

    # Préparer pour entraînement avec LoRA
    print("\n🔧 Application de LoRA...")
    model = prepare_model_for_kbit_training(model)
    model.config.use_cache = False  # S'assurer que c'est bien désactivé
    model = get_peft_model(model, lora_config)

    # Afficher les paramètres entraînables
    trainable_params = sum(p.numel() for p in model.parameters() if p.requires_grad)
    total_params = sum(p.numel() for p in model.parameters())
    print(f"   Paramètres entraînables: {trainable_params:,} ({100 * trainable_params / total_params:.2f}%)")

    # Charger dataset
    dataset = load_and_prepare_data()

    # Formater les prompts
    dataset = dataset.map(format_prompt)

    # Tokenizer
    def tokenize_function(examples):
        model_inputs = tokenizer(
            examples["text"],
            truncation=True,
            max_length=512,
            padding="max_length"
        )
        # Ajouter les labels (pour la loss)
        model_inputs["labels"] = model_inputs["input_ids"].copy()
        return model_inputs

    print("\n🔤 Tokenization...")
    tokenized_dataset = dataset.map(
        tokenize_function,
        batched=True,
        remove_columns=dataset["train"].column_names
    )

    # Configuration d'entraînement
    training_args = TrainingArguments(
        output_dir=OUTPUT_DIR,
        num_train_epochs=3,
        per_device_train_batch_size=2,  # Petit batch pour 8GB VRAM
        per_device_eval_batch_size=2,
        gradient_accumulation_steps=4,  # Simule batch_size=8
        learning_rate=2e-4,
        fp16=False,
        bf16=True,  # BFloat16 pour Ada Lovelace
        logging_steps=10,
        eval_strategy="steps",  # Renommé depuis evaluation_strategy
        eval_steps=25,
        save_strategy="steps",
        save_steps=25,  # Sauvegarde toutes les 25 steps (~2-3 min)
        save_total_limit=5,
        load_best_model_at_end=True,
        metric_for_best_model="loss",
        warmup_steps=50,
        optim="paged_adamw_8bit",  # Optimiseur optimisé pour mémoire
        gradient_checkpointing=True,
        report_to="none"
    )

    # Créer le Trainer
    trainer = Trainer(
        model=model,
        args=training_args,
        train_dataset=tokenized_dataset["train"],
        eval_dataset=tokenized_dataset["validation"],
        tokenizer=tokenizer
    )

    # Entraîner
    print("\n🏋️  Début de l'entraînement (cela va prendre 1-2 heures)...")
    print("   Vous pouvez surveiller la progression avec nvidia-smi")
    trainer.train()

    # Sauvegarder
    print("\n💾 Sauvegarde du modèle final...")
    trainer.save_model()
    tokenizer.save_pretrained(OUTPUT_DIR)

    print(f"\n✅ Entraînement terminé !")
    print(f"   Modèle sauvegardé dans: {OUTPUT_DIR}")

    return model, tokenizer

if __name__ == "__main__":
    try:
        # Vérifier CUDA
        if not torch.cuda.is_available():
            raise RuntimeError("❌ CUDA n'est pas disponible. Vérifiez votre installation PyTorch.")

        print(f"✅ CUDA disponible: {torch.cuda.get_device_name(0)}")
        print(f"   Version CUDA: {torch.version.cuda}")
        print(f"   PyTorch version: {torch.__version__}\n")

        # Lancer l'entraînement
        train_model()

    except Exception as e:
        print(f"\n❌ Erreur: {e}")
        import traceback
        traceback.print_exc()
