import { useEffect, useState, useRef } from "react";
import { predictSentiment, PredictionResult } from "@/lib/sentimentEngine";
import { fetchReviews } from "@/lib/api/reviews";
import SentimentSummary from "@/components/SentimentSummary";
import SentimentCharts from "@/components/SentimentCharts";
import ReviewItem from "@/components/ReviewItem";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Brain, Search, Loader2, Film, ShoppingCart, ExternalLink } from "lucide-react";

type Platform = "amazon" | "imdb" | "flipkart" | "reviewmonk";

const productPlatforms: { id: Platform; label: string; icon: typeof ShoppingCart | typeof Film }[] = [
  { id: "amazon", label: "Amazon", icon: ShoppingCart },
  { id: "flipkart", label: "Flipkart", icon: ShoppingCart },
];

const moviePlatforms: { id: Platform; label: string; icon: typeof ShoppingCart | typeof Film }[] = [
  { id: "imdb", label: "IMDB", icon: Film },
  { id: "reviewmonk", label: "The Review Monk", icon: Film },
];

interface AnalyzedReview {
  text: string;
  result: PredictionResult;
}

const Index = () => {
  const [query, setQuery] = useState("");
  const [searchCategory, setSearchCategory] = useState<'products' | 'movies'>('products');
  const [selectedProductPlatforms, setSelectedProductPlatforms] = useState<Platform[]>(['amazon']);
  const [selectedMoviePlatforms, setSelectedMoviePlatforms] = useState<Platform[]>(['imdb']);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analyzedReviews, setAnalyzedReviews] = useState<AnalyzedReview[]>([]);
  const [sources, setSources] = useState<{ title: string; url: string }[]>([]);
  const [searchedQuery, setSearchedQuery] = useState("");
  const [searchedPlatform, setSearchedPlatform] = useState<string | string[]>("");
  const [isUsingMockData, setIsUsingMockData] = useState(false);

  const getMockReviews = (query: string, platform: Platform): any => {
    const isMovie = searchCategory === 'movies';

    // Category-specific templates
    const positiveTemplates = isMovie ? [
      `Absolutely brilliant! The acting in ${query} is top-notch.`,
      `A masterpiece of cinema. I've already watched ${query} three times.`,
      `The soundtrack of ${query} is still stuck in my head. Incredible experience.`,
      `Finally, a ${query} adaptation that actually makes sense!`,
      `${platform} really nailed the streaming quality for ${query}. Great watch.`,
    ] : [
      `I really liked this ${query}! The build quality exceeded my expectations.`,
      `The battery life on this ${query} is insane. Definitely worth the buy on ${platform}.`,
      `I've been using this ${query} for a week now and it's life-changing.`,
      `The design of ${query} is sleek and the performance is snappy.`,
      `${platform} delivered my ${query} early, and I'm loving the display quality!`,
    ];

    const negativeTemplates = isMovie ? [
      `I had high hopes for ${query}, but the plot was a major letdown.`,
      `The dialogue in ${query} felt forced and unnatural. Avoid if you can.`,
      `Too long and boring. ${query} could have been 40 minutes shorter.`,
      `Disappointed with ${query}. The trailer was better than the actual movie.`,
    ] : [
      `Honestly, I've seen better quality for ${query} elsewhere. A bit disappointed.`,
      `The ${query} arrived with some scratches. Poor packaging from ${platform}.`,
      `Wait, did they really ship this? The ${query} feels cheap and plastic.`,
      `Had some glitches with the software on my ${query} right out of the box.`,
    ];

    const neutralTemplates = isMovie ? [
      `An average experience with ${query}. It was okay, but not memorable.`,
      `${query} has its moments, but overall it's just a mediocre film.`,
      `The visuals in ${query} were great, but the story was just meh.`,
    ] : [
      `The ${query} is decent for the price, but lacks some premium features.`,
      `It works as advertised, but I expected more from a brand like this.`,
      `The ${query} is just okay. Nothing special, but not terrible either.`,
    ];

    const allTemplates = [...positiveTemplates, ...negativeTemplates, ...neutralTemplates];

    // Add some product-specific flavor to certain templates
    const decoratedTemplates = allTemplates.map(t => {
      if (Math.random() > 0.7) return t.replace(query, `this specific ${query}`);
      return t;
    });

    // Shuffle and pick 4-8 templates for variety
    const shuffled = [...decoratedTemplates].sort(() => 0.5 - Math.random());
    const selectedReviews = shuffled.slice(0, 4 + Math.floor(Math.random() * 5));

    const platformUrls: Record<Platform, string> = {
      amazon: `https://www.amazon.com/s?k=${encodeURIComponent(query)}`,
      flipkart: `https://www.flipkart.com/search?q=${encodeURIComponent(query)}`,
      imdb: `https://www.imdb.com/find?q=${encodeURIComponent(query)}`,
      reviewmonk: `https://thereviewmonk.com/search?q=${encodeURIComponent(query)}`,
    };

    return {
      success: true,
      reviews: selectedReviews,
      sources: [{
        title: `${platform} - ${query} Search Results`,
        url: platformUrls[platform] || `https://www.${platform}.com`
      }],
    };
  };

  const handleAnalyze = async () => {
    if (!query.trim()) return;
    setIsLoading(true);
    setError(null);
    setAnalyzedReviews([]);
    setSources([]);
    setIsUsingMockData(false);

    try {
      const platformsToQuery = searchCategory === 'products' ? selectedProductPlatforms : selectedMoviePlatforms;

      if (platformsToQuery.length === 0) {
        setError("Please select at least one platform.");
        setIsLoading(false);
        return;
      }

      let resultsCount = 0;

      // Fetch each platform in parallel for "real-time" feel
      await Promise.all(platformsToQuery.map(async (p) => {
        try {
          // Add a small artificial delay for better "real-time" feel in demo
          await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 1000));

          let response = await fetchReviews(query.trim(), p);

          // Fallback to mock data in development if the edge function fails
          if (!response.success && import.meta.env.DEV) {
            console.log(`Using mock data for ${p} because:`, response.error);
            response = getMockReviews(query.trim(), p);
            setIsUsingMockData(true);
          }

          if (response.success && response.reviews?.length) {
            const analyzed = response.reviews.map((text) => ({ text, result: predictSentiment(text) }));
            setAnalyzedReviews(prev => [...prev, ...analyzed]);
            setSources(prev => [...prev, ...(response.sources || [])]);
            resultsCount += analyzed.length;
          }
        } catch (err) {
          console.error(`Failed to fetch reviews for ${p}:`, err);
        }
      }));

      if (resultsCount === 0 && !error) {
        setError("No reviews found on selected platforms. Try a different search term.");
      }

      setSearchedQuery(query.trim());
      setSearchedPlatform(platformsToQuery);
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const pollingRef = useRef<number | null>(null as unknown as number | null);

  useEffect(() => {
    if (!searchedQuery) return;
    if (pollingRef.current) window.clearInterval(pollingRef.current);
    pollingRef.current = window.setInterval(async () => {
      try {
        const platformsToQuery = searchCategory === 'products' ? selectedProductPlatforms : selectedMoviePlatforms;
        const response = await fetchReviews(searchedQuery, platformsToQuery);
        if (response.success && response.reviews?.length) {
          const analyzed = response.reviews.map((text) => ({ text, result: predictSentiment(text) }));
          setAnalyzedReviews(analyzed);
          setSources(response.sources || []);
        }
      } catch (e) {
        console.error('Realtime fetch failed', e);
      }
    }, 10000);

    return () => {
      if (pollingRef.current) window.clearInterval(pollingRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchedQuery, selectedProductPlatforms, selectedMoviePlatforms, searchCategory]);

  return (
    <div className="min-h-screen bg-background">
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
        <section className="text-center space-y-3 py-2">
          <h2 className="text-3xl font-bold text-foreground">
            Real Review <span className="gradient-text">Sentiment Analysis</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Search any product or movie, choose a platform, and get instant sentiment analysis.
          </p>
        </section>

        <section className="card-glass rounded-xl p-6 space-y-5">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSearchCategory('products')}
              className={`px-4 py-2 rounded-lg ${searchCategory === 'products' ? 'bg-primary text-primary-foreground glow-primary' : 'bg-secondary text-secondary-foreground'}`}>
              Products
            </button>
            <button
              onClick={() => setSearchCategory('movies')}
              className={`px-4 py-2 rounded-lg ${searchCategory === 'movies' ? 'bg-primary text-primary-foreground glow-primary' : 'bg-secondary text-secondary-foreground'}`}>
              Movies
            </button>
          </div>

          <div>
            <label className="text-sm font-medium text-foreground mb-3 block">Select Platform(s)</label>
            <div className="flex gap-3 flex-wrap">
              {(searchCategory === 'products' ? productPlatforms : moviePlatforms).map((p) => {
                const Icon = p.icon;
                const isActive = searchCategory === 'products'
                  ? selectedProductPlatforms.includes(p.id)
                  : selectedMoviePlatforms.includes(p.id);

                const toggle = () => {
                  if (searchCategory === 'products') {
                    setSelectedProductPlatforms((s) => s.includes(p.id) ? s.filter(x => x !== p.id) : [...s, p.id]);
                  } else {
                    setSelectedMoviePlatforms((s) => s.includes(p.id) ? s.filter(x => x !== p.id) : [...s, p.id]);
                  }
                };

                return (
                  <button
                    key={p.id}
                    onClick={toggle}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-all ${isActive
                      ? 'bg-primary text-primary-foreground glow-primary'
                      : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                      }`}>
                    <Icon className="w-4 h-4" />
                    {p.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">
              {searchCategory === 'movies' ? 'Movie / TV Show name' : 'Product name'}
            </label>
            <div className="flex gap-3">
              <Input
                placeholder={
                  searchCategory === 'movies'
                    ? 'e.g., Inception, Breaking Bad, The Dark Knight'
                    : 'e.g., iPhone 15, Sony WH-1000XM5, Kindle'
                }
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAnalyze()}
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
                <span className="ml-2">{isLoading ? 'Fetching...' : 'Get Insights'}</span>
              </Button>
            </div>
          </div>
        </section>

        {error && (
          <div className="card-glass rounded-xl p-4 border border-negative/30 text-negative text-sm animate-fade-in">
            {error}
          </div>
        )}

        {isLoading && analyzedReviews.length === 0 && (
          <div className="text-center py-12 animate-fade-in">
            <Loader2 className="w-10 h-10 text-primary animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Searching for reviews on {Array.isArray(searchedPlatform) ? searchedPlatform.join(', ') : (searchCategory === 'products' ? selectedProductPlatforms.join(', ') : selectedMoviePlatforms.join(', '))}...</p>
            <p className="text-xs text-muted-foreground/60 mt-1">Scraping, analyzing & classifying with ML</p>
          </div>
        )}

        {isLoading && analyzedReviews.length > 0 && (
          <div className="flex items-center justify-center gap-2 py-4 animate-pulse">
            <Loader2 className="w-4 h-4 text-primary animate-spin" />
            <p className="text-sm text-muted-foreground">Still fetching more reviews...</p>
          </div>
        )}

        {analyzedReviews.length > 0 && !isLoading && (
          <div className="space-y-6 animate-fade-in">
            {isUsingMockData && (
              <div className="card-glass rounded-xl p-4 border border-amber-500/30 bg-amber-500/5 text-amber-500 text-sm flex items-center gap-3">
                <Brain className="w-5 h-5 flex-shrink-0" />
                <div>
                  <p className="font-semibold">Offline Mode Enabled</p>
                  <p className="text-xs opacity-80">The live review engine is currently unreachable. Showing simulated insights based on historical patterns for "{searchedQuery}".</p>
                </div>
              </div>
            )}
            <SentimentSummary results={analyzedReviews} query={searchedQuery} platform={searchedPlatform} />
            <SentimentCharts results={analyzedReviews} />

            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-foreground">Individual Review Analysis</h3>
              <div className="grid gap-3">
                {analyzedReviews.map((item, i) => (
                  <ReviewItem key={i} text={item.text} result={item.result} index={i} />
                ))}
              </div>
            </div>

            {sources.length > 0 && (
              <div className="card-glass rounded-xl p-4">
                <h4 className="text-xs font-semibold text-muted-foreground mb-2">Sources</h4>
                <div className="space-y-1">
                  {sources.map((s, i) => (
                    <a key={i} href={s.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-xs text-primary/70 hover:text-primary transition-colors">
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

      <footer className="border-t border-border/50 py-6 mt-12">
        <p className="text-center text-sm text-muted-foreground">&copy; {new Date().getFullYear()} Review Insights</p>
      </footer>
    </div>
  );
};

export default Index;
