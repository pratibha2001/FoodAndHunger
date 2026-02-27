import React from 'react'
import { ArrowRight, Users, Heart, HandHeart, TrendingUp, Award, Clock, Sparkles, Star, Zap } from "lucide-react";

const HomePageStates = () => {
    const stats = [
        { number: "50K+", label: "Meals Donated", icon: <TrendingUp className="w-6 h-6" /> },
        { number: "1,200+", label: "Active Donors", icon: <Users className="w-6 h-6" /> },
        { number: "300+", label: "Volunteers", icon: <HandHeart className="w-6 h-6" /> },
        { number: "24/7", label: "Support", icon: <Clock className="w-6 h-6" /> }
    ];
    return (
        <div className="py-0 px-4">
            <div className="max-w-6xl mx-auto">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {stats.map((stat, idx) => (
                        <div
                            key={idx}
                            className="p-6 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 text-center group relative overflow-hidden"
                            style={{
                                animation: `pop-in 0.6s ease-out ${idx * 0.1}s forwards`,
                                opacity: 0,
                                transform: 'scale(0.8)'
                            }}
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                            <div className="relative">
                                <div className="flex justify-center mb-3 text-green-600 transform group-hover:scale-125 group-hover:rotate-12 transition-all duration-500">
                                    {stat.icon}
                                </div>
                                <div className="text-3xl font-bold mb-1 animate-number">
                                    {stat.number}
                                </div>
                                <div className="text-sm opacity-70">
                                    {stat.label}
                                </div>
                            </div>
                            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-green-400/10 to-transparent rounded-full -translate-y-10 translate-x-10 group-hover:translate-y-0 group-hover:translate-x-0 transition-transform duration-700"></div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default HomePageStates