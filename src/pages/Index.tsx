import { useState } from "react";
import { PredictionResult, predictSentiment, getTrainingStats } from "@/lib/sentimentEngine";
import ResultCard from "@/components/ResultCard";
import SentimentCharts from "@/components/SentimentCharts";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Brain, Sparkles, BarChart3 } from "lucide-react";

const Index = () => {
  const [reviewText, setReviewText] = useState("");
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [history, setHistory] = useState<PredictionResult[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleAnalyze = () => {
    if (!reviewText.trim()) return;
    setIsAnalyzing(true);
    // Small delay for UX feel
    setTimeout(() => {
      const prediction = predictSentiment(reviewText.trim());
      setResult(prediction);
      setHistory((prev) => [...prev, prediction]);
      setIsAnalyzing(false);
    }, 600);
  };

  const stats = getTrainingStats();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 py-6">
        <div className="container max-w-4xl mx-auto px-4">
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

      <main className="container max-w-4xl mx-auto px-4 py-8 space-y-8">
        {/* Hero Section */}
        <section className="text-center space-y-4 py-4">
          <h2 className="text-3xl font-bold text-foreground">
            Sentiment Analysis <span className="gradient-text">Powered by ML</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Enter any product review and our NLP pipeline will classify it as Positive, Negative, or Neutral
            using TF-IDF vectorization and a trained classifier with confidence scoring.
          </p>
          <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground pt-2">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-primary" />
              {stats.total} training samples
            </span>
            <span className="flex items-center gap-1.5">
              <BarChart3 className="w-4 h-4 text-accent" />
              TF-IDF + Naive Bayes
            </span>
          </div>
        </section>

        {/* Input Section */}
        <section className="card-glass rounded-xl p-6 space-y-4">
          <label className="text-sm font-medium text-foreground">Enter your review</label>
          <Textarea
            placeholder="e.g., This product is absolutely amazing, best purchase ever!"
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
            className="min-h-[120px] bg-background/50 border-border/50 text-foreground placeholder:text-muted-foreground/50 resize-none focus:ring-primary/30"
          />
          <Button
            onClick={handleAnalyze}
            disabled={!reviewText.trim() || isAnalyzing}
            className="w-full py-6 text-base font-semibold bg-primary text-primary-foreground hover:bg-primary/90 glow-primary transition-all"
          >
            {isAnalyzing ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                Analyzing...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Brain className="w-5 h-5" />
                Get Insights
              </span>
            )}
          </Button>
        </section>

        {/* Results */}
        {result && (
          <div className="space-y-6 animate-fade-in">
            <ResultCard result={result} reviewText={reviewText} />
            <SentimentCharts history={history} currentResult={result} />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 py-6 mt-12">
        <p className="text-center text-sm text-muted-foreground">
          Academic Project &bull; Built with ML &amp; NLP &bull; TF-IDF + Naive Bayes Classifier
        </p>
      </footer>
    </div>
  );
};

export default Index;
