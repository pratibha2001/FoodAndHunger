import React, { useState, useEffect, useCallback } from "react";
import { ArrowRight, Utensils, Clock, MapPin, AlertTriangle, Package, Heart, Send, UtensilsCrossed, Edit, Loader2, CheckCircle, XCircle, Calendar } from "lucide-react";

// Mock data for recipient needs
const mockRecipientNeeds = [
    { id: 1, name: "Sunset Old Age Home", need: "50 hot meals", type: "Vegetarian", time: "Today, 5 PM pickup", location: "Downtown Shelter", urgency: "High" },
    { id: 2, name: "Community Youth Center", need: "100 school snacks", type: "Non-perishable", time: "Tomorrow Morning delivery", location: "North Side", urgency: "Medium" },
    { id: 3, name: "The Ark Orphanage", need: "30 kg Raw Meat", type: "Raw Ingredients", time: "Anytime pickup", location: "East District", urgency: "High" },
    { id: 4, name: "City Homeless Foundation", need: "80 liters of Soup", type: "Hot Meals", time: "Today, 7 PM delivery", location: "Central Plaza", urgency: "Immediate" },
    { id: 5, name: "Women's Safety House", need: "15 kg Fresh Produce", type: "Raw Ingredients", time: "Tomorrow Afternoon", location: "West End", urgency: "Medium" },
];

// --- 1. MODAL COMPONENT (NOW DEFINED INTERNALLY) ---
const DonationFormModal = ({ isOpen, onClose, needDetails }) => {
    // Hooks called unconditionally at the top
    const [foodType, setFoodType] = useState(needDetails ? needDetails.type : '');
    const [quantity, setQuantity] = useState('');
    const [readyTime, setReadyTime] = useState(needDetails ? needDetails.time : '');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    // Update state when new needDetails are selected (e.g., when modal opens for a new need)
    useEffect(() => {
        if (needDetails) {
            setFoodType(needDetails.type);
            setReadyTime(needDetails.time);
            setQuantity(''); // Reset quantity when switching needs
            setDescription(''); // Reset description
            setSubmitted(false); // Reset submission status
        }
    }, [needDetails]);

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        setLoading(true);
        setSubmitted(false);

        // Simulate API call delay
        setTimeout(() => {
            console.log("Donation Submitted:", { foodType, quantity, readyTime, description, fulfilling: needDetails.id });
            setLoading(false);
            setSubmitted(true);

            // Close the modal after success message is shown
            setTimeout(onClose, 2500);
        }, 1500);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
            <div className="w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl p-6 md:p-8 relative bg-white text-black transform animate-modal-slide-up">

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-200 transition-colors duration-150"
                    title="Close"
                >
                    <XCircle className="w-6 h-6 opacity-70" />
                </button>

                {/* --- Modal Header --- */}
                <div className="text-center mb-6 border-b pb-4 border-green-500/10">
                    <UtensilsCrossed className="w-10 h-10 mx-auto text-emerald-600 mb-2" />
                    <h2 className="text-3xl font-extrabold leading-tight">
                        Fulfill a Need
                    </h2>
                    <p className="text-sm opacity-70 mt-2">
                        Confirm your donation details for this recipient.
                    </p>
                </div>

                {/* Recipient Need Context (if passed) */}
                {needDetails && (
                    <div className="p-3 mb-4 rounded-lg border border-green-500/50 bg-green-50/50 text-sm font-medium">
                        <p className="font-semibold text-green-700">Fulfilling Need For:</p>
                        <p className="opacity-80">**{needDetails.name}** needs **{needDetails.need}** ({needDetails.type})</p>
                    </div>
                )}

                {/* --- Form Section --- */}
                <form onSubmit={handleSubmit} className="space-y-5">

                    {submitted && (
                        <div className="p-4 rounded-xl border border-green-400 text-green-800 flex items-center space-x-3 animate-pop-in">
                            <CheckCircle className="w-6 h-6" />
                            <p className="font-semibold">Success! Your commitment is recorded and the recipient has been notified.</p>
                        </div>
                    )}

                    {/* Food Type */}
                    <div className="relative">
                        <label htmlFor="foodType" className="block text-sm font-medium mb-1">Actual Food Type You Are Donating</label>
                        <div className="relative">
                            <Package className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 opacity-50" />
                            <input
                                type="text"
                                id="foodType"
                                value={foodType}
                                onChange={(e) => setFoodType(e.target.value)}
                                placeholder="e.g., Cooked Chicken & Rice"
                                required
                                className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 transition duration-150"
                            />
                        </div>
                    </div>

                    {/* Quantity */}
                    <div className="relative">
                        <label htmlFor="quantity" className="block text-sm font-medium mb-1">Quantity You Will Donate</label>
                        <div className="relative">
                            <UtensilsCrossed className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 opacity-50" />
                            <input
                                type="text"
                                id="quantity"
                                value={quantity}
                                onChange={(e) => setQuantity(e.target.value)}
                                placeholder="e.g., 10 kg (approx. 40 servings)"
                                required
                                className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 transition duration-150"
                            />
                        </div>
                    </div>

                    {/* Ready Time */}
                    <div className="relative">
                        <label htmlFor="readyTime" className="block text-sm font-medium mb-1">Ready/Pickup Time</label>
                        <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 opacity-50" />
                            <input
                                type="text"
                                id="readyTime"
                                value={readyTime}
                                onChange={(e) => setReadyTime(e.target.value)}
                                placeholder="e.g., Ready for pickup by 4 PM today"
                                required
                                className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 transition duration-150"
                            />
                        </div>
                    </div>

                    {/* Description */}
                    <div className="relative">
                        <label htmlFor="description" className="block text-sm font-medium mb-1">Additional Details (Allergens, etc.)</label>
                        <div className="relative">
                            <Edit className="absolute left-3 top-3 w-5 h-5 opacity-50" />
                            <textarea
                                id="description"
                                rows="3"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="e.g., No nuts, main ingredients are chicken, rice, and mixed vegetables."
                                className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 transition duration-150 resize-none"
                            />
                        </div>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full relative overflow-hidden px-8 py-3 rounded-xl font-bold shadow-lg transform transition-all duration-300 hover:scale-[1.01] group text-white bg-green-600 hover:bg-green-700 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Confirming Commitment...
                            </>
                        ) : (
                            <>
                                <Send className="w-5 h-5" />
                                Confirm Donation Commitment
                            </>
                        )}
                        <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12"></div>
                    </button>
                </form>
            </div>

            {/* --- CSS Animations (Modal Specific) --- */}
            <style>{`
                @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
                @keyframes modal-slide-up { from { opacity: 0; transform: translateY(50px); } to { opacity: 1; transform: translateY(0); } }
                .animate-fade-in { animation: fade-in 0.3s ease-out forwards; }
                .animate-modal-slide-up { animation: modal-slide-up 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards; }
            `}</style>
        </div>
    );
};
// --- END MODAL COMPONENT ---


// --- 2. MAIN PAGE COMPONENT ---
const RecipientListing = () => {

    // 1. STATE FOR LOGIN AND MODAL
    const [isLoggedIn, setIsLoggedIn] = useState(false); // Simulate unauthenticated state initially
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedNeed, setSelectedNeed] = useState(null);
    const [isVisible, setIsVisible] = useState({});

    // 2. THE CLICK HANDLER FUNCTION (handleFulfillClick)
    const handleFulfillClick = useCallback((need) => {
        // This is where the logic for the pop-up lives:
        if (!isLoggedIn) {
            // A. NOT LOGGED IN: Show the modal/popup and pass the selected need data
            setSelectedNeed(need);
            setIsModalOpen(true);
        } else {
            // B. LOGGED IN: Skip the modal and proceed (e.g., redirect to a confirmation page)
            console.log(`LOGGED IN: User ${need.id} initiating donation. Skipping form modal.`);
        }
    }, [isLoggedIn]); // Dependency on isLoggedIn


    // Intersection Observer Hook for scroll animations (reused from previous components)
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
        document.querySelectorAll('[id^="recipient-need-"]').forEach((el) => {
            observer.observe(el);
        });
        return () => observer.disconnect();
    }, []);

    const getUrgencyClass = (urgency) => {
        switch (urgency) {
            case 'Immediate':
                return 'bg-red-500 text-white animate-pulse';
            case 'High':
                return 'bg-yellow-400 text-yellow-900';
            default:
                return 'bg-green-400 text-green-900';
        }
    };

    return (
        <div className="w-full overflow-hidden pt-20">
            {/* Login Toggle for Demo (Simulates Authentication) */}
            <div className="fixed top-0 right-0 p-3 z-50 bg-gray-100/80 backdrop-blur-sm shadow-md rounded-bl-lg text-sm">
                <p className="font-semibold mb-1">Demo Login State:</p>
                <button
                    onClick={() => setIsLoggedIn(!isLoggedIn)}
                    className={`px-3 py-1 rounded-full text-white transition-colors duration-200 ${isLoggedIn ? 'bg-green-600' : 'bg-red-600'}`}
                >
                    {isLoggedIn ? 'Log Out (Shows Form)' : 'Log In (Skips Form)'}
                </button>
            </div>

            {/* --- Hero Section --- */}
            <div className="relative w-full py-16 px-4 border-b-2 border-green-500/10">
                <div className="max-w-7xl mx-auto text-center space-y-4">
                    <Utensils className="w-16 h-16 mx-auto text-green-600 mb-4 animate-bounce-slow" />
                    <h1 className="text-5xl md:text-6xl font-extrabold leading-tight animate-slide-down">
                        Current Food <span className="inline-block bg-gradient-to-r from-green-500 to-emerald-600 bg-clip-text text-transparent animate-gradient bg-300">Needs Map</span>
                    </h1>
                    <p className="text-xl opacity-80 max-w-4xl mx-auto animate-slide-down" style={{ animationDelay: '0.2s', animationFillMode: 'forwards' }}>
                        Browse the list below to find a recipient organization that needs your help right now.
                    </p>
                </div>
            </div>

            {/* --- Needs Listing Grid --- */}
            <div className="py-20 px-4">
                <div className="max-w-7xl mx-auto grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {mockRecipientNeeds.map((need, idx) => (
                        <div
                            key={need.id}
                            id={`recipient-need-${need.id}`}
                            className="group p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-gray-200/50 relative overflow-hidden"
                            style={{
                                animation: isVisible[`recipient-need-${need.id}`] ? `pop-in 0.6s ease-out ${idx * 0.15}s forwards` : 'none',
                                opacity: isVisible[`recipient-need-${need.id}`] ? 1 : 0
                            }}
                        >
                            {/* Urgency Tag */}
                            <span className={`absolute top-0 right-0 px-4 py-2 text-xs font-bold rounded-bl-xl shadow-lg flex items-center gap-1 uppercase ${getUrgencyClass(need.urgency)}`}>
                                <AlertTriangle className="w-3 h-3" /> {need.urgency}
                            </span>

                            {/* Animated Background Accent */}
                            <div className="absolute inset-0 bg-green-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                            <div className="relative z-10">
                                <div className="flex items-center space-x-4 mb-4">
                                    <Heart className="w-10 h-10 text-red-500" />
                                    <h3 className="text-2xl font-bold">{need.name}</h3>
                                </div>

                                <p className="text-3xl font-extrabold text-green-600 mb-4">{need.need}</p>

                                <div className="space-y-3 pt-4 border-t border-gray-200/50">
                                    <div className="flex items-center text-sm opacity-80">
                                        <Package className="w-4 h-4 text-emerald-500 mr-2" />
                                        <span>Type: **{need.type}**</span>
                                    </div>
                                    <div className="flex items-center text-sm opacity-80">
                                        <Clock className="w-4 h-4 text-blue-500 mr-2" />
                                        <span>Required By: **{need.time}**</span>
                                    </div>
                                    <div className="flex items-center text-sm opacity-80">
                                        <MapPin className="w-4 h-4 text-green-500 mr-2" />
                                        <span>Location: **{need.location}**</span>
                                    </div>
                                </div>

                                <button
                                    // The button calls the handler, passing the current need object
                                    onClick={() => handleFulfillClick(need)}
                                    className="mt-6 w-full relative overflow-hidden px-6 py-3 rounded-xl font-bold shadow-md transform transition-all duration-300 hover:scale-[1.02] group/btn text-white bg-green-600 hover:bg-green-700"
                                >
                                    <span className="relative flex items-center justify-center gap-2">
                                        Fulfill Need (Donate)
                                        <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-2 transition-transform duration-300" />
                                    </span>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* 4. RENDERING THE MODAL POPUP */}
            <DonationFormModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                needDetails={selectedNeed}
            />

            {/* --- Reusing the Home page styles for animations (MAIN COMPONENT) --- */}
            <style>{`
                @keyframes slide-down { from { opacity: 0; transform: translateY(-30px); } to { opacity: 1; transform: translateY(0); } }
                @keyframes pop-in { from { opacity: 0; transform: scale(0.8); } to { opacity: 1; transform: scale(1); } }
                @keyframes gradient { 0%, 100% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } }
                @keyframes bounce-slow { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-5px); } }
                .animate-slide-down { animation: slide-down 0.8s ease-out forwards; }
                .animate-pop-in { animation: pop-in 0.6s ease-out forwards; }
                .animate-gradient { background-size: 300% 300%; animation: gradient 4s ease infinite; }
                .animate-bounce-slow { animation: bounce-slow 2s infinite; }
                .bg-300 { background-size: 300%; }
            `}</style>
        </div>
    );
};

export default RecipientListing;
