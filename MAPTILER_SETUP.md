# Configuration MapTiler

Ce guide explique comment configurer MapTiler pour utiliser les cartes terrain vectorielles dans l'application Strava GPX.

## 1. Créer un compte MapTiler (gratuit)

1. Rendez-vous sur [MapTiler Cloud](https://cloud.maptiler.com/)
2. Créez un compte gratuit
3. Confirmez votre email

## 2. Obtenir votre clé API

1. Une fois connecté, allez dans **Account** → **Keys**
2. Copiez votre **Default Public API Key**
3. Le plan gratuit inclut 100 000 chargements de tuiles par mois

## 3. Configuration dans l'application

### Option 1: Variable d'environnement (recommandé)

Créez un fichier `.env` à la racine du projet :

```bash
VITE_MAPTILER_API_KEY=votre_clé_api_ici
```

### Option 2: Modification directe

Modifiez le fichier `src/config/maptiler.ts` :

```typescript
export const MAPTILER_CONFIG = {
  API_KEY: "votre_clé_api_ici",
  // ...
};
```

## 4. Styles disponibles

L'application propose 5 styles de carte :

- **Topographic** (par défaut) : Cartes topographiques détaillées avec courbes de niveau ✨ 3D
- **Outdoor** : Optimisé pour les activités outdoor avec sentiers
- **Hybrid** : Images satellite + étiquettes avec rendu 3D ✨ 3D
- **Streets** : Style urbain classique

## 5. Fonctionnalités

### Contrôles 3D

- **Bouton 3D** : Bouton dédié avec icône 🏔️ en bas à droite
- **Disponibilité** : Styles Topographic et Hybrid uniquement
- **Activation** : Cliquez sur le bouton "3D" pour activer/désactiver
- **Angle maximum** : Inclinaison jusqu'à 85° (au lieu de 60° par défaut)
- **Indicateur d'angle** : Affichage en temps réel de l'angle de caméra (📐)
- **Exagération** : Relief avec exagération x1.5 pour un rendu optimal

### Navigation 3D avancée

- **Souris** :
  - **Rotation** : Ctrl + glisser pour tourner la vue
  - **Inclinaison** : Shift + glisser pour incliner la caméra (jusqu'à 85°)
  - **Zoom** : Molette ou pincement pour zoomer

- **Clavier** :
  - **R** : Réinitialiser l'angle et la rotation (vue de dessus)
  - **↑** : Augmenter l'inclinaison (+10°)
  - **↓** : Diminuer l'inclinaison (-10°)

### Sélecteur de style

- **Position** : Menu déroulant en bas à droite (à côté du bouton 3D)
- **Changement dynamique** : Sans perdre les traces GPX affichées
- **Gestion automatique** : Le bouton 3D apparaît/disparaît selon le style
- **Styles compatibles 3D** : Topographic et Hybrid

### Navigation

**Mode 2D (tous les styles) :**

- **Zoom** : Molette de souris ou pincement (mobile)
- **Déplacement** : Glisser pour se déplacer sur la carte

**Mode 3D (styles Topographic/Hybrid uniquement) :**

- **Zoom** : Molette ou pincement
- **Rotation** : Ctrl + glisser pour faire tourner la vue autour du point central
- **Inclinaison** : Shift + glisser pour incliner la caméra (0° à 85°)
- **Déplacement** : Glisser simple pour se déplacer
- **Raccourcis** : R (reset), ↑/↓ (inclinaison par paliers de 10°)

## 6. Limites du plan gratuit

- 100 000 chargements de tuiles/mois
- Toutes les fonctionnalités disponibles
- Pas de filigrane
- Support communautaire

## 7. Migration depuis Leaflet

La migration preserve toutes les fonctionnalités :

- ✅ Affichage des traces GPX
- ✅ Marqueurs de départ/arrivée
- ✅ Popups d'information
- ✅ Zoom automatique sur les traces
- ✅ Contrôles de navigation
- ✅ Responsive design

### Améliorations apportées

- **Performance** : Rendu vectoriel plus fluide
- **Qualité** : Cartes haute résolution avec relief détaillé
- **3D avancée** : Support du relief 3D avec angles extrêmes (jusqu'à 85°)
- **Contrôles caméra** : Indicateur d'angle en temps réel + raccourcis clavier
- **Styles** : 4 styles professionnels optimisés (Terrain retiré car instable)
- **Hybrid** : Nouveau style satellite + étiquettes avec support 3D
- **Interface** : Contrôles repositionnés pour éviter les superpositions
- **UX 3D** : Navigation intuitive avec feedback visuel et raccourcis
- **Moderne** : Basé sur MapLibre GL JS (fork open-source de Mapbox GL JS)

## Dépannage

### La carte ne s'affiche pas

- Vérifiez que votre clé API est correcte
- Vérifiez votre quota de chargements
- Ouvrez la console pour voir les erreurs

### Performance lente

- Réduisez le niveau de zoom maximum
- Utilisez le style "Streets" qui est plus léger
- Désactivez la 3D si elle est activée
- Vérifiez votre connexion internet

### Erreurs CORS

- Les clés MapTiler fonctionnent depuis localhost
- Configurez les domaines autorisés dans MapTiler Cloud

## Ressources

- [Documentation MapTiler](https://docs.maptiler.com/)
- [MapLibre GL JS](https://maplibre.org/maplibre-gl-js-docs/)
- [Exemples de styles](https://cloud.maptiler.com/maps/)
