import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import {
  DataRow,
  DatasetOverview,
  DataQualityAudit,
  CleaningOptions,
  NumericalMetric,
  CategoricalMetric,
  CorrelationAnalysis,
  CorrelationItem
} from '../types/dataPilot';

/**
 * Parses CSV text or file
 */
export function parseCSVString(csvText: string): Promise<DataRow[]> {
  return new Promise((resolve, reject) => {
    Papa.parse<DataRow>(csvText, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: 'greedy',
      complete: (results) => {
        resolve(results.data);
      },
      error: (err) => {
        reject(err);
      }
    });
  });
}

/**
 * Parses XLSX/XLS array buffer
 */
export function parseExcelBuffer(buffer: ArrayBuffer): DataRow[] {
  const workbook = XLSX.read(buffer, { type: 'array' });
  const firstSheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[firstSheetName];
  const jsonData = XLSX.utils.sheet_to_json<DataRow>(worksheet, { defval: null });
  return jsonData;
}

/**
 * Derives column types and general overview
 */
export function calculateDatasetOverview(data: DataRow[], filename: string): DatasetOverview {
  if (!data || data.length === 0) {
    return {
      filename,
      rows: 0,
      columns: 0,
      numericalCols: [],
      categoricalCols: [],
      dateCols: [],
      numCount: 0,
      catCount: 0,
      missingValues: 0,
      duplicateRows: 0,
      memoryUsage: '0 KB'
    };
  }

  const columns = Object.keys(data[0]);
  const numericalCols: string[] = [];
  const categoricalCols: string[] = [];
  const dateCols: string[] = [];

  columns.forEach((col) => {
    let numCount = 0;
    let totalNonEmpty = 0;
    let isDateLike = false;

    // Check header for date clues
    if (/date|time|timestamp|day|year/i.test(col)) {
      isDateLike = true;
    }

    for (let i = 0; i < Math.min(data.length, 50); i++) {
      const val = data[i][col];
      if (val !== null && val !== undefined && val !== '') {
        totalNonEmpty++;
        if (typeof val === 'number') {
          numCount++;
        } else if (typeof val === 'string' && !isNaN(Number(val.replace(/[$,%₹,]/g, '')))) {
          numCount++;
        }
      }
    }

    if (isDateLike) {
      dateCols.push(col);
    } else if (totalNonEmpty > 0 && numCount / totalNonEmpty >= 0.7) {
      numericalCols.push(col);
    } else {
      categoricalCols.push(col);
    }
  });

  // Missing values
  let missingValues = 0;
  data.forEach((row) => {
    columns.forEach((col) => {
      const v = row[col];
      if (v === null || v === undefined || v === '' || (typeof v === 'number' && isNaN(v))) {
        missingValues++;
      }
    });
  });

  // Duplicate rows detection
  const rowStrings = new Set<string>();
  let duplicateRows = 0;
  data.forEach((row) => {
    const serialized = JSON.stringify(row);
    if (rowStrings.has(serialized)) {
      duplicateRows++;
    } else {
      rowStrings.add(serialized);
    }
  });

  // Memory estimation
  const jsonSize = new Blob([JSON.stringify(data)]).size;
  const memoryUsage =
    jsonSize > 1024 * 1024
      ? `${(jsonSize / (1024 * 1024)).toFixed(2)} MB`
      : `${(jsonSize / 1024).toFixed(1)} KB`;

  return {
    filename,
    rows: data.length,
    columns: columns.length,
    numericalCols,
    categoricalCols,
    dateCols,
    numCount: numericalCols.length,
    catCount: categoricalCols.length,
    missingValues,
    duplicateRows,
    memoryUsage
  };
}

/**
 * Calculates Data Quality Score (0-100) & Audits anomalies
 */
export function calculateDataQuality(data: DataRow[], overview: DatasetOverview): DataQualityAudit {
  if (!data || data.length === 0) {
    return {
      score: 0,
      missingCount: 0,
      missingPct: 0,
      duplicatesCount: 0,
      duplicatesPct: 0,
      emptyCols: [],
      constantCols: [],
      potentialNumeric: [],
      highCardCols: [],
      outlierCells: 0,
      outliersPct: 0,
      outliersByCol: {},
      recommendations: ['Upload a non-empty dataset to generate quality audit.']
    };
  }

  const totalCells = overview.rows * overview.columns;
  const missingPct = totalCells > 0 ? (overview.missingValues / totalCells) * 100 : 0;
  const duplicatesPct = overview.rows > 0 ? (overview.duplicateRows / overview.rows) * 100 : 0;

  const columns = Object.keys(data[0]);
  const emptyCols: string[] = [];
  const constantCols: string[] = [];
  const highCardCols: string[] = [];
  const potentialNumeric: string[] = [];

  columns.forEach((col) => {
    const values = data.map((r) => r[col]).filter((v) => v !== null && v !== undefined && v !== '');
    if (values.length === 0) {
      emptyCols.push(col);
      return;
    }

    const uniqueSet = new Set(values);
    if (uniqueSet.size === 1) {
      constantCols.push(col);
    }

    if (overview.categoricalCols.includes(col)) {
      if ((uniqueSet.size > 50 && uniqueSet.size / overview.rows > 0.4) || (uniqueSet.size === overview.rows && overview.rows > 10)) {
        highCardCols.push(col);
      }

      // Check if majority are numeric strings
      const numericConvertible = values.filter((v) => typeof v === 'string' && !isNaN(Number(v.replace(/[$,%₹,]/g, ''))));
      if (numericConvertible.length / values.length > 0.8) {
        potentialNumeric.push(col);
      }
    }
  });

  // Outliers using IQR method for numerical columns
  let outlierCells = 0;
  let totalNumCells = 0;
  const outliersByCol: Record<string, number> = {};

  overview.numericalCols.forEach((col) => {
    const rawVals = data
      .map((r) => {
        const v = r[col];
        if (typeof v === 'number') return v;
        if (typeof v === 'string') {
          const n = Number(v.replace(/[$,%₹,]/g, ''));
          return isNaN(n) ? null : n;
        }
        return null;
      })
      .filter((v): v is number => v !== null && !isNaN(v));

    if (rawVals.length >= 4) {
      const sorted = [...rawVals].sort((a, b) => a - b);
      const q1 = sorted[Math.floor(sorted.length * 0.25)];
      const q3 = sorted[Math.floor(sorted.length * 0.75)];
      const iqr = q3 - q1;

      if (iqr > 0) {
        const lower = q1 - 1.5 * iqr;
        const upper = q3 + 1.5 * iqr;
        const count = sorted.filter((v) => v < lower || v > upper).length;
        if (count > 0) {
          outliersByCol[col] = count;
          outlierCells += count;
        }
        totalNumCells += sorted.length;
      }
    }
  });

  const outliersPct = totalNumCells > 0 ? (outlierCells / totalNumCells) * 100 : 0;

  // Compute penalty
  let penalty = 0;
  penalty += Math.min(30, missingPct * 1.5);
  penalty += Math.min(20, duplicatesPct * 2.0);
  penalty += Math.min(20, emptyCols.length * 10.0);
  penalty += Math.min(10, constantCols.length * 5.0);
  penalty += Math.min(10, potentialNumeric.length * 5.0);
  penalty += Math.min(10, outliersPct * 0.5);

  const score = Math.max(0, Math.min(100, Math.round(100 - penalty)));

  const recommendations: string[] = [];
  if (overview.missingValues > 0) {
    recommendations.push(
      `Handle ${overview.missingValues} missing values (${missingPct.toFixed(1)}% of cells) via median for numerical and mode for categorical columns.`
    );
  }
  if (overview.duplicateRows > 0) {
    recommendations.push(
      `Remove ${overview.duplicateRows} duplicate rows (${duplicatesPct.toFixed(1)}% of rows) to eliminate model evaluation bias.`
    );
  }
  if (emptyCols.length > 0) {
    recommendations.push(`Drop completely empty columns: ${emptyCols.join(', ')}.`);
  }
  if (constantCols.length > 0) {
    recommendations.push(`Remove zero-variance constant features: ${constantCols.join(', ')}.`);
  }
  if (potentialNumeric.length > 0) {
    recommendations.push(`Convert text columns containing formatted numbers to standard numeric: ${potentialNumeric.join(', ')}.`);
  }
  if (highCardCols.length > 0) {
    recommendations.push(`Review high-cardinality features (${highCardCols.slice(0, 3).join(', ')}) to prevent overfitting in tree models.`);
  }
  if (outliersPct > 2.0) {
    recommendations.push(`Audit ${outlierCells} statistical outliers detected via IQR rule across numerical attributes.`);
  }
  if (recommendations.length === 0) {
    recommendations.push('Dataset meets high-tier data hygiene standards with 0 missing cells and zero duplicate rows.');
  }

  return {
    score,
    missingCount: overview.missingValues,
    missingPct: Number(missingPct.toFixed(2)),
    duplicatesCount: overview.duplicateRows,
    duplicatesPct: Number(duplicatesPct.toFixed(2)),
    emptyCols,
    constantCols,
    potentialNumeric,
    highCardCols,
    outlierCells,
    outliersPct: Number(outliersPct.toFixed(2)),
    outliersByCol,
    recommendations
  };
}

/**
 * Automated Data Cleaning (Non-destructive)
 */
export function cleanDataset(
  originalData: DataRow[],
  options: CleaningOptions
): { cleaned: DataRow[]; actions: string[] } {
  if (!originalData || originalData.length === 0) {
    return { cleaned: [], actions: ['No dataset provided.'] };
  }

  const actions: string[] = [];
  let rows: DataRow[] = originalData.map((r) => ({ ...r }));
  const initialCount = rows.length;

  // 1. Drop completely empty columns
  if (options.dropEmptyColumns && rows.length > 0) {
    const cols = Object.keys(rows[0]);
    const emptyCols = cols.filter((c) =>
      rows.every((r) => r[c] === null || r[c] === undefined || r[c] === '')
    );
    if (emptyCols.length > 0) {
      rows = rows.map((r) => {
        const copy = { ...r };
        emptyCols.forEach((ec) => delete copy[ec]);
        return copy;
      });
      actions.push(`Dropped ${emptyCols.length} empty columns: ${emptyCols.join(', ')}`);
    }
  }

  // 2. Remove duplicate rows
  if (options.removeDuplicates) {
    const seen = new Set<string>();
    const deduped: DataRow[] = [];
    rows.forEach((r) => {
      const s = JSON.stringify(r);
      if (!seen.has(s)) {
        seen.add(s);
        deduped.push(r);
      }
    });
    const removedDups = rows.length - deduped.length;
    if (removedDups > 0) {
      rows = deduped;
      actions.push(`Removed ${removedDups} duplicate rows (${initialCount} → ${rows.length})`);
    }
  }

  if (rows.length === 0) {
    return { cleaned: rows, actions };
  }

  const allCols = Object.keys(rows[0]);

  // 3. Convert suitable columns to numeric
  if (options.convertNumeric) {
    allCols.forEach((col) => {
      const nonNulls = rows.map((r) => r[col]).filter((v) => v !== null && v !== undefined && v !== '');
      if (nonNulls.length > 0 && typeof nonNulls[0] === 'string') {
        const convertible = nonNulls.filter((v) => !isNaN(Number(String(v).replace(/[$,%₹,]/g, ''))));
        if (convertible.length / nonNulls.length > 0.85) {
          rows.forEach((r) => {
            const val = r[col];
            if (val !== null && val !== undefined && val !== '') {
              const num = Number(String(val).replace(/[$,%₹,]/g, ''));
              r[col] = isNaN(num) ? null : num;
            }
          });
          actions.push(`Converted column '${col}' to standard numeric`);
        }
      }
    });
  }

  // 4. Fill missing numerical values with median
  if (options.fillNumericMedian) {
    allCols.forEach((col) => {
      const numVals = rows
        .map((r) => r[col])
        .filter((v): v is number => typeof v === 'number' && !isNaN(v))
        .sort((a, b) => a - b);

      const nullIndices = rows
        .map((r, i) => (r[col] === null || r[col] === undefined || r[col] === '' || isNaN(r[col]) ? i : -1))
        .filter((i) => i !== -1);

      if (numVals.length > 0 && nullIndices.length > 0 && nullIndices.length < rows.length) {
        const median = numVals[Math.floor(numVals.length / 2)];
        nullIndices.forEach((idx) => {
          rows[idx][col] = median;
        });
        actions.push(`Filled ${nullIndices.length} missing values in '${col}' with median (${median.toFixed(2)})`);
      }
    });
  }

  // 5. Fill missing categorical values with mode
  if (options.fillCategoricalMode) {
    allCols.forEach((col) => {
      const catVals = rows
        .map((r) => r[col])
        .filter((v) => v !== null && v !== undefined && v !== '' && typeof v !== 'number');

      const nullIndices = rows
        .map((r, i) => (r[col] === null || r[col] === undefined || r[col] === '' ? i : -1))
        .filter((i) => i !== -1);

      if (catVals.length > 0 && nullIndices.length > 0 && nullIndices.length < rows.length) {
        const counts: Record<string, number> = {};
        catVals.forEach((v) => {
          const s = String(v);
          counts[s] = (counts[s] || 0) + 1;
        });
        let mode = catVals[0];
        let maxCount = 0;
        Object.entries(counts).forEach(([val, count]) => {
          if (count > maxCount) {
            maxCount = count;
            mode = val;
          }
        });
        nullIndices.forEach((idx) => {
          rows[idx][col] = mode;
        });
        actions.push(`Filled ${nullIndices.length} missing values in '${col}' with mode ('${mode}')`);
      }
    });
  }

  if (actions.length === 0) {
    actions.push('No data cleaning operations were necessary; dataset is already clean.');
  }

  return { cleaned: rows, actions };
}

/**
 * Computes Numerical EDA
 */
export function computeNumericalAnalysis(data: DataRow[], numCols: string[]): NumericalMetric[] {
  const results: NumericalMetric[] = [];

  numCols.forEach((col) => {
    const rawVals = data
      .map((r) => {
        const v = r[col];
        if (typeof v === 'number') return v;
        if (typeof v === 'string') {
          const n = Number(v.replace(/[$,%₹,]/g, ''));
          return isNaN(n) ? null : n;
        }
        return null;
      })
      .filter((v): v is number => v !== null && !isNaN(v));

    if (rawVals.length === 0) return;

    const count = rawVals.length;
    const sorted = [...rawVals].sort((a, b) => a - b);
    const sum = sorted.reduce((acc, v) => acc + v, 0);
    const mean = sum / count;
    const median = sorted[Math.floor(count / 2)];
    const min = sorted[0];
    const max = sorted[count - 1];
    const q25 = sorted[Math.floor(count * 0.25)];
    const q50 = median;
    const q75 = sorted[Math.floor(count * 0.75)];
    const iqr = q75 - q25;

    // Variance & StdDev
    const variance = sorted.reduce((acc, v) => acc + Math.pow(v - mean, 2), 0) / Math.max(1, count - 1);
    const stdDev = Math.sqrt(variance);

    // Skewness
    let skewness = 0;
    if (stdDev > 0 && count > 2) {
      const m3 = sorted.reduce((acc, v) => acc + Math.pow((v - mean) / stdDev, 3), 0);
      skewness = (count / ((count - 1) * (count - 2))) * m3;
    }

    results.push({
      feature: col,
      count,
      mean: Number(mean.toFixed(2)),
      median: Number(median.toFixed(2)),
      stdDev: Number(stdDev.toFixed(2)),
      min: Number(min.toFixed(2)),
      q25: Number(q25.toFixed(2)),
      q50: Number(q50.toFixed(2)),
      q75: Number(q75.toFixed(2)),
      max: Number(max.toFixed(2)),
      iqr: Number(iqr.toFixed(2)),
      skewness: Number(skewness.toFixed(2))
    });
  });

  return results;
}

/**
 * Computes Categorical EDA
 */
export function computeCategoricalAnalysis(data: DataRow[], catCols: string[]): CategoricalMetric[] {
  const results: CategoricalMetric[] = [];
  const total = data.length;

  catCols.forEach((col) => {
    const counts: Record<string, number> = {};
    data.forEach((r) => {
      const v = r[col];
      const key = v === null || v === undefined || v === '' ? '(Missing)' : String(v);
      counts[key] = (counts[key] || 0) + 1;
    });

    const entries = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    const topCategories = entries.slice(0, 5).map(([category, count]) => ({
      category,
      count,
      percentage: Number(((count / total) * 100).toFixed(1))
    }));

    results.push({
      column: col,
      uniqueCount: entries.length,
      mostFrequent: entries[0]?.[0] || 'N/A',
      frequency: entries[0]?.[1] || 0,
      topCategories
    });
  });

  return results;
}

/**
 * Computes Pearson correlation matrix & extracts strong pairs
 */
export function computeCorrelationAnalysis(data: DataRow[], numCols: string[]): CorrelationAnalysis {
  if (numCols.length < 2) {
    return { features: numCols, matrix: [], strongPositive: [], strongNegative: [] };
  }

  // Extract clean numerical series for each column
  const vectors: Record<string, number[]> = {};
  numCols.forEach((c) => {
    vectors[c] = data.map((r) => {
      const v = r[c];
      if (typeof v === 'number') return v;
      if (typeof v === 'string') {
        const n = Number(v.replace(/[$,%₹,]/g, ''));
        return isNaN(n) ? 0 : n;
      }
      return 0;
    });
  });

  const matrix: number[][] = [];
  const strongPositive: CorrelationItem[] = [];
  const strongNegative: CorrelationItem[] = [];

  for (let i = 0; i < numCols.length; i++) {
    const row: number[] = [];
    for (let j = 0; j < numCols.length; j++) {
      if (i === j) {
        row.push(1.0);
        continue;
      }
      const c1 = numCols[i];
      const c2 = numCols[j];
      const v1 = vectors[c1];
      const v2 = vectors[c2];

      const n = v1.length;
      const mean1 = v1.reduce((a, b) => a + b, 0) / n;
      const mean2 = v2.reduce((a, b) => a + b, 0) / n;

      let num = 0;
      let d1 = 0;
      let d2 = 0;

      for (let k = 0; k < n; k++) {
        const diff1 = v1[k] - mean1;
        const diff2 = v2[k] - mean2;
        num += diff1 * diff2;
        d1 += diff1 * diff1;
        d2 += diff2 * diff2;
      }

      const denom = Math.sqrt(d1 * d2);
      const r = denom === 0 ? 0 : Number((num / denom).toFixed(3));
      row.push(r);

      if (i < j) {
        if (r >= 0.6) {
          strongPositive.push({
            feature1: c1,
            feature2: c2,
            correlation: r,
            strength: r >= 0.8 ? 'Very Strong' : 'Strong'
          });
        } else if (r <= -0.6) {
          strongNegative.push({
            feature1: c1,
            feature2: c2,
            correlation: r,
            strength: r <= -0.8 ? 'Very Strong Negative' : 'Strong Negative'
          });
        }
      }
    }
    matrix.push(row);
  }

  strongPositive.sort((a, b) => b.correlation - a.correlation);
  strongNegative.sort((a, b) => a.correlation - b.correlation);

  return {
    features: numCols,
    matrix,
    strongPositive,
    strongNegative
  };
}
