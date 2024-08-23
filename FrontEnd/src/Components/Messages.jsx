import "./Messages.css";

const Messages = (data) => {
  if (data.user) {
    return (
      <div
        className={`message-box ${data.classs}`}
      >{`${data.user} : ${data.message}`}</div>
    );
  } else {
    return (
      <div
        className={`message-box ${data.classs}`}
      >{`You: ${data.message}`}</div>
    );
  }
};

export default Messages;
