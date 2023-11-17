import 'dotenv/config';

import express from 'express';
import Youch from 'youch';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express'; // Swagger
import * as Sentry from '@sentry/node'; // Sentry
import { resolve } from 'path';

import 'express-async-errors';

/**
 * Import project configuration files
 */
import sentryConfig from './config/sentry';
import corsConfig from './config/cors';
/**
 * Import Middlwares
 */
import { configSwagger } from './app/middlewares';

/**
 * Import all Routes
 */
import routes from './routes';

class App {
  constructor() {
    this.server = express();

    Sentry.init(sentryConfig);

    this.middleware();
    this.routes();
    this.exceptionHandler();
  }

  routes() {
    this.server.use(routes);
    this.server.use(Sentry.Handlers.errorHandler());
  }

  middleware() {
    this.server.use(Sentry.Handlers.requestHandler());
    this.server.use(cors(corsConfig));
    this.server.use(express.json());
    this.server.use('/documentation', configSwagger, swaggerUi.serve, swaggerUi.setup());
    this.server.set('views', resolve(__dirname, 'app', 'views'));
    this.server.set('view engine', 'pug');
  }

  exceptionHandler() {
    this.server.use(async (err, req, res, next) => {
      if (err.response && err.response.status !== 500) {
        return res.status(err.response.status).json({ errors: err.response.status, data: err.response.data.errors });
      }

      const errors = await new Youch(err, req).toJSON();

      if (process.env.NODE_ENV !== 'production') {
        return res.status(500).json(errors);
      }

      return res.status(500).json({ error: 500, data: { message: 'Internal Server Error' } });
    });
  }
}

export default new App().server;
