import { PredictionResult } from "@/lib/sentimentEngine";
import { ThumbsUp, ThumbsDown, Minus, TrendingUp } from "lucide-react";

interface SentimentSummaryProps {
  results: { text: string; result: PredictionResult }[];
  query: string;
  platform: string;
}

const SentimentSummary = ({ results, query, platform }: SentimentSummaryProps) => {
  const counts = { Positive: 0, Negative: 0, Neutral: 0 };
  for (const r of results) {
    counts[r.result.label]++;
  }

  const total = results.length;
  const dominant = (Object.entries(counts) as [string, number][])
    .sort((a, b) => b[1] - a[1])[0];

  const dominantLabel = dominant[0] as "Positive" | "Negative" | "Neutral";

  const config = {
    Positive: { icon: ThumbsUp, colorClass: "text-positive", bgClass: "bg-positive/10", borderClass: "border-positive/30", glowClass: "glow-positive", emoji: "👍" },
    Negative: { icon: ThumbsDown, colorClass: "text-negative", bgClass: "bg-negative/10", borderClass: "border-negative/30", glowClass: "glow-negative", emoji: "👎" },
    Neutral: { icon: Minus, colorClass: "text-neutral", bgClass: "bg-neutral/10", borderClass: "border-neutral/30", glowClass: "glow-neutral", emoji: "😐" },
  };

  const c = config[dominantLabel];
  const Icon = c.icon;
  const percentage = ((dominant[1] / total) * 100).toFixed(0);

  const platformLabels: Record<string, string> = {
    amazon: "Amazon",
    imdb: "IMDB",
  };

  return (
    <div className={`card-glass rounded-xl p-6 border ${c.borderClass} ${c.glowClass}`}>
      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4">
        <TrendingUp className="w-3.5 h-3.5 text-primary" />
        <span>Overall Sentiment for <strong className="text-foreground">"{query}"</strong> on {platformLabels[platform] || platform}</span>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className={`p-4 rounded-xl ${c.bgClass}`}>
            <Icon className={`w-8 h-8 ${c.colorClass}`} />
          </div>
          <div>
            <p className={`text-3xl font-bold ${c.colorClass}`}>
              {dominantLabel} {c.emoji}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {percentage}% of {total} reviews are {dominantLabel.toLowerCase()}
            </p>
          </div>
        </div>

        {/* Mini stats */}
        <div className="flex gap-4">
          {(["Positive", "Negative", "Neutral"] as const).map((label) => (
            <div key={label} className="text-center">
              <p className={`text-xl font-bold font-mono ${config[label].colorClass}`}>
                {counts[label]}
              </p>
              <p className="text-xs text-muted-foreground">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SentimentSummary;
