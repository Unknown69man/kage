import { useState, useRef, useEffect } from "react";
import { Search, X, ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { cn } from "@/lib/utils";

interface SearchFilter {
  tags: string[];
  genres: string[];
  categories: string[];
  cast: string[];
}

const AVAILABLE_TAGS = ["Cyberpunk", "Sci-Fi", "Classic", "Nature", "Documentary", "Action", "Drama"];
const AVAILABLE_GENRES = ["Sci-Fi", "Nature", "Architecture", "Technology", "Abstract", "Animation", "Horror"];
const AVAILABLE_CATEGORIES = ["Movies", "Collections", "References", "Documentaries"];
const AVAILABLE_CAST = ["Tom Hardy", "Charlize Theron", "Nicholas Hoult", "Mark Ruffalo", "Zoe Kravitz"];

export function AdvancedSearch() {
  const [, navigate] = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState<"tags" | "genres" | "cast" | null>(null);
  const [searchInput, setSearchInput] = useState("");
  const [filters, setFilters] = useState<SearchFilter>({
    tags: [],
    genres: [],
    categories: [],
    cast: [],
  });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setShowSuggestions(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleAddFilter = (type: keyof SearchFilter, value: string) => {
    setFilters((prev) => {
      const existing = prev[type];
      if (existing.includes(value)) {
        return { ...prev, [type]: existing.filter((v) => v !== value) };
      }
      return { ...prev, [type]: [...existing, value] };
    });
    setSearchInput("");
    setShowSuggestions(null);
  };

  const handleSearch = () => {
    if (Object.values(filters).some((arr) => arr.length > 0)) {
      const filterStr = JSON.stringify(filters);
      navigate(`/search?filters=${encodeURIComponent(filterStr)}`);
      setIsOpen(false);
      setFilters({ tags: [], genres: [], categories: [], cast: [] });
    }
  };

  const filteredTags = searchInput
    ? AVAILABLE_TAGS.filter((tag) => tag.toLowerCase().includes(searchInput.toLowerCase()))
    : AVAILABLE_TAGS;

  const filteredGenres = searchInput
    ? AVAILABLE_GENRES.filter((genre) => genre.toLowerCase().includes(searchInput.toLowerCase()))
    : AVAILABLE_GENRES;

  const filteredCast = searchInput
    ? AVAILABLE_CAST.filter((actor) => actor.toLowerCase().includes(searchInput.toLowerCase()))
    : AVAILABLE_CAST;

  const hasActiveFilters = Object.values(filters).some((arr) => arr.length > 0);

  return (
    <div ref={containerRef} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-muted-foreground hover:text-cyan-400 transition-colors z-50 flex items-center justify-center rounded hover:bg-secondary/50"
        title="Advanced Search Filters"
        data-testid="button-advanced-search"
      >
        <Search className={cn("w-4 h-4", hasActiveFilters && "text-cyan-400")} />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-96 bg-card border border-border/50 rounded-lg p-4 shadow-lg z-50 space-y-3">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-sm">Advanced Search</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="relative">
            <Input
              placeholder="Search tags, genres, cast..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onFocus={() => setShowSuggestions("tags")}
              className="bg-secondary/50"
              data-testid="input-advanced-search"
            />

            {searchInput && showSuggestions && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border/50 rounded max-h-40 overflow-y-auto z-50">
                {showSuggestions === "tags" && filteredTags.length > 0 && (
                  <div className="p-2 space-y-1">
                    <p className="text-xs text-muted-foreground px-2 py-1">Tags</p>
                    {filteredTags.map((tag) => (
                      <button
                        key={tag}
                        onClick={() => handleAddFilter("tags", tag)}
                        className="w-full text-left px-2 py-1 rounded hover:bg-secondary/50 text-sm"
                        data-testid={`tag-suggestion-${tag}`}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="space-y-3">
            {/* Tags */}
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-2">Tags</label>
              <div className="flex flex-wrap gap-2">
                {AVAILABLE_TAGS.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => handleAddFilter("tags", tag)}
                    className={cn(
                      "px-2 py-1 rounded text-xs transition-colors",
                      filters.tags.includes(tag)
                        ? "bg-cyan-500/30 text-cyan-200 border border-cyan-500/50"
                        : "bg-secondary/50 text-muted-foreground hover:text-foreground hover:bg-secondary"
                    )}
                    data-testid={`button-tag-${tag}`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Genres */}
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-2">Genres</label>
              <div className="flex flex-wrap gap-2">
                {AVAILABLE_GENRES.map((genre) => (
                  <button
                    key={genre}
                    onClick={() => handleAddFilter("genres", genre)}
                    className={cn(
                      "px-2 py-1 rounded text-xs transition-colors",
                      filters.genres.includes(genre)
                        ? "bg-purple-500/30 text-purple-200 border border-purple-500/50"
                        : "bg-secondary/50 text-muted-foreground hover:text-foreground hover:bg-secondary"
                    )}
                    data-testid={`button-genre-${genre}`}
                  >
                    {genre}
                  </button>
                ))}
              </div>
            </div>

            {/* Cast */}
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-2">Cast</label>
              <div className="flex flex-wrap gap-2">
                {AVAILABLE_CAST.map((actor) => (
                  <button
                    key={actor}
                    onClick={() => handleAddFilter("cast", actor)}
                    className={cn(
                      "px-2 py-1 rounded text-xs transition-colors",
                      filters.cast.includes(actor)
                        ? "bg-orange-500/30 text-orange-200 border border-orange-500/50"
                        : "bg-secondary/50 text-muted-foreground hover:text-foreground hover:bg-secondary"
                    )}
                    data-testid={`button-cast-${actor}`}
                  >
                    {actor}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Active Filters Summary */}
          {hasActiveFilters && (
            <div className="bg-secondary/30 rounded p-2">
              <p className="text-xs font-medium mb-1">Active Filters:</p>
              <div className="flex flex-wrap gap-1">
                {[...filters.tags, ...filters.genres, ...filters.cast].map((filter) => (
                  <span
                    key={filter}
                    className="bg-secondary text-muted-foreground text-xs px-2 py-0.5 rounded flex items-center gap-1"
                    data-testid={`active-filter-${filter}`}
                  >
                    {filter}
                    <button
                      onClick={() => {
                        Object.keys(filters).forEach((key) => {
                          if (
                            (filters[key as keyof SearchFilter] as string[]).includes(filter)
                          ) {
                            handleAddFilter(key as keyof SearchFilter, filter);
                          }
                        });
                      }}
                      className="ml-1 hover:text-foreground"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}

          <Button
            onClick={handleSearch}
            disabled={!hasActiveFilters}
            className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white"
            data-testid="button-search"
          >
            Search
          </Button>
        </div>
      )}
    </div>
  );
}
