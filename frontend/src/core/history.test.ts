import { describe, expect, it } from 'vitest'
import { addSearchTerm, MAX_RECENT_SEARCHES } from './history'

describe('addSearchTerm', () => {
  it('adds a new term to the front of an empty history', () => {
    expect(addSearchTerm([], 'adele')).toEqual(['adele'])
  })

  it('adds new terms to the front, keeping older ones after', () => {
    const result = addSearchTerm(['a'], 'b')
    expect(result).toEqual(['b', 'a'])
  })

  it('moves a re-searched term to the top instead of duplicating it', () => {
    const result = addSearchTerm(['adele', 'daft punk', 'coldplay'], 'daft punk')
    expect(result).toEqual(['daft punk', 'adele', 'coldplay'])
  })

  it('deduplicates case-insensitively, keeping the newest casing', () => {
    const result = addSearchTerm(['Adele'], 'ADELE')
    expect(result).toEqual(['ADELE'])
  })

  it('deduplicates surrounding whitespace differences', () => {
    const result = addSearchTerm(['adele'], '  adele  ')
    expect(result).toEqual(['adele'])
  })

  it(`caps the history at ${MAX_RECENT_SEARCHES} entries`, () => {
    const history = ['1', '2', '3', '4', '5']
    const result = addSearchTerm(history, '6')
    expect(result).toEqual(['6', '1', '2', '3', '4'])
    expect(result).toHaveLength(MAX_RECENT_SEARCHES)
  })

  it('ignores blank/whitespace-only search terms', () => {
    expect(addSearchTerm(['adele'], '   ')).toEqual(['adele'])
  })

  it('does not mutate the input array', () => {
    const original = ['adele']
    const result = addSearchTerm(original, 'daft punk')
    expect(original).toEqual(['adele'])
    expect(result).not.toBe(original)
  })
})
