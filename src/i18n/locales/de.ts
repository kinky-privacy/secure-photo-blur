export const de = {
  // Landing
  'landing.hero': 'Secure Photo',
  'landing.heroAccent': 'Blur',
  'landing.dropzone.aria': 'Foto auswählen oder ablegen',
  'landing.dropzone.loading': 'Bild wird geladen…',
  'landing.dropzone.label': 'Fotos ablegen oder auswählen',
  'landing.dropzone.button': 'Foto auswählen',
  'landing.dropzone.formats': 'JPEG · PNG · WebP · HEIC',
  'landing.tagline.line1': 'Sichere, nicht KI-umkehrbare Anonymisierung.',
  'landing.tagline.line2': 'Keine personenbezogenen Daten erfasst.',
  'landing.tagline.line3': 'Metadaten entfernt.',
  'landing.tagline.line4': 'Vollständig offline.',
  'landing.nerdy.question': 'Technik-Nerds?',
  'landing.nerdy.text': 'Ausführliche technische Details im',
  'landing.nerdy.linkText': 'Open-Source-Repository',

  // Navbar
  'navbar.brand': 'Secure Photo',
  'navbar.brandAccent': 'Blur',
  'navbar.tab.grouping': 'Gruppierung',
  'navbar.tab.anonymize': 'Anonymisieren',
  'navbar.feedback': 'Feedback',
  'navbar.feedback.aria': 'Feedback senden',
  'navbar.confirm.title': 'Zurück zum Start?',
  'navbar.confirm.body': 'Nicht gespeicherte Arbeit geht verloren.',
  'navbar.confirm.cancel': 'Abbrechen',
  'navbar.confirm.go': 'Zurück',

  // Editor
  'editor.position': '{current} von {total}',
  'editor.reassurance.original': '🛡️ Das Original bleibt sicher — Unschärfe wird auf eine neue Kopie angewendet',
  'editor.reassurance.location': '📍 Standortdaten werden automatisch entfernt',
  'editor.download': 'Herunterladen',
  'editor.exportNext': 'Exportieren & Nächstes',
  'editor.exporting': 'Wird exportiert…',
  'editor.downloadAnonymized': 'Anonymisiertes Bild herunterladen',
  'editor.dropAdd': 'Ablegen, um Bilder hinzuzufügen',
  'editor.dropReplace': 'Ablegen, um Bild zu ersetzen',
  'editor.selectMethod': 'Methode wählen',
  'editor.methodInfoTitle': 'Wie Unschärfe-Methoden funktionieren',
  'editor.exportFailed': 'Export fehlgeschlagen: {error}',

  // Security levels (shared)
  'security.verySafe': 'Sehr sicher',
  'security.safe': 'Sicher',
  'security.notSafe': 'Nicht sicher',
  'security.level.max': 'MAX',
  'security.level.high': 'HOCH',
  'security.level.low': 'NIEDRIG',

  // Blur methods
  'method.mosaic.label': 'Mosaik-Methode',
  'method.mosaic.description': 'Pixelt den Bereich in große Blöcke. Schwer umkehrbar und geeignet für die meisten sensiblen Inhalte.',
  'method.solid.label': 'Einfarbig-Schwarz-Methode',
  'method.solid.description': 'Bedeckt den Bereich mit einem schwarzen Rechteck. Keine Information kann wiederhergestellt werden.',
  'method.solidAvg.label': 'Einfarbig-Durchschnitt-Methode',
  'method.solidAvg.description': 'Füllt den Bereich mit der Durchschnittsfarbe der Region. Keine strukturellen Details wiederherstellbar.',
  'method.gaussian.label': 'Gaußsche Unschärfe-Methode',
  'method.gaussian.description': 'Wendet eine weiche Unschärfe an. Kann durch KI umgekehrt werden — nur für nicht-sensible Inhalte verwenden.',
  'method.gaussian.warning': 'Forschung (2025) zeigt, dass Gaußsche Unschärfe durch KI umkehrbar ist. Nur für nicht-sensible Inhalte verwenden.',

  // Security info dialog
  'securityInfo.title': 'Wie Unschärfe-Methoden funktionieren',
  'securityInfo.intro': 'Nicht alle Unschärfe-Methoden sind gleich sicher. Einige können durch KI-Tools umgekehrt werden — andere zerstören Informationen dauerhaft. Hier ist, was jede Methode tut.',
  'securityInfo.gotIt': 'Verstanden',
  'securityInfo.notRecommended': '⚠ Nicht empfohlen für sensible Inhalte.',
  'securityInfo.mosaic.label': 'Mosaik',
  'securityInfo.mosaic.simple': 'Zerlegt Ihr Foto in große Blöcke, wie ein Puzzle mit sehr wenigen Teilen.',
  'securityInfo.mosaic.technical': 'Adaptive Blockpixelung reduziert jeden Gesichtsbereich auf ~5×5 effektive Pixel, unabhängig von Bildauflösung oder Exportskalierung (Blockgröße skaliert proportional mit dem Bereich, mindestens 12px). Jeder Block mittelt alle Pixelwerte und zerstört so räumliche Details. Allerdings ist die regelmäßige Gitterstruktur nicht zufällig, was bedeutet, dass ausgefeilte ML-Modelle dies theoretisch ausnutzen könnten. Ohne Rauschschicht ist dies stark, aber nicht maximale Sicherheit.',
  'securityInfo.solid.label': 'Einfarbig Schwarz',
  'securityInfo.solid.simple': 'Bedeckt den Bereich vollständig in Schwarz. Es bleibt nichts darunter — es ist für immer weg.',
  'securityInfo.solid.technical': '100% Informationszerstörung. Jeder Pixel wird auf R=0, G=0, B=0 gesetzt. Dies ist beweisbar irreversibel: Kein Algorithmus kann Daten wiederherstellen, die nicht mehr existieren. Die Fantômas-Studie (PoPETs 2024) ergab, dass einfarbige Füllung eine der wenigen Methoden war, die allen ML-basierten De-Anonymisierungsangriffen widerstanden.',
  'securityInfo.solidAvg.label': 'Einfarbig Durchschnitt',
  'securityInfo.solidAvg.simple': 'Ersetzt den Bereich durch eine einzige Farbe. Es bleibt nichts darunter — es ist für immer weg.',
  'securityInfo.solidAvg.technical': 'Berechnet die durchschnittlichen R-, G-, B-Werte aller Pixel in der Region und füllt dann die gesamte Region mit dieser einheitlichen Farbe. Nur ein Farbwert bleibt erhalten — alle räumlichen Informationen, Texturen und Formdaten werden zerstört. Funktional gleichwertig mit einfarbiger Füllung hinsichtlich der Irreversibilität.',
  'securityInfo.gaussian.label': 'Gaußsche Unschärfe',
  'securityInfo.gaussian.simple': 'Macht das Foto unscharf, wie durch beschlagenes Glas schauen. Aber KI-Tools können diesen Effekt umkehren.',
  'securityInfo.gaussian.technical': 'Das Revelio-Paper (arXiv:2506.12344, Juni 2025) zeigte, dass Gaußsche Unschärfe selbst bei Kerngröße 81 umkehrbar ist. Diffusionsmodelle können die Identität einer Person aus stark unscharfen Fotos rekonstruieren, wenn das Modell des Angreifers andere Bilder dieser Person gesehen hat. Die Fantômas-Studie (PoPETs 2024) listete Gaußsche Unschärfe ebenfalls unter den 10 von 14 Anonymisierungstechniken, die zumindest teilweise umkehrbar sind. Signal verwendet Gaußsche Unschärfe und gilt als potenziell anfällig.',

  // Face list
  'faceList.detecting': 'Gesichter werden erkannt…',
  'faceList.header': 'Bereiche anonymisieren:',
  'faceList.face': 'Gesicht {n}',
  'faceList.region': 'Bereich {n}',
  'faceList.editRegion': 'Bereich bearbeiten',
  'faceList.removeRegion': 'Bereich entfernen',
  'faceList.hintCta': 'Klicken Sie auf das Foto',
  'faceList.hintText': 'für einen benutzerdefinierten Bereich',

  // Export dialog
  'export.title': 'Foto exportieren',
  'export.originalSafe': '🛡️ Ihr Original bleibt sicher',
  'export.newCopy': '📁 Eine neue Kopie wird mit der Unschärfe gespeichert',
  'export.locationRemoved': '📍 Alle Standortdaten automatisch entfernt',
  'export.cancel': 'Abbrechen',

  // Region edit modal
  'regionEdit.face': 'Gesicht {n}',
  'regionEdit.region': 'Bereich {n}',
  'regionEdit.shapeFace': 'Gesicht',
  'regionEdit.shapeRectangle': 'Rechteck',
  'regionEdit.shapeOval': 'Oval',
  'regionEdit.delete': 'Löschen',
  'regionEdit.anonymize': 'Anonymisieren',
  'regionEdit.save': 'Speichern',
  'regionEdit.close': 'Schließen',

  // Grouping view
  'grouping.keyboardShortcuts': 'Tastaturkürzel',
  'grouping.title': 'Sie haben mehrere Fotos hochgeladen',
  'grouping.desc.line1': 'Sie können sie zur besseren Kategorisierung gruppieren.',
  'grouping.desc.line2': 'Beim Export wird der Gruppenname am Anfang des Dateinamens hinzugefügt.',
  'grouping.desc.line3': 'So ist es als Fotograf/Veranstalter einfacher, Bilder an Teilnehmer zu senden.',
  'grouping.position': '{current} von {total}',
  'grouping.splitHint.press': 'Pfeiltaste drücken',
  'grouping.splitHint.toSplit': 'um in Gruppen zu teilen',
  'grouping.undoHint.toUndo': 'um Teilung rückgängig zu machen',
  'grouping.photo': 'Foto {n}',
  'grouping.continueAnonymize': 'Weiter und Fotos anonymisieren',
  'grouping.continueWithout': 'Weiter ohne Aufteilung',
  'grouping.nav': 'Zwischen Fotos navigieren',
  'grouping.split': 'In Gruppen aufteilen',
  'grouping.undo': 'Aufteilung rückgängig machen',

  // Image strip
  'imageStrip.group': 'Gruppe {n}',

  // Brush size
  'brushSize.label': 'Größe',

  // Exporter
  'exporter.shareTitle': 'Unscharfes Foto',

  // Update banner
  'update.available': 'Eine neue Version ist verfügbar.',
  'update.reload': 'Neu laden',
  'update.dismiss': 'Später',
  // Language modal
  'languageModal.title': 'Sprache',
} as const
