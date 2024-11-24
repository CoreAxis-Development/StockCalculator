// src/types/common.ts
export interface InvestmentData {
    date: string;
    value: number;
}

export interface CalculationResult {
    currentValue: number;
    totalReturn: number;
    totalProfit: number;
    years: number;
    chartData: InvestmentData[];
}