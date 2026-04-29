import { useCallback, useEffect, useRef, useState } from 'preact/hooks'
import { Landing } from './components/landing'
import { Editor } from './components/editor'
import { GroupingView } from './components/grouping-view'
import { Navbar } from './components/navbar'
import { FloatingLandingButtons } from './components/floating-landing-buttons'
import { loadImage } from './engine/image-loader'
import { cleanupImageBitmap } from './engine/memory-cleanup'
import { getGroupNumber, getRows } from './utils/groups'
import type { ImageEditState, LoadedImage, QueueItem } from './types'

type WorkflowPhase = 'grouping' | 'editing'

const LS_GROUPS_KEY = 'photoblur-row-groups'
const LS_EXPORTED_KEY = 'photoblur-exported'

function persistExported(fileName: string) {
  try {
    const raw = localStorage.getItem(LS_EXPORTED_KEY)
    const list: string[] = raw ? JSON.parse(raw) : []
    if (!list.includes(fileName)) {
      list.push(fileName)
      localStorage.setItem(LS_EXPORTED_KEY, JSON.stringify(list))
    }
  } catch {}
}

function loadExportedNames(): Set<string> {
  try {
    const raw = localStorage.getItem(LS_EXPORTED_KEY)
    if (!raw) return new Set()
    return new Set(JSON.parse(raw) as string[])
  } catch {
    return new Set()
  }
}

function persistRowBreaks(queue: QueueItem[], breaks: number[]) {
  const rows = getRows(queue.length, breaks)
  const map: Record<string, number> = {}
  rows.forEach((row, rowIdx) => {
    row.forEach(imgIdx => {
      map[queue[imgIdx].file.name] = rowIdx + 1
    })
  })
  localStorage.setItem(LS_GROUPS_KEY, JSON.stringify(map))
}

function loadRowBreaksFromStorage(items: QueueItem[]): number[] {
  try {
    const raw = localStorage.getItem(LS_GROUPS_KEY)
    if (!raw) return []
    const map: Record<string, number> = JSON.parse(raw)
    const breaks: number[] = []
    let prevGroup = 1
    for (let i = 0; i < items.length; i++) {
      const group = map[items[i].file.name] ?? prevGroup
      if (group > prevGroup) {
        breaks.push(i)
      }
      prevGroup = group
    }
    return breaks
  } catch {
    return []
  }
}

export function App() {
  const [queue, setQueue] = useState<QueueItem[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [rowBreaks, setRowBreaks] = useState<number[]>([])
  const [phase, setPhase] = useState<WorkflowPhase>('grouping')

  // Keep a ref to queue for use inside async functions
  const queueRef = useRef(queue)
  queueRef.current = queue

  // Refs for keyboard handler closure
  const currentIndexRef = useRef(currentIndex)
  currentIndexRef.current = currentIndex
  const rowBreaksRef = useRef(rowBreaks)
  rowBreaksRef.current = rowBreaks
  const phaseRef = useRef(phase)
  phaseRef.current = phase

  async function loadItem(items: QueueItem[], index: number): Promise<QueueItem[]> {
    const item = items[index]
    if (!item || item.loaded) return items
    setLoading(true)
    setError(null)
    try {
      const img = await loadImage(item.file)
      const updated = [...items]
      updated[index] = { ...updated[index], loaded: img, error: null }
      return updated
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Failed to load image'
      setError(msg)
      const updated = [...items]
      updated[index] = { ...updated[index], error: msg }
      return updated
    } finally {
      setLoading(false)
    }
  }

  function cleanupDistantBitmaps(items: QueueItem[], activeIndex: number) {
    for (let i = 0; i < items.length; i++) {
      if (Math.abs(i - activeIndex) > 1 && items[i].loaded) {
        cleanupImageBitmap(items[i].loaded!.bitmap)
        items[i] = { ...items[i], loaded: null }
      }
    }
    return items
  }

  async function handleFilesSelected(files: File[]) {
    const items: QueueItem[] = files.map(file => ({
      file,
      loaded: null,
      editState: null,
      error: null,
    }))

    // Restore exported state from localStorage
    const exportedNames = loadExportedNames()
    let hasResumeData = false
    for (const item of items) {
      if (exportedNames.has(item.file.name)) {
        item.editState = { faces: [], rects: [], exported: true }
        hasResumeData = true
      }
    }

    // Find first unexported index to resume from
    const firstUnexported = items.findIndex(item => !item.editState?.exported)
    const startIndex = firstUnexported >= 0 ? firstUnexported : 0

    const loaded = await loadItem(items, startIndex)
    const cleaned = cleanupDistantBitmaps(loaded, startIndex)
    setQueue(cleaned)
    setCurrentIndex(startIndex)
    const restoredBreaks = loadRowBreaksFromStorage(items)
    setRowBreaks(restoredBreaks)

    // If resuming with exported photos, skip grouping and go straight to editing
    if (hasResumeData && files.length > 1) {
      setPhase('editing')
    } else {
      setPhase(files.length > 1 ? 'grouping' : 'editing')
    }
  }

  async function handleNavigate(direction: 'prev' | 'next') {
    const nextIndex = direction === 'next' ? currentIndex + 1 : currentIndex - 1
    if (nextIndex < 0 || nextIndex >= queue.length) return

    let items = [...queue]

    // Load target if needed
    if (!items[nextIndex].loaded) {
      items = await loadItem(items, nextIndex)
      if (items[nextIndex].error) {
        setQueue(items)
        return
      }
    }

    const cleaned = cleanupDistantBitmaps(items, nextIndex)
    setQueue(cleaned)
    setCurrentIndex(nextIndex)
  }

  async function handleNavigateTo(targetIndex: number) {
    if (targetIndex < 0 || targetIndex >= queue.length || targetIndex === currentIndex) return

    let items = [...queue]
    if (!items[targetIndex].loaded) {
      items = await loadItem(items, targetIndex)
      if (items[targetIndex].error) {
        setQueue(items)
        return
      }
    }

    const cleaned = cleanupDistantBitmaps(items, targetIndex)
    setQueue(cleaned)
    setCurrentIndex(targetIndex)
  }

  function handleAddRowBreak() {
    const idx = currentIndexRef.current
    if (idx === 0) return
    setRowBreaks(prev => {
      if (prev.includes(idx)) return prev
      const next = [...prev, idx].sort((a, b) => a - b)
      persistRowBreaks(queueRef.current, next)
      return next
    })
  }

  function handleRemoveLastRowBreak() {
    setRowBreaks(prev => {
      if (prev.length === 0) return prev
      const next = prev.slice(0, -1)
      persistRowBreaks(queueRef.current, next)
      return next
    })
  }

  // Keyboard navigation
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement)?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return
      if (queueRef.current.length <= 1) return

      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault()
          handleNavigate('prev')
          break
        case 'ArrowRight':
          e.preventDefault()
          handleNavigate('next')
          break
        case 'ArrowDown':
          if (phaseRef.current === 'grouping') {
            e.preventDefault()
            handleAddRowBreak()
          }
          break
        case 'ArrowUp':
          if (phaseRef.current === 'grouping') {
            e.preventDefault()
            handleRemoveLastRowBreak()
          }
          break
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [queue.length, currentIndex])

  // Ensure Tally wires up feedback buttons after Preact renders them
  // Re-run when switching between landing (floating btn) and editor (navbar btn)
  const currentItem = queue[currentIndex] ?? null
  const currentImage = currentItem?.loaded ?? null
  useEffect(() => {
    if ((window as any).Tally) {
      (window as any).Tally.loadEmbeds()
    }
  }, [!!currentImage])

  const handleSaveEditState = useCallback((state: ImageEditState) => {
    setQueue(prev => {
      const updated = [...prev]
      const idx = currentIndex
      if (updated[idx]) {
        updated[idx] = { ...updated[idx], editState: state }
      }
      return updated
    })
  }, [currentIndex])

  async function handleExportDone() {
    // Persist exported file name to localStorage
    const currentFile = queue[currentIndex]
    if (currentFile) {
      persistExported(currentFile.file.name)
    }

    // Mark current as exported
    setQueue(prev => {
      const updated = [...prev]
      if (updated[currentIndex]?.editState) {
        updated[currentIndex] = {
          ...updated[currentIndex],
          editState: { ...updated[currentIndex].editState!, exported: true },
        }
      }
      return updated
    })

    // Advance to next if available
    const nextIndex = currentIndex + 1
    if (nextIndex < queue.length) {
      await handleNavigate('next')
    }
  }

  async function handleSkipNext() {
    const nextIndex = currentIndex + 1
    if (nextIndex < queue.length) {
      await handleNavigate('next')
    }
  }

  function handleReset() {
    // Cleanup all bitmaps
    for (const item of queue) {
      if (item.loaded) cleanupImageBitmap(item.loaded.bitmap)
    }
    setQueue([])
    setCurrentIndex(0)
    setError(null)
    setRowBreaks([])
    setPhase('grouping')
  }

  async function handleNewImage(img: LoadedImage) {
    // In multi-mode: append to queue and navigate to it
    if (queue.length > 1) {
      const newItem: QueueItem = {
        file: new File([], img.fileName),
        loaded: img,
        editState: null,
        error: null,
      }
      const newIndex = queue.length
      const items = cleanupDistantBitmaps([...queue, newItem], newIndex)
      setQueue(items)
      setCurrentIndex(newIndex)
    } else {
      // Single-mode: replace current
      const newItem: QueueItem = {
        file: new File([], img.fileName),
        loaded: img,
        editState: null,
        error: null,
      }
      setQueue([newItem])
      setCurrentIndex(0)
    }
  }

  async function handleAddFilesFromEditor(files: File[]) {
    const newItems: QueueItem[] = files.map(file => ({
      file,
      loaded: null,
      editState: null,
      error: null,
    }))
    const newQueue = [...queue, ...newItems]
    setQueue(newQueue)
  }

  const isMulti = queue.length > 1

  return (
    <>
      <Navbar
        phase={currentImage ? phase : null}
        isMulti={isMulti}
        onPhaseChange={setPhase}
        onReset={handleReset}
      />

      {currentImage ? (
        isMulti && phase === 'grouping' ? (
          <GroupingView
            image={currentImage}
            queuePosition={{ current: currentIndex + 1, total: queue.length }}
            groupNumber={getGroupNumber(currentIndex, rowBreaks)}
            queue={queue}
            currentIndex={currentIndex}
            rowBreaks={rowBreaks}
            onNavigateTo={handleNavigateTo}
            onAdvance={() => setPhase('editing')}
          />
        ) : (
          <Editor
            key={currentIndex}
            image={currentImage}
            onReset={handleReset}
            onNewImage={handleNewImage}
            initialEditState={currentItem?.editState}
            onEditStateChange={handleSaveEditState}
            queuePosition={isMulti ? { current: currentIndex + 1, total: queue.length } : null}
            onNavigate={handleNavigate}
            onExportDone={handleExportDone}
            onSkipNext={handleSkipNext}
            groupNumber={isMulti ? getGroupNumber(currentIndex, rowBreaks) : undefined}
          />
        )
      ) : (
        <>
          <FloatingLandingButtons />
          <Landing
            onFilesSelected={handleFilesSelected}
            loading={loading}
            error={error}
          />
        </>
      )}
    </>
  )
}
