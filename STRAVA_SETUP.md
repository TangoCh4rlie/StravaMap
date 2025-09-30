# Configuration de l'API Strava

Ce guide vous explique comment configurer votre application Strava pour pouvoir utiliser cette application.

## Étape 1 : Créer une application Strava

1. Rendez-vous sur [https://www.strava.com/settings/api](https://www.strava.com/settings/api)
2. Connectez-vous à votre compte Strava
3. Cliquez sur "Create & Manage Your App"
4. Remplissez le formulaire avec les informations suivantes :

### Informations de l'application

- **Application Name** : `Strava GPX Viewer` (ou le nom de votre choix)
- **Category** : `Visualizer`
- **Club** : Laissez vide
- **Website** : `http://localhost:5173` (pour le développement local)
- **Application Description** : 
  ```
  Application web pour visualiser les activités Strava sur une carte interactive.
  Permet de filtrer les activités par type et période.
  ```

### URLs de redirection

- **Authorization Callback Domain** : `localhost`
- **Authorization Callback URL** : `http://localhost:5173/auth/strava/callback`

## Étape 2 : Récupérer les clés API

Une fois votre application créée, vous verrez apparaître :

1. **Client ID** : Un nombre (ex: `123456`)
2. **Client Secret** : Une chaîne de caractères (ex: `a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0`)

⚠️ **Important** : Gardez le Client Secret confidentiel ! Ne le partagez jamais et ne le commitez pas dans votre code.

## Étape 3 : Configuration locale

1. Copiez le fichier `.env.example` vers `.env` :
   ```bash
   cp .env.example .env
   ```

2. Éditez le fichier `.env` et remplacez les valeurs :
   ```env
   # Strava API Configuration
   VITE_STRAVA_CLIENT_ID=123456
   VITE_STRAVA_CLIENT_SECRET=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0
   VITE_STRAVA_REDIRECT_URI=http://localhost:5173/auth/strava/callback
   ```

3. Remplacez :
   - `123456` par votre Client ID
   - `a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0` par votre Client Secret

## Étape 4 : Tester l'application

1. Démarrez le serveur de développement :
   ```bash
   npm run dev
   ```

2. Ouvrez votre navigateur sur [http://localhost:5173](http://localhost:5173)

3. Cliquez sur "Se connecter avec Strava"

4. Autorisez l'application sur Strava

5. Vous devriez être redirigé vers l'application avec vos informations utilisateur

## Permissions demandées

L'application demande les permissions suivantes :

- **read** : Accès en lecture aux informations de base du profil
- **activity:read_all** : Accès en lecture à toutes les activités (publiques et privées)

## Troubleshooting

### Erreur "Invalid client_id"
- Vérifiez que le `VITE_STRAVA_CLIENT_ID` dans votre fichier `.env` correspond exactement au Client ID de votre application Strava

### Erreur "Invalid redirect_uri"
- Vérifiez que l'URL de callback dans les paramètres de votre application Strava est exactement : `http://localhost:5173/auth/strava/callback`
- Assurez-vous que le domaine autorisé est `localhost`

### Erreur "Invalid client_secret"
- Vérifiez que le `VITE_STRAVA_CLIENT_SECRET` dans votre fichier `.env` correspond exactement au Client Secret de votre application Strava
- Attention aux espaces en début/fin de chaîne

### L'application ne se connecte pas
1. Ouvrez les outils de développement de votre navigateur (F12)
2. Regardez les erreurs dans la console
3. Vérifiez l'onglet Network pour voir les requêtes HTTP
4. Assurez-vous que votre fichier `.env` est bien à la racine du projet

## Déploiement en production

Pour déployer en production :

1. Créez une nouvelle application Strava ou modifiez l'existante
2. Changez l'URL de callback pour pointer vers votre domaine de production
3. Mettez à jour les variables d'environnement sur votre serveur de production
4. N'oubliez pas de sécuriser votre Client Secret côté serveur

## Limites de l'API Strava

- **Rate Limiting** : 1000 requêtes par jour, 100 par 15 minutes
- **Données** : Accès limité aux 30 derniers jours pour les utilisateurs non premium
- **Activités privées** : Accessible uniquement si l'utilisateur a donné son consentement

## Ressources utiles

- [Documentation officielle de l'API Strava](https://developers.strava.com/docs/)
- [Guide OAuth 2.0 de Strava](https://developers.strava.com/docs/authentication/)
- [Playground API Strava](https://developers.strava.com/playground/)
