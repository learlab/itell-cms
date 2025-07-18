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
          acquireTimeoutMillis: env.int("ACQUIRE_TIMEOUT_MILLIS"),
          createTimeoutMillis: env.int("CREATE_TIMEOUT_MILLIS"),
          destroyTimeoutMillis: env.int("DESTROY_TIMEOUT_MILLIS"),
          idleTimeoutMillis: env.int("IDLE_TIMEOUT_MILLIS"),
          reapIntervalMillis: env.int("REAP_INTERVAL_MILLIS"),
          createRetryIntervalMillis: env.int("CREATE_RETRY_INTERVAL_MILLIS"),
          propagateCreateError: env.bool("PROPAGATE_CREATE_ERROR"),
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