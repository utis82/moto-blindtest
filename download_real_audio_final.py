#!/usr/bin/env python3
"""
Télécharge les extraits audio réels depuis YouTube.
Méthode finale : Télécharger vidéo complète, extraire audio, puis couper avec ffmpeg.
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

for entry in catalog[:3]:
    url = entry['url']
    video_id = entry['videoId']
    audio_file = entry['audioFile'].lstrip('/')
    start = entry['startSeconds']
    end = entry['endSeconds']

    output_path = output_dir / Path(audio_file).name
    tmp_video = f'/tmp/moto_{video_id}.mp4'

    print(f"\n{'='*60}")
    print(f"Téléchargement: {entry['meta']['title']}")
    print(f"Extrait: {start}s → {end}s")
    print('='*60)

    try:
        # Étape 1: Télécharger vidéo complète
        print("Étape 1: Téléchargement vidéo complète...")
        cmd = [
            '/usr/local/bin/yt-dlp',
            '-f', 'bestvideo[ext=mp4]+bestaudio[ext=m4a]/best',
            '--merge-output-format', 'mp4',
            '-o', tmp_video,
            url
        ]
        subprocess.run(cmd, check=True, capture_output=True)
        print(f"   ✅ Vidéo téléchargée")

        # Étape 2: Extraire l'audio et couper
        print(f"Étape 2: Extraction audio {start}s-{end}s...")
        cmd = [
            'ffmpeg', '-y',
            '-ss', str(start),
            '-i', tmp_video,
            '-t', str(end - start),
            '-vn',  # Pas de vidéo
            '-acodec', 'libmp3lame',
            '-b:a', '128k',
            str(output_path)
        ]
        subprocess.run(cmd, check=True, capture_output=True)

        size = output_path.stat().st_size
        print(f"   ✅ MP3 créé: {size/1024:.1f} KB")

    except subprocess.CalledProcessError as e:
        print(f"❌ Erreur: {e}")
        if e.output:
            print(f"Output: {e.output.decode()[:500]}")
    finally:
        if os.path.exists(tmp_video):
            os.remove(tmp_video)

print("\n" + "="*60)
print("Terminé!")
print("="*60)
