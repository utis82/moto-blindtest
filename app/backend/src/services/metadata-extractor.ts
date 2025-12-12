/**
 * Service d'extraction de métadonnées de motos
 * Utilise l'extracteur hybride Python (DB + IA)
 */
import { spawn } from 'child_process';
import path from 'path';

export interface MotorcycleMetadata {
  manufacturer: string;
  model: string;
  engine: string;
  cylinders: string;
  year: string;
}

export interface ExtractionResult {
  metadata: MotorcycleMetadata | null;
  confidence: number;
  shouldSkip: boolean;
}

export class MetadataExtractorService {
  private pythonPath: string;
  private scriptPath: string;
  private minConfidence: number;

  constructor(minConfidence: number = 0.90) {
    this.minConfidence = minConfidence;
    // Chemins vers le script Python
    this.pythonPath = path.join(process.cwd(), '..', '..', 'venv', 'bin', 'python3');
    this.scriptPath = path.join(process.cwd(), '..', '..', 'ml', 'extract_metadata.py');
  }

  /**
   * Extrait les métadonnées d'un titre YouTube
   */
  async extract(title: string, useAiFallback: boolean = true): Promise<ExtractionResult> {
    return new Promise((resolve, reject) => {
      const args = [
        this.scriptPath,
        '--title', title,
        '--min-confidence', this.minConfidence.toString(),
      ];

      if (!useAiFallback) {
        args.push('--no-ai-fallback');
      }

      const process = spawn(this.pythonPath, args);

      let stdout = '';
      let stderr = '';

      process.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      process.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      process.on('close', (code) => {
        if (code !== 0) {
          reject(new Error(`Extraction failed: ${stderr}`));
          return;
        }

        try {
          const result = JSON.parse(stdout);
          resolve({
            metadata: result.metadata,
            confidence: result.confidence,
            shouldSkip: result.should_skip,
          });
        } catch (err) {
          reject(new Error(`Failed to parse extraction result: ${err}`));
        }
      });

      process.on('error', (err) => {
        reject(new Error(`Failed to spawn Python process: ${err.message}`));
      });
    });
  }

  /**
   * Valide si une vidéo doit être acceptée ou rejetée
   */
  async validateVideo(title: string): Promise<{
    valid: boolean;
    metadata: MotorcycleMetadata | null;
    confidence: number;
    reason?: string;
  }> {
    try {
      const result = await this.extract(title, true);

      if (result.shouldSkip) {
        return {
          valid: false,
          metadata: result.metadata,
          confidence: result.confidence,
          reason: result.confidence < this.minConfidence
            ? `Confiance trop faible (${(result.confidence * 100).toFixed(1)}%)`
            : 'Extraction impossible',
        };
      }

      return {
        valid: true,
        metadata: result.metadata!,
        confidence: result.confidence,
      };
    } catch (err) {
      return {
        valid: false,
        metadata: null,
        confidence: 0,
        reason: err instanceof Error ? err.message : 'Erreur inconnue',
      };
    }
  }
}

// Instance singleton
export const metadataExtractor = new MetadataExtractorService(0.90);
