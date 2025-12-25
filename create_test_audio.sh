#!/bin/bash
# Script pour créer des fichiers audio de test simples
# Utilise ffmpeg pour générer un son de synthèse

cd app/frontend/public/sounds

# Fichier test 1 - Ducati (son grave 200Hz)
ffmpeg -y -f lavfi -i "sine=frequency=200:duration=16" -af "volume=0.5" ducati-panigale-v4s.mp3

# Fichier test 2 - Yamaha (son medium 300Hz)
ffmpeg -y -f lavfi -i "sine=frequency=300:duration=16" -af "volume=0.5" yamaha-yzf-r1.mp3

# Fichier test 3 - Harley (son très grave 150Hz)
ffmpeg -y -f lavfi -i "sine=frequency=150:duration=17" -af "volume=0.5" harley-davidson-breakout-114.mp3

echo "✅ 3 fichiers audio de test créés!"
ls -lh *.mp3
