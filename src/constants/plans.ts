export const PLANS = [
  {
    id: 'free' as const,
    name: 'Reader',
    price: { monthly: 0, annual: 0 },
    stripePriceId: { monthly: null, annual: null },
    features: ['5 articles/month', 'Breaking news alerts', 'Newsletter'],
    cta: 'Get started free',
    highlight: false,
  },
  {
    id: 'standard' as const,
    name: 'Standard',
    price: { monthly: 15, annual: 12 },
    stripePriceId: {
      monthly: process.env.STRIPE_STANDARD_MONTHLY_PRICE_ID || process.env.STRIPE_STANDARD_PRICE_ID || null,
      annual: process.env.STRIPE_STANDARD_ANNUAL_PRICE_ID || null,
    },
    features: [
      'Unlimited articles',
      'No ads',
      'Offline reading',
      'Priority support',
    ],
    cta: 'Start Standard',
    highlight: true,
  },
  {
    id: 'premium' as const,
    name: 'Premium',
    price: { monthly: 35, annual: 28 },
    stripePriceId: {
      monthly: process.env.STRIPE_PREMIUM_MONTHLY_PRICE_ID || process.env.STRIPE_PREMIUM_PRICE_ID || null,
      annual: process.env.STRIPE_PREMIUM_ANNUAL_PRICE_ID || null,
    },
    features: [
      'Everything in Standard',
      'Exclusive reports',
      'Weekly briefing',
      'API access',
    ],
    cta: 'Start Premium',
    highlight: false,
  },
] as const
