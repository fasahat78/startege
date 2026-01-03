"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

interface ConceptCard {
  id: string;
  domain: string;
  category: string;
  concept: string;
  difficulty: string;
  estimatedReadTime: number;
}

interface ConceptGroup {
  domain: string;
  categories: {
    category: string;
    concepts: ConceptCard[];
  }[];
}

interface ConceptsClientProps {
  concepts: ConceptCard[];
  groupedConcepts: ConceptGroup[];
  domains: string[];
  categories: Array<{ domain: string; category: string; count: number }>;
  progressMap: Map<string, string>;
  domainProgress: Map<string, { completed: number; total: number }>;
  searchParams: {
    domain: string;
    difficulty: string;
    search: string;
    view: string;
  };
}

const difficultyColors: Record<string, string> = {
  beginner: "bg-status-success/10 text-status-success border border-status-success/20",
  intermediate: "bg-status-warning/10 text-status-warning border border-status-warning/20",
  advanced: "bg-status-error/10 text-status-error border border-status-error/20",
  expert: "bg-purple-100 text-purple-700 border border-purple-200",
};

export default function ConceptsClient({
  concepts,
  groupedConcepts,
  domains,
  categories,
  progressMap,
  domainProgress,
  searchParams,
}: ConceptsClientProps) {
  const router = useRouter();
  const searchParamsHook = useSearchParams();
  const [expandedDomains, setExpandedDomains] = useState<Set<string>>(new Set(domains));
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState(searchParams.search || "");
  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(null);

  // Read view and filters from URL params directly to ensure they update
  const view = searchParamsHook.get("view") || "grouped";
  const currentDomain = searchParamsHook.get("domain") || "all";
  const currentDifficulty = searchParamsHook.get("difficulty") || "all";
  const currentSearch = searchParamsHook.get("search") || "";

  // Sync search query with URL param
  useEffect(() => {
    setSearchQuery(currentSearch);
  }, [currentSearch]);

  const handleFilterChange = useCallback((key: string, value: string) => {
    const params = new URLSearchParams(searchParamsHook.toString());
    if (value === "all" || value === "") {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    router.push(`/concepts?${params.toString()}`, { scroll: false });
  }, [router, searchParamsHook]);

  // Debounced search
  const handleSearchChange = useCallback((value: string) => {
    setSearchQuery(value);
    
    // Clear existing timer
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }
    
    // Set new timer for debounced search
    const timer = setTimeout(() => {
      handleFilterChange("search", value);
    }, 500); // 500ms debounce
    
    setDebounceTimer(timer);
  }, [debounceTimer, handleFilterChange]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
    };
  }, [debounceTimer]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Clear any pending debounce and search immediately
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }
    handleFilterChange("search", searchQuery);
  };

  const handleClear = () => {
    setSearchQuery("");
    router.push("/concepts", { scroll: false });
  };

  const toggleDomain = (domain: string) => {
    const newExpanded = new Set(expandedDomains);
    if (newExpanded.has(domain)) {
      newExpanded.delete(domain);
    } else {
      newExpanded.add(domain);
    }
    setExpandedDomains(newExpanded);
  };

  const toggleCategory = (key: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(key)) {
      newExpanded.delete(key);
    } else {
      newExpanded.add(key);
    }
    setExpandedCategories(newExpanded);
  };

  const getDomainCategories = (domain: string) => {
    return categories.filter((c) => c.domain === domain);
  };

  const getCategoryConcepts = (domain: string, category: string) => {
    return concepts.filter(
      (c) => c.domain === domain && c.category === category
    );
  };

  return (
    <div className="min-h-screen bg-muted">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Concept Cards
          </h1>
          <p className="text-muted-foreground">
            Explore {concepts.length} AI Governance curriculum concepts
          </p>
        </div>

        {/* Filters & View Toggle */}
        <div className="bg-card rounded-lg shadow-card p-6 mb-6 border border-border">
          <form onSubmit={handleSearchSubmit} className="space-y-4">
            {/* Search */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg
                  className="h-5 w-5 text-muted-foreground"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Escape") {
                    handleClear();
                  }
                }}
                placeholder="Search concepts..."
                className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-accent focus:border-accent placeholder:text-muted-foreground"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground hover:text-foreground"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>

            {/* Filters Row */}
            <div className="flex flex-wrap gap-4 items-end">
              <div className="flex-1 min-w-[200px]">
                <label htmlFor="domain" className="block text-sm font-medium text-muted-foreground mb-1.5">
                  Domain
                </label>
                <select
                  id="domain"
                  value={currentDomain}
                  onChange={(e) => handleFilterChange("domain", e.target.value)}
                  className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-accent focus:border-accent cursor-pointer"
                >
                  <option value="all">All Domains</option>
                  {domains.map((d) => {
                    const progress = domainProgress.get(d);
                    const progressText = progress
                      ? ` (${progress.completed}/${progress.total})`
                      : "";
                    return (
                      <option key={d} value={d}>
                        {d}
                        {progressText}
                      </option>
                    );
                  })}
                </select>
              </div>

              <div className="min-w-[150px]">
                <label htmlFor="difficulty" className="block text-sm font-medium text-muted-foreground mb-1.5">
                  Difficulty
                </label>
                <select
                  id="difficulty"
                  value={currentDifficulty}
                  onChange={(e) => handleFilterChange("difficulty", e.target.value)}
                  className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-accent focus:border-accent cursor-pointer"
                >
                  <option value="all">All Levels</option>
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                  <option value="expert">Expert</option>
                </select>
              </div>

              <div className="flex gap-2">
                {(currentSearch || currentDomain !== "all" || currentDifficulty !== "all") && (
                  <button
                    type="button"
                    onClick={handleClear}
                    className="px-4 py-2 border border-border rounded-lg hover:bg-muted transition text-sm font-medium"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            </div>

            {/* View Toggle */}
            <div className="flex items-center gap-2 pt-2 border-t border-border">
              <span className="text-sm text-muted-foreground">View:</span>
              <button
                type="button"
                onClick={() => handleFilterChange("view", "grouped")}
                className={`px-4 py-1 rounded text-sm transition ${
                  view === "grouped"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                Grouped
              </button>
              <button
                type="button"
                onClick={() => handleFilterChange("view", "grid")}
                className={`px-4 py-1 rounded text-sm transition ${
                  view === "grid"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                Grid
              </button>
            </div>
          </form>
        </div>

        {/* Content */}
        {concepts.length === 0 ? (
          <div className="bg-card rounded-lg shadow-card p-12 text-center border border-border">
            <p className="text-muted-foreground text-lg">
              No concepts found. Try adjusting your filters.
            </p>
          </div>
        ) : view === "grouped" ? (
          /* Grouped View */
          <div className="space-y-6">
            {groupedConcepts.map((domainGroup) => {
              const progress = domainProgress.get(domainGroup.domain);
              const progressPercent = progress
                ? Math.round((progress.completed / progress.total) * 100)
                : 0;
              const isExpanded = expandedDomains.has(domainGroup.domain);

              return (
                <div
                  key={domainGroup.domain}
                  className="bg-card rounded-lg shadow-card border border-border overflow-hidden"
                >
                  {/* Domain Header */}
                  <button
                    onClick={() => toggleDomain(domainGroup.domain)}
                    className="w-full p-6 flex items-center justify-between hover:bg-muted/50 transition"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className="flex-shrink-0">
                        {isExpanded ? (
                          <svg
                            className="h-5 w-5 text-muted-foreground"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 9l-7 7-7-7"
                            />
                          </svg>
                        ) : (
                          <svg
                            className="h-5 w-5 text-muted-foreground"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 5l7 7-7 7"
                            />
                          </svg>
                        )}
                      </div>
                      <div className="flex-1 text-left">
                        <h2 className="text-xl font-bold text-card-foreground mb-1">
                          {domainGroup.domain}
                        </h2>
                        {progress && (
                          <div className="flex items-center gap-3">
                            <div className="flex-1 bg-muted rounded-full h-2 overflow-hidden">
                              <div
                                className="h-full bg-status-success transition-all duration-300"
                                style={{ width: `${progressPercent}%` }}
                              />
                            </div>
                            <span className="text-sm text-muted-foreground">
                              {progress.completed}/{progress.total} ({progressPercent}%)
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </button>

                  {/* Categories */}
                  {isExpanded && (
                    <div className="border-t border-border">
                      {domainGroup.categories.map((categoryGroup) => {
                        const categoryKey = `${domainGroup.domain}::${categoryGroup.category}`;
                        const isCategoryExpanded = expandedCategories.has(categoryKey);
                        const categoryConcepts = categoryGroup.concepts;
                        const categoryProgress = categoryConcepts.filter(
                          (c) => progressMap.get(c.id) === "completed"
                        ).length;

                        return (
                          <div key={categoryKey} className="border-b border-border last:border-b-0">
                            <button
                              onClick={() => toggleCategory(categoryKey)}
                              className="w-full px-6 py-4 flex items-center justify-between hover:bg-muted/30 transition"
                            >
                              <div className="flex items-center gap-3 flex-1 text-left">
                                <div className="flex-shrink-0">
                                  {isCategoryExpanded ? (
                                    <svg
                                      className="h-4 w-4 text-muted-foreground"
                                      fill="none"
                                      viewBox="0 0 24 24"
                                      stroke="currentColor"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M19 9l-7 7-7-7"
                                      />
                                    </svg>
                                  ) : (
                                    <svg
                                      className="h-4 w-4 text-muted-foreground"
                                      fill="none"
                                      viewBox="0 0 24 24"
                                      stroke="currentColor"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M9 5l7 7-7 7"
                                      />
                                    </svg>
                                  )}
                                </div>
                                <div className="flex-1">
                                  <span className="font-medium text-card-foreground">
                                    {categoryGroup.category}
                                  </span>
                                  <span className="text-sm text-muted-foreground ml-2">
                                    ({categoryConcepts.length} concepts
                                    {categoryProgress > 0 && ` • ${categoryProgress} completed`})
                                  </span>
                                </div>
                              </div>
                            </button>

                            {/* Concepts List */}
                            {isCategoryExpanded && (
                              <div className="px-6 pb-4 bg-muted/20">
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-4">
                                  {categoryConcepts.map((concept) => {
                                    const status = progressMap.get(concept.id);
                                    const isCompleted = status === "completed";
                                    const isInProgress = status === "in_progress";

                                    return (
                                      <Link
                                        key={concept.id}
                                        href={`/concepts/${concept.id}`}
                                        className="bg-background rounded-lg p-4 border border-border hover:border-accent/50 hover:shadow-sm transition"
                                      >
                                        <div className="flex items-start justify-between mb-2">
                                          <h3 className="text-sm font-semibold text-card-foreground line-clamp-2 flex-1">
                                            {concept.concept}
                                          </h3>
                                          {isCompleted && (
                                            <svg
                                              className="h-4 w-4 text-status-success flex-shrink-0 ml-2"
                                              fill="currentColor"
                                              viewBox="0 0 20 20"
                                            >
                                              <path
                                                fillRule="evenodd"
                                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                                clipRule="evenodd"
                                              />
                                            </svg>
                                          )}
                                        </div>
                                        <div className="flex items-center gap-2 flex-wrap">
                                          <span
                                            className={`text-xs font-medium px-2 py-0.5 rounded ${
                                              difficultyColors[concept.difficulty] ||
                                              "bg-muted text-muted-foreground border border-border"
                                            }`}
                                          >
                                            {concept.difficulty}
                                          </span>
                                          {isInProgress && (
                                            <span className="text-xs text-accent font-medium">
                                              In Progress
                                            </span>
                                          )}
                                        </div>
                                      </Link>
                                    );
                                  })}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          /* Grid View */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {concepts.map((concept) => {
              const status = progressMap.get(concept.id);
              const isCompleted = status === "completed";
              const isInProgress = status === "in_progress";

              return (
                <Link
                  key={concept.id}
                  href={`/concepts/${concept.id}`}
                  className="bg-card rounded-lg shadow-card hover:shadow-float transition p-6 block border border-border hover:border-accent/50"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-card-foreground mb-2">
                        {concept.concept}
                      </h3>
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <span className="text-sm text-muted-foreground">
                          {concept.domain}
                        </span>
                        <span className="text-border">•</span>
                        <span className="text-sm text-muted-foreground">
                          {concept.category}
                        </span>
                      </div>
                    </div>
                    {isCompleted && (
                      <div className="flex-shrink-0">
                        <svg
                          className="h-6 w-6 text-status-success"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <span
                      className={`text-xs font-medium px-2 py-1 rounded ${
                        difficultyColors[concept.difficulty] ||
                        "bg-muted text-muted-foreground border border-border"
                      }`}
                    >
                      {concept.difficulty}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {concept.estimatedReadTime} min read
                    </span>
                  </div>

                  {isInProgress && (
                    <div className="mt-3 pt-3 border-t border-border">
                      <span className="text-xs text-accent font-medium">
                        In Progress
                      </span>
                    </div>
                  )}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

