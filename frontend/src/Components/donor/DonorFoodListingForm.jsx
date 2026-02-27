import React, { useState } from "react";
import { Send, UtensilsCrossed, Package, Calendar, Edit, Loader2, CheckCircle, XCircle } from "lucide-react";

const DonationFormModal = ({ isOpen, onClose, needDetails }) => {
    // FIX: All hooks must be called unconditionally at the top of the component.
    const [foodType, setFoodType] = useState('');
    const [quantity, setQuantity] = useState('');
    const [readyTime, setReadyTime] = useState('');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    // Now we can conditionally return before the main render logic
    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        setLoading(true);
        setSubmitted(false);

        // Simulate API call delay
        setTimeout(() => {
            console.log("Donation Submitted:", { foodType, quantity, readyTime, description });
            setLoading(false);
            setSubmitted(true);

            // In a real app, you might only close the modal after a few seconds
            // or redirect the user. For this demo, we show the success message.
            setTimeout(onClose, 2500);

            // Clear form state for next use
            setFoodType('');
            setQuantity('');
            setReadyTime('');
            setDescription('');
        }, 1500);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
            <div className="w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl p-6 md:p-8 relative bg-white transform animate-modal-slide-up">

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
                        List Your Donation
                    </h2>
                    <p className="text-sm opacity-70 mt-2">
                        Tell us what you have so we can match it to a recipient organization.
                    </p>
                </div>

                {/* Recipient Need Context (if passed) */}
                {needDetails && (
                    <div className="p-3 mb-4 rounded-lg border border-green-500/50 bg-green-50/50 text-sm font-medium">
                        <p className="font-semibold text-green-700">Fulfilling Need For:</p>
                        <p className="opacity-80">{needDetails.name} needs **{needDetails.need}** ({needDetails.type})</p>
                    </div>
                )}


                {/* --- Form Section --- */}
                <form onSubmit={handleSubmit} className="space-y-5">

                    {submitted && (
                        <div className="p-4 rounded-xl border border-green-400 text-green-800 flex items-center space-x-3 animate-pop-in">
                            <CheckCircle className="w-6 h-6" />
                            <p className="font-semibold">Success! Your donation is listed and being matched.</p>
                        </div>
                    )}

                    {/* Food Type */}
                    <div className="relative">
                        <label htmlFor="foodType" className="block text-sm font-medium mb-1">Food Type</label>
                        <div className="relative">
                            <Package className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 opacity-50" />
                            <input
                                type="text"
                                id="foodType"
                                value={foodType}
                                onChange={(e) => setFoodType(e.target.value)}
                                placeholder="Cooked Chicken & Rice"
                                required
                                className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 transition duration-150"
                            />
                        </div>
                    </div>

                    {/* Quantity */}
                    <div className="relative">
                        <label htmlFor="quantity" className="block text-sm font-medium mb-1">Quantity</label>
                        <div className="relative">
                            <UtensilsCrossed className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 opacity-50" />
                            <input
                                type="text"
                                id="quantity"
                                value={quantity}
                                onChange={(e) => setQuantity(e.target.value)}
                                placeholder="10 kg (approx. 40 servings)"
                                required
                                className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 transition duration-150"
                            />
                        </div>
                    </div>

                    {/* Ready Time */}
                    <div className="relative">
                        <label htmlFor="readyTime" className="block text-sm font-medium mb-1">Ready/Expiration Time</label>
                        <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 opacity-50" />
                            <input
                                type="text"
                                id="readyTime"
                                value={readyTime}
                                onChange={(e) => setReadyTime(e.target.value)}
                                placeholder="Ready for pickup by 4 PM today"
                                required
                                className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 transition duration-150"
                            />
                        </div>
                    </div>

                    {/* Description */}
                    <div className="relative">
                        <label htmlFor="description" className="block text-sm font-medium mb-1">Additional Details</label>
                        <div className="relative">
                            <Edit className="absolute left-3 top-3 w-5 h-5 opacity-50" />
                            <textarea
                                id="description"
                                rows="3"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="No nuts, main ingredients are chicken, rice, and mixed vegetables."
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
                                Submitting...
                            </>
                        ) : (
                            <>
                                <Send className="w-5 h-5" />
                                Submit Donation Listing
                            </>
                        )}
                        <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12"></div>
                    </button>
                </form>
            </div>

            {/* --- CSS Animations --- */}
            <style>{`
                @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
                @keyframes modal-slide-up { from { opacity: 0; transform: translateY(50px); } to { opacity: 1; transform: translateY(0); } }
                @keyframes pop-in { from { opacity: 0; transform: scale(0.8); } to { opacity: 1; transform: scale(1); } }
                .animate-fade-in { animation: fade-in 0.3s ease-out forwards; }
                .animate-modal-slide-up { animation: modal-slide-up 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards; }
            `}</style>
        </div>
    );
};

export default DonationFormModal;
