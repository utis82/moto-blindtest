#!/usr/bin/env python3
"""
Script automatique pour nettoyer le catalogue (sans interaction)
"""
import json
import urllib.request
import urllib.error
from pathlib import Path

CATALOG_PATH = Path("app/services/catalog.data.json")

def check_embeddable(video_id):
    oembed_url = f"https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v={video_id}&format=json"
    try:
        with urllib.request.urlopen(oembed_url, timeout=10) as response:
            data = json.loads(response.read())
            title = data.get('title', 'Unknown')
            return True, title
    except urllib.error.HTTPError as e:
        if e.code == 401:
            return False, "Not embeddable"
        elif e.code == 404:
            return False, "Not found"
        else:
            return False, f"HTTP {e.code}"
    except Exception as e:
        return False, str(e)

def main():
    print("🔍 Nettoyage automatique du catalogue...\n")

    with open(CATALOG_PATH, 'r', encoding='utf-8') as f:
        catalog = json.load(f)

    embeddable = []

    for entry in catalog:
        video_id = entry.get('videoId')
        manufacturer = entry.get('fallback', {}).get('manufacturer', 'Unknown')
        model = entry.get('fallback', {}).get('model', 'Unknown')

        is_embeddable, info = check_embeddable(video_id)

        if is_embeddable:
            print(f"✅ {manufacturer} {model}")
            embeddable.append(entry)
        else:
            print(f"❌ {manufacturer} {model} - {info}")

    print(f"\n📊 {len(embeddable)}/{len(catalog)} vidéos embedables")

    # Sauvegarde automatique
    backup_path = CATALOG_PATH.with_suffix('.json.backup')
    with open(backup_path, 'w', encoding='utf-8') as f:
        json.dump(catalog, f, indent=2, ensure_ascii=False)
    print(f"💾 Backup: {backup_path}")

    with open(CATALOG_PATH, 'w', encoding='utf-8') as f:
        json.dump(embeddable, f, indent=2, ensure_ascii=False)
    print(f"✅ Catalogue mis à jour: {len(embeddable)} vidéos")

if __name__ == "__main__":
    main()
