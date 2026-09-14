# Atelier vocal

Application de synthèse vocale avec 30 voix Gemini, consignes personnalisables et téléchargement WAV.

Le champ de texte est vide à l’ouverture. Aucune génération ne démarre automatiquement. Le texte est conservé uniquement en mémoire dans l’onglet, puis envoyé au serveur et à Google lorsque l’utilisateur clique sur « Générer l’audio ». L’application ne conserve pas les textes sur son serveur ; les règles de traitement du fournisseur restent applicables.

## Exécution locale

1. Installer les dépendances avec `npm install`.
2. Créer un fichier `.env` contenant `GEMINI_API_KEY=votre_cle` (ne pas le publier).
3. Lancer `npm run dev`.

## Vérification et production

`npm run lint` puis `npm run build`.

Définir `NODE_ENV=production` et `GEMINI_API_KEY` dans l’environnement du serveur, puis lancer `npm start`.

Dans le projet AI Studio connecté à ce dépôt : GitHub → Pull changes to Google AI Studio, puis Publish. La page publiée doit afficher « Atelier vocal », 30 voix et une zone de texte vide.
