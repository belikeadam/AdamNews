'use strict'

module.exports = {
  /**
   * Auto-configure Public role permissions on bootstrap.
   * Grants find + findOne on articles, categories, and authors
   * so the frontend can read content without an API token.
   */
  async bootstrap({ strapi }) {
    const publicRole = await strapi
      .query('plugin::users-permissions.role')
      .findOne({ where: { type: 'public' } })

    if (!publicRole) {
      strapi.log.warn('Public role not found — skipping permission setup')
      return
    }

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
  },
}
