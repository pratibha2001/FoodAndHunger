import React, { useState, useEffect } from "react";
import { Award, TrendingUp, DollarSign, Target, CheckCircle, Clock, Heart, ArrowRight, Star, User } from "lucide-react";

// Placeholder data for the Logged-in Donor
const donorData = {
    name: "Alex Thompson",
    mealsDonated: 1850,
    totalDonations: 4500, // in dollars
    currentRank: 7,
    nextGoal: {
        meals: 2000,
        title: "Emerald Tier Donor",
        badge: <Award className="w-5 h-5 text-emerald-400 fill-emerald-400/20" />
    }
};

// Placeholder data for the Leaderboard
const topDonors = [
    { name: "Sarah Johnson", donated: 5230, avatar: "SJ", rank: 1, color: "yellow" },
    { name: "Michael Chen", donated: 4890, avatar: "MC", rank: 2, color: "gray" },
    { name: "Emma Williams", donated: 4156, avatar: "EW", rank: 3, color: "orange" },
    { name: "David Brown", donated: 3942, avatar: "DB", rank: 4, color: "green" },
    { name: "Jessica Lee", donated: 3100, avatar: "JL", rank: 5, color: "blue" },
    { name: donorData.name, donated: donorData.mealsDonated, avatar: donorData.name.split(' ').map(n => n[0]).join(''), rank: donorData.currentRank, color: "emerald" },
    { name: "Chris Evans", donated: 1500, avatar: "CE", rank: 8, color: "indigo" },
];

// Sort and limit donors for the visual display
const leaderboardDisplay = topDonors.sort((a, b) => a.rank - b.rank).slice(0, 5);

const Donor = () => {
    const [isVisible, setIsVisible] = useState({});
    const progress = Math.round((donorData.mealsDonated / donorData.nextGoal.meals) * 100);

    // Intersection Observer Hook for scroll animations
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setIsVisible((prev) => ({ ...prev, [entry.target.id]: true }));
                    }
                });
            },
            { threshold: 0.1 }
        );
        document.querySelectorAll('[id^="donor-section-"]').forEach((el) => {
            observer.observe(el);
        });
        return () => observer.disconnect();
    }, []);

    // Helper to format large numbers
    const formatNumber = (num) => num.toLocaleString('en-US');

    // Find the logged-in donor in the display list (for highlight)
    const isDonorInTop5 = leaderboardDisplay.some(d => d.name === donorData.name);

    return (
        <div className="w-full overflow-hidden pt-20">

            {/* --- Dashboard Header/Hero --- */}
            <div className="relative w-full py-16 px-4 shadow-md border-b-2 border-green-500/10">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between">
                    <div className="text-center md:text-left space-y-2">
                        <h1 className="text-4xl md:text-5xl font-extrabold animate-slide-down">
                            Welcome Back, <span className="inline-block bg-gradient-to-r from-green-500 to-emerald-600 bg-clip-text text-transparent">{donorData.name}</span>!
                        </h1>
                        <p className="text-xl opacity-70 animate-slide-down" style={{ animationDelay: '0.2s', animationFillMode: 'forwards' }}>
                            Your generosity is creating real impact, every single day.
                        </p>
                    </div>
                    <button className="mt-6 md:mt-0 relative overflow-hidden px-8 py-3 rounded-xl font-semibold shadow-lg transform transition-all duration-300 hover:scale-105 group text-white bg-green-600 hover:bg-green-700">
                        <span className="relative flex items-center gap-2">
                            Donate Now
                            <DollarSign className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                        </span>
                        <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12"></div>
                    </button>
                </div>
            </div>

            {/* --- Donor Stats and Progress Section (Personal View) --- */}
            <div
                id="donor-section-stats"
                className={`py-16 px-4 transition-all duration-1000 ${isVisible["donor-section-stats"] ? "opacity-100 translate-y-0" : "opacity-0 translate-y-20"
                    }`}
            >
                <div className="max-w-7xl mx-auto grid lg:grid-cols-3 gap-8">

                    {/* Stat Card 1: Total Meals */}
                    <div className="p-8 rounded-2xl shadow-xl border-t-4 border-green-500 group relative overflow-hidden transform hover:-translate-y-1 transition-transform duration-300">
                        <TrendingUp className="absolute top-4 right-4 w-12 h-12 text-green-500/10 opacity-50" />
                        <div className="flex items-center space-x-4 mb-4">
                            <Heart className="w-10 h-10 text-green-600 p-2 rounded-full bg-green-100" />
                            <h3 className="text-2xl font-semibold">Meals Donated</h3>
                        </div>
                        <p className="text-5xl font-extrabold">{formatNumber(donorData.mealsDonated)}</p>
                        <p className="text-sm opacity-70 mt-1">Total impact since joining</p>
                    </div>

                    {/* Stat Card 2: Financial Donations */}
                    <div className="p-8 rounded-2xl shadow-xl border-t-4 border-emerald-500 group relative overflow-hidden transform hover:-translate-y-1 transition-transform duration-300">
                        <DollarSign className="absolute top-4 right-4 w-12 h-12 text-emerald-500/10 opacity-50" />
                        <div className="flex items-center space-x-4 mb-4">
                            <DollarSign className="w-10 h-10 text-emerald-600 p-2 rounded-full bg-emerald-100" />
                            <h3 className="text-2xl font-semibold">Total Value</h3>
                        </div>
                        <p className="text-5xl font-extrabold">${formatNumber(donorData.totalDonations)}</p>
                        <p className="text-sm opacity-70 mt-1">Monetary contribution</p>
                    </div>

                    {/* Progress Card 3: Next Donor Goal */}
                    <div className="p-8 rounded-2xl shadow-xl border-t-4 border-yellow-500 group relative overflow-hidden transform hover:-translate-y-1 transition-transform duration-300">
                        <Target className="absolute top-4 right-4 w-12 h-12 text-yellow-500/10 opacity-50" />
                        <div className="flex items-center space-x-4 mb-4">
                            <Award className="w-10 h-10 text-yellow-600 p-2 rounded-full bg-yellow-100" />
                            <h3 className="text-2xl font-semibold">Next Tier Goal</h3>
                        </div>
                        <p className="text-4xl font-extrabold">{formatNumber(donorData.nextGoal.meals)} Meals</p>
                        <p className="text-sm opacity-70 mb-4 flex items-center gap-1">
                            Current progress toward **{donorData.nextGoal.title}** {donorData.nextGoal.badge}
                        </p>

                        {/* Progress Bar */}
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div
                                className="bg-gradient-to-r from-green-500 to-emerald-500 h-2.5 rounded-full transition-all duration-1000"
                                style={{ width: `${progress}%` }}
                            ></div>
                        </div>
                        <p className="mt-2 text-sm font-bold text-green-600">{progress}% Complete</p>
                    </div>
                </div>
            </div>

            {/* --- Global Leaderboard Section --- */}
            <div
                id="donor-section-leaderboard"
                className={`py-16 px-4 border-t-2 border-emerald-500/10 transition-all duration-1000 ${isVisible["donor-section-leaderboard"] ? "opacity-100 translate-y-0" : "opacity-0 translate-y-20"
                    }`}
            >
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-12">
                        <Award className="w-12 h-12 mx-auto text-yellow-500 fill-yellow-500/20 mb-2 animate-bounce-slow" />
                        <h2 className="text-4xl font-bold">Donor Hall of Fame</h2>
                        <p className="text-lg opacity-70 mt-2">See how your contributions stack up against the community (Top 5)</p>
                    </div>

                    <div className="grid md:grid-cols-5 gap-6">
                        {leaderboardDisplay.map((donor, idx) => (
                            <div
                                key={idx}
                                className={`p-6 rounded-2xl text-center relative overflow-hidden group shadow-lg transition-all duration-500 hover:shadow-2xl hover:scale-[1.03] ${donor.rank === 1 ? 'border-4 border-yellow-400' :
                                    donor.name === donorData.name ? 'border-4 border-green-500' :
                                        'border border-gray-200'
                                    }`}
                                style={{
                                    animation: isVisible["donor-section-leaderboard"] ? `pop-in 0.6s ease-out ${idx * 0.1}s forwards` : 'none',
                                    opacity: isVisible["donor-section-leaderboard"] ? 1 : 0
                                }}
                            >
                                {/* Rank Icon/Badge */}
                                <div className={`absolute top-0 right-0 px-3 py-1 text-xs font-bold rounded-bl-xl shadow-md flex items-center gap-1 ${donor.rank === 1 ? 'bg-yellow-400 text-yellow-900' :
                                    donor.rank === 2 ? 'bg-gray-300 text-gray-800' :
                                        donor.rank === 3 ? 'bg-orange-400 text-orange-900' :
                                            'bg-green-100 text-green-600'
                                    }`}>
                                    {donor.rank === 1 && <Star className="w-3 h-3 fill-current animate-spin-slow" />}
                                    #{donor.rank}
                                </div>

                                <div className="relative z-10">
                                    <div className="relative inline-block mb-4">
                                        {/* Avatar with dynamic color */}
                                        <div className={`w-20 h-20 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto shadow-lg transform group-hover:scale-110 transition-transform duration-500 bg-gradient-to-br from-${donor.color}-500 to-${donor.color}-700`}>
                                            {donor.avatar}
                                            {donor.name === donorData.name && (
                                                <User className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full p-0.5 text-white" />
                                            )}
                                        </div>
                                    </div>
                                    <h3 className="text-xl font-bold mb-1">{donor.name}</h3>
                                    <p className="text-green-600 font-semibold mb-4">{formatNumber(donor.donated)} Meals</p>
                                    <div className="pt-4 border-t border-gray-200/50">
                                        <div className="text-xs opacity-70">
                                            {donor.rank <= 3 ? "Top Contributor" : "Leading Donor"}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Personal Rank Highlight (if not in top 5) */}
                    {!isDonorInTop5 && (
                        <div
                            id="donor-section-personal-rank"
                            className={`mt-12 p-6 rounded-2xl shadow-xl border-4 border-green-500 relative overflow-hidden text-center transition-all duration-1000 ${isVisible["donor-section-leaderboard"] ? "opacity-100 scale-100" : "opacity-0 scale-90"
                                }`}
                        >
                            <div className="flex flex-col sm:flex-row items-center justify-between relative z-10">
                                <div className="flex items-center space-x-4">
                                    <Star className="w-8 h-8 text-green-600 animate-spin-slow" />
                                    <p className="text-xl font-semibold">Your Current Rank:</p>
                                </div>
                                <div className="mt-4 sm:mt-0">
                                    <span className="text-5xl font-extrabold bg-gradient-to-r from-emerald-500 to-green-600 bg-clip-text text-transparent">
                                        #{donorData.currentRank}
                                    </span>
                                </div>
                                <p className="mt-4 sm:mt-0 text-lg opacity-80">
                                    Keep pushing! Just **{donorData.nextGoal.meals - donorData.mealsDonated}** more meals to reach your next tier goal.
                                </p>
                            </div>
                            <div className="absolute inset-0 bg-green-500/5 opacity-80 animate-pulse-slower"></div>
                        </div>
                    )}
                </div>
            </div>

            {/* --- Reusing the Home page styles for animations --- */}
            <style>{`
                @keyframes slide-down {
                    from { opacity: 0; transform: translateY(-30px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes pop-in {
                    from { opacity: 0; transform: scale(0.8); }
                    to { opacity: 1; transform: scale(1); }
                }
                @keyframes gradient {
                    0%, 100% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                }
                @keyframes pulse-slow {
                    0%, 100% { opacity: 0.3; }
                    50% { opacity: 0.6; }
                }
                @keyframes pulse-slower {
                    0%, 100% { opacity: 0.1; }
                    50% { opacity: 0.3; }
                }
                @keyframes bounce-slow {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-5px); }
                }
                @keyframes spin-slow {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                .animate-slide-down { animation: slide-down 0.8s ease-out forwards; }
                .animate-pop-in { animation: pop-in 0.6s ease-out forwards; }
                .animate-gradient { background-size: 300% 300%; animation: gradient 4s ease infinite; }
                .animate-pulse-slow { animation: pulse-slow 4s ease-in-out infinite; }
                .animate-pulse-slower { animation: pulse-slower 5s ease-in-out infinite; }
                .animate-bounce-slow { animation: bounce-slow 2s infinite; }
                .animate-spin-slow { animation: spin-slow 8s linear infinite; }
            `}</style>
        </div>
    );
};

export default Donor;
