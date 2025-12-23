import { useEffect, useState } from "react";

// Logos SVG simplifiés mais reconnaissables basés sur les vrais logos
const BRAND_LOGOS = {
  Honda: () => (
    <svg viewBox="0 0 100 60" fill="none">
      {/* Aile Honda stylisée */}
      <path d="M10,30 L25,10 L40,25 L50,15 L60,25 L75,10 L90,30" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round"/>
      <path d="M25,10 L25,50 M75,10 L75,50" stroke="currentColor" strokeWidth="2"/>
      <text x="50" y="45" fontSize="18" fontWeight="bold" textAnchor="middle" fill="currentColor">HONDA</text>
    </svg>
  ),

  Yamaha: () => (
    <svg viewBox="0 0 100 60" fill="none">
      {/* Cercle Yamaha avec diapasons */}
      <circle cx="50" cy="30" r="25" stroke="currentColor" strokeWidth="2.5"/>
      <g transform="translate(50, 30)">
        {/* 3 diapasons stylisés */}
        <circle cx="-12" cy="-8" r="2.5" fill="currentColor"/>
        <line x1="-12" y1="-5" x2="-18" y2="8" stroke="currentColor" strokeWidth="2"/>
        <line x1="-12" y1="-5" x2="-6" y2="8" stroke="currentColor" strokeWidth="2"/>

        <circle cx="0" cy="-8" r="2.5" fill="currentColor"/>
        <line x1="0" y1="-5" x2="-6" y2="8" stroke="currentColor" strokeWidth="2"/>
        <line x1="0" y1="-5" x2="6" y2="8" stroke="currentColor" strokeWidth="2"/>

        <circle cx="12" cy="-8" r="2.5" fill="currentColor"/>
        <line x1="12" y1="-5" x2="6" y2="8" stroke="currentColor" strokeWidth="2"/>
        <line x1="12" y1="-5" x2="18" y2="8" stroke="currentColor" strokeWidth="2"/>
      </g>
    </svg>
  ),

  Ducati: () => (
    <svg viewBox="0 0 100 60" fill="none">
      {/* Triangle + bouclier Ducati */}
      <path d="M50,8 L85,52 L15,52 Z" stroke="currentColor" strokeWidth="2.5" fill="currentColor" fillOpacity="0.1"/>
      <path d="M50,20 L70,45 L30,45 Z" stroke="currentColor" strokeWidth="2"/>
      <text x="50" y="42" fontSize="12" fontWeight="bold" textAnchor="middle" fill="currentColor">DUCATI</text>
    </svg>
  ),

  Kawasaki: () => (
    <svg viewBox="0 0 100 60" fill="none">
      {/* K stylisé + rivières vertes */}
      <path d="M20,10 L20,50 M20,30 L45,10 M20,30 L45,50" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
      <path d="M55,20 Q60,15 65,20 Q70,25 75,20" stroke="currentColor" strokeWidth="2.5" fill="none"/>
      <path d="M55,30 Q60,25 65,30 Q70,35 75,30" stroke="currentColor" strokeWidth="2.5" fill="none"/>
      <path d="M55,40 Q60,35 65,40 Q70,45 75,40" stroke="currentColor" strokeWidth="2.5" fill="none"/>
    </svg>
  ),

  Suzuki: () => (
    <svg viewBox="0 0 100 60" fill="none">
      {/* S stylisé de Suzuki */}
      <path d="M25,20 Q35,12 45,20 Q50,25 50,30 Q50,35 45,38 Q35,40 30,45 Q25,50 35,50" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
      <text x="70" y="35" fontSize="16" fontWeight="bold" fill="currentColor">SUZUKI</text>
    </svg>
  ),

  KTM: () => (
    <svg viewBox="0 0 100 60" fill="none">
      {/* Logo KTM angulaire et orangé */}
      <rect x="10" y="15" width="80" height="30" stroke="currentColor" strokeWidth="3" rx="2"/>
      <text x="50" y="38" fontSize="24" fontWeight="black" textAnchor="middle" fill="currentColor">KTM</text>
    </svg>
  ),

  BMW: () => (
    <svg viewBox="0 0 100 60" fill="none">
      {/* Roundel BMW classique */}
      <circle cx="50" cy="30" r="24" stroke="currentColor" strokeWidth="3"/>
      <path d="M50,6 L50,54 M26,30 L74,30" stroke="currentColor" strokeWidth="2"/>
      <path d="M26,6 A24,24 0 0,1 50,30 L50,6 Z" fill="currentColor" fillOpacity="0.15"/>
      <path d="M50,30 A24,24 0 0,1 74,54 L50,30 Z" fill="currentColor" fillOpacity="0.15"/>
      <text x="50" y="58" fontSize="10" fontWeight="bold" textAnchor="middle" fill="currentColor">BMW</text>
    </svg>
  ),

  Aprilia: () => (
    <svg viewBox="0 0 100 60" fill="none">
      {/* A stylisé rouge d'Aprilia */}
      <path d="M30,50 L50,10 L70,50 M35,38 L65,38" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round"/>
      <rect x="20" y="8" width="60" height="5" fill="currentColor"/>
    </svg>
  ),

  Harley: () => (
    <svg viewBox="0 0 100 60" fill="none">
      {/* Bar & Shield Harley-Davidson */}
      <path d="M50,10 L65,15 L70,30 L65,45 L50,50 L35,45 L30,30 L35,15 Z" stroke="currentColor" strokeWidth="2.5" fill="currentColor" fillOpacity="0.1"/>
      <rect x="25" y="8" width="50" height="8" fill="currentColor"/>
      <rect x="25" y="44" width="50" height="8" fill="currentColor"/>
      <text x="50" y="33" fontSize="11" fontWeight="bold" textAnchor="middle" fill="currentColor">HARLEY</text>
    </svg>
  ),

  Triumph: () => (
    <svg viewBox="0 0 100 60" fill="none">
      {/* Badge circulaire Triumph */}
      <circle cx="50" cy="30" r="24" stroke="currentColor" strokeWidth="2.5"/>
      <path d="M30,20 L70,20 M40,30 L60,30 M30,40 L70,40" stroke="currentColor" strokeWidth="2"/>
      <text x="50" y="53" fontSize="10" fontWeight="bold" textAnchor="middle" fill="currentColor">TRIUMPH</text>
    </svg>
  ),

  MV_Agusta: () => (
    <svg viewBox="0 0 100 60" fill="none">
      {/* Logo MV Agusta avec couronne */}
      <circle cx="50" cy="28" r="20" stroke="currentColor" strokeWidth="2"/>
      <path d="M50,8 L53,15 L50,12 L47,15 Z" fill="currentColor"/>
      <text x="50" y="32" fontSize="14" fontWeight="bold" textAnchor="middle" fill="currentColor">MV</text>
    </svg>
  ),

  Benelli: () => (
    <svg viewBox="0 0 100 60" fill="none">
      {/* Lion stylisé de Benelli */}
      <circle cx="50" cy="28" r="22" stroke="currentColor" strokeWidth="2.5"/>
      <path d="M35,25 L50,18 L65,25 L50,32 Z" stroke="currentColor" strokeWidth="2" fill="currentColor" fillOpacity="0.15"/>
      <text x="50" y="48" fontSize="9" fontWeight="bold" textAnchor="middle" fill="currentColor">BENELLI</text>
    </svg>
  ),

  Royal_Enfield: () => (
    <svg viewBox="0 0 100 60" fill="none">
      {/* Couronne Royal Enfield */}
      <path d="M50,12 L55,20 L50,18 L45,20 Z M40,20 L60,20" stroke="currentColor" strokeWidth="2" fill="currentColor"/>
      <circle cx="50" cy="32" r="18" stroke="currentColor" strokeWidth="2.5"/>
      <text x="50" y="36" fontSize="11" fontWeight="bold" textAnchor="middle" fill="currentColor">RE</text>
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
    const logosPerRow = 5;
    const initialLogos: Logo[] = [];

    for (let row = 0; row < rows; row++) {
      for (let i = 0; i < logosPerRow; i++) {
        const brand = brands[Math.floor(Math.random() * brands.length)];
        initialLogos.push({
          id: `${row}-${i}-${Date.now()}`,
          brand,
          x: (i / logosPerRow) * 140 + (row % 2 === 0 ? 0 : -40), // Décalage alterné
          y: 12 + row * 24, // 4 rangées espacées
          size: 60 + Math.random() * 25, // 60-85px
          speed: 30 + Math.random() * 25 + row * 5, // Vitesses variées
          delay: i * 4 + row * 2, // Délai séquentiel
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
              height: `${logo.size * 0.6}px`,
              color: '#DAA520', // Or goldenrod
              opacity: 0.1,
              animation: `scrollHorizontal ${logo.speed}s linear ${logo.delay}s infinite`,
              filter: 'drop-shadow(0 0 4px rgba(218, 165, 32, 0.2))',
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
            transform: translateX(-140vw);
          }
        }
      `}</style>
    </div>
  );
}
