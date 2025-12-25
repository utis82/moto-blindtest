#!/usr/bin/env python3
"""
Script pour vérifier si les vidéos YouTube sont VRAIMENT embedables
en utilisant l'API YouTube Data v3
"""
import json
import urllib.request
import urllib.error
from pathlib import Path

CATALOG_PATH = Path("app/services/catalog.data.json")

def check_embeddable(video_id):
    """
    Vérifie si une vidéo est embedable en testant l'oEmbed endpoint
    Si ça échoue, la vidéo n'est probablement pas embedable
    """
    oembed_url = f"https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v={video_id}&format=json"

    try:
        with urllib.request.urlopen(oembed_url, timeout=10) as response:
            data = json.loads(response.read())
            title = data.get('title', 'Unknown')
            return True, title
    except urllib.error.HTTPError as e:
        if e.code == 401:
            return False, "Video restricted (not embeddable)"
        elif e.code == 404:
            return False, "Video not found"
        else:
            return False, f"HTTP Error {e.code}"
    except Exception as e:
        return False, str(e)

def main():
    print("🔍 Vérification de l'embedabilité des vidéos...\n")

    with open(CATALOG_PATH, 'r', encoding='utf-8') as f:
        catalog = json.load(f)

    embeddable = []
    not_embeddable = []

    for i, entry in enumerate(catalog, 1):
        video_id = entry.get('videoId')
        manufacturer = entry.get('fallback', {}).get('manufacturer', 'Unknown')
        model = entry.get('fallback', {}).get('model', 'Unknown')

        print(f"[{i}/{len(catalog)}] {manufacturer} {model} ({video_id})...", end=' ')

        is_embeddable, info = check_embeddable(video_id)

        if is_embeddable:
            print(f"✅ Embedable")
            embeddable.append(entry)
        else:
            print(f"❌ NON embedable - {info}")
            not_embeddable.append({
                'videoId': video_id,
                'manufacturer': manufacturer,
                'model': model,
                'url': entry.get('url'),
                'reason': info
            })

    print(f"\n📊 RÉSULTATS:")
    print(f"   ✅ Embedables: {len(embeddable)}/{len(catalog)}")
    print(f"   ❌ NON embedables: {len(not_embeddable)}/{len(catalog)}")

    if not_embeddable:
        print(f"\n⚠️  VIDÉOS À SUPPRIMER DU CATALOGUE:")
        for vid in not_embeddable:
            print(f"   - {vid['manufacturer']} {vid['model']} ({vid['videoId']})")
            print(f"     Raison: {vid['reason']}")
            print(f"     URL: {vid['url']}")

    # Sauvegarder le catalogue nettoyé
    if not_embeddable:
        choice = input("\n❓ Voulez-vous nettoyer le catalogue automatiquement? (y/n): ")
        if choice.lower() == 'y':
            backup_path = CATALOG_PATH.with_suffix('.json.backup')
            print(f"\n💾 Backup: {backup_path}")
            with open(backup_path, 'w', encoding='utf-8') as f:
                json.dump(catalog, f, indent=2, ensure_ascii=False)

            print(f"✅ Nouveau catalogue: {CATALOG_PATH}")
            with open(CATALOG_PATH, 'w', encoding='utf-8') as f:
                json.dump(embeddable, f, indent=2, ensure_ascii=False)

            print(f"\n✨ Catalogue nettoyé ! {len(embeddable)} vidéos restantes.")
        else:
            print("\n⏭️  Nettoyage annulé.")
    else:
        print("\n🎉 Toutes les vidéos sont embedables !")

if __name__ == "__main__":
    main()
