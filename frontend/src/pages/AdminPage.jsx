import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  CreditCard,
  ArrowUpRight,
  LogOut,
  TrendingUp,
  DollarSign,
  BarChart3,
  CheckCircle,
  XCircle,
  UserPlus,
  RefreshCw,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { apiFetch, API_BASE } from '../lib/api';

const ADMIN_BASE = `${API_BASE}/api/admin`;

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

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      navigate('/admin/login');
      return;
    }
    loadTabData();
  }, [navigate]);

  useEffect(() => {
    if (tab !== 'markPaidModal') loadTabData();
  }, [tab]);

  const headers = () => {
    const token = localStorage.getItem('admin_token');
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    };
  };

  const loadTabData = async () => {
    setLoading(true);
    try {
      switch (tab) {
        case 'stats': {
          const res = await apiFetch('/api/admin/stats');
          const data = await res.json();
          if (res.ok) setStats(data);
          break;
        }
        case 'users': {
          const res = await apiFetch('/api/admin/users');
          const data = await res.json();
          if (res.ok) setUsers(data.users || []);
          break;
        }
        case 'payments': {
          const res = await apiFetch('/api/admin/payments');
          const data = await res.json();
          if (res.ok) setPayments(data.payments || []);
          break;
        }
        case 'withdrawals': {
          const res = await apiFetch('/api/admin/withdrawals');
          const data = await res.json();
          if (res.ok) setWithdrawals(data.withdrawals || []);
          break;
        }
      }
    } catch (err) {
      console.error('Failed to load tab data:', err);
    } finally {
      setLoading(false);
    }
  };

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
      if (!res.ok) throw new Error(data.message || 'Failed to create MT5 account');
      toast.success('MT5 account created!');
      loadTabData();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleApprovePayment = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/payments/${id}`, {
        method: 'PUT',
        headers: headers(),
        body: JSON.stringify({ status: 'approved' }),
      });
      if (!res.ok) throw new Error('Failed to approve');
      toast.success('Payment approved');
      loadTabData();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleRejectPayment = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/payments/${id}`, {
        method: 'PUT',
        headers: headers(),
        body: JSON.stringify({ status: 'rejected' }),
      });
      if (!res.ok) throw new Error('Failed to reject');
      toast.success('Payment rejected');
      loadTabData();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleMarkPaid = async () => {
    try {
      const res = await fetch(`${API_BASE}/withdrawals/${markPaidModal.id}`, {
        method: 'PUT',
        headers: headers(),
        body: JSON.stringify({ status: 'paid', transaction_ref: transactionRef }),
      });
      if (!res.ok) throw new Error('Failed to mark paid');
      toast.success('Withdrawal marked as paid');
      setMarkPaidModal({ open: false, id: null });
      setTransactionRef('');
      loadTabData();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const badge = (status) => {
    const map = {
      paid: 'bg-green-400/10 text-green-400 border-green-400/20',
      approved: 'bg-green-400/10 text-green-400 border-green-400/20',
      pending: 'bg-yellow-400/10 text-yellow-400 border-yellow-400/20',
      rejected: 'bg-red-400/10 text-red-400 border-red-400/20',
      active: 'bg-green-400/10 text-green-400 border-green-400/20',
    };
    return (
      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${map[status?.toLowerCase()] || map.pending}`}>
        {status || 'pending'}
      </span>
    );
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
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  tab === t.key
                    ? 'bg-gold-400/10 text-gold-400'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-navy-700/50'
                }`}
              >
                <t.icon className="w-4 h-4" />
                {t.label}
              </button>
            ))}
          </nav>
        </div>
        <div className="p-4 border-t border-navy-700">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-red-400 hover:bg-red-400/5 transition-all"
          >
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>
      </aside>

      {/* Mobile tabs */}
      <div className="md:hidden fixed top-16 left-0 right-0 bg-navy-800 border-b border-navy-700 z-40 px-2 py-2 overflow-x-auto">
        <div className="flex gap-1">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap ${
                tab === t.key
                  ? 'bg-gold-400/10 text-gold-400'
                  : 'text-gray-400'
              }`}
            >
              <t.icon className="w-3.5 h-3.5" />
              {t.label}
            </button>
          ))}
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-400 hover:text-red-400 ml-auto"
          >
            <LogOut className="w-3.5 h-3.5" /> Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 pt-20 md:pt-20 pb-12 px-4 sm:px-6 lg:px-8 mt-8 md:mt-0">
        {loading && (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-gold-400 border-t-transparent" />
          </div>
        )}

        {/* ---------- STATS ---------- */}
        {!loading && tab === 'stats' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold font-poppins text-white mb-6">Dashboard Overview</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="card p-6 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-400/10 flex items-center justify-center">
                  <Users className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Total Users</p>
                  <p className="text-3xl font-bold text-white font-poppins">{stats?.totalUsers ?? 0}</p>
                </div>
              </div>
              <div className="card p-6 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-green-400/10 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-green-400" />
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Active Accounts</p>
                  <p className="text-3xl font-bold text-white font-poppins">{stats?.activeAccounts ?? 0}</p>
                </div>
              </div>
              <div className="card p-6 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gold-400/10 flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-gold-400" />
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Total Collected</p>
                  <p className="text-3xl font-bold text-white font-poppins">${stats?.totalCollected ?? 0}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ---------- USERS ---------- */}
        {!loading && tab === 'users' && (
          <div>
            <h2 className="text-2xl font-bold font-poppins text-white mb-6">Users</h2>
            <div className="card overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-navy-600">
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">Name</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">Email</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">Phone</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">Plan</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">Payment</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">MT5</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id} className="border-b border-navy-700/50 hover:bg-navy-700/30">
                      <td className="py-3 px-4 text-white font-medium">{u.name}</td>
                      <td className="py-3 px-4 text-gray-400">{u.email}</td>
                      <td className="py-3 px-4 text-gray-400">{u.phone || '—'}</td>
                      <td className="py-3 px-4 text-white">{u.plan || '—'}</td>
                      <td className="py-3 px-4">{badge(u.payment_status)}</td>
                      <td className="py-3 px-4 text-gray-300 font-mono text-xs">{u.mt5_login || '—'}</td>
                      <td className="py-3 px-4">
                        {!u.mt5_login && (
                          <button
                            onClick={() => handleCreateMT5(u.id)}
                            className="btn-primary text-xs px-3 py-1.5 inline-flex items-center gap-1"
                          >
                            <UserPlus className="w-3 h-3" /> Create MT5
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {users.length === 0 && (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-gray-500">No users yet.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ---------- PAYMENTS ---------- */}
        {!loading && tab === 'payments' && (
          <div>
            <h2 className="text-2xl font-bold font-poppins text-white mb-6">Payments</h2>
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
                      <td className="py-3 px-4 text-gray-400">{p.email}</td>
                      <td className="py-3 px-4 text-white font-semibold">${p.amount}</td>
                      <td className="py-3 px-4 text-white">{p.plan}</td>
                      <td className="py-3 px-4 text-gray-400 font-mono text-xs">{p.utr}</td>
                      <td className="py-3 px-4">{badge(p.status)}</td>
                      <td className="py-3 px-4 text-gray-400 text-xs">
                        {p.created_at ? new Date(p.created_at).toLocaleDateString() : '—'}
                      </td>
                      <td className="py-3 px-4">
                        {p.status === 'pending' && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleApprovePayment(p.id)}
                              className="p-1.5 rounded-lg bg-green-400/10 text-green-400 hover:bg-green-400/20 transition-colors"
                              title="Approve"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleRejectPayment(p.id)}
                              className="p-1.5 rounded-lg bg-red-400/10 text-red-400 hover:bg-red-400/20 transition-colors"
                              title="Reject"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                  {payments.length === 0 && (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-gray-500">No payments yet.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ---------- WITHDRAWALS ---------- */}
        {!loading && tab === 'withdrawals' && (
          <div>
            <h2 className="text-2xl font-bold font-poppins text-white mb-6">Withdrawals</h2>
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
                      <td className="py-3 px-4 text-gray-400">{w.email}</td>
                      <td className="py-3 px-4 text-white font-semibold">${w.amount}</td>
                      <td className="py-3 px-4 text-gray-400 font-mono text-xs">{w.upi}</td>
                      <td className="py-3 px-4">{badge(w.status)}</td>
                      <td className="py-3 px-4 text-gray-400 text-xs">
                        {w.created_at ? new Date(w.created_at).toLocaleDateString() : '—'}
                      </td>
                      <td className="py-3 px-4">
                        {w.status === 'pending' && (
                          <button
                            onClick={() => setMarkPaidModal({ open: true, id: w.id })}
                            className="btn-primary text-xs px-3 py-1.5 inline-flex items-center gap-1"
                          >
                            <CheckCircle className="w-3 h-3" /> Mark Paid
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {withdrawals.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-gray-500">No withdrawal requests yet.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Mark Paid Modal */}
        {markPaidModal.open && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <div className="card p-6 w-full max-w-md">
              <h3 className="text-white font-bold font-poppins text-lg mb-4">Mark Withdrawal as Paid</h3>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Transaction Reference</label>
                <input
                  type="text"
                  value={transactionRef}
                  onChange={(e) => setTransactionRef(e.target.value)}
                  placeholder="Enter transaction ID"
                  className="w-full bg-navy-700 border border-navy-600 rounded-lg py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:border-gold-400 transition-colors"
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleMarkPaid}
                  className="btn-primary flex-1 py-2.5 font-semibold"
                >
                  Confirm
                </button>
                <button
                  onClick={() => { setMarkPaidModal({ open: false, id: null }); setTransactionRef(''); }}
                  className="btn-outline flex-1 py-2.5"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
