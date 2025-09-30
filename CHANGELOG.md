# Changelog

Toutes les modifications notables de ce projet seront documentées dans ce fichier.

Le format est basé sur [Keep a Changelog](https://keepachangelog.com/fr/1.0.0/),
et ce projet adhère au [Versioning Sémantique](https://semver.org/lang/fr/).

## [Non publié]

### Ajouté

- Configuration dynamique des URLs de redirection Strava pour le déploiement
- Support complet pour Cloudflare Pages avec configuration automatisée
- Script de déploiement automatisé (`scripts/deploy.sh`)
- Guide de déploiement complet (`DEPLOYMENT_GUIDE.md`)
- Fichier de configuration Cloudflare Pages (`wrangler.toml`)
- Variables d'environnement pour la production (`.env.production.example`)
- Commandes npm pour faciliter le déploiement (`deploy:prepare`, `check:deployment`)
- Messages d'état vide plus informatifs dans la liste des activités
- Comportement différencié pour les onglets "Récentes" vs "Toutes" dans l'état vide

### Modifié

- **BREAKING CHANGE**: Les activités ne se chargent plus automatiquement au démarrage
- **BREAKING CHANGE**: La checkbox "Afficher toutes les traces GPX" est maintenant décochée par défaut
- Amélioration du tri des activités : toujours du plus récent au plus ancien (cohérent entre "Récentes" et "Toutes")
- Service d'authentification Strava utilise maintenant des URLs dynamiques basées sur l'environnement
- Cache des boutons zoom (+/-) et de la boussole sur mobile (écrans ≤ 768px)
- Interface plus épurée sur mobile avec contrôles optimisés pour le tactile

### Optimisé

- Performance de démarrage : seules les activités récentes (30 jours) sont chargées initialement
- Expérience utilisateur : l'utilisateur choisit maintenant quoi afficher plutôt que tout charger automatiquement
- Tri des activités optimisé avec algorithme de tri explicite par date
- Interface mobile plus clean sans contrôles de navigation encombrante

### Supprimé

- Fonction `loadActivitiesAndDisplayAll` obsolète (remplacée par le nouveau comportement)
- Chargement automatique de toutes les activités au démarrage (améliore les performances)
- Variable d'environnement `VITE_STRAVA_REDIRECT_URI` (maintenant calculée dynamiquement)

### Corrigé

- Tri cohérent des activités récentes (du plus récent au plus ancien)
- Gestion correcte des états d'affichage par défaut
- Interface mobile optimisée sans éléments perturbateurs

### Sécurité

- Configuration des headers de sécurité pour Cloudflare Pages
- Gestion sécurisée des variables d'environnement en production
- URLs de redirection dynamiques évitent les erreurs de configuration

## [1.0.0] - 2024-01-XX

### Ajouté

- Application web complète pour visualiser les activités Strava
- Authentification OAuth2 avec Strava
- Intégration MapLibre GL JS avec tiles MapTiler
- Support 3D avec rendu de terrain
- 5 styles de carte (Topographic, Hybrid, Outdoor, Streets, Topo)
- Interface responsive et moderne
- Gestion des activités multiples avec couleurs automatiques
- Contrôles 3D avancés avec raccourcis clavier
- Filtres par période et type d'activité
- Chargement progressif avec indicateurs
- Support complet mobile et desktop

### Technologies

- Vue 3 + TypeScript + Vite
- MapLibre GL JS
- MapTiler API
- Strava API v3
- CSS moderne avec variables

---

## Notes de version

### Déploiement Cloudflare Pages

Cette version inclut tout le nécessaire pour déployer facilement sur Cloudflare Pages :

- Configuration automatisée
- Gestion des variables d'environnement
- URLs de redirection dynamiques
- Headers de sécurité optimisés
- Support du SPA routing

### Changements de comportement importants

⚠️ **Attention** : Cette version change le comportement par défaut :

- L'application ne charge plus toutes les activités automatiquement
- L'affichage des traces est désactivé par défaut
- Seules les activités récentes (30 jours) sont chargées initialement

Ces changements améliorent significativement les performances et l'expérience utilisateur, particulièrement pour les utilisateurs avec de nombreuses activités.

### Migration depuis la version précédente

Aucune action requise - les changements sont transparents pour l'utilisateur final et améliorent l'expérience globale.
