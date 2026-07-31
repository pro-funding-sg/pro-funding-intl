import { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';

const faqs = [
  {
    q: 'What is a prop trading firm?',
    a: 'A proprietary (prop) trading firm provides traders with capital to trade financial markets. After passing an evaluation, you manage the firm\'s capital and keep a percentage of the profits — typically 80%. You don\'t risk your own money, only the firm\'s capital.',
  },
  {
    q: 'How does the evaluation process work?',
    a: 'You choose a challenge tier (Starter, Standard, or Premium), pay a one-time fee, and trade on a demo account. To pass, you must reach the profit target (8%) without violating daily drawdown (5%) or maximum drawdown (10%) limits. There is no time limit.',
  },
  {
    q: 'How much can I earn?',
    a: 'Traders keep 80% of all profits generated on funded accounts. For example, if you earn $5,000 in a month on a $50,000 funded account, you keep $4,000. Profits are calculated monthly and paid out via bank transfer or UPI.',
  },
  {
    q: 'Is there a time limit to complete the challenge?',
    a: 'No. Unlike many other prop firms, we do not impose any minimum or maximum trading days. You can take as long as you need — whether that\'s a week or several months — as long as you follow the drawdown rules.',
  },
  {
    q: 'What happens if I violate a drawdown rule?',
    a: 'If you breach the 5% daily drawdown or 10% maximum drawdown, your evaluation account is terminated. You will need to purchase a new challenge to try again. We strongly recommend using proper risk management.',
  },
  {
    q: 'How do withdrawals work?',
    a: 'Once funded, you can request withdrawals from your dashboard. Profits are settled monthly. Withdrawals are processed via UPI or bank transfer within 3-5 business days. A minimum profit threshold may apply.',
  },
];

export default function FAQPage() {
  const [openIdx, setOpenIdx] = useState(null);

  const toggle = (idx) => {
    setOpenIdx(openIdx === idx ? null : idx);
  };

  return (
    <div className="min-h-screen bg-navy-900 pt-24 pb-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gold-400/10 mb-4">
            <HelpCircle className="w-8 h-8 text-gold-400" />
          </div>
          <h1 className="section-title">Frequently Asked Questions</h1>
          <p className="section-subtitle">
            Everything you need to know about trading with Pro Funding International.
          </p>
        </div>

        {/* FAQ Accordion */}
        <div className="space-y-3">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="card overflow-hidden transition-all duration-300"
            >
              <button
                onClick={() => toggle(idx)}
                className="w-full flex items-center justify-between p-5 text-left"
              >
                <span className="text-white font-medium font-poppins pr-4">
                  {faq.q}
                </span>
                <ChevronDown
                  className={`w-5 h-5 text-gold-400 flex-shrink-0 transition-transform duration-300 ${
                    openIdx === idx ? 'rotate-180' : ''
                  }`}
                />
              </button>
              <div
                className={`overflow-hidden transition-all duration-300 ${
                  openIdx === idx ? 'max-h-96 pb-5 px-5' : 'max-h-0'
                }`}
              >
                <p className="text-gray-400 leading-relaxed text-sm">
                  {faq.a}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <p className="text-gray-400 mb-4">Still have questions?</p>
          <a
            href="mailto:support@profunding.com"
            className="btn-outline inline-flex items-center gap-2 px-6 py-3"
          >
            Contact Support
          </a>
        </div>
      </div>
    </div>
  );
}
