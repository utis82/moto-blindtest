import { useEffect, useState } from "react";

// Logos SVG réalistes des marques de motos
const BRAND_LOGOS = {
  Honda: () => (
    <svg viewBox="0 0 120 40" fill="currentColor">
      {/* Logo Honda en forme de H avec ailes */}
      <path d="M15,8 L15,32 M15,20 L35,20 M35,8 L35,32" stroke="currentColor" strokeWidth="3" fill="none" strokeLinecap="round"/>
      <path d="M50,20 L55,8 L60,20 L65,8 L70,20 L75,8 L80,20" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinejoin="round"/>
      <path d="M90,8 L90,32 M105,8 L105,32 M90,8 L105,8 M90,20 L105,20 M90,32 L105,32" stroke="currentColor" strokeWidth="2.5" fill="none"/>
    </svg>
  ),

  Yamaha: () => (
    <svg viewBox="0 0 120 40" fill="currentColor">
      {/* Trois diapasons Yamaha */}
      <g transform="translate(25, 20)">
        <circle cx="0" cy="0" r="3" />
        <line x1="0" y1="3" x2="-8" y2="15" stroke="currentColor" strokeWidth="2"/>
        <line x1="0" y1="3" x2="8" y2="15" stroke="currentColor" strokeWidth="2"/>
      </g>
      <g transform="translate(50, 20)">
        <circle cx="0" cy="0" r="3" />
        <line x1="0" y1="3" x2="-8" y2="15" stroke="currentColor" strokeWidth="2"/>
        <line x1="0" y1="3" x2="8" y2="15" stroke="currentColor" strokeWidth="2"/>
      </g>
      <g transform="translate(75, 20)">
        <circle cx="0" cy="0" r="3" />
        <line x1="0" y1="3" x2="-8" y2="15" stroke="currentColor" strokeWidth="2"/>
        <line x1="0" y1="3" x2="8" y2="15" stroke="currentColor" strokeWidth="2"/>
      </g>
    </svg>
  ),

  Ducati: () => (
    <svg viewBox="0 0 120 40" fill="currentColor">
      {/* Triangle Ducati */}
      <path d="M60,5 L100,35 L20,35 Z" stroke="currentColor" strokeWidth="2.5" fill="none"/>
      <path d="M60,15 L80,30 L40,30 Z" stroke="currentColor" strokeWidth="2" fill="none"/>
    </svg>
  ),

  Kawasaki: () => (
    <svg viewBox="0 0 120 40" fill="currentColor">
      {/* K stylisé de Kawasaki avec rivière */}
      <path d="M15,8 L15,32 M15,20 L35,8 M15,20 L35,32" stroke="currentColor" strokeWidth="3" fill="none" strokeLinecap="round"/>
      <path d="M45,15 Q50,10 55,15 Q60,20 65,15 Q70,10 75,15 Q80,20 85,15" stroke="currentColor" strokeWidth="2.5" fill="none"/>
      <path d="M45,25 Q50,20 55,25 Q60,30 65,25 Q70,20 75,25 Q80,30 85,25" stroke="currentColor" strokeWidth="2.5" fill="none"/>
    </svg>
  ),

  Suzuki: () => (
    <svg viewBox="0 0 120 40" fill="currentColor">
      {/* S stylisé de Suzuki */}
      <path d="M30,12 Q40,8 50,12 Q60,16 60,22 Q60,28 50,28 Q40,28 30,32 Q20,36 20,28 Q20,22 30,22" stroke="currentColor" strokeWidth="3" fill="none"/>
      <circle cx="80" cy="20" r="12" stroke="currentColor" strokeWidth="2.5" fill="none"/>
      <line x1="92" y1="20" x2="105" y2="20" stroke="currentColor" strokeWidth="2.5"/>
    </svg>
  ),

  KTM: () => (
    <svg viewBox="0 0 120 40" fill="currentColor">
      {/* Logo KTM angulaire */}
      <path d="M15,8 L15,32 M15,20 L30,8 M15,20 L30,32" stroke="currentColor" strokeWidth="3.5" fill="none" strokeLinecap="square"/>
      <path d="M45,8 L55,8 L55,32 M55,8 L45,32" stroke="currentColor" strokeWidth="3.5" fill="none" strokeLinecap="square"/>
      <path d="M70,8 L70,32 M70,8 L85,20 L70,32 M85,8 L85,32" stroke="currentColor" strokeWidth="3.5" fill="none" strokeLinecap="square"/>
    </svg>
  ),

  BMW: () => (
    <svg viewBox="0 0 120 40" fill="currentColor">
      {/* Roundel BMW classique */}
      <circle cx="60" cy="20" r="16" stroke="currentColor" strokeWidth="2.5" fill="none"/>
      <path d="M60,4 L60,36 M44,20 L76,20" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M44,4 Q60,4 60,20 Q60,4 76,4" fill="currentColor" opacity="0.3"/>
      <path d="M44,36 Q60,36 60,20 Q60,36 76,36" fill="currentColor" opacity="0.3"/>
    </svg>
  ),

  Aprilia: () => (
    <svg viewBox="0 0 120 40" fill="currentColor">
      {/* A stylisé Aprilia */}
      <path d="M30,32 L45,8 L60,32 M35,24 L55,24" stroke="currentColor" strokeWidth="3" fill="none" strokeLinecap="round"/>
      <path d="M70,8 L70,32 M70,8 L90,8 Q100,8 100,18 Q100,28 90,28 L70,28" stroke="currentColor" strokeWidth="2.5" fill="none"/>
    </svg>
  ),

  Harley: () => (
    <svg viewBox="0 0 120 40" fill="currentColor">
      {/* Logo Bar & Shield Harley-Davidson */}
      <rect x="30" y="5" width="60" height="30" rx="3" stroke="currentColor" strokeWidth="2.5" fill="none"/>
      <path d="M35,12 L85,12 M35,20 L85,20 M35,28 L85,28" stroke="currentColor" strokeWidth="1.5"/>
      <circle cx="60" cy="20" r="8" stroke="currentColor" strokeWidth="2" fill="none"/>
    </svg>
  ),

  Triumph: () => (
    <svg viewBox="0 0 120 40" fill="currentColor">
      {/* Logo Triumph avec cercle et lettres */}
      <circle cx="60" cy="20" r="15" stroke="currentColor" strokeWidth="2.5" fill="none"/>
      <path d="M50,15 L50,25 M55,15 L55,25 M60,15 L60,25 M65,15 L65,25 M70,15 L70,25" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M48,15 L72,15 M48,20 L72,20 M48,25 L72,25" stroke="currentColor" strokeWidth="1"/>
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
  delay: number;
}

export function BrandLogosBackground() {
  const [logos, setLogos] = useState<Logo[]>([]);

  useEffect(() => {
    const brands = Object.keys(BRAND_LOGOS) as (keyof typeof BRAND_LOGOS)[];

    // Créer 4 rangées de logos qui défilent
    const rows = 4;
    const logosPerRow = 6;
    const initialLogos: Logo[] = [];

    for (let row = 0; row < rows; row++) {
      for (let i = 0; i < logosPerRow; i++) {
        const brand = brands[Math.floor(Math.random() * brands.length)];
        initialLogos.push({
          id: `${row}-${i}`,
          brand,
          x: (i / logosPerRow) * 150 + (row % 2 === 0 ? 0 : -50), // Décalage alterné
          y: 15 + row * 22, // 4 rangées espacées
          size: 50 + Math.random() * 30, // 50-80px
          speed: 25 + Math.random() * 20 + row * 5, // Vitesses variées par rangée
          delay: i * 3, // Délai séquentiel
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
            className="absolute"
            style={{
              left: `${logo.x}%`,
              top: `${logo.y}%`,
              width: `${logo.size}px`,
              height: `${logo.size * 0.33}px`,
              color: '#DAA520', // Or direct
              opacity: 0.12,
              animation: `scrollHorizontal ${logo.speed}s linear ${logo.delay}s infinite`,
              filter: 'drop-shadow(0 0 6px rgba(218, 165, 32, 0.25))',
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
            transform: translateX(-150vw);
          }
        }
      `}</style>
    </div>
  );
}
