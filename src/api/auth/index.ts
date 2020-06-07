import { AuthBody } from './../../services/CredentialsService';
import HttpClient from '../../services/HttpClient';
import { AxiosResponse } from 'axios';

const login = (authBody: any) => {
  return (
    HttpClient.post < any, AxiosResponse < AuthBody >> (`auth/login`, authBody)
  );
};

export default {
  login,
};
