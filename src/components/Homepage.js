import React, { useEffect, useState } from 'react';
import Navbar from './Navbar';
import { useNavigate } from 'react-router-dom';
import { Code2, Zap, Shield, Database, ArrowRight, Sparkles, Terminal, Cpu, Lock } from 'lucide-react';

function Homepage() {
  const navigate = useNavigate();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Animated gradient orb that follows mouse */}
      <div
        className="pointer-events-none fixed inset-0 z-0 transition-opacity duration-300"
        style={{
          background: `radial-gradient(600px at ${mousePosition.x}px ${mousePosition.y}px, rgba(239, 68, 68, 0.15), transparent 80%)`,
        }}
      />

      {/* Grid pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f1f1f_1px,transparent_1px),linear-gradient(to_bottom,#1f1f1f_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_110%)]" />

      {/* Navbar */}
      <nav className="relative z-50 border-b border-white/5 backdrop-blur-xl bg-black/50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-orange-500 blur-lg opacity-50"></div>
              <div className="relative w-9 h-9 rounded-lg bg-gradient-to-br from-red-500 to-orange-600 flex items-center justify-center">
                <Code2 className="w-5 h-5" />
              </div>
            </div>
            <span className="text-lg font-bold tracking-tight">SayrxAI</span>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => navigate('/login')}
              className="px-4 py-2 text-sm text-white/80 hover:text-white transition-colors"
            >
              Sign In
            </button>
            <button
              onClick={() => navigate('/register')}
              className="px-4 py-2 text-sm bg-white text-black rounded-lg hover:bg-white/90 transition-all font-medium"
            >
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-32 pb-24">
        <div className="text-center max-w-4xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded-full mb-8 backdrop-blur-sm">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-xs text-white/80">Powered by SayrxAI V1</span>
          </div>

          {/* Main Heading */}
          <h1 className="text-6xl md:text-8xl font-bold mb-6 tracking-tight">
            <span className="bg-gradient-to-b from-white via-white to-white/40 bg-clip-text text-transparent">
              Code Assetto Corsa
            </span>
            <br />
            <span className="bg-gradient-to-r from-red-500 via-orange-500 to-red-500 bg-clip-text text-transparent">
              10x Faster
            </span>
          </h1>

          <p className="text-xl text-white/60 mb-12 max-w-2xl mx-auto leading-relaxed">
            Your AI-powered Lua specialist. Generate custom displays, physics scripts, and apps 
            with intelligent code completion. All running locally. Your data is safe!
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <button
              onClick={() => navigate('/register')}
              className="group relative px-8 py-4 bg-white text-black rounded-xl font-semibold overflow-hidden transition-all hover:scale-105 active:scale-95"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-orange-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <span className="relative flex items-center justify-center gap-2">
                Start Building Free
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </span>
            </button>
            <button
              onClick={() => navigate('/login')}
              className="px-8 py-4 bg-white/5 text-white rounded-xl font-semibold border border-white/10 hover:bg-white/10 transition-all"
            >
              Sign In
            </button>
          </div>

          {/* Demo Preview */}
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-red-600 to-orange-600 rounded-2xl blur-2xl opacity-25 group-hover:opacity-40 transition-opacity"></div>
            <div className="relative bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              </div>
              <div className="text-left">
                <div className="flex items-start gap-3 mb-4">
                  <div className="text-white/40">→</div>
                  <div className="flex-1">
                    <div className="text-white/60 text-sm mb-2">Display turbo boost in PSI with color indicators</div>
                  </div>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-lg p-4 font-mono text-xs text-left">
                  <div className="text-purple-400">local <span className="text-white">car</span> = <span className="text-blue-400">ac.getCar</span>(0)</div>
                  <div className="text-purple-400 mt-2">function <span className="text-yellow-400">script.update</span>(dt)</div>
                  <div className="pl-4 text-white/80">
                    <div className="text-purple-400">local <span className="text-white">boost</span> = car.turboBoost * 14.5038</div>
                    <div className="text-blue-400 mt-1">display.text</div>
                  </div>
                  <div className="text-purple-400">end</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-32">
        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              icon: <Zap className="w-6 h-6" />,
              title: "Lightning Fast",
              description: "Runs 100% locally on your machine. No API calls, no latency, instant responses.",
              gradient: "from-yellow-500 to-orange-500"
            },
            {
              icon: <Lock className="w-6 h-6" />,
              title: "Private & Secure",
              description: "Your code never leaves your computer. Complete privacy guaranteed with local AI.",
              gradient: "from-green-500 to-emerald-500"
            },
            {
              icon: <Database className="w-6 h-6" />,
              title: "Cloud Sync",
              description: "Optionally sync your conversations to the cloud. Access from anywhere, anytime.",
              gradient: "from-blue-500 to-cyan-500"
            }
          ].map((feature, idx) => (
            <div key={idx} className="group relative">
              <div className={`absolute -inset-0.5 bg-gradient-to-r ${feature.gradient} rounded-2xl blur opacity-0 group-hover:opacity-30 transition-opacity`}></div>
              <div className="relative h-full bg-black border border-white/10 rounded-2xl p-8 hover:border-white/20 transition-all">
                <div className={`inline-flex p-3 bg-gradient-to-br ${feature.gradient} rounded-xl mb-4`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-white/60 leading-relaxed">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Stats Section */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-24">
        <div className="grid md:grid-cols-4 gap-8 text-center">
          {[
            { number: "100%", label: "Local Processing" },
            { number: "<100ms", label: "Response Time" },
            { number: "$0", label: "API Costs" },
            { number: "∞", label: "Requests/Day" }
          ].map((stat, idx) => (
            <div key={idx}>
              <div className="text-5xl font-bold bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent mb-2">
                {stat.number}
              </div>
              <div className="text-white/60">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="relative z-10 max-w-4xl mx-auto px-6 py-32">
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-red-600 via-orange-600 to-red-600 rounded-3xl blur-2xl opacity-50 group-hover:opacity-75 transition-opacity"></div>
          <div className="relative bg-black border border-white/10 rounded-3xl p-12 text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Ready to build something amazing?
            </h2>
            <p className="text-xl text-white/60 mb-8 max-w-2xl mx-auto">
              Join developers already using SayrxAI to supercharge their Assetto Corsa development workflow.
            </p>
            <button
              onClick={() => navigate('/register')}
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-black rounded-xl font-semibold text-lg hover:scale-105 transition-transform"
            >
              Create Free Account
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5 mt-32">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-500 to-orange-600 flex items-center justify-center">
                <Code2 className="w-4 h-4" />
              </div>
              <span className="font-bold">SayrxAI V1</span>
            </div>
            <div className="text-white/40 text-sm">
              © 2025 SayrxAI. Created by Sayrx. Powered by SayrxAI V1.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Homepage;