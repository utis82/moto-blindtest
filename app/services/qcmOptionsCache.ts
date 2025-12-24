import { PrismaClient } from "@prisma/client";
import type { FieldName } from "../shared/gameConstraints";

/**
 * Structure pour stocker une moto avec ses champs
 */
interface MotoData {
  manufacturer: string;
  model: string;
  engine: string;
  cylinders: string;
  year: string;
}

/**
 * Cache global des valeurs distinctes par champ pour génération QCM
 */
class QCMOptionsCache {
  private cache: Map<FieldName, Set<string>> = new Map();
  private motosData: MotoData[] = [];
  private initialized = false;

  /**
   * Initialise le cache en chargeant toutes les valeurs distinctes depuis la DB
   */
  async initialize(prisma: PrismaClient): Promise<void> {
    if (this.initialized) {
      console.log("[QCMCache] Déjà initialisé, skip");
      return;
    }

    console.log("[QCMCache] Initialisation du cache...");

    try {
      // Charger toutes les motos avec leurs valeurs
      const motos = await prisma.moto.findMany({
        select: {
          manufacturer: true,
          name: true,
          engine: true,
          cylinders: true,
          year: true,
        },
      });

      // Initialiser les sets pour chaque champ
      const manufacturers = new Set<string>();
      const models = new Set<string>();
      const engines = new Set<string>();
      const cylinders = new Set<string>();
      const years = new Set<string>();

      // Remplir les sets avec les valeurs non nulles et stocker les motos complètes
      motos.forEach((moto) => {
        if (moto.manufacturer) manufacturers.add(moto.manufacturer);
        if (moto.name) models.add(moto.name);
        if (moto.engine) engines.add(moto.engine);
        if (moto.cylinders) cylinders.add(moto.cylinders);
        if (moto.year) years.add(moto.year);

        // Stocker la moto complète pour générer des options cohérentes
        if (moto.manufacturer && moto.name && moto.engine && moto.cylinders && moto.year) {
          this.motosData.push({
            manufacturer: moto.manufacturer,
            model: moto.name,
            engine: moto.engine,
            cylinders: moto.cylinders,
            year: moto.year,
          });
        }
      });

      // Stocker dans le cache
      this.cache.set("manufacturer", manufacturers);
      this.cache.set("model", models);
      this.cache.set("engine", engines);
      this.cache.set("cylinders", cylinders);
      this.cache.set("year", years);

      this.initialized = true;

      console.log(`[QCMCache] Initialisé avec succès:`);
      console.log(`  - Manufacturers: ${manufacturers.size}`);
      console.log(`  - Models: ${models.size}`);
      console.log(`  - Engines: ${engines.size}`);
      console.log(`  - Cylinders: ${cylinders.size}`);
      console.log(`  - Years: ${years.size}`);
    } catch (error) {
      console.error("[QCMCache] Erreur lors de l'initialisation:", error);
      throw error;
    }
  }

  /**
   * Génère les options QCM pour un champ donné
   * @param fieldName Nom du champ
   * @param correctAnswer La bonne réponse à inclure
   * @param count Nombre d'options à générer (défaut: 4)
   * @returns Tableau d'options mélangées (idéalement 4, minimum 2)
   */
  generateQCMOptions(
    fieldName: FieldName,
    correctAnswer: string,
    count: number = 4
  ): string[] {
    if (!this.initialized) {
      throw new Error(
        "[QCMCache] Cache non initialisé. Appelez initialize() au démarrage du serveur."
      );
    }

    const fieldValues = this.cache.get(fieldName);
    if (!fieldValues || fieldValues.size === 0) {
      throw new Error(
        `[QCMCache] Aucune valeur disponible pour le champ ${fieldName}`
      );
    }

    // Filtrer la bonne réponse pour obtenir les mauvaises réponses
    const incorrectAnswers = Array.from(fieldValues).filter(
      (value) => value !== correctAnswer
    );

    // Gérer le cas où il n'y a pas assez de mauvaises réponses
    if (incorrectAnswers.length === 0) {
      // Cas extrême: une seule valeur dans le catalogue
      console.warn(
        `[QCMCache] Une seule valeur pour ${fieldName}, impossible de générer QCM`
      );
      return [correctAnswer]; // Retourner seulement la bonne réponse, forcer mode expert
    }

    // Sélectionner aléatoirement (count - 1) mauvaises réponses
    const selectedIncorrect = this.selectRandom(
      incorrectAnswers,
      Math.min(count - 1, incorrectAnswers.length)
    );

    // Combiner avec la bonne réponse
    const options = [...selectedIncorrect, correctAnswer];

    // Mélanger aléatoirement
    return this.shuffle(options);
  }

  /**
   * Génère 2 options pour le mode 50-50
   * @param fieldName Nom du champ
   * @param correctAnswer La bonne réponse
   * @returns Tableau de 2 options mélangées
   */
  generate5050Options(fieldName: FieldName, correctAnswer: string): string[] {
    const allOptions = this.generateQCMOptions(fieldName, correctAnswer, 2);

    // S'assurer qu'on a bien 2 options
    if (allOptions.length < 2) {
      console.warn(
        `[QCMCache] Pas assez d'options pour 50-50 sur ${fieldName}, forcer expert`
      );
      return [correctAnswer]; // Pas assez d'options, retourner seulement la bonne réponse
    }

    return allOptions.slice(0, 2);
  }

  /**
   * Génère des options QCM cohérentes pour plusieurs champs (ex: manufacturer + model)
   * Les options proposées seront des vraies combinaisons manufacturer/model qui existent
   * @param correctMoto La moto correcte avec tous ses champs
   * @param count Nombre d'options à générer
   * @returns Tableau de motos alternatives + la bonne réponse, mélangé
   */
  generateCoherentOptions(
    correctMoto: { manufacturer: string; model: string },
    count: number = 4
  ): MotoData[] {
    if (!this.initialized) {
      throw new Error(
        "[QCMCache] Cache non initialisé. Appelez initialize() au démarrage du serveur."
      );
    }

    // Trouver la moto correcte complète
    const correctFullMoto = this.motosData.find(
      (m) => m.manufacturer === correctMoto.manufacturer && m.model === correctMoto.model
    );

    if (!correctFullMoto) {
      console.warn(
        `[QCMCache] Moto non trouvée: ${correctMoto.manufacturer} ${correctMoto.model}`
      );
      // Fallback: retourner juste les données partielles
      return [{
        manufacturer: correctMoto.manufacturer,
        model: correctMoto.model,
        engine: "",
        cylinders: "",
        year: "",
      }];
    }

    // Filtrer pour exclure la bonne moto
    const otherMotos = this.motosData.filter(
      (m) => !(m.manufacturer === correctMoto.manufacturer && m.model === correctMoto.model)
    );

    if (otherMotos.length === 0) {
      console.warn("[QCMCache] Une seule moto dans le catalogue, impossible de générer QCM");
      return [correctFullMoto];
    }

    // Sélectionner aléatoirement (count - 1) autres motos
    const selectedWrong = this.selectRandom(
      otherMotos,
      Math.min(count - 1, otherMotos.length)
    );

    // Combiner avec la bonne moto
    const options = [...selectedWrong, correctFullMoto];

    // Mélanger
    return this.shuffle(options);
  }

  /**
   * Sélectionne aléatoirement N éléments d'un tableau
   */
  private selectRandom<T>(array: T[], count: number): T[] {
    const shuffled = this.shuffle([...array]);
    return shuffled.slice(0, count);
  }

  /**
   * Mélange aléatoirement un tableau (Fisher-Yates)
   */
  private shuffle<T>(array: T[]): T[] {
    const result = [...array];
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }

  /**
   * Réinitialise le cache (utile pour tests)
   */
  reset(): void {
    this.cache.clear();
    this.initialized = false;
  }

  /**
   * Vérifie si le cache est initialisé
   */
  isInitialized(): boolean {
    return this.initialized;
  }
}

// Export d'une instance singleton
export const qcmCache = new QCMOptionsCache();
