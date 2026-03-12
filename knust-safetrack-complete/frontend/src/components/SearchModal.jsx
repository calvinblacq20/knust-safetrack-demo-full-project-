import { useMemo, useState, useRef } from 'react';
import { Search, X, MapPin, Clock } from 'lucide-react';
import useEscapeKey from '../hooks/useEscapeKey';
import useFocusTrap from '../hooks/useFocusTrap';

// Mock search data - campus locations
const searchableLocations = [
    { id: 1, name: 'JQB (Junior Quarters B)', type: 'Bus Stop', area: 'Commercial' },
    { id: 2, name: 'Unity Hall (Conti)', type: 'Hostel', area: 'Residential' },
    { id: 3, name: 'Hall 7', type: 'Hostel', area: 'Residential' },
    { id: 4, name: 'Main Library', type: 'Landmark', area: 'Academic' },
    { id: 5, name: 'Tech Junction', type: 'Bus Stop', area: 'Engineering' },
    { id: 6, name: 'Brunei Hostel', type: 'Hostel', area: 'Residential' },
    { id: 7, name: 'Gaza', type: 'Hostel', area: 'Residential' },
    { id: 8, name: 'Republic Hall', type: 'Hostel', area: 'Residential' },
    { id: 9, name: 'Independence Hall', type: 'Hostel', area: 'Residential' },
    { id: 10, name: 'Queens Hall', type: 'Hostel', area: 'Residential' },
    { id: 11, name: 'Casely-Hayford', type: 'Academic', area: 'Faculty' },
    { id: 12, name: 'College of Science', type: 'Academic', area: 'Faculty' },
    { id: 13, name: 'KNUST Hospital', type: 'Medical', area: 'Services' },
    { id: 14, name: 'Great Hall', type: 'Landmark', area: 'Central' },
    { id: 15, name: 'CCB (Central Classroom Block)', type: 'Academic', area: 'Central' },
];

export default function SearchModal({ isOpen, onClose, onSelectLocation }) {
    const [query, setQuery] = useState('');
    const [recentSearches, setRecentSearches] = useState([
        'Main Library',
        'Hall 7',
        'JQB',
    ]);
    const inputRef = useRef(null);
    const panelRef = useRef(null);

    useEscapeKey(isOpen, onClose);
    useFocusTrap({ enabled: isOpen, containerRef: panelRef, initialFocusRef: inputRef });

    const results = useMemo(() => {
        if (query.trim() === '') return [];

        const searchTerm = query.toLowerCase();
        return searchableLocations.filter(
            (loc) =>
                loc.name.toLowerCase().includes(searchTerm) ||
                loc.type.toLowerCase().includes(searchTerm) ||
                loc.area.toLowerCase().includes(searchTerm)
        );
    }, [query]);

    const handleSelect = (location) => {
        // Add to recent searches
        setRecentSearches((prev) => {
            const updated = [location.name, ...prev.filter((s) => s !== location.name)].slice(0, 5);
            return updated;
        });

        if (onSelectLocation) {
            onSelectLocation(location);
        }
        onClose();
        setQuery('');
    };

    const handleRecentSearch = (term) => {
        setQuery(term);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[2000] flex flex-col">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Search Panel */}
            <div
                ref={panelRef}
                className="relative bg-bg-secondary m-4 rounded-2xl overflow-hidden animate-slide-up max-h-[80vh] flex flex-col"
                role="dialog"
                aria-modal="true"
                aria-labelledby="search-title"
            >
                {/* Search Input */}
                <div className="p-4 border-b border-border">
                    <h2 id="search-title" className="sr-only">
                        Search locations
                    </h2>
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
                        <input
                            ref={inputRef}
                            type="text"
                            placeholder="Search locations, hostels, landmarks..."
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            className="w-full bg-bg-primary border border-border rounded-xl py-3 pl-12 pr-12 text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                            aria-label="Search locations"
                        />
                        {query && (
                            <button
                                type="button"
                                onClick={() => setQuery('')}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary"
                                aria-label="Clear search"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        )}
                    </div>
                </div>

                {/* Results / Recent Searches */}
                <div className="flex-1 overflow-y-auto p-4">
                    {query.trim() === '' ? (
                        <>
                            {/* Recent Searches */}
                            <div className="mb-4">
                                <h3 className="text-xs font-medium text-text-secondary mb-2 flex items-center gap-2">
                                    <Clock className="w-4 h-4" />
                                    Recent Searches
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {recentSearches.map((term, index) => (
                                        <button
                                            key={index}
                                            onClick={() => handleRecentSearch(term)}
                                            className="px-3 py-1.5 bg-bg-tertiary rounded-full text-sm text-text-primary hover:bg-border transition-colors"
                                        >
                                            {term}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Quick Access */}
                            <div>
                                <h3 className="text-xs font-medium text-text-secondary mb-2">
                                    Popular Locations
                                </h3>
                                <div className="space-y-2">
                                    {searchableLocations.slice(0, 5).map((loc) => (
                                        <button
                                            key={loc.id}
                                            onClick={() => handleSelect(loc)}
                                            className="w-full flex items-center gap-3 p-3 bg-bg-primary rounded-xl hover:bg-bg-tertiary transition-colors text-left"
                                        >
                                            <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
                                                <MapPin className="w-5 h-5 text-primary" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-text-primary">{loc.name}</p>
                                                <p className="text-xs text-text-secondary">{loc.type} • {loc.area}</p>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </>
                    ) : results.length > 0 ? (
                        <div className="space-y-2">
                            <p className="text-xs text-text-secondary mb-2">
                                {results.length} result{results.length !== 1 ? 's' : ''} found
                            </p>
                            {results.map((loc) => (
                                <button
                                    key={loc.id}
                                    onClick={() => handleSelect(loc)}
                                    className="w-full flex items-center gap-3 p-3 bg-bg-primary rounded-xl hover:bg-bg-tertiary transition-colors text-left"
                                >
                                    <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
                                        <MapPin className="w-5 h-5 text-primary" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-text-primary">{loc.name}</p>
                                        <p className="text-xs text-text-secondary">{loc.type} • {loc.area}</p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <Search className="w-12 h-12 text-text-muted mx-auto mb-3" />
                            <p className="text-text-secondary">No locations found for "{query}"</p>
                            <p className="text-xs text-text-muted mt-1">Try a different search term</p>
                        </div>
                    )}
                </div>

                {/* Close Button */}
                <div className="p-4 border-t border-border">
                    <button
                        onClick={onClose}
                        className="w-full py-3 bg-bg-tertiary text-text-primary rounded-xl font-medium hover:bg-border transition-colors"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
}
