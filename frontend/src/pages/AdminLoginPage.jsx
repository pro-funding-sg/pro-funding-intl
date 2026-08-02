import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Mail, Lock } from 'lucide-react';
import toast from 'react-hot-toast';
import { apiFetch } from '../lib/api';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }
    setLoading(true);
    try {
      const res = await apiFetch('/api/admin/auth', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Login failed');
      localStorage.setItem('admin_token', data.token);
      toast.success('Admin login successful');
      navigate('/admin');
    } catch (err) {
      toast.error(err.message || 'Admin login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-navy-900 px-4">
      <div className="card w-full max-w-md p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gold-400/10 mb-4">
            <Shield className="w-8 h-8 text-gold-400" />
          </div>
          <h1 className="text-3xl font-bold font-poppins text-white">Admin Panel</h1>
          <p className="text-gray-400 mt-2">Restricted access</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@profunding.com"
                className="w-full bg-navy-700 border border-navy-600 rounded-lg py-3 pl-10 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-gold-400 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-navy-700 border border-navy-600 rounded-lg py-3 pl-10 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-gold-400 transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full py-3 text-base font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Signing in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
}
