export const pl = {
  // Landing
  'landing.hero': 'Secure Photo',
  'landing.heroAccent': 'Blur',
  'landing.dropzone.aria': 'Wybierz lub upuść zdjęcie',
  'landing.dropzone.loading': 'Ładowanie obrazu\u2026',
  'landing.dropzone.label': 'Upuść lub wybierz zdjęcia',
  'landing.dropzone.button': 'Wybierz zdjęcie',
  'landing.dropzone.formats': 'JPEG \u00b7 PNG \u00b7 WebP \u00b7 HEIC',
  'landing.tagline.line1': 'Bezpieczna anonimizacja nieodwracalna przez AI.',
  'landing.tagline.line2': 'Żadne dane osobowe nie są zbierane.',
  'landing.tagline.line3': 'Metadane usunięte.',
  'landing.tagline.line4': 'Całkowicie offline.',
  'landing.nerdy.text': 'Nerdowe szczegóły techniczne w',
  'landing.nerdy.linkText': 'repozytorium open-source',
  'landing.nerdy.dmPrefix': 'FetLife DMs do',
  'landing.nerdy.or': 'lub na',

  // Navbar
  'navbar.brand': 'Secure Photo',
  'navbar.brandAccent': 'Blur',
  'navbar.tab.grouping': 'Grupowanie',
  'navbar.tab.anonymize': 'Anonimizuj',
  'navbar.feedback': 'Pytania? Opinie?',
  'navbar.feedback.aria': 'Wyślij pytania lub opinię',
  'feedbackModal.title': 'Skontaktuj się',
  'feedbackModal.or': 'lub napisz do mnie bezpośrednio',
  'feedbackModal.email': 'E-mail',
  'feedbackModal.fetlife': 'DM na FetLife',
  'feedbackModal.anonymous': 'Anonimowa opinia',
  'feedbackModal.anonymousDesc': 'Tally form',
  'navbar.confirm.title': 'Wrócić na początek?',
  'navbar.confirm.body': 'Niezapisane zmiany zostaną utracone.',
  'navbar.confirm.cancel': 'Anuluj',
  'navbar.confirm.go': 'Wróć',

  // Editor
  'editor.position': '{current} z {total}',
  'editor.reassurance.original': '\ud83d\udee1\ufe0f Oryginał pozostaje bezpieczny \u2014 rozmycie zastosowane na nowej kopii',
  'editor.reassurance.location': '\ud83d\udccd Dane lokalizacji usunięte automatycznie',
  'editor.download': 'Pobierz',
  'editor.exportNext': 'Eksportuj i następne',
  'editor.exporting': 'Eksportowanie\u2026',
  'editor.downloadAnonymized': 'Pobierz zanonimizowane zdjęcie',
  'editor.dropAdd': 'Upuść, aby dodać obrazy',
  'editor.dropReplace': 'Upuść, aby zastąpić obraz',
  'editor.selectMethod': 'Wybierz metodę',
  'editor.methodInfoTitle': 'Jak działają metody rozmycia',
  'editor.exportFailed': 'Eksport nie powiódł się: {error}',

  // Security levels (shared)
  'security.verySafe': 'Bardzo bezpieczne',
  'security.safe': 'Bezpieczne',
  'security.notSafe': 'Niebezpieczne',
  'security.level.max': 'MAKS',
  'security.level.high': 'WYSOKI',
  'security.level.low': 'NISKI',

  // Blur methods
  'method.mosaic.label': 'Metoda mozaiki',
  'method.mosaic.description': 'Pikselizuje obszar na duże bloki. Trudna do odwrócenia i odpowiednia dla najbardziej wrażliwych treści.',
  'method.solid.label': 'Metoda jednolitej czerni',
  'method.solid.description': 'Pokrywa obszar jednolitym czarnym prostokątem. Żadna informacja nie może zostać odzyskana.',
  'method.solidAvg.label': 'Metoda jednolitego średniego koloru',
  'method.solidAvg.description': 'Wypełnia obszar średnim kolorem regionu. Żadne szczegóły strukturalne nie są odzyskiwalne.',
  'method.gaussian.label': 'Metoda rozmycia Gaussa',
  'method.gaussian.description': 'Stosuje miękkie rozmycie. Może zostać odwrócone przez AI \u2014 używaj tylko dla treści niewrażliwych.',
  'method.gaussian.warning': 'Badania (2025) pokazują, że rozmycie Gaussa może zostać odwrócone przez AI. Używaj tylko dla treści niewrażliwych.',

  // Security info dialog
  'securityInfo.title': 'Jak działają metody rozmycia',
  'securityInfo.intro': 'Nie wszystkie metody rozmycia są równie bezpieczne. Niektóre mogą być odwrócone przez narzędzia AI \u2014 inne trwale niszczą informacje. Oto co robi każda metoda.',
  'securityInfo.gotIt': 'Rozumiem',
  'securityInfo.notRecommended': '\u26a0 Niezalecane dla treści wrażliwych.',
  'securityInfo.mosaic.label': 'Mozaika',
  'securityInfo.mosaic.simple': 'Rozbija zdjęcie na duże bloki, jak puzzle z bardzo małą liczbą elementów.',
  'securityInfo.mosaic.technical': 'Adaptacyjna pikselizacja blokowa redukuje każdy region twarzy do ~5\u00d75 efektywnych pikseli, niezależnie od rozdzielczości obrazu lub skali eksportu (rozmiar bloku skaluje się proporcjonalnie z regionem, minimum 12px). Każdy blok uśrednia wszystkie wartości pikseli, niszcząc szczegóły przestrzenne. Jednak regularna struktura siatki nie jest losowa, co oznacza, że zaawansowane modele ML mogą ją teoretycznie wykorzystać. Bez warstwy szumu jest to silne, ale nie maksymalne zabezpieczenie.',
  'securityInfo.solid.label': 'Jednolita czerń',
  'securityInfo.solid.simple': 'Pokrywa obszar całkowicie na czarno. Pod spodem nic nie pozostaje \u2014 to zniknęło na zawsze.',
  'securityInfo.solid.technical': '100% zniszczenia informacji. Każdy piksel ustawiony na R=0, G=0, B=0. Jest to dowodnie nieodwracalne: żaden algorytm nie może odzyskać danych, które już nie istnieją. Badanie Fantômas (PoPETs 2024) wykazało, że jednolite wypełnienie było jedną z nielicznych metod odpornych na wszystkie ataki deanonimizacji oparte na ML.',
  'securityInfo.solidAvg.label': 'Jednolity średni',
  'securityInfo.solidAvg.simple': 'Zastępuje obszar jednym płaskim kolorem. Pod spodem nic nie pozostaje \u2014 to zniknęło na zawsze.',
  'securityInfo.solidAvg.technical': 'Oblicza średnie wartości R, G, B ze wszystkich pikseli w regionie, a następnie wypełnia cały region tym jednym jednolitym kolorem. Przetrwa tylko jedna wartość koloru \u2014 wszystkie informacje przestrzenne, tekstury i kształty są zniszczone. Funkcjonalnie równoważne z jednolitym wypełnieniem pod względem nieodwracalności.',
  'securityInfo.gaussian.label': 'Rozmycie Gaussa',
  'securityInfo.gaussian.simple': 'Sprawia, że zdjęcie wygląda rozmazane, jakby patrzyło się przez zaparowane szkło. Ale narzędzia AI mogą odwrócić ten efekt.',
  'securityInfo.gaussian.technical': 'Artykuł Revelio (arXiv:2506.12344, czerwiec 2025) wykazał, że rozmycie Gaussa jest odwracalne nawet przy rozmiarze jądra 81. Modele dyfuzyjne mogą zrekonstruować tożsamość osoby z mocno rozmytych zdjęć, jeśli model atakującego widział inne zdjęcia tej osoby. Badanie Fantômas (PoPETs 2024) również wymieniło rozmycie Gaussa wśród 10 z 14 technik anonimizacji, które są przynajmniej częściowo odwracalne. Signal używa rozmycia Gaussa i jest uważany za potencjalnie podatny.',

  // Face list
  'faceList.detecting': 'Wykrywanie twarzy\u2026',
  'faceList.header': 'Obszary do anonimizacji:',
  'faceList.face': 'Twarz {n}',
  'faceList.region': 'Region {n}',
  'faceList.editRegion': 'Edytuj region',
  'faceList.removeRegion': 'Usuń region',
  'faceList.hintCta': 'Kliknij na zdjęcie',
  'faceList.hintText': 'aby zaznaczyć niestandardowy obszar',

  // Export dialog
  'export.title': 'Eksportuj zdjęcie',
  'export.originalSafe': '\ud83d\udee1\ufe0f Twój oryginał pozostaje bezpieczny',
  'export.newCopy': '\ud83d\udcc1 Nowa kopia zostaje zapisana z zastosowanym rozmyciem',
  'export.locationRemoved': '\ud83d\udccd Wszystkie dane lokalizacji usunięte automatycznie',
  'export.cancel': 'Anuluj',

  // Region edit modal
  'regionEdit.face': 'Twarz {n}',
  'regionEdit.region': 'Region {n}',
  'regionEdit.shapeFace': 'Twarz',
  'regionEdit.shapeRectangle': 'Prostokąt',
  'regionEdit.shapeOval': 'Owal',
  'regionEdit.delete': 'Usuń',
  'regionEdit.anonymize': 'Anonimizuj',
  'regionEdit.save': 'Zapisz',
  'regionEdit.close': 'Zamknij',

  // Grouping view
  'grouping.keyboardShortcuts': 'Skróty klawiszowe',
  'grouping.title': 'Przesłałeś wiele zdjęć',
  'grouping.desc.line1': 'Możesz je pogrupować dla lepszej kategoryzacji.',
  'grouping.desc.line2': 'Podczas eksportu nazwa grupy zostanie dodana na początku nazwy pliku.',
  'grouping.desc.line3': 'W ten sposób, jeśli jesteś fotografem/organizatorem wydarzenia, łatwiej będzie wysłać zdjęcia uczestnikom.',
  'grouping.position': '{current} z {total}',
  'grouping.splitHint.press': 'Naciśnij strzałkę',
  'grouping.splitHint.toSplit': 'aby podzielić na grupy',
  'grouping.undoHint.toUndo': 'aby cofnąć podział',
  'grouping.photo': 'Zdjęcie {n}',
  'grouping.continueAnonymize': 'Kontynuuj i anonimizuj zdjęcia',
  'grouping.continueWithout': 'Kontynuuj bez podziału',
  'grouping.nav': 'Nawiguj między zdjęciami',
  'grouping.split': 'Podziel na grupy',
  'grouping.undo': 'Cofnij podział',

  // Image strip
  'imageStrip.group': 'Grupa {n}',

  // Brush size
  'brushSize.label': 'Rozmiar',

  // Exporter
  'exporter.shareTitle': 'Rozmyte zdjęcie',

  // Update banner
  'update.available': 'Dostępna jest nowa wersja.',
  'update.reload': 'Odśwież',
  'update.dismiss': 'Później',
} as const
