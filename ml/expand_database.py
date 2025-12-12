#!/usr/bin/env python3
"""
Script pour étendre la base de données de motos à 100+
"""
import json

# Charger la DB actuelle
with open('motorcycle_database.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

current_motos = data['motorcycles']

# Ajouter plein de nouvelles motos
new_motos = [
    # === DUCATI (plus de modèles) ===
    {
        "manufacturer": "Ducati",
        "model": "Diavel",
        "variants": ["Diavel V4", "Diavel 1260", "XDiavel"],
        "engine": "V-Twin/V4",
        "cylinders": "2-4",
        "years": ["2011", "2015", "2019", "2023"]
    },
    {
        "manufacturer": "Ducati",
        "model": "Multistrada",
        "variants": ["Multistrada V4", "Multistrada 1260", "Multistrada V2"],
        "engine": "V-Twin/V4",
        "cylinders": "2-4",
        "years": ["2010", "2015", "2021", "2023"]
    },
    {
        "manufacturer": "Ducati",
        "model": "Scrambler",
        "variants": ["Scrambler 800", "Scrambler Icon", "Scrambler Desert Sled"],
        "engine": "L-Twin",
        "cylinders": "2",
        "years": ["2015", "2019", "2022"]
    },
    {
        "manufacturer": "Ducati",
        "model": "Supersport",
        "variants": ["Supersport 950", "Supersport S"],
        "engine": "L-Twin",
        "cylinders": "2",
        "years": ["2017", "2021", "2023"]
    },
    {
        "manufacturer": "Ducati",
        "model": "Hypermotard",
        "variants": ["Hypermotard 950", "Hypermotard SP"],
        "engine": "L-Twin",
        "cylinders": "2",
        "years": ["2013", "2019", "2022"]
    },

    # === YAMAHA (plus de modèles) ===
    {
        "manufacturer": "Yamaha",
        "model": "YZF-R3",
        "variants": ["R3"],
        "engine": "Parallel Twin",
        "cylinders": "2",
        "years": ["2015", "2019", "2022"]
    },
    {
        "manufacturer": "Yamaha",
        "model": "YZF-R7",
        "variants": ["R7"],
        "engine": "CP2 Parallel Twin",
        "cylinders": "2",
        "years": ["2022", "2023"]
    },
    {
        "manufacturer": "Yamaha",
        "model": "VMAX",
        "variants": ["V-Max", "VMax 1700"],
        "engine": "V4",
        "cylinders": "4",
        "years": ["1985", "2009", "2017"]
    },
    {
        "manufacturer": "Yamaha",
        "model": "FZ",
        "variants": ["FZ-07", "FZ-09", "FZ-10", "FZ1"],
        "engine": "Inline-4/Triple/Twin",
        "cylinders": "2-4",
        "years": ["2006", "2014", "2017"]
    },
    {
        "manufacturer": "Yamaha",
        "model": "XSR",
        "variants": ["XSR700", "XSR900"],
        "engine": "Parallel Twin/Triple",
        "cylinders": "2-3",
        "years": ["2016", "2022"]
    },
    {
        "manufacturer": "Yamaha",
        "model": "Tracer",
        "variants": ["Tracer 7", "Tracer 9", "Tracer 900"],
        "engine": "Parallel Twin/Triple",
        "cylinders": "2-3",
        "years": ["2015", "2021"]
    },
    {
        "manufacturer": "Yamaha",
        "model": "Ténéré",
        "variants": ["Ténéré 700", "T7"],
        "engine": "CP2 Parallel Twin",
        "cylinders": "2",
        "years": ["2019", "2022"]
    },

    # === KAWASAKI (plus de modèles) ===
    {
        "manufacturer": "Kawasaki",
        "model": "Ninja 400",
        "variants": ["Ninja 300", "Ninja 250"],
        "engine": "Parallel Twin",
        "cylinders": "2",
        "years": ["2008", "2013", "2018"]
    },
    {
        "manufacturer": "Kawasaki",
        "model": "Ninja 650",
        "variants": ["Ninja 500"],
        "engine": "Parallel Twin",
        "cylinders": "2",
        "years": ["2006", "2012", "2017", "2020"]
    },
    {
        "manufacturer": "Kawasaki",
        "model": "Z650",
        "variants": ["Z 650"],
        "engine": "Parallel Twin",
        "cylinders": "2",
        "years": ["2017", "2020"]
    },
    {
        "manufacturer": "Kawasaki",
        "model": "Z1000",
        "variants": ["Z 1000"],
        "engine": "Inline-4",
        "cylinders": "4",
        "years": ["2003", "2010", "2014"]
    },
    {
        "manufacturer": "Kawasaki",
        "model": "Z800",
        "variants": ["Z 800"],
        "engine": "Inline-4",
        "cylinders": "4",
        "years": ["2013", "2016"]
    },
    {
        "manufacturer": "Kawasaki",
        "model": "ZX-14R",
        "variants": ["ZX14", "ZX-14"],
        "engine": "Inline-4",
        "cylinders": "4",
        "years": ["2006", "2012", "2016"]
    },
    {
        "manufacturer": "Kawasaki",
        "model": "Versys",
        "variants": ["Versys 650", "Versys 1000"],
        "engine": "Parallel Twin/Inline-4",
        "cylinders": "2-4",
        "years": ["2007", "2015", "2019"]
    },

    # === HONDA (plus de modèles) ===
    {
        "manufacturer": "Honda",
        "model": "CB1000R",
        "variants": ["CB 1000 R", "CB1000R+"],
        "engine": "Inline-4",
        "cylinders": "4",
        "years": ["2008", "2018", "2021"]
    },
    {
        "manufacturer": "Honda",
        "model": "CB650R",
        "variants": ["CB 650 R", "CB650F"],
        "engine": "Inline-4",
        "cylinders": "4",
        "years": ["2014", "2019", "2021"]
    },
    {
        "manufacturer": "Honda",
        "model": "CB500",
        "variants": ["CB500F", "CB500X"],
        "engine": "Parallel Twin",
        "cylinders": "2",
        "years": ["2013", "2019", "2022"]
    },
    {
        "manufacturer": "Honda",
        "model": "NC750X",
        "variants": ["NC750", "NC700X"],
        "engine": "Parallel Twin",
        "cylinders": "2",
        "years": ["2012", "2016", "2021"]
    },
    {
        "manufacturer": "Honda",
        "model": "Africa Twin",
        "variants": ["CRF1000L", "CRF1100L"],
        "engine": "Parallel Twin",
        "cylinders": "2",
        "years": ["2016", "2020", "2023"]
    },
    {
        "manufacturer": "Honda",
        "model": "VFR",
        "variants": ["VFR800", "VFR1200"],
        "engine": "V4",
        "cylinders": "4",
        "years": ["1998", "2014", "2020"]
    },
    {
        "manufacturer": "Honda",
        "model": "CBR300R",
        "variants": ["CBR250R"],
        "engine": "Single",
        "cylinders": "1",
        "years": ["2011", "2015"]
    },

    # === SUZUKI (plus de modèles) ===
    {
        "manufacturer": "Suzuki",
        "model": "GSX-R600",
        "variants": ["GSXR600"],
        "engine": "Inline-4",
        "cylinders": "4",
        "years": ["1997", "2004", "2006", "2011"]
    },
    {
        "manufacturer": "Suzuki",
        "model": "GSX-S",
        "variants": ["GSX-S750", "GSX-S1000"],
        "engine": "Inline-4",
        "cylinders": "4",
        "years": ["2015", "2018", "2021"]
    },
    {
        "manufacturer": "Suzuki",
        "model": "SV650",
        "variants": ["SV 650", "SV650X"],
        "engine": "V-Twin",
        "cylinders": "2",
        "years": ["1999", "2017", "2021"]
    },
    {
        "manufacturer": "Suzuki",
        "model": "V-Strom",
        "variants": ["V-Strom 650", "V-Strom 1000"],
        "engine": "V-Twin",
        "cylinders": "2",
        "years": ["2004", "2014", "2020"]
    },
    {
        "manufacturer": "Suzuki",
        "model": "Katana",
        "variants": ["GSX-S1000 Katana"],
        "engine": "Inline-4",
        "cylinders": "4",
        "years": ["1981", "2019", "2022"]
    },

    # === BMW (plus de modèles) ===
    {
        "manufacturer": "BMW",
        "model": "S1000R",
        "variants": ["S 1000 R"],
        "engine": "Inline-4",
        "cylinders": "4",
        "years": ["2014", "2017", "2021"]
    },
    {
        "manufacturer": "BMW",
        "model": "S1000XR",
        "variants": ["S 1000 XR"],
        "engine": "Inline-4",
        "cylinders": "4",
        "years": ["2015", "2020"]
    },
    {
        "manufacturer": "BMW",
        "model": "R1200GS",
        "variants": ["R 1200 GS", "R1200GS Adventure"],
        "engine": "Boxer Twin",
        "cylinders": "2",
        "years": ["2004", "2013", "2017"]
    },
    {
        "manufacturer": "BMW",
        "model": "F900R",
        "variants": ["F 900 R", "F900XR"],
        "engine": "Parallel Twin",
        "cylinders": "2",
        "years": ["2020", "2022"]
    },
    {
        "manufacturer": "BMW",
        "model": "F850GS",
        "variants": ["F 850 GS", "F750GS"],
        "engine": "Parallel Twin",
        "cylinders": "2",
        "years": ["2018", "2021"]
    },
    {
        "manufacturer": "BMW",
        "model": "R nineT",
        "variants": ["R nine T", "R9T"],
        "engine": "Boxer Twin",
        "cylinders": "2",
        "years": ["2014", "2017", "2021"]
    },

    # === KTM (plus de modèles) ===
    {
        "manufacturer": "KTM",
        "model": "RC",
        "variants": ["RC 390", "RC 200", "RC 125"],
        "engine": "Single",
        "cylinders": "1",
        "years": ["2014", "2017", "2022"]
    },
    {
        "manufacturer": "KTM",
        "model": "890 Duke",
        "variants": ["890 Duke R"],
        "engine": "LC8c Parallel Twin",
        "cylinders": "2",
        "years": ["2021", "2023"]
    },
    {
        "manufacturer": "KTM",
        "model": "890 Adventure",
        "variants": ["890 Adventure R"],
        "engine": "LC8c Parallel Twin",
        "cylinders": "2",
        "years": ["2021", "2023"]
    },
    {
        "manufacturer": "KTM",
        "model": "1290 Super Adventure",
        "variants": ["1290 Super Adventure R", "1290 Super Adventure S"],
        "engine": "LC8 V-Twin",
        "cylinders": "2",
        "years": ["2015", "2021"]
    },

    # === TRIUMPH (plus de modèles) ===
    {
        "manufacturer": "Triumph",
        "model": "Speed Triple",
        "variants": ["Speed Triple 1200", "Speed Triple RS"],
        "engine": "Triple",
        "cylinders": "3",
        "years": ["1994", "2011", "2021"]
    },
    {
        "manufacturer": "Triumph",
        "model": "Rocket",
        "variants": ["Rocket 3", "Rocket III"],
        "engine": "Inline-3",
        "cylinders": "3",
        "years": ["2004", "2020"]
    },
    {
        "manufacturer": "Triumph",
        "model": "Tiger",
        "variants": ["Tiger 900", "Tiger 1200"],
        "engine": "Triple",
        "cylinders": "3",
        "years": ["2011", "2020"]
    },
    {
        "manufacturer": "Triumph",
        "model": "Bonneville",
        "variants": ["Bonneville T120", "Bonneville Bobber"],
        "engine": "Parallel Twin",
        "cylinders": "2",
        "years": ["2001", "2016", "2021"]
    },
    {
        "manufacturer": "Triumph",
        "model": "Trident",
        "variants": ["Trident 660"],
        "engine": "Triple",
        "cylinders": "3",
        "years": ["2021", "2023"]
    },

    # === APRILIA (plus de modèles) ===
    {
        "manufacturer": "Aprilia",
        "model": "Tuono V4",
        "variants": ["Tuono V4 1100", "Tuono V4 Factory"],
        "engine": "V4",
        "cylinders": "4",
        "years": ["2011", "2015", "2021"]
    },
    {
        "manufacturer": "Aprilia",
        "model": "RS 125",
        "variants": ["RS125"],
        "engine": "Single",
        "cylinders": "1",
        "years": ["1993", "2012"]
    },
    {
        "manufacturer": "Aprilia",
        "model": "Tuono 660",
        "variants": [],
        "engine": "Parallel Twin",
        "cylinders": "2",
        "years": ["2021", "2023"]
    },

    # === MV AGUSTA (plus de modèles) ===
    {
        "manufacturer": "MV Agusta",
        "model": "F3",
        "variants": ["F3 800", "F3 675"],
        "engine": "Inline-3",
        "cylinders": "3",
        "years": ["2012", "2020"]
    },
    {
        "manufacturer": "MV Agusta",
        "model": "Dragster",
        "variants": ["Dragster 800", "Dragster RR"],
        "engine": "Inline-3",
        "cylinders": "3",
        "years": ["2014", "2019"]
    },
    {
        "manufacturer": "MV Agusta",
        "model": "Superveloce",
        "variants": ["Superveloce 800"],
        "engine": "Inline-3",
        "cylinders": "3",
        "years": ["2020", "2022"]
    },

    # === HARLEY-DAVIDSON (plus de modèles) ===
    {
        "manufacturer": "Harley-Davidson",
        "model": "Fat Boy",
        "variants": ["Fat Boy 114"],
        "engine": "V-Twin",
        "cylinders": "2",
        "years": ["1990", "2018", "2021"]
    },
    {
        "manufacturer": "Harley-Davidson",
        "model": "Road King",
        "variants": [],
        "engine": "V-Twin",
        "cylinders": "2",
        "years": ["1994", "2017"]
    },
    {
        "manufacturer": "Harley-Davidson",
        "model": "Street Glide",
        "variants": [],
        "engine": "V-Twin",
        "cylinders": "2",
        "years": ["2006", "2020"]
    },
    {
        "manufacturer": "Harley-Davidson",
        "model": "LiveWire",
        "variants": [],
        "engine": "Electric",
        "cylinders": "0",
        "years": ["2019", "2021"]
    },
    {
        "manufacturer": "Harley-Davidson",
        "model": "Pan America",
        "variants": ["Pan America 1250"],
        "engine": "V-Twin",
        "cylinders": "2",
        "years": ["2021", "2023"]
    },

    # === AUTRES MARQUES ===
    {
        "manufacturer": "Indian",
        "model": "Scout",
        "variants": ["Scout Bobber", "Scout Rogue"],
        "engine": "V-Twin",
        "cylinders": "2",
        "years": ["2015", "2020"]
    },
    {
        "manufacturer": "Indian",
        "model": "FTR",
        "variants": ["FTR 1200"],
        "engine": "V-Twin",
        "cylinders": "2",
        "years": ["2019", "2022"]
    },
    {
        "manufacturer": "Indian",
        "model": "Chieftain",
        "variants": [],
        "engine": "V-Twin",
        "cylinders": "2",
        "years": ["2014", "2021"]
    },
    {
        "manufacturer": "Royal Enfield",
        "model": "Interceptor",
        "variants": ["Interceptor 650"],
        "engine": "Parallel Twin",
        "cylinders": "2",
        "years": ["2018", "2022"]
    },
    {
        "manufacturer": "Royal Enfield",
        "model": "Continental GT",
        "variants": ["Continental GT 650"],
        "engine": "Parallel Twin",
        "cylinders": "2",
        "years": ["2013", "2018"]
    },
    {
        "manufacturer": "Royal Enfield",
        "model": "Himalayan",
        "variants": [],
        "engine": "Single",
        "cylinders": "1",
        "years": ["2016", "2021"]
    },
    {
        "manufacturer": "Benelli",
        "model": "TRK 502",
        "variants": ["TRK 502X"],
        "engine": "Parallel Twin",
        "cylinders": "2",
        "years": ["2017", "2020"]
    },
    {
        "manufacturer": "Benelli",
        "model": "TNT",
        "variants": ["TNT 300", "TNT 600"],
        "engine": "Single/Inline-4",
        "cylinders": "1-4",
        "years": ["2014", "2019"]
    },
]

# Fusionner avec la DB existante
all_motos = current_motos + new_motos

# Sauvegarder
data['motorcycles'] = all_motos

with open('motorcycle_database.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=2, ensure_ascii=False)

print(f"✅ Base de données étendue !")
print(f"   Avant: {len(current_motos)} motos")
print(f"   Après: {len(all_motos)} motos")
print(f"   Ajoutées: {len(new_motos)} motos")
