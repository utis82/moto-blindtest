#!/usr/bin/env python3
"""
Télécharge 14 nouveaux sons de motos depuis YouTube.
Méthode: Télécharger vidéo complète, extraire audio, puis couper avec ffmpeg.
"""
import subprocess
import json
from pathlib import Path
import os

# Lire le fichier JSON des nouvelles motos
with open('app/backend/src/add_14_motos_with_audio.json', 'r', encoding='utf-8') as f:
    motos = json.load(f)

output_dir = Path('app/backend/public/sounds')
output_dir.mkdir(parents=True, exist_ok=True)

success_count = 0
failed_count = 0

for entry in motos:
    manufacturer = entry['manufacturer']
    model = entry['model']
    url = entry['youtubeUrl']
    video_id = entry['videoId']
    start = entry['startSeconds']
    end = entry['endSeconds']

    # Créer le nom du fichier
    filename = f"{manufacturer.lower().replace(' ', '-')}-{model.lower().replace(' ', '-')}.mp3"
    output_path = output_dir / filename
    tmp_video = f'/tmp/moto_{video_id}.mp4'

    print(f"\n{'='*60}")
    print(f"Téléchargement: {manufacturer} {model}")
    print(f"URL: {url}")
    print(f"Extrait: {start}s → {end}s")
    print('='*60)

    # Vérifier si le fichier existe déjà
    if output_path.exists():
        print(f"   ⏭️  Fichier existe déjà: {filename}")
        success_count += 1
        continue

    try:
        # Étape 1: Télécharger vidéo complète
        print("Étape 1: Téléchargement vidéo complète...")
        cmd = [
            '/usr/local/bin/yt-dlp',
            '--extractor-args', 'youtube:player_client=android',
            '-f', 'bestvideo[ext=mp4]+bestaudio[ext=m4a]/best',
            '--merge-output-format', 'mp4',
            '-o', tmp_video,
            url
        ]
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=120)

        if result.returncode != 0:
            print(f"   ❌ Échec téléchargement: {result.stderr[:200]}")
            failed_count += 1
            continue

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
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=60)

        if result.returncode != 0:
            print(f"   ❌ Échec extraction: {result.stderr[:200]}")
            failed_count += 1
            continue

        size = output_path.stat().st_size
        print(f"   ✅ MP3 créé: {size/1024:.1f} KB - {filename}")
        success_count += 1

    except subprocess.TimeoutExpired:
        print(f"   ❌ Timeout dépassé")
        failed_count += 1
    except Exception as e:
        print(f"   ❌ Erreur: {e}")
        failed_count += 1
    finally:
        if os.path.exists(tmp_video):
            os.remove(tmp_video)
            print(f"   🗑️  Fichier temporaire supprimé")

print("\n" + "="*60)
print("📊 RÉSUMÉ")
print("="*60)
print(f"✅ Succès: {success_count}/{len(motos)}")
print(f"❌ Échecs: {failed_count}/{len(motos)}")
print(f"📁 Fichiers dans: {output_dir}")
print("="*60)
