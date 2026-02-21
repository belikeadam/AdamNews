export const PLANS = [
  {
    id: 'free' as const,
    name: 'Reader',
    price: { monthly: 0, annual: 0 },
    features: ['5 articles/month', 'Breaking news alerts', 'Newsletter'],
    cta: 'Get started free',
    highlight: false,
  },
  {
    id: 'standard' as const,
    name: 'Standard',
    price: { monthly: 9.99, annual: 7.99 },
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
    price: { monthly: 19.99, annual: 15.99 },
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
