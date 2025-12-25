#!/usr/bin/env python3
"""
Télécharge des photos de motos avec wget - méthode simple et robuste
"""
import subprocess
import json
from pathlib import Path
import time

output_dir = Path('app/backend/public/images')
output_dir.mkdir(parents=True, exist_ok=True)

# URLs manuelles pour quelques motos populaires (on peut en ajouter plus)
# Format: "manufacturer model": "url de l'image"
MANUAL_URLS = {
    "Ducati Panigale V4": "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9f/Ducati_Panigale_V4_S.jpg/1200px-Ducati_Panigale_V4_S.jpg",
    "BMW S1000RR": "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/BMW_S1000RR_2019.jpg/1200px-BMW_S1000RR_2019.jpg",
    "Yamaha YZF-R1": "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c0/Yamaha_YZF-R1_2015.jpg/1200px-Yamaha_YZF-R1_2015.jpg",
    "Kawasaki Ninja H2": "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8f/Kawasaki_Ninja_H2.jpg/1200px-Kawasaki_Ninja_H2.jpg",
    "Suzuki Hayabusa": "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3b/Suzuki_Hayabusa_2021.jpg/1200px-Suzuki_Hayabusa_2021.jpg",
}

def download_image_wget(url, output_path):
    """Télécharge une image avec wget"""
    try:
        result = subprocess.run(
            ['wget', '-q', '-O', str(output_path), url],
            timeout=30
        )

        if result.returncode == 0 and output_path.exists() and output_path.stat().st_size > 5000:
            return True
    except:
        pass

    return False

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
    key = f"{manufacturer} {model}"

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

    # Chercher dans les URLs manuelles
    if key in MANUAL_URLS:
        if download_image_wget(MANUAL_URLS[key], output_path):
            print(f"   ✅ Photo téléchargée depuis Wikimedia")
            image_mapping.append({
                'motoId': moto['id'],
                'imageUrl': f"/images/{filename}"
            })
            success += 1
        else:
            print(f"   ❌ Échec du téléchargement")
            failed += 1
    else:
        # Pas d'URL disponible pour cette moto
        print(f"   ⚠️  Pas d'URL configurée (utilisera vignette YouTube)")
        failed += 1

    time.sleep(0.5)

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

print("\n💡 Les motos sans photo utiliseront la vignette YouTube")
print("   Tu peux ajouter plus d'URLs dans le script si tu veux")
