import { Participant } from '../models/room';
import StorageService from './StorageService';

export type AuthBody = {
  token: string;
  participant: Participant;
  isHost: boolean;
  roomId: string;
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
    return StorageService.getItem<AuthBody>(this.STORAGE_KEY)?.participant.user;
  }

  public static get token(): string {
    return StorageService.getItem<AuthBody>(this.STORAGE_KEY)?.token;
  }

  public static get userid() {
    return CredentialsService.user?._id;
  }

  public static get isHost() {
    return CredentialsService.authBody?.isHost;
  }

  public static get participant() {
    return CredentialsService.authBody?.participant;
  }
}
