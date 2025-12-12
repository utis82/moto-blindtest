const MANUFACTURERS = [
  "ducati",
  "yamaha",
  "honda",
  "kawasaki",
  "suzuki",
  "harley",
  "bmw",
  "ktm",
  "triumph",
  "aprilia",
  "moto guzzi",
];

const MODEL_HINTS: Record<string, RegExp> = {
  "Panigale V4": /panigale\s?v4|v4s/i,
  "YZF-R1": /yzf[-\s]?r1|r1\b/i,
  "CB750": /cb\s?750/i,
  "S1000RR": /s1000rr/i,
  "Breakout": /breakout/i,
  "Super Duke": /super\sduke|1290/i,
};

const ENGINE_HINTS: Record<string, RegExp> = {
  "V4": /v\s?4/i,
  "V-Twin": /v[-\s]?twin/i,
  "Inline-4": /inline\s?4|i4|four cylinder/i,
  "Boxer Twin": /boxer|flat twin/i,
};

const CYLINDER_HINTS: Record<string, RegExp> = {
  "2": /\b(2|twin)\b/i,
  "3": /\btriple\b|\b3 cyl/i,
  "4": /\b4\b|\bfour\b/i,
};

const ERA_HINT = /(19|20)\d{2}/;

const normalize = (text?: string | null) =>
  text ? text.toLowerCase() : "";

export interface MetadataInput {
  title: string;
  description?: string;
  channel?: string;
}

export interface MetadataInsight {
  manufacturer?: string;
  model?: string;
  engine?: string;
  era?: string;
  cylinders?: string;
  year?: string;
  funFact?: string;
  confidence: number;
}

export const inferMetadata = ({
  title,
  description,
  channel,
}: MetadataInput): MetadataInsight => {
  const haystack = `${title} ${description ?? ""}`.trim();
  const lower = normalize(haystack);
  let confidence = 0.2;
  const manufacturer =
    MANUFACTURERS.find((brand) => lower.includes(brand)) ?? undefined;
  if (manufacturer) confidence += 0.3;
  let model: string | undefined;
  Object.entries(MODEL_HINTS).forEach(([name, pattern]) => {
    if (pattern.test(haystack)) {
      model = name;
      confidence += 0.2;
    }
  });
  let engine: string | undefined;
  Object.entries(ENGINE_HINTS).forEach(([label, pattern]) => {
    if (pattern.test(haystack)) {
      engine = label;
      confidence += 0.1;
    }
  });
  let cylinders: string | undefined;
  Object.entries(CYLINDER_HINTS).forEach(([count, pattern]) => {
    if (pattern.test(haystack)) {
      cylinders = count;
      confidence += 0.05;
    }
  });
  const eraMatch = haystack.match(ERA_HINT);
  if (eraMatch) confidence += 0.1;
  const funFact =
    model && manufacturer
      ? `La ${model} ${manufacturer} est réputée pour sa sonorité unique.`
      : channel
      ? `Chaîne ${channel} spécialisée dans les sons moteurs.`
      : undefined;
  return {
    manufacturer: manufacturer
      ? manufacturer.charAt(0).toUpperCase() + manufacturer.slice(1)
      : undefined,
    model,
    engine,
    cylinders,
    era: eraMatch ? eraMatch[0] : undefined,
    year: eraMatch ? eraMatch[0] : undefined,
    funFact,
    confidence: Math.min(confidence, 1),
  };
};
