import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link, useParams } from 'react-router-dom';
import { login, register, searchStudents } from '../utils/auth';
import api from '../utils/api';
import {
    GraduationCap, User, Shield, BookOpen, Mail, Lock, ArrowRight,
    CheckCircle2, Search, X, Plus, AlertCircle, ArrowLeft, CheckCircle, XCircle
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
                if (result.success) { alert(result.message || `Account created! Check email.`); setIsLogin(true); setError(''); }
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
                    <div className="mt-auto pt-8 text-xs opacity-60 flex gap-2"><span>© 2026 Nexus</span><span>•</span><span>v1.0.0</span></div>
                </div>
                <div className="md:w-1/2 p-8 md:p-12 bg-white flex flex-col justify-center">
                    <div className="max-w-md mx-auto w-full">
                        <h2 className="text-3xl font-extrabold mb-2">{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
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
                                <div className="flex justify-between items-center mb-1 ml-1"><label className="text-sm font-semibold text-gray-700">Password</label>{isLogin && <Link to="/forgot-password" title="Forgot?" className="text-sm text-primary-600 font-medium">Forgot?</Link>}</div>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-primary-500" />
                                    <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full !pl-16 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl outline-none" placeholder="••••••••" />
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
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState('');
    const handleSubmit = async (e) => { e.preventDefault(); setLoading(true); setError(''); try { await api.post('/auth/forgotpassword', { email }); setSubmitted(true); } catch (err) { setError(err.response?.data?.message || 'Error'); } finally { setLoading(false); } };
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-8 md:p-12 relative z-10 animate-in zoom-in border border-white/20">
                <div className="text-center mb-10">
                    <div className="w-20 h-20 bg-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-primary-500/20"><Mail className="w-10 h-10 text-white" /></div>
                    <h2 className="text-3xl font-extrabold">Forgot?</h2>
                    <p className="text-gray-500 mt-3">We'll send reset instructions.</p>
                </div>
                {!submitted ? (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && <div className="p-4 bg-red-50 text-red-600 text-sm rounded-xl border flex gap-3"><Shield className="w-5 h-5 flex-shrink-0" />{error}</div>}
                        <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className="w-full px-4 py-4 bg-gray-50 border rounded-xl outline-none" placeholder="Email Address" />
                        <button type="submit" disabled={loading} className="w-full py-4 bg-primary-600 text-white font-bold rounded-xl shadow-lg flex justify-center gap-2">{loading ? "Sending..." : "Send Reset Link"}</button>
                    </form>
                ) : (
                    <div className="text-center space-y-6"><CheckCircle className="w-16 h-16 text-green-500 mx-auto" /><h3 className="text-xl font-bold">Sent!</h3><p>Check your inbox.</p></div>
                )}
                <div className="mt-10 text-center"><Link to="/login" className="text-gray-500 text-sm font-bold flex items-center justify-center gap-2"><ArrowLeft className="w-4 h-4" />Back to Sign In</Link></div>
            </div>
        </div>
    );
};

// 3. RESET PASSWORD PAGE
export const ResetPassword = () => {
    const { token } = useParams(); const navigate = useNavigate();
    const [password, setPassword] = useState(''); const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false); const [error, setError] = useState('');
    const [success, setSuccess] = useState(false); const [validating, setValidating] = useState(true);
    useEffect(() => { const v = async () => { try { await api.get(`/auth/validate-reset-token/${token}`); } catch { setError('Invalid link'); } finally { setValidating(false); } }; v(); }, [token]);
    const handleSubmit = async e => { e.preventDefault(); if (password !== confirmPassword) return setError("Mismatch"); setLoading(true); try { await api.put(`/auth/resetpassword/${token}`, { password }); setSuccess(true); setTimeout(() => navigate('/login'), 3000); } catch { setError('Error'); } finally { setLoading(false); } };
    if (validating) return <div className="min-h-screen flex items-center justify-center font-medium">Validating...</div>;
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-8 md:p-12 animate-in zoom-in">
                <h2 className="text-3xl font-extrabold text-center mb-10">Reset Password</h2>
                {!success ? (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && <div className="p-4 bg-red-50 text-red-600 text-sm rounded-xl">{error}</div>}
                        <input type="password" required value={password} onChange={e => setPassword(e.target.value)} className="w-full px-4 py-4 bg-gray-50 border rounded-xl" placeholder="New Password" />
                        <input type="password" required value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="w-full px-4 py-4 bg-gray-50 border rounded-xl" placeholder="Confirm" />
                        <button type="submit" disabled={loading} className="w-full py-4 bg-primary-600 text-white font-bold rounded-xl">{loading ? "Updating..." : "Update Password"}</button>
                    </form>
                ) : (
                    <div className="text-center"><CheckCircle className="w-16 h-16 text-green-500 mx-auto" /><h3 className="text-xl font-bold mt-4">Success!</h3><p>Redirecting to login...</p></div>
                )}
            </div>
        </div>
    );
};

// 4. VERIFY EMAIL PAGE
export const VerifyEmail = () => {
    const { token } = useParams(); const [status, setStatus] = useState('verifying'); const [message, setMessage] = useState('Verifying...'); const ran = useRef(false);
    useEffect(() => { if (!token || ran.current) return; ran.current = true; const v = async () => { try { const r = await api.get(`/auth/verifyemail/${token}`); setStatus('success'); setMessage(r.data.message); } catch (e) { setStatus('error'); setMessage(e.response?.data?.message || 'Failed'); } }; v(); }, [token]);
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center text-center p-4">
            <div className="max-w-md w-full mx-auto bg-white p-8 md:p-12 rounded-3xl shadow-2xl">
                <div className="bg-primary-600 w-16 h-16 flex items-center justify-center text-white text-2xl font-bold rounded-xl mx-auto mb-6 shadow-lg">N</div>
                <h2 className="text-3xl font-extrabold mb-8">Email Verification</h2>
                {status === 'verifying' && <div className="animate-spin h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>}
                {status === 'success' && <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />}
                {status === 'error' && <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />}
                <p className="text-lg font-medium mb-8">{message}</p>
                <Link to="/login" className="w-full block py-3 bg-primary-600 text-white font-bold rounded-xl shadow-lg">Back to Login</Link>
            </div>
        </div>
    );
};
