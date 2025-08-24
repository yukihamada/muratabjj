'use client'

import { useState, useEffect, useRef } from 'react'
import { Search, X, Loader } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useDebounce } from '@/hooks/useDebounce'

interface SearchResult {
  videos: any[]
  techniques: any[]
  flows: any[]
  total: number
}

export default function SearchBar() {
  const [query, setQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<SearchResult | null>(null)
  const [suggestions, setSuggestions] = useState<string[]>([])
  const debouncedQuery = useDebounce(query, 300)
  const searchRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  // Click outside handler
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Search when query changes
  useEffect(() => {
    if (debouncedQuery.length >= 2) {
      performSearch()
    } else if (debouncedQuery.length === 0) {
      setResults(null)
      setSuggestions([])
    }
  }, [debouncedQuery])

  const performSearch = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(debouncedQuery)}&limit=5`)
      if (response.ok) {
        const data = await response.json()
        setResults(data.results)
      }

      // Get suggestions
      const suggestResponse = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: debouncedQuery })
      })
      if (suggestResponse.ok) {
        const suggestData = await suggestResponse.json()
        setSuggestions(suggestData.suggestions)
      }
    } catch (error) {
      // Silent error handling
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`)
      setIsOpen(false)
    }
  }

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion)
    router.push(`/search?q=${encodeURIComponent(suggestion)}`)
    setIsOpen(false)
  }

  return (
    <div ref={searchRef} className="relative">
      <form onSubmit={handleSubmit} className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setIsOpen(true)
          }}
          onFocus={() => setIsOpen(true)}
          placeholder="動画、技術、フローを検索..."
          className="w-full pl-10 pr-10 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-bjj-accent"
        />
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery('')
              setResults(null)
              setSuggestions([])
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </form>

      {/* Search dropdown */}
      {isOpen && (query.length >= 2 || suggestions.length > 0) && (
        <div className="absolute top-full mt-2 w-full bg-bjj-bg2 border border-white/10 rounded-lg shadow-xl max-h-96 overflow-y-auto z-50">
          {loading && (
            <div className="p-4 text-center">
              <Loader className="w-5 h-5 animate-spin mx-auto text-bjj-accent" />
            </div>
          )}

          {!loading && results && (
            <div>
              {/* Videos */}
              {results.videos.length > 0 && (
                <div className="p-3 border-b border-white/10">
                  <h3 className="text-xs font-semibold text-gray-400 mb-2">動画</h3>
                  {results.videos.map((video) => (
                    <button
                      key={video.id}
                      onClick={() => {
                        router.push(`/videos/${video.id}`)
                        setIsOpen(false)
                      }}
                      className="w-full text-left p-2 hover:bg-white/5 rounded-md transition-colors"
                    >
                      <div className="font-medium text-white">{video.title}</div>
                      <div className="text-xs text-gray-400">{video.instructor_name}</div>
                    </button>
                  ))}
                </div>
              )}

              {/* Techniques */}
              {results.techniques.length > 0 && (
                <div className="p-3 border-b border-white/10">
                  <h3 className="text-xs font-semibold text-gray-400 mb-2">技術</h3>
                  {results.techniques.map((technique) => (
                    <button
                      key={technique.id}
                      onClick={() => {
                        router.push(`/techniques/${technique.id}`)
                        setIsOpen(false)
                      }}
                      className="w-full text-left p-2 hover:bg-white/5 rounded-md transition-colors"
                    >
                      <div className="font-medium text-white">{technique.name_ja}</div>
                      <div className="text-xs text-gray-400">{technique.category}</div>
                    </button>
                  ))}
                </div>
              )}

              {/* No results */}
              {results.total === 0 && (
                <div className="p-4 text-center text-gray-400">
                  検索結果が見つかりませんでした
                </div>
              )}
            </div>
          )}

          {/* Suggestions */}
          {suggestions.length > 0 && (
            <div className="p-3">
              <h3 className="text-xs font-semibold text-gray-400 mb-2">検索候補</h3>
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="w-full text-left p-2 hover:bg-white/5 rounded-md transition-colors text-white"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}