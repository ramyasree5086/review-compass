import { PredictionResult } from "@/lib/sentimentEngine";
import { ThumbsUp, ThumbsDown, Minus } from "lucide-react";

interface ReviewItemProps {
  text: string;
  result: PredictionResult;
  index: number;
}

const sentimentConfig = {
  Positive: {
    icon: ThumbsUp,
    colorClass: "text-positive",
    bgClass: "bg-positive/10",
    borderClass: "border-positive/30",
  },
  Negative: {
    icon: ThumbsDown,
    colorClass: "text-negative",
    bgClass: "bg-negative/10",
    borderClass: "border-negative/30",
  },
  Neutral: {
    icon: Minus,
    colorClass: "text-neutral",
    bgClass: "bg-neutral/10",
    borderClass: "border-neutral/30",
  },
};

const ReviewItem = ({ text, result, index }: ReviewItemProps) => {
  const config = sentimentConfig[result.label];
  const Icon = config.icon;

  return (
    <div
      className={`card-glass rounded-lg p-4 border ${config.borderClass} animate-fade-in`}
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <div className="flex items-start gap-3">
        <div className={`p-1.5 rounded-md ${config.bgClass} mt-0.5 shrink-0`}>
          <Icon className={`w-4 h-4 ${config.colorClass}`} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm text-foreground/80 leading-relaxed line-clamp-3">"{text}"</p>
          <div className="flex items-center gap-3 mt-2">
            <span className={`text-xs font-semibold ${config.colorClass}`}>{result.label}</span>
            <span className="text-xs text-muted-foreground font-mono">
              {(result.confidence * 100).toFixed(0)}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewItem;
