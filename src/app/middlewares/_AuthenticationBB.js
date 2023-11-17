import axios from 'axios';
import oAuthBB from '../services/OAuth';

const isDev = process.env.NODE_ENV !== 'production';

export default async (req, res, next) => {
  const {
    bank: {
      api: {
        developer_application_key,
        oAuth: { client_id, client_secret },
      },
    },
  } = req;

  try {
    console.time('Autenticação');
    const { access_token, token_type } = await oAuthBB({ client_id, client_secret });
    console.timeEnd('Autenticação');

    req.api = axios.create({
      baseURL: isDev ? process.env.BB_BASEURL_DEV : process.env.BB_BASEURL,
      headers: {
        Authorization: `${token_type} ${access_token}`,
      },
      params: {
        ...(isDev ? { 'gw-dev-app-key': developer_application_key } : {}),
      },
    });

    return next();
  } catch (error) {
    console.log(error);
    throw error;
  }
};
