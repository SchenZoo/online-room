import React, {
  useState,
  useMemo,
  useCallback,
  useRef,
  useEffect,
  ReactNode,
  useContext,
} from 'react';
import ChatInput from './components/ChatInput/ChatInput.component';
import classNames from 'classnames';
import { v4 as uuid } from 'uuid';
import { Loader, Button } from 'semantic-ui-react';
import './Chat.styles.scss';
import { User } from '../../../../models/user';
import CredentialsService from '../../../../services/CredentialsService';
import Avatar from '../../../../components/UI/Avatar';
import useCallbackRef from '../../../../hooks/useCallbackRef';
import { ClassRoomContext } from '../../../../providers/context';
import api from '../../../../api';
import MessageService from '../../../../services/MessageService';
import utils from '../../../../utils';
import roomSocketService from '../../../../services/socket/roomSocketService';
import SocketEventNames from '../../../../enums/SocketEventNames';
import PaperplaneIcon from '../../../../icons/Paperplane.icon';

export type Message = {
  text: ReactNode;
  sender: User;
  messageRef?: string;
  parentModelId: string;
  parentModel: 'RoomEvent';
  instanceId: string;
};

const Message = (msg: Message) => {
  const { sender } = msg;
  const isMine = useMemo(
    () =>
      msg.sender._id === CredentialsService.participant.user._id ||
      msg.sender._id === CredentialsService.participant._id,
    [msg],
  );
  const classes = useMemo(() => {
    return classNames({
      mine: isMine,
      message: true,
    });
  }, [isMine]);

  return (
    <div className={classes}>
      {!isMine && <Avatar src={sender.avatarUrl} alt="avatar" rounded />}

      <p>
        <strong>{msg.sender.name}</strong> {msg.text}
      </p>

      {isMine && <Avatar src={sender.avatarUrl} alt="avatar" rounded />}
    </div>
  );
};

interface Props {
  className?: string;
}

const Chat: React.FC<Props> = (props) => {
  const { className } = props;
  const classes = classNames(['chat', className]);

  const formRef = useRef<HTMLFormElement>();
  const [msgContainer, msgContainerRef] = useCallbackRef<HTMLElement>();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const { roomId } = useContext(ClassRoomContext);

  const updateScroll = useCallback(() => {
    if (!msgContainer) return false;
    msgContainer.scrollTop = msgContainer.scrollHeight;
    return true;
  }, [msgContainer]);

  const tryUpdateScroll = useCallback(
    (distanceToBot) => {
      if (distanceToBot <= 50) {
        /** we want to scroll only if user is near the bottom */
        updateScroll();
      }
    },
    [updateScroll],
  );

  useEffect(() => {
    if (!updateScroll) return;
    const loadMessages = async () => {
      try {
        const {
          data: { messages },
        } = await api.chat.loadMessages(roomId);
        MessageService.parseMessages(messages);
        setMessages(messages);
        requestAnimationFrame(updateScroll);
      } catch (e) {
        console.warn(e);
      } finally {
        setLoading(false);
      }
    };

    loadMessages();
  }, [updateScroll, roomId]);

  useEffect(() => {
    updateScroll();
  }, [updateScroll]);

  const getDistance = useCallback(() => {
    return (
      msgContainer.scrollHeight -
      (msgContainer.scrollTop + msgContainer.clientHeight)
    );
  }, [msgContainer]);

  const pushMsg = useCallback(
    (msg: Message, distanceToBot = 1000) => {
      MessageService.parseMsg(msg);
      setMessages((msgs) => [...msgs, msg]);
      requestAnimationFrame(() => tryUpdateScroll(distanceToBot));
    },
    [tryUpdateScroll],
  );

  const sendMessage: React.EventHandler<React.FormEvent<
    HTMLFormElement
  >> = useCallback(
    async (ev) => {
      if (ev) ev.preventDefault();

      const formData = new FormData(formRef.current);
      const messageRef = uuid();
      const msg: Message = {
        ...utils.convertFormDataToJSONObject(formData),
        messageRef,
      };
      formRef.current.reset();
      api.chat.sendMessage(roomId, msg);
    },
    [roomId],
  );

  useEffect(() => {
    const addMessageHandler = (messageData: {
      message: Message;
      roomId: string;
    }) => {
      if (roomId === messageData.roomId) {
        const msgExists = messages.find(
          (msg) => msg.messageRef === messageData.message.messageRef,
        );
        if (!msgExists) {
          pushMsg(messageData.message, getDistance());
        }
      }
    };

    roomSocketService.addListener<{
      message: Message;
      roomId: string;
    }>(SocketEventNames.ROOM_MESSAGE_CREATED, addMessageHandler);
    return () => {
      roomSocketService.removeListener(
        SocketEventNames.ROOM_MESSAGE_CREATED,
        addMessageHandler,
      );
    };
  }, [messages, pushMsg, getDistance, roomId]);

  return (
    <div className={classes}>
      <header>
        <h2>Chat</h2>
      </header>
      <main ref={msgContainerRef}>
        <div className="chat__messages">
          {loading ? (
            <Loader />
          ) : (
            <>
              {messages.map((msg, ind) => (
                <Message key={ind} {...msg} />
              ))}
            </>
          )}
        </div>
        <div className="empty-state">You can ask questions here!</div>
      </main>
      <footer>
        <form ref={formRef} onSubmit={sendMessage}>
          <div>
            <ChatInput onEnter={sendMessage} placeholder="Write something..." />
            <div className="chat__actions">
              <Button type="submit">
                <PaperplaneIcon />
              </Button>
            </div>
          </div>
        </form>
      </footer>
    </div>
  );
};

export default Chat;
