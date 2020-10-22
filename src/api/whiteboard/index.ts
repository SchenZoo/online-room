import { WhiteboardState } from '../../pages/Meet/components/Whiteboard/Whiteboard.component';
import httpClient from '../../services/HttpClient';

function patchWhiteboard(roomId: string, patch: WhiteboardState) {
  return httpClient.patch(`whiteboard/${roomId}`, patch);
}

function getWhiteboard(roomId: string): Promise<WhiteboardState> {
  return httpClient
    .get<{ whiteboard: WhiteboardState }>(`whiteboard/${roomId}`)
    .then(({ data }) => data.whiteboard);
}

export default {
  patchWhiteboard,
  getWhiteboard,
};
