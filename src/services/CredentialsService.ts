import { User } from './../models/user';
import StorageService from './StorageService';

export type AuthBody = {
  token: string;
  user: User;
};

export default class CredentialsService {
  public static STORAGE_KEY = 'auth';

  public static saveAuthBody(authBody: AuthBody) {
    StorageService.setItem(this.STORAGE_KEY, authBody);
  }

  public static removeAuthBody() {
    StorageService.removeItem(this.STORAGE_KEY);
  }

  public static get authBody() {
    return StorageService.getItem<AuthBody>(this.STORAGE_KEY);
  }

  public static get user() {
    return StorageService.getItem<AuthBody>(this.STORAGE_KEY)?.user;
  }

  public static get token(): string {
    return StorageService.getItem<AuthBody>(this.STORAGE_KEY)?.token;
  }

  public static get userid() {
    return CredentialsService.user?._id;
  }
}
