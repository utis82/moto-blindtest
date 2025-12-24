import { useEffect, useState } from "react";
import * as SimpleIcons from "simple-icons";

// Mapping des marques de motos disponibles dans simple-icons
const BRAND_ICONS = {
  Honda: SimpleIcons.siHonda,
  Ducati: SimpleIcons.siDucati,
  Suzuki: SimpleIcons.siSuzuki,
  KTM: SimpleIcons.siKtm,
  BMW: SimpleIcons.siBmw,
};

interface Logo {
  id: string;
  brand: keyof typeof BRAND_ICONS;
  x: number;
  y: number;
  size: number;
  speed: number;
  delay: number;
  direction: 'left' | 'right';
}

export function BrandLogosBackground() {
  const [logos, setLogos] = useState<Logo[]>([]);

  useEffect(() => {
    const brands = Object.keys(BRAND_ICONS) as (keyof typeof BRAND_ICONS)[];

    // Créer 4 rangées de logos qui défilent
    const rows = 4;
    const logosPerRow = 8;
    const initialLogos: Logo[] = [];

    // Créer un tableau de marques mélangées pour éviter les répétitions
    const shuffledBrands: (keyof typeof BRAND_ICONS)[] = [];
    for (let i = 0; i < rows * logosPerRow; i++) {
      shuffledBrands.push(brands[i % brands.length]);
    }
    // Mélanger aléatoirement
    for (let i = shuffledBrands.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledBrands[i], shuffledBrands[j]] = [shuffledBrands[j], shuffledBrands[i]];
    }

    let brandIndex = 0;
    for (let row = 0; row < rows; row++) {
      const isEvenRow = row % 2 === 0;
      for (let i = 0; i < logosPerRow; i++) {
        initialLogos.push({
          id: `${row}-${i}-${Date.now()}-${Math.random()}`,
          brand: shuffledBrands[brandIndex++],
          x: (i / logosPerRow) * 150 - 20, // Décalage pour commencer hors écran
          y: 10 + row * 22,
          size: 55 + Math.random() * 35,
          speed: 35 + Math.random() * 20,
          delay: 0, // Pas de délai, tout démarre immédiatement
          direction: isEvenRow ? 'left' : 'right',
        });
      }
    }

    setLogos(initialLogos);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 1 }}>
      {logos.map((logo) => {
        const icon = BRAND_ICONS[logo.brand];

        if (!icon || !icon.path) {
          return null;
        }

        return (
          <div
            key={logo.id}
            className="absolute"
            style={{
              left: `${logo.x}%`,
              top: `${logo.y}%`,
              width: `${logo.size}px`,
              height: `${logo.size}px`,
              opacity: 0.12,
              animation: `scroll${logo.direction === 'left' ? 'Left' : 'Right'} ${logo.speed}s linear ${logo.delay}s infinite`,
              filter: 'drop-shadow(0 0 6px rgba(218, 165, 32, 0.4))',
            }}
          >
            <svg
              viewBox="0 0 24 24"
              fill="#DAA520"
              className="w-full h-full"
              dangerouslySetInnerHTML={{ __html: `<path d="${icon.path}"/>` }}
            />
          </div>
        );
      })}

      <style>{`
        @keyframes scrollLeft {
          0% {
            transform: translateX(100vw);
          }
          100% {
            transform: translateX(-120vw);
          }
        }
        @keyframes scrollRight {
          0% {
            transform: translateX(-120vw);
          }
          100% {
            transform: translateX(100vw);
          }
        }
      `}</style>
    </div>
  );
}
