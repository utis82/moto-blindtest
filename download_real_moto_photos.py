#!/usr/bin/env python3
"""
Télécharge de vraies photos de motos depuis DuckDuckGo Images.
DuckDuckGo ne nécessite pas d'API key et fonctionne bien.
"""
import subprocess
import json
from pathlib import Path
import urllib.request
import urllib.parse
import time
import re

output_dir = Path('app/backend/public/images')
output_dir.mkdir(parents=True, exist_ok=True)

def search_and_download_image(manufacturer, model):
    """Recherche et télécharge une image depuis DuckDuckGo"""

    # Construire la requête de recherche
    search_query = f"{manufacturer} {model} motorcycle"

    # URL de l'API DuckDuckGo
    ddg_url = "https://duckduckgo.com/"

    # Étape 1: Obtenir le vqd token
    params = {
        'q': search_query,
        'iax': 'images',
        'ia': 'images'
    }

    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }

    try:
        # Recherche sur DuckDuckGo
        req = urllib.request.Request(
            ddg_url + '?' + urllib.parse.urlencode(params),
            headers=headers
        )

        with urllib.request.urlopen(req, timeout=10) as response:
            html = response.read().decode('utf-8')

            # Extraire le token vqd
            vqd_match = re.search(r'vqd="([^"]+)"', html)
            if not vqd_match:
                vqd_match = re.search(r'vqd=([^&]+)', html)

            if not vqd_match:
                return None

            vqd = vqd_match.group(1)

        # Étape 2: Obtenir les résultats d'images
        image_api_url = "https://duckduckgo.com/i.js"
        image_params = {
            'l': 'us-en',
            'o': 'json',
            'q': search_query,
            'vqd': vqd,
            'f': ',,,',
            'p': '1'
        }

        req = urllib.request.Request(
            image_api_url + '?' + urllib.parse.urlencode(image_params),
            headers=headers
        )

        with urllib.request.urlopen(req, timeout=10) as response:
            data = json.loads(response.read().decode('utf-8'))

            if 'results' in data and len(data['results']) > 0:
                # Prendre la première image
                image_url = data['results'][0]['image']
                return image_url

    except Exception as e:
        print(f"      Erreur DDG: {e}")

    return None

def download_with_curl(manufacturer, model):
    """Télécharge une image en utilisant curl et Google Images"""

    filename = f"{manufacturer.lower().replace(' ', '-')}-{model.lower().replace(' ', '-').replace('/', '-')}.jpg"
    output_path = output_dir / filename

    # Recherche Google Images via curl
    search_query = urllib.parse.quote(f"{manufacturer} {model} motorcycle")

    try:
        # Utiliser une recherche Google Images simplifiée
        # On va essayer de télécharger depuis Bing Images à la place car c'est plus simple
        bing_url = f"https://www.bing.com/images/search?q={search_query}&first=1"

        # Télécharger la page de résultats
        result = subprocess.run(
            ['curl', '-s', '-L', '-A', 'Mozilla/5.0', bing_url],
            capture_output=True,
            text=True,
            timeout=15
        )

        if result.returncode == 0:
            html = result.stdout

            # Extraire la première URL d'image
            match = re.search(r'"murl":"([^"]+)"', html)
            if match:
                image_url = match.group(1).replace('\\u002f', '/')

                # Télécharger l'image
                subprocess.run(
                    ['curl', '-s', '-L', '-o', str(output_path), image_url],
                    timeout=30
                )

                # Vérifier que l'image a été téléchargée
                if output_path.exists() and output_path.stat().st_size > 5000:
                    return f"/images/{filename}"

    except Exception as e:
        print(f"      Erreur curl: {e}")

    return None

# Lire les motos depuis la base de données
print("🔍 Récupération de la liste des motos...")

result = subprocess.run(
    ['npx', 'ts-node', '-e', """
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const motos = await prisma.moto.findMany({
    select: {
      id: true,
      manufacturer: true,
      name: true,
      slug: true
    },
    orderBy: { manufacturer: 'asc' }
  });
  console.log(JSON.stringify(motos));
}

main()
  .then(() => prisma.$disconnect())
  .catch(e => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
    """],
    cwd='app/backend',
    capture_output=True,
    text=True
)

if result.returncode != 0:
    print(f"❌ Erreur lors de la récupération des motos: {result.stderr}")
    exit(1)

motos = json.loads(result.stdout.strip().split('\n')[-1])
print(f"📋 {len(motos)} motos trouvées\n")

success = 0
failed = 0
image_mapping = []

for moto in motos:
    manufacturer = moto['manufacturer']
    model = moto['name']

    filename = f"{manufacturer.lower().replace(' ', '-')}-{model.lower().replace(' ', '-').replace('/', '-')}.jpg"
    output_path = output_dir / filename

    print(f"📸 {manufacturer} {model}")

    if output_path.exists() and output_path.stat().st_size > 5000:
        print(f"   ⏭️  Image existe déjà")
        image_mapping.append({
            'motoId': moto['id'],
            'imageUrl': f"/images/{filename}"
        })
        success += 1
        continue

    # Télécharger avec curl/Bing
    image_url = download_with_curl(manufacturer, model)

    if image_url:
        print(f"   ✅ Photo téléchargée: {filename}")
        image_mapping.append({
            'motoId': moto['id'],
            'imageUrl': image_url
        })
        success += 1
    else:
        print(f"   ❌ Échec du téléchargement")
        failed += 1

    time.sleep(1)  # Pause pour éviter le rate limiting

# Sauvegarder le mapping
mapping_file = Path('app/backend/src/image_mapping.json')
with open(mapping_file, 'w') as f:
    json.dump(image_mapping, f, indent=2)

print("\n" + "="*60)
print("📊 RÉSUMÉ")
print("="*60)
print(f"✅ Succès: {success}/{len(motos)}")
print(f"❌ Échecs: {failed}/{len(motos)}")
print(f"📁 Images: {output_dir}")
print(f"📝 Mapping: {mapping_file}")
print("="*60)

if success > 0:
    print(f"\n💡 Prochaine étape: mettre à jour la base de données")
    print(f"   avec le script d'update des images")
