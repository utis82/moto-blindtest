#!/usr/bin/env python3
"""
Télécharge les extraits audio réels depuis YouTube pour les 3 motos du catalogue.
"""
import subprocess
import json
from pathlib import Path

# Lire le catalogue
with open('app/services/catalog.data.json', 'r') as f:
    catalog = json.load(f)

output_dir = Path('app/frontend/public/sounds')
output_dir.mkdir(parents=True, exist_ok=True)

for entry in catalog[:3]:  # Seulement les 3 premières
    url = entry['url']
    audio_file = entry['audioFile'].lstrip('/')
    start = entry['startSeconds']
    end = entry['endSeconds']
    duration = end - start

    output_path = output_dir / Path(audio_file).name

    print(f"\n{'='*60}")
    print(f"Téléchargement: {entry['meta']['title']}")
    print(f"URL: {url}")
    print(f"Extrait: {start}s → {end}s (durée: {duration}s)")
    print(f"Output: {output_path}")
    print('='*60)

    # Télécharger et extraire avec yt-dlp + ffmpeg
    cmd = [
        'yt-dlp',
        '--extract-audio',
        '--audio-format', 'mp3',
        '--audio-quality', '128K',
        '--external-downloader', 'ffmpeg',
        '--external-downloader-args', f'ffmpeg_i:-ss {start} -to {end}',
        '--output', str(output_path.with_suffix('')),  # Sans extension, yt-dlp ajoutera .mp3
        url
    ]

    try:
        result = subprocess.run(cmd, check=True, capture_output=True, text=True)
        print(f"✅ Téléchargement réussi!")

        # Vérifier la taille du fichier
        if output_path.exists():
            size = output_path.stat().st_size
            print(f"   Taille: {size:,} bytes ({size/1024:.1f} KB)")

    except subprocess.CalledProcessError as e:
        print(f"❌ Erreur: {e}")
        print(f"stdout: {e.stdout}")
        print(f"stderr: {e.stderr}")

print("\n" + "="*60)
print("Téléchargement terminé!")
print("="*60)
