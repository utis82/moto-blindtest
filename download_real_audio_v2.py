#!/usr/bin/env python3
"""
Télécharge les extraits audio réels depuis YouTube pour les 3 motos du catalogue.
Méthode en 2 étapes : télécharger l'audio complet, puis extraire avec ffmpeg.
"""
import subprocess
import json
from pathlib import Path
import tempfile
import os

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

    # Créer un fichier temporaire pour l'audio complet
    with tempfile.NamedTemporaryFile(suffix='.mp3', delete=False) as tmp:
        tmp_path = tmp.name

    try:
        # Étape 1: Télécharger l'audio complet
        print("Étape 1: Téléchargement de l'audio complet...")
        cmd_download = [
            '/usr/local/bin/yt-dlp',
            '--extract-audio',
            '--audio-format', 'mp3',
            '--audio-quality', '128K',
            '--output', tmp_path.replace('.mp3', ''),
            url
        ]
        subprocess.run(cmd_download, check=True, capture_output=True)
        print(f"   ✅ Audio complet téléchargé dans {tmp_path}")

        # Étape 2: Extraire la partie souhaitée avec ffmpeg
        print(f"Étape 2: Extraction de {start}s à {end}s...")
        cmd_extract = [
            'ffmpeg',
            '-y',  # Overwrite
            '-i', tmp_path,
            '-ss', str(start),
            '-to', str(end),
            '-acodec', 'libmp3lame',
            '-b:a', '128k',
            str(output_path)
        ]
        result = subprocess.run(cmd_extract, check=True, capture_output=True, text=True)
        print(f"   ✅ Extrait créé!")

        # Vérifier la taille du fichier
        if output_path.exists():
            size = output_path.stat().st_size
            print(f"   Taille: {size:,} bytes ({size/1024:.1f} KB)")
        else:
            print(f"   ❌ Fichier non créé!")

    except subprocess.CalledProcessError as e:
        print(f"❌ Erreur: {e}")
        if e.stdout:
            print(f"stdout: {e.stdout}")
        if e.stderr:
            print(f"stderr: {e.stderr}")
    finally:
        # Nettoyer le fichier temporaire
        if os.path.exists(tmp_path):
            os.remove(tmp_path)
            print(f"   🗑️  Fichier temporaire supprimé")

print("\n" + "="*60)
print("Téléchargement terminé!")
print("="*60)
