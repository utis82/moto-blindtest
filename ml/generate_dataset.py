#!/usr/bin/env python3
"""
Génère un dataset d'entraînement pour l'extraction de métadonnées de motos
à partir des titres/descriptions YouTube
"""
import json
import random
from pathlib import Path

# Variations de formats de titres YouTube réels
TITLE_TEMPLATES = [
    "{manufacturer} {model} Sound",
    "{manufacturer} {model} Exhaust Sound",
    "{year} {manufacturer} {model}",
    "{manufacturer} {model} {engine} Sound",
    "{model} by {manufacturer}",
    "{manufacturer} {model} - Sound Test",
    "{manufacturer} {model} Akrapovic",
    "Sound of {manufacturer} {model}",
    "{year} {manufacturer} {model} Sound",
    "{manufacturer} {model} Engine Sound",
]

# Base de données de motos réelles pour l'entraînement
MOTOS_DATABASE = [
    # Ducati
    {"manufacturer": "Ducati", "model": "Panigale V4", "engine": "V4", "cylinders": "4", "year": "2020"},
    {"manufacturer": "Ducati", "model": "Panigale V4S", "engine": "V4", "cylinders": "4", "year": "2018"},
    {"manufacturer": "Ducati", "model": "Panigale V4R", "engine": "V4", "cylinders": "4", "year": "2019"},
    {"manufacturer": "Ducati", "model": "Monster 1200", "engine": "L-Twin", "cylinders": "2", "year": "2017"},
    {"manufacturer": "Ducati", "model": "Streetfighter V4", "engine": "V4", "cylinders": "4", "year": "2020"},
    {"manufacturer": "Ducati", "model": "Multistrada V4", "engine": "V4", "cylinders": "4", "year": "2021"},
    {"manufacturer": "Ducati", "model": "Diavel 1260", "engine": "L-Twin", "cylinders": "2", "year": "2019"},

    # Yamaha
    {"manufacturer": "Yamaha", "model": "YZF-R1", "engine": "Crossplane Inline-4", "cylinders": "4", "year": "2020"},
    {"manufacturer": "Yamaha", "model": "R1M", "engine": "Crossplane Inline-4", "cylinders": "4", "year": "2021"},
    {"manufacturer": "Yamaha", "model": "MT-09", "engine": "Triple CP3", "cylinders": "3", "year": "2020"},
    {"manufacturer": "Yamaha", "model": "MT-10", "engine": "Crossplane Inline-4", "cylinders": "4", "year": "2019"},
    {"manufacturer": "Yamaha", "model": "YZF-R6", "engine": "Inline-4", "cylinders": "4", "year": "2017"},
    {"manufacturer": "Yamaha", "model": "Tracer 9", "engine": "Triple CP3", "cylinders": "3", "year": "2021"},

    # Kawasaki
    {"manufacturer": "Kawasaki", "model": "Ninja H2", "engine": "Inline-4 Supercharged", "cylinders": "4", "year": "2020"},
    {"manufacturer": "Kawasaki", "model": "Ninja H2R", "engine": "Inline-4 Supercharged", "cylinders": "4", "year": "2021"},
    {"manufacturer": "Kawasaki", "model": "ZX-10R", "engine": "Inline-4", "cylinders": "4", "year": "2020"},
    {"manufacturer": "Kawasaki", "model": "Z900", "engine": "Inline-4", "cylinders": "4", "year": "2019"},
    {"manufacturer": "Kawasaki", "model": "Ninja ZX-6R", "engine": "Inline-4", "cylinders": "4", "year": "2019"},
    {"manufacturer": "Kawasaki", "model": "Z H2", "engine": "Inline-4 Supercharged", "cylinders": "4", "year": "2020"},

    # Honda
    {"manufacturer": "Honda", "model": "CBR1000RR-R Fireblade", "engine": "Inline-4", "cylinders": "4", "year": "2020"},
    {"manufacturer": "Honda", "model": "CBR1000RR", "engine": "Inline-4", "cylinders": "4", "year": "2019"},
    {"manufacturer": "Honda", "model": "CB1000R", "engine": "Inline-4", "cylinders": "4", "year": "2021"},
    {"manufacturer": "Honda", "model": "CBR600RR", "engine": "Inline-4", "cylinders": "4", "year": "2020"},
    {"manufacturer": "Honda", "model": "Africa Twin", "engine": "Parallel Twin", "cylinders": "2", "year": "2020"},

    # BMW
    {"manufacturer": "BMW", "model": "S1000RR", "engine": "Inline-4", "cylinders": "4", "year": "2021"},
    {"manufacturer": "BMW", "model": "S1000R", "engine": "Inline-4", "cylinders": "4", "year": "2020"},
    {"manufacturer": "BMW", "model": "M1000RR", "engine": "Inline-4", "cylinders": "4", "year": "2021"},
    {"manufacturer": "BMW", "model": "R1250GS", "engine": "Boxer Twin", "cylinders": "2", "year": "2019"},
    {"manufacturer": "BMW", "model": "R nineT", "engine": "Boxer Twin", "cylinders": "2", "year": "2020"},

    # Suzuki
    {"manufacturer": "Suzuki", "model": "GSX-R1000", "engine": "Inline-4", "cylinders": "4", "year": "2019"},
    {"manufacturer": "Suzuki", "model": "GSX-R1000R", "engine": "Inline-4", "cylinders": "4", "year": "2020"},
    {"manufacturer": "Suzuki", "model": "Hayabusa", "engine": "Inline-4", "cylinders": "4", "year": "2021"},
    {"manufacturer": "Suzuki", "model": "GSX-S1000", "engine": "Inline-4", "cylinders": "4", "year": "2020"},

    # KTM
    {"manufacturer": "KTM", "model": "1290 Super Duke R", "engine": "V-Twin", "cylinders": "2", "year": "2020"},
    {"manufacturer": "KTM", "model": "890 Duke R", "engine": "Parallel Twin", "cylinders": "2", "year": "2021"},
    {"manufacturer": "KTM", "model": "RC 390", "engine": "Single", "cylinders": "1", "year": "2020"},
    {"manufacturer": "KTM", "model": "1290 Super Adventure", "engine": "V-Twin", "cylinders": "2", "year": "2021"},

    # Aprilia
    {"manufacturer": "Aprilia", "model": "RSV4 Factory", "engine": "V4", "cylinders": "4", "year": "2020"},
    {"manufacturer": "Aprilia", "model": "RSV4 1100", "engine": "V4", "cylinders": "4", "year": "2019"},
    {"manufacturer": "Aprilia", "model": "RS 660", "engine": "Parallel Twin", "cylinders": "2", "year": "2021"},
    {"manufacturer": "Aprilia", "model": "Tuono V4", "engine": "V4", "cylinders": "4", "year": "2020"},

    # Harley-Davidson
    {"manufacturer": "Harley-Davidson", "model": "Breakout 114", "engine": "V-Twin", "cylinders": "2", "year": "2020"},
    {"manufacturer": "Harley-Davidson", "model": "Fat Boy", "engine": "V-Twin", "cylinders": "2", "year": "2019"},
    {"manufacturer": "Harley-Davidson", "model": "Street Glide", "engine": "V-Twin", "cylinders": "2", "year": "2021"},
    {"manufacturer": "Harley-Davidson", "model": "Road Glide", "engine": "V-Twin", "cylinders": "2", "year": "2020"},

    # Triumph
    {"manufacturer": "Triumph", "model": "Street Triple RS", "engine": "Triple", "cylinders": "3", "year": "2020"},
    {"manufacturer": "Triumph", "model": "Speed Triple 1200 RR", "engine": "Triple", "cylinders": "3", "year": "2021"},
    {"manufacturer": "Triumph", "model": "Daytona 675", "engine": "Triple", "cylinders": "3", "year": "2017"},
]

def generate_training_example(moto):
    """Génère un exemple d'entraînement avec un titre simulé"""
    template = random.choice(TITLE_TEMPLATES)

    # Substituer les variables
    title = template.format(
        manufacturer=moto["manufacturer"],
        model=moto["model"],
        engine=moto["engine"],
        cylinders=moto["cylinders"],
        year=moto["year"]
    )

    # Ajouter des variations réalistes
    variations = [
        title,
        title + " | Exhaust",
        title + " - Cold Start",
        title.upper(),
        title.lower(),
        f"{title} (4K)",
        f"{title} - FULL VIDEO",
    ]

    final_title = random.choice(variations)

    return {
        "input": f"Title: {final_title}\nExtract motorcycle metadata:",
        "output": json.dumps(moto, ensure_ascii=False)
    }

def generate_dataset(num_examples=500):
    """Génère un dataset complet"""
    dataset = []

    # Générer des exemples pour chaque moto
    for _ in range(num_examples):
        moto = random.choice(MOTOS_DATABASE)
        example = generate_training_example(moto)
        dataset.append(example)

    return dataset

def save_dataset(dataset, output_path):
    """Sauvegarde le dataset au format JSON Lines"""
    with open(output_path, 'w', encoding='utf-8') as f:
        for example in dataset:
            f.write(json.dumps(example, ensure_ascii=False) + '\n')

if __name__ == "__main__":
    print("🏗️  Génération du dataset d'entraînement...")

    # Générer dataset
    train_dataset = generate_dataset(num_examples=400)
    val_dataset = generate_dataset(num_examples=100)

    # Créer le dossier
    output_dir = Path("ml/data")
    output_dir.mkdir(parents=True, exist_ok=True)

    # Sauvegarder
    save_dataset(train_dataset, output_dir / "train.jsonl")
    save_dataset(val_dataset, output_dir / "val.jsonl")

    print(f"✅ Dataset créé:")
    print(f"   Train: {len(train_dataset)} exemples")
    print(f"   Val: {len(val_dataset)} exemples")
    print(f"   📁 Sauvegardé dans: {output_dir}")
