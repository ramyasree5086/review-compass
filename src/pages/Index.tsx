import { useState } from "react";
import { predictSentiment, PredictionResult } from "@/lib/sentimentEngine";
import { fetchReviews } from "@/lib/api/reviews";
import SentimentSummary from "@/components/SentimentSummary";
import SentimentCharts from "@/components/SentimentCharts";
import ReviewItem from "@/components/ReviewItem";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Brain, Search, Loader2, Film, ShoppingCart, ExternalLink } from "lucide-react";

type Platform = "amazon" | "imdb";

const platforms: { id: Platform; label: string; icon: typeof ShoppingCart }[] = [
  { id: "amazon", label: "Amazon", icon: ShoppingCart },
  { id: "imdb", label: "IMDB", icon: Film },
];

interface AnalyzedReview {
  text: string;
  result: PredictionResult;
}

const Index = () => {
  const [query, setQuery] = useState("");
  const [platform, setPlatform] = useState<Platform>("amazon");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analyzedReviews, setAnalyzedReviews] = useState<AnalyzedReview[]>([]);
  const [sources, setSources] = useState<{ title: string; url: string }[]>([]);
  const [searchedQuery, setSearchedQuery] = useState("");
  const [searchedPlatform, setSearchedPlatform] = useState("");

  const handleAnalyze = async () => {
    if (!query.trim()) return;
    setIsLoading(true);
    setError(null);
    setAnalyzedReviews([]);
    setSources([]);

    try {
      const response = await fetchReviews(query.trim(), platform);

      if (!response.success || !response.reviews?.length) {
        setError(response.error || "No reviews found. Try a different search term.");
        setIsLoading(false);
        return;
      }

      // Analyze each review with our sentiment engine
      const analyzed = response.reviews.map((text) => ({
        text,
        result: predictSentiment(text),
      }));

      setAnalyzedReviews(analyzed);
      setSources(response.sources || []);
      setSearchedQuery(query.trim());
      setSearchedPlatform(platform);
    } catch (err) {
      setError("Failed to fetch reviews. Please try again.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 py-6">
        <div className="container max-w-5xl mx-auto px-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10 glow-primary">
              <Brain className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold gradient-text">Review Insights</h1>
              <p className="text-sm text-muted-foreground">Turning reviews into meaningful insights</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container max-w-5xl mx-auto px-4 py-8 space-y-8">
        {/* Hero */}
        <section className="text-center space-y-3 py-2">
          <h2 className="text-3xl font-bold text-foreground">
            Real Review <span className="gradient-text">Sentiment Analysis</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Search any product or movie, choose a platform, and get instant sentiment analysis.
          </p>
        </section>

        {/* Search Section */}
        <section className="card-glass rounded-xl p-6 space-y-5">
          {/* Platform Selection */}
          <div>
            <label className="text-sm font-medium text-foreground mb-3 block">Select Platform</label>
            <div className="flex gap-3">
              {platforms.map((p) => {
                const Icon = p.icon;
                const isActive = platform === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => setPlatform(p.id)}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium text-sm transition-all ${isActive
                      ? "bg-primary text-primary-foreground glow-primary"
                      : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                      }`}
                  >
                    <Icon className="w-4 h-4" />
                    {p.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Search Input */}
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">
              {platform === "imdb" ? "Movie / TV Show name" : "Product name"}
            </label>
            <div className="flex gap-3">
              <Input
                placeholder={
                  platform === "imdb"
                    ? "e.g., Inception, Breaking Bad, The Dark Knight"
                    : "e.g., iPhone 15, Sony WH-1000XM5, Kindle"
                }
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAnalyze()}
                className="flex-1 bg-background/50 border-border/50"
              />
              <Button
                onClick={handleAnalyze}
                disabled={!query.trim() || isLoading}
                className="px-6 bg-primary text-primary-foreground hover:bg-primary/90 glow-primary"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Search className="w-4 h-4" />
                )}
                <span className="ml-2">{isLoading ? "Fetching..." : "Get Insights"}</span>
              </Button>
            </div>
          </div>
        </section>

        {/* Error */}
        {error && (
          <div className="card-glass rounded-xl p-4 border border-negative/30 text-negative text-sm animate-fade-in">
            {error}
          </div>
        )}

        {/* Loading state */}
        {isLoading && (
          <div className="text-center py-12 animate-fade-in">
            <Loader2 className="w-10 h-10 text-primary animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Searching for reviews on {platform === "imdb" ? "IMDB" : "Amazon"}...</p>
            <p className="text-xs text-muted-foreground/60 mt-1">Scraping, analyzing & classifying with ML</p>
          </div>
        )}

        {/* Results */}
        {analyzedReviews.length > 0 && !isLoading && (
          <div className="space-y-6 animate-fade-in">
            {/* Summary */}
            <SentimentSummary
              results={analyzedReviews}
              query={searchedQuery}
              platform={searchedPlatform}
            />

            {/* Charts */}
            <SentimentCharts results={analyzedReviews} />

            {/* Individual Reviews */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-foreground">
                Individual Review Analysis
              </h3>
              <div className="grid gap-3">
                {analyzedReviews.map((item, i) => (
                  <ReviewItem key={i} text={item.text} result={item.result} index={i} />
                ))}
              </div>
            </div>

            {/* Sources */}
            {sources.length > 0 && (
              <div className="card-glass rounded-xl p-4">
                <h4 className="text-xs font-semibold text-muted-foreground mb-2">Sources</h4>
                <div className="space-y-1">
                  {sources.map((s, i) => (
                    <a
                      key={i}
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-xs text-primary/70 hover:text-primary transition-colors"
                    >
                      <ExternalLink className="w-3 h-3" />
                      {s.title}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 py-6 mt-12">
        <p className="text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} Review Insights
        </p>
      </footer>
    </div>
  );
};

export default Index;
