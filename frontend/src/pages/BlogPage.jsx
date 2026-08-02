import { useParams, Link } from 'react-router-dom'
import WhatsAppButton from '../components/WhatsAppButton'

const posts = {
  'funded-trader-india': {
    title: 'How to Become a Funded Trader in India — Complete Guide 2026',
    date: 'August 1, 2026',
    content: `Agar aap ek consistently profitable trader hain lekin apna capital badhane ke liye paisa nahi hai — toh funded trading aapke liye perfect solution hai. In 2026, becoming a funded trader in India has never been easier or more affordable.

A funded trader uses a prop firm's capital instead of their own. The firm provides the trading account — sometimes up to $200,000 — and the trader keeps 70%–90% of profits.

At Pro Funding International, the challenge rules are simple:
• 8% Profit Target
• 5% Daily Drawdown  
• 10% Max Drawdown
• No Time Limit

Just $10 (~₹800) challenge fee. Complete at your own speed. No rush — trade when you're ready. Once you pass, you get a funded account with real capital. 80% of profits go to you via UPI/bank transfer.

Most Indian traders start with ₹10,000–₹50,000. Even if you're consistently profitable, earning ₹500–₹2,000 monthly doesn't replace a salary. But trade a funded $10,000 account at 5% monthly — that's $400 (₹33,000+) in your pocket every month.`,
    share: 'How to become a funded trader in India — complete 2026 guide. ₹800 se $10,000 tak!'
  },
  'best-prop-firms-india': {
    title: 'Best Prop Trading Firms in India — 2026 Comparison',
    date: 'August 2, 2026',
    content: `Choosing the right prop firm in India can be confusing. Here's what matters most for Indian traders:

1. Challenge Fee — Should be affordable. PFI: $10 (~₹800)
2. Profit Split — You want 70%+. PFI: 80%
3. Payout Method — Must support Indian banks/UPI. PFI: UPI + Bank Transfer
4. Platform — MT5 is the industry standard. PFI: MT5
5. Time Limit — No time pressure = better trading. PFI: No Limit
6. Rules — Clear and achievable. PFI: 8% target, 5% daily DD

Most international prop firms charge $50–$500 for challenges. PFI starts at $10. For Indian traders earning in rupees, this makes a huge difference. Plus UPI payouts mean no international wire transfer hassles.`,
    share: 'Best prop trading firms in India compared — 2026 ranking. Only ₹800 to start!'
  },
  'mt5-demo-vs-funded': {
    title: 'MT5 Demo vs Funded Account — What is the Difference?',
    date: 'August 3, 2026',
    content: `Many traders confuse MT5 demo accounts with funded accounts. Here is the real difference:

MT5 Demo: Free, unlimited virtual money, no rules, no payouts. Good for practice only.

Funded Account: Real capital provided by the prop firm. You must follow trading rules (profit target, drawdown limits). When you profit, you withdraw REAL money — 80% is yours.

The process at Pro Funding International:
1. Pay ₹800 challenge fee (UPI)
2. Trade MT5 challenge account (demo conditions, real market data)
3. Hit 8% profit without breaking rules
4. Get funded account with REAL capital
5. Withdraw 80% of profits via UPI/bank

Demo accounts help you practice. Funded accounts pay you real money. The ₹800 fee is the bridge between the two.`,
    share: 'MT5 Demo vs Funded Account — what is the real difference and how to get funded with just ₹800.'
  }
}

export default function BlogPage() {
  const { slug } = useParams()
  const post = posts[slug]

  if (!post) {
    return (
      <div className="min-h-screen bg-navy-900 pt-24 px-4 text-center">
        <h1 className="text-3xl font-bold text-white">Post Not Found</h1>
        <Link to="/" className="text-gold-400 hover:underline mt-4 inline-block">Back to Home</Link>
      </div>
    )
  }

  const shareUrl = encodeURIComponent(`https://pro-funding-intl.surge.sh/blog/${slug}`)
  const shareText = encodeURIComponent(post.share)

  return (
    <div className="min-h-screen bg-navy-900 pt-24 pb-16 px-4">
      <WhatsAppButton />
      <article className="max-w-3xl mx-auto">
        <Link to="/" className="text-gold-400 hover:underline text-sm mb-4 inline-block">&larr; Back to Home</Link>
        <h1 className="text-3xl md:text-4xl font-bold font-poppins text-white mb-3 mt-2">{post.title}</h1>
        <p className="text-gray-500 text-sm mb-8">{post.date} • By Pro Funding International</p>

        {/* Social Share */}
        <div className="flex flex-wrap gap-2 mb-8">
          <a href={`https://wa.me/?text=${shareText}%20${shareUrl}`} target="_blank" rel="noopener"
            className="flex items-center gap-1 px-3 py-1.5 bg-green-600/20 text-green-400 rounded-full text-xs font-medium hover:bg-green-600/30 transition-colors">
            WhatsApp Share
          </a>
          <a href={`https://t.me/share/url?url=${shareUrl}&text=${shareText}`} target="_blank" rel="noopener"
            className="flex items-center gap-1 px-3 py-1.5 bg-blue-500/20 text-blue-400 rounded-full text-xs font-medium hover:bg-blue-500/30 transition-colors">
            Telegram Share
          </a>
          <a href={`https://twitter.com/intent/tweet?text=${shareText}&url=${shareUrl}`} target="_blank" rel="noopener"
            className="flex items-center gap-1 px-3 py-1.5 bg-sky-500/20 text-sky-400 rounded-full text-xs font-medium hover:bg-sky-500/30 transition-colors">
            X Share
          </a>
        </div>

        {/* Content */}
        <div className="prose prose-invert max-w-none text-gray-300 leading-relaxed space-y-4 text-base">
          {post.content.split('\n\n').map((p, i) => (
            <p key={i} className={p.startsWith('•') ? 'pl-4 border-l-2 border-gold-400/30' : ''}>
              {p}
            </p>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-12 card p-8 text-center">
          <h2 className="text-2xl font-bold text-white font-poppins mb-2">Ready to Start Trading?</h2>
          <p className="text-gray-400 mb-6">Join 500+ Indian traders. Get funded in 3 simple steps.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/signup" className="btn-primary text-center">Start Challenge — $10 (₹800)</Link>
            <Link to="/" className="btn-outline text-center">View Plans</Link>
          </div>
        </div>
      </article>
    </div>
  )
}
