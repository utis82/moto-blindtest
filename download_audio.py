#!/usr/bin/env python3
"""
Script pour télécharger les extraits audio depuis YouTube
"""
import json
import subprocess
from pathlib import Path

CATALOG_PATH = Path("app/services/catalog.data.json")
OUTPUT_DIR = Path("app/frontend/public/sounds")

def download_audio_clip(video_id, start_seconds, end_seconds, output_filename):
    """Télécharge un extrait audio depuis YouTube"""
    url = f"https://www.youtube.com/watch?v={video_id}"
    output_path = OUTPUT_DIR / output_filename

    # Calculer la durée
    duration = end_seconds - start_seconds

    print(f"📥 Téléchargement de {video_id} ({start_seconds}s -> {end_seconds}s)...")

    # Commande yt-dlp pour télécharger uniquement l'audio
    cmd = [
        "yt-dlp",
        "-f", "bestaudio",
        "--extract-audio",
        "--audio-format", "mp3",
        "--audio-quality", "0",  # Meilleure qualité
        "--postprocessor-args", f"-ss {start_seconds} -t {duration}",
        "-o", str(output_path.with_suffix('.%(ext)s')),
        url
    ]

    try:
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=60)
        if result.returncode == 0:
            print(f"✅ Téléchargé: {output_filename}")
            return True
        else:
            print(f"❌ Erreur: {result.stderr[:100]}")
            return False
    except Exception as e:
        print(f"❌ Exception: {str(e)[:100]}")
        return False

def main():
    print("🎵 Téléchargement des extraits audio...\n")

    # Créer le dossier si nécessaire
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    # Charger le catalogue
    with open(CATALOG_PATH, 'r', encoding='utf-8') as f:
        catalog = json.load(f)

    success_count = 0

    for i, entry in enumerate(catalog, 1):
        video_id = entry['videoId']
        start = entry['startSeconds']
        end = entry['endSeconds']
        manufacturer = entry['fallback']['manufacturer']
        model = entry['fallback']['model']

        # Générer un nom de fichier propre
        filename = f"{manufacturer.lower().replace(' ', '-')}_{model.lower().replace(' ', '-')}_{video_id}.mp3"

        print(f"[{i}/{len(catalog)}] {manufacturer} {model}")

        if download_audio_clip(video_id, start, end, filename):
            success_count += 1
            # Mettre à jour l'entrée avec le nom du fichier local
            entry['audioFile'] = f"/sounds/{filename}"

        print()

    print(f"✨ Téléchargements terminés: {success_count}/{len(catalog)}")

    # Sauvegarder le catalogue mis à jour
    with open(CATALOG_PATH, 'w', encoding='utf-8') as f:
        json.dump(catalog, f, indent=2, ensure_ascii=False)

    print(f"✅ Catalogue mis à jour avec les chemins audio locaux")

if __name__ == "__main__":
    main()
