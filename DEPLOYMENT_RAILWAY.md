# Guide de Déploiement sur Railway

Ce guide explique comment déployer l'application Moto Blindtest sur Railway.

## 📋 Prérequis

- Un compte Railway (https://railway.app)
- Un compte GitHub avec accès au repository
- Le code source de l'application sur GitHub

## 🚀 Étapes de Déploiement

### 1. Créer un Nouveau Projet sur Railway

1. Connectez-vous sur [Railway](https://railway.app)
2. Cliquez sur **"New Project"**
3. Sélectionnez **"Deploy from GitHub repo"**
4. Autorisez Railway à accéder à votre compte GitHub si nécessaire
5. Sélectionnez le repository `moto-blindtest`

### 2. Configuration de la Base de Données (SQLite)

L'application utilise SQLite qui nécessite un volume persistant :

1. Dans votre projet Railway, cliquez sur **"+ New"** → **"Empty Service"**
2. Nommez-le "Database Volume"
3. Allez dans les **Settings** du service
4. Ajoutez un **Volume** :
   - **Mount Path**: `/data`
   - **Size**: 1 GB (suffisant pour la base de données)

### 3. Configurer les Variables d'Environnement

Dans les **Settings** de votre service principal, ajoutez ces variables :

```env
NODE_ENV=production
PORT=${{RAILWAY_PORT}}
DATABASE_URL=file:/data/dev.db
```

**Note**: Railway fournit automatiquement `${{RAILWAY_PORT}}`, utilisez cette variable exactement comme indiqué.

### 4. Configuration du Build

Railway détecte automatiquement le projet Node.js grâce au `package.json` racine.

**Vérifiez** dans les **Settings** > **Build** :
- **Build Command**: `npm run build` (automatiquement détecté)
- **Start Command**: `npm start` (automatiquement détecté)

### 5. Initialiser la Base de Données

Après le premier déploiement, vous devez initialiser la base de données Prisma :

1. Dans Railway, allez dans l'onglet **"Deployments"**
2. Sélectionnez le déploiement actif
3. Cliquez sur **"View Logs"**
4. Ouvrez le **Shell** (icône terminal)
5. Exécutez les commandes suivantes :

```bash
# Aller dans le dossier db
cd app/db

# Générer le client Prisma
npx prisma generate

# Exécuter les migrations
npx prisma migrate deploy

# Seeder la base de données avec les 50 motos
npx prisma db seed
```

**Note**: Si le seed ne fonctionne pas directement, vous devrez peut-être exécuter :
```bash
cd app/db
npx ts-node seed.ts
```

### 6. Vérifier le Déploiement

1. Railway génère automatiquement une URL publique
2. Cliquez sur l'URL dans le dashboard (format: `https://votre-app.up.railway.app`)
3. Testez l'application :
   - Page d'accueil doit s'afficher
   - Créer une partie
   - Jouer un tour complet
   - Vérifier que l'audio fonctionne

### 7. Configuration du Domaine Personnalisé (Optionnel)

1. Allez dans **Settings** > **Networking**
2. Cliquez sur **"Generate Domain"** pour obtenir un domaine Railway gratuit
3. Ou ajoutez votre propre domaine dans **"Custom Domain"**

## 📱 Compatibilité Mobile

L'application est maintenant **100% responsive** et optimisée pour :
- Smartphones (320px et plus)
- Tablettes (768px et plus)
- Desktop (1024px et plus)

Toutes les pages sont adaptées avec des breakpoints Tailwind :
- HomePage
- GameSetupPage
- MultiplayerGamePage
- ResultsPage

## 🔧 Configuration Avancée

### Augmenter la Taille du Volume

Si vous avez besoin de plus d'espace :
1. Allez dans **Settings** du volume
2. Modifiez la taille (max 100 GB sur plan gratuit)

### Monitoring et Logs

- **Logs en temps réel** : Onglet "Deployments" > "View Logs"
- **Metrics** : Onglet "Metrics" (CPU, RAM, Network)
- **Alertes** : Configurez dans "Settings" > "Alerts"

### Variables d'Environnement Supplémentaires

Si vous ajoutez des fonctionnalités, vous pouvez ajouter :
```env
# Limite de sessions simultanées
MAX_SESSIONS=100

# Timeout des sessions inactives (en ms)
SESSION_TIMEOUT=1800000
```

## 🐛 Dépannage

### Erreur "Module not found"
**Solution** : Vérifiez que toutes les dépendances sont dans `dependencies` (pas `devDependencies`) dans package.json

### Base de données vide après redéploiement
**Cause** : Le volume n'est pas correctement monté
**Solution** : Vérifiez que le mount path est bien `/data` et que DATABASE_URL pointe vers ce chemin

### Application ne démarre pas
**Solution** :
1. Vérifiez les logs dans Railway
2. Assurez-vous que `PORT` est bien configuré avec `${{RAILWAY_PORT}}`
3. Vérifiez que le build s'est terminé sans erreur

### Audio ne fonctionne pas
**Cause** : Les fichiers audio ne sont pas inclus dans le build
**Solution** : Vérifiez que `app/backend/public/sounds/*.mp3` sont bien présents après le build

### CSS ne se charge pas
**Cause** : Chemins absolus vs relatifs
**Solution** : Vérifiez que `vite.config.ts` utilise `base: '/'` en production (déjà configuré)

## 📊 Limites du Plan Gratuit Railway

- **500 heures/mois** : Suffisant pour un projet personnel
- **100 GB sortant** : Largement suffisant
- **8 GB RAM max** : Plus que nécessaire pour cette app
- **1 projet** : Peut contenir plusieurs services

## 🔐 Sécurité

Railway gère automatiquement :
- ✅ HTTPS/SSL
- ✅ Isolation des conteneurs
- ✅ Backups automatiques
- ✅ Protection DDoS de base

**Recommandations** :
- Ne commitez jamais le fichier `.env` dans Git
- Utilisez les variables d'environnement Railway pour les secrets
- Activez les alertes pour surveiller l'usage

## 📈 Performance

Pour optimiser les performances :
1. **CDN** : Activez le CDN Railway dans Settings (gratuit)
2. **Compression** : L'application utilise déjà la compression Express
3. **Caching** : Les assets statiques sont cachés automatiquement

## 🔄 Mise à Jour de l'Application

Railway redéploie automatiquement à chaque push sur la branche `main` :

1. Faites vos modifications localement
2. Commitez et pushez sur GitHub :
```bash
git add .
git commit -m "Votre message"
git push origin main
```
3. Railway détecte le push et redéploie automatiquement
4. Suivez les logs dans le dashboard

## 📞 Support

- Documentation Railway : https://docs.railway.app
- Discord Railway : https://discord.gg/railway
- GitHub Issues : https://github.com/utis82/moto-blindtest/issues

---

**Fait avec ❤️ pour les passionnés de motos** 🏍️
