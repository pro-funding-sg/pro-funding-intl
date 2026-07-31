import { Target, AlertTriangle, Shield, Clock, TrendingUp, Ban, CheckCircle } from 'lucide-react';

const rules = [
  {
    icon: Target,
    title: 'Profit Target',
    value: '8%',
    description:
      'Achieve an 8% profit target on your funded account during the evaluation phase. This demonstrates your ability to generate consistent returns under real market conditions.',
    details: [
      'Calculated on closed trades only',
      'Based on starting balance',
      'Must be achieved without breaching drawdown limits',
      'No hidden targets or additional requirements',
    ],
  },
  {
    icon: AlertTriangle,
    title: 'Daily Drawdown',
    value: '5%',
    description:
      'Your account equity must not drop more than 5% from the previous day\'s starting balance. This rule resets daily at market close.',
    details: [
      'Based on equity (including floating P&L)',
      'Resets daily at 00:00 GMT',
      'Includes both open and closed positions',
      'Violation results in account termination',
    ],
  },
  {
    icon: Shield,
    title: 'Maximum Drawdown',
    value: '10%',
    description:
      'The total drawdown from your peak account balance must never exceed 10%. This is a trailing limit that follows your highest equity level.',
    details: [
      'Trailing drawdown — follows your highest equity',
      'Based on closed and open positions',
      'Once breached, account is terminated',
      'Encourages disciplined risk management',
    ],
  },
  {
    icon: Clock,
    title: 'No Time Limit',
    value: 'Unlimited',
    description:
      'There is no deadline to complete your evaluation. Trade at your own pace without pressure. The only requirements are the profit target and drawdown rules.',
    details: [
      'Trade as long as you need',
      'No minimum trading days required',
      'No maximum trading days',
      'Focus on consistency, not speed',
    ],
  },
];

const riskItems = [
  'Trading foreign exchange, indices, commodities, and CFDs carries a high level of risk and may not be suitable for all investors.',
  'Past performance is not indicative of future results. You should carefully consider your financial situation before trading.',
  'Pro Funding International provides simulated trading challenges as part of an evaluation process. Funded accounts are subject to ongoing compliance.',
  'All trading takes place on demo/simulated accounts during the evaluation phase. Real funded accounts are provided upon successful evaluation.',
];

export default function RulesPage() {
  return (
    <div className="min-h-screen bg-navy-900 pt-24 pb-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="section-title">Trading Rules</h1>
          <p className="section-subtitle max-w-2xl mx-auto">
            Understand our evaluation criteria and risk management guidelines before you start your challenge.
          </p>
        </div>

        {/* Rules Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
          {rules.map((rule, idx) => (
            <div
              key={idx}
              className="card p-6 hover:border-gold-400/30 transition-colors"
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gold-400/10 flex items-center justify-center">
                  <rule.icon className="w-6 h-6 text-gold-400" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold font-poppins text-white">
                      {rule.title}
                    </h3>
                    <span className="px-3 py-1 rounded-full text-sm font-bold bg-gold-400/20 text-gold-400">
                      {rule.value}
                    </span>
                  </div>
                  <p className="text-gray-400 text-sm leading-relaxed mb-4">
                    {rule.description}
                  </p>
                  <ul className="space-y-2">
                    {rule.details.map((detail, di) => (
                      <li key={di} className="flex items-start gap-2 text-sm text-gray-300">
                        <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                        <span>{detail}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Additional Rules */}
        <div className="card p-8 mb-16">
          <div className="flex items-center gap-3 mb-6">
            <Ban className="w-6 h-6 text-red-400" />
            <h2 className="text-xl font-bold font-poppins text-white">Prohibited Practices</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              'Martingale or grid trading strategies designed to exploit simulated conditions',
              'Hedging across multiple accounts to offset risk',
              'High-frequency trading using automated scripts or bots',
              'Account sharing or selling evaluation accounts',
              'Exploiting demo account pricing inefficiencies',
              'Trading during low-liquidity periods to manipulate equity',
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-navy-700/50">
                <AlertTriangle className="w-5 h-5 text-gold-400 mt-0.5 flex-shrink-0" />
                <span className="text-gray-300 text-sm">{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Risk Disclosure */}
        <div className="card p-8 border-red-400/20">
          <div className="flex items-center gap-3 mb-6">
            <AlertTriangle className="w-6 h-6 text-red-400" />
            <h2 className="text-xl font-bold font-poppins text-white">Risk Disclosure</h2>
          </div>
          <div className="space-y-4">
            {riskItems.map((item, i) => (
              <p key={i} className="text-gray-400 text-sm leading-relaxed">
                • {item}
              </p>
            ))}
          </div>
          <div className="mt-6 p-4 rounded-lg bg-navy-700/50 border border-navy-600">
            <p className="text-gray-300 text-sm">
              <strong className="text-gold-400">Important:</strong> By participating in our evaluation program,
              you acknowledge that you have read, understood, and agree to abide by all trading rules and
              risk disclosures outlined above. Violation of any rule may result in immediate account termination.
            </p>
          </div>
        </div>

        {/* Footer text */}
        <p className="text-center text-gray-500 text-xs mt-12">
          Pro Funding International © {new Date().getFullYear()} — All trading involves risk.
        </p>
      </div>
    </div>
  );
}
