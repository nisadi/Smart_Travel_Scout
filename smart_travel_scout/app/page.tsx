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
    <main style={{ minHeight: "100vh" }}>
      {/* HERO SECTION */}
      <motion.header
        initial={{ opacity: 0, y: -40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        style={{ textAlign: "center", padding: "4rem 1rem" }}
      >
        <div style={{ display: "flex", justifyContent: "center", gap: "10px", alignItems: "center" }}>
          <Compass size={36} />
          <h2>Smart Travel Scout</h2>
        </div>

        <h1 style={{ fontSize: "2.8rem", marginTop: "1rem" }}>
          Find your perfect <br />
          <span style={{ color: "#38bdf8" }}>Sri Lanka experience</span>
        </h1>

        <p style={{ marginTop: "1rem", opacity: 0.7 }}>
          Describe what you are looking for and our AI will scout the best
          matching experiences.
        </p>

        <div style={{ marginTop: "1rem" }}>
          <SafeguardBadge />
        </div>
      </motion.header>

      {/* SEARCH */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        style={{ padding: "1rem", textAlign: "center" }}
      >
        <SearchBar onSearch={handleSearch} isLoading={isLoading} />
      </motion.section>

      {/* RESULTS */}
      <AnimatePresence>
        {(hasSearched || results.length > 0) && (
          <motion.section
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            style={{ padding: "2rem" }}
          >
            {isLoading && <p style={{ textAlign: "center" }}>Searching experiences...</p>}

            {!isLoading && error && (
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                style={{ textAlign: "center", color: "tomato" }}
              >
                <AlertCircle size={32} />
                <p>{error}</p>
              </motion.div>
            )}

            {!isLoading && filteredResults.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                style={{ textAlign: "center" }}
              >
                <PackageSearch size={48} />
                <h2>No matching experiences found</h2>
                <p>
                  {noMatchReason ??
                    "Try a different query — for example, 'beach, surfing, under $100'."}
                </p>
              </motion.div>
            )}

            {!isLoading && filteredResults.length > 0 && (
              <>
                <h2 style={{ textAlign: "center", marginBottom: "1.5rem" }}>
                  {filteredResults.length} experience
                  {filteredResults.length !== 1 ? "s" : ""} matched
                </h2>

                <motion.div
                  initial="hidden"
                  animate="visible"
                  variants={{
                    visible: {
                      transition: { staggerChildren: 0.15 },
                    },
                  }}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                    gap: "1.5rem",
                  }}
                >
                  {filteredResults.map((result, i) => (
                    <motion.div
                      key={result.id}
                      variants={{
                        hidden: { opacity: 0, y: 20 },
                        visible: { opacity: 1, y: 0 },
                      }}
                      whileHover={{ scale: 1.03 }}
                      transition={{ duration: 0.4 }}
                    >
                      <ResultCard result={result} index={i} />
                    </motion.div>
                  ))}
                </motion.div>
              </>
            )}
          </motion.section>
        )}
      </AnimatePresence>

      {/* FOOTER */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        style={{ textAlign: "center", padding: "2rem", opacity: 0.6 }}
      >
        Powered by Gemini · Grounded to 5 curated experiences
      </motion.footer>
    </main>
  );
}