#!/usr/bin/env python3
"""
Extracteur hybride de métadonnées de motos
Combine fuzzy matching sur base de données + IA en fallback
"""
import json
import re
from pathlib import Path
from difflib import SequenceMatcher
from typing import Dict, List, Optional, Tuple

# Charger la base de données
DB_PATH = Path(__file__).parent / "motorcycle_database.json"

class HybridMotorcycleExtractor:
    def __init__(self, confidence_threshold=0.85, verbose=True):
        """
        Args:
            confidence_threshold: Score minimum pour accepter un match (0-1)
            verbose: Afficher les logs de debug
        """
        self.confidence_threshold = confidence_threshold
        self.verbose = verbose
        self.database = self._load_database()
        self.ai_model = None  # Chargé seulement si nécessaire

    def _load_database(self) -> List[Dict]:
        """Charge la base de données de motos"""
        with open(DB_PATH, 'r', encoding='utf-8') as f:
            data = json.load(f)
        return data['motorcycles']

    def _normalize_text(self, text: str) -> str:
        """Normalise le texte pour le matching"""
        text = text.lower()
        # Supprimer ponctuation et caractères spéciaux
        text = re.sub(r'[^\w\s-]', ' ', text)
        # Normaliser les espaces
        text = re.sub(r'\s+', ' ', text).strip()
        return text

    def _calculate_similarity(self, str1: str, str2: str) -> float:
        """Calcule la similarité entre deux chaînes (0-1)"""
        return SequenceMatcher(None, str1, str2).ratio()

    def _fuzzy_match_manufacturer(self, title: str) -> Tuple[Optional[str], float]:
        """Trouve le fabricant avec fuzzy matching"""
        title_norm = self._normalize_text(title)
        best_match = None
        best_score = 0.0

        # Extraire tous les fabricants uniques
        manufacturers = list(set(moto['manufacturer'] for moto in self.database))

        for manufacturer in manufacturers:
            manuf_norm = self._normalize_text(manufacturer)

            # Vérifier si le fabricant est dans le titre
            if manuf_norm in title_norm:
                score = 1.0
            else:
                # Calculer similarité
                score = self._calculate_similarity(manuf_norm, title_norm)
                # Bonus si le fabricant est au début
                if title_norm.startswith(manuf_norm[:3]):
                    score += 0.2

            if score > best_score:
                best_score = score
                best_match = manufacturer

        # Si pas de bon match, chercher par modèle/variante pour déduire le fabricant
        if best_score < 0.6:
            manuf, score = self._infer_manufacturer_from_model(title_norm)
            if score > best_score:
                best_match = manuf
                best_score = score

        return best_match, best_score

    def _infer_manufacturer_from_model(self, title_norm: str) -> Tuple[Optional[str], float]:
        """Déduit le fabricant à partir du modèle mentionné"""
        best_match = None
        best_score = 0.0

        for moto in self.database:
            # Chercher le modèle principal
            model_norm = self._normalize_text(moto['model'])
            if model_norm in title_norm and len(model_norm) > 2:
                score = 0.95
                if score > best_score:
                    best_match = moto['manufacturer']
                    best_score = score

            # Chercher dans les variantes
            for variant in moto.get('variants', []):
                variant_norm = self._normalize_text(variant)
                if variant_norm in title_norm and len(variant_norm) > 2:
                    score = 1.0
                    if score > best_score:
                        best_match = moto['manufacturer']
                        best_score = score

        return best_match, best_score

    def _fuzzy_match_model(self, title: str, manufacturer: str) -> Tuple[Optional[Dict], float]:
        """Trouve le modèle avec fuzzy matching"""
        title_norm = self._normalize_text(title)
        best_match = None
        best_score = 0.0

        # Filtrer par fabricant
        candidates = [m for m in self.database if m['manufacturer'] == manufacturer]

        for moto in candidates:
            # Tester le modèle principal
            model_norm = self._normalize_text(moto['model'])

            if model_norm in title_norm:
                score = 0.9
                best_match = moto
                best_score = score

            # Tester les variantes
            for variant in moto.get('variants', []):
                variant_norm = self._normalize_text(variant)

                if variant_norm in title_norm:
                    score = 1.0  # Match exact de variante = meilleur score
                    if score > best_score:
                        best_match = moto
                        best_score = score
                elif len(variant_norm) > 3:
                    # Similarité
                    score = self._calculate_similarity(variant_norm, title_norm)
                    if score > best_score and score > 0.7:
                        best_match = moto
                        best_score = score

        return best_match, best_score

    def _extract_year_from_title(self, title: str) -> Optional[str]:
        """Extrait l'année du titre si présente"""
        # Chercher un nombre à 4 chiffres entre 1980 et 2030
        match = re.search(r'\b(19[89]\d|20[0-2]\d|2030)\b', title)
        if match:
            return match.group(1)
        return None

    def _find_closest_year(self, extracted_year: Optional[str], available_years: List[str]) -> str:
        """Trouve l'année la plus proche dans la liste disponible"""
        if not available_years:
            return "2020"  # Défaut

        if not extracted_year:
            # Retourner l'année la plus récente
            return max(available_years)

        # Si l'année extraite est dans la liste
        if extracted_year in available_years:
            return extracted_year

        # Sinon, trouver la plus proche
        year_int = int(extracted_year)
        closest = min(available_years, key=lambda y: abs(int(y) - year_int))
        return closest

    def extract(self, title: str, use_ai_fallback: bool = True) -> Tuple[Optional[Dict], float]:
        """
        Extrait les métadonnées avec score de confiance

        Returns:
            (metadata_dict, confidence_score)
        """
        if self.verbose:
            print(f"🔍 Extraction pour: \"{title}\"")

        # 1. Trouver le fabricant
        manufacturer, manuf_confidence = self._fuzzy_match_manufacturer(title)

        if not manufacturer or manuf_confidence < 0.6:
            if self.verbose:
                print(f"   ⚠️  Fabricant non trouvé (confiance: {manuf_confidence:.2%})")
            if use_ai_fallback:
                return self._ai_fallback(title)
            return None, 0.0

        if self.verbose:
            print(f"   ✅ Fabricant: {manufacturer} (confiance: {manuf_confidence:.2%})")

        # 2. Trouver le modèle
        moto_data, model_confidence = self._fuzzy_match_model(title, manufacturer)

        if not moto_data or model_confidence < 0.6:
            if self.verbose:
                print(f"   ⚠️  Modèle non trouvé (confiance: {model_confidence:.2%})")
            if use_ai_fallback:
                return self._ai_fallback(title)
            return None, 0.0

        if self.verbose:
            print(f"   ✅ Modèle: {moto_data['model']} (confiance: {model_confidence:.2%})")

        # 3. Extraire l'année
        extracted_year = self._extract_year_from_title(title)
        year = self._find_closest_year(extracted_year, moto_data['years'])

        # 4. Calculer la confiance globale
        overall_confidence = (manuf_confidence + model_confidence) / 2

        # Bonus si année trouvée dans le titre
        if extracted_year and extracted_year in moto_data['years']:
            overall_confidence = min(1.0, overall_confidence + 0.05)

        metadata = {
            "manufacturer": moto_data['manufacturer'],
            "model": moto_data['model'],
            "engine": moto_data['engine'],
            "cylinders": moto_data['cylinders'],
            "year": year
        }

        if self.verbose:
            print(f"   📊 Confiance globale: {overall_confidence:.2%}")

        return metadata, overall_confidence

    def _ai_fallback(self, title: str) -> Tuple[Optional[Dict], float]:
        """Utilise le modèle IA en fallback"""
        if self.verbose:
            print("   🤖 Fallback sur le modèle IA...")

        # Charger le modèle seulement si nécessaire
        if self.ai_model is None:
            try:
                from inference import MotoMetadataExtractor
                self.ai_model = MotoMetadataExtractor()
            except Exception as e:
                if self.verbose:
                    print(f"   ❌ Impossible de charger le modèle IA: {e}")
                return None, 0.0

        try:
            metadata = self.ai_model.extract(title)
            if metadata:
                # Le modèle IA n'a pas de score de confiance, on met 0.5
                return metadata, 0.5
        except Exception as e:
            if self.verbose:
                print(f"   ❌ Erreur IA: {e}")

        return None, 0.0

    def should_skip_video(self, title: str, min_confidence: float = 0.90) -> bool:
        """
        Détermine si on doit skip une vidéo basé sur la confiance

        Args:
            title: Titre de la vidéo
            min_confidence: Confiance minimale requise (défaut 90%)

        Returns:
            True si on doit skip la vidéo
        """
        metadata, confidence = self.extract(title, use_ai_fallback=True)

        if metadata is None:
            if self.verbose:
                print(f"   ⛔ SKIP: Extraction impossible")
            return True

        if confidence < min_confidence:
            if self.verbose:
                print(f"   ⛔ SKIP: Confiance trop faible ({confidence:.2%} < {min_confidence:.2%})")
            return True

        if self.verbose:
            print(f"   ✅ VALIDE: Confiance suffisante ({confidence:.2%})")
        return False


def test_extractor():
    """Test l'extracteur hybride"""
    print("=" * 80)
    print("🧪 TEST DE L'EXTRACTEUR HYBRIDE")
    print("=" * 80)

    extractor = HybridMotorcycleExtractor(confidence_threshold=0.85)

    test_cases = [
        # Titres clairs
        ("Ducati Panigale V4S 2023 Sound", True),
        ("2020 Kawasaki Ninja H2R Exhaust", True),
        ("Yamaha MT-09 Sound Test", True),

        # Titres ambigus
        ("Monster 821 startup", True),  # Devrait trouver Ducati
        ("Pannigale sound test", True),  # Typo, devrait trouver Ducati
        ("CBR 1000RR Fireblade", True),  # Devrait trouver Honda

        # Titres très vagues
        ("New Ninja exhaust note", True),
        ("Italian superbike acceleration", False),
        ("Random motorcycle sound", False),
    ]

    results = []
    for title, should_pass in test_cases:
        print(f"\n{'='*80}")
        metadata, confidence = extractor.extract(title, use_ai_fallback=False)

        if metadata:
            print(f"   📦 Résultat: {metadata}")
            passed = confidence >= 0.90
        else:
            passed = False

        results.append({
            "title": title,
            "expected": should_pass,
            "passed": passed,
            "confidence": confidence,
            "metadata": metadata
        })

    print(f"\n{'='*80}")
    print("📊 RÉSULTATS")
    print("=" * 80)

    correct = sum(1 for r in results if r['passed'] == r['expected'])
    print(f"✅ Taux de réussite: {correct}/{len(results)} ({correct/len(results)*100:.1f}%)")

    high_confidence = sum(1 for r in results if r['metadata'] and r['confidence'] >= 0.90)
    print(f"🎯 Extractions haute confiance (≥90%): {high_confidence}/{len(results)}")


if __name__ == "__main__":
    test_extractor()
