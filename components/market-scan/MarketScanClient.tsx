"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import ArticleCard from "./ArticleCard";
import { Search, Filter, RefreshCw } from "lucide-react";
import { toast } from "@/components/ui/Toast";

interface Article {
  id: string;
  title: string;
  summary: string | null;
  source: string;
  sourceUrl: string | null;
  sourceType: string;
  category: string;
  jurisdiction: string | null;
  publishedAt: Date;
  relevanceScore: number;
  relevanceTags: string[];
  keyTopics: string[];
  affectedFrameworks: string[];
  riskAreas: string[];
  complianceImpact: string | null;
  scannedAt: Date;
  // Enhanced metadata
  sentiment?: string | null;
  urgency?: string | null;
  impactScope?: string | null;
  affectedIndustries?: string[];
  regulatoryBodies?: string[];
  relatedRegulations?: string[];
  actionItems?: string[];
  timeline?: string | null;
  geographicRegions?: string[];
  mentionedEntities?: string[];
  enforcementActions?: string[];
  readingTimeMinutes?: number | null;
  complexityLevel?: string | null;
  language?: string | null;
  author?: string | null;
  publisher?: string | null;
}

interface ScanJob {
  id: string;
  scanType: string;
  status: string;
  startedAt: Date;
  completedAt: Date | null;
  articlesFound: number;
  articlesProcessed: number;
  articlesAdded: number;
}

interface MarketScanClientProps {
  initialArticles: Article[];
  recentScans: ScanJob[];
}

export default function MarketScanClient({ 
  initialArticles, 
  recentScans 
}: MarketScanClientProps) {
  const router = useRouter();
  const [articles, setArticles] = useState(initialArticles);
  const [filteredArticles, setFilteredArticles] = useState(initialArticles);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedJurisdiction, setSelectedJurisdiction] = useState<string>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedSentiment, setSelectedSentiment] = useState<string>("all");
  const [selectedUrgency, setSelectedUrgency] = useState<string>("all");
  const [selectedImpactScope, setSelectedImpactScope] = useState<string>("all");
  const [selectedIndustry, setSelectedIndustry] = useState<string>("all");
  const [selectedComplexity, setSelectedComplexity] = useState<string>("all");
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Extract unique values for filters
  const jurisdictions = Array.from(
    new Set(articles.map(a => a.jurisdiction).filter(Boolean))
  ) as string[];
  const categories = Array.from(new Set(articles.map(a => a.category)));
  const sentiments = Array.from(
    new Set(articles.map(a => a.sentiment).filter(Boolean))
  ) as string[];
  const urgencies = Array.from(
    new Set(articles.map(a => a.urgency).filter(Boolean))
  ) as string[];
  const impactScopes = Array.from(
    new Set(articles.map(a => a.impactScope).filter(Boolean))
  ) as string[];
  const industries = Array.from(
    new Set(articles.flatMap(a => a.affectedIndustries || []))
  );
  const complexityLevels = Array.from(
    new Set(articles.map(a => a.complexityLevel).filter(Boolean))
  ) as string[];

  // Filter articles
  useEffect(() => {
    let filtered = articles;

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        article =>
          article.title.toLowerCase().includes(query) ||
          article.summary?.toLowerCase().includes(query) ||
          article.source.toLowerCase().includes(query) ||
          article.keyTopics.some(topic => topic.toLowerCase().includes(query))
      );
    }

    // Jurisdiction filter
    if (selectedJurisdiction !== "all") {
      filtered = filtered.filter(
        article => article.jurisdiction === selectedJurisdiction
      );
    }

    // Category filter
    if (selectedCategory !== "all") {
      filtered = filtered.filter(article => article.category === selectedCategory);
    }

    // Sentiment filter
    if (selectedSentiment !== "all") {
      filtered = filtered.filter(article => article.sentiment === selectedSentiment);
    }

    // Urgency filter
    if (selectedUrgency !== "all") {
      filtered = filtered.filter(article => article.urgency === selectedUrgency);
    }

    // Impact Scope filter
    if (selectedImpactScope !== "all") {
      filtered = filtered.filter(article => article.impactScope === selectedImpactScope);
    }

    // Industry filter
    if (selectedIndustry !== "all") {
      filtered = filtered.filter(
        article => article.affectedIndustries?.includes(selectedIndustry)
      );
    }

    // Complexity filter
    if (selectedComplexity !== "all") {
      filtered = filtered.filter(article => article.complexityLevel === selectedComplexity);
    }

    setFilteredArticles(filtered);
  }, [
    articles,
    searchQuery,
    selectedJurisdiction,
    selectedCategory,
    selectedSentiment,
    selectedUrgency,
    selectedImpactScope,
    selectedIndustry,
    selectedComplexity,
  ]);

  const refreshArticles = async () => {
    setIsRefreshing(true);
    try {
      console.log("[MARKET_SCAN_CLIENT] Refreshing articles...");
      
      // Fetch directly via API
      const response = await fetch("/api/market-scan/articles", {
        credentials: "include",
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log("[MARKET_SCAN_CLIENT] Fetched articles:", data.articles?.length || 0);
        if (data.articles) {
          setArticles(data.articles);
          console.log("[MARKET_SCAN_CLIENT] Updated articles state:", data.articles.length);
          toast(`Loaded ${data.articles.length} articles`, "success");
        }
      } else {
        console.error("[MARKET_SCAN_CLIENT] Failed to fetch articles:", response.status);
        toast("Failed to refresh articles. Please try again.", "error");
        // Fallback: refresh server component
        router.refresh();
      }
    } catch (error) {
      console.error("[MARKET_SCAN_CLIENT] Error refreshing articles:", error);
      toast("Failed to refresh articles. Please try again.", "error");
      // Fallback: refresh server component
      router.refresh();
    } finally {
      setIsRefreshing(false);
    }
  };


  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-card-foreground mb-2">
          Market Scan
        </h1>
        <p className="text-muted-foreground">
          Real-time regulatory intelligence and AI governance updates. Articles are automatically scanned daily from verified sources.
        </p>
      </div>

      {/* Stats & Actions */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-card rounded-lg p-4 border border-border">
          <p className="text-sm text-muted-foreground mb-1">Total Articles</p>
          <p className="text-2xl font-bold text-card-foreground">
            {articles.length}
          </p>
        </div>
        <div className="bg-card rounded-lg p-4 border border-border">
          <p className="text-sm text-muted-foreground mb-1">Last Scan</p>
          <p className="text-sm font-medium text-card-foreground">
            {recentScans[0]?.completedAt
              ? new Date(recentScans[0].completedAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: '2-digit',
                  day: '2-digit',
                })
              : "Never"}
          </p>
        </div>
        <div className="bg-card rounded-lg p-4 border border-border">
          <p className="text-sm text-muted-foreground mb-1">New Today</p>
          <p className="text-2xl font-bold text-card-foreground">
            {articles.filter(
              a =>
                new Date(a.scannedAt).toDateString() ===
                new Date().toDateString()
            ).length}
          </p>
        </div>
        <div className="bg-card rounded-lg p-4 border border-border">
          <button
            onClick={refreshArticles}
            disabled={isRefreshing}
            className="w-full px-4 py-2 bg-primary text-white rounded-lg hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isRefreshing ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                Refreshing...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4" />
                Refresh Articles
              </>
            )}
          </button>
          <p className="text-xs text-muted-foreground mt-2 text-center">
            Articles are automatically scanned daily
          </p>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="mb-6 space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search articles by title, content, or topics..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-card-foreground"
          />
        </div>

        {/* Filters */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium text-muted-foreground">Filters:</span>
          </div>
          
          <div className="flex flex-wrap gap-3">
            {/* Jurisdiction Filter */}
            <select
              value={selectedJurisdiction}
              onChange={e => setSelectedJurisdiction(e.target.value)}
              className="px-3 py-2 bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-card-foreground text-sm"
            >
              <option value="all">All Jurisdictions</option>
              {jurisdictions.map(j => (
                <option key={j} value={j}>
                  {j}
                </option>
              ))}
            </select>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              className="px-3 py-2 bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-card-foreground text-sm"
            >
              <option value="all">All Categories</option>
              {categories.map(c => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>

            {/* Sentiment Filter */}
            <select
              value={selectedSentiment}
              onChange={e => setSelectedSentiment(e.target.value)}
              disabled={sentiments.length === 0}
              className="px-3 py-2 bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-card-foreground text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              title={sentiments.length === 0 ? "No articles with sentiment data yet" : ""}
            >
              <option value="all">All Sentiments</option>
              {sentiments.length > 0 ? (
                sentiments.map(s => (
                  <option key={s} value={s}>
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </option>
                ))
              ) : (
                <option disabled>No data available</option>
              )}
            </select>

            {/* Urgency Filter */}
            <select
              value={selectedUrgency}
              onChange={e => setSelectedUrgency(e.target.value)}
              disabled={urgencies.length === 0}
              className="px-3 py-2 bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-card-foreground text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              title={urgencies.length === 0 ? "No articles with urgency data yet" : ""}
            >
              <option value="all">All Urgency Levels</option>
              {urgencies.length > 0 ? (
                urgencies.map(u => (
                  <option key={u} value={u}>
                    {u.charAt(0).toUpperCase() + u.slice(1)}
                  </option>
                ))
              ) : (
                <option disabled>No data available</option>
              )}
            </select>

            {/* Impact Scope Filter */}
            <select
              value={selectedImpactScope}
              onChange={e => setSelectedImpactScope(e.target.value)}
              disabled={impactScopes.length === 0}
              className="px-3 py-2 bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-card-foreground text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              title={impactScopes.length === 0 ? "No articles with impact scope data yet" : ""}
            >
              <option value="all">All Impact Scopes</option>
              {impactScopes.length > 0 ? (
                impactScopes.map(scope => (
                  <option key={scope} value={scope}>
                    {scope.charAt(0).toUpperCase() + scope.slice(1).replace(/-/g, ' ')}
                  </option>
                ))
              ) : (
                <option disabled>No data available</option>
              )}
            </select>

            {/* Industry Filter */}
            <select
              value={selectedIndustry}
              onChange={e => setSelectedIndustry(e.target.value)}
              disabled={industries.length === 0}
              className="px-3 py-2 bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-card-foreground text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              title={industries.length === 0 ? "No articles with industry data yet" : ""}
            >
              <option value="all">All Industries</option>
              {industries.length > 0 ? (
                industries.map(industry => (
                  <option key={industry} value={industry}>
                    {industry}
                  </option>
                ))
              ) : (
                <option disabled>No data available</option>
              )}
            </select>

            {/* Complexity Level Filter */}
            <select
              value={selectedComplexity}
              onChange={e => setSelectedComplexity(e.target.value)}
              disabled={complexityLevels.length === 0}
              className="px-3 py-2 bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-card-foreground text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              title={complexityLevels.length === 0 ? "No articles with complexity data yet" : ""}
            >
              <option value="all">All Complexity Levels</option>
              {complexityLevels.length > 0 ? (
                complexityLevels.map(level => (
                  <option key={level} value={level}>
                    {level.charAt(0).toUpperCase() + level.slice(1)}
                  </option>
                ))
              ) : (
                <option disabled>No data available</option>
              )}
            </select>
          </div>

          {/* Clear Filters Button */}
          {(selectedJurisdiction !== "all" ||
            selectedCategory !== "all" ||
            selectedSentiment !== "all" ||
            selectedUrgency !== "all" ||
            selectedImpactScope !== "all" ||
            selectedIndustry !== "all" ||
            selectedComplexity !== "all") && (
            <button
              onClick={() => {
                setSelectedJurisdiction("all");
                setSelectedCategory("all");
                setSelectedSentiment("all");
                setSelectedUrgency("all");
                setSelectedImpactScope("all");
                setSelectedIndustry("all");
                setSelectedComplexity("all");
              }}
              className="text-sm text-primary hover:underline"
            >
              Clear all filters
            </button>
          )}
        </div>
      </div>

      {/* Results Count */}
      <div className="mb-4">
        <p className="text-sm text-muted-foreground">
          Showing {filteredArticles.length} of {articles.length} articles
        </p>
      </div>

      {/* Articles Grid */}
      {filteredArticles.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredArticles.map(article => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-card rounded-lg border border-border">
          <p className="text-muted-foreground">
            {articles.length === 0
              ? "No articles found. Run a scan to fetch articles."
              : "No articles match your filters."}
          </p>
        </div>
      )}
    </div>
  );
}

