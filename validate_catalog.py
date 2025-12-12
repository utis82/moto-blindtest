#!/usr/bin/env python3
"""
Script pour valider et nettoyer le catalogue de vidéos YouTube
"""
import json
import urllib.request
import time
from pathlib import Path

CATALOG_PATH = Path("app/services/catalog.data.json")

def check_video_availability(video_id):
    """Vérifie si une vidéo YouTube est disponible via oEmbed"""
    url = f"https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v={video_id}&format=json"
    try:
        with urllib.request.urlopen(url, timeout=5) as response:
            data = json.loads(response.read())
            return True, data.get('title', 'Sans titre')
    except Exception as e:
        return False, str(e)

def validate_catalog():
    """Valide toutes les vidéos du catalogue"""
    print("🔍 Validation du catalogue de vidéos YouTube...\n")

    with open(CATALOG_PATH, 'r', encoding='utf-8') as f:
        catalog = json.load(f)

    valid_entries = []
    invalid_entries = []

    for i, entry in enumerate(catalog, 1):
        video_id = entry.get('videoId')
        print(f"[{i}/{len(catalog)}] Test de {video_id}...", end=' ')

        is_valid, info = check_video_availability(video_id)

        if is_valid:
            print(f"✅ {info[:50]}")
            valid_entries.append(entry)
        else:
            print(f"❌ INDISPONIBLE")
            invalid_entries.append({
                'videoId': video_id,
                'url': entry.get('url'),
                'reason': info
            })

        # Respecter les limites de rate limit YouTube
        time.sleep(0.5)

    print(f"\n📊 Résultats:")
    print(f"   ✅ Vidéos valides: {len(valid_entries)}/{len(catalog)}")
    print(f"   ❌ Vidéos invalides: {len(invalid_entries)}/{len(catalog)}")

    if invalid_entries:
        print(f"\n❌ Vidéos à retirer:")
        for inv in invalid_entries:
            print(f"   - {inv['videoId']}: {inv['url']}")

    # Sauvegarder le catalogue nettoyé
    if invalid_entries:
        backup_path = CATALOG_PATH.with_suffix('.json.backup')
        print(f"\n💾 Sauvegarde de l'ancien catalogue: {backup_path}")
        with open(backup_path, 'w', encoding='utf-8') as f:
            json.dump(catalog, f, indent=2, ensure_ascii=False)

        print(f"💾 Sauvegarde du nouveau catalogue: {CATALOG_PATH}")
        with open(CATALOG_PATH, 'w', encoding='utf-8') as f:
            json.dump(valid_entries, f, indent=2, ensure_ascii=False)

    return valid_entries, invalid_entries

if __name__ == "__main__":
    validate_catalog()
