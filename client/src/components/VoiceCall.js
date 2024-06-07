import React, { useEffect, useRef } from 'react';
import { ACTIONS } from '../Actions';

const VoiceCall = ({ socketRef, roomId }) => {
  const localStreamRef = useRef(null);
  const peerConnectionsRef = useRef({});

  useEffect(() => {
    const init = async () => {
      try {
        localStreamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });

        socketRef.current.on(ACTIONS.ALL_USERS, (users) => {
          console.log("All users received:", users);
          users.forEach(userID => {
            const peerConnection = createPeerConnection(userID);
            peerConnectionsRef.current[userID] = peerConnection;

            localStreamRef.current.getTracks().forEach(track => peerConnection.addTrack(track, localStreamRef.current));
            initiateOffer(peerConnection, userID);
          });
        });

        socketRef.current.on(ACTIONS.USER_JOINED, payload => {
          console.log("User joined:", payload);
          const peerConnection = createPeerConnection(payload.callerID);
          peerConnectionsRef.current[payload.callerID] = peerConnection;

          localStreamRef.current.getTracks().forEach(track => peerConnection.addTrack(track, localStreamRef.current));
          peerConnection.setRemoteDescription(new RTCSessionDescription(payload.signal)).then(() => {
            peerConnection.createAnswer().then(answer => {
              peerConnection.setLocalDescription(answer);
              socketRef.current.emit(ACTIONS.RETURN_SIGNAL, {
                signal: answer,
                callerID: payload.callerID
              });
            });
          });
        });

        socketRef.current.on(ACTIONS.RECEIVE_RETURNED_SIGNAL, payload => {
          console.log("Return signal received:", payload);
          const peerConnection = peerConnectionsRef.current[payload.id];
          const signal = new RTCSessionDescription(payload.signal);
          peerConnection.setRemoteDescription(signal);
        });

        socketRef.current.emit(ACTIONS.JOIN_CALL, { roomId });
      } catch (error) {
        console.error("Error initializing media devices:", error);
      }
    };

    const createPeerConnection = (userID) => {
      const peerConnection = new RTCPeerConnection();

      peerConnection.onicecandidate = event => {
        if (event.candidate) {
          socketRef.current.emit(ACTIONS.SEND_SIGNAL, {
            userToSignal: userID,
            callerID: socketRef.current.id,
            signal: event.candidate
          });
        }
      };

      peerConnection.ontrack = event => {
        const audio = document.createElement('audio');
        audio.srcObject = event.streams[0];
        audio.autoplay = true;
        document.body.appendChild(audio);
      };

      return peerConnection;
    };

    const initiateOffer = (peerConnection, userID) => {
      peerConnection.createOffer().then(offer => {
        peerConnection.setLocalDescription(offer);
        socketRef.current.emit(ACTIONS.SEND_SIGNAL, {
          userToSignal: userID,
          callerID: socketRef.current.id,
          signal: offer
        });
      });
    };

    init();

    return () => {
      socketRef.current && socketRef.current.disconnect();
      Object.values(peerConnectionsRef.current).forEach(peerConnection => peerConnection.close());
    };
  }, []);

  return null;
};

export default VoiceCall;
