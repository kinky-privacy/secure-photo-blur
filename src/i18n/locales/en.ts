export const en = {
  // Landing
  'landing.hero': 'Secure Photo',
  'landing.heroAccent': 'Blur',
  'landing.dropzone.aria': 'Select or drop a photo',
  'landing.dropzone.loading': 'Loading image\u2026',
  'landing.dropzone.label': 'Drop or select photos',
  'landing.dropzone.button': 'Select Photo',
  'landing.dropzone.formats': 'JPEG \u00b7 PNG \u00b7 WebP \u00b7 HEIC',
  'landing.tagline.line1': 'Secure non AI-reversible anonymization.',
  'landing.tagline.line2': 'No personal data collected.',
  'landing.tagline.line3': 'Metadata stripped.',
  'landing.tagline.line4': 'Totally offline.',
  'landing.nerdy.question': 'Nerdy tech kinksters?',
  'landing.nerdy.text': 'Long nerdy details in the',
  'landing.nerdy.linkText': 'open-source repo',

  // Navbar
  'navbar.brand': 'Secure Photo',
  'navbar.brandAccent': 'Blur',
  'navbar.tab.grouping': 'Grouping',
  'navbar.tab.anonymize': 'Anonymize',
  'navbar.feedback': 'Feedback',
  'navbar.feedback.aria': 'Send feedback',
  'navbar.confirm.title': 'Go back to start?',
  'navbar.confirm.body': 'Unsaved work will be lost.',
  'navbar.confirm.cancel': 'Cancel',
  'navbar.confirm.go': 'Go back',

  // Editor
  'editor.position': '{current} of {total}',
  'editor.reassurance.original': '\ud83d\udee1\ufe0f Original stays safe \u2014 blur applied to a new copy',
  'editor.reassurance.location': '\ud83d\udccd Location data removed automatically',
  'editor.download': 'Download',
  'editor.exportNext': 'Export & Next',
  'editor.exporting': 'Exporting\u2026',
  'editor.downloadAnonymized': 'Download anonymized pic',
  'editor.dropAdd': 'Drop to add images',
  'editor.dropReplace': 'Drop to replace image',
  'editor.selectMethod': 'Select method',
  'editor.methodInfoTitle': 'How blur methods work',
  'editor.exportFailed': 'Export failed: {error}',

  // Security levels (shared)
  'security.verySafe': 'Very safe',
  'security.safe': 'Safe',
  'security.notSafe': 'Not safe',
  'security.level.max': 'MAX',
  'security.level.high': 'HIGH',
  'security.level.low': 'LOW',

  // Blur methods
  'method.mosaic.label': 'Mosaic method',
  'method.mosaic.description': 'Pixelates the area into large blocks. Hard to reverse and suitable for most sensitive content.',
  'method.solid.label': 'Solid black method',
  'method.solid.description': 'Covers the area with a solid black rectangle. No information can be recovered.',
  'method.solidAvg.label': 'Solid average color method',
  'method.solidAvg.description': 'Fills the area with the average color of the region. No structural detail is recoverable.',
  'method.gaussian.label': 'Gaussian blur method',
  'method.gaussian.description': 'Applies a soft blur. Can be reversed by AI \u2014 use only for non-sensitive content.',
  'method.gaussian.warning': 'Research (2025) shows Gaussian blur can be reversed by AI. Use for non-sensitive content only.',

  // Security info dialog
  'securityInfo.title': 'How blur methods work',
  'securityInfo.intro': 'Not all blur methods are equally safe. Some can be reversed by AI tools \u2014 others destroy information permanently. Here is what each method does.',
  'securityInfo.gotIt': 'Got it',
  'securityInfo.notRecommended': '\u26a0 Not recommended for sensitive content.',
  'securityInfo.mosaic.label': 'Mosaic',
  'securityInfo.mosaic.simple': 'Scrambles your photo into large blocks, like a puzzle with very few pieces.',
  'securityInfo.mosaic.technical': 'Adaptive block pixelation reduces any face region to ~5\u00d75 effective pixels regardless of image resolution or export scale (block size scales proportionally with the region, minimum 12px). Each block averages all pixel values, destroying spatial detail. However, the regular grid structure is not random, which means sophisticated ML models could theoretically exploit it. Without the noise layer, this is strong but not maximum security.',
  'securityInfo.solid.label': 'Solid black',
  'securityInfo.solid.simple': 'Covers the area completely in black. There is nothing left underneath \u2014 it is gone forever.',
  'securityInfo.solid.technical': '100% information destruction. Every pixel is set to R=0, G=0, B=0. This is provably irreversible: no algorithm can recover data that no longer exists. The Fant\u00f4mas study (PoPETs 2024) found that solid fill was one of the only methods that resisted all ML-based deanonymization attacks.',
  'securityInfo.solidAvg.label': 'Solid average',
  'securityInfo.solidAvg.simple': 'Replaces the area with one single flat color. There is nothing left underneath \u2014 it is gone forever.',
  'securityInfo.solidAvg.technical': 'Computes the average R, G, B values across all pixels in the region, then fills the entire region with that single uniform color. Only one color value survives \u2014 all spatial information, texture, and shape data is destroyed. Functionally equivalent to solid fill in terms of irreversibility.',
  'securityInfo.gaussian.label': 'Gaussian blur',
  'securityInfo.gaussian.simple': 'Makes the photo look blurry, like looking through foggy glass. But AI tools can reverse this effect.',
  'securityInfo.gaussian.technical': 'The Revelio paper (arXiv:2506.12344, June 2025) demonstrated that Gaussian blur is reversible even at kernel size 81. Diffusion models can reconstruct a person\'s identity from heavily blurred photos if the attacker\'s model has seen other images of that person. The Fant\u00f4mas study (PoPETs 2024) also listed Gaussian blur among the 10 out of 14 anonymization techniques that are at least partially reversible. Signal uses Gaussian blur and is considered potentially vulnerable.',

  // Face list
  'faceList.detecting': 'Detecting faces\u2026',
  'faceList.header': 'Anonymize areas:',
  'faceList.face': 'Face {n}',
  'faceList.region': 'Region {n}',
  'faceList.editRegion': 'Edit region',
  'faceList.removeRegion': 'Remove region',
  'faceList.hintCta': 'Click on the photo',
  'faceList.hintText': 'for a custom area',

  // Export dialog
  'export.title': 'Export photo',
  'export.originalSafe': '\ud83d\udee1\ufe0f Your original stays safe',
  'export.newCopy': '\ud83d\udcc1 A new copy is saved with the blur applied',
  'export.locationRemoved': '\ud83d\udccd All location data removed automatically',
  'export.cancel': 'Cancel',

  // Region edit modal
  'regionEdit.face': 'Face {n}',
  'regionEdit.region': 'Region {n}',
  'regionEdit.shapeFace': 'Face',
  'regionEdit.shapeRectangle': 'Rectangle',
  'regionEdit.shapeOval': 'Oval',
  'regionEdit.delete': 'Delete',
  'regionEdit.anonymize': 'Anonymize',
  'regionEdit.save': 'Save',
  'regionEdit.close': 'Close',

  // Grouping view
  'grouping.keyboardShortcuts': 'Keyboard shortcuts',
  'grouping.title': 'You uploaded multiple photos',
  'grouping.desc.line1': 'You can group them for better categorization.',
  'grouping.desc.line2': 'On export the group name will be added in the beginning of the file name.',
  'grouping.desc.line3': 'In this way, if you\u2019re the photographer/event organizer it will be easier to send pictures to event participants.',
  'grouping.position': '{current} of {total}',
  'grouping.splitHint.press': 'Press arrow',
  'grouping.splitHint.toSplit': 'to split in groups',
  'grouping.undoHint.toUndo': 'to undo split',
  'grouping.photo': 'Photo {n}',
  'grouping.continueAnonymize': 'Continue and anonymize photos',
  'grouping.continueWithout': 'Continue without splitting',
  'grouping.nav': 'Navigate between photos',
  'grouping.split': 'Split into groups',
  'grouping.undo': 'Undo split',

  // Image strip
  'imageStrip.group': 'Group {n}',

  // Brush size
  'brushSize.label': 'Size',

  // Exporter
  'exporter.shareTitle': 'Blurred photo',

  // Update banner
  'update.available': 'A new version is available.',
  'update.reload': 'Reload',
  'update.dismiss': 'Later',
  // Language modal
  'languageModal.title': 'Language',
} as const
