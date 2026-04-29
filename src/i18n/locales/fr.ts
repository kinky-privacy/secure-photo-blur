export const fr = {
  // Landing
  'landing.hero': 'Secure Photo',
  'landing.heroAccent': 'Blur',
  'landing.dropzone.aria': 'Sélectionner ou déposer une photo',
  'landing.dropzone.loading': 'Chargement de l\'image…',
  'landing.dropzone.label': 'Déposez ou sélectionnez des photos',
  'landing.dropzone.button': 'Sélectionner une photo',
  'landing.dropzone.formats': 'JPEG · PNG · WebP · HEIC',
  'landing.tagline.line1': 'Anonymisation sécurisée non réversible par IA.',
  'landing.tagline.line2': 'Aucune donnée personnelle collectée.',
  'landing.tagline.line3': 'Métadonnées supprimées.',
  'landing.tagline.line4': 'Totalement hors ligne.',
  'landing.nerdy.text': 'Détails techniques pour nerds dans le',
  'landing.nerdy.linkText': 'dépôt open-source',
  'landing.nerdy.dmPrefix': 'FetLife DMs à',
  'landing.nerdy.or': 'ou à',

  // Navbar
  'navbar.brand': 'Secure Photo',
  'navbar.brandAccent': 'Blur',
  'navbar.tab.grouping': 'Regroupement',
  'navbar.tab.anonymize': 'Anonymiser',
  'navbar.feedback': 'Questions ? Retours ?',
  'navbar.feedback.aria': 'Envoyer des questions ou retours',
  'feedbackModal.title': 'Nous contacter',
  'feedbackModal.or': 'ou écris-moi directement',
  'feedbackModal.email': 'E-mail',
  'feedbackModal.fetlife': 'DM sur FetLife',
  'feedbackModal.anonymous': 'Feedback anonyme',
  'feedbackModal.anonymousDesc': 'Tally form',
  'navbar.confirm.title': 'Revenir au début ?',
  'navbar.confirm.body': 'Le travail non sauvegardé sera perdu.',
  'navbar.confirm.cancel': 'Annuler',
  'navbar.confirm.go': 'Revenir',

  // Editor
  'editor.position': '{current} sur {total}',
  'editor.reassurance.original': '🛡️ L\'original reste en sécurité — le flou est appliqué sur une nouvelle copie',
  'editor.reassurance.location': '📍 Données de localisation supprimées automatiquement',
  'editor.download': 'Télécharger',
  'editor.exportNext': 'Exporter & Suivant',
  'editor.exporting': 'Exportation…',
  'editor.downloadAnonymized': 'Télécharger l\'image anonymisée',
  'editor.dropAdd': 'Déposez pour ajouter des images',
  'editor.dropReplace': 'Déposez pour remplacer l\'image',
  'editor.selectMethod': 'Choisir la méthode',
  'editor.methodInfoTitle': 'Comment fonctionnent les méthodes de flou',
  'editor.exportFailed': 'Échec de l\'exportation : {error}',

  // Security levels (shared)
  'security.verySafe': 'Très sûr',
  'security.safe': 'Sûr',
  'security.notSafe': 'Non sûr',
  'security.level.max': 'MAX',
  'security.level.high': 'ÉLEVÉ',
  'security.level.low': 'FAIBLE',

  // Blur methods
  'method.mosaic.label': 'Méthode mosaïque',
  'method.mosaic.description': 'Pixélise la zone en grands blocs. Difficile à inverser et adapté aux contenus les plus sensibles.',
  'method.solid.label': 'Méthode noir uni',
  'method.solid.description': 'Couvre la zone avec un rectangle noir uni. Aucune information ne peut être récupérée.',
  'method.solidAvg.label': 'Méthode couleur moyenne unie',
  'method.solidAvg.description': 'Remplit la zone avec la couleur moyenne de la région. Aucun détail structurel n\'est récupérable.',
  'method.gaussian.label': 'Méthode flou gaussien',
  'method.gaussian.description': 'Applique un flou doux. Peut être inversé par l\'IA — à utiliser uniquement pour les contenus non sensibles.',
  'method.gaussian.warning': 'La recherche (2025) montre que le flou gaussien peut être inversé par l\'IA. À utiliser uniquement pour les contenus non sensibles.',

  // Security info dialog
  'securityInfo.title': 'Comment fonctionnent les méthodes de flou',
  'securityInfo.intro': 'Toutes les méthodes de flou ne sont pas également sûres. Certaines peuvent être inversées par des outils d\'IA — d\'autres détruisent les informations de manière permanente. Voici ce que fait chaque méthode.',
  'securityInfo.gotIt': 'Compris',
  'securityInfo.notRecommended': '⚠ Non recommandé pour les contenus sensibles.',
  'securityInfo.mosaic.label': 'Mosaïque',
  'securityInfo.mosaic.simple': 'Brouille votre photo en grands blocs, comme un puzzle avec très peu de pièces.',
  'securityInfo.mosaic.technical': 'La pixélisation par blocs adaptatifs réduit toute zone de visage à ~5×5 pixels effectifs, quelle que soit la résolution de l\'image ou l\'échelle d\'exportation (la taille des blocs est proportionnelle à la région, minimum 12px). Chaque bloc fait la moyenne de toutes les valeurs de pixels, détruisant les détails spatiaux. Cependant, la structure de grille régulière n\'est pas aléatoire, ce qui signifie que des modèles ML sophistiqués pourraient théoriquement l\'exploiter. Sans couche de bruit, c\'est fort mais pas une sécurité maximale.',
  'securityInfo.solid.label': 'Noir uni',
  'securityInfo.solid.simple': 'Couvre complètement la zone en noir. Il ne reste rien en dessous — c\'est parti pour toujours.',
  'securityInfo.solid.technical': 'Destruction d\'information à 100%. Chaque pixel est réglé sur R=0, G=0, B=0. C\'est prouvablement irréversible : aucun algorithme ne peut récupérer des données qui n\'existent plus. L\'étude Fantômas (PoPETs 2024) a constaté que le remplissage uni était l\'une des seules méthodes résistant à toutes les attaques de dé-anonymisation basées sur le ML.',
  'securityInfo.solidAvg.label': 'Couleur moyenne unie',
  'securityInfo.solidAvg.simple': 'Remplace la zone par une seule couleur unie. Il ne reste rien en dessous — c\'est parti pour toujours.',
  'securityInfo.solidAvg.technical': 'Calcule les valeurs moyennes R, G, B de tous les pixels de la région, puis remplit toute la région avec cette couleur uniforme unique. Seule une valeur de couleur survit — toutes les informations spatiales, textures et données de forme sont détruites. Fonctionnellement équivalent au remplissage uni en termes d\'irréversibilité.',
  'securityInfo.gaussian.label': 'Flou gaussien',
  'securityInfo.gaussian.simple': 'Rend la photo floue, comme si vous regardiez à travers un verre embué. Mais les outils d\'IA peuvent inverser cet effet.',
  'securityInfo.gaussian.technical': 'L\'article Revelio (arXiv:2506.12344, juin 2025) a démontré que le flou gaussien est réversible même avec une taille de noyau de 81. Les modèles de diffusion peuvent reconstruire l\'identité d\'une personne à partir de photos fortement floues si le modèle de l\'attaquant a vu d\'autres images de cette personne. L\'étude Fantômas (PoPETs 2024) a également classé le flou gaussien parmi les 10 des 14 techniques d\'anonymisation au moins partiellement réversibles. Signal utilise le flou gaussien et est considéré comme potentiellement vulnérable.',

  // Face list
  'faceList.detecting': 'Détection des visages…',
  'faceList.header': 'Zones à anonymiser :',
  'faceList.face': 'Visage {n}',
  'faceList.region': 'Région {n}',
  'faceList.editRegion': 'Modifier la région',
  'faceList.removeRegion': 'Supprimer la région',
  'faceList.hintCta': 'Cliquez sur la photo',
  'faceList.hintText': 'pour une zone personnalisée',

  // Export dialog
  'export.title': 'Exporter la photo',
  'export.originalSafe': '🛡️ Votre original reste en sécurité',
  'export.newCopy': '📁 Une nouvelle copie est enregistrée avec le flou appliqué',
  'export.locationRemoved': '📍 Toutes les données de localisation supprimées automatiquement',
  'export.cancel': 'Annuler',

  // Region edit modal
  'regionEdit.face': 'Visage {n}',
  'regionEdit.region': 'Région {n}',
  'regionEdit.shapeFace': 'Visage',
  'regionEdit.shapeRectangle': 'Rectangle',
  'regionEdit.shapeOval': 'Ovale',
  'regionEdit.delete': 'Supprimer',
  'regionEdit.anonymize': 'Anonymiser',
  'regionEdit.save': 'Enregistrer',
  'regionEdit.close': 'Fermer',

  // Grouping view
  'grouping.keyboardShortcuts': 'Raccourcis clavier',
  'grouping.title': 'Vous avez importé plusieurs photos',
  'grouping.desc.line1': 'Vous pouvez les regrouper pour une meilleure organisation.',
  'grouping.desc.line2': 'À l\'exportation, le nom du groupe sera ajouté au début du nom de fichier.',
  'grouping.desc.line3': 'Ainsi, en tant que photographe ou organisateur, il sera plus facile d\'envoyer les photos aux participants.',
  'grouping.position': '{current} sur {total}',
  'grouping.splitHint.press': 'Appuyez sur la flèche',
  'grouping.splitHint.toSplit': 'pour séparer en groupes',
  'grouping.undoHint.toUndo': 'pour annuler la séparation',
  'grouping.photo': 'Photo {n}',
  'grouping.continueAnonymize': 'Continuer et anonymiser les photos',
  'grouping.continueWithout': 'Continuer sans séparer',
  'grouping.nav': 'Naviguer entre les photos',
  'grouping.split': 'Séparer en groupes',
  'grouping.undo': 'Annuler la séparation',

  // Image strip
  'imageStrip.group': 'Groupe {n}',

  // Brush size
  'brushSize.label': 'Taille',

  // Exporter
  'exporter.shareTitle': 'Photo floutée',

  // Update banner
  'update.available': 'Une nouvelle version est disponible.',
  'update.reload': 'Recharger',
  'update.dismiss': 'Plus tard',
  // Language modal
  'languageModal.title': 'Langue',
} as const
