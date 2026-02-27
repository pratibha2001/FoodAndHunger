import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { X, Loader2, Mail, Lock, User, Eye } from 'lucide-react';
import toast from 'react-hot-toast';

const AuthModal = ({ isOpen, onClose, onLoginSuccess }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
    });

    if (!isOpen) return null;

    const handleInputChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (isLogin) {
                // Login Logic
                const response = await axios.post('http://localhost:8080/api/auth/user/login', {
                    username: formData.username,
                    password: formData.password
                });

                if (response.data) {
                    const userData = response.data;
                    // Save to localStorage
                    localStorage.setItem('userId', userData.id);
                    localStorage.setItem('logged_in', 'true');
                    if (userData.username) localStorage.setItem('username', userData.username);
                    if (userData.email) localStorage.setItem('email', userData.email);

                    toast.success("Login successful!");
                    
                    onClose();
                    
                    if (onLoginSuccess) {
                        onLoginSuccess(userData);
                    }
                    
                    // Redirect to home page and reload to update navbar
                    window.location.href = '/';
                }
            } else {
                // Signup Logic
                if (formData.password !== formData.confirmPassword) {
                    toast.error("Passwords do not match");
                    setLoading(false);
                    return;
                }

                // Password Validation
                const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
                if (!passwordRegex.test(formData.password)) {
                    toast.error("Password must be at least 8 characters long and include uppercase, lowercase, number, and special character", {
                        duration: 5000, // Show for longer so user can read
                    });
                    setLoading(false);
                    return;
                }

                // Validate all fields are filled
                if (!formData.username || !formData.email || !formData.password) {
                    toast.error("Please fill in all fields");
                    setLoading(false);
                    return;
                }

                const payload = {
                    username: formData.username.trim(),
                    email: formData.email.trim(),
                    password: formData.password
                };

                console.log("Signup payload:", payload);

                const response = await axios.post('http://localhost:8080/api/auth/user/signup', payload);

                console.log("Signup response:", response);

                if (response.data) {
                    // Store email in localStorage for registration forms
                    localStorage.setItem('email', formData.email.trim());
                    
                    // Auto login after signup or switch to login
                    setFormData({
                        username: '',
                        email: '',
                        password: '',
                        confirmPassword: ''
                    });
                    
                    setIsLogin(true);
                    toast.success("Account created successfully! Please login.");
                }
            }
        } catch (err) {
            console.error("Auth error:", err);
            console.error("Auth error response:", err.response);
            
            let errorMessage = "Authentication failed";
            if (err.response?.data) {
                // Backend returns plain string error messages
                errorMessage = typeof err.response.data === 'string' 
                    ? err.response.data 
                    : err.response.data.message || errorMessage;
            } else if (err.message) {
                errorMessage = err.message;
            }
            
            toast.error("Failed to authenticate!");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden relative">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors z-10"
                >
                    <X className="w-5 h-5 text-gray-500" />
                </button>

                {/* Header / Tabs */}
                <div className="flex border-b">
                    <button
                        className={`flex-1 py-4 text-center font-semibold transition-colors ${isLogin ? 'text-green-600 border-b-2 border-green-600 bg-green-50' : 'text-gray-500 hover:bg-gray-50'}`}
                        onClick={() => setIsLogin(true)}
                    >
                        Login
                    </button>
                    <button
                        className={`flex-1 py-4 text-center font-semibold transition-colors ${!isLogin ? 'text-green-600 border-b-2 border-green-600 bg-green-50' : 'text-gray-500 hover:bg-gray-50'}`}
                        onClick={() => setIsLogin(false)}
                    >
                        Sign Up
                    </button>
                </div>

                <div className="p-8">
                    <div className="text-center mb-8">
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">
                            {isLogin ? 'Welcome Back!' : 'Create Account'}
                        </h2>
                        <p className="text-gray-500 text-sm">
                            {isLogin ? 'Please sign in to continue' : 'Join us to make a difference'}
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    name="username"
                                    required
                                    value={formData.username}
                                    onChange={handleInputChange}
                                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
                                    placeholder="Enter username"
                                />
                            </div>
                        </div>

                        {!isLogin && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="email"
                                        name="email"
                                        required
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
                                        placeholder="Enter email"
                                    />
                                </div>
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    required
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    className="w-full pl-10 pr-12 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
                                    placeholder="••••••••"
                                />
                                <div
                                    className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer p-1 text-gray-400 hover:text-gray-600"
                                    onMouseDown={() => setShowPassword(true)}
                                    onMouseUp={() => setShowPassword(false)}
                                    onMouseLeave={() => setShowPassword(false)}
                                    onTouchStart={() => setShowPassword(true)}
                                    onTouchEnd={() => setShowPassword(false)}
                                >
                                    <Eye className="w-5 h-5" />
                                </div>
                            </div>
                        </div>

                        {!isLogin && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        name="confirmPassword"
                                        required
                                        value={formData.confirmPassword}
                                        onChange={handleInputChange}
                                        className="w-full pl-10 pr-12 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
                                        placeholder="••••••••"
                                    />
                                    <div
                                        className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer p-1 text-gray-400 hover:text-gray-600"
                                        onMouseDown={() => setShowPassword(true)}
                                        onMouseUp={() => setShowPassword(false)}
                                        onMouseLeave={() => setShowPassword(false)}
                                        onTouchStart={() => setShowPassword(true)}
                                        onTouchEnd={() => setShowPassword(false)}
                                    >
                                        <Eye className="w-5 h-5" />
                                    </div>
                                </div>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-all shadow-lg hover:shadow-green-500/30 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2 mt-6"
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (isLogin ? 'Login' : 'Create Account')}
                        </button>
                    </form>

                    <div className="mt-6 text-center text-sm text-gray-500">
                        {isLogin ? (
                            <>
                                Don't have an account?{' '}
                                <button onClick={() => setIsLogin(false)} className="text-green-600 font-semibold hover:underline">
                                    Sign up
                                </button>
                            </>
                        ) : (
                            <>
                                Already have an account?{' '}
                                <button onClick={() => setIsLogin(true)} className="text-green-600 font-semibold hover:underline">
                                    Login
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AuthModal;
