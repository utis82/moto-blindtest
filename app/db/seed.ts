import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const seeds = [
  {
    "manufacturer": "Ducati",
    "name": "Panigale V4",
    "slug": "ducati-panigale-v4",
    "engine": "V4",
    "era": null,
    "cylinders": "4",
    "year": "2018",
    "funFact": "La Panigale V4 ducati est réputée pour sa sonorité unique.",
    "sources": [
      {
        "url": "https://www.youtube.com/watch?v=6fVjQbtzICM",
        "videoId": "6fVjQbtzICM",
        "startSeconds": 0,
        "endSeconds": 14,
        "audioFile": "/sounds/ducati-panigale-v4s.mp3"
      }
    ]
  },
  {
    "manufacturer": "Yamaha",
    "name": "YZF-R1",
    "slug": "yamaha-yzf-r1",
    "engine": "Crossplane Inline-4",
    "era": "2022",
    "cylinders": "4",
    "year": "2022",
    "funFact": "La YZF-R1 yamaha est réputée pour sa sonorité unique.",
    "sources": [
      {
        "url": "https://www.youtube.com/watch?v=zsznxlIOov0",
        "videoId": "zsznxlIOov0",
        "startSeconds": 0,
        "endSeconds": 13,
        "audioFile": "/sounds/yamaha-yzf-r1.mp3"
      }
    ]
  },
  {
    "manufacturer": "Harley",
    "name": "Breakout",
    "slug": "harley-breakout",
    "engine": "Milwaukee-Eight V-Twin",
    "era": null,
    "cylinders": "2",
    "year": "2018",
    "funFact": "La Breakout harley est réputée pour sa sonorité unique.",
    "sources": [
      {
        "url": "https://www.youtube.com/watch?v=bPBcVWI6Mi4",
        "videoId": "bPBcVWI6Mi4",
        "startSeconds": 38,
        "endSeconds": 55,
        "audioFile": "/sounds/harley-davidson-breakout-114.mp3"
      }
    ]
  },
  {
    "manufacturer": "Kawasaki",
    "name": "Ninja H2",
    "slug": "kawasaki-ninja-h2",
    "engine": "Supercharged Inline-4",
    "era": null,
    "cylinders": "4",
    "year": "2015",
    "funFact": "Chaîne Wira Satria spécialisée dans les sons moteurs.",
    "sources": [
      {
        "url": "https://www.youtube.com/watch?v=L--R81xW_7w",
        "videoId": "L--R81xW_7w",
        "startSeconds": 254,
        "endSeconds": 269,
        "audioFile": "/sounds/kawasaki-ninja-h2.mp3"
      }
    ]
  },
  {
    "manufacturer": "Bmw",
    "name": "S1000RR",
    "slug": "bmw-s1000rr",
    "engine": "Inline-4",
    "era": null,
    "cylinders": "4",
    "year": "2019",
    "funFact": "La S1000RR bmw est réputée pour sa sonorité unique.",
    "sources": [
      {
        "url": "https://www.youtube.com/watch?v=2nGpc4i3mtM",
        "videoId": "2nGpc4i3mtM",
        "startSeconds": 21,
        "endSeconds": 36,
        "audioFile": "/sounds/bmw-s1000rr.mp3"
      }
    ]
  },
  {
    "manufacturer": "Yamaha",
    "name": "MT-09",
    "slug": "yamaha-mt-09",
    "engine": "CP3 Triple",
    "era": null,
    "cylinders": "3",
    "year": "2021",
    "funFact": "Chaîne Mertingo Motovlog spécialisée dans les sons moteurs.",
    "sources": [
      {
        "url": "https://www.youtube.com/watch?v=8BqHD8KxrS0",
        "videoId": "8BqHD8KxrS0",
        "startSeconds": 106,
        "endSeconds": 121,
        "audioFile": "/sounds/yamaha-mt-09.mp3"
      }
    ]
  },
  {
    "manufacturer": "Ktm",
    "name": "Super Duke",
    "slug": "ktm-super-duke",
    "engine": "LC8 V-Twin",
    "era": null,
    "cylinders": "2",
    "year": "2020",
    "funFact": "La Super Duke ktm est réputée pour sa sonorité unique.",
    "sources": [
      {
        "url": "https://www.youtube.com/watch?v=jOJ7oMZSkak",
        "videoId": "jOJ7oMZSkak",
        "startSeconds": 194,
        "endSeconds": 209,
        "audioFile": "/sounds/ktm-1290-super-duke-r.mp3"
      }
    ]
  },
  {
    "manufacturer": "Aprilia",
    "name": "RS 660",
    "slug": "aprilia-rs-660",
    "engine": "Parallel Twin",
    "era": null,
    "cylinders": "2",
    "year": "2020",
    "funFact": "Chaîne ROBO0o_ spécialisée dans les sons moteurs.",
    "sources": [
      {
        "url": "https://www.youtube.com/watch?v=-emcohcaNfY",
        "videoId": "-emcohcaNfY",
        "startSeconds": 197,
        "endSeconds": 212,
        "audioFile": "/sounds/aprilia-rs-660.mp3"
      }
    ]
  },
  {
    "manufacturer": "Suzuki",
    "name": "GSX-R1000",
    "slug": "suzuki-gsx-r1000",
    "engine": "Inline-4",
    "era": null,
    "cylinders": "4",
    "year": "2017",
    "funFact": "Chaîne The Jakarta Roads spécialisée dans les sons moteurs.",
    "sources": [
      {
        "url": "https://www.youtube.com/watch?v=JIn5OSwz1VM",
        "videoId": "JIn5OSwz1VM",
        "startSeconds": 263,
        "endSeconds": 278,
        "audioFile": "/sounds/suzuki-gsx-r1000.mp3"
      }
    ]
  },
  {
    "manufacturer": "Honda",
    "name": "CBR1000RR Fireblade",
    "slug": "honda-cbr1000rr-fireblade",
    "engine": "Inline-4",
    "era": null,
    "cylinders": "4",
    "year": "2020",
    "funFact": "Chaîne The Jakarta Roads spécialisée dans les sons moteurs.",
    "sources": [
      {
        "url": "https://www.youtube.com/watch?v=jyEd6huRJj8",
        "videoId": "jyEd6huRJj8",
        "startSeconds": 325,
        "endSeconds": 340,
        "audioFile": "/sounds/honda-cbr1000rr-fireblade.mp3"
      }
    ]
  },
  {
    "manufacturer": "MV Agusta",
    "name": "F4",
    "slug": "mv-agusta-f4",
    "engine": "Inline-4",
    "era": null,
    "cylinders": "4",
    "year": "2019",
    "funFact": "Chaîne The Moto Seoul spécialisée dans les sons moteurs.",
    "sources": [
      {
        "url": "https://www.youtube.com/watch?v=GDa1-PT34Nc",
        "videoId": "GDa1-PT34Nc",
        "startSeconds": 229,
        "endSeconds": 244,
        "audioFile": "/sounds/mv-agusta-f4.mp3"
      }
    ]
  },
  {
    "manufacturer": "Triumph",
    "name": "Street Triple RS",
    "slug": "triumph-street-triple-rs",
    "engine": "Triple 765",
    "era": null,
    "cylinders": "3",
    "year": "2020",
    "funFact": "Chaîne 2FAST4YOU spécialisée dans les sons moteurs.",
    "sources": [
      {
        "url": "https://www.youtube.com/watch?v=Nmzi0kE5G3Y",
        "videoId": "Nmzi0kE5G3Y",
        "startSeconds": 186,
        "endSeconds": 201,
        "audioFile": "/sounds/triumph-street-triple-rs.mp3"
      }
    ]
  },
  {
    "manufacturer": "Kawasaki",
    "name": "ZX-10R",
    "slug": "kawasaki-zx-10r",
    "engine": "Inline-4",
    "era": "2022",
    "cylinders": "4",
    "year": "2022",
    "funFact": "Chaîne Docci spécialisée dans les sons moteurs.",
    "sources": [
      {
        "url": "https://www.youtube.com/watch?v=W3o0n_txK6c",
        "videoId": "W3o0n_txK6c",
        "startSeconds": 93,
        "endSeconds": 108,
        "audioFile": "/sounds/kawasaki-zx-10r.mp3"
      }
    ]
  },
  {
    "manufacturer": "Indian",
    "name": "Scout Bobber",
    "slug": "indian-scout-bobber",
    "engine": "V-Twin",
    "era": "1920",
    "cylinders": "2",
    "year": "1920",
    "funFact": "Chaîne SquareMoto spécialisée dans les sons moteurs.",
    "sources": [
      {
        "url": "https://www.youtube.com/watch?v=EAUAuGQoXsI",
        "videoId": "EAUAuGQoXsI",
        "startSeconds": 258,
        "endSeconds": 273,
        "audioFile": "/sounds/indian-scout-bobber.mp3"
      }
    ]
  },
  {
    "manufacturer": "Honda",
    "name": "Africa Twin",
    "slug": "honda-africa-twin",
    "engine": "Parallel Twin",
    "era": null,
    "cylinders": "2",
    "year": "2020",
    "funFact": "Chaîne Jimjam spécialisée dans les sons moteurs.",
    "sources": [
      {
        "url": "https://www.youtube.com/watch?v=4PNT1EXEEUA",
        "videoId": "4PNT1EXEEUA",
        "startSeconds": 5,
        "endSeconds": 15,
        "audioFile": "/sounds/honda-africa-twin.mp3"
      }
    ]
  },
  {
    "manufacturer": "Bmw",
    "name": "R nineT",
    "slug": "bmw-r-ninet",
    "engine": "Boxer Twin",
    "era": null,
    "cylinders": "2",
    "year": "2021",
    "funFact": "Chaîne RIDER-24-XR spécialisée dans les sons moteurs.",
    "sources": [
      {
        "url": "https://www.youtube.com/watch?v=NiY5TkvoLog",
        "videoId": "NiY5TkvoLog",
        "startSeconds": 35,
        "endSeconds": 50,
        "audioFile": "/sounds/bmw-r-ninet.mp3"
      }
    ]
  },
  {
    "manufacturer": "Ducati",
    "name": "Monster 1200",
    "slug": "ducati-monster-1200",
    "engine": "L-Twin Testastretta",
    "era": "2025",
    "cylinders": "2",
    "year": "2025",
    "funFact": "Chaîne Strell spécialisée dans les sons moteurs.",
    "sources": [
      {
        "url": "https://www.youtube.com/watch?v=637JZD1OSew",
        "videoId": "637JZD1OSew",
        "startSeconds": 162,
        "endSeconds": 177,
        "audioFile": "/sounds/ducati-monster-1200.mp3"
      }
    ]
  },
  {
    "manufacturer": "Kawasaki",
    "name": "Z900",
    "slug": "kawasaki-z900",
    "engine": "Inline-4",
    "era": "1972",
    "cylinders": "4",
    "year": "1972",
    "funFact": "Chaîne VR 1 Rider spécialisée dans les sons moteurs.",
    "sources": [
      {
        "url": "https://www.youtube.com/watch?v=rwaXOoZTRfQ",
        "videoId": "rwaXOoZTRfQ",
        "startSeconds": 183,
        "endSeconds": 198,
        "audioFile": "/sounds/kawasaki-z900.mp3"
      }
    ]
  },
  {
    "manufacturer": "Suzuki",
    "name": "Hayabusa",
    "slug": "suzuki-hayabusa",
    "engine": "Inline-4",
    "era": null,
    "cylinders": "4",
    "year": "2021",
    "funFact": "Chaîne SCRAT spécialisée dans les sons moteurs.",
    "sources": [
      {
        "url": "https://www.youtube.com/watch?v=CHRuO2oCTbU",
        "videoId": "CHRuO2oCTbU",
        "startSeconds": 96,
        "endSeconds": 111,
        "audioFile": "/sounds/suzuki-hayabusa.mp3"
      }
    ]
  },
  {
    "manufacturer": "Yamaha",
    "name": "Ténéré 700",
    "slug": "yamaha-t-n-r-700",
    "engine": "CP2 Parallel Twin",
    "era": null,
    "cylinders": "2",
    "year": "2019",
    "funFact": "Chaîne Bikes of Rye spécialisée dans les sons moteurs.",
    "sources": [
      {
        "url": "https://www.youtube.com/watch?v=HJPe_0P3Av0",
        "videoId": "HJPe_0P3Av0",
        "startSeconds": 98,
        "endSeconds": 113,
        "audioFile": "/sounds/yamaha-ténéré-700.mp3"
      }
    ]
  },
  {
    "manufacturer": "Ktm",
    "name": "890 Duke R",
    "slug": "ktm-890-duke-r",
    "engine": "LC8c Parallel Twin",
    "era": null,
    "cylinders": "2",
    "year": "2020",
    "funFact": "Chaîne Schwabenpower Motorrad spécialisée dans les sons moteurs.",
    "sources": [
      {
        "url": "https://www.youtube.com/watch?v=TojRTHcgqfY",
        "videoId": "TojRTHcgqfY",
        "startSeconds": 9,
        "endSeconds": 23,
        "audioFile": "/sounds/ktm-890-duke-r.mp3"
      }
    ]
  },
  {
    "manufacturer": "Aprilia",
    "name": "Tuono V4 Factory",
    "slug": "aprilia-tuono-v4-factory",
    "engine": "V4",
    "era": null,
    "cylinders": "4",
    "year": "2021",
    "funFact": "Chaîne RIDERSPOV spécialisée dans les sons moteurs.",
    "sources": [
      {
        "url": "https://www.youtube.com/watch?v=4DoeQ_mm5tI",
        "videoId": "4DoeQ_mm5tI",
        "startSeconds": 84,
        "endSeconds": 99,
        "audioFile": "/sounds/aprilia-tuono-v4-factory.mp3"
      }
    ]
  },
  {
    "manufacturer": "Royal Enfield",
    "name": "Interceptor 650",
    "slug": "royal-enfield-interceptor-650",
    "engine": "Parallel Twin",
    "era": null,
    "cylinders": "2",
    "year": "2018",
    "funFact": "Chaîne RoadBlastMedia spécialisée dans les sons moteurs.",
    "sources": [
      {
        "url": "https://www.youtube.com/watch?v=ufAWXiR4TV0",
        "videoId": "ufAWXiR4TV0",
        "startSeconds": 130,
        "endSeconds": 145,
        "audioFile": "/sounds/royal-enfield-interceptor-650.mp3"
      }
    ]
  },
  {
    "manufacturer": "BMW",
    "name": "S1000RR",
    "slug": "bmw-s1000rr-1766588817847",
    "engine": "Inline-4",
    "era": "modern",
    "cylinders": "4",
    "year": "2019",
    "funFact": "Développe plus de 200 ch et pèse moins de 200 kg.",
    "sources": [
      {
        "url": "https://www.youtube.com/watch?v=QzjHMv7w3v0",
        "videoId": "QzjHMv7w3v0",
        "startSeconds": 5,
        "endSeconds": 20,
        "audioFile": "/sounds/bmw-s1000rr.mp3"
      }
    ]
  },
  {
    "manufacturer": "KTM",
    "name": "1290 Super Duke R",
    "slug": "ktm-1290-super-duke-r-1766588817944",
    "engine": "LC8 V-Twin",
    "era": "modern",
    "cylinders": "2",
    "year": "2020",
    "funFact": "Surnommée 'The Beast', elle développe 180 ch.",
    "sources": [
      {
        "url": "https://www.youtube.com/watch?v=0Y7JW6Y0Vao",
        "videoId": "0Y7JW6Y0Vao",
        "startSeconds": 12,
        "endSeconds": 27,
        "audioFile": "/sounds/ktm-1290-super-duke-r.mp3"
      }
    ]
  },
  {
    "manufacturer": "BMW",
    "name": "R nineT",
    "slug": "bmw-r-ninet-1766588817969",
    "engine": "Boxer Twin",
    "era": "modern",
    "cylinders": "2",
    "year": "2021",
    "funFact": "Le moteur boxer à plat offre un centre de gravité très bas.",
    "sources": [
      {
        "url": "https://www.youtube.com/watch?v=jkl012mno34",
        "videoId": "jkl012mno34",
        "startSeconds": 6,
        "endSeconds": 21,
        "audioFile": "/sounds/bmw-r-ninet.mp3"
      }
    ]
  },
  {
    "manufacturer": "Ducati",
    "name": "Diavel V4",
    "slug": "ducati-diavel-v4-1766654169206",
    "engine": "V4 Granturismo",
    "era": "modern",
    "cylinders": "4",
    "year": "2023",
    "funFact": "Le Diavel V4 combine muscle cruiser et sportive avec 168 ch.",
    "sources": [
      {
        "url": "https://www.youtube.com/watch?v=HLt2pnnHIfc",
        "videoId": "HLt2pnnHIfc",
        "startSeconds": 151,
        "endSeconds": 166,
        "audioFile": "/sounds/ducati-diavel-v4.mp3"
      }
    ]
  },
  {
    "manufacturer": "Honda",
    "name": "CB1000R",
    "slug": "honda-cb1000r-1766654169332",
    "engine": "Inline-4",
    "era": "modern",
    "cylinders": "4",
    "year": "2021",
    "funFact": "Le CB1000R fait partie de la série Neo Sports Café au design épuré.",
    "sources": [
      {
        "url": "https://www.youtube.com/watch?v=3o34XDiLPsc",
        "videoId": "3o34XDiLPsc",
        "startSeconds": 205,
        "endSeconds": 220,
        "audioFile": "/sounds/honda-cb1000r.mp3"
      }
    ]
  },
  {
    "manufacturer": "Kawasaki",
    "name": "ZH2",
    "slug": "kawasaki-zh2-1766654169453",
    "engine": "Supercharged Inline-4",
    "era": "modern",
    "cylinders": "4",
    "year": "2020",
    "funFact": "La ZH2 est un hypernaked avec compresseur volumétrique de 200 ch.",
    "sources": [
      {
        "url": "https://www.youtube.com/watch?v=IimH7rMC7FM",
        "videoId": "IimH7rMC7FM",
        "startSeconds": 420,
        "endSeconds": 435,
        "audioFile": "/sounds/kawasaki-zh2.mp3"
      }
    ]
  },
  {
    "manufacturer": "Yamaha",
    "name": "FZ-09",
    "slug": "yamaha-fz-09-1766654169574",
    "engine": "CP3 Triple",
    "era": "modern",
    "cylinders": "3",
    "year": "2017",
    "funFact": "Le FZ-09 est la version américaine de la MT-09.",
    "sources": [
      {
        "url": "https://www.youtube.com/watch?v=5gsyzbj0SN4",
        "videoId": "5gsyzbj0SN4",
        "startSeconds": 23,
        "endSeconds": 38,
        "audioFile": "/sounds/yamaha-fz-09.mp3"
      }
    ]
  },
  {
    "manufacturer": "BMW",
    "name": "M 1000 RR",
    "slug": "bmw-m-1000-rr-1766654169693",
    "engine": "Inline-4",
    "era": "modern",
    "cylinders": "4",
    "year": "2021",
    "funFact": "Première moto M de BMW, inspirée de la M GmbH automobile.",
    "sources": [
      {
        "url": "https://www.youtube.com/watch?v=nWqkYJlvko4",
        "videoId": "nWqkYJlvko4",
        "startSeconds": 298,
        "endSeconds": 313,
        "audioFile": "/sounds/bmw-m-1000-rr.mp3"
      }
    ]
  },
  {
    "manufacturer": "Triumph",
    "name": "Speed Triple 1200 RS",
    "slug": "triumph-speed-triple-1200-rs-1766654169813",
    "engine": "Triple 1160",
    "era": "modern",
    "cylinders": "3",
    "year": "2021",
    "funFact": "La Speed Triple est considérée comme l'inventeur du segment naked sportif.",
    "sources": [
      {
        "url": "https://www.youtube.com/watch?v=EbKi-dScGk8",
        "videoId": "EbKi-dScGk8",
        "startSeconds": 843,
        "endSeconds": 858,
        "audioFile": "/sounds/triumph-speed-triple-1200-rs.mp3"
      }
    ]
  },
  {
    "manufacturer": "KTM",
    "name": "RC 390",
    "slug": "ktm-rc-390-1766654169935",
    "engine": "Single Cylinder",
    "era": "modern",
    "cylinders": "1",
    "year": "2022",
    "funFact": "La RC 390 est une sportive accessible avec un monocylindre de 373cc.",
    "sources": [
      {
        "url": "https://www.youtube.com/watch?v=y220SiaIR-E",
        "videoId": "y220SiaIR-E",
        "startSeconds": 125,
        "endSeconds": 140,
        "audioFile": "/sounds/ktm-rc-390.mp3"
      }
    ]
  },
  {
    "manufacturer": "Suzuki",
    "name": "V-Strom 1050",
    "slug": "suzuki-v-strom-1050-1766654170056",
    "engine": "V-Twin",
    "era": "modern",
    "cylinders": "2",
    "year": "2020",
    "funFact": "La V-Strom 1050 est une trail routière confortable pour les grands voyages.",
    "sources": [
      {
        "url": "https://www.youtube.com/watch?v=TMZHgc1SepA",
        "videoId": "TMZHgc1SepA",
        "startSeconds": 290,
        "endSeconds": 305,
        "audioFile": "/sounds/suzuki-v-strom-1050.mp3"
      }
    ]
  },
  {
    "manufacturer": "Aprilia",
    "name": "Shiver 900",
    "slug": "aprilia-shiver-900-1766654170177",
    "engine": "V-Twin",
    "era": "modern",
    "cylinders": "2",
    "year": "2018",
    "funFact": "Le Shiver 900 est un roadster équilibré avec un V-twin de 896cc.",
    "sources": [
      {
        "url": "https://www.youtube.com/watch?v=189hLH8EGRw",
        "videoId": "189hLH8EGRw",
        "startSeconds": 233,
        "endSeconds": 248,
        "audioFile": "/sounds/aprilia-shiver-900.mp3"
      }
    ]
  },
  {
    "manufacturer": "Honda",
    "name": "NC750X",
    "slug": "honda-nc750x-1766654170311",
    "engine": "Parallel Twin",
    "era": "modern",
    "cylinders": "2",
    "year": "2021",
    "funFact": "Le NC750X a un compartiment de rangement à la place du réservoir.",
    "sources": [
      {
        "url": "https://www.youtube.com/watch?v=JJg4DEgFfeE",
        "videoId": "JJg4DEgFfeE",
        "startSeconds": 239,
        "endSeconds": 254,
        "audioFile": "/sounds/honda-nc750x.mp3"
      }
    ]
  },
  {
    "manufacturer": "Kawasaki",
    "name": "Vulcan S",
    "slug": "kawasaki-vulcan-s-1766654170432",
    "engine": "Parallel Twin",
    "era": "modern",
    "cylinders": "2",
    "year": "2020",
    "funFact": "Le Vulcan S est un cruiser avec le moteur de la Ninja 650.",
    "sources": [
      {
        "url": "https://www.youtube.com/watch?v=c3AqNaZh28k",
        "videoId": "c3AqNaZh28k",
        "startSeconds": 421,
        "endSeconds": 436,
        "audioFile": "/sounds/kawasaki-vulcan-s.mp3"
      }
    ]
  },
  {
    "manufacturer": "Yamaha",
    "name": "VMAX",
    "slug": "yamaha-vmax-1766654170553",
    "engine": "V4",
    "era": "modern",
    "cylinders": "4",
    "year": "2017",
    "funFact": "Le VMAX est un power cruiser avec un V4 de 1679cc et 200 ch.",
    "sources": [
      {
        "url": "https://www.youtube.com/watch?v=OmeauOA-htk",
        "videoId": "OmeauOA-htk",
        "startSeconds": 147,
        "endSeconds": 162,
        "audioFile": "/sounds/yamaha-vmax.mp3"
      }
    ]
  },
  {
    "manufacturer": "Moto Guzzi",
    "name": "V85 TT",
    "slug": "moto-guzzi-v85-tt-1766654170673",
    "engine": "V-Twin",
    "era": "modern",
    "cylinders": "2",
    "year": "2019",
    "funFact": "Moto Guzzi est célèbre pour ses V-twin longitudinaux depuis 1967.",
    "sources": [
      {
        "url": "https://www.youtube.com/watch?v=k7jkyO7ivw8",
        "videoId": "k7jkyO7ivw8",
        "startSeconds": 56,
        "endSeconds": 71,
        "audioFile": "/sounds/moto-guzzi-v85-tt.mp3"
      }
    ]
  },
  {
    "manufacturer": "Benelli",
    "name": "TRK 502",
    "slug": "benelli-trk-502-1766654170792",
    "engine": "Parallel Twin",
    "era": "modern",
    "cylinders": "2",
    "year": "2020",
    "funFact": "Le TRK 502 est une trail abordable avec un excellent rapport qualité-prix.",
    "sources": [
      {
        "url": "https://www.youtube.com/watch?v=iI3kiG6DmU0",
        "videoId": "iI3kiG6DmU0",
        "startSeconds": 362,
        "endSeconds": 377,
        "audioFile": "/sounds/benelli-trk-502.mp3"
      }
    ]
  },
  {
    "manufacturer": "Indian",
    "name": "FTR 1200",
    "slug": "indian-ftr-1200-1766659959982",
    "engine": "V-Twin",
    "era": "modern",
    "cylinders": "2",
    "year": "2019",
    "funFact": "L'Indian FTR 1200 est inspirée des motos de flat track racing.",
    "sources": [
      {
        "url": "https://www.youtube.com/watch?v=PPSxD-FJOgQ",
        "videoId": "PPSxD-FJOgQ",
        "startSeconds": 93,
        "endSeconds": 108,
        "audioFile": "/sounds/indian-ftr-1200.mp3"
      }
    ]
  },
  {
    "manufacturer": "MV Agusta",
    "name": "Brutale 1000 RR",
    "slug": "mv-agusta-brutale-1000-rr-1766659960123",
    "engine": "Inline-4",
    "era": "modern",
    "cylinders": "4",
    "year": "2020",
    "funFact": "La Brutale 1000 RR développe 208 ch, un record pour un naked bike.",
    "sources": [
      {
        "url": "https://www.youtube.com/watch?v=zl3hDy0C6Rk",
        "videoId": "zl3hDy0C6Rk",
        "startSeconds": 426,
        "endSeconds": 441,
        "audioFile": "/sounds/mv-agusta-brutale-1000-rr.mp3"
      }
    ]
  },
  {
    "manufacturer": "Husqvarna",
    "name": "Svartpilen 701",
    "slug": "husqvarna-svartpilen-701-1766659960244",
    "engine": "Single Cylinder",
    "era": "modern",
    "cylinders": "1",
    "year": "2020",
    "funFact": "Svartpilen signifie 'flèche noire' en suédois.",
    "sources": [
      {
        "url": "https://www.youtube.com/watch?v=TjZxQdbUmlk",
        "videoId": "TjZxQdbUmlk",
        "startSeconds": 324,
        "endSeconds": 339,
        "audioFile": "/sounds/husqvarna-svartpilen-701.mp3"
      }
    ]
  },
  {
    "manufacturer": "Aprilia",
    "name": "Tuono V4 1100",
    "slug": "aprilia-tuono-v4-1100-1766659960368",
    "engine": "V4",
    "era": "modern",
    "cylinders": "4",
    "year": "2021",
    "funFact": "Le Tuono V4 est considéré comme l'un des meilleurs roadsters sportifs.",
    "sources": [
      {
        "url": "https://www.youtube.com/watch?v=as8UZdbGmzY",
        "videoId": "as8UZdbGmzY",
        "startSeconds": 612,
        "endSeconds": 627,
        "audioFile": "/sounds/aprilia-tuono-v4-1100.mp3"
      }
    ]
  },
  {
    "manufacturer": "Kawasaki",
    "name": "Versys 650",
    "slug": "kawasaki-versys-650-1766659960491",
    "engine": "Parallel Twin",
    "era": "modern",
    "cylinders": "2",
    "year": "2022",
    "funFact": "Le Versys 650 est un trail polyvalent parfait pour voyager.",
    "sources": [
      {
        "url": "https://www.youtube.com/watch?v=y9L-oI1Cu7U",
        "videoId": "y9L-oI1Cu7U",
        "startSeconds": 435,
        "endSeconds": 450,
        "audioFile": "/sounds/kawasaki-versys-650.mp3"
      }
    ]
  },
  {
    "manufacturer": "Yamaha",
    "name": "XSR900",
    "slug": "yamaha-xsr900-1766659960612",
    "engine": "CP3 Triple",
    "era": "modern",
    "cylinders": "3",
    "year": "2022",
    "funFact": "Le XSR900 combine style néo-rétro et technologie moderne.",
    "sources": [
      {
        "url": "https://www.youtube.com/watch?v=xkrS6hvRDOw",
        "videoId": "xkrS6hvRDOw",
        "startSeconds": 231,
        "endSeconds": 246,
        "audioFile": "/sounds/yamaha-xsr900.mp3"
      }
    ]
  },
  {
    "manufacturer": "KTM",
    "name": "890 Duke R",
    "slug": "ktm-890-duke-r-1766659960733",
    "engine": "Parallel Twin",
    "era": "modern",
    "cylinders": "2",
    "year": "2020",
    "funFact": "La 890 Duke R est un scalpel pour la route avec 121 ch.",
    "sources": [
      {
        "url": "existing",
        "videoId": "existing",
        "startSeconds": 0,
        "endSeconds": 15,
        "audioFile": "/sounds/ktm-890-duke-r.mp3"
      }
    ]
  },
  {
    "manufacturer": "Harley-Davidson",
    "name": "Street Bob",
    "slug": "harley-davidson-street-bob-1766661677573",
    "engine": "Milwaukee-Eight V-Twin",
    "era": "modern",
    "cylinders": "2",
    "year": "2021",
    "funFact": "Le Street Bob est un bobber minimaliste avec le moteur Milwaukee-Eight de 107ci.",
    "sources": [
      {
        "url": "https://www.youtube.com/watch?v=EIexyJbiGWM",
        "videoId": "EIexyJbiGWM",
        "startSeconds": 1196,
        "endSeconds": 1211,
        "audioFile": "/sounds/harley-davidson-street-bob.mp3"
      }
    ]
  },
  {
    "manufacturer": "Norton",
    "name": "Commando 961",
    "slug": "norton-commando-961-1766663151901",
    "engine": "Parallel Twin",
    "era": "modern",
    "cylinders": "2",
    "year": "2018",
    "funFact": "La Norton Commando est une icône britannique relancée en 2010.",
    "sources": [
      {
        "url": "https://www.youtube.com/watch?v=cbQup_GcGQE-1766663178256",
        "videoId": "cbQup_GcGQE",
        "startSeconds": 322,
        "endSeconds": 337,
        "audioFile": "/sounds/norton-commando-961.mp3"
      }
    ]
  },
  {
    "manufacturer": "Buell",
    "name": "XB12S Lightning",
    "slug": "buell-xb12s-lightning-1766663151927",
    "engine": "V-Twin",
    "era": "modern",
    "cylinders": "2",
    "year": "2009",
    "funFact": "Buell était la marque sportive de Harley-Davidson, connue pour son design innovant.",
    "sources": [
      {
        "url": "https://www.youtube.com/watch?v=mXaeoQaDBM4",
        "videoId": "mXaeoQaDBM4",
        "startSeconds": 383,
        "endSeconds": 398,
        "audioFile": "/sounds/buell-xb12s-lightning.mp3"
      }
    ]
  }
];

const main = async () => {
  console.log(`Seeding ${seeds.length} motorcycles...`);

  for (const moto of seeds) {
    const createdMoto = await prisma.moto.upsert({
      where: { slug: moto.slug },
      update: {
        funFact: moto.funFact,
        engine: moto.engine,
        era: moto.era,
      },
      create: {
        manufacturer: moto.manufacturer,
        name: moto.name,
        slug: moto.slug,
        engine: moto.engine,
        era: moto.era,
        cylinders: moto.cylinders,
        year: moto.year,
        funFact: moto.funFact,
      },
    });

    for (const source of moto.sources) {
      const createdSource = await prisma.source.upsert({
        where: { url: source.url },
        update: {
          startSeconds: source.startSeconds,
          endSeconds: source.endSeconds,
          duration: source.endSeconds - source.startSeconds,
          audioFile: source.audioFile,
          motoId: createdMoto.id,
        },
        create: {
          url: source.url,
          videoId: source.videoId,
          startSeconds: source.startSeconds,
          endSeconds: source.endSeconds,
          duration: source.endSeconds - source.startSeconds,
          audioFile: source.audioFile,
          motoId: createdMoto.id,
        },
      });

      await prisma.round.create({
        data: {
          sourceId: createdSource.id,
          status: "PENDING",
          difficulty: 2,
        },
      });
    }
  }

  console.log(`✅ Seeded ${seeds.length} motorcycles successfully!`);
};

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
