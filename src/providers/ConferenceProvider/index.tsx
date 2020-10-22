import React, { useState, useCallback, useEffect, useRef } from 'react';
import { ConferenceContext } from '../context';
import useLocalMedia from '../../hooks/useLocalMedia';
import CredentialsService from '../../services/CredentialsService';
import p2pSocketService from '../../services/socket/p2pSocketService';
import SocketEventNames from '../../enums/SocketEventNames';

interface Props {}

const ConferenceProvider: React.FC<Props> = (props) => {
  const { children } = props;
  const [streams, setStreams] = useState<{
    [key: string]: readonly MediaStream[];
  }>({});
  const peerConnections = useRef<Record<string, RTCPeerConnection>>({});
  const [isAudioEnabled, setIsAudioEnabled] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(false);

  const {
    localStream,
    isMediaLoaded,
    isAudioAvailable,
    isVideoAvailable,
  } = useLocalMedia(isAudioEnabled, isVideoEnabled);

  useEffect(() => {
    if (!isMediaLoaded) return;
    p2pSocketService.connect();
    return () => {
      p2pSocketService.disconnect();
    };
  }, [isMediaLoaded]);

  const connectNewPeer = useCallback(
    (peerConnection: RTCPeerConnection, key: string) => {
      localStream
        ?.getTracks()
        .forEach((track) => peerConnection.addTrack(track, localStream));

      peerConnection.addEventListener('track', function ({
        streams: peerStreams,
      }) {
        console.log('Received track');
        setStreams({ ...streams, [key]: peerStreams });
      });

      peerConnection.addEventListener('statsended', function (e) {
        console.log(e);
      });
      peerConnection.addEventListener('icecandidate', (event) => {
        if (event.candidate) {
          console.log('Sending ice candidate');
          p2pSocketService.sendEvent(SocketEventNames.WEBRTC_SEND_CANDIDATE, {
            candidate: event.candidate,
            candidateSender: CredentialsService.userid,
            candidateReceiver: key,
          });
        }
      });
      peerConnections.current[key] = peerConnection;
    },
    [localStream, streams, setStreams],
  );

  const addPeerConnection = useCallback(
    async (key: string) => {
      const peerConnection = new RTCPeerConnection();
      connectNewPeer(peerConnection, key);

      const offer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(
        new RTCSessionDescription(offer),
      );

      console.log('Sending offer');
      p2pSocketService.sendEvent(SocketEventNames.WEBRTC_SEND_OFFER, {
        offerSender: CredentialsService.userid,
        offerReceiver: key,
        offer,
      });
    },
    [connectNewPeer],
  );

  const removePeerConnection = useCallback(async (key: string) => {
    const peerConnection = peerConnections.current[key];

    if (!peerConnection) {
      console.error('Trying to close peer connection but it cant be found');
      return;
    }
    peerConnection.close();
    delete peerConnections.current[key];
  }, []);

  useEffect(() => {
    if (!isMediaLoaded) return;

    const onOffer = async (data: {
      offer: RTCSessionDescriptionInit;
      offerReceiver: string;
      offerSender: string;
    }) => {
      const { offer, offerReceiver, offerSender } = data;
      console.log('Receiving offer');

      const peerConnection = new RTCPeerConnection();
      connectNewPeer(peerConnection, offerSender);

      await peerConnection.setRemoteDescription(
        new RTCSessionDescription(offer),
      );
      const answer = await peerConnection.createAnswer();

      await peerConnection.setLocalDescription(
        new RTCSessionDescription(answer),
      );

      console.log('Sending answer');

      p2pSocketService.sendEvent(SocketEventNames.WEBRTC_SEND_ANSWER, {
        answerSender: offerReceiver,
        answerReceiver: offerSender,
        answer,
      });
    };
    const onAnswer = async (data: {
      answer: RTCSessionDescriptionInit;
      answerSender: string;
      answerReceiver: string;
    }) => {
      const { answer, answerSender } = data;
      console.log('Receiving answer');

      const peerConnection = peerConnections.current[answerSender];

      if (!peerConnection) {
        console.error('Answer came but no connection is made on this side');
        return;
      }
      await peerConnection.setRemoteDescription(
        new RTCSessionDescription(answer),
      );
    };

    const onCandidate = (data: {
      candidate: RTCIceCandidateInit;
      candidateSender: string;
      candidateReceiver: string;
    }) => {
      const { candidate, candidateSender } = data;
      if (peerConnections.current[candidateSender]) {
        console.log('Receiving ice candidate');
        peerConnections.current[candidateSender].addIceCandidate(
          new RTCIceCandidate(candidate),
        );
      } else {
        console.error('Failed receiving ice candidate');
      }
    };

    p2pSocketService.addListener(
      SocketEventNames.WEBRTC_RECEIVE_OFFER,
      onOffer,
    );
    p2pSocketService.addListener(
      SocketEventNames.WEBRTC_RECEIVE_ANSWER,
      onAnswer,
    );
    p2pSocketService.addListener(
      SocketEventNames.WEBRTC_RECEIVE_CANDIDATE,
      onCandidate,
    );
    return () => {
      p2pSocketService.removeListener(
        SocketEventNames.WEBRTC_RECEIVE_OFFER,
        onOffer,
      );
      p2pSocketService.removeListener(
        SocketEventNames.WEBRTC_RECEIVE_ANSWER,
        onAnswer,
      );
      p2pSocketService.removeListener(
        SocketEventNames.WEBRTC_RECEIVE_CANDIDATE,
        onCandidate,
      );
    };
  }, [connectNewPeer, isMediaLoaded]);

  return (
    <ConferenceContext.Provider
      value={{
        localStream,
        streams,
        addPeerConnection,
        removePeerConnection,
        isAudioAvailable,
        isVideoAvailable,
        isAudioEnabled,
        isVideoEnabled,
        setIsAudioEnabled,
        setIsVideoEnabled,
      }}
    >
      <p>{!isAudioAvailable && 'Audio isnt enabled'}</p>
      <p>{!isVideoAvailable && 'Video isnt enabled'}</p>
      {isMediaLoaded && children}
    </ConferenceContext.Provider>
  );
};

ConferenceProvider.defaultProps = {};

export default ConferenceProvider;
