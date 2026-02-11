import { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';

const Login = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = isRegister
        ? { name: name.trim(), email: email.trim(), password, confirmPassword }
        : { email: email.trim(), password };

      const res = await axios.post(
        `http://localhost:5000/api/auth/${isRegister ? 'register' : 'login'}`,
        payload
      );
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      toast.success(isRegister ? 'Account created!' : 'Logged in!');
      navigate('/chat/general');  
    } catch (err) {
      toast.error(err.response?.data?.msg || 'Error');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-md w-96">
        <h2 className="text-2xl mb-6">{isRegister ? 'Register' : 'Login'}</h2>
        {isRegister && (
          <input
            type="text"
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-3 border mb-4 rounded"
            required
          />
        )}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-3 border mb-4 rounded"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-3 border mb-4 rounded"
          required
        />
        {isRegister && (
          <input
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full p-3 border mb-4 rounded"
            required
          />
        )}
        <button type="submit" className="w-full bg-blue-500 text-white p-3 rounded hover:bg-blue-600">{isRegister ? 'Register' : 'Login'}</button>
        <p className="mt-4 text-center">
          {isRegister ? 'Have account?' : "Don't have account?"} 
          <button type="button" onClick={() => setIsRegister(!isRegister)} className="ml-1 text-blue-500 underline">Switch</button>
        </p>
      </form>
    </div>
  );
};
export default Login;
