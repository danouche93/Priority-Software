import { useCallback, useRef, useState } from 'react'
import { createLocalStorageStore } from '../core/storage'
import { loadViewMode, saveViewMode, type ViewMode } from '../core/viewPreference'

export interface UseViewPreferenceResult {
  viewMode: ViewMode
  setViewMode: (mode: ViewMode) => void
}

export function useViewPreference(): UseViewPreferenceResult {
  const storeRef = useRef(createLocalStorageStore())
  const [viewMode, setViewModeState] = useState<ViewMode>(() => loadViewMode(storeRef.current))

  const setViewMode = useCallback((mode: ViewMode) => {
    setViewModeState(mode)
    saveViewMode(storeRef.current, mode)
  }, [])

  return { viewMode, setViewMode }
}
