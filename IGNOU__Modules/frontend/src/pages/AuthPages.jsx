import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link, useParams, useLocation } from 'react-router-dom';
import { login, register, searchStudents } from '../utils/auth';
import api from '../utils/api';
import {
    GraduationCap, User, Shield, BookOpen, Mail, Lock, ArrowRight,
    CheckCircle2, Search, X, Plus, AlertCircle, ArrowLeft, CheckCircle, XCircle,
    Eye, EyeOff, RefreshCw, Info, PhoneCall
} from 'lucide-react';

// 1. LOGIN & REGISTER PAGE
export const Login = () => {
    const navigate = useNavigate();
    const [isLogin, setIsLogin] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [shake, setShake] = useState(false);
    const [fullName, setFullName] = useState('');
    const [role, setRole] = useState('student');
    const [childSearchQuery, setChildSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [selectedChildren, setSelectedChildren] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const triggerShake = () => { setShake(true); setTimeout(() => setShake(false), 500); };

    const handleAuth = async (e) => {
        e.preventDefault(); setError(''); setLoading(true);
        try {
            if (isLogin) {
                const result = await login(email, password);
                if (result.success) {
                    const r = result.user.role;
                    navigate(r === 'admin' ? '/admin' : r === 'faculty' ? '/faculty' : r === 'student' ? '/student' : r === 'parent' ? '/parent' : '/');
                } else { setError(result.message); triggerShake(); }
            } else {
                const result = await register({ name: fullName, email, password, role: role.toLowerCase(), extraData: role === 'parent' ? { childrenRollNos: selectedChildren.map(c => c.rollNo) } : {} });
                if (result.success) {
                    navigate(`/verify-email?email=${encodeURIComponent(email)}`);
                }
                else { setError(result.message); triggerShake(); }
            }
        } catch (err) { setError(err.response?.data?.message || err.message || 'Error occurred.'); triggerShake(); }
        finally { setLoading(false); }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary-200/30 rounded-full blur-[100px] animate-float"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-200/30 rounded-full blur-[100px] animate-float-delayed"></div>
            </div>
            <div className="max-w-5xl w-full bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row relative z-10 animate-in fade-in zoom-in duration-500">
                <div className="md:w-1/2 bg-gradient-to-br from-primary-600 to-primary-900 p-12 text-white flex flex-col justify-between relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-full h-full bg-[url('https://images.unsplash.com/photo-1523050854058-8df90110c9f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80')] bg-cover opacity-10 mix-blend-overlay group-hover:opacity-20 transition-opacity"></div>
                    <div className="relative z-10 text-center">
                        <div className="bg-white/10 w-32 h-32 rounded-full flex items-center justify-center backdrop-blur-md mb-8 shadow-2xl border border-white/20 mx-auto p-4"><img src="/logo.png" alt="Logo" className="w-full h-full object-cover rounded-full" /></div>
                        <h1 className="text-5xl font-extrabold mb-3 tracking-tight">Nexus <span className="text-primary-200">IMS</span></h1>
                        <p className="text-primary-100 text-lg opacity-90 mx-auto max-w-sm">Empowering education with advanced management tools.</p>
                    </div>
                    <div className="relative mt-12 space-y-5 animate-in slide-in-from-bottom-4">
                        <div className="flex items-center gap-4 p-4 bg-white/10 rounded-2xl backdrop-blur-md border border-white/5 hover:bg-white/20 transition-all"><Shield className="w-5 h-5" /><div><h3 className="font-bold">Secure</h3><p className="text-xs opacity-70">Enterprise standards</p></div></div>
                        <div className="flex items-center gap-4 p-4 bg-white/10 rounded-2xl backdrop-blur-md border border-white/5 hover:bg-white/20 transition-all"><BookOpen className="w-5 h-5" /><div><h3 className="font-bold">Smart</h3><p className="text-xs opacity-70">Academic resources</p></div></div>
                    </div>
                    <div className="mt-auto pt-8 text-xs opacity-60 flex flex-wrap gap-4 items-center tracking-wider font-bold uppercase transition-all">
                        <span>© 2026 Nexus IMS</span>
                        <span className="opacity-40">•</span>
                        <Link to="/about" className="hover:text-white transition-colors flex items-center gap-1"><Info className="w-3 h-3" /> About</Link>
                        <span className="opacity-40">•</span>
                        <Link to="/contact" className="hover:text-white transition-colors flex items-center gap-1"><PhoneCall className="w-3 h-3" /> Contact</Link>
                    </div>
                </div>
                <div className="md:w-1/2 p-8 md:p-12 bg-white flex flex-col justify-center">
                    <div className="max-w-md mx-auto w-full">
                        <h2 className="text-3xl font-extrabold mb-2 text-black">{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
                        <p className="text-gray-500 mb-8">{isLogin ? 'Access your dashboard.' : 'Fill in your details.'}</p>
                        {error && <div className={`mb-6 p-4 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100 flex gap-3 ${shake ? 'animate-shake' : ''}`}><Shield className="w-5 h-5 flex-shrink-0" /><div><span className="font-medium block">Error</span>{error}</div></div>}
                        <form onSubmit={handleAuth} className="space-y-5">
                            {!isLogin && (
                                <div className="space-y-4 animate-in slide-in-from-bottom-5">
                                    <div className="relative group">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-primary-500" />
                                        <input type="text" required value={fullName} onChange={(e) => setFullName(e.target.value)} className="w-full !pl-16 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-4 focus:ring-primary-100 outline-none" placeholder="Full Name" />
                                    </div>
                                    <div className="flex bg-gray-100 p-1.5 rounded-xl gap-1">
                                        {['student', 'faculty', 'admin', 'parent'].map(r => (
                                            <button key={r} type="button" onClick={() => setRole(r)} className={`flex-1 py-2 text-sm font-semibold rounded-lg capitalize transition-all ${role === r ? 'bg-white text-primary-600 shadow-md' : 'text-gray-500'}`}>{r}</button>
                                        ))}
                                    </div>
                                    {role === 'parent' && (
                                        <div className="space-y-3">
                                            <div className="flex flex-wrap gap-2">{selectedChildren.map(c => <div key={c._id} className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-xs flex items-center gap-1">{c.name}<X className="w-3 h-3 cursor-pointer" onClick={() => setSelectedChildren(prev => prev.filter(x => x._id !== c._id))} /></div>)}</div>
                                            <div className="relative">
                                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                                <input type="text" value={childSearchQuery} onChange={async (e) => { const q = e.target.value; setChildSearchQuery(q); if (q.length >= 3) { setIsSearching(true); setSearchResults(await searchStudents(q)); setIsSearching(false); } else setSearchResults([]); }} className="w-full !pl-16 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl outline-none" placeholder="Search child..." />
                                                {searchResults.length > 0 && <div className="absolute top-full left-0 w-full mt-2 bg-white rounded-xl shadow-xl border z-50 max-h-40 overflow-y-auto">{searchResults.map(s => <button key={s._id} type="button" onClick={() => { setSelectedChildren(p => [...p, s]); setChildSearchQuery(''); setSearchResults([]); }} className="w-full px-4 py-2 text-left hover:bg-gray-50 text-sm font-medium">{s.name} ({s.rollNo})</button>)}</div>}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-primary-500" />
                                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full !pl-16 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl outline-none" placeholder="Email Address" />
                            </div>
                            <div className="relative group">
                                <div className="flex justify-between items-center mb-1 ml-1"><label className="text-sm font-semibold text-gray-700">Password</label>{isLogin && <Link to="/forgot-password" title="Forgot?" className="text-sm text-black font-medium">Forgot?</Link>}</div>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-primary-500" />
                                    <input 
                                        type={showPassword ? "text" : "password"} 
                                        required 
                                        value={password} 
                                        onChange={(e) => setPassword(e.target.value)} 
                                        className="w-full !pl-12 !pr-12 py-3.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:ring-4 focus:ring-primary-100 transition-all" 
                                        placeholder="••••••••" 
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary-500 transition-colors"
                                    >
                                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>
                            <button type="submit" disabled={loading} className="w-full py-4 bg-primary-600 text-white font-bold rounded-xl shadow-lg hover:shadow-primary-500/50 transition-all flex justify-center items-center gap-2">{loading ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <>{isLogin ? 'Sign In' : 'Create Account'}<ArrowRight className="w-5 h-5" /></>}</button>
                        </form>
                        <div className="mt-8 text-center bg-gray-50 p-5 rounded-2xl border-dashed border border-gray-200"><p className="text-sm text-gray-600 font-medium">{isLogin ? "New user?" : "Already user?"}<button onClick={() => { setIsLogin(!isLogin); setError(''); }} className="ml-2 font-bold text-primary-600">{isLogin ? 'Create Account' : 'Sign In'}</button></p></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// 2. FORGOT PASSWORD PAGE
export const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState(1); // 1: Email, 2: OTP & New Password
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const inputRefs = [useRef(), useRef(), useRef(), useRef(), useRef(), useRef()];

    const handleOtpChange = (index, value) => {
        if (isNaN(value)) return;
        const newOtp = [...otp];
        newOtp[index] = value.substring(value.length - 1);
        setOtp(newOtp);
        if (value && index < 5) inputRefs[index + 1].current.focus();
    };

    const handleKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) inputRefs[index - 1].current.focus();
    };

    const handleEmailSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await api.post('/auth/forgotpassword', { email });
            setStep(2);
        } catch (err) {
            setError(err.response?.data?.message || 'Error occurred');
        } finally {
            setLoading(false);
        }
    };

    const handleResetSubmit = async (e) => {
        e.preventDefault();
        const otpValue = otp.join('');
        if (otpValue.length < 6) return setError('Enter 6-digit OTP');
        if (!password) return setError('Password is required');

        setLoading(true);
        setError('');
        try {
            await api.post('/auth/resetpassword-otp', { email, otp: otpValue, password });
            setSuccess(true);
        } catch (err) {
            setError(err.response?.data?.message || 'Reset failed');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-8 text-center animate-in zoom-in">
                    <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-6" />
                    <h2 className="text-3xl font-extrabold text-black">Success!</h2>
                    <p className="text-gray-500 mt-2 mb-8">Your password has been reset successfully.</p>
                    <Link to="/login" className="block w-full py-4 bg-primary-600 text-white font-bold rounded-xl shadow-lg">Back to Sign In</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-8 md:p-12 relative animate-in zoom-in border border-white/20">
                <div className="text-center mb-10">
                    <div className="w-20 h-20 bg-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-primary-500/20">
                        {step === 1 ? <Mail className="w-10 h-10 text-white" /> : <Lock className="w-10 h-10 text-white" />}
                    </div>
                    <h2 className="text-3xl font-extrabold text-black">{step === 1 ? 'Forgot?' : 'Reset Password'}</h2>
                    <p className="text-gray-500 mt-3">{step === 1 ? "We'll send an OTP to your email." : "Enter the OTP sent to your email and your new password."}</p>
                </div>

                {step === 1 ? (
                    <form onSubmit={handleEmailSubmit} className="space-y-6">
                        {error && <div className="p-4 bg-red-50 text-red-600 text-sm rounded-xl border flex gap-3"><AlertCircle className="w-5 h-5 flex-shrink-0" />{error}</div>}
                        <div className="relative group">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-primary-500" />
                            <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className="w-full !pl-12 px-4 py-4 bg-gray-50 border rounded-xl outline-none focus:ring-2 focus:ring-primary-500" placeholder="Email Address" />
                        </div>
                        <button type="submit" disabled={loading} className="w-full py-4 bg-primary-600 text-white font-bold rounded-xl shadow-lg flex justify-center gap-2">
                            {loading ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : "Send OTP"}
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleResetSubmit} className="space-y-6">
                        {error && <div className="p-4 bg-red-50 text-red-600 text-sm rounded-xl border flex gap-3"><AlertCircle className="w-5 h-5 flex-shrink-0" />{error}</div>}
                        
                        <div className="flex justify-between gap-2">
                            {otp.map((digit, index) => (
                                <input
                                    key={index}
                                    ref={inputRefs[index]}
                                    type="text"
                                    maxLength="1"
                                    value={digit}
                                    onChange={(e) => handleOtpChange(index, e.target.value)}
                                    onKeyDown={(e) => handleKeyDown(index, e)}
                                    className="w-full h-12 text-center text-xl font-bold bg-gray-50 border rounded-xl focus:border-primary-500 outline-none"
                                />
                            ))}
                        </div>

                        <div className="relative group">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-primary-500" />
                            <input 
                                type={showPassword ? "text" : "password"} 
                                required 
                                value={password} 
                                onChange={e => setPassword(e.target.value)} 
                                className="w-full !pl-12 px-4 py-4 bg-gray-50 border rounded-xl outline-none focus:ring-2 focus:ring-primary-500" 
                                placeholder="New Password" 
                            />
                            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                        </div>

                        <button type="submit" disabled={loading} className="w-full py-4 bg-primary-600 text-white font-bold rounded-xl shadow-lg flex justify-center gap-2">
                            {loading ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : "Reset Password"}
                        </button>
                    </form>
                )}

                <div className="mt-10 text-center">
                    <Link to="/login" className="text-gray-500 text-sm font-bold flex items-center justify-center gap-2"><ArrowLeft className="w-4 h-4" />Back to Sign In</Link>
                </div>
            </div>
        </div>
    );
};


// 4. VERIFY EMAIL PAGE
export const VerifyEmail = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const initialEmail = queryParams.get('email') || '';

    const [email, setEmail] = useState(initialEmail);
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [loading, setLoading] = useState(false);
    const [resendLoading, setResendLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [resendMessage, setResendMessage] = useState('');

    const inputRefs = [useRef(), useRef(), useRef(), useRef(), useRef(), useRef()];

    const handleOtpChange = (index, value) => {
        if (isNaN(value)) return;
        const newOtp = [...otp];
        newOtp[index] = value.substring(value.length - 1);
        setOtp(newOtp);

        if (value && index < 5) {
            inputRefs[index + 1].current.focus();
        }
    };

    const handleKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs[index - 1].current.focus();
        }
    };

    const handleVerify = async (e) => {
        e.preventDefault();
        setError('');
        const otpValue = otp.join('');
        if (otpValue.length < 6) return setError('Please enter 6-digit code');

        setLoading(true);
        try {
            const response = await api.post('/auth/verify-otp', { email, otp: otpValue });
            if (response.data.success) {
                // Direct Login: Save user and token
                const userData = response.data.user;
                localStorage.setItem('nexus_auth_user', JSON.stringify(userData));
                
                setSuccess(true);
                // Delay redirect to show anime animation
                setTimeout(() => {
                    const r = userData.role;
                    navigate(r === 'admin' ? '/admin' : r === 'faculty' ? '/faculty' : r === 'student' ? '/student' : r === 'parent' ? '/parent' : '/');
                }, 6000);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Verification failed');
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        if (!email) return setError('Email is required to resend OTP');
        setResendLoading(true);
        setResendMessage('');
        setError('');
        try {
            const response = await api.post('/auth/resend-otp', { email });
            setResendMessage(response.data.message || 'OTP resent successfully!');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to resend OTP');
        } finally {
            setResendLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 relative overflow-hidden">
            {/* Anime Welcome Modal */}
            {success && <WelcomeAnimeModal name={JSON.parse(localStorage.getItem('nexus_auth_user'))?.name || 'User'} />}

            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary-200/20 rounded-full blur-[100px]"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-200/20 rounded-full blur-[100px]"></div>
            </div>

            <div className={`max-w-md w-full bg-white rounded-3xl shadow-2xl p-8 md:p-12 relative z-10 transition-all duration-500 ${success ? 'opacity-0 scale-95 pointer-events-none' : 'animate-in zoom-in'}`}>
                <div className="text-center mb-10">
                    <div className="w-20 h-20 bg-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-primary-500/20 ring-4 ring-primary-50">
                        <Shield className="w-10 h-10 text-white" />
                    </div>
                    <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Verify Account</h2>
                    <p className="text-gray-500 mt-3 font-medium">Enter the 6-digit code sent to your email.</p>
                    
                    {email ? (
                        <div className="flex items-center justify-center gap-2 mt-2">
                            <p className="text-primary-600 font-bold truncate max-w-[200px]">{email}</p>
                            <button 
                                onClick={() => setEmail('')} 
                                className="text-xs text-gray-400 hover:text-red-500 font-bold underline"
                            >
                                Change
                            </button>
                        </div>
                    ) : (
                        <div className="mt-4 px-2">
                            <input 
                                type="email" 
                                placeholder="Enter your email" 
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none text-sm text-center"
                            />
                        </div>
                    )}
                </div>

                <form onSubmit={handleVerify} className="space-y-8">
                    {error && (
                        <div className="p-4 bg-red-50 text-red-600 text-sm rounded-2xl border border-red-100 flex gap-3 animate-shake">
                            <AlertCircle className="w-5 h-5 flex-shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}

                    {resendMessage && (
                        <div className="p-4 bg-emerald-50 text-emerald-600 text-sm rounded-2xl border border-emerald-100 flex gap-3">
                            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                            <span>{resendMessage}</span>
                        </div>
                    )}

                    <div className="flex justify-between gap-2 sm:gap-4">
                        {otp.map((digit, index) => (
                            <input
                                key={index}
                                ref={inputRefs[index]}
                                type="text"
                                maxLength="1"
                                value={digit}
                                onChange={(e) => handleOtpChange(index, e.target.value)}
                                onKeyDown={(e) => handleKeyDown(index, e)}
                                className="w-full h-14 sm:h-16 text-center text-2xl font-bold bg-gray-50 border-2 border-gray-100 rounded-2xl focus:bg-white focus:border-primary-500 focus:ring-4 focus:ring-primary-100 outline-none transition-all"
                            />
                        ))}
                    </div>

                    <div className="space-y-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 bg-primary-600 text-white font-bold rounded-2xl shadow-xl hover:shadow-primary-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all flex justify-center items-center gap-3 disabled:opacity-70 disabled:hover:scale-100"
                        >
                            {loading ? (
                                <span className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>Verify Account <ArrowRight className="w-5 h-5" /></>
                            )}
                        </button>

                        <button
                            type="button"
                            onClick={handleResend}
                            disabled={resendLoading}
                            className="w-full py-3 text-sm font-bold text-gray-500 hover:text-primary-600 transition-colors flex items-center justify-center gap-2"
                        >
                            {resendLoading ? (
                                <RefreshCw className="w-4 h-4 animate-spin" />
                            ) : (
                                <RefreshCw className="w-4 h-4" />
                            )}
                            Didn't receive code? Resend
                        </button>
                    </div>
                </form>

                <div className="mt-10 text-center">
                    <Link to="/login" className="text-gray-500 text-sm font-bold flex items-center justify-center gap-2 hover:text-primary-600 transition-colors">
                        <ArrowLeft className="w-4 h-4" /> Back to Sign In
                    </Link>
                </div>
            </div>
        </div>
    );
};

const WelcomeAnimeModal = ({ name }) => {
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden bg-primary-950/90 backdrop-blur-xl animate-in fade-in duration-500">
            {/* Action Speed Lines Background */}
            <div className="absolute inset-0 opacity-20">
                {[...Array(20)].map((_, i) => (
                    <div
                        key={i}
                        className="absolute h-[2px] bg-white rounded-full animate-speed-line"
                        style={{
                            width: `${Math.random() * 200 + 100}px`,
                            left: `-200px`,
                            top: `${Math.random() * 100}%`,
                            animationDelay: `${Math.random() * 2}s`,
                            animationDuration: `${Math.random() * 0.5 + 0.2}s`
                        }}
                    ></div>
                ))}
            </div>

            <div className="relative z-10 text-center px-4">
                <div className="relative inline-block mb-8">
                    <div className="absolute -inset-4 bg-primary-500 rounded-full blur-2xl opacity-50 animate-pulse"></div>
                    <div className="relative w-32 h-32 bg-white rounded-full flex items-center justify-center shadow-[0_0_50px_rgba(79,70,229,0.6)] animate-anime-bounce border-4 border-primary-500 overflow-hidden">
                        <img 
                            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${name}&backgroundColor=b6e3f4`} 
                            alt="Avatar" 
                            className="w-full h-full object-cover"
                        />
                    </div>
                    {/* Impact Circles */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full border-4 border-primary-400 rounded-full animate-ping-once"></div>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full border-2 border-white rounded-full animate-ping-once-delay"></div>
                </div>

                <div className="space-y-4 overflow-hidden">
                    <h2 className="text-5xl md:text-7xl font-black text-white italic tracking-tighter uppercase animate-anime-text-slide">
                        Welcome!
                    </h2>
                    <p className="text-primary-300 text-2xl md:text-3xl font-bold tracking-widest uppercase animate-anime-text-fade">
                        {name}
                    </p>
                    <div className="h-1.5 w-0 bg-primary-500 mx-auto rounded-full animate-anime-bar"></div>
                </div>

                <div className="mt-12 flex justify-center gap-4 animate-anime-text-fade delay-500">
                    <div className="px-6 py-2 bg-white/10 backdrop-blur-md rounded-full text-white text-xs font-bold tracking-widest border border-white/20">
                        SUCCESS VERIFIED
                    </div>
                    <div className="px-6 py-2 bg-primary-600 rounded-full text-white text-xs font-bold tracking-widest shadow-lg shadow-primary-500/50">
                        ENTERING NEXUS
                    </div>
                </div>
            </div>

            {/* Success Burst Overlay */}
            <div className="absolute inset-0 pointer-events-none bg-white animate-flash-white opacity-0"></div>

            <style dangerouslySetInnerHTML={{ __html: `
                @keyframes speed-line {
                    0% { transform: translateX(0); opacity: 0; }
                    50% { opacity: 1; }
                    100% { transform: translateX(2000px); opacity: 0; }
                }
                @keyframes anime-bounce {
                    0%, 100% { transform: scale(1); }
                    50% { transform: scale(1.1) translateY(-10px); }
                }
                @keyframes anime-text-slide {
                    0% { transform: translateX(-100%) skew(-20deg); opacity: 0; }
                    70% { transform: translateX(10%) skew(-20deg); opacity: 1; }
                    100% { transform: translateX(0) skew(0deg); opacity: 1; }
                }
                @keyframes anime-text-fade {
                    0% { opacity: 0; transform: translateY(20px); }
                    100% { opacity: 1; transform: translateY(0); }
                }
                @keyframes anime-bar {
                    0% { width: 0; }
                    100% { width: 200px; }
                }
                @keyframes ping-once {
                    0% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
                    100% { transform: translate(-50%, -50%) scale(3); opacity: 0; }
                }
                @keyframes flash-white {
                    0% { opacity: 0; }
                    10% { opacity: 0.8; }
                    100% { opacity: 0; }
                }
                .animate-speed-line { animation: speed-line linear infinite; }
                .animate-anime-bounce { animation: anime-bounce 0.6s ease-in-out infinite; }
                .animate-anime-text-slide { animation: anime-text-slide 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
                .animate-anime-text-fade { animation: anime-text-fade 0.8s ease-out forwards; animation-delay: 0.3s; opacity: 0; }
                .animate-anime-bar { animation: anime-bar 1s ease-out forwards; animation-delay: 0.5s; }
                .animate-ping-once { animation: ping-once 0.8s ease-out forwards; }
                .animate-ping-once-delay { animation: ping-once 0.8s ease-out 0.2s forwards; }
                .animate-flash-white { animation: flash-white 0.8s ease-out 0.1s forwards; }
            `}} />
        </div>
    );
};
