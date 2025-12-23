#!/usr/bin/env python3
"""
Télécharge tous les sons manquants du catalogue.
"""
import subprocess
import json
from pathlib import Path
import os

# Lire le catalogue
with open('app/services/catalog.data.json', 'r') as f:
    catalog = json.load(f)

output_dir = Path('app/frontend/public/sounds')
output_dir.mkdir(parents=True, exist_ok=True)

downloaded = 0
skipped = 0
errors = 0

for i, entry in enumerate(catalog, 1):
    url = entry['url']
    video_id = entry['videoId']
    audio_file = entry['audioFile'].lstrip('/')
    start = entry['startSeconds']
    end = entry['endSeconds']

    output_path = output_dir / Path(audio_file).name
    tmp_video = f'/tmp/moto_{video_id}.mp4'

    # Vérifier si le fichier existe déjà et a une taille correcte (>100 KB)
    if output_path.exists() and output_path.stat().st_size > 100000:
        print(f"[{i}/{len(catalog)}] ⏭️  {entry['fallback']['model']}: déjà téléchargé ({output_path.stat().st_size/1024:.0f} KB)")
        skipped += 1
        continue

    print(f"\n[{i}/{len(catalog)}] {'='*60}")
    print(f"📥 {entry['fallback']['manufacturer']} {entry['fallback']['model']}")
    print(f"   {url}")
    print(f"   Extrait: {start}s → {end}s")
    print('='*60)

    try:
        # Étape 1: Télécharger vidéo complète
        print("   Étape 1/2: Téléchargement vidéo...")
        cmd = [
            '/usr/local/bin/yt-dlp',
            '-f', 'bestvideo[ext=mp4]+bestaudio[ext=m4a]/best',
            '--merge-output-format', 'mp4',
            '-o', tmp_video,
            url
        ]
        subprocess.run(cmd, check=True, capture_output=True, timeout=120)
        print("   ✅ Vidéo téléchargée")

        # Étape 2: Extraire l'audio et couper
        print(f"   Étape 2/2: Extraction audio {start}s-{end}s...")
        cmd = [
            'ffmpeg', '-y',
            '-ss', str(start),
            '-i', tmp_video,
            '-t', str(end - start),
            '-vn',
            '-acodec', 'libmp3lame',
            '-b:a', '128k',
            str(output_path)
        ]
        subprocess.run(cmd, check=True, capture_output=True, timeout=60)

        size = output_path.stat().st_size
        print(f"   ✅ MP3 créé: {size/1024:.1f} KB")
        downloaded += 1

    except subprocess.TimeoutExpired:
        print(f"   ⏱️  Timeout - vidéo trop longue, skip")
        errors += 1
    except subprocess.CalledProcessError as e:
        print(f"   ❌ Erreur: {e}")
        errors += 1
    finally:
        if os.path.exists(tmp_video):
            os.remove(tmp_video)

print(f"\n\n{'='*60}")
print(f"✅ Téléchargés: {downloaded}")
print(f"⏭️  Déjà présents: {skipped}")
print(f"❌ Erreurs: {errors}")
print(f"📊 Total: {len(catalog)} motos")
print('='*60)
