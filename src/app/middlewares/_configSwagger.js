import { resolve } from 'path';
import Yaml from 'yamljs';

const swaggerDocuments = Yaml.load(
  resolve(__dirname, '..', '..', '..', 'swagger', 'swagger.yaml')
);

export default async (req, res, next) => {
  swaggerDocuments.host = req.get('host');
  req.swaggerDoc = swaggerDocuments;
  return next();
};
