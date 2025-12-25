#!/usr/bin/env python3
"""
Script pour trouver des vidéos YouTube embedables de motos
"""
import json
import urllib.request
import urllib.error

# Liste de vidéos candidates (chaînes qui autorisent généralement l'embed)
CANDIDATES = [
    # Ducati Official
    {"id": "bD7R7E8yW_o", "manufacturer": "Ducati", "model": "Panigale V4", "engine": "V4", "cylinders": "4", "year": "2020", "start": 10, "end": 25},
    {"id": "RR3QuCNT0MI", "manufacturer": "Ducati", "model": "Monster 1200", "engine": "L-Twin", "cylinders": "2", "year": "2019", "start": 15, "end": 30},

    # Yamaha Official
    {"id": "8XhbCdVxKbM", "manufacturer": "Yamaha", "model": "MT-10", "engine": "Crossplane Inline-4", "cylinders": "4", "year": "2019", "start": 20, "end": 35},
    {"id": "XKfgdkcIUxw", "manufacturer": "Yamaha", "model": "R6", "engine": "Inline-4", "cylinders": "4", "year": "2020", "start": 12, "end": 27},

    # Kawasaki Official
    {"id": "jZyp5SBD-dU", "manufacturer": "Kawasaki", "model": "Ninja ZX-10R", "engine": "Inline-4", "cylinders": "4", "year": "2021", "start": 18, "end": 33},
    {"id": "Hzz1kQyC5dU", "manufacturer": "Kawasaki", "model": "Z900", "engine": "Inline-4", "cylinders": "4", "year": "2020", "start": 10, "end": 25},

    # Honda Official
    {"id": "fWPcrVTwt5I", "manufacturer": "Honda", "model": "CBR650R", "engine": "Inline-4", "cylinders": "4", "year": "2021", "start": 15, "end": 30},
    {"id": "Hq4JW3I2-Qk", "manufacturer": "Honda", "model": "Africa Twin", "engine": "Parallel Twin", "cylinders": "2", "year": "2020", "start": 20, "end": 35},

    # BMW Motorrad Official
    {"id": "mBPXTkfGlE0", "manufacturer": "BMW", "model": "M1000RR", "engine": "Inline-4", "cylinders": "4", "year": "2021", "start": 10, "end": 25},
    {"id": "KlDTBGq-7Oc", "manufacturer": "BMW", "model": "R1250GS", "engine": "Boxer Twin", "cylinders": "2", "year": "2019", "start": 12, "end": 27},

    # KTM Official
    {"id": "yQ1msfmHxQw", "manufacturer": "KTM", "model": "RC 390", "engine": "Single", "cylinders": "1", "year": "2020", "start": 8, "end": 23},
    {"id": "lmfZX8DRthU", "manufacturer": "KTM", "model": "Duke 890", "engine": "Parallel Twin", "cylinders": "2", "year": "2021", "start": 15, "end": 30},

    # Triumph Official
    {"id": "oF7wXMdTdwI", "manufacturer": "Triumph", "model": "Street Triple", "engine": "Triple", "cylinders": "3", "year": "2020", "start": 10, "end": 25},
    {"id": "4_2tB42eZTY", "manufacturer": "Triumph", "model": "Daytona 675", "engine": "Triple", "cylinders": "3", "year": "2016", "start": 12, "end": 27},

    # Suzuki Official
    {"id": "VuX3SYLLblk", "manufacturer": "Suzuki", "model": "Hayabusa", "engine": "Inline-4", "cylinders": "4", "year": "2021", "start": 15, "end": 30},
    {"id": "rPUPl_87YaE", "manufacturer": "Suzuki", "model": "GSX-R750", "engine": "Inline-4", "cylinders": "4", "year": "2019", "start": 10, "end": 25},

    # Aprilia Official
    {"id": "7LtjzQaFEC4", "manufacturer": "Aprilia", "model": "RSV4", "engine": "V4", "cylinders": "4", "year": "2020", "start": 18, "end": 33},
    {"id": "XBtmWTbQv5E", "manufacturer": "Aprilia", "model": "Tuono V4", "engine": "V4", "cylinders": "4", "year": "2019", "start": 12, "end": 27},

    # MV Agusta Official
    {"id": "BVLhH4NaC4Y", "manufacturer": "MV Agusta", "model": "F4", "engine": "Inline-4", "cylinders": "4", "year": "2019", "start": 10, "end": 25},

    # Harley-Davidson Official
    {"id": "jfV704Jf_wY", "manufacturer": "Harley-Davidson", "model": "Fat Bob", "engine": "Milwaukee-Eight V-Twin", "cylinders": "2", "year": "2020", "start": 15, "end": 30},
    {"id": "OjQhZiSQ9bQ", "manufacturer": "Harley-Davidson", "model": "Street Glide", "engine": "Milwaukee-Eight V-Twin", "cylinders": "2", "year": "2021", "start": 20, "end": 35},
]

def check_embeddable(video_id):
    """Vérifie si une vidéo est embedable"""
    oembed_url = f"https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v={video_id}&format=json"
    try:
        with urllib.request.urlopen(oembed_url, timeout=10) as response:
            data = json.loads(response.read())
            title = data.get('title', 'Unknown')
            return True, title
    except Exception:
        return False, None

def main():
    print("🔍 Recherche de vidéos embedables...\n")

    embeddable = []

    for candidate in CANDIDATES:
        video_id = candidate['id']
        manufacturer = candidate['manufacturer']
        model = candidate['model']

        print(f"Testing {manufacturer} {model} ({video_id})...", end=' ')

        is_embeddable, title = check_embeddable(video_id)

        if is_embeddable:
            print(f"✅ {title[:40]}")

            entry = {
                "url": f"https://www.youtube.com/watch?v={video_id}",
                "videoId": video_id,
                "startSeconds": candidate['start'],
                "endSeconds": candidate['end'],
                "verified": True,
                "meta": {
                    "title": title,
                    "channel": "Official",
                    "thumbnailUrl": f"https://img.youtube.com/vi/{video_id}/hqdefault.jpg"
                },
                "fallback": {
                    "manufacturer": manufacturer,
                    "model": model,
                    "engine": candidate['engine'],
                    "cylinders": str(candidate['cylinders']),
                    "year": str(candidate['year']),
                    "funFact": f"{manufacturer} {model} - {candidate['engine']} engine"
                }
            }
            embeddable.append(entry)
        else:
            print(f"❌")

    print(f"\n📊 Trouvées: {len(embeddable)}/{len(CANDIDATES)} vidéos embedables")

    if embeddable:
        # Sauvegarder dans un nouveau fichier
        output_file = "new_embeddable_videos.json"
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(embeddable, f, indent=2, ensure_ascii=False)
        print(f"\n✅ Vidéos sauvegardées dans: {output_file}")
        print(f"\nPour les ajouter au catalogue:")
        print(f"  python3 -c 'import json; c=json.load(open(\"app/services/catalog.data.json\")); n=json.load(open(\"{output_file}\")); c.extend(n); json.dump(c, open(\"app/services/catalog.data.json\", \"w\"), indent=2)'")

if __name__ == "__main__":
    main()
