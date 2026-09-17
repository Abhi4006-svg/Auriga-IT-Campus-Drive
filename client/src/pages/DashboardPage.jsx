import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Users, ShoppingBag, Sparkles, Gift, UserPlus, ArrowRight, Phone, RefreshCw, Plus, ChevronRight } from 'lucide-react';
import api from '../services/api';
import Toast from '../components/Toast';

export default function DashboardPage() {
  const [stats, setStats] = useState({
    totalMembers: 0,
    todaysPurchasesCount: 0,
    todaysPurchasesAmount: 0,
    pointsIssuedToday: 0,
    todaysRedemptionsCount: 0,
    pointsRedeemedToday: 0,
  });
  const [search, setSearch] = useState('');
  const [recentMembers, setRecentMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ type: 'success', message: '' });

  // New member modal state
  const [showAddMember, setShowAddMember] = useState(false);
  const [newMember, setNewMember] = useState({ name: '', phone: '', email: '' });
  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState('');

  const navigate = useNavigate();

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [statsRes, membersRes] = await Promise.all([
        api.get('/dashboard/stats'),
        api.get('/members?page=1&limit=6&sortBy=createdAt&order=desc'),
      ]);

      if (statsRes.data.success) {
        setStats(statsRes.data.data);
      }
      if (membersRes.data.success) {
        setRecentMembers(membersRes.data.data.members || []);
      }
    } catch (err) {
      console.error('[Dashboard] Error fetching stats:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/members?search=${encodeURIComponent(search.trim())}`);
    }
  };

  const handleCreateMember = async (e) => {
    e.preventDefault();
    setAddError('');

    if (!newMember.name || !newMember.phone) {
      setAddError('Name and phone number are required');
      return;
    }

    setAddLoading(true);
    try {
      const response = await api.post('/members', newMember);
      if (response.data.success) {
        setToast({ type: 'success', message: `Registered member ${response.data.data.name}!` });
        setShowAddMember(false);
        setNewMember({ name: '', phone: '', email: '' });
        fetchDashboardData();
      }
    } catch (err) {
      setAddError(err.message || 'Failed to register member');
    } finally {
      setAddLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Toast Alert */}
      <Toast type={toast.type} message={toast.message} onClose={() => setToast({ type: 'success', message: '' })} />

      {/* Top Banner / Quick Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-stone-100 tracking-tight">Café Counter Dashboard</h1>
          <p className="text-xs text-stone-400 mt-1">Look up members, issue points, and manage redemptions</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchDashboardData()}
            className="p-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 border border-stone-800 text-stone-400 hover:text-stone-200 transition-colors"
            title="Refresh Data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => setShowAddMember(true)}
            className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs flex items-center gap-2 transition-all shadow-md shadow-amber-500/10"
          >
            <UserPlus className="w-4 h-4" />
            Register New Member
          </button>
        </div>
      </div>

      {/* Prominent Member Search Bar */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-stone-900 via-stone-900 to-amber-950/20 border border-amber-500/20 shadow-xl space-y-3">
        <div className="flex items-center gap-2">
          <Phone className="w-4 h-4 text-amber-400" />
          <span className="text-xs font-bold uppercase tracking-wider text-amber-400">Quick Counter Member Lookup</span>
        </div>

        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
          <div className="relative grow">
            <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              placeholder="Enter phone number (e.g. 9876543210) or member name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-stone-950/90 border border-stone-800 focus:border-amber-500 focus:outline-none text-stone-100 text-sm placeholder-stone-500 font-medium"
            />
          </div>
          <button
            type="submit"
            className="px-8 py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-sm transition-all flex items-center justify-center gap-2 shrink-0"
          >
            Find Member
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Total Members */}
        <div className="p-5 rounded-2xl bg-stone-900/60 border border-stone-800/80 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-stone-400 font-semibold">Total Members</span>
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-stone-100">{stats.totalMembers}</div>
          <span className="text-[11px] text-stone-500 block">Registered loyalty customers</span>
        </div>

        {/* Today's Purchases */}
        <div className="p-5 rounded-2xl bg-stone-900/60 border border-stone-800/80 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-stone-400 font-semibold">Today's Purchases</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <ShoppingBag className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-stone-100">${stats.todaysPurchasesAmount.toFixed(2)}</div>
          <span className="text-[11px] text-stone-400 block font-mono">{stats.todaysPurchasesCount} transactions today</span>
        </div>

        {/* Points Issued Today */}
        <div className="p-5 rounded-2xl bg-stone-900/60 border border-stone-800/80 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-stone-400 font-semibold">Points Issued Today</span>
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-amber-400">{stats.pointsIssuedToday} pts</div>
          <span className="text-[11px] text-stone-500 block">Calculated via tier multipliers</span>
        </div>

        {/* Redemptions Today */}
        <div className="p-5 rounded-2xl bg-stone-900/60 border border-stone-800/80 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-stone-400 font-semibold">Redemptions Today</span>
            <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
              <Gift className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-purple-300">{stats.todaysRedemptionsCount}</div>
          <span className="text-[11px] text-stone-400 block font-mono">{stats.pointsRedeemedToday} pts redeemed</span>
        </div>

      </div>

      {/* Recent Members Section */}
      <div className="p-6 rounded-3xl bg-stone-900/40 border border-stone-800/80 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-stone-100">Recent Members</h2>
          <Link to="/members" className="text-xs font-semibold text-amber-400 hover:underline flex items-center gap-1">
            View All Members <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {recentMembers.length === 0 ? (
          <div className="py-12 text-center text-stone-500 text-xs">No members found. Use 'Register New Member' above to create one.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-950/60 text-stone-400 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4 rounded-l-xl">Member Name</th>
                  <th className="py-3 px-4">Phone Number</th>
                  <th className="py-3 px-4">Tier</th>
                  <th className="py-3 px-4">Points Balance</th>
                  <th className="py-3 px-4">Lifetime Spend</th>
                  <th className="py-3 px-4 text-right rounded-r-xl">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-800/60 text-stone-200">
                {recentMembers.map((m) => (
                  <tr key={m._id} className="hover:bg-stone-800/40 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-stone-100">{m.name}</td>
                    <td className="py-3.5 px-4 font-mono text-stone-300">{m.phone}</td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          m.tier === 'Gold'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                            : m.tier === 'Silver'
                            ? 'bg-slate-400/20 text-slate-200 border border-slate-400/40'
                            : 'bg-stone-700/30 text-stone-300 border border-stone-700/50'
                        }`}
                      >
                        {m.tier}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-amber-400 font-mono">{m.pointsBalance} pts</td>
                    <td className="py-3.5 px-4 font-mono">${m.lifetimeSpend?.toFixed(2)}</td>
                    <td className="py-3.5 px-4 text-right">
                      <Link
                        to={`/members/${m._id}`}
                        className="px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-amber-500 hover:text-stone-950 font-semibold text-[11px] transition-colors inline-flex items-center gap-1"
                      >
                        View Profile
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal: Add New Member */}
      {showAddMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="bg-stone-900 border border-stone-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-stone-100">Register New Café Member</h3>

            {addError && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs font-medium">
                {addError}
              </div>
            )}

            <form onSubmit={handleCreateMember} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1">Full Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Jordan Lee"
                  value={newMember.name}
                  onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-stone-950 border border-stone-800 focus:border-amber-500 text-stone-100 text-xs"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1">Phone Number (Unique) *</label>
                <input
                  type="text"
                  placeholder="e.g. 9876543299"
                  value={newMember.phone}
                  onChange={(e) => setNewMember({ ...newMember, phone: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-stone-950 border border-stone-800 focus:border-amber-500 text-stone-100 text-xs font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1">Email Address (Optional)</label>
                <input
                  type="email"
                  placeholder="jordan@example.com"
                  value={newMember.email}
                  onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-stone-950 border border-stone-800 focus:border-amber-500 text-stone-100 text-xs"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddMember(false)}
                  className="px-4 py-2 rounded-xl bg-stone-800 text-stone-300 hover:bg-stone-700 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addLoading}
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold disabled:opacity-50"
                >
                  {addLoading ? 'Saving...' : 'Create Member'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
