import Axios from 'axios';
import CredentialsService from './CredentialsService';
import env from '../env';

const HttpClient = Axios.create({
  baseURL: `${env.SERVER_ENDPOINT}/api/`,
});

HttpClient.interceptors.request.use(
  function (config) {
    // Do something before request is sent
    //If the header does not contain the token and the url not public, redirect to login
    const accessToken = `Bearer ${CredentialsService.token}`;

    //if token is found add it to the header
    if (accessToken) {
      if (config.method !== 'OPTIONS') {
        config.headers.Authorization = accessToken;
      }
    }
    return config;
  },
  function (error) {
    return Promise.reject(error);
  },
);

HttpClient.interceptors.response.use(null, (error) => {
  if (error.response && [401, 403].includes(error.response.status)) {
    CredentialsService.removeAuthBody();
  }
  return Promise.reject(error);
});

export default HttpClient;
