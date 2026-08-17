import './RecentSearches.css'

export interface RecentSearchesProps {
  history: string[]
  onSelect: (term: string) => void
}

export function RecentSearches({ history, onSelect }: RecentSearchesProps) {
  return (
    <section className="recent-searches" aria-labelledby="recent-searches-heading">
      <h2 id="recent-searches-heading">Recent Searches</h2>
      {history.length === 0 ? (
        <p className="recent-searches__empty">Your recent searches will show up here.</p>
      ) : (
        <ul role="list">
          {history.map((term) => (
            <li key={term} role="listitem">
              <button type="button" onClick={() => onSelect(term)}>
                {term}
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
