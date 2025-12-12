#!/usr/bin/env python3
"""
Script CLI pour extraire les métadonnées de motos
Utilisé par le backend Node.js
"""
import argparse
import json
import sys
from hybrid_extractor import HybridMotorcycleExtractor

def main():
    parser = argparse.ArgumentParser(description='Extract motorcycle metadata from YouTube title')
    parser.add_argument('--title', required=True, help='YouTube video title')
    parser.add_argument('--min-confidence', type=float, default=0.90, help='Minimum confidence threshold')
    parser.add_argument('--no-ai-fallback', action='store_true', help='Disable AI fallback')
    parser.add_argument('--quiet', action='store_true', help='Suppress debug output')

    args = parser.parse_args()

    # Rediriger stderr vers /dev/null si mode quiet
    if args.quiet:
        import os
        import contextlib

        # Rediriger stdout et stderr temporairement
        with open(os.devnull, 'w') as devnull:
            with contextlib.redirect_stdout(devnull), contextlib.redirect_stderr(devnull):
                # Initialiser l'extracteur (mode silencieux si --quiet)
                extractor = HybridMotorcycleExtractor(
                    confidence_threshold=args.min_confidence,
                    verbose=False
                )

                # Extraire les métadonnées
                use_ai = not args.no_ai_fallback
                metadata, confidence = extractor.extract(args.title, use_ai_fallback=use_ai)
    else:
        # Initialiser l'extracteur
        extractor = HybridMotorcycleExtractor(
            confidence_threshold=args.min_confidence,
            verbose=True
        )

        # Extraire les métadonnées
        use_ai = not args.no_ai_fallback
        metadata, confidence = extractor.extract(args.title, use_ai_fallback=use_ai)

    # Déterminer si on doit skip
    should_skip = metadata is None or confidence < args.min_confidence

    # Résultat en JSON
    result = {
        "metadata": metadata,
        "confidence": confidence,
        "should_skip": should_skip
    }

    print(json.dumps(result, ensure_ascii=False))
    return 0

if __name__ == '__main__':
    try:
        sys.exit(main())
    except Exception as e:
        print(json.dumps({
            "metadata": None,
            "confidence": 0.0,
            "should_skip": True,
            "error": str(e)
        }), file=sys.stderr)
        sys.exit(1)
