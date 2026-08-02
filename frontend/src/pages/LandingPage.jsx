import { Link } from 'react-router-dom';
import {
  Target,
  Shield,
  TrendingUp,
  Check,
  AlertTriangle,
  Clock,
  Star,
  ChevronDown,
  Mail,
  Phone,
  MapPin,
  Send,
  ArrowRight,
} from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';

const plans = [
  {
    name: 'Starter',
    price: 10,
    funded: '$1,000',
    amount: 1,
    slug: 'starter',
    popular: false,
    rules: ['8% Profit Target', '5% Daily Drawdown', '10% Max Drawdown', 'No Time Limit', 'MT5 Platform'],
  },
  {
    name: 'Standard',
    price: 25,
    funded: '$5,000',
    amount: 5,
    slug: 'standard',
    popular: true,
    rules: ['8% Profit Target', '5% Daily Drawdown', '10% Max Drawdown', 'No Time Limit', 'MT5 Platform', 'Priority Support'],
  },
  {
    name: 'Premium',
    price: 50,
    funded: '$10,000',
    amount: 10,
    slug: 'premium',
    popular: false,
    rules: ['8% Profit Target', '5% Daily Drawdown', '10% Max Drawdown', 'No Time Limit', 'MT5 Platform', 'Priority Support', 'Instant Payout'],
  },
];

const steps = [
  {
    icon: Target,
    number: '01',
    title: 'Choose Challenge',
    desc: 'Select the funding tier that matches your trading style. Pay a small one-time fee and receive your evaluation account.',
  },
  {
    icon: Shield,
    number: '02',
    title: 'Pass Evaluation',
    desc: 'Trade on your demo account with real market conditions. Hit the 8% profit target while respecting drawdown rules.',
  },
  {
    icon: TrendingUp,
    number: '03',
    title: 'Get Funded',
    desc: 'Once you pass, receive a live funded account and start earning real money. You keep 80% of all profits.',
  },
];

const ruleCards = [
  {
    icon: Target,
    title: '8% Profit Target',
    desc: 'Reach 8% profit to pass the evaluation phase.',
  },
  {
    icon: AlertTriangle,
    title: '5% Daily Drawdown',
    desc: 'Equity must not drop more than 5% from the previous day.',
  },
  {
    icon: Shield,
    title: '10% Max Drawdown',
    desc: 'Trailing drawdown limit from your highest equity level.',
  },
  {
    icon: Clock,
    title: 'No Time Limit',
    desc: 'Trade at your own pace with no deadlines.',
  },
];

const faqData = [
  {
    q: 'What is a prop trading firm?',
    a: 'A proprietary trading firm provides traders with capital to trade financial markets. After passing an evaluation, you manage the firm\'s capital and keep 80% of the profits — without risking your own money.',
  },
  {
    q: 'How does the evaluation work?',
    a: 'Choose a challenge tier, pay a one-time fee, and trade on a demo account. Reach the 8% profit target without violating the 5% daily drawdown or 10% max drawdown. No time limits apply.',
  },
  {
    q: 'How and when do I get paid?',
    a: 'Profits are settled monthly. You keep 80% of all profits. Withdrawals are processed via UPI or bank transfer within 3-5 business days from your dashboard.',
  },
  {
    q: 'Is there a minimum trading period?',
    a: 'No. There is no minimum or maximum number of trading days. You can complete the evaluation as quickly or slowly as you prefer, as long as drawdown rules are respected.',
  },
  {
    q: 'What happens if I breach drawdown?',
    a: 'If you violate the 5% daily drawdown or 10% max drawdown, your evaluation account is terminated. You will need to purchase a new challenge to try again. We recommend conservative risk management.',
  },
  {
    q: 'What platform do you use?',
    a: 'All trading is done on MetaTrader 5 (MT5), the industry-standard platform for forex and CFD trading. You\'ll receive your MT5 credentials after payment.',
  },
];

function FAQSection() {
  const [openIdx, setOpenIdx] = useState(null);
  return (
    <section id="faq" className="py-20 bg-navy-800/50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="section-title">Frequently Asked Questions</h2>
          <p className="section-subtitle">Got questions? We have answers.</p>
        </div>
        <div className="space-y-3">
          {faqData.map((faq, idx) => (
            <div key={idx} className="card overflow-hidden">
              <button
                onClick={() => setOpenIdx(openIdx === idx ? null : idx)}
                className="w-full flex items-center justify-between p-5 text-left"
              >
                <span className="text-white font-medium font-poppins pr-4">{faq.q}</span>
                <ChevronDown
                  className={`w-5 h-5 text-gold-400 flex-shrink-0 transition-transform duration-300 ${
                    openIdx === idx ? 'rotate-180' : ''
                  }`}
                />
              </button>
              <div
                className={`overflow-hidden transition-all duration-300 ${
                  openIdx === idx ? 'max-h-48 pb-5 px-5' : 'max-h-0'
                }`}
              >
                <p className="text-gray-400 leading-relaxed text-sm">{faq.a}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function LandingPage() {
  const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' });
  const [contactLoading, setContactLoading] = useState(false);

  const handleContactSubmit = (e) => {
    e.preventDefault();
    if (!contactForm.name || !contactForm.email || !contactForm.message) {
      toast.error('Please fill in all fields');
      return;
    }
    setContactLoading(true);
    // Placeholder submission
    setTimeout(() => {
      toast.success('Message received! We\'ll get back to you soon.');
      setContactForm({ name: '', email: '', message: '' });
      setContactLoading(false);
    }, 1000);
  };

  return (
    <div className="bg-navy-900">
      {/* ======== HERO ======== */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
        {/* Animated gradient background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(212,175,55,0.08),transparent_50%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(212,175,55,0.05),transparent_50%)]" />
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gold-400/5 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gold-400/5 rounded-full blur-3xl animate-pulse animation-delay-2000" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gold-400/10 border border-gold-400/20 mb-8">
            <Star className="w-4 h-4 text-gold-400" />
            <span className="text-gold-400 text-sm font-medium">Trusted by traders worldwide</span>
          </div>

          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold font-poppins text-white leading-tight mb-6">
            Get Funded.
            <br />
            Trade{' '}
            <span className="gradient-text">Big.</span>
            <br />
            Keep{' '}
            <span className="gradient-text">80%</span> Profits.
          </h1>

          <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Join Pro Funding International — pass a simple evaluation and receive up to
            <span className="text-gold-400 font-semibold"> $10,000</span> in trading capital.
            No time limits. Real payouts. Your success is our business.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/signup" className="btn-primary px-8 py-4 text-lg font-semibold inline-flex items-center gap-2">
              Start Your Challenge <ArrowRight className="w-5 h-5" />
            </Link>
            <a
              href="#pricing"
              className="btn-outline px-8 py-4 text-lg font-semibold"
            >
              View Plans
            </a>
          </div>

          {/* Stats strip */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-20 max-w-3xl mx-auto">
            {[
              { value: '500+', label: 'Funded Traders' },
              { value: '$2M+', label: 'Paid Out' },
              { value: '80%', label: 'Profit Split' },
              { value: '∞', label: 'No Time Limit' },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-gold-400 font-poppins">{stat.value}</div>
                <div className="text-gray-500 text-sm mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ======== HOW IT WORKS ======== */}
      <section id="how-it-works" className="py-20 bg-navy-800/30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="section-title">How It Works</h2>
            <p className="section-subtitle">Three simple steps to become a funded trader.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step, idx) => (
              <div key={idx} className="relative card p-8 text-center group hover:border-gold-400/30 transition-colors">
                {/* Connector line between cards */}
                {idx < steps.length - 1 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 w-8 h-px bg-gold-400/30 z-0" />
                )}
                <div className="relative z-10">
                  <span className="inline-block text-5xl font-bold text-gold-400/20 font-poppins mb-4">
                    {step.number}
                  </span>
                  <div className="w-16 h-16 rounded-2xl bg-gold-400/10 flex items-center justify-center mx-auto mb-5 group-hover:scale-110 transition-transform">
                    <step.icon className="w-8 h-8 text-gold-400" />
                  </div>
                  <h3 className="text-xl font-bold font-poppins text-white mb-3">{step.title}</h3>
                  <p className="text-gray-400 leading-relaxed text-sm">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ======== PRICING ======== */}
      <section id="pricing" className="py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="section-title">Choose Your Challenge</h2>
            <p className="section-subtitle">One-time fee. No recurring charges. Just results.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {plans.map((plan, idx) => (
              <div
                key={idx}
                className={`relative card p-8 flex flex-col ${
                  plan.popular
                    ? 'border-gold-400/50 scale-[1.02] md:scale-105 shadow-xl shadow-gold-400/5'
                    : ''
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gold-400 text-navy-900 text-xs font-bold uppercase tracking-wider">
                    Most Popular
                  </div>
                )}

                <div className="text-center mb-6">
                  <h3 className="text-xl font-bold font-poppins text-white mb-2">{plan.name}</h3>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-4xl font-bold text-gold-400 font-poppins">${plan.price}</span>
                    <span className="text-gray-500 text-sm">/one-time</span>
                  </div>
                  <p className="text-gray-400 text-sm mt-2">
                    Get <span className="text-gold-400 font-semibold">{plan.funded}</span> in funding
                  </p>
                </div>

                <div className="flex-1 space-y-3 mb-8">
                  {plan.rules.map((rule, ri) => (
                    <div key={ri} className="flex items-center gap-3 text-sm">
                      <Check className="w-4 h-4 text-green-400 flex-shrink-0" />
                      <span className="text-gray-300">{rule}</span>
                    </div>
                  ))}
                </div>

                <Link
                  to={`/payment/${plan.slug}`}
                  className={`w-full py-3 rounded-lg text-center font-semibold transition-all ${
                    plan.popular
                      ? 'btn-primary'
                      : 'btn-outline text-sm'
                  }`}
                >
                  Start Challenge
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ======== TRADING RULES ======== */}
      <section className="py-20 bg-navy-800/30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="section-title">Trading Rules</h2>
            <p className="section-subtitle">Clear, transparent, and achievable evaluation criteria.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {ruleCards.map((rule, idx) => (
              <div key={idx} className="card p-6 text-center hover:border-gold-400/20 transition-colors">
                <div className="w-14 h-14 rounded-xl bg-gold-400/10 flex items-center justify-center mx-auto mb-4">
                  <rule.icon className="w-7 h-7 text-gold-400" />
                </div>
                <h3 className="text-white font-bold font-poppins mb-2">{rule.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{rule.desc}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-10">
            <Link to="/rules" className="btn-outline inline-flex items-center gap-2 px-6 py-3">
              View Full Rules <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ======== FAQ ======== */}
      <FAQSection />

      {/* ======== REFERRAL ======== */}
      <section className="py-20 bg-navy-800/30">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="section-title">Refer a Trader, Earn ₹200</h2>
          <p className="section-subtitle">Invite fellow traders to Pro Funding International. For every trader who signs up and takes a challenge, we credit ₹200 to your account.</p>
          <div className="card p-6 inline-block">
            <p className="text-gray-400 text-sm mb-2">Share your referral link:</p>
            <p className="text-gold-400 font-mono text-lg bg-navy-900 rounded-lg py-3 px-6 select-all tracking-wide">
              pro-funding-intl.surge.sh/?ref=YOURCODE
            </p>
            <div className="flex flex-wrap gap-2 justify-center mt-4">
              <a href={`https://wa.me/?text=Join%20Pro%20Funding%20International%20-%20India's%20most%20affordable%20prop%20firm.%20Only%20₹800%20for%20a%20$10,000%20funded%20account.%20${encodeURIComponent('https://pro-funding-intl.surge.sh')}`}
                target="_blank" rel="noopener"
                className="flex items-center gap-1 px-3 py-1.5 bg-green-600/20 text-green-400 rounded-full text-xs font-medium hover:bg-green-600/30 transition-colors">
                Share on WhatsApp
              </a>
              <a href={`https://t.me/share/url?url=${encodeURIComponent('https://pro-funding-intl.surge.sh')}&text=${encodeURIComponent("India's cheapest prop firm! ₹800 → $10,000 funded. 80% profit split.")}`}
                target="_blank" rel="noopener"
                className="flex items-center gap-1 px-3 py-1.5 bg-blue-500/20 text-blue-400 rounded-full text-xs font-medium hover:bg-blue-500/30 transition-colors">
                Share on Telegram
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ======== CONTACT ======== */}
      <section id="contact" className="py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="section-title">Get In Touch</h2>
            <p className="section-subtitle">Have questions? We're here to help.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact info */}
            <div className="space-y-8">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-gold-400/10 flex items-center justify-center flex-shrink-0">
                  <Mail className="w-6 h-6 text-gold-400" />
                </div>
                <div>
                  <h3 className="text-white font-semibold font-poppins mb-1">Email</h3>
                  <p className="text-gray-400">support@profunding.com</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-gold-400/10 flex items-center justify-center flex-shrink-0">
                  <Phone className="w-6 h-6 text-gold-400" />
                </div>
                <div>
                  <h3 className="text-white font-semibold font-poppins mb-1">Phone</h3>
                  <p className="text-gray-400">+91 98765 43210</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-gold-400/10 flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-6 h-6 text-gold-400" />
                </div>
                <div>
                  <h3 className="text-white font-semibold font-poppins mb-1">Office</h3>
                  <p className="text-gray-400">Mumbai, Maharashtra, India</p>
                </div>
              </div>
            </div>

            {/* Contact form */}
            <form onSubmit={handleContactSubmit} className="card p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Name</label>
                <input
                  type="text"
                  value={contactForm.name}
                  onChange={(e) => setContactForm((p) => ({ ...p, name: e.target.value }))}
                  placeholder="Your name"
                  className="w-full bg-navy-700 border border-navy-600 rounded-lg py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:border-gold-400 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Email</label>
                <input
                  type="email"
                  value={contactForm.email}
                  onChange={(e) => setContactForm((p) => ({ ...p, email: e.target.value }))}
                  placeholder="you@email.com"
                  className="w-full bg-navy-700 border border-navy-600 rounded-lg py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:border-gold-400 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Message</label>
                <textarea
                  value={contactForm.message}
                  onChange={(e) => setContactForm((p) => ({ ...p, message: e.target.value }))}
                  rows={4}
                  placeholder="How can we help?"
                  className="w-full bg-navy-700 border border-navy-600 rounded-lg py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:border-gold-400 transition-colors resize-none"
                />
              </div>
              <button
                type="submit"
                disabled={contactLoading}
                className="btn-primary w-full py-3 font-semibold inline-flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {contactLoading ? 'Sending...' : (
                  <>
                    Send Message <Send className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* ======== FOOTER ======== */}
      <footer className="py-8 border-t border-navy-700/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-500 text-sm">
            Pro Funding International &copy; {new Date().getFullYear()} — All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
