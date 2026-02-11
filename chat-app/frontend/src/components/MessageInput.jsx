import { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const MessageInput = ({ roomId }) => {
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!text.trim() || !token) {
      toast.error('Please login first');
      return;
    }

    setSending(true);
    const messageData = {
      roomId,
      text: text.trim(),
      sender: user.name
    };

    try {
      // FIXED: Proper Authorization header
      const config = {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      };
      
      await axios.post('http://localhost:5000/api/messages', messageData, config);
      setText('');
      toast.success('Message sent!');
    } catch (err) {
      console.error('Send error:', err.response?.data || err.message);
      toast.error(err.response?.data?.msg || 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  return (
    <form onSubmit={sendMessage} className="p-6 bg-white border-t shadow-lg">
      <div className="flex gap-3">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type your message..."
          className="flex-1 p-4 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={sending || !token}
        />
        <button
          type="submit"
          disabled={!text.trim() || sending || !token}
          className="px-8 py-4 bg-blue-500 text-white rounded-2xl hover:bg-blue-600 disabled:opacity-50 font-semibold whitespace-nowrap"
        >
          {sending ? '...' : 'Send'}
        </button>
      </div>
    </form>
  );
};

export default MessageInput;
