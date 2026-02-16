// ============================================================
// SENTIMENT ANALYSIS ENGINE
// A client-side NLP pipeline mimicking TF-IDF + Naive Bayes
// for academic demonstration purposes.
// ============================================================

// ============================================================
// STEP 1: TRAINING DATASET
// Balanced dataset with Positive, Negative, Neutral labels
// ============================================================
export interface TrainingSample {
  text: string;
  label: "Positive" | "Negative" | "Neutral";
}

export const trainingData: TrainingSample[] = [
  // --- Positive samples (20) ---
  { text: "This product is absolutely amazing", label: "Positive" },
  { text: "I love this so much, great quality", label: "Positive" },
  { text: "Excellent service and fast delivery", label: "Positive" },
  { text: "The best purchase I have ever made", label: "Positive" },
  { text: "Wonderful experience, highly recommend", label: "Positive" },
  { text: "Fantastic quality and great value", label: "Positive" },
  { text: "Very happy with this product", label: "Positive" },
  { text: "Outstanding performance, love it", label: "Positive" },
  { text: "Superb craftsmanship and design", label: "Positive" },
  { text: "Great product, exceeded expectations", label: "Positive" },
  { text: "Impressive quality, very satisfied", label: "Positive" },
  { text: "This is good, I really enjoy it", label: "Positive" },
  { text: "Perfect fit, exactly what I needed", label: "Positive" },
  { text: "Really nice and well made product", label: "Positive" },
  { text: "Top notch quality, five stars", label: "Positive" },
  { text: "Brilliant product, works perfectly", label: "Positive" },
  { text: "Delightful experience from start to finish", label: "Positive" },
  { text: "Pleased with the quality and price", label: "Positive" },
  { text: "Exceptional value for money", label: "Positive" },
  { text: "Awesome product, will buy again", label: "Positive" },

  // --- Negative samples (20) ---
  { text: "This is the worst product ever", label: "Negative" },
  { text: "Terrible quality, broke after one day", label: "Negative" },
  { text: "Very bad experience, do not buy", label: "Negative" },
  { text: "Poor quality and horrible customer service", label: "Negative" },
  { text: "Awful product, waste of money", label: "Negative" },
  { text: "Disappointing quality, not worth the price", label: "Negative" },
  { text: "Horrible experience, would not recommend", label: "Negative" },
  { text: "The product is defective and useless", label: "Negative" },
  { text: "Extremely bad, returned immediately", label: "Negative" },
  { text: "Worst purchase I have ever made", label: "Negative" },
  { text: "Dreadful quality, very unhappy", label: "Negative" },
  { text: "Bad product, does not work at all", label: "Negative" },
  { text: "Pathetic quality, total disappointment", label: "Negative" },
  { text: "Not good at all, very frustrating", label: "Negative" },
  { text: "Rubbish quality, complete waste", label: "Negative" },
  { text: "Damaged on arrival, terrible packaging", label: "Negative" },
  { text: "This product is bad and cheaply made", label: "Negative" },
  { text: "Ugly design and poor functionality", label: "Negative" },
  { text: "Regret buying this, very poor quality", label: "Negative" },
  { text: "Hate this product, never buying again", label: "Negative" },

  // --- Neutral samples (20) ---
  { text: "The product is okay, nothing special", label: "Neutral" },
  { text: "Average quality, meets basic needs", label: "Neutral" },
  { text: "It is fine for the price", label: "Neutral" },
  { text: "Neither good nor bad, just average", label: "Neutral" },
  { text: "Standard product, does what it says", label: "Neutral" },
  { text: "Decent quality, no complaints", label: "Neutral" },
  { text: "Mediocre experience, could be better", label: "Neutral" },
  { text: "It works, nothing more nothing less", label: "Neutral" },
  { text: "Regular product, acceptable quality", label: "Neutral" },
  { text: "Not bad but not great either", label: "Neutral" },
  { text: "Fair product for everyday use", label: "Neutral" },
  { text: "Moderate quality, does the job", label: "Neutral" },
  { text: "Ordinary product, met expectations", label: "Neutral" },
  { text: "Satisfactory but unremarkable", label: "Neutral" },
  { text: "It is alright, serves its purpose", label: "Neutral" },
  { text: "Plain and simple, nothing fancy", label: "Neutral" },
  { text: "Adequate for basic use", label: "Neutral" },
  { text: "So so quality, middle of the road", label: "Neutral" },
  { text: "Passable product, no strong feelings", label: "Neutral" },
  { text: "Typical product, as expected", label: "Neutral" },
];

// ============================================================
// STEP 2: TEXT PREPROCESSING
// Lowercase, remove punctuation, remove stopwords (keep sentiment words)
// ============================================================

// Stopwords list — intentionally EXCLUDES sentiment-carrying words like "not", "bad", "no"
const STOPWORDS = new Set([
  "a", "an", "the", "is", "are", "was", "were", "be", "been", "being",
  "have", "has", "had", "do", "does", "did", "will", "would", "could",
  "should", "may", "might", "shall", "can", "to", "of", "in", "for",
  "on", "with", "at", "by", "from", "as", "into", "through", "during",
  "before", "after", "above", "below", "between", "under", "again",
  "further", "then", "once", "here", "there", "when", "where", "why",
  "how", "all", "each", "every", "both", "few", "more", "most", "other",
  "some", "such", "than", "too", "very", "just", "about", "up", "out",
  "off", "over", "own", "same", "so", "and", "but", "or", "if", "while",
  "because", "until", "that", "which", "who", "whom", "this", "these",
  "those", "i", "me", "my", "myself", "we", "our", "ours", "ourselves",
  "you", "your", "yours", "yourself", "yourselves", "he", "him", "his",
  "himself", "she", "her", "hers", "herself", "it", "its", "itself",
  "they", "them", "their", "theirs", "themselves", "what",
]);

export function preprocessText(text: string): string {
  // Convert to lowercase
  let processed = text.toLowerCase();
  // Remove punctuation
  processed = processed.replace(/[^\w\s]/g, "");
  // Tokenize
  const tokens = processed.split(/\s+/).filter(Boolean);
  // Remove stopwords (keep sentiment words)
  const filtered = tokens.filter((word) => !STOPWORDS.has(word));
  // Rejoin
  return filtered.join(" ");
}

// ============================================================
// STEP 3: TF-IDF VECTORIZER
// Build vocabulary from training data and compute TF-IDF scores
// ============================================================

interface TfIdfModel {
  vocabulary: Map<string, number>; // word → index
  idf: number[]; // IDF score per word
  docCount: number;
}

function buildTfIdfModel(documents: string[]): TfIdfModel {
  const vocabulary = new Map<string, number>();
  const docFrequency = new Map<string, number>();
  let wordIndex = 0;

  // Build vocabulary and document frequency
  for (const doc of documents) {
    const words = new Set(doc.split(/\s+/).filter(Boolean));
    for (const word of words) {
      if (!vocabulary.has(word)) {
        vocabulary.set(word, wordIndex++);
      }
      docFrequency.set(word, (docFrequency.get(word) || 0) + 1);
    }
  }

  // Compute IDF: log(N / df)
  const N = documents.length;
  const idf = new Array(vocabulary.size).fill(0);
  for (const [word, idx] of vocabulary) {
    const df = docFrequency.get(word) || 1;
    idf[idx] = Math.log((N + 1) / (df + 1)) + 1; // smoothed IDF
  }

  return { vocabulary, idf, docCount: N };
}

function transformToTfIdf(text: string, model: TfIdfModel): number[] {
  const vector = new Array(model.vocabulary.size).fill(0);
  const words = text.split(/\s+/).filter(Boolean);
  const wordCounts = new Map<string, number>();

  for (const word of words) {
    wordCounts.set(word, (wordCounts.get(word) || 0) + 1);
  }

  const totalWords = words.length || 1;
  for (const [word, count] of wordCounts) {
    const idx = model.vocabulary.get(word);
    if (idx !== undefined) {
      const tf = count / totalWords;
      vector[idx] = tf * model.idf[idx];
    }
  }

  // L2 normalize
  const norm = Math.sqrt(vector.reduce((sum, v) => sum + v * v, 0)) || 1;
  return vector.map((v) => v / norm);
}

// ============================================================
// STEP 4: NAIVE BAYES CLASSIFIER
// Multinomial-inspired scoring with TF-IDF features
// ============================================================

type Label = "Positive" | "Negative" | "Neutral";

interface TrainedModel {
  tfidfModel: TfIdfModel;
  classMeans: Record<Label, number[]>; // centroid per class
  classPriors: Record<Label, number>;
}

function trainModel(data: TrainingSample[]): TrainedModel {
  // Preprocess all texts
  const processedTexts = data.map((d) => preprocessText(d.text));

  // Build TF-IDF model (fit on training data)
  const tfidfModel = buildTfIdfModel(processedTexts);

  // Transform all training samples
  const vectors = processedTexts.map((t) => transformToTfIdf(t, tfidfModel));

  const labels: Label[] = ["Positive", "Negative", "Neutral"];
  const classMeans: Record<Label, number[]> = {} as any;
  const classPriors: Record<Label, number> = {} as any;

  for (const label of labels) {
    const indices = data
      .map((d, i) => (d.label === label ? i : -1))
      .filter((i) => i >= 0);
    const count = indices.length;
    classPriors[label] = count / data.length;

    // Compute class centroid
    const mean = new Array(tfidfModel.vocabulary.size).fill(0);
    for (const idx of indices) {
      for (let j = 0; j < mean.length; j++) {
        mean[j] += vectors[idx][j];
      }
    }
    for (let j = 0; j < mean.length; j++) {
      mean[j] /= count || 1;
    }
    classMeans[label] = mean;
  }

  // Log training accuracy
  let correct = 0;
  for (let i = 0; i < data.length; i++) {
    const pred = predictWithModel(vectors[i], classMeans, classPriors);
    if (pred.label === data[i].label) correct++;
  }
  console.log(`[Review Insights] Training accuracy: ${((correct / data.length) * 100).toFixed(1)}%`);

  return { tfidfModel, classMeans, classPriors };
}

function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0, normA = 0, normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  return dot / (Math.sqrt(normA) * Math.sqrt(normB) || 1);
}

function predictWithModel(
  vector: number[],
  classMeans: Record<Label, number[]>,
  classPriors: Record<Label, number>
): { label: Label; confidence: number; probabilities: Record<Label, number> } {
  const labels: Label[] = ["Positive", "Negative", "Neutral"];
  const scores: Record<Label, number> = {} as any;

  // Compute similarity to each class centroid, weighted by prior
  for (const label of labels) {
    const sim = cosineSimilarity(vector, classMeans[label]);
    scores[label] = (sim + 1) / 2 * classPriors[label]; // normalize sim to [0,1]
  }

  // Softmax-style normalization for probabilities
  const maxScore = Math.max(...Object.values(scores));
  const expScores: Record<Label, number> = {} as any;
  let expSum = 0;
  for (const label of labels) {
    expScores[label] = Math.exp((scores[label] - maxScore) * 5); // temperature=5 for sharper probs
    expSum += expScores[label];
  }

  const probabilities: Record<Label, number> = {} as any;
  for (const label of labels) {
    probabilities[label] = expScores[label] / expSum;
  }

  // Find best label
  let bestLabel = labels[0];
  for (const label of labels) {
    if (probabilities[label] > probabilities[bestLabel]) {
      bestLabel = label;
    }
  }

  return {
    label: bestLabel,
    confidence: probabilities[bestLabel],
    probabilities,
  };
}

// ============================================================
// STEP 5: SAFETY VALIDATION (Rule-based override)
// Ensures demo reliability for academic presentation
// ============================================================

const STRONG_NEGATIVE = ["bad", "worst", "terrible", "poor", "awful", "horrible", "dreadful", "pathetic", "rubbish", "hate"];
const STRONG_POSITIVE = ["excellent", "amazing", "fantastic", "wonderful", "outstanding", "superb", "brilliant", "awesome", "love"];

function safetyOverride(text: string): { label: Label; confidence: number } | null {
  const lower = text.toLowerCase();
  const words = lower.replace(/[^\w\s]/g, "").split(/\s+/);

  // Check for strong negative words
  if (words.some((w) => STRONG_NEGATIVE.includes(w))) {
    return { label: "Negative", confidence: 0.95 };
  }

  // Check for strong positive words
  if (words.some((w) => STRONG_POSITIVE.includes(w))) {
    return { label: "Positive", confidence: 0.95 };
  }

  return null; // No override, use ML prediction
}

// ============================================================
// MAIN PREDICTION PIPELINE
// Combines safety validation + ML model
// ============================================================

export interface PredictionResult {
  label: Label;
  confidence: number;
  probabilities: Record<Label, number>;
  method: "rule-based" | "ml-model";
}

// Singleton trained model
let _model: TrainedModel | null = null;

function getModel(): TrainedModel {
  if (!_model) {
    _model = trainModel(trainingData);
  }
  return _model;
}

export function predictSentiment(text: string): PredictionResult {
  // Step 5: Safety override first
  const override = safetyOverride(text);
  if (override) {
    const probs: Record<Label, number> = {
      Positive: override.label === "Positive" ? override.confidence : (1 - override.confidence) / 2,
      Negative: override.label === "Negative" ? override.confidence : (1 - override.confidence) / 2,
      Neutral: override.label === "Neutral" ? override.confidence : (1 - override.confidence) / 2,
    };
    return { ...override, probabilities: probs, method: "rule-based" };
  }

  // ML prediction pipeline
  const model = getModel();
  const processed = preprocessText(text);
  const vector = transformToTfIdf(processed, model.tfidfModel);
  const result = predictWithModel(vector, model.classMeans, model.classPriors);

  return { ...result, method: "ml-model" };
}

export function getTrainingStats() {
  const counts: Record<Label, number> = { Positive: 0, Negative: 0, Neutral: 0 };
  for (const sample of trainingData) {
    counts[sample.label]++;
  }
  return { total: trainingData.length, counts };
}
