import React, { useEffect, useRef, useState } from "react";
import { initSocket } from "../Socket";
import { ACTIONS } from "../Actions";
import Editor from './Editor';
import {
  useNavigate,
  useLocation,
  Navigate,
  useParams,
} from "react-router-dom";
import { toast } from "react-hot-toast";
import 'bootstrap/dist/css/bootstrap.min.css';
import '../style/EditorPage.css';

function EditorPage() {
  const [clients, setClients] = useState([]);
  const codeRef = useRef(null);

  const location = useLocation();
  const navigate = useNavigate();
  const { roomId } = useParams();

  const socketRef = useRef(null);
  useEffect(() => {
    const init = async () => {
      socketRef.current = await initSocket();
      socketRef.current.on("connect_error", (err) => handleErrors(err));
      socketRef.current.on("connect_failed", (err) => handleErrors(err));

      const handleErrors = (err) => {
        console.log("Error", err);
        toast.error("Socket connection failed, Try again later");
        navigate("/");
      };

      socketRef.current.emit(ACTIONS.JOIN, {
        roomId,
        username: location.state?.username,
      });

      socketRef.current.on(
        ACTIONS.JOINED,
        ({ clients, username, socketId }) => {
          if (username !== location.state?.username) {
            toast.success(`${username} joined the room.`);
          }
          setClients(clients);
          socketRef.current.emit(ACTIONS.SYNC_CODE, {
            code: codeRef.current,
            socketId,
          });
        }
      );

      socketRef.current.on(ACTIONS.DISCONNECTED, ({ socketId, username }) => {
        toast.success(`${username} left the room`);
        setClients((prev) => {
          return prev.filter((client) => client.socketId !== socketId);
        });
      });
    };
    init();

    return () => {
      socketRef.current && socketRef.current.disconnect();
      socketRef.current.off(ACTIONS.JOINED);
      socketRef.current.off(ACTIONS.DISCONNECTED);
    };
  }, []);

  if (!location.state) {
    return <Navigate to="/" />;
  }

  const copyRoomId = async () => {
    try {
      await navigator.clipboard.writeText(roomId);
      toast.success(`Room ID is copied`);
    } catch (error) {
      console.log(error);
      toast.error("Unable to copy the Room ID");
    }
  };

  const leaveRoom = async () => {
    navigate("/");
  };

  const executeCode = () => {
    try {
      eval(codeRef.current); 
    } catch (error) {
      console.error("Error executing code:", error);
      toast.error("Error executing code");
    }
  };

  return (
    <div className="container-fluid vh-100">
      <div className="row h-100">
        <div className="col-md-10 text-light d-flex flex-column h-100">
          <Editor
            socketRef={socketRef}
            roomId={roomId}
            onCodeChange={(code) => {
              codeRef.current = code;
            }}
          />
        </div>
        <div
          className="col-md-2 bg-dark text-light d-flex flex-column h-100"
          style={{ boxShadow: "2px 0px 4px rgba(0, 0, 0, 0.1)" }}
        >
          <div className="d-flex flex-column flex-grow-1 overflow-auto">
            <span className="mb-2">Members</span>
            {clients.map((client) => (
              <div key={client.socketId} className="card bg-secondary text-light mb-2">
                <div className="card-body p-2 d-flex align-items-center">
                  <div className="avatar-placeholder bg-light text-dark mr-3">
                    {client.username[0].toUpperCase()}
                  </div>
                  <div>{client.username}</div>
                </div>
              </div>
            ))}
          </div>
          <hr />
          <div className="mx-auto">
            <button className="btn btn-primary mt-2 mb-2 px-3 btn-block" onClick={executeCode}>
              Execute Code
            </button>
            <button className="btn btn-success mt-2 mb-2 px-3 btn-block" onClick={copyRoomId}>
              Copy Room ID
            </button>
            <button className="btn btn-danger mt-2 mb-2 px-3 btn-block" onClick={leaveRoom}>
              Leave Room
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EditorPage;
