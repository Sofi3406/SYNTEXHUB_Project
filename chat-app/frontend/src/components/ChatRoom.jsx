import { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import MessageInput from './MessageInput';
import { toast } from 'react-toastify';

const ChatRoom = () => {
  const { roomId } = useParams();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  // Initialize user and check auth
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (storedUser && token) {
      setUser(JSON.parse(storedUser));
    } else {
      toast.error('Please login first');
      setLoading(false);
    }
  }, []);

  // Fetch messages with proper error handling
  const fetchMessages = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };
      const res = await axios.get(`http://localhost:5000/api/messages/${roomId}`, config);
      setMessages(res.data || []);
    } catch (err) {
      console.log('Messages fetch error:', err.response?.status);
      if (err.response?.status === 401) {
        toast.error('Session expired. Please login again.');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/';
      }
    } finally {
      setLoading(false);
    }
  }, [roomId]);

  // Load messages when room changes
  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  // Auto-refresh messages every 3 seconds
  useEffect(() => {
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, [fetchMessages]);

  // Logout handler
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    toast.info('Logged out successfully');
    window.location.href = '/';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-lg text-gray-600">Loading chat...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center p-8 bg-white rounded-2xl shadow-xl">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Please Login</h2>
          <Link to="/" className="bg-blue-500 text-white px-6 py-3 rounded-xl hover:bg-blue-600 transition-all">
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Sidebar */}
      <div className="w-72 bg-white border-r shadow-lg flex flex-col">
        <div className="p-6 border-b bg-gradient-to-r from-blue-500 to-purple-600 text-white">
          <h2 className="text-xl font-bold">Chat Rooms</h2>
          <p className="text-sm mt-1 opacity-90">Hi, {user.name}!</p>
        </div>
        <div className="p-4 flex-1 overflow-y-auto space-y-2">
          <Link 
            to="/chat/general" 
            className={`block p-4 rounded-xl transition-all duration-200 font-semibold ${
              roomId === 'general' 
                ? 'bg-blue-500 text-white shadow-lg' 
                : 'hover:bg-gray-100 text-gray-800'
            }`}
          >
            🗣️ General
          </Link>
          <Link 
            to="/chat/tech" 
            className={`block p-4 rounded-xl transition-all duration-200 font-semibold ${
              roomId === 'tech' 
                ? 'bg-blue-500 text-white shadow-lg' 
                : 'hover:bg-gray-100 text-gray-800'
            }`}
          >
            💻 Tech
          </Link>
          <Link 
            to="/chat/random" 
            className={`block p-4 rounded-xl transition-all duration-200 font-semibold ${
              roomId === 'random' 
                ? 'bg-blue-500 text-white shadow-lg' 
                : 'hover:bg-gray-100 text-gray-800'
            }`}
          >
            🎲 Random
          </Link>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        <header className="bg-white border-b shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                 {roomId}
              </h1>
              <p className="text-gray-500 mt-1">Real-time messages • Auto-saves to database</p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 font-semibold shadow-md transition-all duration-200"
            >
              🚪 Logout
            </button>
          </div>
        </header>

        {/* Messages */}
        <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-gradient-to-b from-transparent to-gray-50">
          {messages.length === 0 ? (
            <div className="text-center py-20 text-gray-500">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-200 to-purple-200 rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-lg">
                💬
              </div>
              <h3 className="text-2xl font-bold mb-2 text-gray-700">Welcome to {roomId}!</h3>
              <p className="text-lg">Be the first to send a message</p>
            </div>
          ) : (
            messages.map((msg, i) => (
              <div 
                key={msg._id || i} 
                className={`flex animate-in slide-in-from-bottom-2 duration-200 ${
                  msg.sender === user.name ? 'justify-end' : 'justify-start'
                }`}
              >
                <div className={`max-w-md p-4 rounded-2xl shadow-lg ${
                  msg.sender === user.name
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white'
                    : 'bg-white border border-gray-200'
                }`}>
                  <p className="font-medium">{msg.text}</p>
                  <div className="flex items-center justify-between mt-2 text-xs opacity-80">
                    <span>{msg.sender}</span>
                    <span>{new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Message Input */}
        <MessageInput roomId={roomId} />
      </div>
    </div>
  );
};

export default ChatRoom;
