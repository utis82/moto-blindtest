#!/usr/bin/env python3
"""
Télécharge des images de motos depuis Unsplash.
"""
import subprocess
import json
from pathlib import Path
import urllib.request
import urllib.parse
import time

# Lire toutes les motos depuis la base de données
# On va utiliser le script count_motos pour avoir la liste
output_dir = Path('app/backend/public/images')
output_dir.mkdir(parents=True, exist_ok=True)

# Pour l'instant, on va utiliser une API gratuite de recherche d'images
# Wikimedia Commons a des images libres de droits

def download_from_wikipedia(manufacturer, model):
    """Télécharge une image depuis Wikimedia Commons"""
    # Construire la requête de recherche
    search_query = f"{manufacturer} {model} motorcycle"

    # URL de l'API Wikimedia Commons
    api_url = "https://commons.wikimedia.org/w/api.php"

    # Paramètres de recherche
    params = {
        'action': 'query',
        'format': 'json',
        'generator': 'search',
        'gsrsearch': search_query,
        'gsrlimit': 1,
        'prop': 'imageinfo',
        'iiprop': 'url',
        'iiurlwidth': 800
    }

    url = f"{api_url}?{urllib.parse.urlencode(params)}"

    try:
        with urllib.request.urlopen(url, timeout=10) as response:
            data = json.loads(response.read())

            if 'query' in data and 'pages' in data['query']:
                pages = data['query']['pages']
                for page_id, page in pages.items():
                    if 'imageinfo' in page and len(page['imageinfo']) > 0:
                        image_url = page['imageinfo'][0].get('thumburl') or page['imageinfo'][0].get('url')
                        return image_url
    except Exception as e:
        print(f"   ⚠️  Erreur Wikipedia: {e}")

    return None

def download_image_simple(manufacturer, model):
    """Version simple: utilise l'image de la vignette YouTube comme placeholder"""
    # Pour l'instant, on va juste créer un fichier placeholder
    # Plus tard on pourra améliorer avec de vraies images

    filename = f"{manufacturer.lower().replace(' ', '-')}-{model.lower().replace(' ', '-').replace('/', '-')}.jpg"
    output_path = output_dir / filename

    if output_path.exists():
        return f"/images/{filename}"

    # Télécharger une image générique de moto depuis une source libre
    # Pour ce test, on va utiliser une image placeholder
    placeholder_url = "https://via.placeholder.com/800x600.png?text=" + urllib.parse.quote(f"{manufacturer} {model}")

    try:
        urllib.request.urlretrieve(placeholder_url, output_path)
        return f"/images/{filename}"
    except:
        return None

# Lire les motos depuis la base de données via un script Node
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
    slug = moto['slug']

    print(f"📸 {manufacturer} {model}")

    filename = f"{manufacturer.lower().replace(' ', '-')}-{model.lower().replace(' ', '-').replace('/', '-')}.jpg"
    output_path = output_dir / filename

    if output_path.exists():
        print(f"   ⏭️  Image existe déjà")
        image_mapping.append({
            'motoId': moto['id'],
            'imageUrl': f"/images/{filename}"
        })
        success += 1
        continue

    # Pour l'instant, créer une image placeholder
    placeholder_url = f"https://via.placeholder.com/800x600/1a1a2e/eab308?text={urllib.parse.quote(f'{manufacturer}+{model}')}"

    try:
        print(f"   ⬇️  Téléchargement placeholder...")
        urllib.request.urlretrieve(placeholder_url, output_path)
        print(f"   ✅ Image créée: {filename}")

        image_mapping.append({
            'motoId': moto['id'],
            'imageUrl': f"/images/{filename}"
        })
        success += 1

        time.sleep(0.5)  # Pause pour ne pas surcharger

    except Exception as e:
        print(f"   ❌ Échec: {e}")
        failed += 1

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

print("\n💡 Note: Les images actuelles sont des placeholders.")
print("   Tu peux remplacer les fichiers JPG par de vraies photos.")
