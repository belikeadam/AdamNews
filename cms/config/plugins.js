module.exports = ({ env }) => ({
  graphql: {
    config: {
      endpoint: '/graphql',
      shadowCRUD: true,
      playgroundAlways: true,
      depthLimit: 7,
      amountLimit: 100,
      apolloServer: {
        tracing: false,
      },
    },
  },
  'users-permissions': {
    config: {
      register: {
        allowedFields: ['plan'],
      },
    },
  },
})
