# Strava GPX Map Viewer

Une application web moderne pour visualiser toutes vos activités Strava sur une carte interactive avec un rendu terrain vectoriel haute qualité.

![Vue d'ensemble](https://img.shields.io/badge/Vue.js-3.x-4FC08D?style=flat-square&logo=vue.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat-square&logo=typescript)
![MapLibre](https://img.shields.io/badge/MapLibre-GL_JS-376CB0?style=flat-square)
![MapTiler](https://img.shields.io/badge/MapTiler-Terrain-FF6B35?style=flat-square)

## 🚀 Fonctionnalités

- **Authentification Strava** : Connexion sécurisée via OAuth2
- **Visualisation complète** : Affichage de toutes vos activités avec pagination automatique
- **Cartes haute qualité** : Rendu vectoriel avec 5 styles professionnels (Terrain, Outdoor, Satellite, Streets, Topo)
- **Traces GPS interactives** : Affichage des parcours avec marqueurs de départ/arrivée
- **Interface responsive** : Optimisée pour desktop et mobile
- **Vue 3D** : Rendu du relief avec contrôle d'exagération
- **Filtres avancés** : Par type d'activité et période
- **Performance optimisée** : Chargement progressif avec indicateurs

## 🛠 Technologies

- **Frontend** : Vue 3 + TypeScript + Vite
- **Cartographie** : MapLibre GL JS + MapTiler
- **API** : Strava API v3
- **Styling** : CSS moderne avec variables

## 🏃‍♂️ Démarrage rapide

### Prérequis

- Node.js 18+
- pnpm (recommandé) ou npm

### Installation

```bash
# Cloner le projet
git clone <repository-url>
cd strava-gpx

# Installer les dépendances
pnpm install

# Copier le fichier de configuration
cp .env.local.example .env.local
```

### Configuration

#### 1. Strava API

Suivez le guide détaillé : [STRAVA_SETUP.md](STRAVA_SETUP.md)

#### 2. MapTiler (gratuit)

Suivez le guide détaillé : [MAPTILER_SETUP.md](MAPTILER_SETUP.md)

Ou configuration rapide :

1. Créez un compte sur [MapTiler Cloud](https://cloud.maptiler.com/)
2. Copiez votre clé API
3. Ajoutez-la dans `.env.local` :

```bash
VITE_MAPTILER_API_KEY=votre_clé_api_ici
```

### Lancement

```bash
# Serveur de développement
pnpm dev

# Build de production
pnpm build

# Aperçu du build
pnpm preview
```

## 📱 Utilisation

1. **Connexion** : Cliquez sur "Se connecter avec Strava"
2. **Autorisations** : Acceptez les permissions de lecture
3. **Chargement** : Vos activités se chargent automatiquement
4. **Navigation** :
   - Sélectionnez une activité pour voir sa trace
   - Changez de style de carte avec le sélecteur
   - Activez la vue 3D avec le contrôle terrain

## 🗺 Styles de carte

- **Topographic** (défaut) : Cartes topographiques détaillées avec courbes de niveau ✨ 3D
- **Outdoor** : Optimisé pour les sports outdoor avec sentiers
- **Hybrid** : Images satellite + étiquettes avec rendu 3D ✨ 3D
- **Streets** : Style urbain moderne

## 🎯 Fonctionnalités avancées

### Navigation 3D

- **Rotation** : Ctrl + glisser (360°)
- **Inclinaison** : Shift + glisser (0° à 85°)
- **Zoom** : Molette ou pincement
- **Raccourcis** : R (reset), ↑/↓ (inclinaison ±10°)

### Mode 3D avancé

- **Disponible sur** : Styles Topographic et Hybrid
- **Bouton dédié** : 🏔️ 3D en bas à droite
- **Angle maximum** : Inclinaison jusqu'à 85° (vue quasi-latérale)
- **Indicateur d'angle** : Affichage temps réel (📐) en haut à gauche
- **Contrôles clavier** : R pour réinitialiser, flèches haut/bas pour ajuster l'inclinaison

### Filtres

- Type d'activité (Course, Vélo, etc.)
- Période (Dernière semaine, mois, année)
- Distance et durée

### Interface

- Panel d'activités coulissant
- Indicateurs de progression
- Gestion d'erreurs robuste
- Mode sombre adaptatif

## 🏗 Architecture

```
src/
├── components/          # Composants Vue
│   ├── Map.vue         # Composant carte principal
│   ├── StravaAuth.vue  # Authentification
│   ├── ActivitiesList.vue
│   └── UserProfile.vue
├── services/           # Services API
│   ├── stravaAuth.ts
│   └── stravaActivities.ts
├── types/              # Types TypeScript
│   └── strava.ts
├── config/             # Configuration
│   └── maptiler.ts
└── App.vue            # Composant racine
```

## 🔧 Configuration avancée

### Variables d'environnement

```bash
# MapTiler
VITE_MAPTILER_API_KEY=your_key_here

# Strava (si modification de l'app)
VITE_STRAVA_CLIENT_ID=your_client_id
VITE_STRAVA_CLIENT_SECRET=your_secret
```

### Personnalisation des styles

Modifiez `src/config/maptiler.ts` pour ajouter de nouveaux styles ou ajuster la configuration.

## 📊 Limites et quotas

### Strava API

- 600 requêtes/15min, 30 000/jour
- Accès aux activités publiques uniquement

### MapTiler (gratuit)

- 100 000 chargements de tuiles/mois
- Toutes les fonctionnalités incluses

## 🤝 Contribution

Les contributions sont les bienvenues !

1. Fork du projet
2. Créez une branche feature
3. Committez vos changements
4. Poussez vers la branche
5. Ouvrez une Pull Request

## 📄 Licence

Ce projet est sous licence MIT. Voir [LICENSE](LICENSE) pour plus de détails.

## 🙏 Remerciements

- [Strava](https://www.strava.com/) pour l'API
- [MapTiler](https://www.maptiler.com/) pour les cartes
- [MapLibre](https://maplibre.org/) pour le moteur de rendu
- [Vue.js](https://vuejs.org/) pour le framework

## 📞 Support

- [Issues GitHub](../../issues) pour les bugs
- [Discussions](../../discussions) pour les questions
- [Documentation Strava](https://developers.strava.com/docs/)
- [Documentation MapTiler](https://docs.maptiler.com/)
