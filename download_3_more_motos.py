#!/usr/bin/env python3
"""
Recherche et télécharge les sons de 3 nouvelles motos depuis YouTube.
"""
import subprocess
import json
from pathlib import Path
import os

# Liste des 3 nouvelles motos
NEW_MOTOS = [
    {"manufacturer": "Harley-Davidson", "model": "Street Bob", "engine": "Milwaukee-Eight V-Twin", "cylinders": "2", "year": "2021", "funFact": "Le Street Bob est un bobber minimaliste avec le moteur Milwaukee-Eight de 107ci."},
    {"manufacturer": "Yamaha", "model": "Ténéré 700", "engine": "CP2 Parallel Twin", "cylinders": "2", "year": "2020", "funFact": "La Ténéré 700 est une trail légère inspirée des rallye-raids."},
    {"manufacturer": "BMW", "model": "R nineT", "engine": "Boxer Twin", "cylinders": "2", "year": "2021", "funFact": "La R nineT célèbre l'héritage BMW avec un flat-twin refroidi par air."},
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
output_json = Path('app/backend/src/add_3_more_motos.json')
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
