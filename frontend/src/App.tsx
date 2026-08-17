import { LayoutGroup, MotionConfig } from 'framer-motion'
import { useCallback, useState } from 'react'
import './App.css'
import type { TrackResult } from './api/types'
import { ImageContainer } from './components/ImageContainer/ImageContainer'
import { PaginationControls } from './components/PaginationControls/PaginationControls'
import { RecentSearches } from './components/RecentSearches/RecentSearches'
import { ResultsList } from './components/ResultsList/ResultsList'
import { SearchBox } from './components/SearchBox/SearchBox'
import { EmptyState } from './components/StatusStates/EmptyState'
import { ErrorState } from './components/StatusStates/ErrorState'
import { LoadingIndicator } from './components/StatusStates/LoadingIndicator'
import { useRecentSearches } from './hooks/useRecentSearches'
import { useSearch } from './hooks/useSearch'
import { useViewPreference } from './hooks/useViewPreference'

function statusAnnouncement(
  status: string,
  query: string,
  resultCount: number,
  errorMessage: string | null,
): string {
  switch (status) {
    case 'loading':
      return 'Searching…'
    case 'empty':
      return `No results found for ${query}.`
    case 'error':
      return errorMessage ?? 'Something went wrong.'
    case 'success':
      return `${resultCount} result${resultCount === 1 ? '' : 's'} for ${query}.`
    default:
      return ''
  }
}

function App() {
  const [inputValue, setInputValue] = useState('')
  const search = useSearch()
  const recentSearches = useRecentSearches()
  const { viewMode, setViewMode } = useViewPreference()

  const [selectedTrack, setSelectedTrack] = useState<TrackResult | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)

  const handleLiveQuery = useCallback(
    (value: string) => {
      setInputValue(value)
      search.liveQuery(value)
    },
    [search],
  )

  const handleSubmit = useCallback(
    (value: string) => {
      const trimmed = value.trim()
      if (trimmed.length === 0) return
      recentSearches.addTerm(trimmed)
      search.submit(trimmed)
    },
    [recentSearches, search],
  )

  const handleSelectRecent = useCallback(
    (term: string) => {
      setInputValue(term)
      handleSubmit(term)
    },
    [handleSubmit],
  )

  const handleSelectResult = useCallback((track: TrackResult) => {
    setSelectedTrack(track)
    setIsPlaying(false)
  }, [])

  const handlePlay = useCallback(() => {
    setIsPlaying(true)
  }, [])

  const { status, items, query, errorMessage, nextCursor, previousCursor } = search.state

  return (
    <MotionConfig reducedMotion="user">
      <div className="app">
        <header className="app__header">
          <h1>Sound Search</h1>
          <p>Search Mixcloud, pick a track, and play it right here.</p>
        </header>

        <LayoutGroup>
          <main className="app__layout">
            <section className="app__panel app__search-panel" aria-labelledby="search-heading">
              <h2 id="search-heading" className="visually-hidden">
                Search
              </h2>
              <SearchBox value={inputValue} onChange={handleLiveQuery} onSubmit={handleSubmit} />

              <div aria-live="polite" className="visually-hidden">
                {statusAnnouncement(status, query, items.length, errorMessage)}
              </div>

              <div className="app__results-region">
                {status === 'error' && errorMessage && (
                  <ErrorState message={errorMessage} onRetry={search.retry} />
                )}
                {status === 'loading' && items.length === 0 && <LoadingIndicator />}
                {status === 'empty' && <EmptyState query={query} />}
                {(status === 'success' || (status === 'loading' && items.length > 0)) && (
                  <ResultsList
                    items={items}
                    viewMode={viewMode}
                    selectedId={selectedTrack?.id ?? null}
                    onSelect={handleSelectResult}
                  />
                )}
              </div>

              <PaginationControls
                hasNext={nextCursor !== null}
                hasPrevious={previousCursor !== null}
                onNext={search.next}
                onPrevious={search.previous}
                viewMode={viewMode}
                onSetViewMode={setViewMode}
              />
            </section>

            <div className="app__panel">
              <ImageContainer track={selectedTrack} isPlaying={isPlaying} onPlay={handlePlay} />
            </div>

            <div className="app__panel">
              <RecentSearches history={recentSearches.history} onSelect={handleSelectRecent} />
            </div>
          </main>
        </LayoutGroup>
      </div>
    </MotionConfig>
  )
}

export default App
