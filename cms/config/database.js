module.exports = ({ env }) => {
  const databaseUrl = env('DATABASE_URL', null);

  if (databaseUrl) {
    return {
      connection: {
        client: 'postgres',
        connection: {
          connectionString: databaseUrl,
          ssl: { rejectUnauthorized: false },
        },
        pool: {
          min: env.int('DATABASE_POOL_MIN', 2),
          max: env.int('DATABASE_POOL_MAX', 10),
        },
        debug: false,
      },
    };
  }

  return {
    connection: {
      client: 'postgres',
      connection: {
        host: env('DATABASE_HOST', '127.0.0.1'),
        port: env.int('DATABASE_PORT', 5432),
        database: env('DATABASE_NAME', 'AdamNews'),
        user: env('DATABASE_USERNAME', 'kollect'),
        password: env('DATABASE_PASSWORD', 'password'),
        schema: env('DATABASE_SCHEMA', 'public'),
        ssl: env.bool('DATABASE_SSL', false) ? { rejectUnauthorized: false } : false,
      },
      pool: {
        min: env.int('DATABASE_POOL_MIN', 2),
        max: env.int('DATABASE_POOL_MAX', 10),
      },
      debug: false,
    },
  };
};
