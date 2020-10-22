import { Message } from '../../pages/Meet/components/Chat/Chat.component';
import httpClient from '../../services/HttpClient';

const sendMessage = (roomId: string, msg: Partial<Message>) => {
  return httpClient.post<{ message: Message }>(`chat/${roomId}/messages`, msg);
};

const loadMessages = (roomId: string) => {
  return httpClient.get<{ messages: Message[] }>(`chat/${roomId}/messages`);
};

export default {
  loadMessages,
  sendMessage,
};
