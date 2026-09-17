import React, { useState, useEffect } from 'react';
import { Gift, Sparkles, Coffee, Award, CheckCircle2 } from 'lucide-react';
import api from '../services/api';

export default function RewardsPage() {
  const [rewards, setRewards] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRewards = async () => {
      try {
        const response = await api.get('/rewards');
        if (response.data.success) {
          setRewards(response.data.data || []);
        }
      } catch (err) {
        console.error('[RewardsPage] Error loading rewards:', err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRewards();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Page Header */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold">
          <Gift className="w-4 h-4" /> Café Rewards Catalog
        </div>
        <h1 className="text-3xl font-extrabold text-stone-100 tracking-tight">Redeemable Rewards</h1>
        <p className="text-xs text-stone-400 max-w-xl">
          Members redeem points accumulated through café purchases. Redemptions are validated server-side to enforce balance checks.
        </p>
      </div>

      {/* Rewards Grid */}
      {loading ? (
        <div className="py-12 text-center text-stone-400 text-xs">Loading rewards catalog...</div>
      ) : rewards.length === 0 ? (
        <div className="py-12 text-center text-stone-500 text-xs">No active rewards available.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rewards.map((reward) => (
            <div
              key={reward._id}
              className="p-6 rounded-3xl bg-stone-900/60 border border-stone-800 hover:border-amber-500/40 transition-all flex flex-col justify-between space-y-4 group shadow-xl"
            >
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-500 group-hover:scale-105 transition-transform">
                  <Coffee className="w-6 h-6" />
                </div>

                <div>
                  <h3 className="text-lg font-bold text-stone-100">{reward.name}</h3>
                  <p className="text-xs text-stone-400 mt-1 leading-relaxed">{reward.description}</p>
                </div>
              </div>

              <div className="pt-4 border-t border-stone-800/80 flex items-center justify-between">
                <span className="text-xs text-stone-400 font-medium">Points Cost</span>
                <span className="text-lg font-extrabold text-amber-400 font-mono">
                  {reward.pointsCost} <span className="text-xs text-amber-500/80 font-normal">pts</span>
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tier Multipliers Helper Card */}
      <div className="p-8 rounded-3xl bg-gradient-to-r from-stone-900 via-stone-900 to-amber-950/20 border border-stone-800 space-y-4">
        <h3 className="text-lg font-bold text-stone-100 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-amber-400" /> Member Tier Earning Rates
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-stone-950/70 border border-stone-800 space-y-1">
            <span className="font-bold text-stone-300 block">Regular Tier</span>
            <p className="text-stone-400 text-[11px]">Spend &lt; $100</p>
            <span className="text-amber-400 font-mono font-bold block pt-1">1.0x Points / $1</span>
          </div>

          <div className="p-4 rounded-2xl bg-stone-950/70 border border-stone-800 space-y-1">
            <span className="font-bold text-slate-200 block">Silver Tier</span>
            <p className="text-stone-400 text-[11px]">Spend $100 - $499.99</p>
            <span className="text-amber-400 font-mono font-bold block pt-1">1.5x Points / $1</span>
          </div>

          <div className="p-4 rounded-2xl bg-stone-950/70 border border-stone-800 space-y-1">
            <span className="font-bold text-amber-300 block">Gold Tier</span>
            <p className="text-stone-400 text-[11px]">Spend $500 - $4,999.99</p>
            <span className="text-amber-400 font-mono font-bold block pt-1">2.0x Points / $1</span>
          </div>

          <div className="p-4 rounded-2xl bg-stone-950/70 border border-purple-500/40 bg-purple-500/10 space-y-1">
            <span className="font-bold text-purple-300 block">Platinum Tier</span>
            <p className="text-stone-400 text-[11px]">Spend &ge; $5,000</p>
            <span className="text-purple-300 font-mono font-bold block pt-1">3.0x Points (0.3 / unit)</span>
          </div>
        </div>
      </div>

    </div>
  );
}
