# 🤖 Entraînement IA en cours - Moto Blindtest

## 📊 Statut actuel

**L'entraînement du modèle IA est lancé en arrière-plan !**

### ⏱️ Temps estimé
- **Durée totale : 1-2 heures**
- Démarré le : 2025-12-11 à ~20:42 UTC

### 🎯 Modèle
- **Nom** : Microsoft Phi-3 Mini (3.8B paramètres)
- **Technique** : LoRA (Low-Rank Adaptation) + Quantization 4-bit
- **GPU** : NVIDIA GeForce RTX 4070 Laptop (8GB VRAM)
- **VRAM utilisée** : ~6-7 GB pendant l'entraînement

### 📦 Dataset
- **Train** : 400 exemples
- **Validation** : 100 exemples
- **Source** : Titres YouTube simulés de motos réelles

### 🎓 Ce que le modèle apprend
Extraire automatiquement depuis un titre YouTube :
```json
{
  "manufacturer": "Ducati",
  "model": "Panigale V4S",
  "engine": "V4",
  "cylinders": "4",
  "year": "2018"
}
```

## 📁 Fichiers créés

```
ml/
├── requirements.txt          # Dépendances Python
├── generate_dataset.py       # Génération dataset
├── train.py                  # Script d'entraînement principal
├── inference.py              # Script d'inférence/test
├── run_training.sh          # Lanceur automatique
├── data/
│   ├── train.jsonl          # Dataset d'entraînement (400 exemples)
│   └── val.jsonl            # Dataset de validation (100 exemples)
└── models/
    └── moto-metadata-extractor/  # Modèle entraîné (sera créé)
```

## 🔍 Suivre la progression

### Option 1 : Logs en temps réel
```bash
# Voir les logs de l'entraînement
tail -f /tmp/training.log

# Ou vérifier le processus
ps aux | grep train.py
```

### Option 2 : Surveillance GPU
```bash
# Dans un autre terminal
watch -n 1 nvidia-smi
```

Vous devriez voir :
- **VRAM utilisée** : ~6-7 GB / 8 GB
- **Température GPU** : 60-80°C (normal)
- **Utilisation GPU** : 90-100%

## 📈 Phases d'entraînement

1. **Installation dépendances** (~2-3 min) ✅
2. **Téléchargement modèle Phi-3** (~5-10 min) 🔄
3. **Preprocessing dataset** (~1 min) ⏳
4. **Entraînement** (~60-90 min) ⏳
   - Epoch 1/3 : ~25 min
   - Epoch 2/3 : ~25 min
   - Epoch 3/3 : ~25 min
5. **Sauvegarde modèle** (~1 min) ⏳

## ✅ Après l'entraînement

Le modèle sera disponible dans :
```
ml/models/moto-metadata-extractor/
```

### Test rapide
```bash
source venv/bin/activate
cd ml
python3 inference.py
```

### Intégration dans l'API
Le modèle sera automatiquement utilisé par le backend pour :
- Valider les métadonnées des vidéos YouTube
- Corriger les erreurs dans le catalogue
- Suggérer les bonnes caractéristiques motos

## 🔄 Commandes utiles

```bash
# Vérifier si l'entraînement tourne
pgrep -f train.py

# Surveiller l'utilisation GPU
nvidia-smi --query-gpu=utilization.gpu,utilization.memory,temperature.gpu --format=csv --loop=1

# Arrêter l'entraînement (si besoin)
pkill -f train.py
```

## 🐛 En cas de problème

### CUDA Out of Memory
Si vous voyez `CUDA out of memory` :
1. Réduire `per_device_train_batch_size` à 1 dans `train.py`
2. Relancer : `bash ml/run_training.sh`

### Entraînement bloqué
```bash
# Tuer le processus
pkill -9 -f train.py

# Relancer
cd ml
bash run_training.sh
```

## 📞 Prochaines étapes

Une fois l'entraînement terminé :
1. ✅ Tester le modèle avec `python3 ml/inference.py`
2. 🔌 Intégrer dans l'API backend
3. 🎨 Refaire l'interface en mode sportif
4. 📹 Ajouter 200+ vidéos YouTube au catalogue

---

**Note** : Vous pouvez laisser l'entraînement tourner toute la nuit. Le script sauvegardera automatiquement le meilleur modèle.
