import { useEffect, useState } from "react";
import * as SimpleIcons from "simple-icons";

// Mapping des marques de motos disponibles dans simple-icons
const BRAND_ICONS = {
  Honda: SimpleIcons.siHonda,
  Yamaha: SimpleIcons.siYamaha,
  Ducati: SimpleIcons.siDucati,
  Kawasaki: SimpleIcons.siKawasaki,
  Suzuki: SimpleIcons.siSuzuki,
  KTM: SimpleIcons.siKtm,
  BMW: SimpleIcons.siBmw,
  Aprilia: SimpleIcons.siAprilia,
  Triumph: SimpleIcons.siTriumph,
};

interface Logo {
  id: string;
  brand: keyof typeof BRAND_ICONS;
  x: number;
  y: number;
  size: number;
  speed: number;
  delay: number;
}

export function BrandLogosBackground() {
  const [logos, setLogos] = useState<Logo[]>([]);

  useEffect(() => {
    const brands = Object.keys(BRAND_ICONS) as (keyof typeof BRAND_ICONS)[];

    // Créer 4 rangées de logos qui défilent
    const rows = 4;
    const logosPerRow = 6;
    const initialLogos: Logo[] = [];

    for (let row = 0; row < rows; row++) {
      for (let i = 0; i < logosPerRow; i++) {
        const brand = brands[Math.floor(Math.random() * brands.length)];
        initialLogos.push({
          id: `${row}-${i}-${Date.now()}`,
          brand,
          x: (i / logosPerRow) * 140 + (row % 2 === 0 ? 0 : -40),
          y: 12 + row * 24,
          size: 50 + Math.random() * 30, // 50-80px
          speed: 30 + Math.random() * 25 + row * 5,
          delay: i * 4 + row * 2,
        });
      }
    }

    setLogos(initialLogos);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {logos.map((logo) => {
        const icon = BRAND_ICONS[logo.brand];

        return (
          <div
            key={logo.id}
            className="absolute"
            style={{
              left: `${logo.x}%`,
              top: `${logo.y}%`,
              width: `${logo.size}px`,
              height: `${logo.size}px`,
              opacity: 0.08,
              animation: `scrollHorizontal ${logo.speed}s linear ${logo.delay}s infinite`,
              filter: 'drop-shadow(0 0 4px rgba(218, 165, 32, 0.3))',
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
