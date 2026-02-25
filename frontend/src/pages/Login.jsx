import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login, register, searchStudents } from '../utils/auth';
import { GraduationCap, User, Shield, BookOpen, Mail, Lock, ArrowRight, CheckCircle2, Search, X, Plus } from 'lucide-react';

const LoginPage = () => {
    const navigate = useNavigate();
    const [isLogin, setIsLogin] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Login State
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [shake, setShake] = useState(false);

    const triggerShake = () => {
        setShake(true);
        setTimeout(() => setShake(false), 500);
    };

    // Sign Up State
    const [fullName, setFullName] = useState('');
    const [role, setRole] = useState('student');

    // Parent Child Linking State
    const [childSearchQuery, setChildSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [selectedChildren, setSelectedChildren] = useState([]);
    const [isSearching, setIsSearching] = useState(false);

    const handleAuth = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (isLogin) {
                // Login Logic
                const result = await login(email, password);
                if (result.success) {
                    const userRole = result.user.role;
                    if (userRole === 'admin') navigate('/admin');
                    else if (userRole === 'faculty') navigate('/faculty');
                    else if (userRole === 'student') navigate('/student');
                    else if (userRole === 'parent') navigate('/parent');
                    else navigate('/');
                } else {
                    setError(result.message);
                    triggerShake();
                }
            } else {
                // Sign Up Logic
                const result = await register({
                    name: fullName,
                    email,
                    password,
                    role: role.toLowerCase(),
                    extraData: role === 'parent' ? {
                        childrenRollNos: selectedChildren.map(c => c.rollNo)
                    } : {}
                });

                if (result.success) {
                    alert(result.message || `Account created successfully! Please check your email to verify your account.`);
                    setIsLogin(true); // Switch to login view
                    setError(''); // Clear any errors
                } else {
                    setError(result.message);
                    triggerShake();
                }
            }
        } catch (err) {
            console.error("Login/Register Error:", err);
            setError(err.response?.data?.message || err.message || 'An unexpected error occurred.');
            triggerShake();
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

            <div className="max-w-5xl w-full bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row relative z-10 animate-in fade-in zoom-in duration-500">

                {/* Left Side - Visual & Branding */}
                <div className="md:w-1/2 bg-gradient-to-br from-primary-600 to-primary-900 p-12 text-white flex flex-col justify-between relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-full h-full bg-[url('https://images.unsplash.com/photo-1523050854058-8df90110c9f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80')] bg-cover opacity-10 mix-blend-overlay transition-opacity duration-700 group-hover:opacity-20"></div>

                    {/* Floating Shapes */}
                    <div className="absolute top-10 right-10 w-20 h-20 bg-white/10 rounded-full blur-xl animate-float"></div>
                    <div className="absolute bottom-20 left-10 w-32 h-32 bg-white/10 rounded-full blur-xl animate-float-delayed"></div>

                    <div className="relative z-10 text-center">
                        <div className="bg-white/10 w-32 h-32 rounded-full flex items-center justify-center backdrop-blur-md mb-8 shadow-2xl border border-white/20 animate-in slide-in-from-top-4 duration-700 mx-auto p-4">
                            <img src="/logo.png" alt="Nexus Logo" className="w-full h-full object-cover rounded-full drop-shadow-lg" />
                        </div>
                        <h1 className="text-5xl font-extrabold mb-3 tracking-tight leading-tight animate-in slide-in-from-left-4 duration-700 delay-100 drop-shadow-md">
                            Nexus <span className="text-primary-200">IMS</span>
                        </h1>
                        <p className="text-primary-100 text-lg opacity-90 max-w-sm animate-in slide-in-from-left-4 duration-700 delay-200 leading-relaxed mx-auto">
                            Empowering education with advanced management tools and seamless connectivity.
                        </p>
                    </div>

                    <div className="relative z-10 space-y-5 mt-12 animate-in slide-in-from-bottom-4 duration-700 delay-300">
                        <div className="flex items-center gap-4 p-4 bg-white/10 rounded-2xl backdrop-blur-md border border-white/5 hover:bg-white/20 transition-all duration-300 transform hover:translate-x-2">
                            <div className="p-2.5 bg-gradient-to-br from-white/20 to-white/5 rounded-xl text-white shadow-sm">
                                <Shield className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="font-bold text-white tracking-wide">Secure Platform</h3>
                                <p className="text-xs text-primary-100/80 mt-0.5">Enterprise-grade security standards</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 p-4 bg-white/10 rounded-2xl backdrop-blur-md border border-white/5 hover:bg-white/20 transition-all duration-300 transform hover:translate-x-2">
                            <div className="p-2.5 bg-gradient-to-br from-white/20 to-white/5 rounded-xl text-white shadow-sm">
                                <BookOpen className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="font-bold text-white tracking-wide">Smart Learning</h3>
                                <p className="text-xs text-primary-100/80 mt-0.5">Comprehensive academic resources</p>
                            </div>
                        </div>
                    </div>

                    <div className="relative z-10 mt-auto pt-8 flex items-center gap-2 text-xs text-primary-200/60">
                        <span>© 2026 Nexus Institute</span>
                        <span className="w-1 h-1 rounded-full bg-primary-200/60"></span>
                        <span>v1.0.0</span>
                    </div>
                </div>

                {/* Right Side - Form */}
                <div className="md:w-1/2 p-8 md:p-12 bg-white flex flex-col justify-center relative">
                    <div className="max-w-md mx-auto w-full">
                        <div className="mb-10 text-center md:text-left">
                            <h2 className="text-3xl font-extrabold text-gray-900 mb-2 tracking-tight">
                                {isLogin ? 'Welcome Back' : 'Create Account'}
                            </h2>
                            <p className="text-gray-500">
                                {isLogin ? 'Enter your credentials to access your dashboard.' : 'Fill in your details to get started.'}
                            </p>
                        </div>

                        {error && (
                            <div className={`mb-6 p-4 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100 flex items-start gap-3 shadow-sm ${shake ? 'animate-shake' : ''}`}>
                                <Shield className="w-5 h-5 mt-0.5 flex-shrink-0" />
                                <div>
                                    <span className="font-medium block mb-0.5">Authentication Error</span>
                                    {error}
                                </div>
                            </div>
                        )}

                        <form onSubmit={handleAuth} className="space-y-5">
                            {!isLogin && (
                                <div className="space-y-4 animate-in slide-in-from-bottom-5 fade-in duration-500">
                                    <div className="group">
                                        <label className="block text-sm font-semibold text-gray-700 mb-1.5 ml-1">Full Name</label>
                                        <div className="relative transition-all duration-300 transform group-focus-within:-translate-y-1">
                                            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-primary-500 transition-colors" />
                                            <input
                                                type="text"
                                                required
                                                value={fullName}
                                                onChange={(e) => setFullName(e.target.value)}
                                                className="w-full !pl-16 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-4 focus:ring-primary-100 focus:border-primary-500 outline-none transition-all duration-300 font-medium placeholder:text-gray-400 shadow-sm group-focus-within:shadow-md"
                                                placeholder="Manjeet"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1.5 ml-1">Role</label>
                                        <div className="flex bg-gray-100 p-1.5 rounded-xl gap-1">
                                            {['student', 'faculty', 'admin', 'parent'].map((r) => (
                                                <button
                                                    key={r}
                                                    type="button"
                                                    onClick={() => setRole(r)}
                                                    className={`flex-1 py-2.5 text-sm font-semibold rounded-lg capitalize transition-all duration-300 relative overflow-hidden ${role === r
                                                        ? 'bg-white text-primary-600 shadow-md ring-1 ring-black/5'
                                                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'
                                                        }`}
                                                >
                                                    {role === r && (
                                                        <span className="absolute inset-0 bg-primary-50/50 z-0 animate-pulse"></span>
                                                    )}
                                                    <span className="relative z-10 flex items-center justify-center gap-1.5">
                                                        {r}
                                                        {role === r && <CheckCircle2 className="w-3.5 h-3.5" />}
                                                    </span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>


                                    {/* Parent specific field */}
                                    {role === 'parent' && (
                                        <div className="group animate-in slide-in-from-top-2 duration-300 space-y-3">
                                            <label className="block text-sm font-semibold text-gray-700 ml-1">Link Your Children</label>

                                            {/* Selected Children Chips */}
                                            {selectedChildren.length > 0 && (
                                                <div className="flex flex-wrap gap-2 mb-2">
                                                    {selectedChildren.map((child) => (
                                                        <div key={child._id} className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 border border-orange-200">
                                                            <span>{child.name} ({child.rollNo})</span>
                                                            <button
                                                                type="button"
                                                                onClick={() => setSelectedChildren(prev => prev.filter(c => c._id !== child._id))}
                                                                className="hover:bg-orange-200 rounded-full p-0.5"
                                                            >
                                                                <X className="w-3 h-3" />
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            {/* Search Input */}
                                            <div className="relative">
                                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                                <input
                                                    type="text"
                                                    value={childSearchQuery}
                                                    onChange={async (e) => {
                                                        const query = e.target.value;
                                                        setChildSearchQuery(query);
                                                        if (query.length >= 3) {
                                                            setIsSearching(true);
                                                            const results = await searchStudents(query);
                                                            setSearchResults(results);
                                                            setIsSearching(false);
                                                        } else {
                                                            setSearchResults([]);
                                                        }
                                                    }}
                                                    className="w-full !pl-16 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-4 focus:ring-primary-100 focus:border-primary-500 outline-none transition-all duration-300 font-medium placeholder:text-gray-400 shadow-sm"
                                                    placeholder="Search child by Name or Roll No..."
                                                />
                                                {isSearching && (
                                                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                                        <div className="w-4 h-4 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
                                                    </div>
                                                )}

                                                {/* Dropdown Results */}
                                                {searchResults.length > 0 && (
                                                    <div className="absolute top-full left-0 w-full mt-2 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden max-h-60 overflow-y-auto">
                                                        {searchResults.map((student) => {
                                                            const isSelected = selectedChildren.some(c => c._id === student._id);
                                                            return (
                                                                <button
                                                                    key={student._id}
                                                                    type="button"
                                                                    disabled={isSelected}
                                                                    onClick={() => {
                                                                        if (!isSelected) {
                                                                            setSelectedChildren(prev => [...prev, student]);
                                                                            setChildSearchQuery('');
                                                                            setSearchResults([]);
                                                                        }
                                                                    }}
                                                                    className={`w-full text-left px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors ${isSelected ? 'opacity-50 cursor-not-allowed bg-gray-50' : ''}`}
                                                                >
                                                                    <div>
                                                                        <div className="font-semibold text-gray-800">{student.name}</div>
                                                                        <div className="text-xs text-gray-500">{student.rollNo} • {student.course}</div>
                                                                    </div>
                                                                    {!isSelected && <Plus className="w-4 h-4 text-primary-500" />}
                                                                    {isSelected && <CheckCircle2 className="w-4 h-4 text-green-500" />}
                                                                </button>
                                                            );
                                                        })}
                                                    </div>
                                                )}
                                            </div>
                                            <p className="text-xs text-slate-500 ml-1">Type at least 3 characters to search.</p>
                                        </div>
                                    )}
                                </div>
                            )}

                            <div className="group">
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5 ml-1">Email Address</label>
                                <div className="relative transition-all duration-300 transform group-focus-within:-translate-y-1">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-primary-500 transition-colors" />
                                    <input
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full !pl-16 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-4 focus:ring-primary-100 focus:border-primary-500 outline-none transition-all duration-300 font-medium placeholder:text-gray-400 shadow-sm group-focus-within:shadow-md"
                                        placeholder="name@nexus.com"
                                    />
                                </div>
                            </div>

                            <div className="group">
                                <div className="flex justify-between items-center mb-1.5 ml-1">
                                    <label className="block text-sm font-semibold text-gray-700">Password</label>
                                    {isLogin && (
                                        <Link to="/forgot-password" className="text-sm font-medium text-primary-600 hover:text-primary-700 hover:underline transition-all">
                                            Forgot Password?
                                        </Link>
                                    )}
                                </div>
                                <div className="relative transition-all duration-300 transform group-focus-within:-translate-y-1">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-primary-500 transition-colors" />
                                    <input
                                        type="password"
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full !pl-16 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-4 focus:ring-primary-100 focus:border-primary-500 outline-none transition-all duration-300 font-medium placeholder:text-gray-400 shadow-sm group-focus-within:shadow-md"
                                        placeholder="••••••••"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className={`w-full py-4 px-6 bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-700 hover:to-primary-600 text-white font-bold rounded-xl transition-all duration-300 shadow-lg shadow-primary-500/30 hover:shadow-primary-500/50 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] flex items-center justify-center gap-2 mt-2 ${loading ? 'opacity-80 cursor-not-allowed' : ''}`}
                            >
                                {loading ? (
                                    <div className="flex items-center gap-2">
                                        <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        <span>Processing...</span>
                                    </div>
                                ) : (
                                    <>
                                        {isLogin ? 'Sign In' : 'Create Account'}
                                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </button>
                        </form>

                        <div className="mt-8 text-center bg-gray-50/80 p-5 rounded-2xl border border-dashed border-gray-200">
                            <p className="text-sm text-gray-600 font-medium">
                                {isLogin ? "New user?" : "Already have an account?"}
                                <button
                                    onClick={() => {
                                        setIsLogin(!isLogin);
                                        setError('');
                                        setFullName('');
                                        setEmail('');
                                        setPassword('');
                                    }}
                                    className="ml-2 px-3 py-1 bg-white border border-gray-200 rounded-lg text-primary-600 font-bold hover:text-primary-700 hover:bg-primary-50 hover:border-primary-100 transition-all shadow-sm active:scale-95"
                                >
                                    {isLogin ? 'Create Account' : 'Sign In'}
                                </button>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
