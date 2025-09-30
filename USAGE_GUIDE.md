# Guide d'utilisation rapide - Strava GPX Map Viewer

Ce guide explique comment utiliser les fonctionnalités principales de l'application.

## 🚀 Première utilisation

### 1. Connexion

1. Cliquez sur **"Se connecter avec Strava"**
2. Autorisez l'accès en lecture à vos activités
3. Vous êtes redirigé vers l'application

### 2. Vue d'accueil

- **Toutes vos activités** s'affichent automatiquement sur la carte
- **Vue large** centrée sur Paris pour voir l'ensemble de vos parcours
- **Couleurs distinctes** pour chaque activité (jusqu'à 50 activités)

## 🗺️ Interface principale

### Profil utilisateur (haut droite)

- **Photo de profil** et informations
- **Bouton grille** : Ouvre/ferme le panel des activités
- **Bouton déconnexion** : Se déconnecter de Strava

### Contrôles de carte (bas droite)

- **Sélecteur de style** : Topographic, Outdoor, Hybrid, Streets
- **Bouton 3D** 🏔️ : Active/désactive le relief 3D (styles Topo/Hybrid)

### Indicateur 3D (haut gauche, quand actif)

- **Angle de caméra** 📐 avec valeur en temps réel
- **Aide contextuelle** : Raccourcis clavier disponibles

## 📱 Panel des activités

### Accès

- Cliquez sur le **bouton grille** dans le profil utilisateur
- Panel coulissant depuis la droite

### Checkbox principale

✅ **"Afficher toutes les traces GPX des activités"** (cochée par défaut)

- **Emplacement** : Juste en dessous du titre "Mes activités" dans l'en-tête du panel

#### Mode "Toutes les activités" (checkbox cochée)

- Toutes vos activités visibles simultanément
- Couleurs automatiques distinctes
- Vue d'ensemble de vos parcours

#### Mode "Activité sélectionnée" (checkbox décochée)

- Seule l'activité cliquée est visible
- Zoom automatique sur l'activité
- Marqueurs de départ/arrivée

### Liste des activités

- **Scroll vertical** avec toutes vos activités
- **Pagination automatique** si vous avez beaucoup d'activités
- **Clic sur une activité** :
  - Ferme automatiquement le panel
  - Décoche la checkbox "toutes les activités"
  - Affiche uniquement cette activité

## 🎮 Navigation sur la carte

### Navigation 2D (tous les styles)

- **Déplacement** : Cliquer-glisser
- **Zoom** : Molette de souris ou pincement (mobile)

### Navigation 3D (styles Topo et Hybrid uniquement)

#### Souris

- **Rotation** : Ctrl + glisser (360°)
- **Inclinaison** : Shift + glisser (0° à 85°)
- **Zoom** : Molette

#### Clavier

- **R** : Réinitialiser la vue (retour à la vue de dessus)
- **↑** : Augmenter l'inclinaison (+10°)
- **↓** : Diminuer l'inclinaison (-10°)

## ⚙️ Changement de mode

### De "Toutes les activités" vers "Activité unique"

1. **Méthode 1** : Cliquez directement sur une activité dans la liste
2. **Méthode 2** : Décochez manuellement la checkbox dans l'en-tête du panel

### De "Activité unique" vers "Toutes les activités"

1. Ouvrez le panel des activités (bouton grille dans le profil)
2. Cochez la checkbox **"Afficher toutes les traces GPX des activités"** dans l'en-tête

## 🎨 Styles de carte recommandés

### Pour la vue d'ensemble

- **Topographic** : Idéal pour voir le relief et les courbes de niveau
- **Hybrid** : Excellent contraste entre traces et images satellite

### Pour les activités individuelles

- **Outdoor** : Optimisé pour les sentiers et chemins
- **Streets** : Parfait pour les activités urbaines

## 🏔️ Mode 3D - Conseils d'utilisation

### Activation

1. Sélectionnez le style **Topographic** ou **Hybrid**
2. Cliquez sur le bouton **🏔️ 3D**

### Meilleur rendu

- **Activités en montagne** : Spectaculaire avec inclinaison 45-70°
- **Parcours vallonnés** : Inclinaison 20-40° pour voir le relief
- **Navigation fluide** : Utilisez Shift+glisser pour des transitions douces

### Raccourcis pratiques

- **R** pour revenir rapidement à la vue de dessus
- **↑↓** pour ajuster précisément l'angle de vue

## 🚨 Limitations et performances

### Affichage multiple

- **Maximum** : 50 activités simultanées pour maintenir les performances
- **Sélection automatique** : Les plus récentes sont prioritaires

### Chargement

- **Toutes les activités** : Peut prendre quelques secondes selon votre nombre d'activités
- **Indicateur** : "Chargement de toutes les activités..." affiché pendant l'opération

### Quota API Strava

- **Limites** : 600 requêtes/15min, 30 000/jour
- **Impact** : Visible seulement si vous avez énormément d'activités

## 💡 Conseils d'utilisation

### Découverte de vos parcours

1. **Vue d'ensemble** : Gardez toutes les activités affichées au démarrage
2. **Explorez géographiquement** : Changez les styles de carte pour différentes perspectives
3. **Zoom sur les régions** : Utilisez la molette pour explorer vos zones d'activité

### Analyse d'une activité spécifique

1. **Sélectionnez l'activité** dans la liste (passage automatique en mode unique)
2. **Activez la 3D** si c'est une activité avec du dénivelé
3. **Explorez le parcours** avec les contrôles de caméra

### Comparaison visuelle

1. **Mode toutes les activités** : Comparez vos différents parcours
2. **Styles différents** : Alternez entre Topo (relief) et Hybrid (satellite)
3. **Couleurs distinctes** : Identifiez facilement vos différentes routes

## 🔧 Dépannage rapide

### La carte ne se charge pas

- Vérifiez votre connexion internet
- Actualisez la page (F5)

### Pas d'activités visibles

- Ouvrez le panel des activités avec le bouton grille dans le profil
- Vérifiez que la checkbox "Afficher toutes les traces GPX des activités" est cochée dans l'en-tête
- Vérifiez que vos activités sont bien listées dans le panel

### Mode 3D ne fonctionne pas

- Utilisez les styles **Topographic** ou **Hybrid** uniquement
- Le bouton 🏔️ n'apparaît que sur ces styles

### Performance lente

- Décochez "Afficher toutes les traces GPX des activités" pour voir une seule trace
- Utilisez le style **Streets** qui est plus léger
- Désactivez la 3D si elle est activée

---

**Profitez de vos aventures visualisées ! 🚴‍♂️🏃‍♀️🏔️**
