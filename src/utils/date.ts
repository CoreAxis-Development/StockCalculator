// src/utils/date.ts
export const formatChartDate = (date: string): string => {
    return new Date(date).toLocaleDateString();
};
