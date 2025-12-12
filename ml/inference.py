#!/usr/bin/env python3
"""
Script d'inférence pour extraire les métadonnées de motos
depuis un titre/description YouTube
"""
import torch
import json
from transformers import AutoTokenizer, AutoModelForCausalLM, BitsAndBytesConfig
from peft import PeftModel

MODEL_DIR = "models/moto-metadata-extractor"

class MotoMetadataExtractor:
    def __init__(self, model_path=MODEL_DIR):
        """Initialise le modèle"""
        print(f"📥 Chargement du modèle depuis {model_path}...")

        # Configuration quantization
        bnb_config = BitsAndBytesConfig(
            load_in_4bit=True,
            bnb_4bit_use_double_quant=True,
            bnb_4bit_quant_type="nf4",
            bnb_4bit_compute_dtype=torch.bfloat16
        )

        # Charger tokenizer
        self.tokenizer = AutoTokenizer.from_pretrained(model_path, trust_remote_code=True)

        # Charger modèle de base
        base_model = AutoModelForCausalLM.from_pretrained(
            "microsoft/Phi-3-mini-4k-instruct",
            quantization_config=bnb_config,
            device_map="auto",
            trust_remote_code=True,
            torch_dtype=torch.bfloat16
        )

        # Charger adaptateurs LoRA
        self.model = PeftModel.from_pretrained(base_model, model_path)
        self.model.eval()

        print("✅ Modèle chargé et prêt !")

    def extract(self, title, channel="Unknown"):
        """Extrait les métadonnées depuis un titre YouTube"""
        prompt = f"<|user|>\nTitle: {title}\nExtract motorcycle metadata:<|end|>\n<|assistant|>\n"

        # Tokenizer
        inputs = self.tokenizer(prompt, return_tensors="pt").to(self.model.device)

        # Générer
        with torch.no_grad():
            outputs = self.model.generate(
                **inputs,
                max_new_tokens=150,
                temperature=0.1,
                do_sample=False,
                pad_token_id=self.tokenizer.eos_token_id
            )

        # Décoder
        response = self.tokenizer.decode(outputs[0], skip_special_tokens=True)

        # Extraire le JSON
        try:
            # Le modèle retourne le prompt + la réponse, on prend après "assistant"
            json_start = response.find("{")
            json_end = response.rfind("}") + 1
            json_str = response[json_start:json_end]
            metadata = json.loads(json_str)
            return metadata
        except Exception as e:
            print(f"❌ Erreur parsing JSON: {e}")
            print(f"   Réponse brute: {response}")
            return None

def test_extractor():
    """Test le modèle sur quelques exemples"""
    extractor = MotoMetadataExtractor()

    test_cases = [
        "Ducati Panigale V4S Sound!",
        "2020 Kawasaki Ninja H2R Exhaust",
        "Yamaha MT-09 Sound Test",
        "BMW S1000RR Engine Sound"
    ]

    print("\n🧪 Test d'extraction:\n")
    for title in test_cases:
        print(f"📹 Titre: {title}")
        metadata = extractor.extract(title)
        if metadata:
            print(f"   ✅ Résultat: {json.dumps(metadata, indent=2, ensure_ascii=False)}")
        else:
            print(f"   ❌ Échec de l'extraction")
        print()

if __name__ == "__main__":
    test_extractor()
