import React, { useState } from 'react';
import { Sparkles, Brain, ThumbsUp, TrendingUp, AlertCircle } from 'lucide-react'; // Imports sparkled up
import api from '../utils/api';

const PerformanceAI = () => {
    const [analysis, setAnalysis] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleAnalyze = async () => {
        setLoading(true);
        setError('');
        try {
            const { data } = await api.post('/ai/analyze');
            setAnalysis(data);
        } catch (err) {
            console.error("AI Analysis failed", err);
            setError(err.response?.data?.message || 'Unable to generate insights at this moment. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-gradient-to-r from-violet-600 to-indigo-600 rounded-xl p-1 shadow-lg text-white mb-8 overflow-hidden">
            <div className="bg-white/10 backdrop-blur-sm p-6 rounded-lg h-full">
                <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-white/20 rounded-lg">
                            <Brain className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold">AI Performance Coach</h2>
                            <p className="text-indigo-100 text-sm">Powered by Google Gemini</p>
                        </div>
                    </div>
                    {!analysis && !loading && (
                        <button
                            onClick={handleAnalyze}
                            className="px-4 py-2 bg-white text-indigo-600 font-semibold rounded-lg hover:bg-indigo-50 transition-colors flex items-center gap-2 shadow-sm"
                        >
                            <Sparkles className="w-4 h-4" />
                            Analyze My Progress
                        </button>
                    )}
                </div>

                {loading && (
                    <div className="text-center py-8 animate-pulse">
                        <Sparkles className="w-8 h-8 mx-auto mb-3 text-indigo-200 animate-spin" />
                        <p className="text-indigo-100">Analyzing your marks and attendance patterns...</p>
                    </div>
                )}

                {error && (
                    <div className="p-4 bg-red-500/20 border border-red-500/30 rounded-lg text-red-100 flex items-center gap-2">
                        <AlertCircle className="w-5 h-5" />
                        {error}
                    </div>
                )}

                {analysis && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {/* Summary / Strengths */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-white/10 rounded-lg p-4">
                                <div className="flex items-center gap-2 mb-2 text-emerald-300 font-semibold">
                                    <ThumbsUp className="w-5 h-5" />
                                    <h3>Strengths</h3>
                                </div>
                                <ul className="list-disc list-inside text-sm text-indigo-50 space-y-1">
                                    {/* Handle both array and string based on AI response reliability */}
                                    {Array.isArray(analysis.strengths)
                                        ? analysis.strengths.map((s, i) => <li key={i}>{s}</li>)
                                        : <li>{analysis.strengths || "Analysis unavailable"}</li>
                                    }
                                </ul>
                            </div>

                            <div className="bg-white/10 rounded-lg p-4">
                                <div className="flex items-center gap-2 mb-2 text-amber-300 font-semibold">
                                    <TrendingUp className="w-5 h-5" />
                                    <h3>Areas for Improvement</h3>
                                </div>
                                <ul className="list-disc list-inside text-sm text-indigo-50 space-y-1">
                                    {Array.isArray(analysis.improvements)
                                        ? analysis.improvements.map((s, i) => <li key={i}>{s}</li>)
                                        : <li>{analysis.improvements || "Analysis unavailable"}</li>
                                    }
                                </ul>
                            </div>
                        </div>

                        {/* Tips */}
                        <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                            <h3 className="font-semibold text-white mb-2 flex items-center gap-2">
                                <Sparkles className="w-4 h-4 text-purple-300" />
                                Personalized Study Tips
                            </h3>
                            <div className="text-sm text-indigo-100 leading-relaxed">
                                {Array.isArray(analysis.tips)
                                    ? <ul className="list-disc list-inside space-y-1">{analysis.tips.map((t, i) => <li key={i}>{t}</li>)}</ul>
                                    : <p>{analysis.tips}</p>
                                }
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PerformanceAI;
