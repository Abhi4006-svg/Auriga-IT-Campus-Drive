import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, ChevronLeft, ChevronRight, ArrowUpDown, UserPlus, Filter, Phone, User, Calendar } from 'lucide-react';
import api from '../services/api';

export default function MemberListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialSearch = searchParams.get('search') || '';

  const [members, setMembers] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [search, setSearch] = useState(initialSearch);
  const [sortBy, setSortBy] = useState('createdAt');
  const [order, setOrder] = useState('desc');
  const [loading, setLoading] = useState(true);

  const fetchMembers = async (page = 1, searchQuery = search, sort = sortBy, sortOrder = order) => {
    setLoading(true);
    try {
      const response = await api.get('/members', {
        params: {
          page,
          limit: 10,
          search: searchQuery,
          sortBy: sort,
          order: sortOrder,
        },
      });

      if (response.data.success) {
        setMembers(response.data.data.members || []);
        setPagination(response.data.data.pagination);
      }
    } catch (err) {
      console.error('[MemberList] Error fetching members:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers(1, initialSearch, sortBy, order);
  }, [initialSearch]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setSearchParams(search ? { search } : {});
    fetchMembers(1, search, sortBy, order);
  };

  const handleSortChange = (newSortBy) => {
    let newOrder = 'asc';
    if (sortBy === newSortBy && order === 'asc') {
      newOrder = 'desc';
    }
    setSortBy(newSortBy);
    setOrder(newOrder);
    fetchMembers(1, search, newSortBy, newOrder);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-stone-100 tracking-tight">Members Directory</h1>
          <p className="text-xs text-stone-400 mt-1">Search, sort, and manage café loyalty members</p>
        </div>

        <Link
          to="/dashboard"
          className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs flex items-center gap-2 self-start sm:self-auto"
        >
          <UserPlus className="w-4 h-4" />
          Add Member via Dashboard
        </Link>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-4 rounded-2xl bg-stone-900/60 border border-stone-800 flex flex-col md:flex-row gap-4 items-center justify-between">
        
        {/* Search Input */}
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-96">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            placeholder="Search by phone number or name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-stone-950 border border-stone-800 focus:border-amber-500 focus:outline-none text-stone-100 text-xs"
          />
        </form>

        {/* Sort Controls */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          <span className="text-xs text-stone-400 font-medium hidden sm:inline">Sort By:</span>
          <select
            value={sortBy}
            onChange={(e) => handleSortChange(e.target.value)}
            className="px-3 py-2 rounded-xl bg-stone-950 border border-stone-800 text-stone-200 text-xs focus:outline-none"
          >
            <option value="createdAt">Date Created</option>
            <option value="name">Member Name</option>
            <option value="pointsBalance">Points Balance</option>
            <option value="tier">Member Tier</option>
            <option value="lifetimeSpend">Lifetime Spend</option>
          </select>

          <button
            onClick={() => handleSortChange(sortBy)}
            className="p-2 rounded-xl bg-stone-950 border border-stone-800 text-stone-300 hover:text-amber-400 text-xs font-semibold flex items-center gap-1"
          >
            <ArrowUpDown className="w-3.5 h-3.5" />
            <span className="uppercase text-[10px] font-mono">{order}</span>
          </button>
        </div>

      </div>

      {/* Members Table */}
      <div className="p-6 rounded-3xl bg-stone-900/40 border border-stone-800/80 space-y-4">
        {loading ? (
          <div className="py-12 text-center text-stone-400 text-xs">Loading member registry...</div>
        ) : members.length === 0 ? (
          <div className="py-12 text-center space-y-2">
            <p className="text-stone-400 text-sm font-semibold">No members found matching '{search}'</p>
            <p className="text-stone-500 text-xs">Try searching by phone number or clear search filter.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-950/70 text-stone-400 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3.5 px-4 rounded-l-xl cursor-pointer" onClick={() => handleSortChange('name')}>
                    Member Name
                  </th>
                  <th className="py-3.5 px-4">Phone</th>
                  <th className="py-3.5 px-4 cursor-pointer" onClick={() => handleSortChange('tier')}>
                    Tier Status
                  </th>
                  <th className="py-3.5 px-4 cursor-pointer" onClick={() => handleSortChange('pointsBalance')}>
                    Points Balance
                  </th>
                  <th className="py-3.5 px-4 cursor-pointer" onClick={() => handleSortChange('lifetimeSpend')}>
                    Lifetime Spend
                  </th>
                  <th className="py-3.5 px-4 cursor-pointer" onClick={() => handleSortChange('createdAt')}>
                    Joined Date
                  </th>
                  <th className="py-3.5 px-4 text-right rounded-r-xl">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-800/60 text-stone-200">
                {members.map((m) => (
                  <tr key={m._id} className="hover:bg-stone-800/40 transition-colors">
                    <td className="py-4 px-4 font-semibold text-stone-100 flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-stone-800 flex items-center justify-center text-amber-400 font-bold">
                        {m.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <span className="block font-bold">{m.name}</span>
                        {m.email && <span className="text-[10px] text-stone-500 block">{m.email}</span>}
                      </div>
                    </td>
                    <td className="py-4 px-4 font-mono text-stone-300">{m.phone}</td>
                    <td className="py-4 px-4">
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
                    <td className="py-4 px-4 font-bold text-amber-400 font-mono text-sm">{m.pointsBalance} pts</td>
                    <td className="py-4 px-4 font-mono text-stone-300">${m.lifetimeSpend?.toFixed(2)}</td>
                    <td className="py-4 px-4 text-stone-400 text-[11px]">
                      {new Date(m.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-4 text-right">
                      <Link
                        to={`/members/${m._id}`}
                        className="px-3.5 py-1.5 rounded-xl bg-stone-800 hover:bg-amber-500 hover:text-stone-950 font-bold text-[11px] transition-colors"
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

        {/* Pagination Controls */}
        <div className="pt-4 border-t border-stone-800/80 flex items-center justify-between text-xs text-stone-400">
          <div>
            Showing <span className="font-semibold text-stone-200">{members.length}</span> of <span className="font-semibold text-stone-200">{pagination.total}</span> members
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => fetchMembers(pagination.page - 1)}
              disabled={pagination.page <= 1}
              className="px-3 py-1.5 rounded-xl bg-stone-950 border border-stone-800 hover:bg-stone-800 text-stone-200 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
            >
              <ChevronLeft className="w-4 h-4" /> Previous
            </button>

            <span className="font-mono text-xs px-2 font-medium">
              Page {pagination.page} of {pagination.totalPages}
            </span>

            <button
              onClick={() => fetchMembers(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages}
              className="px-3 py-1.5 rounded-xl bg-stone-950 border border-stone-800 hover:bg-stone-800 text-stone-200 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
            >
              Next <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}
