import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, CreditCard, ArrowUpRight, LogOut,
  TrendingUp, DollarSign, BarChart3, CheckCircle, XCircle,
  UserPlus, RefreshCw, Server,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { apiFetch } from '../lib/api';

const MT5_PLANS = { Starter: 1000, Standard: 5000, Premium: 10000 };

export default function AdminPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState('stats');
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [payments, setPayments] = useState([]);
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [markPaidModal, setMarkPaidModal] = useState({ open: false, id: null });
  const [transactionRef, setTransactionRef] = useState('');
  const [mt5Modal, setMt5Modal] = useState({ open: false, userId: null, userName: '' });
  const [mt5Plan, setMt5Plan] = useState('Standard');
  const [assigningMt5, setAssigningMt5] = useState(false);
  const intervalRef = useRef(null);

  const loadTabData = useCallback(async () => {
    try {
      switch (tab) {
        case 'stats': {
          const res = await apiFetch('/api/admin/stats');
          if (res.ok) setStats(await res.json());
          break;
        }
        case 'users': {
          const res = await apiFetch('/api/admin/users');
          if (res.ok) { const d = await res.json(); setUsers(d.users || []); }
          break;
        }
        case 'payments': {
          const res = await apiFetch('/api/admin/payments');
          if (res.ok) { const d = await res.json(); setPayments(d.payments || []); }
          break;
        }
        case 'withdrawals': {
          const res = await apiFetch('/api/admin/withdrawals');
          if (res.ok) { const d = await res.json(); setWithdrawals(d.withdrawals || []); }
          break;
        }
      }
    } catch (err) {
      console.error('Failed to load tab data:', err);
    } finally {
      setLoading(false);
    }
  }, [tab]);

  // Initial load & tab change
  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) { navigate('/admin/login'); return; }
    setLoading(true);
    loadTabData();
  }, [navigate, loadTabData]);

  // Auto-refresh every 10 seconds
  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => loadTabData(), 10000);
    return () => clearInterval(intervalRef.current);
  }, [loadTabData]);

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    navigate('/admin/login');
  };

  const handleCreateMT5 = async (userId) => {
    try {
      const res = await apiFetch('/api/mt5/create-account', {
        method: 'POST',
        body: JSON.stringify({ user_id: userId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create MT5');
      toast.success('MT5 account created!');
      loadTabData();
    } catch (err) { toast.error(err.message); }
  };

  const handleAssignFreeMt5 = async () => {
    setAssigningMt5(true);
    try {
      const res = await apiFetch('/api/admin/assign-mt5', {
        method: 'POST',
        body: JSON.stringify({ user_id: mt5Modal.userId, plan: mt5Plan }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      toast.success(`Free MT5 assigned — ${mt5Plan} ($${MT5_PLANS[mt5Plan]})`);
      setMt5Modal({ open: false, userId: null, userName: '' });
      loadTabData();
    } catch (err) { toast.error(err.message); }
    finally { setAssigningMt5(false); }
  };

  const handleApprovePayment = async (id) => {
    try {
      const res = await apiFetch(`/api/admin/payments/${id}`, {
        method: 'PUT', body: JSON.stringify({ status: 'approved' }),
      });
      if (!res.ok) throw new Error('Failed');
      toast.success('Payment approved');
      loadTabData();
    } catch (err) { toast.error(err.message); }
  };

  const handleRejectPayment = async (id) => {
    try {
      const res = await apiFetch(`/api/admin/payments/${id}`, {
        method: 'PUT', body: JSON.stringify({ status: 'rejected' }),
      });
      if (!res.ok) throw new Error('Failed');
      toast.success('Payment rejected');
      loadTabData();
    } catch (err) { toast.error(err.message); }
  };

  const handleMarkPaid = async () => {
    try {
      const res = await apiFetch(`/api/admin/withdrawals/${markPaidModal.id}`, {
        method: 'PUT',
        body: JSON.stringify({ status: 'paid', transaction_ref: transactionRef }),
      });
      if (!res.ok) throw new Error('Failed');
      toast.success('Withdrawal marked as paid');
      setMarkPaidModal({ open: false, id: null });
      setTransactionRef('');
      loadTabData();
    } catch (err) { toast.error(err.message); }
  };

  const badge = (status) => {
    const map = {
      paid: 'bg-green-400/10 text-green-400 border-green-400/20',
      approved: 'bg-green-400/10 text-green-400 border-green-400/20',
      pending: 'bg-yellow-400/10 text-yellow-400 border-yellow-400/20',
      rejected: 'bg-red-400/10 text-red-400 border-red-400/20',
      active: 'bg-green-400/10 text-green-400 border-green-400/20',
    };
    return <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${map[status?.toLowerCase()] || map.pending}`}>{status || 'pending'}</span>;
  };

  const tabs = [
    { key: 'stats', label: 'Stats', icon: BarChart3 },
    { key: 'users', label: 'Users', icon: Users },
    { key: 'payments', label: 'Payments', icon: CreditCard },
    { key: 'withdrawals', label: 'Withdrawals', icon: ArrowUpRight },
  ];

  return (
    <div className="min-h-screen bg-navy-900 flex">
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-navy-800 border-r border-navy-700 min-h-screen pt-20 fixed left-0 top-0 bottom-0">
        <div className="px-4 py-6 flex-1">
          <div className="flex items-center gap-2 px-3 mb-8">
            <div className="w-8 h-8 rounded-lg bg-gold-400/20 flex items-center justify-center">
              <LayoutDashboard className="w-4 h-4 text-gold-400" />
            </div>
            <span className="text-white font-bold font-poppins text-sm">Admin Panel</span>
          </div>
          <nav className="space-y-1">
            {tabs.map((t) => (
              <button key={t.key} onClick={() => setTab(t.key)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  tab === t.key ? 'bg-gold-400/10 text-gold-400' : 'text-gray-400 hover:text-gray-200 hover:bg-navy-700/50'}`}>
                <t.icon className="w-4 h-4" />{t.label}
              </button>
            ))}
          </nav>
        </div>
        <div className="p-4 border-t border-navy-700">
          <button onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-red-400 hover:bg-red-400/5 transition-all">
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>
      </aside>

      {/* Mobile tabs */}
      <div className="md:hidden fixed top-16 left-0 right-0 bg-navy-800 border-b border-navy-700 z-40 px-2 py-2 overflow-x-auto">
        <div className="flex gap-1">
          {tabs.map((t) => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap ${tab === t.key ? 'bg-gold-400/10 text-gold-400' : 'text-gray-400'}`}>
              <t.icon className="w-3.5 h-3.5" />{t.label}
            </button>
          ))}
          <button onClick={handleLogout} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-400 hover:text-red-400 ml-auto">
            <LogOut className="w-3.5 h-3.5" /> Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 pt-20 md:pt-20 pb-12 px-4 sm:px-6 lg:px-8 mt-8 md:mt-0">
        {/* Refresh bar */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold font-poppins text-white">{tab.charAt(0).toUpperCase() + tab.slice(1)}</h2>
          <button onClick={loadTabData} className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gold-400 transition-colors px-3 py-1.5 rounded-lg hover:bg-navy-700">
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </button>
        </div>

        {loading && (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-gold-400 border-t-transparent" />
          </div>
        )}

        {/* STATS */}
        {!loading && tab === 'stats' && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { icon: Users, color: 'text-blue-400', bg: 'bg-blue-400/10', label: 'Total Users', val: stats?.totalUsers ?? 0 },
              { icon: TrendingUp, color: 'text-green-400', bg: 'bg-green-400/10', label: 'Active Accounts', val: stats?.activeAccounts ?? 0 },
              { icon: DollarSign, color: 'text-gold-400', bg: 'bg-gold-400/10', label: 'Total Collected', val: `$${stats?.totalCollected ?? 0}` },
            ].map((s, i) => (
              <div key={i} className="card p-6 flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl ${s.bg} flex items-center justify-center`}>
                  <s.icon className={`w-6 h-6 ${s.color}`} />
                </div>
                <div>
                  <p className="text-gray-500 text-sm">{s.label}</p>
                  <p className="text-3xl font-bold text-white font-poppins">{s.val}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* USERS */}
        {!loading && tab === 'users' && (
          <div className="card overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-navy-600">
                  <th className="text-left py-3 px-3 text-gray-400 font-medium">Name</th>
                  <th className="text-left py-3 px-3 text-gray-400 font-medium">Email</th>
                  <th className="text-left py-3 px-3 text-gray-400 font-medium">Phone</th>
                  <th className="text-left py-3 px-3 text-gray-400 font-medium">Plan</th>
                  <th className="text-left py-3 px-3 text-gray-400 font-medium">Payment</th>
                  <th className="text-left py-3 px-3 text-gray-400 font-medium">MT5</th>
                  <th className="text-left py-3 px-3 text-gray-400 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-b border-navy-700/50 hover:bg-navy-700/30">
                    <td className="py-3 px-3 text-white font-medium">{u.name}</td>
                    <td className="py-3 px-3 text-gray-400 text-xs">{u.email}</td>
                    <td className="py-3 px-3 text-gray-400 text-xs">{u.phone || '—'}</td>
                    <td className="py-3 px-3 text-white text-xs">{u.plan || 'none'}</td>
                    <td className="py-3 px-3">{badge(u.payment_status)}</td>
                    <td className="py-3 px-3">
                      {u.mt5_login ? (
                        <span className="text-green-400 font-mono text-xs" title={`Server: ${u.mt5_server}`}>
                          {u.mt5_login}
                        </span>
                      ) : <span className="text-gray-500 text-xs">—</span>}
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex gap-1.5">
                        <button onClick={() => setMt5Modal({ open: true, userId: u.id, userName: u.name })}
                          className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-gold-400/10 text-gold-400 hover:bg-gold-400/20 transition-colors"
                          title="Assign Free MT5">
                          <Server className="w-3 h-3" /> Free MT5
                        </button>
                        {!u.mt5_login && (
                          <button onClick={() => handleCreateMT5(u.id)}
                            className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-blue-400/10 text-blue-400 hover:bg-blue-400/20 transition-colors"
                            title="Create MT5 from plan">
                            <UserPlus className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr><td colSpan={7} className="py-8 text-center text-gray-500">No users yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* PAYMENTS */}
        {!loading && tab === 'payments' && (
          <div className="card overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-navy-600">
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Email</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Amount</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Plan</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">UTR</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Status</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Date</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((p) => (
                  <tr key={p.id} className="border-b border-navy-700/50 hover:bg-navy-700/30">
                    <td className="py-3 px-4 text-gray-400">{p.email || p.users?.email}</td>
                    <td className="py-3 px-4 text-white font-semibold">${p.amount}</td>
                    <td className="py-3 px-4 text-white">{p.plan}</td>
                    <td className="py-3 px-4 text-gray-400 font-mono text-xs">{p.utr}</td>
                    <td className="py-3 px-4">{badge(p.status)}</td>
                    <td className="py-3 px-4 text-gray-400 text-xs">{p.created_at ? new Date(p.created_at).toLocaleDateString() : '—'}</td>
                    <td className="py-3 px-4">
                      {p.status === 'pending' && (
                        <div className="flex gap-2">
                          <button onClick={() => handleApprovePayment(p.id)}
                            className="p-1.5 rounded-lg bg-green-400/10 text-green-400 hover:bg-green-400/20 transition-colors" title="Approve">
                            <CheckCircle className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleRejectPayment(p.id)}
                            className="p-1.5 rounded-lg bg-red-400/10 text-red-400 hover:bg-red-400/20 transition-colors" title="Reject">
                            <XCircle className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
                {payments.length === 0 && (
                  <tr><td colSpan={7} className="py-8 text-center text-gray-500">No payments yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* WITHDRAWALS */}
        {!loading && tab === 'withdrawals' && (
          <div className="card overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-navy-600">
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Email</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Amount</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">UPI</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Status</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Date</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {withdrawals.map((w) => (
                  <tr key={w.id} className="border-b border-navy-700/50 hover:bg-navy-700/30">
                    <td className="py-3 px-4 text-gray-400">{w.email || w.users?.email}</td>
                    <td className="py-3 px-4 text-white font-semibold">${w.amount}</td>
                    <td className="py-3 px-4 text-gray-400 font-mono text-xs">{w.upi}</td>
                    <td className="py-3 px-4">{badge(w.status)}</td>
                    <td className="py-3 px-4 text-gray-400 text-xs">{w.created_at ? new Date(w.created_at).toLocaleDateString() : '—'}</td>
                    <td className="py-3 px-4">
                      {w.status === 'pending' && (
                        <button onClick={() => setMarkPaidModal({ open: true, id: w.id })}
                          className="btn-primary text-xs px-3 py-1.5 inline-flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" /> Mark Paid
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {withdrawals.length === 0 && (
                  <tr><td colSpan={6} className="py-8 text-center text-gray-500">No withdrawal requests yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Mark Paid Modal */}
        {markPaidModal.open && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <div className="card p-6 w-full max-w-md">
              <h3 className="text-white font-bold font-poppins text-lg mb-4">Mark Withdrawal as Paid</h3>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Transaction Reference</label>
                <input type="text" value={transactionRef} onChange={(e) => setTransactionRef(e.target.value)}
                  placeholder="Enter transaction ID"
                  className="w-full bg-navy-700 border border-navy-600 rounded-lg py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:border-gold-400 transition-colors" />
              </div>
              <div className="flex gap-3">
                <button onClick={handleMarkPaid} className="btn-primary flex-1 py-2.5 font-semibold">Confirm</button>
                <button onClick={() => { setMarkPaidModal({ open: false, id: null }); setTransactionRef(''); }}
                  className="btn-outline flex-1 py-2.5">Cancel</button>
              </div>
            </div>
          </div>
        )}

        {/* Free MT5 Modal */}
        {mt5Modal.open && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <div className="card p-6 w-full max-w-md">
              <h3 className="text-white font-bold font-poppins text-lg mb-2">Assign Free MT5 Account</h3>
              <p className="text-gray-400 text-sm mb-4">User: <span className="text-white">{mt5Modal.userName}</span></p>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-2">Select Plan</label>
                <div className="grid grid-cols-3 gap-2">
                  {Object.entries(MT5_PLANS).map(([plan, balance]) => (
                    <button key={plan}
                      onClick={() => setMt5Plan(plan)}
                      className={`py-3 px-2 rounded-lg text-sm font-semibold transition-all border ${
                        mt5Plan === plan
                          ? 'border-gold-400 bg-gold-400/10 text-gold-400'
                          : 'border-navy-600 text-gray-400 hover:border-gray-500'
                      }`}>
                      <div>{plan}</div>
                      <div className="text-xs mt-1 opacity-75">${balance.toLocaleString()}</div>
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex gap-3">
                <button onClick={handleAssignFreeMt5} disabled={assigningMt5}
                  className="btn-primary flex-1 py-2.5 font-semibold disabled:opacity-50">
                  {assigningMt5 ? 'Assigning...' : `Assign ${mt5Plan} ($${MT5_PLANS[mt5Plan].toLocaleString()})`}
                </button>
                <button onClick={() => setMt5Modal({ open: false, userId: null, userName: '' })}
                  className="btn-outline flex-1 py-2.5">Cancel</button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
