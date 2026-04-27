import type { RowBreaks } from '../types'

/** Given an image index and the row-breaks array, return the 1-indexed group number. */
export function getGroupNumber(imageIndex: number, breaks: RowBreaks): number {
  let group = 1
  for (const brk of breaks) {
    if (imageIndex >= brk) group++
    else break
  }
  return group
}

/** Split image indices [0..total-1] into rows based on breaks.
 *  Returns array of arrays, each sub-array holding the image indices in that row. */
export function getRows(total: number, breaks: RowBreaks): number[][] {
  const sortedBreaks = [...breaks].sort((a, b) => a - b)
  const rows: number[][] = []
  let start = 0
  for (const brk of sortedBreaks) {
    if (brk > start && brk < total) {
      rows.push(Array.from({ length: brk - start }, (_, i) => start + i))
      start = brk
    }
  }
  rows.push(Array.from({ length: total - start }, (_, i) => start + i))
  return rows
}
