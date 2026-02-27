import React, { useState, useEffect } from "react";
import { ArrowRight, HandHeart, Users, Heart, Home, ClipboardList, CheckCircle, Truck, Target } from "lucide-react";

// Recipient types data (reused from Home component context)
const recipientTypes = [
    {
        icon: <Users className="w-12 h-12 text-green-600" />,
        title: "Orphanages",
        description: "Ensuring children receive consistent, nutritious meals to support their growth and development.",
        color: "green"
    },
    {
        icon: <Heart className="w-12 h-12 text-red-500" />,
        title: "Old Age Homes",
        description: "Providing dignity through balanced nutrition and reliable food supply for our elderly citizens.",
        color: "red"
    },
    {
        icon: <Home className="w-12 h-12 text-blue-600" />,
        title: "Homeless Shelters",
        description: "Offering vital, warm meals to individuals and families experiencing homelessness, providing immediate relief.",
        color: "blue"
    }
];

const processSteps = [
    {
        icon: <ClipboardList className="w-10 h-10 text-green-600" />,
        title: "Submit Application",
        description: "Complete our quick online form detailing your organization's mission and needs."
    },
    {
        icon: <CheckCircle className="w-10 h-10 text-emerald-600" />,
        title: "Vetting & Verification",
        description: "Our team verifies your status to ensure compliance and confirm the scale of support required."
    },
    {
        icon: <Truck className="w-10 h-10 text-blue-600" />,
        title: "Receive Deliveries",
        description: "Once approved, we schedule regular, reliable food deliveries tailored to your recipient count."
    }
];

const Recipient = () => {
    const [isVisible, setIsVisible] = useState({});

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
        document.querySelectorAll('[id^="recipient-section-"]').forEach((el) => {
            observer.observe(el);
        });
        return () => observer.disconnect();
    }, []);

    return (
        <div className="w-full overflow-hidden pt-20">

            {/* --- Hero Section --- */}
            <div className="relative w-full py-20 px-4 border-b-2 border-green-500/10">
                <div className="max-w-7xl mx-auto text-center space-y-4">
                    <HandHeart className="w-16 h-16 mx-auto text-green-600 mb-4 animate-bounce-slow" />
                    <h1 className="text-5xl md:text-7xl font-extrabold leading-tight animate-slide-down">
                        Partner with <span className="inline-block bg-gradient-to-r from-green-500 to-emerald-600 bg-clip-text text-transparent animate-gradient bg-300">Food & Hunger</span>
                    </h1>
                    <p className="text-xl md:text-2xl opacity-80 max-w-4xl mx-auto animate-slide-down" style={{ animationDelay: '0.2s', animationFillMode: 'forwards' }}>
                        If your organization needs reliable, surplus food to support vulnerable members of your community, we are here to help.
                    </p>
                    <button className="mt-8 relative overflow-hidden px-8 py-3 rounded-xl font-semibold shadow-lg transform transition-all duration-300 hover:scale-105 group text-white bg-green-600 hover:bg-green-700 animate-pop-in" style={{ animationDelay: '0.4s', animationFillMode: 'forwards' }}>
                        <span className="relative flex items-center gap-2">
                            Start Your Application
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                        </span>
                        <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12"></div>
                    </button>
                </div>
            </div>

            {/* --- Who We Serve Section --- */}
            <div
                id="recipient-section-serve"
                className={`py-20 px-4 transition-all duration-1000 ${isVisible["recipient-section-serve"] ? "opacity-100 translate-y-0" : "opacity-0 translate-y-20"
                    }`}
            >
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold mb-4">Organizations We Partner With</h2>
                        <p className="text-lg opacity-70">Our focus is on critical community service providers.</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {recipientTypes.map((recipient, idx) => (
                            <div
                                key={idx}
                                className="group p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-gray-200/50 relative overflow-hidden"
                                style={{
                                    animation: isVisible["recipient-section-serve"] ? `slide-up 0.8s ease-out ${idx * 0.2}s forwards` : 'none',
                                    opacity: isVisible["recipient-section-serve"] ? 1 : 0
                                }}
                            >
                                <div className="absolute inset-0 bg-green-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                                <div className="relative z-10">
                                    <div className="mb-6 flex justify-center">
                                        <div className={`p-4 rounded-xl shadow-md bg-${recipient.color}-100 transform group-hover:scale-110 transition-transform duration-500`}>
                                            {recipient.icon}
                                        </div>
                                    </div>
                                    <h3 className="text-2xl font-bold mb-4 text-center">{recipient.title}</h3>
                                    <p className="leading-relaxed text-center opacity-80">{recipient.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* --- Application Process Section --- */}
            <div
                id="recipient-section-process"
                className={`py-20 px-4 transition-all duration-1000 border-t-2 border-emerald-500/10 ${isVisible["recipient-section-process"] ? "opacity-100 translate-y-0" : "opacity-0 translate-y-20"
                    }`}
            >
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <Target className="w-10 h-10 mx-auto text-emerald-600 mb-2" />
                        <h2 className="text-4xl font-bold mb-4">Our Simple 3-Step Process</h2>
                        <p className="text-lg opacity-70">Getting started is quick, transparent, and designed for reliability.</p>
                    </div>

                    <div className="relative flex flex-col md:flex-row justify-between items-center space-y-8 md:space-y-0 md:space-x-8">
                        {/* Connecting Line (Desktop) */}
                        <div className="absolute hidden md:block top-1/4 left-10 right-10 h-1 bg-green-200">
                            <div
                                className={`h-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all duration-1000 ${isVisible["recipient-section-process"] ? "w-[calc(100%-120px)]" : "w-0"
                                    }`}
                                style={{ left: '60px' }}
                            ></div>
                        </div>

                        {processSteps.map((step, idx) => (
                            <div
                                key={idx}
                                className="flex flex-col items-center text-center max-w-xs p-6 relative z-10 group"
                                style={{
                                    animation: isVisible["recipient-section-process"] ? `pop-in 0.6s ease-out ${idx * 0.3}s forwards` : 'none',
                                    opacity: isVisible["recipient-section-process"] ? 1 : 0
                                }}
                            >
                                <div className="relative mb-6">
                                    <div className="w-16 h-16 rounded-full flex items-center justify-center shadow-xl border-4 border-green-500 bg-white group-hover:bg-green-50 transform transition-transform duration-500 group-hover:scale-110">
                                        {step.icon}
                                    </div>
                                    {/* Step Number Badge */}
                                    <span className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-green-600 text-white font-bold flex items-center justify-center shadow-lg">
                                        {idx + 1}
                                    </span>
                                </div>
                                <h4 className="text-xl font-bold mb-2">{step.title}</h4>
                                <p className="text-sm opacity-70">{step.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* --- CTA Footer --- */}
            <div
                id="recipient-section-cta"
                className={`py-16 px-4 transition-all duration-1000 ${isVisible["recipient-section-cta"] ? "opacity-100 scale-100" : "opacity-0 scale-90"
                    }`}
            >
                <div className="max-w-6xl mx-auto rounded-3xl p-10 md:p-16 shadow-2xl relative overflow-hidden border-2 border-green-500/30 group">
                    <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                    <div className="relative z-10 text-center">
                        <h2 className="text-3xl md:text-4xl font-bold mb-4">
                            Ready to Become a Recipient Partner?
                        </h2>
                        <p className="text-xl opacity-80 mb-8 max-w-3xl mx-auto">
                            Join our network and start receiving the support your organization deserves.
                        </p>
                        <button className="relative overflow-hidden px-10 py-4 rounded-xl font-bold text-white shadow-lg transform transition-all duration-300 hover:scale-105 group/btn bg-green-600 hover:bg-green-700">
                            <span className="relative flex items-center justify-center gap-2">
                                Apply to Partner Today
                                <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-2 transition-transform duration-300" />
                            </span>
                            <div className="absolute inset-0 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12"></div>
                        </button>
                    </div>
                </div>
            </div>

            {/* --- Reusing the Home page styles for animations --- */}
            <style>{`
                @keyframes slide-down {
                    from { opacity: 0; transform: translateY(-30px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes slide-up {
                    from { opacity: 0; transform: translateY(30px); }
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
                @keyframes bounce-slow {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-5px); }
                }
                .animate-slide-down { animation: slide-down 0.8s ease-out forwards; }
                .animate-slide-up { animation: slide-up 0.8s ease-out forwards; }
                .animate-pop-in { animation: pop-in 0.6s ease-out forwards; }
                .animate-gradient { background-size: 300% 300%; animation: gradient 4s ease infinite; }
                .animate-bounce-slow { animation: bounce-slow 2s infinite; }
                .bg-300 { background-size: 300%; }
            `}</style>
        </div>
    );
};

export default Recipient;
