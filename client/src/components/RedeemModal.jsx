import React, { useState } from 'react';
import { Gift, X, Check, AlertCircle, Sparkles } from 'lucide-react';
import api from '../services/api';

export default function RedeemModal({ member, rewards = [], isOpen, onClose, onSuccess }) {
  const [selectedReward, setSelectedReward] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen || !member) return null;

  const handleRedeem = async (reward) => {
    setSelectedReward(reward);
    setError('');
    setSuccessMsg('');

    if (member.pointsBalance < reward.pointsCost) {
      setError(`Insufficient points. Member has ${member.pointsBalance} pts, but ${reward.pointsCost} pts are required.`);
      return;
    }

    setLoading(true);
    try {
      const response = await api.post(`/members/${member._id}/redeem`, {
        rewardId: reward._id,
      });

      if (response.data.success) {
        setSuccessMsg(`Successfully redeemed '${reward.name}'!`);
        if (onSuccess) {
          onSuccess(response.data.data);
        }
      }
    } catch (err) {
      setError(err.message || 'Redemption failed');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSelectedReward(null);
    setError('');
    setSuccessMsg('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="bg-stone-900 border border-stone-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl overflow-hidden relative max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-stone-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500">
              <Gift className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-stone-100">Redeem Rewards</h3>
              <p className="text-xs text-stone-400">
                Member: <span className="font-semibold text-stone-200">{member.name}</span> | Current Balance: <span className="font-bold text-emerald-400">{member.pointsBalance} pts</span>
              </p>
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
          <div className="mt-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs font-medium flex items-center gap-2 shrink-0">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            {error}
          </div>
        )}

        {successMsg && (
          <div className="mt-4 p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-medium flex items-center gap-2 shrink-0">
            <Sparkles className="w-4 h-4 shrink-0 text-emerald-400" />
            {successMsg}
          </div>
        )}

        {/* Rewards Grid */}
        <div className="py-4 overflow-y-auto space-y-3 pr-1 grow">
          {rewards.length === 0 ? (
            <p className="text-center text-stone-500 text-sm py-8">No active rewards found.</p>
          ) : (
            rewards.map((reward) => {
              const canAfford = member.pointsBalance >= reward.pointsCost;
              return (
                <div
                  key={reward._id}
                  className={`p-4 rounded-xl border transition-all flex items-center justify-between gap-4 ${
                    canAfford
                      ? 'bg-stone-950/60 border-stone-800 hover:border-amber-500/40'
                      : 'bg-stone-950/30 border-stone-800/40 opacity-60'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-stone-100">{reward.name}</h4>
                      {!canAfford && (
                        <span className="text-[10px] bg-red-500/10 text-red-400 border border-red-500/20 px-2 py-0.5 rounded-full font-medium">
                          Need {reward.pointsCost - member.pointsBalance} more pts
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-stone-400">{reward.description}</p>
                    <span className="inline-block text-xs font-bold text-amber-400 font-mono pt-1">
                      {reward.pointsCost} points
                    </span>
                  </div>

                  <button
                    onClick={() => handleRedeem(reward)}
                    disabled={!canAfford || loading}
                    className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 shrink-0 ${
                      canAfford
                        ? 'bg-amber-500 hover:bg-amber-400 text-stone-950 shadow-md'
                        : 'bg-stone-800 text-stone-500 cursor-not-allowed'
                    }`}
                  >
                    {loading && selectedReward?._id === reward._id ? (
                      'Redeeming...'
                    ) : (
                      <>
                        <Check className="w-4 h-4" />
                        Redeem
                      </>
                    )}
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-stone-800 flex justify-end shrink-0">
          <button
            onClick={handleClose}
            className="px-5 py-2 rounded-xl text-xs font-semibold bg-stone-800 hover:bg-stone-700 text-stone-300 transition-colors"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}
