import { useId, type ChangeEvent, type FormEvent } from 'react'
import './SearchBox.css'

export interface SearchBoxProps {
  value: string
  onChange: (value: string) => void
  onSubmit: (value: string) => void
}

export function SearchBox({ value, onChange, onSubmit }: SearchBoxProps) {
  const inputId = useId()

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    onChange(event.target.value)
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    onSubmit(value)
  }

  return (
    <form role="search" className="search-box" onSubmit={handleSubmit}>
      <label htmlFor={inputId} className="visually-hidden">
        Search for tracks, shows, or artists
      </label>
      <input
        id={inputId}
        type="search"
        className="search-box__input"
        value={value}
        onChange={handleChange}
        placeholder="Search for tracks, shows, or artists…"
        autoComplete="off"
        spellCheck={false}
      />
      <button type="submit" className="search-box__submit">
        Go
      </button>
    </form>
  )
}
