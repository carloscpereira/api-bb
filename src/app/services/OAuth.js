import axios from 'axios';
import qs from 'qs';

const isDev = process.env.NODE_ENV !== 'production';

const sleep = (ms) => new Promise((res) => setTimeout(res, ms));

const retryAuth = async (url, options, maximumRetry = 0, attemp = 0, delay = 0) => {
  try {
    await sleep(delay);

    const { data } = await axios.request({ url, ...options });

    return data;
  } catch (error) {
    if (attemp >= maximumRetry) throw error;

    return retryAuth(url, options, attemp + 1, delay || 0);
  }
};

export default async ({ client_id, client_secret }) => {
  const reqData = {
    grant_type: 'client_credentials',
    scope: 'cobrancas.boletos-requisicao cobrancas.boletos-info',
  };

  const baseUrl = isDev ? process.env.BB_OAUTH_BASEURL_DEV : process.env.BB_OAUTH_BASEURL;

  const options = {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    method: 'POST',
    timeout: 3000,
    data: qs.stringify(reqData),
    auth: {
      username: client_id,
      password: client_secret,
    },
  };

  const data = await retryAuth(`${baseUrl}/token`, options, 5);

  return data;
};
