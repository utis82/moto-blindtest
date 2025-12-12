#!/usr/bin/env python3
"""
Script de test avancé pour le modèle d'extraction de métadonnées
"""
import sys
sys.path.append('.')
from inference import MotoMetadataExtractor
import json

# Initialiser le modèle
print("🔧 Initialisation du modèle...\n")
extractor = MotoMetadataExtractor()

# Tests avec différents niveaux d'information
test_cases = [
    # Titres incomplets - marque et modèle seulement
    "Ducati 916 sound",
    "Honda CBR",
    "Yamaha R6",
    "Kawasaki ZX-10R",

    # Titres avec année seulement
    "2023 Aprilia RSV4 Factory",
    "2019 Suzuki GSX-R1000",

    # Titres très minimalistes
    "KTM Duke",
    "BMW R1250GS",
    "Triumph Street Triple",

    # Titres avec info moteur
    "MV Agusta F4 V4 sound",
    "Harley Davidson V-Twin",

    # Titres complexes/ambigus
    "New Ninja exhaust note",
    "Italian superbike acceleration",
    "Monster 821 startup",

    # Titres avec fautes ou variations
    "Pannigale sound test",
    "CBR 1000RR Fireblade",
    "MT09 triple engine",
]

print("=" * 80)
print("🧪 TEST DU MODÈLE - EXTRACTION DE MÉTADONNÉES INCOMPLÈTES")
print("=" * 80)

results = []
for i, title in enumerate(test_cases, 1):
    print(f"\n[Test {i}/{len(test_cases)}]")
    print(f"📹 Titre: \"{title}\"")

    try:
        metadata_dict = extractor.extract(title)

        if metadata_dict is None:
            raise Exception("Extraction a retourné None")

        # Afficher le résultat formaté
        print(f"   ✅ Extraction réussie:")
        print(f"      🏭 Marque:        {metadata_dict.get('manufacturer', '❌ Manquant')}")
        print(f"      🏍️  Modèle:        {metadata_dict.get('model', '❌ Manquant')}")
        print(f"      ⚙️  Architecture:  {metadata_dict.get('engine', '❌ Manquant')}")
        print(f"      🔧 Cylindres:     {metadata_dict.get('cylinders', '❌ Manquant')}")
        print(f"      📅 Année:         {metadata_dict.get('year', '❌ Manquant')}")

        results.append({
            "title": title,
            "success": True,
            "metadata": metadata_dict
        })

    except Exception as e:
        print(f"   ❌ Erreur: {str(e)}")
        results.append({
            "title": title,
            "success": False,
            "error": str(e)
        })

# Statistiques finales
print("\n" + "=" * 80)
print("📊 STATISTIQUES")
print("=" * 80)

successful = sum(1 for r in results if r["success"])
failed = len(results) - successful

print(f"\n✅ Réussis: {successful}/{len(results)} ({successful/len(results)*100:.1f}%)")
print(f"❌ Échoués: {failed}/{len(results)}")

# Vérifier la cohérence des données extraites
print("\n📈 ANALYSE DE QUALITÉ:")
complete_extractions = 0
for r in results:
    if r["success"]:
        meta = r["metadata"]
        fields_filled = sum(1 for v in meta.values() if v and v != "N/A")
        if fields_filled == 5:
            complete_extractions += 1

print(f"   Extractions complètes (5/5 champs): {complete_extractions}/{successful}")
if successful > 0:
    print(f"   Taux de complétion: {complete_extractions/successful*100:.1f}%")
else:
    print(f"   Taux de complétion: N/A (aucune extraction réussie)")

print("\n✨ Test terminé !")
