import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { apiFetch, API_BASE } from '../lib/api';
import {
  LayoutDashboard,
  LogOut,
  DollarSign,
  TrendingUp,
  Shield,
  Target,
  AlertTriangle,
  Clock,
  Wallet,
  History,
  ArrowUpRight,
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function DashboardPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [withdrawal, setWithdrawal] = useState({ amount: '', upi: '', bankDetails: '' });
  const [withdrawing, setWithdrawing] = useState(false);
  const [history, setHistory] = useState([]);
  const [metrics, setMetrics] = useState(null);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/login');
        return;
      }
      setUser(session.user);
      fetchProfile();
      fetchWithdrawals();
      setLoading(false);
    };
    checkSession();
  }, [navigate]);

  const fetchProfile = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      // Query Supabase directly — NO API call, NO CORS issues
      const { data: profile, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (error) { console.error('Supabase fetch error:', error); return; }
      console.log('Profile loaded (direct):', profile);
      setProfile(profile);
    } catch (err) {
      console.error('Failed to fetch profile:', err);
    }
  };

  const fetchWithdrawals = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const { data, error } = await supabase
        .from('withdrawals')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });
      if (!error) setHistory(data || []);
    } catch (err) {
      console.error('Failed to fetch withdrawals:', err);
    }
  };

  const fetchMetrics = async () => {
    if (!profile?.mt5_login) return;
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const res = await apiFetch(`/api/mt5/metrics?mt5_login=${profile.mt5_login}`, {
        headers: { Authorization: `Bearer ${session.access_token}` }
      });
      if (res.ok) { const d = await res.json(); setMetrics(d); }
    } catch (e) { /* silent */ }
  };

  // Poll metrics every 15 seconds
  useEffect(() => {
    if (!profile?.mt5_login) return;
    fetchMetrics();
    const interval = setInterval(fetchMetrics, 15000);
    return () => clearInterval(interval);
  }, [profile?.mt5_login]);

  const handleWithdrawalSubmit = async (e) => {
    e.preventDefault();
    if (!withdrawal.amount || !withdrawal.upi) {
      toast.error('Amount and UPI ID are required');
      return;
    }
    setWithdrawing(true);
    try {
      const res = await apiFetch('/api/withdrawals/request', {
        method: 'POST',
        body: JSON.stringify(withdrawal),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Withdrawal request failed');
      toast.success('Withdrawal request submitted!');
      setWithdrawal({ amount: '', upi: '', bankDetails: '' });
      fetchWithdrawals();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setWithdrawing(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-navy-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-gold-400 border-t-transparent" />
      </div>
    );
  }

  const statusBadge = (status) => {
    const colors = {
      paid: 'bg-green-400/10 text-green-400 border-green-400/20',
      approved: 'bg-green-400/10 text-green-400 border-green-400/20',
      pending: 'bg-yellow-400/10 text-yellow-400 border-yellow-400/20',
      rejected: 'bg-red-400/10 text-red-400 border-red-400/20',
      active: 'bg-green-400/10 text-green-400 border-green-400/20',
      inactive: 'bg-gray-400/10 text-gray-400 border-gray-400/20',
    };
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${colors[status?.toLowerCase()] || colors.pending}`}>
        {status || 'N/A'}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-navy-900 pt-20 pb-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold font-poppins text-white flex items-center gap-3">
              <LayoutDashboard className="w-8 h-8 text-gold-400" />
              Dashboard
            </h1>
            <p className="text-gray-400 mt-1">Welcome back, {profile?.name || user?.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="btn-outline inline-flex items-center gap-2 px-4 py-2 text-sm"
          >
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 border-b border-navy-700 pb-2 overflow-x-auto">
          {['overview', 'withdraw', 'history'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-t-lg text-sm font-medium transition-colors whitespace-nowrap ${
                activeTab === tab
                  ? 'text-gold-400 border-b-2 border-gold-400 bg-gold-400/5'
                  : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              {tab === 'overview' ? 'Overview' : tab === 'withdraw' ? 'Withdraw' : 'History'}
            </button>
          ))}
        </div>

        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Plan Card */}
            <div className="card p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-gold-400/10 flex items-center justify-center">
                  <Wallet className="w-5 h-5 text-gold-400" />
                </div>
                <div>
                  <h3 className="text-white font-semibold font-poppins">Your Plan</h3>
                  <p className="text-gray-400 text-sm">Current funding status</p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <p className="text-gray-500 text-xs uppercase tracking-wider">Plan</p>
                  <p className="text-white font-semibold text-lg">{profile?.plan || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs uppercase tracking-wider">Payment Status</p>
                  {statusBadge(profile?.payment_status)}
                </div>
                <div>
                  <p className="text-gray-500 text-xs uppercase tracking-wider">Funded Balance</p>
                  <p className="text-gold-400 font-bold text-xl font-poppins">
                    ${({ Starter: 1000, Standard: 5000, Premium: 10000 })[profile?.plan]?.toLocaleString() || '0'}
                  </p>
                </div>
              </div>
            </div>

            {/* MT5 Card */}
            <div className="card p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-gold-400/10 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-gold-400" />
                </div>
                <div>
                  <h3 className="text-white font-semibold font-poppins">MT5 Account</h3>
                  <p className="text-gray-400 text-sm">Your trading credentials</p>
                </div>
              </div>
              {profile?.mt5_login ? (
                <div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-3">
                    <div>
                      <p className="text-gray-500 text-xs uppercase tracking-wider">Login</p>
                      <p className="text-gold-400 font-mono font-bold text-lg">{profile.mt5_login}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-xs uppercase tracking-wider">Password</p>
                      <p className="text-gold-400 font-mono font-bold text-lg">{profile.mt5_password}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-xs uppercase tracking-wider">Server</p>
                      <p className="text-gold-400 font-mono font-bold text-lg">{profile.mt5_server || 'MetaQuotes-Demo'}</p>
                    </div>
                  </div>
                  <p className="text-gray-500 text-xs mt-2">Connect via MetaTrader 5 mobile or desktop app</p>
                </div>
              ) : (
                <p className="text-gray-500 text-sm">Complete payment first to receive MT5 credentials.</p>
              )}
            </div>

            {/* Trading Rules */}
            <div className="card p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-gold-400/10 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-gold-400" />
                </div>
                <div>
                  <h3 className="text-white font-semibold font-poppins">Trading Rules</h3>
                  <p className="text-gray-400 text-sm">Evaluation parameters for your funded account</p>
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
                <div className="p-3 rounded-lg bg-navy-700/50">
                  <p className="text-gray-400 text-xs mb-1">Profit Target</p>
                  <p className="text-gold-400 font-bold text-lg">8%</p>
                  <p className="text-gray-600 text-[10px]">Target to pass evaluation</p>
                </div>
                <div className="p-3 rounded-lg bg-navy-700/50">
                  <p className="text-gray-400 text-xs mb-1">Daily Drawdown</p>
                  <p className="text-red-400 font-bold text-lg">5%</p>
                  <p className="text-gray-600 text-[10px]">Max per-day loss</p>
                </div>
                <div className="p-3 rounded-lg bg-navy-700/50">
                  <p className="text-gray-400 text-xs mb-1">Max Drawdown</p>
                  <p className="text-red-400 font-bold text-lg">10%</p>
                  <p className="text-gray-600 text-[10px]">Overall account limit</p>
                </div>
                <div className="p-3 rounded-lg bg-navy-700/50">
                  <p className="text-gray-400 text-xs mb-1">Time Limit</p>
                  <p className="text-green-400 font-bold text-lg">None</p>
                  <p className="text-gray-600 text-[10px]">Trade at your own pace</p>
                </div>
                <div className="p-3 rounded-lg bg-navy-700/50">
                  <p className="text-gray-400 text-xs mb-1">Profit Split</p>
                  <p className="text-gold-400 font-bold text-lg">80%</p>
                  <p className="text-gray-600 text-[10px]">You keep the majority</p>
                </div>
                <div className="p-3 rounded-lg bg-navy-700/50">
                  <p className="text-gray-400 text-xs mb-1">Platform</p>
                  <p className="text-white font-bold text-lg">MT5</p>
                  <p className="text-gray-600 text-[10px]">MetaTrader 5</p>
                </div>
              </div>
              <p className="text-gray-500 text-xs mt-4 border-t border-navy-700 pt-3">
                Trade on MetaTrader 5 to meet the profit target. Withdrawals available once you pass.
              </p>
            </div>
          </div>
        )}

        {activeTab === 'withdraw' && (
          <div className="card p-6 max-w-lg">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-gold-400/10 flex items-center justify-center">
                <ArrowUpRight className="w-5 h-5 text-gold-400" />
              </div>
              <div>
                <h3 className="text-white font-semibold font-poppins">Request Withdrawal</h3>
                <p className="text-gray-400 text-sm">Withdraw your profits</p>
              </div>
            </div>

            <form onSubmit={handleWithdrawalSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Amount ($)</label>
                <input
                  type="number"
                  value={withdrawal.amount}
                  onChange={(e) => setWithdrawal((p) => ({ ...p, amount: e.target.value }))}
                  placeholder="Enter amount"
                  className="w-full bg-navy-700 border border-navy-600 rounded-lg py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:border-gold-400 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">UPI ID</label>
                <input
                  type="text"
                  value={withdrawal.upi}
                  onChange={(e) => setWithdrawal((p) => ({ ...p, upi: e.target.value }))}
                  placeholder="yourname@upi"
                  className="w-full bg-navy-700 border border-navy-600 rounded-lg py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:border-gold-400 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Bank Details (Optional)</label>
                <textarea
                  value={withdrawal.bankDetails}
                  onChange={(e) => setWithdrawal((p) => ({ ...p, bankDetails: e.target.value }))}
                  rows={2}
                  placeholder="Account number, IFSC, bank name"
                  className="w-full bg-navy-700 border border-navy-600 rounded-lg py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:border-gold-400 transition-colors resize-none"
                />
              </div>
              <button
                type="submit"
                disabled={withdrawing}
                className="btn-primary w-full py-3 font-semibold disabled:opacity-50"
              >
                {withdrawing ? 'Submitting...' : 'Request Withdrawal'}
              </button>
            </form>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="card p-6 overflow-x-auto">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-gold-400/10 flex items-center justify-center">
                <History className="w-5 h-5 text-gold-400" />
              </div>
              <div>
                <h3 className="text-white font-semibold font-poppins">Withdrawal History</h3>
                <p className="text-gray-400 text-sm">Track your past withdrawals</p>
              </div>
            </div>

            {history.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No withdrawal requests yet.</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-navy-600">
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">Date</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">Amount</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">UPI</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">Status</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">Ref</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((item, idx) => (
                    <tr key={idx} className="border-b border-navy-700/50 hover:bg-navy-700/30">
                      <td className="py-3 px-4 text-gray-300">
                        {new Date(item.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 text-white font-semibold">${item.amount}</td>
                      <td className="py-3 px-4 text-gray-400">{item.upi}</td>
                      <td className="py-3 px-4">{statusBadge(item.status)}</td>
                      <td className="py-3 px-4 text-gray-400 font-mono text-xs">
                        {item.transaction_ref || '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
