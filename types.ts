export type AppMode = 'calculator' | 'converter' | 'currency' | 'bmi' | 'settings';

export interface HistoryItem {
  id: string;
  type: AppMode;
  expression: string;
  result: string;
  timestamp: number;
}

export interface UnitDefinition {
  name: string;
  symbol: string;
  factor: number; // Factor relative to base unit (e.g., meter, kilogram)
  offset?: number; // For temperature (e.g., -32)
}

export interface UnitCategory {
  id: string;
  name: string;
  units: UnitDefinition[];
  baseUnit: string;
}

export interface CurrencyRate {
  code: string;
  rate: number; // Relative to base currency (USD)
  name: string;
}

export interface AppSettings {
  theme: 'light' | 'dark';
  precision: number;
  currencyProviderUrl: string;
}