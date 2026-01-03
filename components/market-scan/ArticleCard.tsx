"use client";

import { ExternalLink, Calendar, MapPin, Tag, AlertTriangle, Clock, TrendingUp, Building2, Scale, Zap, Globe } from "lucide-react";
import { useState } from "react";

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

interface ArticleCardProps {
  article: Article;
}

export default function ArticleCard({ article }: ArticleCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const getComplianceColor = (impact: string | null) => {
    switch (impact) {
      case "High":
        return "bg-status-error/10 text-status-error border-status-error/20";
      case "Medium":
        return "bg-status-warning/10 text-status-warning border-status-warning/20";
      case "Low":
        return "bg-status-success/10 text-status-success border-status-success/20";
      default:
        return "bg-muted/50 text-muted-foreground border-border";
    }
  };

  const getSourceTypeColor = (type: string) => {
    switch (type) {
      case "REGULATORY":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "NEWS":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "STANDARD":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
      case "CASE_STUDY":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  const getUrgencyColor = (urgency: string | null | undefined) => {
    switch (urgency) {
      case "breaking":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      case "high":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";
      case "medium":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "low":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      default:
        return "";
    }
  };

  const getSentimentColor = (sentiment: string | null | undefined) => {
    switch (sentiment) {
      case "positive":
        return "text-green-600";
      case "negative":
        return "text-red-600";
      case "neutral":
        return "text-gray-600";
      default:
        return "text-muted-foreground";
    }
  };

  return (
    <div className="bg-card rounded-lg border border-border p-6 hover:shadow-lg transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-xl font-semibold text-card-foreground mb-2 line-clamp-2">
            {article.title}
          </h3>
          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {new Date(article.publishedAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
              })}
            </div>
            {article.readingTimeMinutes && (
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {article.readingTimeMinutes} min
              </div>
            )}
            {article.jurisdiction && (
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                {article.jurisdiction}
              </div>
            )}
            {article.urgency && (
              <span
                className={`px-2 py-1 rounded text-xs font-medium ${getUrgencyColor(
                  article.urgency
                )}`}
              >
                {article.urgency.toUpperCase()}
              </span>
            )}
            <span
              className={`px-2 py-1 rounded text-xs font-medium ${getSourceTypeColor(
                article.sourceType
              )}`}
            >
              {article.sourceType}
            </span>
          </div>
        </div>
        {article.sourceUrl && (
          <a
            href={article.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-4 p-2 hover:bg-muted rounded-lg transition"
            title="Open source"
          >
            <ExternalLink className="h-5 w-5 text-muted-foreground" />
          </a>
        )}
      </div>

      {/* Summary */}
      {article.summary && (
        <p className="text-card-foreground mb-4 line-clamp-3">
          {article.summary}
        </p>
      )}

      {/* Source URL Link - Prominent */}
      {article.sourceUrl && (
        <div className="mb-4">
          <a
            href={article.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium text-sm"
          >
            <ExternalLink className="h-4 w-4" />
            Read Full Article
          </a>
        </div>
      )}

      {/* Sentiment Badge */}
      {article.sentiment && (
        <div className="mb-3">
          <span className={`text-xs font-medium ${getSentimentColor(article.sentiment)}`}>
            Sentiment: {article.sentiment.charAt(0).toUpperCase() + article.sentiment.slice(1)}
          </span>
        </div>
      )}

      {/* Relevance Score */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm text-muted-foreground">Relevance</span>
          <span className="text-sm font-medium text-card-foreground">
            {(article.relevanceScore * 100).toFixed(0)}%
          </span>
        </div>
        <div className="w-full bg-muted rounded-full h-2">
          <div
            className="bg-primary h-2 rounded-full transition-all"
            style={{ width: `${article.relevanceScore * 100}%` }}
          />
        </div>
      </div>

      {/* Compliance Impact */}
      {article.complianceImpact && (
        <div className="mb-4">
          <div
            className={`inline-flex items-center gap-2 px-3 py-1 rounded-lg border text-sm font-medium ${getComplianceColor(
              article.complianceImpact
            )}`}
          >
            <AlertTriangle className="h-4 w-4" />
            Compliance Impact: {article.complianceImpact}
          </div>
        </div>
      )}

      {/* Tags & Frameworks */}
      <div className="space-y-2 mb-4">
        {article.affectedFrameworks.length > 0 && (
          <div>
            <div className="flex items-center gap-1 mb-1">
              <Tag className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs font-medium text-muted-foreground">
                Frameworks:
              </span>
            </div>
            <div className="flex flex-wrap gap-1">
              {article.affectedFrameworks.slice(0, 5).map((framework, idx) => (
                <span
                  key={idx}
                  className="px-2 py-1 bg-primary/10 text-primary rounded text-xs"
                >
                  {framework}
                </span>
              ))}
              {article.affectedFrameworks.length > 5 && (
                <span className="px-2 py-1 text-xs text-muted-foreground">
                  +{article.affectedFrameworks.length - 5} more
                </span>
              )}
            </div>
          </div>
        )}

        {article.riskAreas.length > 0 && (
          <div>
            <span className="text-xs font-medium text-muted-foreground">
              Risk Areas:{" "}
            </span>
            <span className="text-xs text-card-foreground">
              {article.riskAreas.slice(0, 3).join(", ")}
              {article.riskAreas.length > 3 && "..."}
            </span>
          </div>
        )}
      </div>

      {/* Expandable Details */}
      {isExpanded && (
        <div className="mt-4 pt-4 border-t border-border space-y-3">
          {article.keyTopics.length > 0 && (
            <div>
              <span className="text-sm font-medium text-muted-foreground">
                Key Topics:{" "}
              </span>
              <span className="text-sm text-card-foreground">
                {article.keyTopics.join(", ")}
              </span>
            </div>
          )}
          
          {article.affectedIndustries && article.affectedIndustries.length > 0 && (
            <div>
              <div className="flex items-center gap-1 mb-1">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium text-muted-foreground">
                  Affected Industries:
                </span>
              </div>
              <div className="flex flex-wrap gap-1">
                {article.affectedIndustries.map((industry, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-1 bg-muted rounded text-xs"
                  >
                    {industry}
                  </span>
                ))}
              </div>
            </div>
          )}

          {article.regulatoryBodies && article.regulatoryBodies.length > 0 && (
            <div>
              <div className="flex items-center gap-1 mb-1">
                <Scale className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium text-muted-foreground">
                  Regulatory Bodies:
                </span>
              </div>
              <div className="flex flex-wrap gap-1">
                {article.regulatoryBodies.map((body, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-1 bg-primary/10 text-primary rounded text-xs"
                  >
                    {body}
                  </span>
                ))}
              </div>
            </div>
          )}

          {article.actionItems && article.actionItems.length > 0 && (
            <div>
              <div className="flex items-center gap-1 mb-1">
                <Zap className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium text-muted-foreground">
                  Action Items:
                </span>
              </div>
              <ul className="list-disc list-inside space-y-1 text-sm text-card-foreground">
                {article.actionItems.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>
          )}

          {article.timeline && (
            <div>
              <div className="flex items-center gap-1 mb-1">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium text-muted-foreground">
                  Timeline:
                </span>
              </div>
              <span className="text-sm text-card-foreground">{article.timeline}</span>
            </div>
          )}

          {article.enforcementActions && article.enforcementActions.length > 0 && (
            <div>
              <div className="flex items-center gap-1 mb-1">
                <AlertTriangle className="h-4 w-4 text-status-warning" />
                <span className="text-sm font-medium text-muted-foreground">
                  Enforcement Actions:
                </span>
              </div>
              <ul className="list-disc list-inside space-y-1 text-sm text-card-foreground">
                {article.enforcementActions.map((action, idx) => (
                  <li key={idx} className="text-status-warning">{action}</li>
                ))}
              </ul>
            </div>
          )}

          {article.geographicRegions && article.geographicRegions.length > 0 && (
            <div>
              <div className="flex items-center gap-1 mb-1">
                <Globe className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium text-muted-foreground">
                  Geographic Regions:
                </span>
              </div>
              <div className="flex flex-wrap gap-1">
                {article.geographicRegions.map((region, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-1 bg-muted rounded text-xs"
                  >
                    {region}
                  </span>
                ))}
              </div>
            </div>
          )}

          {article.complexityLevel && (
            <div>
              <span className="text-sm font-medium text-muted-foreground">
                Complexity:{" "}
              </span>
              <span className="text-sm text-card-foreground capitalize">
                {article.complexityLevel}
              </span>
            </div>
          )}

          {article.impactScope && (
            <div>
              <div className="flex items-center gap-1 mb-1">
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium text-muted-foreground">
                  Impact Scope:{" "}
                </span>
                <span className="text-sm text-card-foreground capitalize">
                  {article.impactScope}
                </span>
              </div>
            </div>
          )}

          <div>
            <span className="text-sm font-medium text-muted-foreground">
              Source:{" "}
            </span>
            <span className="text-sm text-card-foreground">{article.source}</span>
          </div>
          {article.author && (
            <div>
              <span className="text-sm font-medium text-muted-foreground">
                Author:{" "}
              </span>
              <span className="text-sm text-card-foreground">{article.author}</span>
            </div>
          )}
          <div>
            <span className="text-sm font-medium text-muted-foreground">
              Category:{" "}
            </span>
            <span className="text-sm text-card-foreground">{article.category}</span>
          </div>
        </div>
      )}

      {/* Expand/Collapse Button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="mt-4 text-sm text-primary hover:underline"
      >
        {isExpanded ? "Show Less" : "Show More"}
      </button>
    </div>
  );
}

