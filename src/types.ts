export type BlurMethod = 'mosaic' | 'solid' | 'solid-avg' | 'gaussian'

export type RegionShape = 'face' | 'rectangle' | 'oval'

export type ActiveTool = 'rectangle' | 'auto'

export interface Point {
  x: number
  y: number
}

export interface Rect {
  x: number
  y: number
  width: number
  height: number
}

export interface BrushStrokeAction {
  type: 'brush-stroke'
  method: BlurMethod
  points: Point[]
  brushSize: number
}

export interface RectangleAction {
  type: 'rectangle'
  method: BlurMethod
  rect: Rect
  angle?: number
  shape?: RegionShape
}

export interface AutoFaceAction {
  type: 'auto-face'
  method: BlurMethod
  rect: Rect
  angle?: number  // rotation in radians, around rect center
  shape?: RegionShape
}

export type Action = BrushStrokeAction | RectangleAction | AutoFaceAction

export interface LoadedImage {
  bitmap: ImageBitmap
  /** Original full-resolution dimensions */
  originalWidth: number
  originalHeight: number
  /** Display dimensions (may be downscaled for iOS canvas limit) */
  displayWidth: number
  displayHeight: number
  /** Scale factor: display / original */
  scale: number
  fileName: string
  mimeType: string
}

export interface FaceDetectionResult {
  rect: Rect
  confidence: number
}

export type ExportFormat = 'jpeg' | 'png'

export interface FaceEntry {
  face: FaceDetectionResult
  visible: boolean
  angle: number
  shape: RegionShape
}

export interface RectEntry {
  rect: Rect
  method: BlurMethod
  angle: number
  visible: boolean
  shape: RegionShape
}

export interface ImageEditState {
  faces: FaceEntry[]
  rects: RectEntry[]
  exported: boolean
}

export interface QueueItem {
  file: File
  loaded: LoadedImage | null
  editState: ImageEditState | null
  error: string | null
}

export type SecurityLevel = 'max' | 'high' | 'low'

export interface SecurityInfo {
  method: BlurMethod
  level: SecurityLevel
  /** i18n key prefix for label/description/warning, e.g. 'method.mosaic' */
  i18nKey: string
  hasWarning: boolean
}

/** Indices at which a new row/group begins (sorted ascending).
 *  Example: [5, 11] means Row1=images[0..4], Row2=images[5..10], Row3=images[11..N-1] */
export type RowBreaks = number[]

export const BLUR_SECURITY: Record<BlurMethod, SecurityInfo> = {
  'mosaic': {
    method: 'mosaic',
    level: 'high',
    i18nKey: 'method.mosaic',
    hasWarning: false,
  },
  'solid': {
    method: 'solid',
    level: 'max',
    i18nKey: 'method.solid',
    hasWarning: false,
  },
  'solid-avg': {
    method: 'solid-avg',
    level: 'max',
    i18nKey: 'method.solidAvg',
    hasWarning: false,
  },
  'gaussian': {
    method: 'gaussian',
    level: 'low',
    i18nKey: 'method.gaussian',
    hasWarning: true,
  },
}
