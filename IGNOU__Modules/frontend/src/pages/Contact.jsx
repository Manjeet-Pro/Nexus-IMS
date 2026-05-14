import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  GraduationCap, Mail, Phone, MapPin, 
  Send, MessageCircle, Clock, Globe,
  ArrowLeft, CheckCircle2, AlertCircle
} from 'lucide-react';

const Contact = () => {
    const [formState, setFormState] = useState('idle'); // idle, loading, success, error
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: 'General Inquiry',
        message: ''
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        setFormState('loading');
        // Simulate API call
        setTimeout(() => {
            setFormState('success');
            setFormData({ name: '', email: '', subject: 'General Inquiry', message: '' });
        }, 1500);
    };

    return (
        <div className="min-h-screen bg-white relative overflow-hidden">
            {/* Background Decorations */}
            <div className="absolute top-0 right-0 w-full h-[600px] bg-gradient-to-bl from-primary-50 to-indigo-50 -z-10 skew-y-3 origin-top-right"></div>
            
            {/* Navigation (Simple) */}
            <nav className="max-w-7xl mx-auto px-6 py-8 flex justify-between items-center relative z-10">
                <Link to="/" className="flex items-center gap-2 group">
                    <div className="bg-primary-600 p-2 rounded-xl group-hover:scale-110 transition-transform">
                        <GraduationCap className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-2xl font-black text-gray-900 tracking-tight">Nexus <span className="text-primary-600 italic">IMS</span></span>
                </Link>
                <div className="flex gap-8 items-center font-bold text-sm text-gray-600">
                    <Link to="/about" className="hover:text-primary-600 transition-colors">About Us</Link>
                    <Link to="/contact" className="text-primary-600">Contact</Link>
                    <Link to="/login" className="px-6 py-2.5 bg-primary-600 text-white rounded-xl shadow-lg shadow-primary-200 hover:shadow-primary-300 transition-all">Sign In</Link>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto px-6 py-20 relative z-10">
                <div className="flex flex-col lg:flex-row gap-16">
                    {/* Contact Info Side */}
                    <div className="lg:w-1/3 space-y-12">
                        <div className="space-y-4">
                            <h1 className="text-5xl font-black text-gray-900 tracking-tight">Get in <span className="text-primary-600">Touch</span></h1>
                            <p className="text-gray-600 text-lg">Have questions about Nexus IMS? Our team is here to help you revolutionize your institute management.</p>
                        </div>

                        <div className="space-y-8">
                            {[
                                { 
                                    icon: <Mail className="w-6 h-6 text-primary-600" />, 
                                    label: "Email Address", 
                                    value: "support@nexusims.com", 
                                    sub: "Response within 24 hours" 
                                },
                                { 
                                    icon: <Phone className="w-6 h-6 text-emerald-600" />, 
                                    label: "Phone Number", 
                                    value: "+91 88XXXXXXXX", 
                                    sub: "Mon - Fri, 9am - 6pm" 
                                },
                                { 
                                    icon: <MapPin className="w-6 h-6 text-orange-600" />, 
                                    label: " Place", 
                                    value: "Nexus IMS", 
                                    sub: "Delhi, India" 
                                }
                            ].map((item, idx) => (
                                <div key={idx} className="flex gap-6 items-start group">
                                    <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center border border-gray-100 shadow-sm group-hover:shadow-md group-hover:-translate-y-1 transition-all">
                                        {item.icon}
                                    </div>
                                    <div>
                                        <h4 className="text-gray-400 font-bold text-xs uppercase tracking-widest mb-1">{item.label}</h4>
                                        <p className="text-gray-900 font-black text-lg">{item.value}</p>
                                        <p className="text-gray-500 text-sm font-medium">{item.sub}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Social Badges */}
                        <div className="pt-8 border-t border-gray-100">
                             <div className="flex gap-4">
                                {[MessageCircle, Globe, Clock].map((Icon, idx) => (
                                    <div key={idx} className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 hover:bg-primary-600 hover:text-white transition-all cursor-pointer">
                                        <Icon className="w-5 h-5" />
                                    </div>
                                ))}
                             </div>
                        </div>
                    </div>

                    {/* Form Side */}
                    <div className="lg:w-2/3">
                        <div className="bg-white p-8 md:p-12 rounded-[48px] border border-gray-100 shadow-2xl relative overflow-hidden group">
                           {/* Decorative Circle */}
                           <div className="absolute top-0 right-0 w-64 h-64 bg-primary-50 rounded-full blur-[100px] -mr-32 -mt-32"></div>
                           
                           {formState === 'success' ? (
                               <div className="h-full flex flex-col items-center justify-center text-center space-y-6 py-20 animate-in zoom-in duration-500">
                                   <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 mb-4 animate-bounce">
                                       <CheckCircle2 className="w-12 h-12" />
                                   </div>
                                   <h2 className="text-3xl font-black text-gray-900">Message Sent!</h2>
                                   <p className="text-gray-500 max-w-sm mx-auto">Thank you for reaching out. A Nexus technician will contact you shortly.</p>
                                   <button 
                                       onClick={() => setFormState('idle')}
                                       className="px-8 py-3 bg-gray-900 text-white font-bold rounded-2xl hover:bg-primary-600 transition-all flex items-center gap-2"
                                   >
                                       <ArrowLeft className="w-4 h-4" /> Send Another Message
                                   </button>
                               </div>
                           ) : (
                               <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
                                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                       <div className="space-y-2">
                                           <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Full Name</label>
                                           <input 
                                                required
                                                type="text" 
                                                placeholder="John Doe" 
                                                value={formData.name}
                                                onChange={(e) => setFormData({...formData, name: e.target.value})}
                                                className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-4 focus:ring-primary-100 transition-all" 
                                            />
                                       </div>
                                       <div className="space-y-2">
                                           <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Email Address</label>
                                           <input 
                                                required
                                                type="email" 
                                                placeholder="john@example.com" 
                                                value={formData.email}
                                                onChange={(e) => setFormData({...formData, email: e.target.value})}
                                                className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-4 focus:ring-primary-100 transition-all" 
                                            />
                                       </div>
                                   </div>

                                   <div className="space-y-2">
                                       <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Subject</label>
                                       <select 
                                            value={formData.subject}
                                            onChange={(e) => setFormData({...formData, subject: e.target.value})}
                                            className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-4 focus:ring-primary-100 appearance-none transition-all cursor-pointer"
                                       >
                                           <option>General Inquiry</option>
                                           <option>Technical Support</option>
                                           <option>Billing Question</option>
                                           <option>Request a Demo</option>
                                       </select>
                                   </div>

                                   <div className="space-y-2">
                                       <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Your Message</label>
                                       <textarea 
                                            required
                                            rows="6" 
                                            placeholder="Tell us how we can help..." 
                                            value={formData.message}
                                            onChange={(e) => setFormData({...formData, message: e.target.value})}
                                            className="w-full px-6 py-4 bg-gray-50 border-none rounded-3xl focus:ring-4 focus:ring-primary-100 transition-all resize-none"
                                        ></textarea>
                                   </div>

                                   <div className="pt-4">
                                       <button 
                                            disabled={formState === 'loading'}
                                            type="submit" 
                                            className="w-full py-5 bg-primary-600 text-white font-black text-lg rounded-[24px] shadow-2xl shadow-primary-200 hover:shadow-primary-400 hover:scale-[1.02] active:scale-[0.98] transition-all flex justify-center items-center gap-4 disabled:opacity-70"
                                        >
                                           {formState === 'loading' ? (
                                               <span className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                                           ) : (
                                               <>Send Message <Send className="w-6 h-6" /></>
                                           )}
                                       </button>
                                   </div>
                               </form>
                           )}
                        </div>

                        {/* Additional Help Context */}
                        <div className="mt-12 p-8 bg-gray-50 rounded-[32px] border border-gray-100 flex flex-col md:flex-row items-center justify-between gap-8 group">
                            <div className="flex items-center gap-6">
                                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-primary-600 border border-gray-100">
                                    <AlertCircle className="w-6 h-6" />
                                </div>
                                <div>
                                    <h5 className="text-gray-900 font-bold">Frequently Asked?</h5>
                                    <p className="text-gray-500 text-sm font-medium">Check our documentation for quick answers.</p>
                                </div>
                            </div>
                            <Link to="/about" className="px-6 py-3 bg-white text-gray-900 font-bold rounded-xl border border-gray-100 hover:bg-gray-900 hover:text-white transition-all shadow-sm">
                                View FAQ
                            </Link>
                        </div>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="border-t border-gray-100 py-12 relative z-10">
                <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="flex items-center gap-2">
                        <div className="bg-gray-100 p-1.5 rounded-lg">
                            <GraduationCap className="w-5 h-5 text-gray-900" />
                        </div>
                        <span className="font-bold text-gray-900">Nexus IMS</span>
                    </div>
                    <p className="text-xs text-gray-400">© 2026 Nexus Institute Management System. All rights reserved.</p>
                    <div className="flex gap-6 text-xs font-bold text-gray-400 uppercase tracking-widest">
                         <a href="#" className="hover:text-primary-600">Privacy</a>
                         <a href="#" className="hover:text-primary-600">Terms</a>
                         <a href="#" className="hover:text-primary-600">GDPR</a>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Contact;
