import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';
import './Calculator.css';
import { CalculatorProps } from './Calculator.types';
import { CalculationResult } from '../types/common';
import { fetchInvestmentData } from '../services/api';
import { formatCurrency } from '../utils/formatting';
import { formatChartDate } from '../utils/date';

export const Calculator: React.FC<CalculatorProps> = ({ className = '' }) => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [initialAmount, setInitialAmount] = useState<string>(
        searchParams.get('amount') || ''
    );
    const [investmentDate, setInvestmentDate] = useState<Date | null>(
        searchParams.get('date') ? new Date(searchParams.get('date')!) : null
    );
    const [projectionYears, setProjectionYears] = useState<string>('5');
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>('');
    const [result, setResult] = useState<CalculationResult | null>(null);

    const maxDate = new Date();

    const calculateReturns = useCallback(async () => {
        if (!initialAmount || !investmentDate || !projectionYears) {
            setError('Please enter amount, date, and projection period');
            return;
        }

        const amount = parseFloat(initialAmount);
        const years = parseFloat(projectionYears);
        if (isNaN(amount) || amount <= 0 || isNaN(years) || years <= 0) {
            setError('Please enter valid amount and projection period');
            return;
        }

        const startDate = investmentDate;
        if (startDate! > new Date()) {
            setError('Investment date cannot be in the future');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const result = await fetchInvestmentData({
                startDate: startDate!.toISOString().split('T')[0],
                amount,
                projectionYears: years
            });

            setResult(result);
            setSearchParams({
                amount: amount.toString(),
                date: startDate!.toISOString().split('T')[0],
                projectionYears: years.toString()
            });
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : 'Failed to fetch data. Please try again.'
            );
        } finally {
            setLoading(false);
        }
    }, [initialAmount, investmentDate, projectionYears, setSearchParams]);

    useEffect(() => {
        if (initialAmount && investmentDate && projectionYears) {
            calculateReturns();
        }
    }, []);

    return (
        <div className="calculator-container">
            <div className="min-h-screen bg-[#030014] text-white relative overflow-hidden">
                <div className="absolute inset-0">
                    <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-700 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
                    <div className="absolute top-0 -right-4 w-72 h-72 bg-cyan-700 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
                    <div className="absolute -bottom-8 left-20 w-72 h-72 bg-blue-700 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
                    <div className="absolute inset-0 bg-grid-white/[0.02] bg-[length:50px_50px]"
                         style={{
                             backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px)'
                         }}>
                    </div>
                </div>

                <div className="relative z-10 max-w-7xl mx-auto p-6">
                    <div className="backdrop-blur-xl bg-black/20 rounded-3xl border border-white/10 shadow-2xl">
                        <div className="p-8 text-center">
                            <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600">
                                Investment Calculator
                            </h1>
                            <div className="mt-2 text-cyan-400/80">Analyze temporal market patterns with advanced algorithms</div>
                        </div>

                        <div className="p-8 space-y-8">
                            <div className="grid md:grid-cols-3 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-cyan-300">Initial Investment ($)</label>
                                    <input
                                        type="number"
                                        value={initialAmount}
                                        onChange={(e) => setInitialAmount(e.target.value)}
                                        className="quantum-input"
                                        placeholder="Enter amount"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-cyan-300">Investment Date</label>
                                    <DatePicker
                                        selected={investmentDate}
                                        onChange={(date) => setInvestmentDate(date)}
                                        maxDate={maxDate}
                                        className="quantum-input"
                                        placeholderText="Select date"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-cyan-300">Projection Period (Years)</label>
                                    <select
                                        value={projectionYears}
                                        onChange={(e) => setProjectionYears(e.target.value)}
                                        className="quantum-input"
                                    >
                                        {Array.from(Array(30).keys()).map(year => (
                                            <option key={year + 1} value={year + 1}>
                                                {year + 1}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <button
                                onClick={() => void calculateReturns()}
                                disabled={loading}
                                className="quantum-button group"
                            >
                                <span className="quantum-button-glow"></span>
                                <span className="relative">
                                    {loading ? 'Analyzing Market Data...' : 'Calculate Returns'}
                                </span>
                            </button>

                            {error && (
                                <div className="text-red-400 text-center" role="alert">{error}</div>
                            )}

                            {result && (
                                <div className="space-y-8 mt-8">
                                    <div className="grid md:grid-cols-4 gap-4">
                                        {[
                                            { label: 'Current Value', value: formatCurrency(result.currentValue) },
                                            { label: 'Total Return', value: `${result.totalReturn.toFixed(2)}%` },
                                            { label: 'Total Profit', value: formatCurrency(result.totalProfit) },
                                            { label: 'Time Period', value: `${result.years.toFixed(1)} years` }
                                        ].map((metric, index) => (
                                            <div key={index} className="quantum-metric-card">
                                                <div className="text-cyan-400 text-sm mb-1">{metric.label}</div>
                                                <div className="text-2xl font-bold text-white">{metric.value}</div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="quantum-chart-container">
                                        <ResponsiveContainer>
                                            <LineChart data={result.chartData}>
                                                <defs>
                                                    <linearGradient id="valueGradient" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor="#00fff2" stopOpacity={0.8}/>
                                                        <stop offset="95%" stopColor="#0026ff" stopOpacity={0.2}/>
                                                    </linearGradient>
                                                </defs>
                                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                                                <XAxis
                                                    dataKey="date"
                                                    stroke="#4dd0e1"
                                                    tickFormatter={formatChartDate}
                                                    tick={{fill: '#4dd0e1'}}
                                                />
                                                <YAxis
                                                    stroke="#4dd0e1"
                                                    tickFormatter={formatCurrency}
                                                    tick={{fill: '#4dd0e1'}}
                                                />
                                                <Tooltip
                                                    contentStyle={{
                                                        background: 'rgba(0,0,0,0.8)',
                                                        border: '1px solid rgba(0,255,242,0.3)',
                                                        borderRadius: '10px',
                                                        backdropFilter: 'blur(4px)'
                                                    }}
                                                    formatter={value => [formatCurrency(value as number), 'Value']}
                                                    labelFormatter={formatChartDate}
                                                />
                                                <Line
                                                    type="monotone"
                                                    dataKey="value"
                                                    stroke="url(#valueGradient)"
                                                    strokeWidth={3}
                                                    dot={{
                                                        r: 4,
                                                        fill: '#00fff2',
                                                        strokeWidth: 2,
                                                        stroke: '#ffffff'
                                                    }}
                                                    activeDot={{
                                                        r: 6,
                                                        fill: '#00fff2',
                                                        stroke: '#ffffff'
                                                    }}
                                                />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Calculator;