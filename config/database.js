module.exports = ({ env }) => {
  if (process.env.NODE_ENV == 'development') {
    const path = require('path');

    return {
      connection: {
        client: 'sqlite',
        connection: {
          filename: path.join(__dirname, '..', env('DATABASE_FILENAME', '.tmp/data.db')),
        },
        useNullAsDefault: true,
      },
    }
  } else {
    const connections = {
      postgres: {
        connection: {
          connectionString: env("DATABASE_URL"),
          ssl: env.bool("DATABASE_SSL", false) && {
            rejectUnauthorized: env.bool(
              "DATABASE_SSL_REJECT_UNAUTHORIZED",
              true
            ),
          },
          schema: env("DATABASE_SCHEMA", "public"),
        },

        pool: {
          min: env.int("DATABASE_POOL_MIN"),
          max: env.int("DATABASE_POOL_MAX"),
          acquireTimeoutMillis: 300000,
          createTimeoutMillis: 300000,
          destroyTimeoutMillis: 50000,
          idleTimeoutMillis: 300000,
          reapIntervalMillis: 10000,
          createRetryIntervalMillis: 2000,
          propagateCreateError: false,
        },
      },
    };
    const client = env("DATABASE_CLIENT");
    return {
      connection: {
        client,

        ...connections[client],

        acquireConnectionTimeout: env.int("DATABASE_CONNECTION_TIMEOUT", 60000),
      },
    }
  };
};
