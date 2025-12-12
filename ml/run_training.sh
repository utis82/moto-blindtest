#!/bin/bash
# Script pour lancer l'entraînement complet du modèle

set -e

echo "🚀 Démarrage du pipeline d'entraînement IA"
echo "=========================================="

# Activer l'environnement virtuel
source ../venv/bin/activate

# Vérifier que PyTorch est installé
python3 -c "import torch; print(f'✅ PyTorch {torch.__version__} avec CUDA {torch.version.cuda}')"

# Installer les dépendances manquantes
echo ""
echo "📦 Installation des dépendances..."
pip install -q transformers accelerate peft bitsandbytes datasets scipy sentencepiece protobuf

# Lancer l'entraînement
echo ""
echo "🏋️  Lancement de l'entraînement..."
echo "   (Durée estimée: 1-2 heures)"
echo "   Ouvrez un autre terminal et lancez 'watch -n1 nvidia-smi' pour surveiller"
echo ""

python3 train.py

echo ""
echo "✅ Entraînement terminé !"
echo "   Le modèle est prêt dans ml/models/moto-metadata-extractor"
