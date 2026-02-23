"use client";

import { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import SearchBar from "@/src/components/SearchBar";
import ResultCard, { SearchResult } from "@/src/components/ResultCard";
import FilterPanel, { Filters } from "@/src/components/FilterPanel";
import SafeguardBadge from "@/src/components/SafeguardBadge";
import { Compass, AlertCircle, PackageSearch } from "lucide-react";

const DEFAULT_FILTERS: Filters = { maxPrice: 300, selectedTags: [] };

export default function Home() {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [noMatchReason, setNoMatchReason] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);

  const handleSearch = useCallback(async (query: string) => {
    setIsLoading(true);
    setError(null);
    setNoMatchReason(null);
    setHasSearched(true);

    try {
      const res = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? `Request failed (${res.status})`);
      }

      const data = await res.json();
      setResults(data.results ?? []);
      setNoMatchReason(data.noMatchReason ?? null);
      setFilters(DEFAULT_FILTERS);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const filteredResults = useMemo(() => {
    return results.filter((r) => {
      const priceOk = r.price <= filters.maxPrice;
      const tagsOk =
        filters.selectedTags.length === 0 ||
        filters.selectedTags.every((t) => r.tags.includes(t));
      return priceOk && tagsOk;
    });
  }, [results, filters]);

  return (
    <main className="main">
      {/* HERO */}
      <motion.header
        className="hero"
        initial={{ opacity: 0, y: -40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
      >
        <div className="hero-glow" />
        <div className="hero-content">
          <div className="logo">
            <Compass size={32} className="logo-icon" />
            <span className="logo-text">Smart Travel Scout</span>
          </div>

          <h1 className="hero-title">
            Find your perfect <br />
            <span className="hero-accent">
              Sri Lankan Travel Experience
            </span>
          </h1>

          <p className="hero-subtitle">
            Tell us what your perfect getaway looks like — beach vibes, cultural adventures, wildlife safaris, or mountain escapes.
            <br />
            Our AI will intelligently match your request to real, curated Sri Lanka experiences — no made-up destinations, just smart discovery.
          </p>

          <SafeguardBadge />
        </div>
      </motion.header>

      {/* SEARCH */}
      <motion.section
        className="search-section"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <SearchBar onSearch={handleSearch} isLoading={isLoading} />
      </motion.section>

      {/* RESULTS */}
      <AnimatePresence>
        {(hasSearched || results.length > 0) && (
          <motion.section
            className="results-section"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="results-layout">
              {results.length > 0 && !isLoading && (
                <aside className="filters-aside">
                  <FilterPanel filters={filters} onChange={setFilters} />
                </aside>
              )}

              <div className="results-main">
                {/* Loading */}
                {isLoading && (
                  <div className="loading-grid">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="skeleton-card">
                        <div className="skeleton-line wide" />
                        <div className="skeleton-line medium" />
                        <div className="skeleton-line narrow" />
                      </div>
                    ))}
                  </div>
                )}

                {/* Error */}
                {!isLoading && error && (
                  <motion.div
                    className="error-state"
                    initial={{ scale: 0.9 }}
                    animate={{ scale: 1 }}
                  >
                    <AlertCircle size={32} />
                    <p>{error}</p>
                  </motion.div>
                )}

                {/* Empty */}
                {!isLoading &&
                  !error &&
                  hasSearched &&
                  filteredResults.length === 0 && (
                    <div className="empty-state">
                      <PackageSearch size={48} className="empty-icon" />
                      <h2 className="empty-title">
                        No matching experiences found
                      </h2>
                      <p className="empty-desc">
                        {noMatchReason ??
                          (filters.selectedTags.length > 0 ||
                          filters.maxPrice < 300
                            ? "Try adjusting your price range or tag filters."
                            : "Try a different query — for example, \"beach, surfing, under $100\".")}
                      </p>
                    </div>
                  )}

                {/* Success */}
                {!isLoading &&
                  !error &&
                  filteredResults.length > 0 && (
                    <>
                      <div className="results-heading">
                        <h2 className="results-count">
                          {filteredResults.length} experience
                          {filteredResults.length !== 1 ? "s" : ""} matched
                        </h2>
                        <span className="results-note">
                          ranked by AI match score
                        </span>
                      </div>

                      <motion.div
                        className="results-grid"
                        initial="hidden"
                        animate="visible"
                        variants={{
                          visible: {
                            transition: { staggerChildren: 0.12 },
                          },
                        }}
                      >
                        {filteredResults.map((result, i) => (
                          <motion.div
                            key={result.id}
                            variants={{
                              hidden: { opacity: 0, y: 20 },
                              visible: { opacity: 1, y: 0 },
                            }}
                            transition={{ duration: 0.35 }}
                          >
                            <ResultCard result={result} index={i} />
                          </motion.div>
                        ))}
                      </motion.div>
                    </>
                  )}
              </div>
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* FOOTER */}
      <footer className="footer">
        Powered by Gemini · Grounded to 5 curated experiences
      </footer>
    </main>
  );
}