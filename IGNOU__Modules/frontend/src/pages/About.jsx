import React from 'react';
import { Link } from 'react-router-dom';
import { 
  GraduationCap, Shield, BookOpen, Users, 
  ArrowRight, CheckCircle, Award, Globe
} from 'lucide-react';

const About = () => {
  return (
    <div className="min-h-screen bg-white relative overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-br from-primary-50 to-blue-50 -z-10 skew-y-3 origin-top-left"></div>
      
      {/* Navigation (Simple) */}
      <nav className="max-w-7xl mx-auto px-6 py-8 flex justify-between items-center relative z-10">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="bg-primary-600 p-2 rounded-xl group-hover:scale-110 transition-transform">
            <GraduationCap className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl font-black text-gray-900 tracking-tight">Nexus <span className="text-primary-600 italic">IMS</span></span>
        </Link>
        <div className="flex gap-8 items-center font-bold text-sm text-gray-600">
          <Link to="/about" className="text-primary-600">About Us</Link>
          <Link to="/contact" className="hover:text-primary-600 transition-colors">Contact</Link>
          <Link to="/login" className="px-6 py-2.5 bg-primary-600 text-white rounded-xl shadow-lg shadow-primary-200 hover:shadow-primary-300 transition-all">Sign In</Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 pt-20 pb-32 relative z-10">
        <div className="flex flex-col md:flex-row items-center gap-16">
          <div className="md:w-1/2 space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary-100 text-primary-700 rounded-full text-xs font-bold tracking-widest uppercase">
              <Award className="w-4 h-4" /> Leading the Education Tech
            </div>
            <h1 className="text-5xl md:text-7xl font-black text-gray-900 leading-tight">
              Empowering Education through <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-blue-600">Innovation</span>
            </h1>
            <p className="text-lg text-gray-600 leading-relaxed max-w-lg">
              Nexus IMS is a next-generation Institute Management System designed to bridge the gap between students, faculty, and administration with seamless technological integration.
            </p>
            <div className="flex gap-4">
              <Link to="/login" className="px-8 py-4 bg-primary-600 text-white font-bold rounded-2xl shadow-xl hover:shadow-primary-300 hover:scale-105 transition-all flex items-center gap-2">
                Get Started <ArrowRight className="w-5 h-5" />
              </Link>
              <Link to="/contact" className="px-8 py-4 bg-gray-50 text-gray-900 border border-gray-200 font-bold rounded-2xl hover:bg-gray-100 transition-all">
                Contact Sales
              </Link>
            </div>
          </div>
          <div className="md:w-1/2 relative">
            <div className="absolute -inset-4 bg-primary-200 rounded-[40px] blur-3xl opacity-20 animate-pulse"></div>
            <div className="relative bg-white p-4 rounded-[40px] shadow-2xl border border-gray-100 overflow-hidden group">
              <img 
                src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80" 
                alt="Our Team" 
                className="w-full h-[400px] object-cover rounded-[32px] group-hover:scale-105 transition-transform duration-700" 
              />
              <div className="absolute bottom-10 left-10 right-10 bg-white/90 backdrop-blur-md p-6 rounded-3xl border border-white/50 shadow-xl">
                <div className="flex items-center gap-4">
                  <div className="flex -space-x-2">
                    {[1, 2, 3, 4].map(i => (
                      <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-gray-100 overflow-hidden">
                        <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i}`} alt="user" />
                      </div>
                    ))}
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">5000+ Users</h4>
                    <p className="text-xs text-gray-500 font-medium">Across multiple institutes nationwide</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Features */}
      <section className="bg-gray-50 py-32">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
            <h2 className="text-4xl font-black text-gray-900">Why Choose Nexus IMS?</h2>
            <p className="text-gray-600">We provide all-in-one solutions to manage every aspect of your educational institute efficiently.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { 
                icon: <Shield className="w-8 h-8 text-indigo-600" />, 
                title: "Maximum Security", 
                desc: "Enterprise-grade security protocols ensuring student and financial data safety at all times." 
              },
              { 
                icon: <BookOpen className="w-8 h-8 text-blue-600" />, 
                title: "Academic Excellence", 
                desc: "Integrated curriculum management, automated grading, and real-time attendance tracking." 
              },
              { 
                icon: <Globe className="w-8 h-8 text-emerald-600" />, 
                title: "Centralized Portal", 
                desc: "A single dashboard for parents, students, and faculty to interact and access resources." 
              }
            ].map((feature, idx) => (
              <div key={idx} className="bg-white p-10 rounded-[32px] border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300">
                <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mb-8">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.desc}</p>
                <div className="mt-8 pt-8 border-t border-gray-50">
                  <Link to="/contact" className="text-primary-600 font-bold text-sm flex items-center gap-2 hover:gap-3 transition-all">
                    Learn more <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>



      {/* Footer */}
      <footer className="border-t border-gray-100 py-12">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            <div className="bg-gray-100 p-1.5 rounded-lg">
              <GraduationCap className="w-5 h-5 text-gray-900" />
            </div>
            <span className="font-bold text-gray-900">Nexus IMS</span>
          </div>
          <div className="flex gap-8 text-sm font-medium text-gray-500">
             <Link to="/about" className="hover:text-primary-600">Company</Link>
             <Link to="/contact" className="hover:text-primary-600">Contact</Link>
             <a href="#" className="hover:text-primary-600">Privacy Policy</a>
             <a href="#" className="hover:text-primary-600">Terms of Service</a>
          </div>
          <p className="text-xs text-gray-400">© 2026 Nexus Institute Management System. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default About;
