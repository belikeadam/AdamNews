module.exports = {
  async beforeCreate(event) {
    const { data } = event.params

    // Auto-compute read time from body
    if (data.body) {
      const text = typeof data.body === 'string'
        ? data.body.replace(/<[^>]*>/g, '')
        : JSON.stringify(data.body)
      const words = text.trim().split(/\s+/).length
      const minutes = Math.ceil(words / 200)
      data.readTime = `${minutes} min read`
    }
  },

  async beforeUpdate(event) {
    const { data } = event.params

    // Recompute read time on update
    if (data.body) {
      const text = typeof data.body === 'string'
        ? data.body.replace(/<[^>]*>/g, '')
        : JSON.stringify(data.body)
      const words = text.trim().split(/\s+/).length
      const minutes = Math.ceil(words / 200)
      data.readTime = `${minutes} min read`
    }
  },
}
