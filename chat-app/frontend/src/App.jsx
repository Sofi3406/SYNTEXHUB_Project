import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import Auth from './components/Auth';
import ChatRoom from './components/ChatRoom';
import { SocketProvider } from './context/SocketContext';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  return (
    <Router>
      <SocketProvider>
        <Routes>
          <Route path="/" element={<Auth />} />
          <Route path="/chat/:roomId" element={<ChatRoom />} />
        </Routes>
        <ToastContainer position="top-right" theme="colored" />
      </SocketProvider>
    </Router>
  );
}

export default App;
