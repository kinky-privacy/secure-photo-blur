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

export interface SecurityInfo {
  method: BlurMethod
  label: string
  level: 'max' | 'high' | 'low'
  description: string
  warning?: string
}

export const BLUR_SECURITY: Record<BlurMethod, SecurityInfo> = {
  'mosaic': {
    method: 'mosaic',
    label: 'Mosaic method',
    level: 'high',
    description: 'Pixelates the area into large blocks. Hard to reverse and suitable for most sensitive content.',
  },
  'solid': {
    method: 'solid',
    label: 'Solid black method',
    level: 'max',
    description: 'Covers the area with a solid black rectangle. No information can be recovered.',
  },
  'solid-avg': {
    method: 'solid-avg',
    label: 'Solid average color method',
    level: 'max',
    description: 'Fills the area with the average color of the region. No structural detail is recoverable.',
  },
  'gaussian': {
    method: 'gaussian',
    label: 'Gaussian blur method',
    level: 'low',
    description: 'Applies a soft blur. Can be reversed by AI — use only for non-sensitive content.',
    warning: 'Research (2025) shows Gaussian blur can be reversed by AI. Use for non-sensitive content only.',
  },
}
