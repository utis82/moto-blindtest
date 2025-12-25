#!/usr/bin/env python3
"""
Télécharge les extraits audio réels depuis YouTube pour les 3 motos du catalogue.
Version 3: Télécharge en webm, puis convertit avec ffmpeg.
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

    # Fichiers temporaires
    tmp_full = f'/tmp/moto_{entry["videoId"]}_full.webm'

    try:
        # Étape 1: Télécharger l'audio complet en webm (pas de conversion)
        print("Étape 1: Téléchargement de l'audio complet...")
        cmd_download = [
            '/usr/local/bin/yt-dlp',
            '-f', 'ba',  # Meilleur audio
            '-o', tmp_full,
            url
        ]
        subprocess.run(cmd_download, check=True, capture_output=True)
        print(f"   ✅ Audio complet téléchargé: {tmp_full}")

        # Étape 2: Extraire la partie souhaitée et convertir en MP3 avec ffmpeg
        print(f"Étape 2: Extraction de {start}s à {end}s et conversion en MP3...")
        cmd_extract = [
            'ffmpeg',
            '-y',  # Overwrite
            '-i', tmp_full,
            '-ss', str(start),
            '-to', str(end),
            '-acodec', 'libmp3lame',
            '-b:a', '128k',
            str(output_path)
        ]
        result = subprocess.run(cmd_extract, check=True, capture_output=True, text=True)
        print(f"   ✅ Extrait créé en MP3!")

        # Vérifier la taille du fichier
        if output_path.exists():
            size = output_path.stat().st_size
            print(f"   Taille: {size:,} bytes ({size/1024:.1f} KB)")
        else:
            print(f"   ❌ Fichier non créé!")

    except subprocess.CalledProcessError as e:
        print(f"❌ Erreur: {e}")
        if hasattr(e, 'stdout') and e.stdout:
            print(f"stdout: {e.stdout[:500]}")
        if hasattr(e, 'stderr') and e.stderr:
            print(f"stderr: {e.stderr[:500]}")
    finally:
        # Nettoyer le fichier temporaire
        if os.path.exists(tmp_full):
            os.remove(tmp_full)
            print(f"   🗑️  Fichier temporaire supprimé")

print("\n" + "="*60)
print("Téléchargement terminé!")
print("="*60)
