import { useState } from "react";
import {
  LocalUser,
  RemoteUser,
  useIsConnected,
  useJoin,
  useLocalMicrophoneTrack,
  useLocalCameraTrack,
  usePublish,
  useRemoteUsers,
} from "agora-rtc-react";
import axios from "axios"; // For making HTTP requests

export const Basics = () => {
  // State variables
  const [calling, setCalling] = useState(false);
  const isConnected = useIsConnected();
  const [appId, setAppId] = useState("c923e92dd3e344699f919697f2f7bf5c");
  const [channel, setChannel] = useState("admin");
  const [token, setToken] = useState(""); // Token starts empty
  const [role, setRole] = useState("publisher"); // Role: publisher or subscriber
  const [uid, setUid] = useState(0); // Default UID

  // Fetch token from the backend
  const fetchToken = async () => {
    try {
      const response = await axios.get(
        "https://agora-backend-8oxp.onrender.com/generateToken",
        {
          params: {
            channelName: channel,
            uid,
            role,
          },
        }
      );
      setToken(response.data.token);
      console.log("Token fetched:", response.data.token);
    } catch (error) {
      console.error("Error fetching token:", error);
      alert("Failed to fetch token. Check backend server.");
    }
  };

  // Join channel after fetching token
  const handleJoin = async () => {
    await fetchToken(); // Fetch token from backend
    setCalling(true); // Start calling (trigger useJoin hook)
  };

  // Agora hooks
  useJoin({ appid: appId, channel: channel, token: token || null }, calling);

  // Local user tracks
  const [micOn, setMic] = useState(true);
  const [cameraOn, setCamera] = useState(true);
  const { localMicrophoneTrack } = useLocalMicrophoneTrack(micOn);
  const { localCameraTrack } = useLocalCameraTrack(cameraOn);
  usePublish([localMicrophoneTrack, localCameraTrack]);

  // Remote users
  const remoteUsers = useRemoteUsers();

  return (
    <>
      <div className="room">
        {isConnected ? (
          <div className="user-list">
            <div className="user">
              <LocalUser
                style={{ height: "400px", width: "400px" }}
                cameraOn={cameraOn}
                micOn={micOn}
                videoTrack={localCameraTrack}
                cover="https://www.agora.io/en/wp-content/uploads/2022/10/3d-spatial-audio-icon.svg"
              >
                <span className="user-name">You</span>
              </LocalUser>
            </div>
            {remoteUsers.map((user) => (
              <div className="user" key={user.uid}>
                <RemoteUser
                  style={{ height: "400px", width: "400px" }}
                  cover="https://www.agora.io/en/wp-content/uploads/2022/10/3d-spatial-audio-icon.svg"
                  user={user}
                >
                  <span className="user-name">{user.uid}</span>
                </RemoteUser>
              </div>
            ))}
          </div>
        ) : (
          <div className="join-room">
            <input
              onChange={(e) => setAppId(e.target.value)}
              placeholder="<Your app ID>"
              value={appId}
            />
            <input
              onChange={(e) => setChannel(e.target.value)}
              placeholder="<Your channel Name>"
              value={channel}
            />
            <input
              onChange={(e) => setUid(Number(e.target.value))}
              placeholder="<Your UID (optional)>"
              value={uid}
            />
            <select
              onChange={(e) => setRole(e.target.value)}
              value={role}
              style={{ margin: "10px 0" }}
            >
              <option value="publisher">Publisher</option>
              <option value="subscriber">Subscriber</option>
            </select>
            <button
              className={`join-channel ${!appId || !channel ? "disabled" : ""}`}
              disabled={!appId || !channel}
              onClick={handleJoin}
            >
              <span>Join Channel</span>
            </button>
          </div>
        )}
      </div>
      {isConnected && (
        <div className="control">
          <div className="left-control">
            <button
              className="btn btn-primary"
              onClick={() => setMic((a) => !a)}
            >
              Mic
              <i className={`i-microphone ${!micOn ? "off" : ""}`} />
            </button>
            <button
              className="btn btn-primary"
              onClick={() => setCamera((a) => !a)}
            >
              Camera
              <i className={`i-camera ${!cameraOn ? "off" : ""}`} />
            </button>
          </div>
          <button
            className={`btn btn-primary btn-phone ${
              calling ? "btn-phone-active" : ""
            }`}
            onClick={() => setCalling((a) => !a)}
          >
            {calling ? (
              <i className="i-phone-hangup" />
            ) : (
              <i className="i-mdi-phone" />
            )}
          </button>
        </div>
      )}
    </>
  );
};

export default Basics;
