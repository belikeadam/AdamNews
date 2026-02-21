import { z } from 'zod'

/** POST /api/stripe/checkout */
export const CheckoutSchema = z.object({
  planId: z.enum(['standard', 'premium']),
  billing: z.enum(['monthly', 'annual']),
})

/** POST /api/revalidate */
export const RevalidateSchema = z.object({
  // Direct call format
  slug: z.string().min(1).max(200).optional(),
  tag: z.string().min(1).max(100).optional(),
  // Strapi webhook format
  event: z.string().optional(),
  model: z.string().optional(),
  entry: z.object({
    slug: z.string().optional(),
  }).optional(),
})

/** POST /api/analytics */
export const AnalyticsSchema = z.object({
  type: z.enum(['pageview', 'scroll', 'read_complete', 'engagement']),
  slug: z.string().min(1).max(200),
  readSeconds: z.number().min(0).max(7200).optional(),
  maxScrollDepth: z.number().min(0).max(100).optional(),
  referrer: z.string().max(500).optional(),
})

/** POST /api/articles/[slug]/views — slug validated from URL params */
export const SlugParamSchema = z.object({
  slug: z.string()
    .min(1)
    .max(200)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
})

/**
 * Helper: parse request body with a Zod schema.
 * Returns parsed data on success, or null + error string on failure.
 */
export async function parseBody<T extends z.ZodType>(
  request: Request,
  schema: T
): Promise<{ data: z.infer<T>; error: null } | { data: null; error: string }> {
  try {
    const raw = await request.json()
    const result = schema.safeParse(raw)
    if (!result.success) {
      const issues = result.error.issues.map((i: z.ZodIssue) => `${i.path.join('.')}: ${i.message}`).join('; ')
      return { data: null, error: issues }
    }
    return { data: result.data, error: null }
  } catch {
    return { data: null, error: 'Invalid JSON body' }
  }
}
