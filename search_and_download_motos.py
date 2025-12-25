#!/usr/bin/env python3
"""
Recherche et télécharge les sons de motos depuis YouTube.
1. Recherche "MOTO NAME pure sound" sur YouTube
2. Prend la première vidéo
3. Télécharge et extrait un extrait audio
"""
import subprocess
import json
from pathlib import Path
import os
import re

# Liste des 14 nouvelles motos
NEW_MOTOS = [
    {"manufacturer": "Ducati", "model": "Diavel V4", "engine": "V4 Granturismo", "cylinders": "4", "year": "2023", "funFact": "Le Diavel V4 combine muscle cruiser et sportive avec 168 ch."},
    {"manufacturer": "Honda", "model": "CB1000R", "engine": "Inline-4", "cylinders": "4", "year": "2021", "funFact": "Le CB1000R fait partie de la série Neo Sports Café au design épuré."},
    {"manufacturer": "Kawasaki", "model": "ZH2", "engine": "Supercharged Inline-4", "cylinders": "4", "year": "2020", "funFact": "La ZH2 est un hypernaked avec compresseur volumétrique de 200 ch."},
    {"manufacturer": "Yamaha", "model": "FZ-09", "engine": "CP3 Triple", "cylinders": "3", "year": "2017", "funFact": "Le FZ-09 est la version américaine de la MT-09."},
    {"manufacturer": "BMW", "model": "M 1000 RR", "engine": "Inline-4", "cylinders": "4", "year": "2021", "funFact": "Première moto M de BMW, inspirée de la M GmbH automobile."},
    {"manufacturer": "Triumph", "model": "Speed Triple 1200 RS", "engine": "Triple 1160", "cylinders": "3", "year": "2021", "funFact": "La Speed Triple est considérée comme l'inventeur du segment naked sportif."},
    {"manufacturer": "KTM", "model": "RC 390", "engine": "Single Cylinder", "cylinders": "1", "year": "2022", "funFact": "La RC 390 est une sportive accessible avec un monocylindre de 373cc."},
    {"manufacturer": "Suzuki", "model": "V-Strom 1050", "engine": "V-Twin", "cylinders": "2", "year": "2020", "funFact": "La V-Strom 1050 est une trail routière confortable pour les grands voyages."},
    {"manufacturer": "Aprilia", "model": "Shiver 900", "engine": "V-Twin", "cylinders": "2", "year": "2018", "funFact": "Le Shiver 900 est un roadster équilibré avec un V-twin de 896cc."},
    {"manufacturer": "Honda", "model": "NC750X", "engine": "Parallel Twin", "cylinders": "2", "year": "2021", "funFact": "Le NC750X a un compartiment de rangement à la place du réservoir."},
    {"manufacturer": "Kawasaki", "model": "Vulcan S", "engine": "Parallel Twin", "cylinders": "2", "year": "2020", "funFact": "Le Vulcan S est un cruiser avec le moteur de la Ninja 650."},
    {"manufacturer": "Yamaha", "model": "VMAX", "engine": "V4", "cylinders": "4", "year": "2017", "funFact": "Le VMAX est un power cruiser avec un V4 de 1679cc et 200 ch."},
    {"manufacturer": "Moto Guzzi", "model": "V85 TT", "engine": "V-Twin", "cylinders": "2", "year": "2019", "funFact": "Moto Guzzi est célèbre pour ses V-twin longitudinaux depuis 1967."},
    {"manufacturer": "Benelli", "model": "TRK 502", "engine": "Parallel Twin", "cylinders": "2", "year": "2020", "funFact": "Le TRK 502 est une trail abordable avec un excellent rapport qualité-prix."},
]

output_dir = Path('app/backend/public/sounds')
output_dir.mkdir(parents=True, exist_ok=True)

success_count = 0
failed_count = 0
results = []

for moto in NEW_MOTOS:
    manufacturer = moto['manufacturer']
    model = moto['model']

    # Créer le nom du fichier
    filename = f"{manufacturer.lower().replace(' ', '-')}-{model.lower().replace(' ', '-')}.mp3"
    output_path = output_dir / filename

    print(f"\n{'='*60}")
    print(f"🔍 Recherche: {manufacturer} {model}")
    print('='*60)

    # Vérifier si le fichier existe déjà
    if output_path.exists():
        print(f"   ⏭️  Fichier existe déjà: {filename}")
        moto['audioFile'] = f"/sounds/{filename}"
        moto['videoId'] = "existing"
        moto['youtubeUrl'] = "existing"
        moto['startSeconds'] = 0
        moto['endSeconds'] = 15
        results.append(moto)
        success_count += 1
        continue

    try:
        # Rechercher sur YouTube
        search_query = f"{manufacturer} {model} pure sound"
        print(f"   🔎 Requête: '{search_query}'")

        cmd = [
            '/usr/local/bin/yt-dlp',
            '--extractor-args', 'youtube:player_client=android',
            '--get-id',
            '--get-title',
            '--get-duration',
            f'ytsearch1:{search_query}'
        ]
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=30)

        if result.returncode != 0:
            print(f"   ❌ Échec recherche: {result.stderr[:200]}")
            failed_count += 1
            continue

        lines = result.stdout.strip().split('\n')
        if len(lines) < 3:
            print(f"   ❌ Pas de résultats")
            failed_count += 1
            continue

        video_title = lines[0]
        video_id = lines[1]
        duration_str = lines[2]
        video_url = f"https://www.youtube.com/watch?v={video_id}"

        print(f"   ✅ Trouvé: {video_title}")
        print(f"   📺 ID: {video_id}")
        print(f"   ⏱️  Durée: {duration_str}")

        # Déterminer l'extrait (prendre du milieu de la vidéo)
        # Convertir durée HH:MM:SS ou MM:SS en secondes
        duration_parts = duration_str.split(':')
        if len(duration_parts) == 3:
            total_seconds = int(duration_parts[0]) * 3600 + int(duration_parts[1]) * 60 + int(duration_parts[2])
        else:
            total_seconds = int(duration_parts[0]) * 60 + int(duration_parts[1])

        # Prendre 15 secondes au milieu
        start = max(10, (total_seconds // 2) - 7)
        end = start + 15

        print(f"   ✂️  Extrait: {start}s → {end}s")

        tmp_video = f'/tmp/moto_{video_id}.mp4'

        # Télécharger vidéo complète
        print("   ⬇️  Téléchargement...")
        cmd = [
            '/usr/local/bin/yt-dlp',
            '--extractor-args', 'youtube:player_client=android',
            '-f', 'bestaudio[ext=m4a]/best',
            '-o', tmp_video,
            video_url
        ]
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=120)

        if result.returncode != 0:
            print(f"   ❌ Échec téléchargement: {result.stderr[:200]}")
            failed_count += 1
            continue

        print(f"   ✅ Téléchargé")

        # Extraire l'audio et couper
        print(f"   🎵 Extraction audio...")
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
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=60)

        if result.returncode != 0:
            print(f"   ❌ Échec extraction: {result.stderr[:200]}")
            failed_count += 1
            if os.path.exists(tmp_video):
                os.remove(tmp_video)
            continue

        size = output_path.stat().st_size
        print(f"   ✅ MP3 créé: {size/1024:.1f} KB - {filename}")

        # Sauvegarder les infos
        moto['audioFile'] = f"/sounds/{filename}"
        moto['videoId'] = video_id
        moto['youtubeUrl'] = video_url
        moto['startSeconds'] = start
        moto['endSeconds'] = end
        results.append(moto)

        success_count += 1

        # Nettoyer
        if os.path.exists(tmp_video):
            os.remove(tmp_video)

    except subprocess.TimeoutExpired:
        print(f"   ❌ Timeout dépassé")
        failed_count += 1
    except Exception as e:
        print(f"   ❌ Erreur: {e}")
        failed_count += 1

# Sauvegarder les résultats
output_json = Path('app/backend/src/downloaded_motos.json')
with open(output_json, 'w', encoding='utf-8') as f:
    json.dump(results, f, indent=2, ensure_ascii=False)

print("\n" + "="*60)
print("📊 RÉSUMÉ")
print("="*60)
print(f"✅ Succès: {success_count}/{len(NEW_MOTOS)}")
print(f"❌ Échecs: {failed_count}/{len(NEW_MOTOS)}")
print(f"📁 Fichiers audio: {output_dir}")
print(f"📝 Métadonnées: {output_json}")
print("="*60)

if success_count > 0:
    print(f"\n💡 Pour ajouter ces motos à la base de données, modifie le fichier:")
    print(f"   app/backend/src/add_motos_to_db.ts")
    print(f"   pour utiliser downloaded_motos.json")
