import { PredictionResult } from "@/lib/sentimentEngine";
import { ThumbsUp, ThumbsDown, Minus, Cpu, Shield } from "lucide-react";

interface ResultCardProps {
  result: PredictionResult;
  reviewText: string;
}

const sentimentConfig = {
  Positive: {
    icon: ThumbsUp,
    colorClass: "text-positive",
    bgClass: "bg-positive/10",
    borderClass: "border-positive/30",
    glowClass: "glow-positive",
    label: "Positive",
  },
  Negative: {
    icon: ThumbsDown,
    colorClass: "text-negative",
    bgClass: "bg-negative/10",
    borderClass: "border-negative/30",
    glowClass: "glow-negative",
    label: "Negative",
  },
  Neutral: {
    icon: Minus,
    colorClass: "text-neutral",
    bgClass: "bg-neutral/10",
    borderClass: "border-neutral/30",
    glowClass: "glow-neutral",
    label: "Neutral",
  },
};

const ResultCard = ({ result, reviewText }: ResultCardProps) => {
  const config = sentimentConfig[result.label];
  const Icon = config.icon;
  const confidencePercent = (result.confidence * 100).toFixed(1);

  return (
    <div className={`card-glass rounded-xl p-6 border ${config.borderClass} ${config.glowClass} space-y-5`}>
      {/* Sentiment Label */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`p-3 rounded-lg ${config.bgClass}`}>
            <Icon className={`w-7 h-7 ${config.colorClass}`} />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Review Type</p>
            <p className={`text-2xl font-bold ${config.colorClass}`}>{config.label}</p>
          </div>
        </div>

        {/* Confidence */}
        <div className="text-right">
          <p className="text-sm text-muted-foreground">Confidence</p>
          <p className={`text-3xl font-bold font-mono ${config.colorClass}`}>{confidencePercent}%</p>
        </div>
      </div>

      {/* Confidence Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Confidence Score</span>
          <span>{confidencePercent}%</span>
        </div>
        <div className="h-2 bg-secondary rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-700 ease-out ${result.label === "Positive" ? "bg-positive" :
              result.label === "Negative" ? "bg-negative" : "bg-neutral"
              }`}
            style={{ width: `${result.confidence * 100}%` }}
          />
        </div>
      </div>

      {/* Probabilities */}
      <div className="grid grid-cols-3 gap-3">
        {(["Positive", "Negative", "Neutral"] as const).map((label) => (
          <div
            key={label}
            className={`rounded-lg p-3 text-center ${result.label === label ? sentimentConfig[label].bgClass : "bg-secondary/50"
              }`}
          >
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className={`text-lg font-mono font-semibold ${result.label === label ? sentimentConfig[label].colorClass : "text-foreground/60"
              }`}>
              {(result.probabilities[label] * 100).toFixed(1)}%
            </p>
          </div>
        ))}
      </div>

      {/* Reviewed text */}
      <div className="bg-secondary/30 rounded-lg p-3">
        <p className="text-xs text-muted-foreground mb-1">Analyzed Review</p>
        <p className="text-sm text-foreground/80 italic">"{reviewText}"</p>
      </div>
    </div>
  );
};

export default ResultCard;
