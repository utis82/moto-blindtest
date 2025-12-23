import { useEffect, useState } from "react";

const BRANDS = [
  "Honda",
  "Yamaha",
  "Ducati",
  "Kawasaki",
  "Suzuki",
  "KTM",
  "BMW",
  "Aprilia",
  "Harley-Davidson",
  "Triumph",
  "MV Agusta",
  "Benelli",
  "Royal Enfield",
];

interface Logo {
  id: number;
  brand: string;
  x: number; // Position horizontale (%)
  y: number; // Position verticale (%)
  size: number; // Taille en rem
  duration: number; // Durée animation (s)
  delay: number; // Délai avant apparition (s)
  angle: number; // Rotation (deg)
}

export function BrandLogosBackground() {
  const [logos, setLogos] = useState<Logo[]>([]);

  useEffect(() => {
    // Générer 15-20 logos aléatoires
    const count = 15 + Math.floor(Math.random() * 6);
    const generatedLogos: Logo[] = [];

    for (let i = 0; i < count; i++) {
      generatedLogos.push({
        id: i,
        brand: BRANDS[Math.floor(Math.random() * BRANDS.length)],
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: 2 + Math.random() * 4, // 2-6rem
        duration: 8 + Math.random() * 12, // 8-20s
        delay: Math.random() * 10, // 0-10s
        angle: -45 + Math.random() * 90, // -45 à 45 degrés
      });
    }

    setLogos(generatedLogos);

    // Régénérer périodiquement quelques logos pour variation
    const interval = setInterval(() => {
      setLogos((prev) => {
        const newLogos = [...prev];
        const indexToReplace = Math.floor(Math.random() * newLogos.length);
        newLogos[indexToReplace] = {
          id: Date.now(),
          brand: BRANDS[Math.floor(Math.random() * BRANDS.length)],
          x: Math.random() * 100,
          y: Math.random() * 100,
          size: 2 + Math.random() * 4,
          duration: 8 + Math.random() * 12,
          delay: 0,
          angle: -45 + Math.random() * 90,
        };
        return newLogos;
      });
    }, 5000); // Remplacer un logo toutes les 5 secondes

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {logos.map((logo) => (
        <div
          key={logo.id}
          className="absolute text-gold-500/8 font-black uppercase tracking-wider select-none animate-float-fade"
          style={{
            left: `${logo.x}%`,
            top: `${logo.y}%`,
            fontSize: `${logo.size}rem`,
            transform: `rotate(${logo.angle}deg)`,
            animation: `floatFade ${logo.duration}s ease-in-out ${logo.delay}s infinite`,
            textShadow: "0 0 20px rgba(218, 165, 32, 0.3)",
          }}
        >
          {logo.brand}
        </div>
      ))}

      <style>{`
        @keyframes floatFade {
          0%, 100% {
            opacity: 0;
            transform: translateY(0) rotate(var(--rotation));
          }
          10%, 90% {
            opacity: 0.08;
          }
          50% {
            opacity: 0.12;
            transform: translateY(-30px) rotate(var(--rotation));
          }
        }
      `}</style>
    </div>
  );
}
