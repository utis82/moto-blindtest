#!/usr/bin/env python3
import json
import subprocess
import os
from pathlib import Path

# Charger le fichier JSON
with open('app/backend/src/add_14_motos_with_audio.json', 'r', encoding='utf-8') as f:
    motos = json.load(f)

# Créer le répertoire de destination
output_dir = Path('app/backend/public/sounds')
output_dir.mkdir(parents=True, exist_ok=True)

print(f"📁 Téléchargement dans: {output_dir}")
print(f"🎵 {len(motos)} motos à traiter\n")

success = 0
failed = 0

for moto in motos:
    manufacturer = moto['manufacturer']
    model = moto['model']
    video_url = moto['youtubeUrl']
    start = moto['startSeconds']
    end = moto['endSeconds']

    # Créer le nom du fichier
    filename = f"{manufacturer.lower().replace(' ', '-')}-{model.lower().replace(' ', '-')}.mp3"
    output_path = output_dir / filename

    print(f"⬇️  {manufacturer} {model}")
    print(f"   URL: {video_url}")
    print(f"   Extrait: {start}s - {end}s")

    try:
        # Vérifier si le fichier existe déjà
        if output_path.exists():
            print(f"   ⏭️  Fichier existe déjà: {filename}")
            success += 1
            continue

        # Commande yt-dlp pour télécharger l'audio
        duration = end - start
        cmd = [
            'yt-dlp',
            '--extract-audio',
            '--audio-format', 'mp3',
            '--audio-quality', '0',
            '--postprocessor-args', f'-ss {start} -t {duration}',
            '-o', str(output_path.with_suffix('')),
            video_url
        ]

        result = subprocess.run(cmd, capture_output=True, text=True, timeout=60)

        if result.returncode == 0 and output_path.exists():
            print(f"   ✅ Téléchargé: {filename}\n")
            success += 1
        else:
            print(f"   ❌ Échec du téléchargement")
            print(f"   Erreur: {result.stderr}\n")
            failed += 1

    except subprocess.TimeoutExpired:
        print(f"   ❌ Timeout dépassé\n")
        failed += 1
    except Exception as e:
        print(f"   ❌ Erreur: {e}\n")
        failed += 1

print("\n" + "="*60)
print("📊 RÉSUMÉ")
print("="*60)
print(f"✅ Téléchargements réussis: {success}")
print(f"❌ Échecs: {failed}")
print(f"\n💡 Fichiers disponibles dans: {output_dir}")
