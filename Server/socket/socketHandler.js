const User = require("../models/User");
const Message = require("../models/Message");

const socketHandler = (io) => {
  // Socket.IO Connection
  io.on("connection", async (socket) => {
    console.log("A user connected:", socket.id);

    // User Connected
    socket.on("userConnected", async ({ userId, username }) => {
      try {
        console.log(`User ${username} (${userId}) connected with socket ${socket.id}`);
        
        // Update user's socket ID and clear lastSeen
        await User.findByIdAndUpdate(userId, {
          socketId: socket.id,
          lastSeen: null
        });
        
        // Get all users with their online status
        const allUsers = await User.find()
          .select("_id fullName email profileImage socketId");
        
        // Log active users for debugging
        const activeUsers = allUsers.filter(u => !!u.socketId);
        console.log(`Active users (${activeUsers.length}):`, 
          activeUsers.map(u => ({ id: u._id, name: u.fullName, socketId: u.socketId }))
        );
        
        // Notify all clients about all users with their online status
        io.emit("activeUsers", allUsers.map(user => ({
          _id: user._id,
          fullName: user.fullName,
          email: user.email,
          profileImage: user.profileImage,
          online: !!user.socketId // Convert to boolean
        })));
        
        // Also emit a specific status update for this user
        io.emit("userStatusUpdate", { 
          userId: userId, 
          status: "online",
          lastSeen: null
        });
      } catch (error) {
        console.error("User connected error:", error);
      }
    });
    
    // Send Message
    socket.on("sendMessage", async (messageData) => {
      try {
        console.log("Received message from client:", messageData);
        
        // Save message to database
        const newMessage = new Message(messageData);
        const savedMessage = await newMessage.save();
        
        // Find recipient and sender information
        const recipient = await User.findById(messageData.recipient);
        const sender = await User.findById(messageData.sender);
        
        console.log(`Sending message from ${sender?.fullName} to ${recipient?.fullName}`);
        
        // Include the message ID in the response
        const messageWithId = {
          ...messageData,
          _id: savedMessage._id
        };
        
        // Broadcast the message to all connected clients for real-time updates
        io.emit("newMessage", messageWithId);
        
        console.log(`Broadcast message to all clients with ID: ${savedMessage._id}`);
      } catch (error) {
        console.error("Send message error:", error);
      }
    });

    // Disconnect
    socket.on("disconnect", async () => {
      try {
        // Find user by socket ID
        const user = await User.findOne({ socketId: socket.id });
        
        if (user) {
          console.log(`User ${user.fullName} (${user._id}) disconnected`);
          
          // Update user's lastSeen and clear socketId
          user.lastSeen = new Date();
          user.socketId = null;
          await user.save();
          
          // Get all users with their updated online status
          const allUsers = await User.find()
            .select("_id fullName email profileImage socketId");
          
          // Log remaining active users for debugging
          const activeUsers = allUsers.filter(u => !!u.socketId);
          console.log(`Remaining active users (${activeUsers.length}):`, 
            activeUsers.map(u => ({ name: u.fullName, socketId: u.socketId }))
          );
          
          // Notify all clients about all users with their online status
          io.emit("activeUsers", allUsers.map(user => ({
            _id: user._id,
            fullName: user.fullName,
            email: user.email,
            profileImage: user.profileImage,
            online: !!user.socketId // Convert to boolean
          })));
          
          // Also send the offline user status
          io.emit("userStatusUpdate", { 
            userId: user._id, 
            status: "offline",
            lastSeen: user.lastSeen
          });
        } else {
          console.log("Disconnected socket not associated with any user");
        }
      } catch (error) {
        console.error("Disconnect error:", error);
      }
    });
  });

  // Function to clean up stale socket connections
  const cleanupStaleConnections = async () => {
    try {
      console.log("Running stale connection cleanup...");
      
      // Get all users with socketId
      const usersWithSockets = await User.find({ socketId: { $ne: null } });
      console.log(`Checking ${usersWithSockets.length} users with active socket connections`);
      
      let cleanedCount = 0;
      
      // Check each socket to see if it's still connected
      for (const user of usersWithSockets) {
        const socket = io.sockets.sockets.get(user.socketId);
        
        if (!socket || !socket.connected) {
          console.log(`Found stale connection for user ${user.fullName} (${user._id}), cleaning up...`);
          
          // Update user's lastSeen and clear socketId
          user.lastSeen = new Date();
          user.socketId = null;
          await user.save();
          cleanedCount++;
          
          // Emit specific status update for this user
          io.emit("userStatusUpdate", { 
            userId: user._id, 
            status: "offline",
            lastSeen: user.lastSeen
          });
        }
      }
      
      if (cleanedCount > 0) {
        console.log(`Cleaned up ${cleanedCount} stale connections`);
        
        // Get updated user list
        const allUsers = await User.find()
          .select("_id fullName email profileImage socketId");
        
        // Log active users for debugging
        const activeUsers = allUsers.filter(u => !!u.socketId);
        console.log(`Active users after cleanup (${activeUsers.length}):`, 
          activeUsers.map(u => ({ id: u._id, name: u.fullName }))
        );
        
        // Notify all clients about all users with their online status
        io.emit("activeUsers", allUsers.map(user => ({
          _id: user._id,
          fullName: user.fullName,
          email: user.email,
          profileImage: user.profileImage,
          online: !!user.socketId // Convert to boolean
        })));
      } else {
        console.log("No stale connections found");
      }
    } catch (error) {
      console.error("Error cleaning up stale connections:", error);
    }
  };

  // Run cleanup every 30 seconds
  setInterval(cleanupStaleConnections, 30000);
};

module.exports = socketHandler; 