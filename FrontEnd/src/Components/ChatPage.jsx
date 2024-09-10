import "./ChatPage.css";
import socketIO from "socket.io-client";
import { user } from "./HomePage";
import { useEffect, useState } from "react";
import Messages from "./Messages";
const APIport = "http://localhost:7859/";
import ReactScrollToBottom from "react-scroll-to-bottom";

let socket;
const ChatPage = () => {
  const [id, setId] = useState("");
  const [messages, setmessages] = useState([]);

  const send = () => {
    const message = document.getElementById("input").value;
    socket.emit("message", { message, id });
    document.getElementById("input").value = "";
  };

  // This UseEffect is for Socket IO Connection
  useEffect(() => {
    socket = socketIO(APIport, { transports: ["websocket"] });

    socket.on("connect", () => {
      console.log("connected");
      setId(socket.id);
    });

    socket.emit("joined", { user });

    socket.on("welcome", (data) => {
      setmessages([...messages, data]);
      console.log(data.user, data.message);
    });

    socket.on("userJoined", (data) => {
      setmessages([...messages, data]);

      console.log(data.user, data.message);
    });

    socket.on("leave", (data) => {
      setmessages([...messages, data]);

      console.log(data.user, data.message);
    });

    return () => {
      socket.emit("disconect");
      socket.off();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // This UseEffect is for Loading Messages

  useEffect(() => {
    socket.on("sendMessage", (data) => {
      setmessages([...messages, data]);

      console.log(data.user, data.message, data.id);
    });
    return () => {
      socket.off();
    };
  }, [messages]);
  return (
    <div>
      <div className="chat_container">
        <div className="chat_header">
          <h3>Chats</h3>
        </div>
        {/* Automatic Scroll to Bottom by React   */}
        <ReactScrollToBottom className="chats">
          {messages.map((item, i) => (
            <Messages
              key={i}
              message={item.message}
              user={item.id === id ? "" : item.user}
              classs={item.id === id ? "right" : "left"}
            />
          ))}
        </ReactScrollToBottom>

        <div className="send_chats">
          <input type="text" id="input" />
          <button onClick={send} className="send">
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
