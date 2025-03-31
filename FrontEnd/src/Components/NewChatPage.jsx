import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import socketIO from "socket.io-client";
import axios from "axios";
import "./NewChatPage.css";

const APIport = "http://localhost:7859";
let socket;

const NewChatPage = () => {
  const [user, setUser] = useState(null);
  const [contacts, setContacts] = useState([]);
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState("");
  const [selectedContact, setSelectedContact] = useState(null);
  const [showOnlineOnly, setShowOnlineOnly] = useState(false);
  const [file, setFile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [socketStatus, setSocketStatus] = useState("disconnected");
  const [debug, setDebug] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();
  const socketInitialized = useRef(false);
  const messagesContainerRef = useRef(null);
  const lastMessageTimeRef = useRef(null);

  useEffect(() => {
    // Get user from localStorage
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      navigate("/");
      return;
    }

    const parsedUser = JSON.parse(storedUser);
    setUser(parsedUser);
    setIsLoading(false);

    // Only initialize socket once
    if (!socketInitialized.current) {
      // Initialize socket connection
      socket = socketIO(APIport, { 
        transports: ["websocket"],
        reconnection: true,
        reconnectionAttempts: 10,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        timeout: 20000
      });

      socket.on("connect", () => {
        console.log("Connected to server");
        setSocketStatus("connected");
        socket.emit("userConnected", { userId: parsedUser._id, username: parsedUser.fullName });
      });

      socket.on("disconnect", () => {
        console.log("Disconnected from server");
        setSocketStatus("disconnected");
      });

      socket.on("reconnect", (attemptNumber) => {
        console.log(`Reconnected to server after ${attemptNumber} attempts`);
        setSocketStatus("connected");
        socket.emit("userConnected", { userId: parsedUser._id, username: parsedUser.fullName });
      });

      socket.on("reconnect_attempt", (attemptNumber) => {
        console.log(`Reconnection attempt ${attemptNumber}`);
        setSocketStatus(`reconnecting (${attemptNumber})`);
      });

      socket.on("reconnect_error", (error) => {
        console.error("Reconnection error:", error);
        setSocketStatus(`reconnect error: ${error.message}`);
      });

      socket.on("connect_error", (error) => {
        console.error("Socket connection error:", error);
        setSocketStatus(`error: ${error.message}`);
      });

      // Listen for new messages
      socket.on("newMessage", (message) => {
        console.log("Received message:", message);
        
        // Update last message in contacts regardless of selected contact
        setContacts((prevContacts) => {
          return prevContacts.map((contact) => {
            if ((contact._id === message.sender && message.recipient === parsedUser._id) || 
                (contact._id === message.recipient && message.sender === parsedUser._id)) {
              return {
                ...contact,
                lastMessage: message.text || "Attachment",
                lastMessageTime: message.timestamp
              };
            }
            return contact;
          });
        });
        
        // Check if this message belongs to the currently selected contact
        const isRelevantMessage = 
          (message.sender === selectedContact?._id && message.recipient === parsedUser._id) ||
          (message.sender === parsedUser._id && message.recipient === selectedContact?._id);

        if (isRelevantMessage) {
          console.log("Adding message to current conversation:", message);
          setMessages((prevMessages) => {
            // Check if message with same ID already exists
            const messageExists = prevMessages.some(
              (m) => m._id === message._id || 
                    (m.timestamp === message.timestamp && 
                     m.sender === message.sender && 
                     m.text === message.text)
            );
            
            if (messageExists) {
              console.log("Message already exists in conversation, skipping");
              return prevMessages;
            }
            
            console.log("Adding new message to conversation");
            
            // Replace any temporary messages with the same content
            const filteredMessages = prevMessages.filter(m => {
              // Keep all messages that don't match this one's content
              return !(m._id.startsWith('temp-') && 
                      m.sender === message.sender && 
                      m.text === message.text);
            });
            
            // Add the new message and sort by timestamp to ensure correct order
            return [...filteredMessages, message].sort((a, b) => 
              new Date(a.timestamp) - new Date(b.timestamp)
            );
          });
        } else {
          // If we receive a message for a different contact, update the unread count
          // and log for debugging
          console.log("Message received for non-selected contact:", 
            message.sender === parsedUser._id ? "to " + message.recipient : "from " + message.sender);
          
          // If the message is from the current user to a different contact,
          // we don't need to do anything special as it's already handled above
          
          // If the message is from another user to the current user,
          // we could add notification functionality here
        }
      });

      // Listen for active users updates
      socket.on("activeUsers", (users) => {
        console.log("Received active users:", users);
        
        // Filter out current user
        const filteredUsers = users.filter(u => u._id !== parsedUser._id);
        
        // Create a map of online users for quick lookup
        const onlineUsersMap = {};
        filteredUsers.forEach(user => {
          if (user.online) {
            onlineUsersMap[user._id] = true;
          }
        });
        
        // Update contacts with accurate online status
        setContacts(prevContacts => {
          return prevContacts.map(contact => {
            // Only mark as online if explicitly in the online users list
            return {
              ...contact,
              online: !!onlineUsersMap[contact._id]
            };
          });
        });
      });

      // Listen for user status changes
      socket.on("userStatusUpdate", ({ userId, status, lastSeen }) => {
        setContacts((prevContacts) => {
          return prevContacts.map((contact) => {
            if (contact._id === userId) {
              return { 
                ...contact, 
                online: status === "online",
                lastSeen: lastSeen || contact.lastSeen
              };
            }
            return contact;
          });
        });
      });

      socketInitialized.current = true;
    }

    // Fetch contacts
    const fetchContacts = async () => {
      try {
        const response = await axios.get(`${APIport}/contacts/${parsedUser._id}`);
        console.log("Fetched contacts:", response.data);
        setContacts(response.data);
      } catch (error) {
        console.error("Error fetching contacts:", error);
      }
    };

    fetchContacts();

    // Set up interval to refresh contacts and their online status
    const intervalId = setInterval(() => {
      fetchContacts();
    }, 10000); // Refresh every 10 seconds

    return () => {
      // Only disconnect when component unmounts completely
      if (socketInitialized.current) {
        socket.disconnect();
        socketInitialized.current = false;
      }
      clearInterval(intervalId);
    };
  }, [navigate]);

  useEffect(() => {
    // Add separate useEffect for fetching messages when selected contact changes
    if (selectedContact && user) {
      const fetchMessages = async () => {
        setRefreshing(true);
        try {
          const response = await axios.get(
            `${APIport}/messages/${user._id}/${selectedContact._id}`
          );
          setMessages(response.data);
          // Don't auto-scroll here when loading message history
        } catch (error) {
          console.error("Error fetching messages:", error);
        } finally {
          setRefreshing(false);
        }
      };
      
      fetchMessages();
      
      // Reduced polling interval for more frequent updates
      const messageRefreshInterval = setInterval(() => {
        // Keep track of scroll position before fetching
        const scrollPosition = messagesContainerRef.current?.scrollTop;
        const isScrolledToBottom = 
          messagesContainerRef.current && 
          (messagesContainerRef.current.scrollHeight - messagesContainerRef.current.scrollTop) <= 
          (messagesContainerRef.current.clientHeight + 50); // 50px tolerance
        
        fetchMessages().then(() => {
          // After fetching, restore scroll position if user was not at bottom
          if (scrollPosition !== undefined && !isScrolledToBottom) {
            setTimeout(() => {
              if (messagesContainerRef.current) {
                messagesContainerRef.current.scrollTop = scrollPosition;
              }
            }, 50);
          }
        });
      }, 300); // Refresh every 0.3 seconds for more real-time updates
      
      // Clean up interval when component unmounts or selected contact changes
      return () => {
        clearInterval(messageRefreshInterval);
      };
    }
  }, [selectedContact, user]);

  // Simplified scroll effect that ONLY triggers for new messages
  useEffect(() => {
    if (messages.length === 0) return;
    
    const lastMessage = messages[messages.length - 1];
    
    // Determine if this is a new message that should trigger auto-scroll
    const isNewMessage = 
      // Case 1: User just sent this message (it has a temp ID)
      (lastMessage.sender === user?._id && lastMessage._id?.startsWith('temp-')) || 
      // Case 2: This is a recently received message from the other user within last 2 seconds
      (lastMessage.sender !== user?._id && 
      new Date() - new Date(lastMessage.timestamp) < 2000);
    
    // ONLY auto-scroll for new messages
    if (isNewMessage) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  }, [messages, user]);

  const handleContactSelect = async (contact) => {
    setSelectedContact(contact);
    
    try {
      const response = await axios.get(
        `${APIport}/messages/${user._id}/${contact._id}`
      );
      
      // First set messages
      setMessages(response.data);
      
      // After loading messages for a new contact, scroll to bottom
      // This is a desired behavior when first opening a conversation
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 150);
      
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  const handleSendMessage = async (e) => {
    e?.preventDefault();
    
    if ((!messageInput.trim() && !file) || !selectedContact || !user) return;
    
    const token = JSON.parse(localStorage.getItem("user")).token;
    const formData = new FormData();
    formData.append("sender", user._id);
    formData.append("recipient", selectedContact._id);
    formData.append("text", messageInput);
    
    if (file) {
      formData.append("attachment", file);
    }
    
    // Create a temp message object
    const newMessage = {
      sender: user._id,
      recipient: selectedContact._id,
      text: messageInput,
      timestamp: new Date().toISOString(),
      _id: `temp-${Date.now()}`,
      attachment: file ? URL.createObjectURL(file) : null
    };
    
    // Reset input fields immediately for better UX
    setMessageInput("");
    setFile(null);
    
    try {
      // Add message to UI immediately with a temporary ID
      setMessages(prevMessages => {
        const updatedMessages = [...prevMessages, newMessage].sort((a, b) => 
          new Date(a.timestamp) - new Date(b.timestamp)
        );
        
        // No need to set any state here, the useEffect will handle scrolling
        // based on the temp ID of the new message
        
        return updatedMessages;
      });
      
      // Send the message to the server
      const response = await axios.post(
        `${APIport}/messages`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            "Authorization": `Bearer ${token}`
          }
        }
      );
      
      console.log("Message sent successfully:", response.data);
      
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const filteredContacts = showOnlineOnly 
    ? contacts.filter(contact => contact.online) 
    : contacts;

  if (isLoading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="chat-container">
      <div className="chat-header">
        <div className="logo">
          <span className="chat-icon">💬</span>
          <h1>Chatty</h1>
        </div>
        <div className="nav-links">
          <Link to="/profile">👤 Profile</Link>
          <Link to="/settings">⚙️ Settings</Link>
          <Link to="/" onClick={() => {
            localStorage.removeItem("user");
            if (socket) socket.disconnect();
            socketInitialized.current = false;
          }}>🚪 Logout</Link>
        </div>
      </div>

      {debug && (
        <div style={{ 
          padding: '10px', 
          background: '#2a2335', 
          color: 'white',
          borderBottom: '1px solid #3a3045'
        }}>
          <p>Socket Status: <span style={{ 
            color: socketStatus === 'connected' ? '#2ecc71' : '#e74c3c',
            fontWeight: 'bold'
          }}>
            {socketStatus}
          </span></p>
          <p>User: {user?.fullName} (ID: {user?._id?.substring(0, 8)}...)</p>
          <p>Selected Contact: {selectedContact?.fullName || 'None'} 
            {selectedContact && `(ID: ${selectedContact?._id?.substring(0, 8)}...)`}
            {selectedContact && ` - ${selectedContact?.online ? '✅ Online' : '❌ Offline'}`}
          </p>
          <p>Online Contacts: <span style={{ color: '#2ecc71', fontWeight: 'bold' }}>
            {contacts.filter(c => c.online).length}
          </span>/{contacts.length}</p>
          <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
            <button 
              onClick={() => {
                if (socket) {
                  socket.disconnect();
                  setTimeout(() => {
                    socket.connect();
                  }, 1000);
                }
              }}
              style={{
                padding: '5px 10px',
                background: '#d4a853',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Reconnect Socket
            </button>
            <button 
              onClick={() => {
                const fetchContacts = async () => {
                  try {
                    const response = await axios.get(`${APIport}/contacts/${user._id}`);
                    console.log("Manually fetched contacts:", response.data);
                    setContacts(response.data);
                  } catch (error) {
                    console.error("Error fetching contacts:", error);
                  }
                };
                fetchContacts();
              }}
              style={{
                padding: '5px 10px',
                background: '#3a3045',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Refresh Contacts
            </button>
          </div>
          <div style={{ fontSize: '12px', background: '#1a1525', padding: '5px', borderRadius: '4px' }}>
            <p style={{ margin: '0 0 5px 0', fontWeight: 'bold' }}>Online Users:</p>
            {contacts.filter(c => c.online).map(c => (
              <div key={c._id} style={{ 
                padding: '2px 5px', 
                margin: '2px 0',
                background: c._id === selectedContact?._id ? '#3a3045' : 'transparent',
                borderRadius: '2px'
              }}>
                {c.fullName} ({c._id.substring(0, 6)}...)
              </div>
            ))}
            {contacts.filter(c => c.online).length === 0 && <p>No users online</p>}
          </div>
        </div>
      )}

      <div className="chat-main">
        <div className="contacts-container">
          <div className="contacts-header">
            <h2>Contacts</h2>
            <div className="filter-container">
              <input
                type="checkbox"
                id="showOnlineOnly"
                checked={showOnlineOnly}
                onChange={(e) => setShowOnlineOnly(e.target.checked)}
              />
              <label htmlFor="showOnlineOnly">
                Show online only ({contacts.filter(c => c.online).length} online)
              </label>
            </div>
          </div>

          <div className="contacts-list">
            {filteredContacts.map((contact) => (
              <div 
                key={contact._id} 
                className={`contact-item ${selectedContact?._id === contact._id ? 'selected' : ''}`}
                onClick={() => handleContactSelect(contact)}
              >
                <div className="contact-avatar">
                  {contact.profileImage ? (
                    <img src={`${APIport}/${contact.profileImage}`} alt={contact.fullName} />
                  ) : (
                    <div className="avatar-placeholder">
                      {contact.fullName.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span className={`status-indicator ${contact.online ? 'online' : 'offline'}`}></span>
                </div>
                <div className="contact-info">
                  <div className="contact-name">
                    {contact.fullName}
                    <span className="contact-status" style={{ 
                      color: contact.online ? '#2ecc71' : '#6c6c6c',
                      fontWeight: contact.online ? 'bold' : 'normal'
                    }}>
                      {contact.online ? '● Online' : '○ Offline'}
                    </span>
                  </div>
                  {contact.lastMessage && (
                    <div className="last-message">
                      {contact.lastMessage.substring(0, 30)}
                      {contact.lastMessage.length > 30 ? '...' : ''}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="chat-area">
          {selectedContact ? (
            <>
              <div className="chat-header-info">
                <div className="contact-avatar small">
                  {selectedContact.profileImage ? (
                    <img src={`${APIport}/${selectedContact.profileImage}`} alt={selectedContact.fullName} />
                  ) : (
                    <div className="avatar-placeholder">
                      {selectedContact.fullName.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span className={`status-indicator ${selectedContact.online ? 'online' : 'offline'}`}></span>
                </div>
                <div className="selected-contact-name">{selectedContact.fullName}</div>
                <div>
                  <button className="close-chat" onClick={() => {
                    setSelectedContact(null);
                    setMessages([]);
                  }}>✕</button>
                </div>
              </div>

              <div 
                className="messages-container" 
                ref={messagesContainerRef}
              >
                {messages.map((message, index) => (
                  <div 
                    key={message._id || index} 
                    className={`message ${message.sender === user._id ? 'sent' : 'received'}`}
                  >
                    {message.attachment && (
                      <div className="message-attachment">
                        <img src={`${APIport}/${message.attachment}`} alt="Attachment" />
                      </div>
                    )}
                    {message.text && <div className="message-text">{message.text}</div>}
                    <div className="message-time">{formatTime(message.timestamp)}</div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              <div className="message-input-container">
                {file && (
                  <div className="file-preview">
                    <span>{file.name}</span>
                    <button onClick={() => setFile(null)}>✕</button>
                  </div>
                )}
                <div className="message-input-wrapper">
                  <textarea
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type a message..."
                    rows={1}
                  />
                  <div className="message-actions">
                    <label htmlFor="file-input" className="file-input-label">
                      🔗
                    </label>
                    <input
                      id="file-input"
                      type="file"
                      onChange={handleFileChange}
                      style={{ display: 'none' }}
                    />
                    <button 
                      className="send-button"
                      onClick={handleSendMessage}
                      disabled={!messageInput.trim() && !file}
                    >
                      📤
                    </button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="no-chat-selected">
              <div className="no-chat-icon">💬</div>
              <h3>Select a contact to start chatting</h3>
              <p>Choose from your contacts list on the left</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NewChatPage; 