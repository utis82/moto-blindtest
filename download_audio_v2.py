#!/usr/bin/env python3
"""
Script pour télécharger les extraits audio depuis YouTube
Version 2: Télécharge puis découpe avec ffmpeg
"""
import json
import subprocess
import os
from pathlib import Path

CATALOG_PATH = Path("app/services/catalog.data.json")
OUTPUT_DIR = Path("app/frontend/public/sounds")
TEMP_DIR = Path("/tmp/moto_audio")

def download_and_clip(video_id, start_seconds, end_seconds, output_filename):
    """Télécharge la vidéo complète puis découpe l'extrait audio"""
    url = f"https://www.youtube.com/watch?v={video_id}"

    # Créer le dossier temporaire
    TEMP_DIR.mkdir(parents=True, exist_ok=True)

    temp_audio = TEMP_DIR / f"{video_id}.%(ext)s"
    final_output = OUTPUT_DIR / output_filename

    print(f"📥 Téléchargement de {video_id}...")

    # Étape 1: Télécharger l'audio complet
    cmd_download = [
        "yt-dlp",
        "-f", "bestaudio",
        "--extract-audio",
        "--audio-format", "mp3",
        "-o", str(temp_audio),
        url
    ]

    try:
        result = subprocess.run(cmd_download, capture_output=True, text=True, timeout=120)
        if result.returncode != 0:
            print(f"❌ Échec téléchargement: {result.stderr[:100]}")
            return False

        # Trouver le fichier téléchargé
        downloaded_file = None
        for f in TEMP_DIR.glob(f"{video_id}.*"):
            downloaded_file = f
            break

        if not downloaded_file:
            print(f"❌ Fichier audio introuvable")
            return False

        print(f"✂️  Découpage de l'extrait ({start_seconds}s -> {end_seconds}s)...")

        # Étape 2: Découper l'extrait avec ffmpeg
        duration = end_seconds - start_seconds
        cmd_cut = [
            "ffmpeg",
            "-i", str(downloaded_file),
            "-ss", str(start_seconds),
            "-t", str(duration),
            "-acodec", "libmp3lame",
            "-ab", "192k",
            "-y",  # Overwrite
            str(final_output)
        ]

        result = subprocess.run(cmd_cut, capture_output=True, text=True, timeout=60)
        if result.returncode != 0:
            print(f"❌ Échec découpage: {result.stderr[:100]}")
            return False

        # Nettoyer le fichier temporaire
        downloaded_file.unlink()

        print(f"✅ Créé: {output_filename}")
        return True

    except Exception as e:
        print(f"❌ Exception: {str(e)[:100]}")
        return False

def main():
    print("🎵 Téléchargement et découpage des extraits audio...\n")

    # Vérifier que ffmpeg est installé
    try:
        subprocess.run(["ffmpeg", "-version"], capture_output=True, check=True)
    except:
        print("❌ ffmpeg n'est pas installé. Installation...")
        print("   Exécute: sudo apt install ffmpeg")
        return

    # Créer le dossier de sortie
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
        filename = f"{manufacturer.lower().replace(' ', '-')}_{model.lower().replace(' ', '-')}.mp3"

        print(f"[{i}/{len(catalog)}] {manufacturer} {model}")

        if download_and_clip(video_id, start, end, filename):
            success_count += 1
            # Mettre à jour l'entrée avec le nom du fichier local
            entry['audioFile'] = f"/sounds/{filename}"

        print()

    print(f"✨ Terminé: {success_count}/{len(catalog)} extraits créés")

    # Sauvegarder le catalogue mis à jour
    with open(CATALOG_PATH, 'w', encoding='utf-8') as f:
        json.dump(catalog, f, indent=2, ensure_ascii=False)

    print(f"✅ Catalogue mis à jour")

    # Lister les fichiers créés
    print(f"\n📂 Fichiers audio:")
    for audio_file in sorted(OUTPUT_DIR.glob("*.mp3")):
        size_mb = audio_file.stat().st_size / 1024 / 1024
        print(f"   - {audio_file.name} ({size_mb:.2f} MB)")

if __name__ == "__main__":
    main()
