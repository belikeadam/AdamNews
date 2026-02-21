'use strict'

module.exports = {
  /**
   * Auto-configure Public role permissions and revalidation webhook on bootstrap.
   */
  async bootstrap({ strapi }) {
    // ── 1. Public role permissions ──
    const publicRole = await strapi
      .query('plugin::users-permissions.role')
      .findOne({ where: { type: 'public' } })

    if (!publicRole) {
      strapi.log.warn('Public role not found — skipping permission setup')
    } else {
      const actionsToEnable = [
        // Read permissions (frontend)
        'api::article.article.find',
        'api::article.article.findOne',
        'api::category.category.find',
        'api::category.category.findOne',
        'api::author.author.find',
        'api::author.author.findOne',
        // Full CRUD permissions (editorial workflow + seed script)
        'api::article.article.create',
        'api::article.article.update',
        'api::article.article.delete',
        'api::category.category.create',
        'api::category.category.update',
        'api::category.category.delete',
        'api::author.author.create',
        'api::author.author.update',
        'api::author.author.delete',
      ]

      for (const action of actionsToEnable) {
        const existing = await strapi
          .query('plugin::users-permissions.permission')
          .findOne({ where: { action, role: publicRole.id } })

        if (!existing) {
          await strapi
            .query('plugin::users-permissions.permission')
            .create({ data: { action, role: publicRole.id } })
          strapi.log.info(`Enabled public permission: ${action}`)
        }
      }
    }

    // ── 2. Auto-register revalidation webhook ──
    const webhookUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL
    const webhookSecret = process.env.STRAPI_WEBHOOK_SECRET

    if (webhookUrl && webhookSecret) {
      const targetUrl = `${webhookUrl}/api/revalidate`

      try {
        const existingWebhooks = await strapi.webhookStore.findWebhooks()
        const alreadyExists = existingWebhooks.some(
          (wh) => wh.url === targetUrl
        )

        if (!alreadyExists) {
          await strapi.webhookStore.createWebhook({
            url: targetUrl,
            headers: {
              'x-webhook-secret': webhookSecret,
            },
            events: [
              'entry.create',
              'entry.update',
              'entry.delete',
              'entry.publish',
              'entry.unpublish',
            ],
            isEnabled: true,
          })
          strapi.log.info(`Registered revalidation webhook: ${targetUrl}`)
        } else {
          strapi.log.info(`Revalidation webhook already registered: ${targetUrl}`)
        }
      } catch (err) {
        strapi.log.warn(`Failed to register webhook: ${err.message}`)
      }
    } else {
      strapi.log.info(
        'Skipping webhook setup — set NEXT_PUBLIC_APP_URL and STRAPI_WEBHOOK_SECRET to enable'
      )
    }
  },
}
