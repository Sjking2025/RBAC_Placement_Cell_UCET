import { useState, useCallback, useRef, useEffect } from 'react';
import { Search, X, Loader2, ArrowRight } from 'lucide-react';
import { Input } from '../ui/Input';
import { cn } from '../../utils/helpers';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';

const GlobalSearch = ({ className }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState({});
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);
  const navigate = useNavigate();
  const debounceRef = useRef(null);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Keyboard shortcut to open
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const search = useCallback(async (searchQuery) => {
    if (!searchQuery.trim()) {
      setResults({});
      return;
    }

    setLoading(true);
    try {
      const response = await api.get(`/search?q=${encodeURIComponent(searchQuery)}`);
      setResults(response.data.data || {});
      setSelectedIndex(0);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);

    // Debounce search
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      search(value);
    }, 300);
  };

  const handleResultClick = (type, item) => {
    setIsOpen(false);
    setQuery('');
    setResults({});

    switch (type) {
      case 'jobs':
        navigate(`/jobs/${item.id}`);
        break;
      case 'companies':
        navigate(`/companies/${item.id}`);
        break;
      case 'students':
        navigate(`/students/${item.id}`);
        break;
      case 'announcements':
        navigate(`/announcements`);
        break;
      default:
        break;
    }
  };

  const allResults = [
    ...(results.jobs || []).map(r => ({ ...r, type: 'jobs' })),
    ...(results.companies || []).map(r => ({ ...r, type: 'companies' })),
    ...(results.students || []).map(r => ({ ...r, type: 'students' })),
    ...(results.announcements || []).map(r => ({ ...r, type: 'announcements' }))
  ];

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => Math.min(prev + 1, allResults.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter' && allResults[selectedIndex]) {
      const selected = allResults[selectedIndex];
      handleResultClick(selected.type, selected);
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'jobs': return '💼';
      case 'companies': return '🏢';
      case 'students': return '🎓';
      case 'announcements': return '📢';
      default: return '📄';
    }
  };

  return (
    <>
      {/* Search Trigger */}
      <button
        onClick={() => setIsOpen(true)}
        className={cn(
          'flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground rounded-md border bg-background hover:bg-muted transition-colors',
          className
        )}
      >
        <Search className="h-4 w-4" />
        <span className="hidden sm:inline">Search...</span>
        <kbd className="hidden md:inline-flex items-center gap-1 px-1.5 py-0.5 text-xs font-mono bg-muted rounded">
          ⌘K
        </kbd>
      </button>

      {/* Search Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />

          {/* Search Dialog */}
          <div className="relative w-full max-w-lg mx-4 bg-background border rounded-lg shadow-lg overflow-hidden">
            {/* Input */}
            <div className="flex items-center border-b px-4">
              <Search className="h-5 w-5 text-muted-foreground" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder="Search jobs, companies, students..."
                className="flex-1 py-4 px-3 bg-transparent outline-none text-sm"
              />
              {loading && <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />}
              {query && !loading && (
                <button onClick={() => { setQuery(''); setResults({}); }}>
                  <X className="h-5 w-5 text-muted-foreground" />
                </button>
              )}
            </div>

            {/* Results */}
            {allResults.length > 0 && (
              <div className="max-h-80 overflow-y-auto p-2">
                {Object.entries(results).map(([type, items]) => {
                  if (!items || items.length === 0) return null;
                  return (
                    <div key={type} className="mb-2">
                      <p className="text-xs font-medium text-muted-foreground px-2 py-1 uppercase">
                        {type}
                      </p>
                      {items.map((item, idx) => {
                        const globalIdx = allResults.findIndex(r => r.id === item.id && r.type === type);
                        return (
                          <button
                            key={item.id}
                            onClick={() => handleResultClick(type, item)}
                            className={cn(
                              'w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm text-left transition-colors',
                              globalIdx === selectedIndex
                                ? 'bg-primary/10 text-primary'
                                : 'hover:bg-muted'
                            )}
                          >
                            <span>{getIcon(type)}</span>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium truncate">
                                {item.title || item.name || `${item.first_name} ${item.last_name}`}
                              </p>
                              {item.subtitle && (
                                <p className="text-xs text-muted-foreground truncate">
                                  {item.subtitle}
                                </p>
                              )}
                            </div>
                            <ArrowRight className="h-4 w-4 text-muted-foreground" />
                          </button>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Empty State */}
            {query && !loading && allResults.length === 0 && (
              <div className="p-8 text-center text-muted-foreground">
                <p>No results found for "{query}"</p>
              </div>
            )}

            {/* Footer */}
            <div className="border-t px-4 py-2 flex items-center justify-between text-xs text-muted-foreground">
              <div className="flex items-center gap-4">
                <span><kbd className="px-1 py-0.5 bg-muted rounded">↑↓</kbd> Navigate</span>
                <span><kbd className="px-1 py-0.5 bg-muted rounded">↵</kbd> Select</span>
              </div>
              <span><kbd className="px-1 py-0.5 bg-muted rounded">Esc</kbd> Close</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default GlobalSearch;
