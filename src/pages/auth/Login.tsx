
import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Login: React.FC = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();
  const location = useLocation();
  const registeredSuccess = (location.state as any)?.registered === true;
  const passwordResetSuccess = (location.state as any)?.passwordReset === true;

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      console.log('Attempting login...');
      await login(email, password);
      console.log('Login successful');
      
      // Đợi một chút để user state được set
      setTimeout(() => {
        // Navigate dựa trên role
        const userStr = localStorage.getItem('authToken');
        if (userStr) {
          try {
            const payload = JSON.parse(atob(userStr.split('.')[1]));
            const role = (payload.scope || '').toLowerCase();
            
            // Navigate based on role
            if (role === 'admin' || role === 'staff') {
              navigate('/admin');
            } else {
              navigate('/');
            }
          } catch {
            navigate('/');
          }
        } else {
          navigate('/');
        }
      }, 100);
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || 'Đăng nhập thất bại. Vui lòng kiểm tra email và mật khẩu.');
    } finally {
      setLoading(false);
    }
  };

  const quickFillAdmin = () => {
    setEmail('admin@vitinh.com');
    setPassword('admin123');
    setError('');
  };

  const quickFillStaff = () => {
    setEmail('staff@vitinh.com');
    setPassword('staff123');
    setError('');
  };

  const quickFillUser = () => {
    setEmail('user@vitinh.com');
    setPassword('user123');
    setError('');
  };

  return (
    <div className={`min-h-screen flex font-['Jost'] transition-colors duration-300 ${isDarkMode ? 'bg-zinc-950 text-white' : 'bg-white text-zinc-900'}`}>
      <div className="flex w-full h-screen overflow-hidden">
        {/* Left Side: Visual Hero */}
        <div className="hidden lg:block w-1/2 h-full relative bg-zinc-100 dark:bg-zinc-900 overflow-hidden">
          <div className="absolute inset-0 bg-black/30 z-10"></div>
          <img 
            alt="High End PC Component Art" 
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 hover:scale-105" 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBMOHdFA3XTXAcM80rjSMRd5he5w7XyvbPyJqQcgjCxWpNcTuCAhi632wFZ1AEk-Yu2V1u98siSDnWI0gqe9mJuirSb-MT_Ja8yxpxXcVB3FzWuFs1fwZbh0mcbj4-aAOhLHHuSxNcRKQ7TNoNaU3wowCci0R1EwSQLdTqpObhGfpMxSTyglK1eU9cN0LTio5DzqivUWNndpJMfL26m_4JvOO2rS2QiWofdNwmPnqudFd39UwQuOqaTsGaBNtkgQKxIOd45ygiD3BE"
          />
          <div className="absolute bottom-12 left-12 z-20 text-white max-w-lg">
            <h2 className="text-4xl font-light mb-4">
              Sức Mạnh <br />
              <span className="font-bold">Không Giới Hạn.</span>
            </h2>
            <p className="text-gray-200 text-sm leading-relaxed tracking-wide opacity-90">
              Khám phá hệ sinh thái linh kiện máy tính đỉnh cao dành cho những người kiến tạo tương lai.
            </p>
          </div>
        </div>

        {/* Right Side: Form Container */}
        <div className="w-full lg:w-1/2 h-full flex flex-col relative overflow-y-auto bg-white dark:bg-zinc-950">
          {/* Header Actions */}
          <div className="absolute top-0 left-0 w-full p-8 flex justify-between items-center z-20">
            <Link to="/" className="text-2xl font-bold tracking-widest uppercase text-black dark:text-white">
              VITINH<span className="text-zinc-400">.</span>
            </Link>
            <button 
              onClick={toggleDarkMode}
              className="text-gray-500 hover:text-black dark:hover:text-white transition-colors"
            >
              <span className="material-symbols-outlined text-[24px]">
                {isDarkMode ? 'light_mode' : 'dark_mode'}
              </span>
            </button>
          </div>

          {/* Form Content */}
          <div className="flex-1 flex flex-col justify-center items-center px-6 sm:px-12 md:px-24 py-20">
            <div className="w-full max-w-md animate-fade-in space-y-10">
              <div>
                <h1 className="text-3xl md:text-4xl font-light text-black dark:text-white mb-3">Đăng Nhập</h1>
                <p className="text-gray-500 dark:text-gray-400 text-sm">Chào mừng trở lại. Vui lòng nhập thông tin của bạn.</p>
              </div>

              {/* Demo Accounts Tip */}
              

              <form className="space-y-6" onSubmit={handleLogin}>
                {registeredSuccess && (
                  <p className="text-xs text-green-700 font-bold bg-green-50 dark:bg-green-900/20 p-3 rounded">
                    Đăng ký thành công! Vui lòng đăng nhập.
                  </p>
                )}
                {passwordResetSuccess && (
                  <p className="text-xs text-green-700 font-bold bg-green-50 dark:bg-green-900/20 p-3 rounded">
                    Đặt lại mật khẩu thành công! Vui lòng đăng nhập.
                  </p>
                )}
                {error && (
                  <p className="text-xs text-red-500 font-bold bg-red-50 dark:bg-red-900/20 p-3 rounded">{error}</p>
                )}
                
                <div className="space-y-2">
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400">
                    EMAIL
                  </label>
                  <input 
                    type="text" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="example@vitinh.com"
                    className="w-full bg-transparent border border-gray-200 dark:border-zinc-800 p-4 text-sm focus:ring-1 focus:ring-black dark:focus:ring-white focus:border-black dark:focus:border-white outline-none transition dark:text-white rounded-md"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400">
                      MẬT KHẨU
                    </label>
                    <Link to="/forgot-password" className="text-[10px] font-bold text-gray-400 hover:text-black dark:hover:text-white transition uppercase tracking-widest">
                      Quên mật khẩu?
                    </Link>
                  </div>
                  <input 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-transparent border border-gray-200 dark:border-zinc-800 p-4 text-sm focus:ring-1 focus:ring-black dark:focus:ring-white focus:border-black dark:focus:border-white outline-none transition dark:text-white rounded-md"
                  />
                </div>

                <button 
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#1a1a1a] dark:bg-white text-white dark:text-black py-4 text-[11px] font-bold uppercase tracking-widest hover:bg-black dark:hover:bg-zinc-200 transition-all shadow-lg rounded-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {loading ? (
                    <>
                      <span className="animate-spin mr-2">⏳</span>
                      ĐANG ĐĂNG NHẬP...
                    </>
                  ) : (
                    'ĐĂNG NHẬP'
                  )}
                </button>
              </form>

              <div className="relative flex items-center py-2">
                <div className="flex-grow border-t border-gray-100 dark:border-zinc-800"></div>
                <span className="flex-shrink mx-4 text-[10px] font-bold text-gray-300 uppercase tracking-widest">HOẶC</span>
                <div className="flex-grow border-t border-gray-100 dark:border-zinc-800"></div>
              </div>

              <button className="w-full border border-gray-200 dark:border-zinc-800 py-4 flex items-center justify-center space-x-3 hover:bg-gray-50 dark:hover:bg-zinc-900 transition rounded-md">
                <svg className="w-5 h-5" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
                  <path d="M17.64 9.20455C17.64 8.56636 17.5827 7.95273 17.4764 7.36364H9V10.845H13.8436C13.635 11.97 13.0009 12.9232 12.0477 13.5614V15.8195H14.9564C16.6582 14.2527 17.64 11.9455 17.64 9.20455Z" fill="#4285F4"></path>
                  <path d="M9 18C11.43 18 13.4673 17.1941 14.9564 15.8195L12.0477 13.5614C11.2418 14.1014 10.2109 14.4205 9 14.4205C6.65591 14.4205 4.67182 12.8373 3.96409 10.71H0.957275V13.0418C2.43818 15.9832 5.48182 18 9 18Z" fill="#34A853"></path>
                  <path d="M3.96409 10.71C3.78409 10.17 3.68182 9.59318 3.68182 9C3.68182 8.40682 3.78409 7.83 3.96409 7.29V4.95818H0.957275C0.347727 6.17318 0 7.54773 0 9C0 10.4523 0.347727 11.8268 0.957275 13.0418L3.96409 10.71Z" fill="#FBBC05"></path>
                  <path d="M9 3.57955C10.3214 3.57955 11.5077 4.03364 12.4405 4.92545L14.9973 2.36864C13.4632 0.936818 11.4259 0 9 0C5.48182 0 2.43818 2.01682 0.957275 4.95818L3.96409 7.29C4.67182 5.16273 6.65591 3.57955 9 3.57955Z" fill="#EA4335"></path>
                </svg>
                <span className="text-[11px] font-bold uppercase tracking-widest text-zinc-700 dark:text-zinc-200">ĐĂNG NHẬP BẰNG GOOGLE</span>
              </button>

              <p className="text-center text-xs text-gray-500 dark:text-gray-400 pt-4">
                Chưa có tài khoản? <Link to="/register" className="font-bold text-black dark:text-white hover:underline transition-all">Đăng ký ngay</Link>
              </p>

              <div className="pt-8 text-center">
                <Link to="/" className="inline-flex items-center text-[10px] font-bold text-gray-400 uppercase tracking-widest hover:text-black dark:hover:text-white transition group">
                  <span className="material-symbols-outlined text-sm mr-2 group-hover:-translate-x-1 transition-transform">arrow_back</span>
                  QUAY LẠI TRANG CHỦ
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
