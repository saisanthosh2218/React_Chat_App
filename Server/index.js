const express = require("express");

const http = require("http");
const cors = require("cors");
const app = express();
const socketIO = require("socket.io");
const port = 7859;
const server = http.createServer(app);
app.use(cors({ origin: "http://localhost:5173" }));

const io = socketIO(server);
let users = [{}];
io.on("connection", (socket) => {
  console.log("New Connection");

  socket.on("joined", ({ user }) => {
    users[socket.id] = user;
    console.log(`${user} has joined`);
    socket.broadcast.emit("userJoined", {
      user: "Admin",
      message: `${users[socket.id]} has joined`,
    });

    socket.emit("welcome", {
      user: "Admin",
      message: `welcome to the chat, ${users[socket.id]}`,
    });
  });

  socket.on("disconnect", () => {
    socket.broadcast.emit("leave", {
      user: "Aadmin",
      message: "User has left",
    });
    console.log("User Left");
  });
});

app.get("/", (req, res) => {
  res.send("Server Is Working");
});

server.listen(port, () => {
  console.log(`server is running on port ${port}`);
});
