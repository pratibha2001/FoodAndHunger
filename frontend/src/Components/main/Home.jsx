import React, { useState, useEffect } from "react";
import { useOutletContext, useNavigate } from "react-router-dom";
import { MapPin, Calendar, CheckCircle, AlertCircle, ArrowRight, Heart, Utensils, Clock, Navigation, ChevronLeft, ChevronRight, Plus, Minus, Package, Eye, X, User } from "lucide-react";
import AuthModal from "../utils/AuthModal";
import toast from 'react-hot-toast';
import HomePageCrousel from "../utils/HomePageCrousel";
import HomePageStates from "../utils/HomePageStates";
import RequestFeed from "../donor/RequestFeed";

const Home = () => {
    const { publicAxiosInstance } = useOutletContext();
    const navigate = useNavigate();
    const [donations, setDonations] = useState([]);
    const [requests, setRequests] = useState([]);
    const [donors, setDonors] = useState({}); // Map of donorId -> donorData
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('donations');
    const [currentPage, setCurrentPage] = useState(1);
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [faqOpen, setFaqOpen] = useState(null);
    const [isVolunteer, setIsVolunteer] = useState(false);
    const [viewDetailsModal, setViewDetailsModal] = useState(null);
    const [donationDetailsModal, setDonationDetailsModal] = useState(null);
    const [requestDetailsModal, setRequestDetailsModal] = useState(null);
    const [userRole, setUserRole] = useState(null);
    const [requestedDonations, setRequestedDonations] = useState(new Set());
    const itemsPerPage = 6;

    const faqs = [
        {
            question: "How can I donate food?",
            answer: "You can donate food by clicking on the 'Become a Donor' button on the home page or navigating to the donation section after logging in. Fill in the details about the food, pick a location, and submit."
        },
        {
            question: "Who can request food?",
            answer: "Anyone in need, including individuals, NGOs, and community centers, can request food. You need to register as a recipient to place requests."
        },
        {
            question: "Is there a cost involved?",
            answer: "No, the platform is completely free for both donors and recipients. Our goal is to reduce food waste and help those in need."
        },
        {
            question: "How do I track my donation?",
            answer: "Once you make a donation, you can track its status in your dashboard. You will be notified when a recipient requests it and when it is picked up."
        }
    ];

    useEffect(() => {
        // Check if user is a volunteer
        const role = localStorage.getItem('role');
        setUserRole(role);
        setIsVolunteer(role === 'volunteer');
        
        const fetchData = async () => {
            if (!publicAxiosInstance) {
                console.error("publicAxiosInstance is undefined");
                return;
            }
            try {
                console.log("Fetching data...");
                const [donationsRes, requestsRes] = await Promise.all([
                    publicAxiosInstance.get("/donation/all"),
                    publicAxiosInstance.get("/request/all"), // Changed from /recipient/all
                ]);
                console.log("Donations:", donationsRes.data);
                console.log("Requests:", requestsRes.data);
                
                // Filter only admin-approved donations and requested ones (for recipients to see their requests)
                const approvedDonations = donationsRes.data.filter(donation => 
                    donation.approved === true || donation.status === 'approved' || donation.status === 'requested'
                );
                
                // Filter only admin-approved requests
                const approvedRequests = requestsRes.data.filter(request => 
                    request.approved === true || request.status === 'approved' || request.status === 'requested'
                );
                
                setDonations(approvedDonations);
                setRequests(approvedRequests);

                // Fetch donor details
                const uniqueDonorIds = [...new Set(donationsRes.data.map(d => d.donorId))];

                const donorPromises = uniqueDonorIds.map(id =>
                    publicAxiosInstance.get(`/donor/${id}`)
                        .then(res => ({ id, data: res.data }))
                        .catch(err => {
                            console.warn(`Failed to fetch donor ${id}:`, err);
                            return null;
                        })
                );
                const donorsData = await Promise.all(donorPromises);

                const donorsMap = donorsData.reduce((acc, curr) => {
                    if (curr) {
                        acc[curr.id] = curr.data;
                    }
                    return acc;
                }, {});
                setDonors(donorsMap);

            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [publicAxiosInstance]);

    const handleRequestDonation = async (id) => {
        if (!localStorage.getItem('logged_in')) {
            setShowAuthModal(true);
            return;
        }
        try {
            const donationToUpdate = donations.find(d => d.id === id);
            if (!donationToUpdate) return;

            const updatedDonation = { ...donationToUpdate, status: "requested", remarks: "Requested by recipient" };

            await publicAxiosInstance.put(`/donation/update/${id}`, updatedDonation);

            // Notify volunteers about the new pickup
            try {
                await publicAxiosInstance.post('/volunteer/notify', {
                    donationId: id,
                    message: `New donation requested: ${donationToUpdate.title || donationToUpdate.foodType}`,
                    location: donationToUpdate.address
                });
            } catch (notifyError) {
                console.warn("Failed to notify volunteers:", notifyError);
            }

            // Update local state to reflect the status change
            setDonations((prev) =>
                prev.map((d) => (d.id === id ? { ...d, status: "requested" } : d))
            );
            
            toast.success("Donation requested successfully! Volunteers have been notified.");
        } catch (error) {
            console.error("Error requesting donation:", error);
            toast.error("Failed to request donation.");
        }
    };

    const handleDonateClick = () => {
        if (!localStorage.getItem('logged_in')) {
            setShowAuthModal(true);
            return;
        }
        // Redirect to donation form or logic
        toast.success("Please go to your dashboard to donate.");
    };

    const handleDonateToRequest = async (requestId) => {
        try {
            const requestToUpdate = requests.find(r => r.id === requestId);
            if (!requestToUpdate) return;

            const updatedRequest = { ...requestToUpdate, status: "requested", remarks: "Donated by donor" };

            await publicAxiosInstance.put(`/request/update/${requestId}`, updatedRequest);

            // Notify volunteers about the new pickup
            try {
                await publicAxiosInstance.post('/volunteer/notify', {
                    requestId: requestId,
                    message: `New request donated: ${requestToUpdate.title}`,
                    location: requestToUpdate.address || requestToUpdate.location
                });
            } catch (notifyError) {
                console.warn("Failed to notify volunteers:", notifyError);
            }

            // Update local state
            setRequests((prev) =>
                prev.map((r) => (r.id === requestId ? { ...r, status: "requested" } : r))
            );
            
            toast.success("Thank you for donating! Volunteers have been notified.");
            setRequestDetailsModal(null);
        } catch (error) {
            console.error("Error donating to request:", error);
            toast.error("Failed to process donation.");
        }
    };

    const toggleFaq = (index) => {
        setFaqOpen(faqOpen === index ? null : index);
    };

    const handleAcceptDelivery = async (item) => {
        if (!confirm("Are you sure you want to accept this delivery?")) return;

        try {
            const volunteerId = localStorage.getItem('roleId');
            const volunteerName = localStorage.getItem('username') || "Volunteer";
            const isDonation = item.donorId !== undefined;

            if (isDonation) {
                // Update donation status
                await publicAxiosInstance.patch(`/donation/${item.id}/status`, null, {
                    params: {
                        status: 'out_for_delivery',
                        remarks: `Accepted by ${volunteerName} (ID: ${volunteerId})`
                    }
                });
            } else {
                // Update request status
                const updatedRequest = { ...item, status: 'out_for_delivery' };
                await publicAxiosInstance.put(`/request/update/${item.id}`, updatedRequest);
            }

            toast.success("Delivery accepted! Status updated to 'Out for Delivery'.");
            setViewDetailsModal(null);
            // Refresh data
            window.location.reload();
        } catch (error) {
            console.error("Error accepting delivery:", error);
            toast.error("Failed to accept delivery");
        }
    };

    // Pagination Logic
    const sortedDonations = [...donations].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    const sortedRequests = [...requests].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // For volunteers, combine approved donations and requests
    const currentItems = isVolunteer 
        ? [...sortedDonations, ...sortedRequests].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        : (activeTab === 'donations' ? sortedDonations : sortedRequests);
    
    const totalPages = Math.ceil(currentItems.length / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItemsSlice = currentItems.slice(indexOfFirstItem, indexOfLastItem);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    const openLiveLocation = (lat, lng, address) => {
        let query = address;
        if (lat && lng) {
            query = `${lat},${lng}`;
        }
        window.open(`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(query)}`, "_blank");
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    return (
        <div className="w-full min-h-screen bg-green-50/30">
            <HomePageCrousel />
            {/* <HomePageStates /> */}

            <div className="max-w-7xl mx-auto px-4 py-8 space-y-16">

                {/* Tabs - Only show for non-volunteers */}
                {!isVolunteer && (
                    <div className="flex justify-center mb-8">
                        <div className="bg-white p-1 rounded-xl shadow-sm border border-gray-100 inline-flex">
                            <button
                                onClick={() => { setActiveTab('donations'); setCurrentPage(1); }}
                                className={`px-6 py-3 rounded-lg font-semibold text-sm transition-all duration-200 flex items-center gap-2 ${activeTab === 'donations'
                                    ? 'bg-green-600 text-white shadow-md'
                                    : 'text-gray-600 hover:bg-gray-50'
                                    }`}
                            >
                                <Heart className={`w-4 h-4 ${activeTab === 'donations' ? 'fill-white' : ''}`} />
                                Donations
                            </button>
                            <button
                                onClick={() => { setActiveTab('requests'); setCurrentPage(1); }}
                                className={`px-6 py-3 rounded-lg font-semibold text-sm transition-all duration-200 flex items-center gap-2 ${activeTab === 'requests'
                                    ? 'bg-orange-500 text-white shadow-md'
                                    : 'text-gray-600 hover:bg-gray-50'
                                    }`}
                            >
                                <Utensils className={`w-4 h-4 ${activeTab === 'requests' ? 'fill-white' : ''}`} />
                                Requests
                            </button>
                        </div>
                    </div>
                )}

                {/* Content Section */}
                <section>
                    {isVolunteer ? (
                        // Beautiful message for volunteers
                        <div className="flex flex-col items-center justify-center py-20 px-4">
                            <div className="bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 rounded-3xl p-12 max-w-3xl text-center shadow-xl border border-green-100">
                                <div className="mb-8">
                                    <div className="relative inline-block">
                                        <Package className="w-32 h-32 mx-auto text-green-500 animate-bounce" />
                                    </div>
                                </div>
                                <h2 className="text-4xl font-bold text-gray-800 mb-4">
                                    Welcome, Volunteer! 🌟
                                </h2>
                                <p className="text-gray-700 text-xl mb-6 leading-relaxed">
                                    Thank you for being a hero in our community! Your dedication to fighting hunger makes a real difference.
                                </p>
                                <div className="bg-white/90 backdrop-blur rounded-2xl p-8 mb-8 shadow-md">
                                    <h3 className="text-2xl font-bold text-green-700 mb-4">Ready to Make a Difference?</h3>
                                    <p className="text-gray-600 text-lg mb-6">
                                        Head to your volunteer dashboard to view available pickups and manage your active deliveries.
                                    </p>
                                    <button
                                        onClick={() => navigate('/volunteers/dashboard')}
                                        className="inline-flex items-center gap-3 bg-gradient-to-r from-green-600 to-green-700 text-white px-10 py-5 rounded-2xl font-bold text-lg hover:from-green-700 hover:to-green-800 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-105"
                                    >
                                        <Navigation className="w-6 h-6" />
                                        Go to Dashboard
                                        <ArrowRight className="w-6 h-6" />
                                    </button>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
                                    <div className="bg-green-100 rounded-xl p-4">
                                        <div className="text-3xl mb-2">📦</div>
                                        <h4 className="font-bold text-gray-800 mb-1">View Pickups</h4>
                                        <p className="text-sm text-gray-600">See all available items ready for delivery</p>
                                    </div>
                                    <div className="bg-blue-100 rounded-xl p-4">
                                        <div className="text-3xl mb-2">🚚</div>
                                        <h4 className="font-bold text-gray-800 mb-1">Active Deliveries</h4>
                                        <p className="text-sm text-gray-600">Track your ongoing delivery tasks</p>
                                    </div>
                                    <div className="bg-purple-100 rounded-xl p-4">
                                        <div className="text-3xl mb-2">✨</div>
                                        <h4 className="font-bold text-gray-800 mb-1">Make Impact</h4>
                                        <p className="text-sm text-gray-600">Every delivery feeds someone in need</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : currentItemsSlice.length > 0 ? (
                        <>
                            <div className="flex items-center justify-between mb-8">
                                <div>
                                    <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
                                        {activeTab === 'donations' ? (
                                            <>
                                                <Heart className="text-green-600 fill-green-600" />
                                                Available Donations
                                            </>
                                        ) : (
                                            <>
                                                <Utensils className="text-orange-500 fill-orange-500" />
                                                Current Food Needs
                                            </>
                                        )}
                                    </h2>
                                    <p className="text-gray-600 mt-2">
                                        {activeTab === 'donations'
                                            ? "Fresh food available for pickup right now"
                                            : "Urgent requests from communities in need"}
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {activeTab === 'donations' ? (
                            currentItemsSlice.map((donation) => (
                                <div key={donation.id} className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden border border-green-100 group">
                                    <div className="relative h-48 overflow-hidden">
                                        <img
                                            src={donation.photo ? `http://localhost:8080${donation.photo}` : "https://images.unsplash.com/photo-1488459716781-31db52582fe9?auto=format&fit=crop&q=80"}
                                            alt={donation.title}
                                            className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                                            onError={(e) => {
                                                e.target.onerror = null;
                                                e.target.src = "https://images.unsplash.com/photo-1488459716781-31db52582fe9?auto=format&fit=crop&q=80";
                                            }}
                                        />
                                        <div className="absolute top-3 right-3">
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium shadow-sm ${donation.type?.toLowerCase() === 'veg' ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-red-100 text-red-700 border border-red-200'}`}>
                                                {donation.type || 'Veg'}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="p-5 space-y-4">
                                        <div>
                                            <h3 className="text-xl font-bold text-gray-800 mb-1">{donation.title}</h3>
                                            {donors[donation.donorId] && (
                                                <p className="text-sm font-medium text-green-600 mb-2">
                                                    By: {donors[donation.donorId].organizationName || donors[donation.donorId].name}
                                                </p>
                                            )}
                                            <p className="text-gray-500 text-sm line-clamp-2">{donation.description}</p>
                                        </div>

                                        <div className="space-y-2 text-sm text-gray-600">
                                            <div className="flex items-start gap-2">
                                                <MapPin className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
                                                <span className="line-clamp-1">{donation.address || "Address Available"}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Clock className="w-4 h-4 text-green-600 shrink-0" />
                                                <span>Added: {formatDate(donation.createdAt)}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <AlertCircle className="w-4 h-4 text-green-600 shrink-0" />
                                                <span>Status: {donation.status || "Available"}</span>
                                            </div>
                                        </div>

                                        <div className="pt-4 flex gap-3 border-t border-gray-100">
                                            {userRole === 'recipient' ? (
                                                <button
                                                    onClick={() => handleRequestDonation(donation.id)}
                                                    disabled={donation.status === 'requested'}
                                                    className={`flex-1 py-2.5 px-4 rounded-xl font-medium text-sm transition-all duration-200 flex items-center justify-center gap-2 ${donation.status === 'requested'
                                                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                        : 'bg-green-600 text-white hover:bg-green-700 shadow-lg shadow-green-600/20'
                                                        }`}
                                                >
                                                    {donation.status === 'requested' ? (
                                                        <>
                                                            <CheckCircle className="w-4 h-4" /> Requested
                                                        </>
                                                    ) : (
                                                        'Request Donation'
                                                    )}
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => setDonationDetailsModal(donation)}
                                                    className="flex-1 py-2.5 px-4 rounded-xl font-medium text-sm transition-all duration-200 flex items-center justify-center gap-2 bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-600/20"
                                                >
                                                    <Eye className="w-4 h-4" /> View Details
                                                </button>
                                            )}
                                            <button
                                                onClick={() => openLiveLocation(donation.latitude, donation.longitude, donation.address)}
                                                className="p-2.5 rounded-xl bg-green-50 text-green-600 hover:bg-green-100 transition-colors border border-green-200"
                                                title="Track Location"
                                            >
                                                <Navigation className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            currentItemsSlice.map((request) => (
                                <div key={request.id} className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden border border-orange-100 group">
                                    {/* Add image section like donations */}
                                    <div className="relative h-48 overflow-hidden">
                                        <img
                                            src={request.photo ? `http://localhost:8080${request.photo}` : "https://images.unsplash.com/photo-1593759608979-8a5f6e3e0b8c?auto=format&fit=crop&q=80"}
                                            alt={request.title}
                                            className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                                            onError={(e) => {
                                                e.target.onerror = null;
                                                e.target.src = "https://images.unsplash.com/photo-1593759608979-8a5f6e3e0b8c?auto=format&fit=crop&q=80";
                                            }}
                                        />
                                        <div className="absolute top-3 right-3">
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium shadow-sm ${
                                                request.status?.toLowerCase() === 'urgent'
                                                    ? 'bg-red-500 text-white animate-pulse'
                                                    : 'bg-orange-500 text-white'
                                            }`}>
                                                {request.status || 'Urgent'}
                                            </span>
                                        </div>
                                        <div className="absolute top-3 left-3">
                                            <span className="px-3 py-1 rounded-full text-xs font-medium shadow-sm bg-blue-100 text-blue-700 border border-blue-200">
                                                {request.amount ? `${request.amount} People` : 'Any Amount'}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="p-5 space-y-4">
                                        <div>
                                            <h3 className="text-xl font-bold text-gray-800 mb-1">{request.title}</h3>
                                            <p className="text-gray-500 text-sm line-clamp-2">{request.description}</p>
                                        </div>

                                        <div className="space-y-2 text-sm text-gray-600">
                                            <div className="flex items-start gap-2">
                                                <MapPin className="w-4 h-4 text-orange-500 mt-0.5 shrink-0" />
                                                <span className="line-clamp-1">{request.address || "Address Available"}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Calendar className="w-4 h-4 text-orange-500 shrink-0" />
                                                <span>Requested: {formatDate(request.createdAt)}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <AlertCircle className="w-4 h-4 text-orange-500 shrink-0" />
                                                <span>Status: {request.status || "Urgent"}</span>
                                            </div>
                                        </div>

                                        <div className="pt-4 flex gap-3 border-t border-gray-100">
                                            {userRole === 'donor' ? (
                                                <button
                                                    onClick={() => setRequestDetailsModal(request)}
                                                    disabled={request.status === 'requested'}
                                                    className={`flex-1 py-2.5 px-4 rounded-xl font-medium text-sm transition-all duration-200 flex items-center justify-center gap-2 ${
                                                        request.status === 'requested'
                                                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                            : 'bg-orange-500 text-white hover:bg-orange-600 shadow-lg shadow-orange-500/20'
                                                    }`}
                                                >
                                                    {request.status === 'requested' ? (
                                                        <>
                                                            <CheckCircle className="w-4 h-4" /> Donated
                                                        </>
                                                    ) : (
                                                        'Donate Now'
                                                    )}
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => setRequestDetailsModal(request)}
                                                    className="flex-1 py-2.5 px-4 rounded-xl font-medium text-sm transition-all duration-200 flex items-center justify-center gap-2 bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-600/20"
                                                >
                                                    <Eye className="w-4 h-4" /> View Details
                                                </button>
                                            )}
                                            <button
                                                onClick={() => openLiveLocation(request.latitude, request.longitude, request.address)}
                                                className="p-2.5 rounded-xl bg-orange-50 text-orange-600 hover:bg-orange-100 transition-colors border border-orange-200"
                                                title="Track Location"
                                            >
                                                <Navigation className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                    </>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-20 px-4">
                            <div className="bg-gradient-to-br from-green-50 to-orange-50 rounded-3xl p-12 max-w-2xl text-center shadow-lg border border-green-100">
                                {activeTab === 'donations' ? (
                                    <>
                                        <div className="mb-6">
                                            <Heart className="w-20 h-20 mx-auto text-green-500 animate-pulse" />
                                        </div>
                                        <h3 className="text-3xl font-bold text-gray-800 mb-4">
                                            No Donations Available Right Now
                                        </h3>
                                        <p className="text-gray-600 text-lg mb-6">
                                            We're currently waiting for generous donors to share their surplus food. Every small contribution makes a big difference!
                                        </p>
                                        <div className="bg-white/80 backdrop-blur rounded-2xl p-6">
                                            <p className="text-green-700 font-medium mb-2">💚 Want to make an impact?</p>
                                            <p className="text-gray-600">Join our community of donors and help feed those in need</p>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="mb-6">
                                            <Utensils className="w-20 h-20 mx-auto text-orange-500 animate-pulse" />
                                        </div>
                                        <h3 className="text-3xl font-bold text-gray-800 mb-4">
                                            Great News! No Pending Requests
                                        </h3>
                                        <p className="text-gray-600 text-lg mb-6">
                                            All current food needs have been addressed. Our community is working together to ensure no one goes hungry!
                                        </p>
                                        <div className="bg-white/80 backdrop-blur rounded-2xl p-6">
                                            <p className="text-orange-600 font-medium mb-2">🤝 Together We're Stronger</p>
                                            <p className="text-gray-600">Check back soon or join our mission to fight hunger</p>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Pagination */}
                    {currentItemsSlice.length > 0 && totalPages > 1 && (
                        <div className="flex justify-center items-center gap-4 mt-12">
                            <button
                                onClick={() => paginate(currentPage - 1)}
                                disabled={currentPage === 1}
                                className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronLeft className="w-5 h-5 text-gray-600" />
                            </button>
                            <span className="text-gray-600 font-medium">
                                Page {currentPage} of {totalPages}
                            </span>
                            <button
                                onClick={() => paginate(currentPage + 1)}
                                disabled={currentPage === totalPages}
                                className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronRight className="w-5 h-5 text-gray-600" />
                            </button>
                        </div>
                    )}
                </section>

                {/* FAQ Section */}
                <section className="max-w-3xl mx-auto pt-12 border-t border-gray-200">
                    <h2 className="text-3xl font-bold text-gray-800 text-center mb-8">Frequently Asked Questions</h2>
                    <div className="space-y-4">
                        {faqs.map((faq, index) => (
                            <div key={index} className="bg-white rounded-xl border border-gray-200 overflow-hidden transition-all duration-300 hover:shadow-md">
                                <button
                                    onClick={() => toggleFaq(index)}
                                    className="w-full flex items-center justify-between p-5 text-left bg-white hover:bg-gray-50 transition-colors"
                                >
                                    <span className="font-semibold text-gray-800">{faq.question}</span>
                                    {faqOpen === index ? (
                                        <Minus className="w-5 h-5 text-green-600" />
                                    ) : (
                                        <Plus className="w-5 h-5 text-gray-400" />
                                    )}
                                </button>
                                <div
                                    className={`overflow-hidden transition-all duration-300 ease-in-out ${faqOpen === index ? 'max-h-48 opacity-100' : 'max-h-0 opacity-0'
                                        }`}
                                >
                                    <div className="p-5 pt-0 text-gray-600 leading-relaxed">
                                        {faq.answer}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </div>

            {/* View Details Modal for Volunteers */}
            {viewDetailsModal && (
                <div className="fixed inset-0 backdrop-blur-md flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        {/* Modal Header */}
                        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
                            <h2 className="text-2xl font-bold text-gray-800">Pickup Details</h2>
                            <button
                                onClick={() => setViewDetailsModal(null)}
                                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                            >
                                <X className="w-6 h-6 text-gray-600" />
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div className="p-6">
                            {/* Image */}
                            <div className="mb-6 rounded-xl overflow-hidden bg-gray-100">
                                {viewDetailsModal.photo ? (
                                    <img
                                        src={`http://localhost:8080/uploads/${viewDetailsModal.donorId ? 'donations' : 'requests'}/${viewDetailsModal.id}/${viewDetailsModal.photo}`}
                                        alt={viewDetailsModal.title || viewDetailsModal.foodType}
                                        className="w-full h-64 object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-64 flex items-center justify-center">
                                        <User className="w-24 h-24 text-gray-400" />
                                    </div>
                                )}
                            </div>

                            {/* Details Grid */}
                            <div className="space-y-4">
                                {/* Type Badge */}
                                <div className="flex gap-2">
                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${viewDetailsModal.donorId ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>
                                        {viewDetailsModal.donorId ? 'Donation' : 'Request'}
                                    </span>
                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${viewDetailsModal.status === 'available' ? 'bg-green-100 text-green-700' :
                                            viewDetailsModal.status === 'out_for_delivery' ? 'bg-yellow-100 text-yellow-700' :
                                                'bg-gray-100 text-gray-700'
                                        }`}>
                                        {viewDetailsModal.status?.replace('_', ' ').toUpperCase() || 'AVAILABLE'}
                                    </span>
                                </div>

                                {/* Title */}
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-500 mb-1">Title</h3>
                                    <p className="text-lg font-bold text-gray-800">{viewDetailsModal.title || viewDetailsModal.foodType}</p>
                                </div>

                                {/* Description */}
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-500 mb-1">Description</h3>
                                    <p className="text-gray-700">{viewDetailsModal.description}</p>
                                </div>

                                {/* Location */}
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-500 mb-1">Location</h3>
                                    <div className="flex items-start gap-2 text-gray-700">
                                        <MapPin className="w-5 h-5 shrink-0 mt-0.5 text-green-600" />
                                        <span>{viewDetailsModal.address || viewDetailsModal.location || "Address Available"}</span>
                                    </div>
                                </div>

                                {/* Date */}
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-500 mb-1">Created On</h3>
                                    <div className="flex items-center gap-2 text-gray-700">
                                        <Clock className="w-5 h-5 text-green-600" />
                                        <span>{new Date(viewDetailsModal.createdAt).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t">
                                <button
                                    onClick={() => openLiveLocation(viewDetailsModal.latitude, viewDetailsModal.longitude, viewDetailsModal.address || viewDetailsModal.location)}
                                    className="py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                                >
                                    <MapPin className="w-5 h-5" />
                                    View Location
                                </button>
                                <button
                                    onClick={() => handleAcceptDelivery(viewDetailsModal)}
                                    className="py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                                >
                                    <CheckCircle className="w-5 h-5" />
                                    Accept Delivery
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Donation Details Modal for Donors/Volunteers */}
            {donationDetailsModal && (
                <div className="fixed inset-0 backdrop-blur-md flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        {/* Modal Header */}
                        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
                            <h2 className="text-2xl font-bold text-gray-800">Donation Details</h2>
                            <button
                                onClick={() => setDonationDetailsModal(null)}
                                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                            >
                                <X className="w-6 h-6 text-gray-600" />
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div className="p-6">
                            {/* Image */}
                            <div className="mb-6 rounded-xl overflow-hidden bg-gray-100">
                                {donationDetailsModal.photo ? (
                                    <img
                                        src={`http://localhost:8080/uploads/donations/${donationDetailsModal.id}/${donationDetailsModal.photo}`}
                                        alt={donationDetailsModal.title || donationDetailsModal.foodType}
                                        className="w-full h-64 object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-64 flex items-center justify-center">
                                        <Package className="w-24 h-24 text-gray-400" />
                                    </div>
                                )}
                            </div>

                            {/* Details Grid */}
                            <div className="space-y-4">
                                {/* Status Badge */}
                                <div className="flex gap-2">
                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                        donationDetailsModal.status === 'available' ? 'bg-green-100 text-green-700' :
                                        donationDetailsModal.status === 'approved' ? 'bg-blue-100 text-blue-700' :
                                        donationDetailsModal.status === 'out_for_delivery' ? 'bg-yellow-100 text-yellow-700' :
                                        'bg-gray-100 text-gray-700'
                                    }`}>
                                        {donationDetailsModal.status?.replace('_', ' ').toUpperCase() || 'AVAILABLE'}
                                    </span>
                                </div>

                                {/* Title */}
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-500 mb-1">Title</h3>
                                    <p className="text-lg font-bold text-gray-800">{donationDetailsModal.title || donationDetailsModal.foodType}</p>
                                </div>

                                {/* Description */}
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-500 mb-1">Description</h3>
                                    <p className="text-gray-700">{donationDetailsModal.description}</p>
                                </div>

                                {/* Food Type */}
                                {donationDetailsModal.foodType && (
                                    <div>
                                        <h3 className="text-sm font-semibold text-gray-500 mb-1">Food Type</h3>
                                        <p className="text-gray-700">{donationDetailsModal.foodType}</p>
                                    </div>
                                )}

                                {/* Quantity */}
                                {donationDetailsModal.quantity && (
                                    <div>
                                        <h3 className="text-sm font-semibold text-gray-500 mb-1">Quantity</h3>
                                        <p className="text-gray-700">{donationDetailsModal.quantity}</p>
                                    </div>
                                )}

                                {/* Location */}
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-500 mb-1">Location</h3>
                                    <div className="flex items-start gap-2 text-gray-700">
                                        <MapPin className="w-5 h-5 shrink-0 mt-0.5 text-green-600" />
                                        <span>{donationDetailsModal.address || "Address Available"}</span>
                                    </div>
                                </div>

                                {/* Date */}
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-500 mb-1">Created On</h3>
                                    <div className="flex items-center gap-2 text-gray-700">
                                        <Clock className="w-5 h-5 text-green-600" />
                                        <span>{new Date(donationDetailsModal.createdAt).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Action Button */}
                            <div className="mt-6 pt-6 border-t">
                                <button
                                    onClick={() => openLiveLocation(donationDetailsModal.latitude, donationDetailsModal.longitude, donationDetailsModal.address)}
                                    className="w-full py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                                >
                                    <MapPin className="w-5 h-5" />
                                    View Location
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Request Details Modal */}
            {requestDetailsModal && (
                <div className="fixed inset-0 backdrop-blur-md flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        {/* Modal Header */}
                        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
                            <h2 className="text-2xl font-bold text-gray-800">Request Details</h2>
                            <button
                                onClick={() => setRequestDetailsModal(null)}
                                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                            >
                                <X className="w-6 h-6 text-gray-600" />
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div className="p-6">
                            {/* Image */}
                            <div className="mb-6 rounded-xl overflow-hidden bg-gray-100">
                                {requestDetailsModal.photo ? (
                                    <img
                                        src={`http://localhost:8080${requestDetailsModal.photo}`}
                                        alt={requestDetailsModal.title}
                                        className="w-full h-64 object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-64 flex items-center justify-center">
                                        <Package className="w-24 h-24 text-gray-400" />
                                    </div>
                                )}
                            </div>

                            {/* Details Grid */}
                            <div className="space-y-4">
                                {/* Status Badge */}
                                <div className="flex gap-2">
                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                        requestDetailsModal.status?.toLowerCase() === 'urgent' ? 'bg-red-100 text-red-700' :
                                        requestDetailsModal.status === 'requested' ? 'bg-blue-100 text-blue-700' :
                                        'bg-orange-100 text-orange-700'
                                    }`}>
                                        {requestDetailsModal.status?.toUpperCase() || 'URGENT'}
                                    </span>
                                    {requestDetailsModal.amount && (
                                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
                                            {requestDetailsModal.amount} People
                                        </span>
                                    )}
                                </div>

                                {/* Title */}
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-500 mb-1">Title</h3>
                                    <p className="text-lg font-bold text-gray-800">{requestDetailsModal.title}</p>
                                </div>

                                {/* Description */}
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-500 mb-1">Description</h3>
                                    <p className="text-gray-700">{requestDetailsModal.description}</p>
                                </div>

                                {/* Amount */}
                                {requestDetailsModal.amount && (
                                    <div>
                                        <h3 className="text-sm font-semibold text-gray-500 mb-1">Number of People</h3>
                                        <p className="text-gray-700">{requestDetailsModal.amount}</p>
                                    </div>
                                )}

                                {/* Location */}
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-500 mb-1">Location</h3>
                                    <div className="flex items-start gap-2 text-gray-700">
                                        <MapPin className="w-5 h-5 shrink-0 mt-0.5 text-orange-600" />
                                        <span>{requestDetailsModal.address || "Address Available"}</span>
                                    </div>
                                </div>

                                {/* Date */}
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-500 mb-1">Requested On</h3>
                                    <div className="flex items-center gap-2 text-gray-700">
                                        <Clock className="w-5 h-5 text-orange-600" />
                                        <span>{new Date(requestDetailsModal.createdAt).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Action Button */}
                            <div className="mt-6 pt-6 border-t">
                                {userRole === 'donor' ? (
                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => openLiveLocation(requestDetailsModal.latitude, requestDetailsModal.longitude, requestDetailsModal.address)}
                                            className="flex-1 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                                        >
                                            <MapPin className="w-5 h-5" />
                                            View Location
                                        </button>
                                        <button
                                            onClick={() => handleDonateToRequest(requestDetailsModal.id)}
                                            className="flex-1 py-3 bg-orange-600 text-white rounded-xl font-semibold hover:bg-orange-700 transition-colors flex items-center justify-center gap-2"
                                        >
                                            <Heart className="w-5 h-5" />
                                            Donate Now
                                        </button>
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => openLiveLocation(requestDetailsModal.latitude, requestDetailsModal.longitude, requestDetailsModal.address)}
                                        className="w-full py-3 bg-orange-600 text-white rounded-xl font-semibold hover:bg-orange-700 transition-colors flex items-center justify-center gap-2"
                                    >
                                        <MapPin className="w-5 h-5" />
                                        View Location
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <AuthModal
                isOpen={showAuthModal}
                onClose={() => setShowAuthModal(false)}
                onLoginSuccess={() => {
                    setShowAuthModal(false);
                    // Update user role after login
                    const role = localStorage.getItem('role');
                    setUserRole(role);
                    setIsVolunteer(role === 'volunteer');
                }}
            />
        </div>
    );
};

export default Home;
