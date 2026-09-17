import React, { useState } from 'react';
import { ShoppingBag, X, DollarSign, Sparkles, CheckCircle2, TrendingUp } from 'lucide-react';
import api from '../services/api';

export default function PurchaseModal({ member, isOpen, onClose, onSuccess }) {
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  if (!isOpen || !member) return null;

  // Tier multiplier calculations for live preview
  const getMultiplier = (tier) => {
    if (tier === 'Platinum') return 3.0;
    if (tier === 'Gold') return 2.0;
    if (tier === 'Silver') return 1.5;
    return 1.0;
  };

  const currentMultiplier = getMultiplier(member.tier);
  const numAmount = Number(amount) || 0;
  const estimatedPoints = numAmount > 0 ? Math.floor(numAmount * currentMultiplier) : 0;
  const estimatedNewBalance = member.pointsBalance + estimatedPoints;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (numAmount <= 0) {
      setError('Please enter a valid purchase amount greater than $0.00');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post(`/members/${member._id}/purchases`, {
        amount: numAmount,
        description: description.trim() || undefined,
      });

      if (response.data.success) {
        setResult(response.data.data.purchaseSummary);
        if (onSuccess) {
          onSuccess(response.data.data);
        }
      }
    } catch (err) {
      setError(err.message || 'Failed to record purchase');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setAmount('');
    setDescription('');
    setError('');
    setResult(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="bg-stone-900 border border-stone-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl overflow-hidden relative">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-stone-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-stone-100">Record Purchase</h3>
              <p className="text-xs text-stone-400">Member: <span className="font-semibold text-stone-200">{member.name}</span> ({member.phone})</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-200 hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs font-medium">
            {error}
          </div>
        )}

        {/* Result view after recording purchase */}
        {result ? (
          <div className="py-6 space-y-4 text-center">
            <div className="w-14 h-14 mx-auto rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <h4 className="text-xl font-bold text-stone-100">Purchase Recorded!</h4>
              <p className="text-xs text-stone-400 mt-1">
                Transaction logged with authoritative backend accounting.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 p-4 rounded-xl bg-stone-950/60 border border-stone-800 text-left">
              <div>
                <span className="text-[11px] text-stone-400 block font-medium">Purchase Amount</span>
                <span className="text-lg font-bold text-stone-100">${result.amount.toFixed(2)}</span>
              </div>
              <div>
                <span className="text-[11px] text-stone-400 block font-medium">Points Earned</span>
                <span className="text-lg font-bold text-amber-400">+{result.pointsEarned} pts</span>
              </div>
              <div>
                <span className="text-[11px] text-stone-400 block font-medium">Applied Rate</span>
                <span className="text-xs font-semibold text-stone-300">{result.tierUsed} ({result.earningMultiplier}x)</span>
              </div>
              <div>
                <span className="text-[11px] text-stone-400 block font-medium">Updated Balance</span>
                <span className="text-lg font-bold text-emerald-400">{result.newBalance} pts</span>
              </div>
            </div>

            {result.promotedTier && (
              <div className="p-3 rounded-xl bg-amber-500/15 border border-amber-500/40 text-amber-300 flex items-center justify-center gap-2 text-xs font-semibold animate-pulse">
                <TrendingUp className="w-4 h-4 text-amber-400" />
                TIER UPGRADE! Member promoted to {result.promotedTier} Tier!
              </div>
            )}

            <button
              onClick={handleClose}
              className="w-full py-2.5 rounded-xl font-semibold bg-stone-800 hover:bg-stone-700 text-stone-200 transition-colors text-sm mt-2"
            >
              Done
            </button>
          </div>
        ) : (
          /* Input Form */
          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            
            {/* Current Member Status Card */}
            <div className="p-3.5 rounded-xl bg-stone-950/60 border border-stone-800/80 flex items-center justify-between">
              <div>
                <span className="text-xs text-stone-400 block font-medium">Current Tier</span>
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">{member.tier} Tier</span>
              </div>
              <div className="text-right">
                <span className="text-xs text-stone-400 block font-medium">Earning Multiplier</span>
                <span className="text-xs font-mono font-bold text-stone-200">{currentMultiplier}x points / $1</span>
              </div>
            </div>

            {/* Input Amount */}
            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-1.5">
                Purchase Amount ($) <span className="text-amber-500">*</span>
              </label>
              <div className="relative">
                <DollarSign className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-stone-950 border border-stone-800 focus:border-amber-500 focus:outline-none text-stone-100 text-sm font-mono"
                  required
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-1.5">
                Description / Items (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g., 2 Lattes + Almond Croissant"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-stone-950 border border-stone-800 focus:border-amber-500 focus:outline-none text-stone-100 text-xs"
              />
            </div>

            {/* Live Calculation Preview */}
            {numAmount > 0 && (
              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-stone-300 font-medium flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Points to Earn:
                  </span>
                  <span className="font-bold text-amber-400 font-mono">+{estimatedPoints} pts</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-stone-400 font-medium">New Points Balance:</span>
                  <span className="font-bold text-emerald-400 font-mono">{estimatedNewBalance} pts</span>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleClose}
                className="w-1/3 py-2.5 rounded-xl text-xs font-semibold bg-stone-800 hover:bg-stone-700 text-stone-300 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="w-2/3 py-2.5 rounded-xl text-xs font-semibold bg-amber-500 hover:bg-amber-400 text-stone-950 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? 'Processing...' : 'Confirm & Earn Points'}
              </button>
            </div>

          </form>
        )}

      </div>
    </div>
  );
}
