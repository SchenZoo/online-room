import React, { useState, useCallback, useEffect } from 'react';
import { ConferenceContext } from '../context';
import useLocalMedia from '../../hooks/useLocalMedia';
import { SocketService } from '../../services/SocketService';
import { SocketEventNames } from '../../enums/SocketEventNames';
import CredentialsService from '../../services/CredentialsService';

interface Props {}

const peerConnections: {
  [key: string]: RTCPeerConnection;
} = {};

const ConferenceProvider: React.FC<Props> = (props) => {
  const { children } = props;
  const [streams, setStreams] = useState<{
    [key: string]: readonly MediaStream[];
  }>({});

  const { localStream } = useLocalMedia(CredentialsService.userid==='5edcc6e7ff98613025b7f9eb');

  const addNewPeerConnection = useCallback(
    (peerConnection: RTCPeerConnection, key: string) => {
      localStream
        .getTracks()
        .forEach((track) => peerConnection.addTrack(track, localStream));

      peerConnection.addEventListener('track', function ({
        streams: peerStreams,
      }) {
        setStreams({ ...streams, [key]: peerStreams });
      });

      peerConnection.addEventListener('statsended', function (e) {
        console.log(e)
      });
      peerConnection.addEventListener('icecandidate', (event) => {
        if (event.candidate) {
          console.log('Sending ice candidate');
          SocketService.sendEvent(SocketEventNames.WEBRTC_SEND_CANDIDATE, {
            candidate: event.candidate,
            candidateSender: CredentialsService.userid,
            candidateReceiver: key,
          });
        }
      });
      peerConnections[key]= peerConnection;
    },
    [localStream, streams, setStreams],
  );

  const addPeerConnection = useCallback(
    async (key: string) => {
      const peerConnection = new RTCPeerConnection();
      addNewPeerConnection(peerConnection, key);

      const offer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(
        new RTCSessionDescription(offer),
      );

      console.log('Sending offer');
      SocketService.sendEvent(SocketEventNames.WEBRTC_SEND_OFFER, {
        offerSender: CredentialsService.userid,
        offerReceiver: key,
        offer,
      });
    },
    [addNewPeerConnection],
  );

  const removePeerConnection = useCallback(
    async (key: string) => {
      const peerConnection = peerConnections[key];

      if (!peerConnection) {
        console.error('Trying to close peer connection but it cant be found');
        return;
      }
      peerConnection.close();
      delete peerConnections[key];
    },
    [],
  );

  useEffect(() => {
    const onOffer = async (data: {
      offer: RTCSessionDescriptionInit;
      offerReceiver: string;
      offerSender: string;
    }) => {
      const { offer, offerReceiver, offerSender } = data;
      console.log('Receiving offer');

      const peerConnection = new RTCPeerConnection();
      addNewPeerConnection(peerConnection, offerSender);

      await peerConnection.setRemoteDescription(
        new RTCSessionDescription(offer),
      );
      const answer = await peerConnection.createAnswer();

      await peerConnection.setLocalDescription(
        new RTCSessionDescription(answer),
      );

      console.log('Sending answer');

      SocketService.sendEvent(SocketEventNames.WEBRTC_SEND_ANSWER, {
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

      const peerConnection = peerConnections[answerSender];

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
      if (peerConnections[candidateSender]) {
        console.log('Receiving ice candidate');
        peerConnections[candidateSender].addIceCandidate(
          new RTCIceCandidate(candidate),
        );
      } else {
        console.error('Failed receiving ice candidate');
      }
    };

    SocketService.addListener(SocketEventNames.WEBRTC_RECEIVE_OFFER, onOffer);
    SocketService.addListener(SocketEventNames.WEBRTC_RECEIVE_ANSWER, onAnswer);
    SocketService.addListener(
      SocketEventNames.WEBRTC_RECEIVE_CANDIDATE,
      onCandidate,
    );
    return () => {
      SocketService.removeListener(
        SocketEventNames.WEBRTC_RECEIVE_OFFER,
        onOffer,
      );
      SocketService.removeListener(
        SocketEventNames.WEBRTC_RECEIVE_ANSWER,
        onAnswer,
      );
      SocketService.removeListener(
        SocketEventNames.WEBRTC_RECEIVE_CANDIDATE,
        onCandidate,
      );
    };
  }, [addNewPeerConnection]);

  return (
    <ConferenceContext.Provider
      value={{
        streams,
        addPeerConnection,
        removePeerConnection,
        localStream
      }}
    >
      {localStream && children}
    </ConferenceContext.Provider>
  );
};

ConferenceProvider.defaultProps = {};

export default ConferenceProvider;
