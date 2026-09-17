import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { User, Phone, Mail, Award, Sparkles, ShoppingBag, Gift, ArrowLeft, History, TrendingUp, Calendar } from 'lucide-react';
import api from '../services/api';
import PurchaseModal from '../components/PurchaseModal';
import RedeemModal from '../components/RedeemModal';
import Toast from '../components/Toast';

export default function MemberDetailPage() {
  const { id } = useParams();
  const [member, setMember] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [rewards, setRewards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modals
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [showRedeemModal, setShowRedeemModal] = useState(false);

  // Toast
  const [toast, setToast] = useState({ type: 'success', message: '' });

  const fetchMemberDetails = async () => {
    setLoading(true);
    try {
      const [memberRes, transRes, rewardsRes] = await Promise.all([
        api.get(`/members/${id}`),
        api.get(`/members/${id}/transactions?limit=50`),
        api.get('/rewards'),
      ]);

      if (memberRes.data.success) {
        setMember(memberRes.data.data);
      }
      if (transRes.data.success) {
        setTransactions(transRes.data.data.transactions || []);
      }
      if (rewardsRes.data.success) {
        setRewards(rewardsRes.data.data || []);
      }
    } catch (err) {
      setError(err.message || 'Failed to load member details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMemberDetails();
  }, [id]);

  const handlePurchaseSuccess = (result) => {
    setToast({
      type: 'success',
      message: `Purchase recorded! Earned +${result.purchaseSummary.pointsEarned} points.`,
    });
    fetchMemberDetails();
  };

  const handleRedeemSuccess = (result) => {
    setToast({
      type: 'success',
      message: `Successfully redeemed '${result.reward.name}'!`,
    });
    fetchMemberDetails();
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center text-stone-400 text-xs">
        Loading member profile...
      </div>
    );
  }

  if (error || !member) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center space-y-4">
        <p className="text-red-400 text-sm font-semibold">{error || 'Member not found'}</p>
        <Link to="/members" className="px-4 py-2 rounded-xl bg-stone-800 text-stone-200 text-xs font-semibold">
          Back to Directory
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Toast Notification */}
      <Toast type={toast.type} message={toast.message} onClose={() => setToast({ type: 'success', message: '' })} />

      {/* Back Link */}
      <Link to="/members" className="inline-flex items-center gap-1.5 text-xs text-stone-400 hover:text-amber-400 font-semibold transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Members Directory
      </Link>

      {/* Member Header Profile Card */}
      <div className="p-8 rounded-3xl bg-gradient-to-r from-stone-900 via-stone-900 to-amber-950/20 border border-stone-800 shadow-xl relative overflow-hidden space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-500 font-extrabold text-2xl shrink-0">
              {member.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-stone-100">{member.name}</h1>
                <span
                  className={`px-3 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                    member.tier === 'Platinum'
                      ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                      : member.tier === 'Gold'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      : member.tier === 'Silver'
                      ? 'bg-slate-400/20 text-slate-200 border border-slate-400/40'
                      : 'bg-stone-700/30 text-stone-300 border border-stone-700/50'
                  }`}
                >
                  {member.tier} Tier
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-4 mt-1 text-xs text-stone-400 font-mono">
                <span className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-stone-500" /> {member.phone}</span>
                {member.email && <span className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-stone-500" /> {member.email}</span>}
              </div>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowPurchaseModal(true)}
              className="px-5 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs flex items-center gap-2 transition-all shadow-lg shadow-amber-500/20"
            >
              <ShoppingBag className="w-4 h-4" />
              Record Purchase
            </button>
            <button
              onClick={() => setShowRedeemModal(true)}
              className="px-5 py-3 rounded-xl bg-stone-800 hover:bg-stone-700 text-amber-400 border border-stone-700 font-bold text-xs flex items-center gap-2 transition-all"
            >
              <Gift className="w-4 h-4" />
              Redeem Reward
            </button>
          </div>

        </div>

        {/* Member Metrics Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-stone-800/80">
          <div className="p-4 rounded-xl bg-stone-950/70 border border-stone-800">
            <span className="text-[11px] text-stone-400 block font-medium">Available Points Balance</span>
            <span className="text-2xl font-extrabold text-amber-400 font-mono">{member.pointsBalance} pts</span>
          </div>

          <div className="p-4 rounded-xl bg-stone-950/70 border border-stone-800">
            <span className="text-[11px] text-stone-400 block font-medium">Lifetime Café Spend</span>
            <span className="text-2xl font-extrabold text-stone-100 font-mono">${member.lifetimeSpend?.toFixed(2)}</span>
          </div>

          <div className="p-4 rounded-xl bg-stone-950/70 border border-stone-800">
            <span className="text-[11px] text-stone-400 block font-medium">Total Points Earned</span>
            <span className="text-2xl font-extrabold text-emerald-400 font-mono">{member.lifetimePoints} pts</span>
          </div>
        </div>

      </div>

      {/* Transaction Audit History */}
      <div className="p-6 rounded-3xl bg-stone-900/40 border border-stone-800/80 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-stone-100 flex items-center gap-2">
            <History className="w-5 h-5 text-amber-500" />
            Transaction History Audit Log
          </h2>
          <span className="text-xs text-stone-400 font-mono">{transactions.length} records</span>
        </div>

        {transactions.length === 0 ? (
          <div className="py-12 text-center text-stone-500 text-xs">No transaction history recorded yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-950/70 text-stone-400 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4 rounded-l-xl">Date & Time</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-4">Points Delta</th>
                  <th className="py-3 px-4">Balance After</th>
                  <th className="py-3 px-4 rounded-r-xl">Recorded By</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-800/60 text-stone-200">
                {transactions.map((t) => (
                  <tr key={t._id} className="hover:bg-stone-800/40 transition-colors">
                    <td className="py-3.5 px-4 font-mono text-stone-400 text-[11px]">
                      {new Date(t.createdAt).toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          t.type === 'PURCHASE'
                            ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                            : t.type === 'REDEMPTION'
                            ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                            : 'bg-red-500/15 text-red-300 border border-red-500/30'
                        }`}
                      >
                        {t.type}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-stone-200 font-medium">{t.description}</td>
                    <td className="py-3.5 px-4 font-bold font-mono">
                      {t.points > 0 ? (
                        <span className="text-emerald-400">+{t.points} pts</span>
                      ) : (
                        <span className="text-purple-400">{t.points} pts</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-amber-400 font-mono">{t.balanceAfter} pts</td>
                    <td className="py-3.5 px-4 text-stone-400 text-[11px]">
                      {t.createdBy?.name || 'Counter Staff'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modals */}
      <PurchaseModal
        member={member}
        isOpen={showPurchaseModal}
        onClose={() => setShowPurchaseModal(false)}
        onSuccess={handlePurchaseSuccess}
      />

      <RedeemModal
        member={member}
        rewards={rewards}
        isOpen={showRedeemModal}
        onClose={() => setShowRedeemModal(false)}
        onSuccess={handleRedeemSuccess}
      />

    </div>
  );
}
