import { CalculationResult } from '../types/common';

interface FetchDataParams {
    startDate: string;
    amount: number;
    projectionYears: number;
}

export const fetchInvestmentData = async ({
                                              startDate,
                                              amount,
                                              projectionYears,
                                          }: FetchDataParams): Promise<CalculationResult> => {
    const startDateObj = new Date(startDate);
    const endDate = new Date();
    const monthDiff =
        (endDate.getFullYear() - startDateObj.getFullYear()) * 12 +
        (endDate.getMonth() - startDateObj.getMonth());

    const totalMonths = monthDiff + projectionYears * 12;
    const chartData = [];
    let currentValue = amount;

    for (let i = 0; i <= totalMonths; i++) {
        const date = new Date(startDateObj);
        date.setMonth(date.getMonth() + i);

        const monthlyReturn = 1 + 0.08 / 12 + (Math.random() - 0.5) * 0.01;
        currentValue *= monthlyReturn;

        chartData.push({
            date: date.toISOString().split('T')[0],
            value: currentValue,
        });
    }

    return {
        currentValue,
        totalReturn: ((currentValue - amount) / amount) * 100,
        totalProfit: currentValue - amount,
        years: totalMonths / 12,
        chartData,
    };
};