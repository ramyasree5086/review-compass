import { PredictionResult } from "@/lib/sentimentEngine";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  PieChart, Pie, Cell, ResponsiveContainer, Legend,
} from "recharts";

interface SentimentChartsProps {
  history: PredictionResult[];
  currentResult: PredictionResult;
}

const COLORS = {
  Positive: "hsl(142, 70%, 45%)",
  Negative: "hsl(0, 72%, 55%)",
  Neutral: "hsl(45, 80%, 55%)",
};

const SentimentCharts = ({ history, currentResult }: SentimentChartsProps) => {
  // Count history
  const counts = { Positive: 0, Negative: 0, Neutral: 0 };
  for (const r of history) {
    counts[r.label]++;
  }

  const barData = [
    { name: "Positive", count: counts.Positive, fill: COLORS.Positive },
    { name: "Negative", count: counts.Negative, fill: COLORS.Negative },
    { name: "Neutral", count: counts.Neutral, fill: COLORS.Neutral },
  ];

  const total = history.length || 1;
  const pieData = [
    { name: "Positive", value: parseFloat(((counts.Positive / total) * 100).toFixed(1)), fill: COLORS.Positive },
    { name: "Negative", value: parseFloat(((counts.Negative / total) * 100).toFixed(1)), fill: COLORS.Negative },
    { name: "Neutral", value: parseFloat(((counts.Neutral / total) * 100).toFixed(1)), fill: COLORS.Neutral },
  ].filter((d) => d.value > 0);

  // Current probabilities for pie
  const probPieData = [
    { name: "Positive", value: parseFloat((currentResult.probabilities.Positive * 100).toFixed(1)), fill: COLORS.Positive },
    { name: "Negative", value: parseFloat((currentResult.probabilities.Negative * 100).toFixed(1)), fill: COLORS.Negative },
    { name: "Neutral", value: parseFloat((currentResult.probabilities.Neutral * 100).toFixed(1)), fill: COLORS.Neutral },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Bar Chart - Review Distribution */}
      <div className="card-glass rounded-xl p-5">
        <h3 className="text-sm font-semibold text-foreground mb-4">
          Review Distribution ({history.length} total)
        </h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={barData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(222, 30%, 18%)" />
            <XAxis dataKey="name" tick={{ fill: "hsl(215, 20%, 55%)", fontSize: 12 }} />
            <YAxis allowDecimals={false} tick={{ fill: "hsl(215, 20%, 55%)", fontSize: 12 }} />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(222, 40%, 10%)",
                border: "1px solid hsl(222, 30%, 18%)",
                borderRadius: "8px",
                color: "hsl(210, 40%, 93%)",
              }}
            />
            <Bar dataKey="count" radius={[6, 6, 0, 0]}>
              {barData.map((entry, index) => (
                <Cell key={index} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Pie Chart - Current Prediction Probabilities */}
      <div className="card-glass rounded-xl p-5">
        <h3 className="text-sm font-semibold text-foreground mb-4">
          Prediction Confidence Breakdown
        </h3>
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={probPieData}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={90}
              paddingAngle={3}
              dataKey="value"
              label={({ name, value }) => `${name}: ${value}%`}
              labelLine={{ stroke: "hsl(215, 20%, 55%)" }}
            >
              {probPieData.map((entry, index) => (
                <Cell key={index} fill={entry.fill} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(222, 40%, 10%)",
                border: "1px solid hsl(222, 30%, 18%)",
                borderRadius: "8px",
                color: "hsl(210, 40%, 93%)",
              }}
              formatter={(value: number) => `${value}%`}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default SentimentCharts;
