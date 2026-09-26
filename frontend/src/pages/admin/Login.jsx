import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/admin/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setLoading(true);

    try {
      const res = await login(username, password);
      if (res.success) {
        navigate(from, { replace: true });
      } else {
        setErrorMessage(res.message || 'Username atau Password salah!');
      }
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Username atau Password salah!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row">
      <div className="relative w-full md:w-1/2 h-72 md:h-screen overflow-hidden bg-primary">
        <img 
          src="/assets/img/logo-w.png" 
          alt="Background Pattern" 
          className="absolute inset-0 w-full h-full object-cover"
        />

        <div className="absolute inset-0 bg-primary opacity-90"></div>

        <div className="relative z-10 h-full flex flex-col items-center justify-center p-8 text-center">
          <img 
            src="/assets/img/Logo.png" 
            alt="Logo Putih SPMB" 
            className="w-36 md:w-48 mb-6 drop-shadow-white-glow"
          />
          
          <p className="text-green-100 mt-2 text-sm md:text-base font-light">
            Sistem Penerimaan Murid Baru
          </p>
          <p className="text-green-100 mt-2 text-sm md:text-base font-light">
            Tahun Ajaran 2026/2027
          </p>
        </div>
      </div>

      <div className="w-full md:w-1/2 h-auto md:h-screen bg-white flex flex-col justify-center px-8 py-12 md:px-24 lg:px-32">
        <div className="w-full max-w-md mx-auto">
          <div className="mb-10">
            <h2 className="text-3xl font-bold text-gray-800">Login</h2>
            <p className="text-gray-500 mt-2">Masuk untuk mengelola data pendaftaran.</p>
          </div>

          {errorMessage && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 text-center text-sm">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="username" className="block text-sm font-semibold text-gray-700 mb-2">Username</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <i className="fa-solid fa-user text-gray-400"></i>
                </div>
                <input 
                  type="text" 
                  id="username" 
                  name="username" 
                  required 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder-gray-400"
                  placeholder="Masukkan username"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <i className="fa-solid fa-lock text-gray-400"></i>
                </div>
                <input 
                  type="password" 
                  id="password" 
                  name="password" 
                  required 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder-gray-400"
                  placeholder="Masukkan password"
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-primary hover:bg-[#004d30] text-white font-bold py-3.5 rounded-lg transition-all duration-300 transform active:scale-[0.98] shadow-md mt-4 disabled:opacity-50"
            >
              {loading ? 'MEMPROSES...' : 'MASUK DASHBOARD'}
            </button>
          </form>

          <p className="mt-10 text-center text-xs text-gray-400">
            &copy; 2026 SPMB KG2. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
