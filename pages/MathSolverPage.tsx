

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Card, Button, Alert } from '../components/common';
import { CalculatorIcon } from '../components/Icons';
import { solveMathProblem } from '../services/geminiService';
import { type MathSolution } from '../types';

// @ts-ignore
const katex = window.katex;

const KatexRenderer = ({ text }: { text: string }) => {
    const containerRef = useRef<HTMLParagraphElement>(null);

    useEffect(() => {
        const container = containerRef.current;
        if (container && katex) {
            let processedText = text;
            try {
                 // Render block equations $$...$$
                processedText = processedText.replace(/\$\$(.*?)\$\$/g, (match, equation) => {
                   return katex.renderToString(equation, { throwOnError: false, displayMode: true });
                });
                // Render inline equations \(...\)
                processedText = processedText.replace(/\\\((.*?)\\\)/g, (match, equation) => {
                    return katex.renderToString(equation, { throwOnError: false, displayMode: false });
                });
                 container.innerHTML = processedText;
            } catch(e) {
                console.error("Katex rendering failed:", e);
                container.textContent = text; // Fallback to plain text
            }
        } else {
             if(container) container.textContent = text;
        }
    }, [text]);

    return <p ref={containerRef} className="text-gray-700 dark:text-gray-300 font-mono text-base leading-loose"></p>;
};

export default function MathSolverPage() {
    const [problem, setProblem] = useState('Solve for x: 2x^2 - 10x + 12 = 0');
    const [solution, setSolution] = useState<MathSolution | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSolve = useCallback(async () => {
        if (!problem.trim()) {
            setError('Please enter a math problem to solve.');
            return;
        }
        setIsLoading(true);
        setError(null);
        setSolution(null);
        try {
            const result = await solveMathProblem(problem);
            setSolution(result);
        } catch (err: any) {
            setError(err.message || 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
        }
    }, [problem]);

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <Card title="Math Solver" icon={<CalculatorIcon className="w-6 h-6" />}>
                <div className="space-y-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        Enter a math problem, from basic arithmetic to algebra and calculus, and get a step-by-step solution.
                    </p>
                    <div className="space-y-2">
                        <label htmlFor="problem-input" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Your Math Problem
                        </label>
                        <textarea
                            id="problem-input"
                            rows={3}
                            value={problem}
                            onChange={(e) => setProblem(e.target.value)}
                            className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-lg bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 font-mono"
                            placeholder="e.g., 'Solve for x: 2x + 5 = 15' or 'Find the derivative of f(x) = x^3 - 6x^2 + 2x'"
                            disabled={isLoading}
                        />
                    </div>
                     {error && <Alert message={error} type="error" />}
                    <div className="flex justify-end">
                        <Button onClick={handleSolve} isLoading={isLoading} disabled={!problem.trim()}>
                            Solve Problem
                        </Button>
                    </div>
                </div>
            </Card>

            {(isLoading || solution) && (
                 <Card>
                    <div className="space-y-6">
                        {isLoading && (
                            <div className="space-y-4 animate-pulse">
                                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mt-4"></div>
                                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
                            </div>
                        )}
                        {solution && (
                            <>
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2">Final Answer</h3>
                                    <div className="p-4 bg-primary-100 dark:bg-primary-900/50 rounded-lg">
                                        <KatexRenderer text={solution.solution} />
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2">Step-by-Step Solution</h3>
                                    <ol className="list-decimal list-inside space-y-4 pl-2">
                                        {solution.steps.map((step, index) => (
                                            <li key={index}>
                                                <KatexRenderer text={step} />
                                            </li>
                                        ))}
                                    </ol>
                                </div>
                            </>
                        )}
                    </div>
                 </Card>
            )}
        </div>
    );
}