#!/usr/bin/env python3
"""
Cherche des vidéos "pure sound" sur YouTube pour différentes motos.
"""
import subprocess
import json

# Liste de motos populaires à chercher
motos = [
    "Kawasaki H2",
    "BMW S1000RR",
    "Yamaha MT-09",
    "KTM 1290 Super Duke R",
    "Aprilia RS 660",
    "Suzuki GSX-R1000",
    "Honda CBR1000RR Fireblade",
    "MV Agusta F4",
    "Triumph Street Triple",
    "Kawasaki ZX-10R",
    "Indian Scout",
    "Honda Africa Twin",
    "BMW R nineT",
    "Ducati Monster",
    "Kawasaki Z900",
    "Suzuki Hayabusa",
    "Yamaha Ténéré 700",
    "KTM 890 Duke",
    "Aprilia Tuono V4",
    "Royal Enfield Interceptor 650"
]

results = []

for moto in motos:
    print(f"\n🔍 Recherche: {moto}")
    search_query = f'ytsearch3:{moto} pure sound exhaust'

    try:
        cmd = [
            '/usr/local/bin/yt-dlp',
            '--print', '%(id)s|%(duration)s|%(title)s',
            search_query
        ]
        output = subprocess.run(cmd, capture_output=True, text=True, check=True, timeout=10)

        videos = output.stdout.strip().split('\n')
        if videos and videos[0]:
            # Prendre la première vidéo (généralement la meilleure)
            video_id, duration, title = videos[0].split('|', 2)
            duration_sec = int(duration)

            # Choisir un extrait de 15s au milieu de la vidéo
            start = max(5, duration_sec // 3)
            end = min(start + 15, duration_sec - 5)

            print(f"  ✅ {video_id}: {title[:50]}... ({duration_sec}s)")
            print(f"     Extrait: {start}s-{end}s")

            results.append({
                'videoId': video_id,
                'url': f'https://www.youtube.com/watch?v={video_id}',
                'title': title,
                'duration': duration_sec,
                'startSeconds': start,
                'endSeconds': end,
                'moto': moto
            })
        else:
            print(f"  ❌ Aucune vidéo trouvée")

    except Exception as e:
        print(f"  ❌ Erreur: {e}")
        continue

print(f"\n\n{'='*60}")
print(f"✅ {len(results)}/{len(motos)} vidéos trouvées")
print('='*60)

# Sauvegarder les résultats
with open('found_videos.json', 'w') as f:
    json.dump(results, f, indent=2)

print("\n💾 Résultats sauvegardés dans found_videos.json")
