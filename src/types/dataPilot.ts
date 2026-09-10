export type NavSection =
  | 'home'
  | 'upload'
  | 'quality'
  | 'eda'
  | 'visualizations'
  | 'ml'
  | 'evaluation'
  | 'insights'
  | 'report'
  | 'code';

export interface DataRow {
  [key: string]: any;
}

export interface DatasetOverview {
  filename: string;
  rows: number;
  columns: number;
  numericalCols: string[];
  categoricalCols: string[];
  dateCols: string[];
  numCount: number;
  catCount: number;
  missingValues: number;
  duplicateRows: number;
  memoryUsage: string;
}

export interface DataQualityAudit {
  score: number;
  missingCount: number;
  missingPct: number;
  duplicatesCount: number;
  duplicatesPct: number;
  emptyCols: string[];
  constantCols: string[];
  potentialNumeric: string[];
  highCardCols: string[];
  outlierCells: number;
  outliersPct: number;
  outliersByCol: Record<string, number>;
  recommendations: string[];
}

export interface CleaningOptions {
  removeDuplicates: boolean;
  fillNumericMedian: boolean;
  fillCategoricalMode: boolean;
  convertNumeric: boolean;
  convertDates: boolean;
  dropEmptyColumns: boolean;
}

export interface NumericalMetric {
  feature: string;
  count: number;
  mean: number;
  median: number;
  stdDev: number;
  min: number;
  q25: number;
  q50: number;
  q75: number;
  max: number;
  iqr: number;
  skewness: number;
}

export interface CategoryFrequency {
  category: string;
  count: number;
  percentage: number;
}

export interface CategoricalMetric {
  column: string;
  uniqueCount: number;
  mostFrequent: string;
  frequency: number;
  topCategories: CategoryFrequency[];
}

export interface CorrelationItem {
  feature1: string;
  feature2: string;
  correlation: number;
  strength: string;
}

export interface CorrelationAnalysis {
  features: string[];
  matrix: number[][];
  strongPositive: CorrelationItem[];
  strongNegative: CorrelationItem[];
}

export interface ModelMetricResult {
  model: string;
  score: string;
  scoreNum: number;
  primaryMetric: number;
  mae?: number;
  mse?: number;
  rmse?: number;
  r2?: number;
  accuracy?: number;
  precision?: number;
  recall?: number;
  f1?: number;
  confusionMatrix?: number[][];
}

export interface FeatureImportanceItem {
  feature: string;
  importance: number;
}

export interface MlExperimentResult {
  targetCol: string;
  problemType: 'Regression' | 'Binary Classification' | 'Multiclass Classification';
  isRegression: boolean;
  featureCols: string[];
  comparisonTable: ModelMetricResult[];
  bestModelName: string;
  bestScoreFormatted: string;
  featureImportance: FeatureImportanceItem[];
  trainSize: number;
  testSize: number;
  trainedPipelines: Record<string, any>;
}

export interface PredictionResult {
  success: boolean;
  isRegression: boolean;
  prediction: string | number;
  display: string;
  probability?: string;
  targetName: string;
  error?: string;
}
