import React from 'react';
import { Link } from 'react-router-dom';
import { Coffee, ShieldCheck, Zap, Award, Search, ArrowRight, Layers, Smartphone, Sparkles, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function LandingPage() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col justify-between">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 bg-amber-500/10 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="text-center max-w-3xl mx-auto space-y-6 relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold tracking-wide">
            <Coffee className="w-4 h-4" /> Next-Gen Café Rewards System
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-stone-100 leading-tight">
            Every visit deserves a <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600">reward.</span>
          </h1>

          <p className="text-base sm:text-lg text-stone-400 font-normal leading-relaxed">
            BeanLedger gives your café counter an rock-solid points accounting system. Track purchases, auto-calculate membership tiers, and execute instant point redemptions with zero math errors.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              to={isAuthenticated ? "/dashboard" : "/login"}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold bg-amber-500 hover:bg-amber-400 text-stone-950 transition-all shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 text-sm"
            >
              Open Counter
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/login"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold bg-stone-900 hover:bg-stone-800 text-stone-200 border border-stone-800 transition-all text-sm flex items-center justify-center"
            >
              Staff Login
            </Link>
          </div>
        </div>
      </section>

      {/* What the product is */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full border-t border-stone-900">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          <div className="p-6 rounded-2xl bg-stone-900/50 border border-stone-800 hover:border-amber-500/30 transition-all space-y-3">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-stone-100">Authoritative Ledger</h3>
            <p className="text-xs text-stone-400 leading-relaxed">
              Points calculations and tier qualifications happen strictly on the server to ensure member balances are always exact and tamper-proof.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-stone-900/50 border border-stone-800 hover:border-amber-500/30 transition-all space-y-3">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-stone-100">Sub-Second Lookups</h3>
            <p className="text-xs text-stone-400 leading-relaxed">
              Baristas lookup members by phone number or name instantly. Works gracefully at scale across hundreds of daily counter transactions.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-stone-900/50 border border-stone-800 hover:border-amber-500/30 transition-all space-y-3">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-stone-100">Dynamic Tiers</h3>
            <p className="text-xs text-stone-400 leading-relaxed">
              Automatic tier progression (Regular 1.0x, Silver 1.5x, Gold 2.0x). High-spending members earn points faster automatically.
            </p>
          </div>

        </div>
      </section>

      {/* Target Audience & Why Accurate Points Matter */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full border-t border-stone-900">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-stone-900 border border-stone-800 text-stone-300 text-xs font-semibold">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Target Audience & Purpose
            </div>
            <h2 className="text-3xl font-extrabold text-stone-100 tracking-tight">
              Designed for Independent Cafés, Coffee Chains & Counter Staff
            </h2>
            <p className="text-sm text-stone-400 leading-relaxed">
              BeanLedger removes friction at the counter. Front-line staff get a streamlined interface focused on rapid customer lookup, immediate purchase entry, and point redemptions.
            </p>
            <ul className="space-y-3 text-xs text-stone-300">
              <li className="flex items-center gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                <strong>Café Baristas & Cashiers:</strong> Record points in under 3 seconds per customer.
              </li>
              <li className="flex items-center gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                <strong>Café Managers:</strong> Maintain audit trails of all points issued and rewards redeemed.
              </li>
              <li className="flex items-center gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                <strong>Regular Customers:</strong> Build loyalty and reach Silver & Gold tiers for faster rewards.
              </li>
            </ul>
          </div>

          <div className="p-8 rounded-3xl bg-gradient-to-br from-stone-900 to-stone-950 border border-stone-800 shadow-xl space-y-4">
            <h3 className="text-xl font-bold text-amber-400 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" /> Why Accurate Points Accounting Matters
            </h3>
            <p className="text-xs text-stone-300 leading-relaxed">
              In rewards systems, loose point math causes two severe issues: <strong>Revenue Leakage</strong> (customers redeeming unearned free coffees) or <strong>Customer Distrust</strong> (missing points after purchases).
            </p>
            <p className="text-xs text-stone-400 leading-relaxed">
              BeanLedger resolves this by guaranteeing atomic, server-validated point transactions with full audit histories for every single purchase and redemption.
            </p>
          </div>

        </div>
      </section>

      {/* Three Future Features */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full border-t border-stone-900">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
          <span className="text-xs font-bold text-amber-500 uppercase tracking-widest block">Roadmap</span>
          <h2 className="text-3xl font-extrabold text-stone-100">Three Features Building Next</h2>
          <p className="text-xs text-stone-400">Planned high-impact extensions for future iterations.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          <div className="p-6 rounded-2xl bg-stone-900/40 border border-stone-800/80 space-y-3">
            <span className="text-xs font-mono font-bold text-amber-500 bg-amber-500/10 px-2.5 py-1 rounded-md inline-block">01</span>
            <h4 className="text-base font-bold text-stone-100">Automated SMS & Email Tier Alerts</h4>
            <p className="text-xs text-stone-400 leading-relaxed">
              Instant SMS notifications whenever a member earns points, redeems a reward, or levels up to Silver/Gold tier status.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-stone-900/40 border border-stone-800/80 space-y-3">
            <span className="text-xs font-mono font-bold text-amber-500 bg-amber-500/10 px-2.5 py-1 rounded-md inline-block">02</span>
            <h4 className="text-base font-bold text-stone-100">Configurable Double-Points Days</h4>
            <p className="text-xs text-stone-400 leading-relaxed">
              Dynamic promotional rules (e.g. "Double Points Tuesdays" or "Morning Rush 2x") configured straight from the admin panel.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-stone-900/40 border border-stone-800/80 space-y-3">
            <span className="text-xs font-mono font-bold text-amber-500 bg-amber-500/10 px-2.5 py-1 rounded-md inline-block">03</span>
            <h4 className="text-base font-bold text-stone-100">Multi-Store Franchise POS API</h4>
            <p className="text-xs text-stone-400 leading-relaxed">
              Square, Toast, and Clover POS integrations to automatically trigger BeanLedger point earnings on register receipt checkout.
            </p>
          </div>

        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-stone-900 text-center text-xs text-stone-500">
        <p>© 2026 BeanLedger — Café Rewards Management System. Built for speed, accuracy & loyalty.</p>
      </footer>

    </div>
  );
}
