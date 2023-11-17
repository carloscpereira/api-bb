import { Router } from 'express';

import bancoBrasilController from '../app/controllers/bancoBrasilController';
import boletoController from '../app/controllers/boletoController';
import { AuthenticationBB, checkAuthorization, getBankDetails } from '../app/middlewares';
import validateStore from '../app/validators/BancoBrasilStore';

const routes = new Router();

routes.get('/:banco/:id/render', getBankDetails, AuthenticationBB, boletoController.index);

routes.get('/:id/render', getBankDetails, AuthenticationBB, boletoController.index);

routes.get('/sentry', async () => {
  throw new Error('My first Sentry error!');
});

routes.use(checkAuthorization);

routes.get('/:banco/', getBankDetails, AuthenticationBB, bancoBrasilController.index);

routes.get('/:banco/:id', getBankDetails, AuthenticationBB, bancoBrasilController.show);

routes.post('/:banco/', getBankDetails, AuthenticationBB, validateStore, bancoBrasilController.store);

routes.delete('/:banco/:id', getBankDetails, AuthenticationBB, bancoBrasilController.destroy);

routes.get('/', getBankDetails, AuthenticationBB, bancoBrasilController.index);

routes.get('/:id', getBankDetails, AuthenticationBB, bancoBrasilController.show);

routes.post('/', getBankDetails, AuthenticationBB, validateStore, bancoBrasilController.store);

routes.delete('/:id', getBankDetails, AuthenticationBB, bancoBrasilController.destroy);

export default routes;
