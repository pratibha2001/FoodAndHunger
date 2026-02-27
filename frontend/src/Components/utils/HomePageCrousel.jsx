import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import banner1 from "../../assets/images/banner1.png";
import banner2 from "../../assets/images/banner2.png";
import banner3 from "../../assets/images/banner3.png";
import banner4 from "../../assets/images/banner4.png";
import { ArrowRight, Users, Heart, HandHeart, TrendingUp, Award, Clock, Sparkles, Star, Zap } from "lucide-react";
import RegistrationModal from "./RegistrationModal";
import AuthModal from "./AuthModal";

const HomePageCrousel = () => {
    const navigate = useNavigate();
    const [index, setIndex] = useState(0);
    const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [registerUserType, setRegisterUserType] = useState('');
    const [isRegistered, setIsRegistered] = useState(false);
    
    const images = [
        banner1,
        banner2,
        banner3,
        banner4,
    ];

    // Check if user is logged in and registered
    const checkRegistrationStatus = () => {
        const loggedIn = localStorage.getItem('logged_in') === 'true';
        const userRole = localStorage.getItem('role');
        
        // If user is logged in and has a role (donor, recipient, volunteer), hide the buttons
        if (loggedIn && userRole) {
            setIsRegistered(true);
        } else {
            setIsRegistered(false);
        }
    };

    useEffect(() => {
        const timer = setInterval(() => {
            setIndex((prev) => (prev + 1) % images.length);
        }, 4000);
        
        checkRegistrationStatus();
        
        // Listen for storage changes
        const handleStorageChange = () => {
            checkRegistrationStatus();
        };
        
        window.addEventListener('storage', handleStorageChange);
        
        // Poll localStorage every 500ms to detect changes (for same-window updates)
        const pollInterval = setInterval(checkRegistrationStatus, 500);
        
        return () => {
            clearInterval(timer);
            clearInterval(pollInterval);
            window.removeEventListener('storage', handleStorageChange);
        };
    }, []);

    const handleRegisterClick = (userType) => {
        const loggedIn = localStorage.getItem('logged_in') === 'true';
        
        if (!loggedIn) {
            // User not logged in, open auth modal
            setIsAuthModalOpen(true);
        } else {
            // User logged in, open registration modal
            setRegisterUserType(userType);
            setIsRegisterModalOpen(true);
        }
    };

    return (
        <div className="relative w-full h-[100vh] overflow-hidden" >
            {
                images.map((img, i) => (
                    <div
                        key={i}
                        className={`absolute inset-0 transition-all duration-1000 ${i === index ? " scale-100" : "opacity-0 scale-110"
                            }`}
                    >
                        <img
                            src={img}
                            alt="Food Donation"
                            className="w-full h-full object-cover"
                        />
                        {/* Animated overlay pattern */}
                        <div className="absolute inset-0 opacity-10">
                            <div className="absolute top-1/4 left-1/4 w-32 h-32 border-2 border-white rounded-full animate-ping-slow"></div>
                            <div className="absolute bottom-1/3 right-1/4 w-24 h-24 border-2 border-white rounded-full animate-ping-slower"></div>
                        </div>
                    </div>
                ))
            }
            {/* Dynamic gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/70"></div>
            {/* Content with advanced animations */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center px-4">
                <div className="space-y-6 max-w-4xl relative">
                    <h1 className="text-4xl md:text-6xl font-bold mb-2 leading-tight animate-slide-down">
                        Welcome to{" "}
                        <span className="inline-block bg-gradient-to-r from-green-400 via-emerald-500 to-green-400 bg-clip-text text-transparent animate-gradient bg-300">
                            Food & Hunger
                        </span>
                    </h1>
                    {/* <p className="text-xl md:text-2xl font-medium text-green-100 mb-4 animate-slide-down" style={{ animationDelay: '0.1s' }}>
                        Connecting Communities, Ending Hunger
                    </p> */}
                    <p 
                        className="text-lg md:text-xl mb-6 font-light max-w-2xl mx-auto tracking-wide" 
                        style={{ 
                            animation: 'fade-in-up 0.8s ease-out forwards',
                            animationDelay: '0.3s',
                            opacity: 0
                        }}
                        >
                        FoodAndHunger connects restaurants, shops, and households with nearby NGOs to donate surplus food using a smart, location-based platform.
                        It reduces food waste while ensuring fresh meals reach people in need quickly and safely.
                    </p>
                    {!isRegistered && (
                        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center py-8" style={{ animation: 'fade-in-up 0.8s ease-out forwards', animationDelay: '0.6s', opacity: 0 }}>
                            <button 
                                onClick={() => handleRegisterClick('donor')}
                                className="cursor-pointer relative overflow-hidden px-8 py-3 rounded-xl font-semibold shadow-lg transform transition-all duration-300 hover:scale-105 group"
                            >
                                <div className="absolute inset-0 bg-green-600 transition-transform duration-300 group-hover:scale-110"></div>
                                <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                <span className="relative flex items-center gap-2">
                                    Become a Donor
                                    <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform duration-300" />
                                </span>
                                <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12"></div>
                            </button>
                            <button 
                                onClick={() => handleRegisterClick('recipient')}
                                className="cursor-pointer relative overflow-hidden px-8 py-3 rounded-xl font-semibold shadow-lg transform transition-all duration-300 hover:scale-105 group border-2 border-white/30 backdrop-blur-sm"
                            >
                                <div className="absolute inset-0 bg-white/10 group-hover:bg-white/20 transition-all duration-300"></div>
                                <span className="relative flex items-center gap-2">
                                    Become a Recipient
                                </span>
                            </button>
                        </div>
                    )}
                </div>
            </div>
            {/* Enhanced Carousel Indicators */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3">
                {images.map((_, i) => (
                    <button
                        key={i}
                        onClick={() => setIndex(i)}
                        className={`h-2 rounded-full transition-all duration-500 relative overflow-hidden ${i === index ? "w-12 bg-white shadow-lg shadow-white/50" : "w-2 bg-white/50 hover:bg-white/80 hover:w-4"
                            }`}
                    >
                        {i === index && (
                            <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-400 animate-shimmer"></div>
                        )}
                    </button>
                ))}
            </div>

            {/* Registration Modal */}
            <RegistrationModal 
                isOpen={isRegisterModalOpen} 
                onClose={() => {
                    setIsRegisterModalOpen(false);
                    // Check registration status after a short delay
                    setTimeout(checkRegistrationStatus, 100);
                }}
                onRegistrationSuccess={() => {
                    checkRegistrationStatus();
                }}
            />

            {/* Auth Modal */}
            <AuthModal 
                isOpen={isAuthModalOpen}
                onClose={() => setIsAuthModalOpen(false)}
                onLoginSuccess={() => {
                    setIsAuthModalOpen(false);
                    checkRegistrationStatus();
                }}
            />
        </div>
    )
}

export default HomePageCrousel