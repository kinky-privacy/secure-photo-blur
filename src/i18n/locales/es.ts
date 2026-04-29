export const es = {
  // Landing
  'landing.hero': 'Secure Photo',
  'landing.heroAccent': 'Blur',
  'landing.dropzone.aria': 'Seleccionar o soltar una foto',
  'landing.dropzone.loading': 'Cargando imagen…',
  'landing.dropzone.label': 'Suelta o selecciona fotos',
  'landing.dropzone.button': 'Seleccionar foto',
  'landing.dropzone.formats': 'JPEG · PNG · WebP · HEIC',
  'landing.tagline.line1': 'Anonimización segura no reversible por IA.',
  'landing.tagline.line2': 'Sin recopilación de datos personales.',
  'landing.tagline.line3': 'Metadatos eliminados.',
  'landing.tagline.line4': 'Totalmente sin conexión.',
  'landing.nerdy.text': 'Detalles técnicos para nerds en el',
  'landing.nerdy.linkText': 'repositorio open-source',
  'landing.nerdy.dmPrefix': 'FetLife DMs a',
  'landing.nerdy.or': 'o a',

  // Navbar
  'navbar.brand': 'Secure Photo',
  'navbar.brandAccent': 'Blur',
  'navbar.tab.grouping': 'Agrupación',
  'navbar.tab.anonymize': 'Anonimizar',
  'navbar.feedback': '¿Preguntas? ¿Feedback?',
  'navbar.feedback.aria': 'Enviar preguntas o comentarios',
  'feedbackModal.title': 'Contactarnos',
  'feedbackModal.or': 'o escríbeme directamente',
  'feedbackModal.email': 'Email',
  'feedbackModal.fetlife': 'DM en FetLife',
  'feedbackModal.anonymous': 'Feedback anónimo',
  'feedbackModal.anonymousDesc': 'Tally form',
  'navbar.confirm.title': '¿Volver al inicio?',
  'navbar.confirm.body': 'El trabajo no guardado se perderá.',
  'navbar.confirm.cancel': 'Cancelar',
  'navbar.confirm.go': 'Volver',

  // Editor
  'editor.position': '{current} de {total}',
  'editor.reassurance.original': '🛡️ El original permanece seguro — el desenfoque se aplica a una nueva copia',
  'editor.reassurance.location': '📍 Datos de ubicación eliminados automáticamente',
  'editor.download': 'Descargar',
  'editor.exportNext': 'Exportar y Siguiente',
  'editor.exporting': 'Exportando…',
  'editor.downloadAnonymized': 'Descargar imagen anonimizada',
  'editor.dropAdd': 'Suelta para añadir imágenes',
  'editor.dropReplace': 'Suelta para reemplazar la imagen',
  'editor.selectMethod': 'Seleccionar método',
  'editor.methodInfoTitle': 'Cómo funcionan los métodos de desenfoque',
  'editor.exportFailed': 'Error en la exportación: {error}',

  // Security levels (shared)
  'security.verySafe': 'Muy seguro',
  'security.safe': 'Seguro',
  'security.notSafe': 'No seguro',
  'security.level.max': 'MÁX',
  'security.level.high': 'ALTO',
  'security.level.low': 'BAJO',

  // Blur methods
  'method.mosaic.label': 'Método mosaico',
  'method.mosaic.description': 'Pixela el área en bloques grandes. Difícil de revertir y adecuado para la mayoría del contenido sensible.',
  'method.solid.label': 'Método negro sólido',
  'method.solid.description': 'Cubre el área con un rectángulo negro sólido. No se puede recuperar ninguna información.',
  'method.solidAvg.label': 'Método color promedio sólido',
  'method.solidAvg.description': 'Rellena el área con el color promedio de la región. No se pueden recuperar detalles estructurales.',
  'method.gaussian.label': 'Método desenfoque gaussiano',
  'method.gaussian.description': 'Aplica un desenfoque suave. Puede ser revertido por IA — usar solo para contenido no sensible.',
  'method.gaussian.warning': 'La investigación (2025) muestra que el desenfoque gaussiano puede ser revertido por IA. Usar solo para contenido no sensible.',

  // Security info dialog
  'securityInfo.title': 'Cómo funcionan los métodos de desenfoque',
  'securityInfo.intro': 'No todos los métodos de desenfoque son igualmente seguros. Algunos pueden ser revertidos por herramientas de IA — otros destruyen la información permanentemente. Esto es lo que hace cada método.',
  'securityInfo.gotIt': 'Entendido',
  'securityInfo.notRecommended': '⚠ No recomendado para contenido sensible.',
  'securityInfo.mosaic.label': 'Mosaico',
  'securityInfo.mosaic.simple': 'Mezcla tu foto en bloques grandes, como un rompecabezas con muy pocas piezas.',
  'securityInfo.mosaic.technical': 'La pixelación adaptativa por bloques reduce cualquier región facial a ~5×5 píxeles efectivos, independientemente de la resolución de la imagen o la escala de exportación (el tamaño del bloque escala proporcionalmente con la región, mínimo 12px). Cada bloque promedia todos los valores de píxeles, destruyendo el detalle espacial. Sin embargo, la estructura de cuadrícula regular no es aleatoria, lo que significa que modelos ML sofisticados podrían teóricamente explotarla. Sin la capa de ruido, esto es fuerte pero no seguridad máxima.',
  'securityInfo.solid.label': 'Negro sólido',
  'securityInfo.solid.simple': 'Cubre el área completamente en negro. No queda nada debajo — se ha ido para siempre.',
  'securityInfo.solid.technical': 'Destrucción de información al 100%. Cada píxel se establece en R=0, G=0, B=0. Esto es demostrablemente irreversible: ningún algoritmo puede recuperar datos que ya no existen. El estudio Fantômas (PoPETs 2024) encontró que el relleno sólido fue uno de los únicos métodos que resistió todos los ataques de des-anonimización basados en ML.',
  'securityInfo.solidAvg.label': 'Color promedio sólido',
  'securityInfo.solidAvg.simple': 'Reemplaza el área con un solo color uniforme. No queda nada debajo — se ha ido para siempre.',
  'securityInfo.solidAvg.technical': 'Calcula los valores promedio R, G, B de todos los píxeles de la región, luego rellena toda la región con ese único color uniforme. Solo sobrevive un valor de color — toda la información espacial, textura y datos de forma se destruyen. Funcionalmente equivalente al relleno sólido en términos de irreversibilidad.',
  'securityInfo.gaussian.label': 'Desenfoque gaussiano',
  'securityInfo.gaussian.simple': 'Hace la foto borrosa, como mirar a través de un vidrio empañado. Pero las herramientas de IA pueden revertir este efecto.',
  'securityInfo.gaussian.technical': 'El artículo Revelio (arXiv:2506.12344, junio 2025) demostró que el desenfoque gaussiano es reversible incluso con tamaño de kernel 81. Los modelos de difusión pueden reconstruir la identidad de una persona a partir de fotos muy desenfocadas si el modelo del atacante ha visto otras imágenes de esa persona. El estudio Fantômas (PoPETs 2024) también incluyó el desenfoque gaussiano entre las 10 de 14 técnicas de anonimización al menos parcialmente reversibles. Signal usa desenfoque gaussiano y se considera potencialmente vulnerable.',

  // Face list
  'faceList.detecting': 'Detectando rostros…',
  'faceList.header': 'Áreas a anonimizar:',
  'faceList.face': 'Rostro {n}',
  'faceList.region': 'Región {n}',
  'faceList.editRegion': 'Editar región',
  'faceList.removeRegion': 'Eliminar región',
  'faceList.hintCta': 'Haz clic en la foto',
  'faceList.hintText': 'para un área personalizada',

  // Export dialog
  'export.title': 'Exportar foto',
  'export.originalSafe': '🛡️ Tu original permanece seguro',
  'export.newCopy': '📁 Se guarda una nueva copia con el desenfoque aplicado',
  'export.locationRemoved': '📍 Todos los datos de ubicación eliminados automáticamente',
  'export.cancel': 'Cancelar',

  // Region edit modal
  'regionEdit.face': 'Rostro {n}',
  'regionEdit.region': 'Región {n}',
  'regionEdit.shapeFace': 'Rostro',
  'regionEdit.shapeRectangle': 'Rectángulo',
  'regionEdit.shapeOval': 'Óvalo',
  'regionEdit.delete': 'Eliminar',
  'regionEdit.anonymize': 'Anonimizar',
  'regionEdit.save': 'Guardar',
  'regionEdit.close': 'Cerrar',

  // Grouping view
  'grouping.keyboardShortcuts': 'Atajos de teclado',
  'grouping.title': 'Has subido varias fotos',
  'grouping.desc.line1': 'Puedes agruparlas para una mejor organización.',
  'grouping.desc.line2': 'Al exportar, el nombre del grupo se añadirá al inicio del nombre del archivo.',
  'grouping.desc.line3': 'De esta forma, si eres el fotógrafo u organizador del evento, será más fácil enviar las fotos a los participantes.',
  'grouping.position': '{current} de {total}',
  'grouping.splitHint.press': 'Pulsa la flecha',
  'grouping.splitHint.toSplit': 'para separar en grupos',
  'grouping.undoHint.toUndo': 'para deshacer la separación',
  'grouping.photo': 'Foto {n}',
  'grouping.continueAnonymize': 'Continuar y anonimizar fotos',
  'grouping.continueWithout': 'Continuar sin separar',
  'grouping.nav': 'Navegar entre fotos',
  'grouping.split': 'Separar en grupos',
  'grouping.undo': 'Deshacer separación',

  // Image strip
  'imageStrip.group': 'Grupo {n}',

  // Brush size
  'brushSize.label': 'Tamaño',

  // Exporter
  'exporter.shareTitle': 'Foto desenfocada',

  // Update banner
  'update.available': 'Una nueva versión está disponible.',
  'update.reload': 'Recargar',
  'update.dismiss': 'Más tarde',
  // Language modal
  'languageModal.title': 'Idioma',
} as const
