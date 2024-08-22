import "./ChatPage.css";
import socketIO from "socket.io-client";
import { user } from "./HomePage";
import { useEffect } from "react";
const APIport = "http://localhost:7859/";
const ChatPage = () => {
  useEffect(() => {
    const socket = socketIO(APIport, { transports: ["websocket"] });

    socket.on("connect", () => {
      alert("connected");
    });

    socket.emit("joined", { user });

    socket.on("welcome", (data) => {
      console.log(data);
    });

    socket.on("userJoined", (data) => {
      console.log(data);
    });

    socket.on("leave", (data) => {
      console.log(data);
    });

    return () => {
      socket.emit("disconnect");
      socket.off();
    };
  }, []);
  return (
    <div>
      <div className="chat_container">
        <div className="chat_header">
          <h3>Chats</h3>
        </div>

        <div className="chats"></div>

        <div className="send_chats">
          <input type="text" />
          <button className="send">Send</button>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
