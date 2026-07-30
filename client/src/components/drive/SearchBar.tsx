import { useState, useEffect, useRef } from 'react';
import { Search, Loader2, FileText, Sparkles } from 'lucide-react';
import { useDebounce } from 'use-debounce';
import { aiApi, SearchResult } from '@/services/ai.service';
import { useUIStore } from '@/store/uiStore';

export function SearchBar() {
  const [query, setQuery] = useState('');
  const [debouncedQuery] = useDebounce(query, 500);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const { setPreviewFile } = useUIStore();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setResults([]);
      setIsSearching(false);
      return;
    }

    let isMounted = true;
    const performSearch = async () => {
      setIsSearching(true);
      try {
        const { data } = await aiApi.semanticSearch(debouncedQuery);
        if (isMounted) {
          setResults(data.data.results || []);
          setIsOpen(true);
        }
      } catch (error) {
        console.error("Semantic search failed:", error);
      } finally {
        if (isMounted) setIsSearching(false);
      }
    };

    performSearch();
    return () => { isMounted = false; };
  }, [debouncedQuery]);

  const handleResultClick = (fileId: string) => {
    setPreviewFile(fileId);
    setIsOpen(false);
  };

  return (
    <div ref={wrapperRef} className="relative flex-1 max-w-2xl mr-6">
      <div className="relative group">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
          <Search className="h-5 w-5 text-black transition-colors" />
        </div>
        <input
          type="text"
          className="block w-full pl-12 pr-10 py-3 border-2 border-black rounded-none leading-5 bg-neo-bg text-black placeholder-gray-500 focus:outline-none focus:shadow-neo focus:-translate-y-[2px] focus:-translate-x-[2px] transition-all font-bold sm:text-sm"
          placeholder="Semantic search (e.g. 'documents about AI integration')..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            if (e.target.value) setIsOpen(true);
          }}
          onFocus={() => {
            if (query) setIsOpen(true);
          }}
        />
        <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none z-10">
          {isSearching ? (
            <Loader2 className="h-5 w-5 text-brand-500 animate-spin" />
          ) : (
            <Sparkles className="h-5 w-5 text-black" />
          )}
        </div>
      </div>

      {isOpen && (query || results.length > 0) && (
        <div className="absolute z-50 mt-2 w-full bg-white border-4 border-black shadow-neo overflow-hidden">
          {results.length > 0 ? (
            <ul className="max-h-96 overflow-y-auto py-2">
              {results.map((result) => (
                <li
                  key={result.file_id}
                  className="px-4 py-3 hover:bg-neo-yellow cursor-pointer border-b-2 border-black last:border-0 transition-colors"
                  onClick={() => handleResultClick(result.file_id)}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center text-sm font-bold text-black">
                      <FileText className="w-4 h-4 mr-2 text-black" />
                      {result.file_name}
                    </div>
                    <span className="inline-flex items-center px-2 py-0.5 border-2 border-black text-xs font-bold bg-brand-500 text-black">
                      {Math.round(result.score * 100)}% match
                    </span>
                  </div>
                  <p className="text-xs text-black line-clamp-2 pl-6 font-medium">
                    "...{result.snippet}..."
                  </p>
                </li>
              ))}
            </ul>
          ) : !isSearching && query ? (
            <div className="p-4 text-center text-sm text-black font-bold border-2 border-transparent">
              No semantic matches found.
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
