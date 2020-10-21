import { AuthBody } from './../../services/CredentialsService';
import HttpClient from '../../services/HttpClient';

const loginWithToken = (token: string) => {
  return HttpClient.post<AuthBody>(`auth/login/token`, { token });
};

export default {
  loginWithToken,
};
