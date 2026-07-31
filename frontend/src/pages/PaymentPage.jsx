import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import QRCode from 'qrcode.react';
import { ArrowLeft, Copy, CheckCircle, Wallet } from 'lucide-react';
import toast from 'react-hot-toast';
import { apiFetch } from '../lib/api';

const planDetails = {
  starter: { name: 'Starter', price: 10, funded: '$1,000', amount: 10 },
  standard: { name: 'Standard', price: 25, funded: '$5,000', amount: 25 },
  premium: { name: 'Premium', price: 50, funded: '$10,000', amount: 50 },
};

const UPI_ID = 'kmpyogi25@okaxis';
const UPI_NAME = 'ProFundingInternational';

export default function PaymentPage() {
  const { plan } = useParams();
  const navigate = useNavigate();
  const [utr, setUtr] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const info = planDetails[plan?.toLowerCase()];

  if (!info) {
    return (
      <div className="min-h-screen bg-navy-900 flex items-center justify-center pt-16">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-2">Plan Not Found</h1>
          <p className="text-gray-400 mb-4">The plan you're looking for doesn't exist.</p>
          <button onClick={() => navigate('/')} className="btn-primary px-6 py-2">
            Go Home
          </button>
        </div>
      </div>
    );
  }

  const upiString = `upi://pay?pa=${UPI_ID}&pn=${UPI_NAME}&am=${info.amount}&cu=INR`;

  const copyUPI = () => {
    navigator.clipboard.writeText(UPI_ID);
    toast.success('UPI ID copied!');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!utr.trim()) {
      toast.error('Please enter the UTR number');
      return;
    }
    setSubmitting(true);
    try {
      const res = await apiFetch('/api/payments/submit', {
        method: 'POST',
        body: JSON.stringify({
          plan: info.name.toLowerCase(),
          amount: info.amount,
          utr: utr.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Payment submission failed');
      toast.success('Payment submitted! Redirecting...');
      setTimeout(() => navigate('/dashboard'), 1500);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-navy-900 pt-24 pb-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back button */}
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-gray-400 hover:text-gold-400 transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Plans
        </button>

        {/* Plan Summary */}
        <div className="card p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-gold-400/10 flex items-center justify-center">
              <Wallet className="w-5 h-5 text-gold-400" />
            </div>
            <div>
              <h2 className="text-white font-semibold font-poppins">{info.name} Plan</h2>
              <p className="text-gray-400 text-sm">Funding: {info.funded}</p>
            </div>
            <div className="ml-auto text-right">
              <span className="text-3xl font-bold text-gold-400 font-poppins">${info.price}</span>
              <p className="text-gray-500 text-xs">one-time fee</p>
            </div>
          </div>
        </div>

        {/* UPI QR */}
        <div className="card p-8 text-center mb-6">
          <h3 className="text-white font-semibold font-poppins mb-6">Scan & Pay with UPI</h3>
          <div className="inline-block p-4 bg-white rounded-2xl mb-4">
            <QRCode value={upiString} size={200} level="H" />
          </div>
          <p className="text-gray-400 text-sm mb-2">Amount: <span className="text-gold-400 font-bold">₹{info.amount}</span></p>
          <div className="flex items-center justify-center gap-2">
            <span className="text-gray-300 text-sm font-mono">{UPI_ID}</span>
            <button
              onClick={copyUPI}
              className="p-1.5 rounded-lg hover:bg-navy-700 transition-colors"
              title="Copy UPI ID"
            >
              <Copy className="w-4 h-4 text-gold-400" />
            </button>
          </div>
          <p className="text-gray-500 text-xs mt-3">
            Open any UPI app (GPay, PhonePe, Paytm) and scan this QR code
          </p>
        </div>

        {/* UTR Form */}
        <form onSubmit={handleSubmit} className="card p-6">
          <h3 className="text-white font-semibold font-poppins mb-4">Confirm Payment</h3>
          <p className="text-gray-400 text-sm mb-4">
            After completing the payment, enter the UTR (Unique Transaction Reference) number from your UPI app.
          </p>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-300 mb-1.5">UTR Number</label>
            <input
              type="text"
              value={utr}
              onChange={(e) => setUtr(e.target.value)}
              placeholder="e.g. 123456789012"
              className="w-full bg-navy-700 border border-navy-600 rounded-lg py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:border-gold-400 transition-colors"
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="btn-primary w-full py-3 font-semibold inline-flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {submitting ? (
              'Submitting...'
            ) : (
              <>
                <CheckCircle className="w-5 h-5" /> Confirm & Submit
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
