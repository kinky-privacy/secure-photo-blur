export const it = {
  // Landing
  'landing.hero': 'Secure Photo',
  'landing.heroAccent': 'Blur',
  'landing.dropzone.aria': 'Seleziona o trascina una foto',
  'landing.dropzone.loading': 'Caricamento immagine\u2026',
  'landing.dropzone.label': 'Trascina o seleziona foto',
  'landing.dropzone.button': 'Seleziona foto',
  'landing.dropzone.formats': 'JPEG \u00b7 PNG \u00b7 WebP \u00b7 HEIC',
  'landing.tagline.line1': 'Anonimizzazione sicura non reversibile con AI.',
  'landing.tagline.line2': 'Nessun dato personale raccolto.',
  'landing.tagline.line3': 'Metadati rimossi.',
  'landing.tagline.line4': 'Totalmente offline.',
  'landing.nerdy.text': 'Dettagli tecnici per nerd kinkster nel',
  'landing.nerdy.linkText': 'repo open-source',
  'landing.nerdy.dmPrefix': 'FetLife DMs a',
  'landing.nerdy.or': 'oppure a',

  // Navbar
  'navbar.brand': 'Secure Photo',
  'navbar.brandAccent': 'Blur',
  'navbar.tab.grouping': 'Gruppi',
  'navbar.tab.anonymize': 'Anonimizza',
  'navbar.feedback': 'Domande? Feedback?',
  'navbar.feedback.aria': 'Invia domande o feedback',
  'feedbackModal.title': 'Contattaci',
  'feedbackModal.or': 'Oppure scrivimi direttamente',
  'feedbackModal.email': 'Email',
  'feedbackModal.fetlife': 'DM su FetLife',
  'feedbackModal.anonymous': 'Feedback anonimo',
  'feedbackModal.anonymousDesc': 'Tally form',
  'navbar.confirm.title': 'Tornare all\u2019inizio?',
  'navbar.confirm.body': 'Il lavoro non salvato andr\u00e0 perso.',
  'navbar.confirm.cancel': 'Annulla',
  'navbar.confirm.go': 'Torna indietro',

  // Editor
  'editor.position': '{current} di {total}',
  'editor.reassurance.original': '\ud83d\udee1\ufe0f L\u2019originale resta al sicuro \u2014 la sfocatura viene applicata a una nuova copia',
  'editor.reassurance.location': '\ud83d\udccd Dati di posizione rimossi automaticamente',
  'editor.download': 'Scarica',
  'editor.exportNext': 'Esporta e avanti',
  'editor.exporting': 'Esportazione\u2026',
  'editor.downloadAnonymized': 'Scarica foto anonimizzata',
  'editor.dropAdd': 'Trascina per aggiungere immagini',
  'editor.dropReplace': 'Trascina per sostituire l\u2019immagine',
  'editor.selectMethod': 'Seleziona metodo',
  'editor.methodInfoTitle': 'Come funzionano i metodi di sfocatura',
  'editor.exportFailed': 'Esportazione fallita: {error}',

  // Security levels (shared)
  'security.verySafe': 'Molto sicuro',
  'security.safe': 'Sicuro',
  'security.notSafe': 'Non sicuro',
  'security.level.max': 'MAX',
  'security.level.high': 'ALTO',
  'security.level.low': 'BASSO',

  // Blur methods
  'method.mosaic.label': 'Metodo mosaico',
  'method.mosaic.description': 'Pixela l\u2019area in grandi blocchi. Difficile da invertire, adatto per contenuti sensibili.',
  'method.solid.label': 'Metodo nero pieno',
  'method.solid.description': 'Copre l\u2019area con un rettangolo nero pieno. Nessuna informazione pu\u00f2 essere recuperata.',
  'method.solidAvg.label': 'Metodo colore medio',
  'method.solidAvg.description': 'Riempie l\u2019area con il colore medio della regione. Nessun dettaglio strutturale \u00e8 recuperabile.',
  'method.gaussian.label': 'Metodo sfocatura gaussiana',
  'method.gaussian.description': 'Applica una sfocatura morbida. Pu\u00f2 essere invertita dall\u2019AI \u2014 usa solo per contenuti non sensibili.',
  'method.gaussian.warning': 'Ricerche (2025) mostrano che la sfocatura gaussiana pu\u00f2 essere invertita dall\u2019AI. Usare solo per contenuti non sensibili.',

  // Security info dialog
  'securityInfo.title': 'Come funzionano i metodi di sfocatura',
  'securityInfo.intro': 'Non tutti i metodi di sfocatura sono ugualmente sicuri. Alcuni possono essere invertiti da strumenti AI \u2014 altri distruggono le informazioni in modo permanente. Ecco cosa fa ciascun metodo.',
  'securityInfo.gotIt': 'Ho capito',
  'securityInfo.notRecommended': '\u26a0 Non raccomandato per contenuti sensibili.',
  'securityInfo.mosaic.label': 'Mosaico',
  'securityInfo.mosaic.simple': 'Scompone la foto in grandi blocchi, come un puzzle con pochissimi pezzi.',
  'securityInfo.mosaic.technical': 'La pixelazione a blocchi adattiva riduce qualsiasi regione del viso a ~5\u00d75 pixel effettivi, indipendentemente dalla risoluzione dell\u2019immagine o dalla scala di esportazione (la dimensione del blocco scala proporzionalmente con la regione, minimo 12px). Ogni blocco calcola la media di tutti i valori dei pixel, distruggendo i dettagli spaziali. Tuttavia, la struttura regolare della griglia non \u00e8 casuale, il che significa che modelli ML sofisticati potrebbero teoricamente sfruttarla. Senza lo strato di rumore, questa \u00e8 forte ma non \u00e8 sicurezza massima.',
  'securityInfo.solid.label': 'Nero pieno',
  'securityInfo.solid.simple': 'Copre completamente l\u2019area in nero. Non resta nulla sotto \u2014 \u00e8 sparito per sempre.',
  'securityInfo.solid.technical': 'Distruzione delle informazioni al 100%. Ogni pixel viene impostato a R=0, G=0, B=0. Questo \u00e8 dimostrabilmente irreversibile: nessun algoritmo pu\u00f2 recuperare dati che non esistono pi\u00f9. Lo studio Fant\u00f4mas (PoPETs 2024) ha scoperto che il riempimento pieno era uno dei pochi metodi a resistere a tutti gli attacchi di de-anonimizzazione basati su ML.',
  'securityInfo.solidAvg.label': 'Colore medio',
  'securityInfo.solidAvg.simple': 'Sostituisce l\u2019area con un unico colore piatto. Non resta nulla sotto \u2014 \u00e8 sparito per sempre.',
  'securityInfo.solidAvg.technical': 'Calcola i valori medi R, G, B di tutti i pixel nella regione, poi riempie l\u2019intera regione con quel singolo colore uniforme. Sopravvive solo un valore di colore \u2014 tutte le informazioni spaziali, texture e dati di forma vengono distrutti. Funzionalmente equivalente al riempimento pieno in termini di irreversibilit\u00e0.',
  'securityInfo.gaussian.label': 'Sfocatura gaussiana',
  'securityInfo.gaussian.simple': 'Rende la foto sfocata, come guardare attraverso un vetro appannato. Ma gli strumenti AI possono invertire questo effetto.',
  'securityInfo.gaussian.technical': 'Il paper Revelio (arXiv:2506.12344, giugno 2025) ha dimostrato che la sfocatura gaussiana \u00e8 reversibile anche con kernel di dimensione 81. I modelli di diffusione possono ricostruire l\u2019identit\u00e0 di una persona da foto molto sfocate se il modello dell\u2019attaccante ha visto altre immagini di quella persona. Lo studio Fant\u00f4mas (PoPETs 2024) ha anche elencato la sfocatura gaussiana tra le 10 su 14 tecniche di anonimizzazione almeno parzialmente reversibili. Signal usa la sfocatura gaussiana ed \u00e8 considerata potenzialmente vulnerabile.',

  // Face list
  'faceList.detecting': 'Rilevamento volti\u2026',
  'faceList.header': 'Aree da anonimizzare:',
  'faceList.face': 'Volto {n}',
  'faceList.region': 'Regione {n}',
  'faceList.editRegion': 'Modifica regione',
  'faceList.removeRegion': 'Rimuovi regione',
  'faceList.hintCta': 'Clicca sulla foto',
  'faceList.hintText': 'per un\u2019area personalizzata',

  // Export dialog
  'export.title': 'Esporta foto',
  'export.originalSafe': '\ud83d\udee1\ufe0f L\u2019originale resta al sicuro',
  'export.newCopy': '\ud83d\udcc1 Una nuova copia viene salvata con la sfocatura applicata',
  'export.locationRemoved': '\ud83d\udccd Tutti i dati di posizione rimossi automaticamente',
  'export.cancel': 'Annulla',

  // Region edit modal
  'regionEdit.face': 'Volto {n}',
  'regionEdit.region': 'Regione {n}',
  'regionEdit.shapeFace': 'Volto',
  'regionEdit.shapeRectangle': 'Rettangolo',
  'regionEdit.shapeOval': 'Ovale',
  'regionEdit.delete': 'Elimina',
  'regionEdit.anonymize': 'Anonimizza',
  'regionEdit.save': 'Salva',
  'regionEdit.close': 'Chiudi',

  // Grouping view
  'grouping.keyboardShortcuts': 'Scorciatoie da tastiera',
  'grouping.title': 'Hai caricato pi\u00f9 foto',
  'grouping.desc.line1': 'Puoi raggrupparle per una migliore categorizzazione.',
  'grouping.desc.line2': 'All\u2019esportazione il nome del gruppo verr\u00e0 aggiunto all\u2019inizio del nome file.',
  'grouping.desc.line3': 'In questo modo, se sei il fotografo/organizzatore dell\u2019evento sar\u00e0 pi\u00f9 facile inviare le foto ai partecipanti.',
  'grouping.position': '{current} di {total}',
  'grouping.splitHint.press': 'Premi freccia',
  'grouping.splitHint.toSplit': 'per dividere in gruppi',
  'grouping.undoHint.toUndo': 'per annullare la divisione',
  'grouping.photo': 'Foto {n}',
  'grouping.continueAnonymize': 'Continua e anonimizza le foto',
  'grouping.continueWithout': 'Continua senza dividere',
  'grouping.nav': 'Naviga tra le foto',
  'grouping.split': 'Dividi in gruppi',
  'grouping.undo': 'Annulla divisione',

  // Image strip
  'imageStrip.group': 'Gruppo {n}',

  // Brush size
  'brushSize.label': 'Dimensione',

  // Exporter
  'exporter.shareTitle': 'Foto anonimizzata',

  // Update banner
  'update.available': 'Una nuova versione è disponibile.',
  'update.reload': 'Ricarica',
  'update.dismiss': 'Dopo',
  // Language modal
  'languageModal.title': 'Lingua',
} as const
