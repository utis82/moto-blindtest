import { useEffect, useState } from "react";

// Logos SVG simplifiés des marques (silhouettes iconiques)
const BRAND_LOGOS = {
  Honda: () => (
    <svg viewBox="0 0 100 40" className="w-full h-full">
      <path d="M10,10 L10,30 M10,20 L30,20 M30,10 L30,30" stroke="currentColor" strokeWidth="2" fill="none" />
      <circle cx="50" cy="20" r="15" stroke="currentColor" strokeWidth="2" fill="none" />
      <path d="M70,10 L70,30 M70,10 L85,30 M85,10 L85,30" stroke="currentColor" strokeWidth="2" fill="none" />
    </svg>
  ),
  Yamaha: () => (
    <svg viewBox="0 0 100 40" className="w-full h-full">
      <path d="M15,10 L25,30 M25,30 L35,10 M45,10 L45,30 M55,10 L55,30 L70,30 M80,10 L80,30 M80,10 L95,30 M95,10 L95,30" stroke="currentColor" strokeWidth="2" fill="none" />
    </svg>
  ),
  Ducati: () => (
    <svg viewBox="0 0 100 40" className="w-full h-full">
      <path d="M10,10 L10,30 L25,30 Q35,30 35,20 Q35,10 25,10 Z" stroke="currentColor" strokeWidth="2" fill="none" />
      <path d="M45,10 L45,30 M45,20 L65,20 M65,10 L65,30" stroke="currentColor" strokeWidth="2" fill="none" />
      <rect x="75" y="10" width="15" height="20" stroke="currentColor" strokeWidth="2" fill="none" />
    </svg>
  ),
  Kawasaki: () => (
    <svg viewBox="0 0 100 40" className="w-full h-full">
      <path d="M10,10 L10,30 M10,18 L20,30 M20,10 L10,22 M30,10 L30,30 M30,10 L45,28 M50,10 L50,30 M50,10 L35,28" stroke="currentColor" strokeWidth="2" fill="none" />
    </svg>
  ),
  Suzuki: () => (
    <svg viewBox="0 0 100 40" className="w-full h-full">
      <path d="M10,10 Q10,15 15,15 Q20,15 20,20 Q20,25 15,25 Q10,25 10,30 M30,10 L30,30 M30,10 L45,30 L60,10 L60,30" stroke="currentColor" strokeWidth="2" fill="none" />
    </svg>
  ),
  KTM: () => (
    <svg viewBox="0 0 100 40" className="w-full h-full">
      <path d="M10,10 L10,30 M10,18 L20,30 M20,10 L10,22 M30,10 L30,30 M40,10 L30,10 M40,10 L40,30" stroke="currentColor" strokeWidth="2" fill="none" />
      <path d="M50,10 L50,30 M50,10 L60,20 L50,30 M60,10 L60,30" stroke="currentColor" strokeWidth="2" fill="none" />
    </svg>
  ),
  BMW: () => (
    <svg viewBox="0 0 100 40" className="w-full h-full">
      <circle cx="50" cy="20" r="15" stroke="currentColor" strokeWidth="2" fill="none" />
      <path d="M50,5 L50,35 M35,20 L65,20" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="42" cy="12" r="2" fill="currentColor" />
      <circle cx="58" cy="28" r="2" fill="currentColor" />
    </svg>
  ),
  Aprilia: () => (
    <svg viewBox="0 0 100 40" className="w-full h-full">
      <path d="M20,30 L30,10 L40,30 M25,22 L35,22 M50,10 L50,30 L60,30 Q70,30 70,20 Q70,10 60,10 L50,10" stroke="currentColor" strokeWidth="2" fill="none" />
    </svg>
  ),
  Harley: () => (
    <svg viewBox="0 0 100 40" className="w-full h-full">
      <path d="M10,10 L10,30 M10,20 L25,20 M25,10 L25,30 M35,10 L35,30 L50,30 Q60,30 60,20 Q60,10 50,10 L35,10" stroke="currentColor" strokeWidth="2" fill="none" />
    </svg>
  ),
  Triumph: () => (
    <svg viewBox="0 0 100 40" className="w-full h-full">
      <path d="M10,10 L30,10 M20,10 L20,30 M40,10 L40,30 L50,30 Q60,30 60,25 Q60,20 50,20 L40,20" stroke="currentColor" strokeWidth="2" fill="none" />
    </svg>
  ),
};

interface Logo {
  id: string;
  brand: keyof typeof BRAND_LOGOS;
  x: number;
  y: number;
  size: number;
  speed: number;
}

export function BrandLogosBackground() {
  const [logos, setLogos] = useState<Logo[]>([]);

  useEffect(() => {
    const brands = Object.keys(BRAND_LOGOS) as (keyof typeof BRAND_LOGOS)[];

    // Créer 3 rangées de logos qui défilent
    const rows = 3;
    const logosPerRow = 8;
    const initialLogos: Logo[] = [];

    for (let row = 0; row < rows; row++) {
      for (let i = 0; i < logosPerRow; i++) {
        const brand = brands[Math.floor(Math.random() * brands.length)];
        initialLogos.push({
          id: `${row}-${i}`,
          brand,
          x: (i / logosPerRow) * 120, // Espacés sur 120% pour créer un défilement continu
          y: 20 + row * 30, // 3 rangées : 20%, 50%, 80%
          size: 60 + Math.random() * 40, // 60-100px
          speed: 20 + Math.random() * 20, // 20-40s par cycle
        });
      }
    }

    setLogos(initialLogos);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {logos.map((logo) => {
        const LogoComponent = BRAND_LOGOS[logo.brand];
        return (
          <div
            key={logo.id}
            className="absolute text-gold-500/10 animate-scroll-horizontal"
            style={{
              left: `${logo.x}%`,
              top: `${logo.y}%`,
              width: `${logo.size}px`,
              height: `${logo.size * 0.4}px`, // Ratio largeur/hauteur
              animation: `scrollHorizontal ${logo.speed}s linear infinite`,
              filter: 'drop-shadow(0 0 8px rgba(218, 165, 32, 0.2))',
            }}
          >
            <LogoComponent />
          </div>
        );
      })}

      <style>{`
        @keyframes scrollHorizontal {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-120vw);
          }
        }
      `}</style>
    </div>
  );
}
