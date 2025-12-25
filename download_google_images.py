#!/usr/bin/env python3
"""
Télécharge des photos de motos depuis Google Images
"""
import subprocess
import json
from pathlib import Path
import urllib.parse
import re
import time

output_dir = Path('app/backend/public/images')
output_dir.mkdir(parents=True, exist_ok=True)

def download_from_google_images(manufacturer, model):
    """Télécharge une image depuis Google Images"""

    filename = f"{manufacturer.lower().replace(' ', '-')}-{model.lower().replace(' ', '-').replace('/', '-')}.jpg"
    output_path = output_dir / filename

    # Construire la requête de recherche
    search_query = urllib.parse.quote(f"{manufacturer} {model} motorcycle")

    # URL Google Images
    google_url = f"https://www.google.com/search?q={search_query}&tbm=isch"

    try:
        # Récupérer la page de résultats Google Images
        result = subprocess.run(
            ['curl', '-s', '-L', '-A', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', google_url],
            capture_output=True,
            text=True,
            timeout=15
        )

        if result.returncode != 0:
            return None

        html = result.stdout

        # Extraire les URLs d'images depuis le HTML
        # Google Images stocke les URLs dans des attributs data-src ou dans des chaînes JSON

        # Méthode 1: Chercher les URLs directes dans le HTML
        matches = re.findall(r'"(https://[^"]*\.(?:jpg|jpeg|png)[^"]*)"', html)

        if not matches:
            # Méthode 2: Chercher dans les données JSON embarquées
            matches = re.findall(r'\["(https://[^"]*\.(?:jpg|jpeg|png)[^"]*)"', html)

        if not matches:
            return None

        # Prendre la première image qui semble valide
        for image_url in matches:
            # Éviter les petites icônes et logos Google
            if 'gstatic' in image_url or 'logo' in image_url.lower():
                continue

            # Nettoyer l'URL (enlever les échappements)
            image_url = image_url.replace('\\u003d', '=').replace('\\u0026', '&')

            # Télécharger l'image
            result = subprocess.run(
                ['wget', '-q', '-O', str(output_path), '--timeout=30', image_url],
                timeout=35
            )

            # Vérifier que l'image a été téléchargée et qu'elle est valide
            if output_path.exists() and output_path.stat().st_size > 10000:  # Au moins 10KB
                return f"/images/{filename}"

            # Si échec, essayer l'image suivante
            if output_path.exists():
                output_path.unlink()

    except Exception as e:
        print(f"      Erreur: {e}")

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
    print(f"❌ Erreur: {result.stderr}")
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

    if output_path.exists() and output_path.stat().st_size > 10000:
        print(f"   ⏭️  Image existe déjà ({output_path.stat().st_size/1024:.1f} KB)")
        image_mapping.append({
            'motoId': moto['id'],
            'imageUrl': f"/images/{filename}"
        })
        success += 1
        continue

    # Télécharger depuis Google Images
    image_url = download_from_google_images(manufacturer, model)

    if image_url:
        size = output_path.stat().st_size / 1024
        print(f"   ✅ Photo téléchargée: {filename} ({size:.1f} KB)")
        image_mapping.append({
            'motoId': moto['id'],
            'imageUrl': image_url
        })
        success += 1
    else:
        print(f"   ❌ Échec (utilisera vignette YouTube)")
        failed += 1

    time.sleep(2)  # Pause pour ne pas surcharger Google

# Sauvegarder le mapping
mapping_file = Path('app/backend/src/image_mapping.json')
with open(mapping_file, 'w') as f:
    json.dump(image_mapping, f, indent=2)

print("\n" + "="*60)
print("📊 RÉSUMÉ")
print("="*60)
print(f"✅ Photos téléchargées: {success}/{len(motos)}")
print(f"⚠️  Vignettes YouTube: {failed}/{len(motos)}")
print(f"📁 Images: {output_dir}")
print(f"📝 Mapping: {mapping_file}")
print("="*60)

if success > 0:
    print(f"\n💡 Prochaine étape: copier les images vers dist")
    print(f"   cp app/backend/public/images/*.jpg app/backend/dist/public/images/")
