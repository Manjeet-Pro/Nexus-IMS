import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Lock, ArrowRight, CheckCircle, AlertCircle, ArrowLeft, Shield } from 'lucide-react';
import api from '../utils/api';

const ResetPassword = () => {
    const { token } = useParams();
    const navigate = useNavigate();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [validatingToken, setValidatingToken] = useState(true);
    const [tokenValid, setTokenValid] = useState(false);

    // Validate token on page load
    useEffect(() => {
        const validateToken = async () => {
            try {
                const response = await api.get(`/auth/validate-reset-token/${token}`);
                if (response.data.valid) {
                    setTokenValid(true);
                } else {
                    setError(response.data.message || 'This password reset link has expired or has already been used.');
                    setTokenValid(false);
                }
            } catch (err) {
                setError(err.response?.data?.message || 'This password reset link has expired or has already been used.');
                setTokenValid(false);
            } finally {
                setValidatingToken(false);
            }
        };

        validateToken();
    }, [token]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        setLoading(true);
        setError('');

        try {
            await api.put(`/auth/resetpassword/${token}`, { password });
            setSuccess(true);
            setTimeout(() => {
                navigate('/login');
            }, 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Invalid or expired token.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 relative overflow-hidden">
            {/* Animated Background Elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary-200/30 rounded-full blur-[100px] animate-float"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-200/30 rounded-full blur-[100px] animate-float-delayed"></div>
            </div>

            <div className="max-w-md w-full bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden relative z-10 animate-in fade-in zoom-in duration-500 border border-white/20">
                <div className="p-8 md:p-12">
                    <div className="text-center mb-10">
                        <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-primary-500/20 rotate-3 transform transition-transform hover:rotate-0 duration-500">
                            <Lock className="w-10 h-10 text-white" />
                        </div>
                        <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Reset Password</h2>
                        <p className="text-gray-500 mt-3 leading-relaxed">
                            Create a strong new password to secure your account.
                        </p>
                    </div>

                    {validatingToken ? (
                        // Loading state while validating token
                        <div className="text-center space-y-6 py-8">
                            <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto"></div>
                            <p className="text-gray-500 font-medium">Verifying reset link...</p>
                        </div>
                    ) : !tokenValid ? (
                        // Token is invalid or expired
                        <div className="text-center space-y-8 animate-in fade-in zoom-in duration-500">
                            <div className="p-6 bg-red-50 rounded-2xl border border-red-100 flex flex-col items-center gap-4">
                                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                                    <AlertCircle className="w-8 h-8 text-red-600" />
                                </div>
                                <div className="space-y-1">
                                    <h3 className="text-xl font-bold text-red-800">Link Expired</h3>
                                    <p className="text-red-700 opacity-90 text-sm">{error || 'This password reset link has expired or has already been used.'}</p>
                                </div>
                            </div>

                            <div className="bg-gray-50/80 p-5 rounded-2xl border border-dashed border-gray-200">
                                <p className="text-sm text-gray-600 font-medium mb-3">
                                    Need a new reset link?
                                </p>
                                <Link
                                    to="/forgot-password"
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg font-bold hover:bg-primary-700 transition-all shadow-sm active:scale-95"
                                >
                                    Request New Link
                                    <ArrowRight className="w-4 h-4" />
                                </Link>
                            </div>
                        </div>
                    ) : !success ? (
                        // Valid token - show password reset form
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {error && (
                                <div className="p-4 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100 flex items-start gap-3 animate-in slide-in-from-top-2">
                                    <Shield className="w-5 h-5 mt-0.5 flex-shrink-0" />
                                    <div>
                                        <span className="font-semibold block">Error</span>
                                        {error}
                                    </div>
                                </div>
                            )}

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="block text-sm font-bold text-gray-700 ml-1">New Password</label>
                                    <div className="relative group">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-500 transition-colors">
                                            <Lock className="w-5 h-5" />
                                        </div>
                                        <input
                                            type="password"
                                            required
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="w-full !pl-12 pr-4 py-4 bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:ring-4 focus:ring-primary-100 focus:border-primary-500 outline-none transition-all duration-300 font-medium placeholder:text-gray-400 shadow-sm"
                                            placeholder="••••••••"
                                            minLength={6}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-sm font-bold text-gray-700 ml-1">Confirm New Password</label>
                                    <div className="relative group">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-500 transition-colors">
                                            <Lock className="w-5 h-5" />
                                        </div>
                                        <input
                                            type="password"
                                            required
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            className="w-full !pl-12 pr-4 py-4 bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:ring-4 focus:ring-primary-100 focus:border-primary-500 outline-none transition-all duration-300 font-medium placeholder:text-gray-400 shadow-sm"
                                            placeholder="••••••••"
                                        />
                                    </div>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className={`w-full py-4 bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-700 hover:to-primary-600 text-white font-bold rounded-xl transition-all duration-300 shadow-lg shadow-primary-500/30 hover:shadow-primary-500/50 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] flex items-center justify-center gap-2 ${loading ? 'opacity-80 cursor-not-allowed' : ''}`}
                            >
                                {loading ? (
                                    <div className="flex items-center gap-2">
                                        <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        <span>Resetting...</span>
                                    </div>
                                ) : (
                                    <>
                                        <span>Update Password</span>
                                        <ArrowRight className="w-5 h-5" />
                                    </>
                                )}
                            </button>
                        </form>
                    ) : (
                        // Success state
                        <div className="text-center space-y-8 animate-in fade-in zoom-in duration-500">
                            <div className="p-6 bg-green-50 rounded-2xl border border-green-100 flex flex-col items-center gap-4">
                                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                                    <CheckCircle className="w-8 h-8 text-green-600" />
                                </div>
                                <div className="space-y-1">
                                    <h3 className="text-xl font-bold text-green-800">Success!</h3>
                                    <p className="text-green-700 opacity-90 text-sm">Your password has been reset successfully. You will be redirected to the login page shortly.</p>
                                </div>
                            </div>

                            <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                                <div className="bg-primary-500 h-full animate-[progress_3s_linear]"></div>
                            </div>
                        </div>
                    )}

                    <div className="mt-10 pt-8 border-t border-gray-100 text-center">
                        <Link to="/" className="inline-flex items-center gap-2 text-gray-500 hover:text-primary-600 font-bold text-sm transition-all group">
                            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                            Back to Sign In
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;
