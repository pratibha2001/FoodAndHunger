import React, { useState, useEffect } from 'react';
import { MapPin, Calendar, User, Eye, X, Clock, AlertCircle, Utensils, Package, Heart, Navigation, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const RequestFeed = ({ axios }) => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // 'all', 'food', 'medical', etc.
    const [userLocation, setUserLocation] = useState(null);
    const [sortByDistance, setSortByDistance] = useState(false);
    const [viewDetailsModal, setViewDetailsModal] = useState(null);
    const [donatedRequests, setDonatedRequests] = useState(new Set());

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    // Haversine formula to calculate distance in km
    const calculateDistance = (lat1, lon1, lat2, lon2) => {
        if (!lat1 || !lon1 || !lat2 || !lon2) return Infinity;
        const R = 6371; // Radius of the earth in km
        const dLat = deg2rad(lat2 - lat1);
        const dLon = deg2rad(lon2 - lon1);
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const d = R * c; // Distance in km
        return d;
    };

    const deg2rad = (deg) => {
        return deg * (Math.PI / 180);
    };

    const handleNearMe = () => {
        if (sortByDistance) {
            setSortByDistance(false);
            return;
        }

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setUserLocation({
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude
                    });
                    setSortByDistance(true);
                },
                (error) => {
                    console.error("Error getting location:", error);
                    alert("Please allow location access to use 'Near Me' filter.");
                }
            );
        } else {
            alert("Geolocation is not supported by this browser.");
        }
    };

    const handleDonateRequest = async (requestId) => {
        try {
            const requestToUpdate = requests.find(r => r.id === requestId);
            if (!requestToUpdate) return;

            // Get the donor ID from localStorage
            const donorId = localStorage.getItem('roleId');
            const updatedRequest = { 
                ...requestToUpdate, 
                status: "readytodonate",
                donorId: parseInt(donorId), // Set donorId field directly
                remarks: `Ready to donate by donor ID: ${donorId}` 
            };

            await axios.put(`/request/update/${requestId}`, updatedRequest);

            // Notify volunteers about the new pickup
            try {
                await axios.post('/volunteer/notify', {
                    requestId: requestId,
                    message: `New request ready to donate: ${requestToUpdate.title}`,
                    location: requestToUpdate.address || requestToUpdate.location
                });
            } catch (notifyError) {
                console.warn("Failed to notify volunteers:", notifyError);
            }

            // Update local state
            setDonatedRequests((prev) => new Set(prev).add(requestId));
            setRequests((prev) =>
                prev.map((r) => (r.id === requestId ? { ...r, status: "readytodonate" } : r))
            );
            
            toast.success("Thank you for donating! Volunteers have been notified.");
            setViewDetailsModal(null);
        } catch (error) {
            console.error("Error donating to request:", error);
            toast.error("Failed to process donation.");
        }
    };

    useEffect(() => {
        const fetchRequests = async () => {
            try {
                // Assuming /api/request/all exists based on RequestController
                const res = await axios.get('/request/all');
                
                // Filter admin-approved requests, readytodonate requests, exclude completed and custom statuses
                const standardStatuses = ['pending', 'approved', 'rejected', 'requested', 'readytodonate', 'completed'];
                const approvedRequests = res.data.filter(request => 
                    (request.approved === true || request.status === 'approved' || request.status === 'readytodonate') &&
                    request.status !== 'completed' &&
                    (!request.status || standardStatuses.includes(request.status.toLowerCase()))
                );
                
                setRequests(approvedRequests);
            } catch (error) {
                console.error("Error fetching requests:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchRequests();
    }, []);

    const filteredRequests = (filter === 'all'
        ? requests
        : requests.filter(req => req.type?.toLowerCase() === filter.toLowerCase()))
        .sort((a, b) => {
            if (!sortByDistance || !userLocation) {
                const dateA = new Date(a.updatedAt || a.createdAt);
                const dateB = new Date(b.updatedAt || b.createdAt);
                return dateB - dateA;
            }
            const distA = calculateDistance(userLocation.latitude, userLocation.longitude, a.latitude, a.longitude);
            const distB = calculateDistance(userLocation.latitude, userLocation.longitude, b.latitude, b.longitude);
            return distA - distB;
        });

    if (loading) return <div className="text-center py-8">Loading requests...</div>;

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-800">Recipient Requests</h2>
                <div className="flex gap-2">
                    <button
                        onClick={handleNearMe}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-colors ${sortByDistance
                            ? 'bg-green-600 text-white'
                            : 'bg-white border text-gray-700 hover:bg-gray-50'
                            }`}
                    >
                        <MapPin className="w-4 h-4" />
                        Near Me
                    </button>
                    <select
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        className="px-4 py-2 border rounded-xl focus:ring-2 focus:ring-green-500 outline-none"
                    >
                        <option value="all">All Types</option>
                        <option value="Veg">Veg</option>
                        <option value="Non-Veg">Non-Veg</option>
                    </select>
                </div>
            </div>

            {filteredRequests.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                    <p className="text-gray-500">No requests found matching your criteria.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredRequests.map((req) => (
                        <div key={req.id} className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden border border-orange-100 group">
                            <div className="relative h-48 overflow-hidden">
                                <img
                                    src={req.photo ? `http://localhost:8080${req.photo}` : "https://images.unsplash.com/photo-1593759608979-8a5f6e3e0b8c?auto=format&fit=crop&q=80"}
                                    alt={req.title}
                                    className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                                    onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = "https://images.unsplash.com/photo-1593759608979-8a5f6e3e0b8c?auto=format&fit=crop&q=80";
                                    }}
                                />
                                <div className="absolute top-3 right-3">
                                    <span className={`px-3 py-1 rounded-full text-xs font-medium shadow-sm ${
                                        req.status?.toLowerCase() === 'urgent'
                                            ? 'bg-red-500 text-white animate-pulse'
                                            : 'bg-orange-500 text-white'
                                    }`}>
                                        {req.status || 'Urgent'}
                                    </span>
                                </div>
                                <div className="absolute top-3 left-3">
                                    <span className="px-3 py-1 rounded-full text-xs font-medium shadow-sm bg-blue-100 text-blue-700 border border-blue-200">
                                        {req.amount ? `${req.amount} People` : 'Any Amount'}
                                    </span>
                                </div>
                            </div>

                            <div className="p-5 space-y-4">
                                <div>
                                    <h3 className="text-xl font-bold text-gray-800 mb-1">{req.title}</h3>
                                    <p className="text-gray-500 text-sm line-clamp-2">{req.description}</p>
                                </div>

                                <div className="space-y-2 text-sm text-gray-600">
                                    <div className="flex items-start gap-2">
                                        <MapPin className="w-4 h-4 text-orange-500 mt-0.5 shrink-0" />
                                        <span className="line-clamp-1">{req.location || req.address || "Address Available"}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Calendar className="w-4 h-4 text-orange-500 shrink-0" />
                                        <span>Requested: {new Date(req.createdAt || Date.now()).toLocaleDateString()}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <AlertCircle className="w-4 h-4 text-orange-500 shrink-0" />
                                        <span>Status: {req.status || "Urgent"}</span>
                                    </div>
                                    {userLocation && req.latitude && req.longitude && (
                                        <div className="flex items-center gap-2">
                                            <Navigation className="w-4 h-4 text-orange-500 shrink-0" />
                                            <span>{calculateDistance(userLocation.latitude, userLocation.longitude, req.latitude, req.longitude).toFixed(1)} km away</span>
                                        </div>
                                    )}
                                </div>

                                <div className="pt-4 flex gap-3 border-t border-gray-100">
                                    <button 
                                        onClick={() => setViewDetailsModal(req)}
                                        disabled={donatedRequests.has(req.id) || req.status === 'readytodonate'}
                                        className={`flex-1 py-2.5 px-4 rounded-xl font-medium text-sm transition-all duration-200 flex items-center justify-center gap-2 ${
                                            donatedRequests.has(req.id) || req.status === 'readytodonate'
                                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                : 'bg-orange-500 text-white hover:bg-orange-600 shadow-lg shadow-orange-500/20'
                                        }`}
                                    >
                                        {donatedRequests.has(req.id) || req.status === 'readytodonate' ? (
                                            <>
                                                <CheckCircle className="w-4 h-4" /> Donated
                                            </>
                                        ) : (
                                            'Donate Now'
                                        )}
                                    </button>
                                    <button
                                        onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(`${req.latitude},${req.longitude}`)}`, "_blank")}
                                        className="p-2.5 rounded-xl bg-orange-50 text-orange-600 hover:bg-orange-100 transition-colors border border-orange-200"
                                        title="Track Location"
                                    >
                                        <Navigation className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* View Details Modal */}
            {viewDetailsModal && (
                <div className="fixed inset-0 backdrop-blur-sm bg-white/30 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
                        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
                            <h2 className="text-2xl font-bold text-gray-800">Request Details</h2>
                            <button
                                onClick={() => setViewDetailsModal(null)}
                                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                            >
                                <X className="w-6 h-6 text-gray-600" />
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Image */}
                            <div className="rounded-xl overflow-hidden cursor-pointer" onClick={() => window.open(viewDetailsModal.photo ? `http://localhost:8080${viewDetailsModal.photo}` : "https://via.placeholder.com/400x300?text=No+Image", '_blank')}>
                                <img
                                    src={viewDetailsModal.photo ? `http://localhost:8080${viewDetailsModal.photo}` : "https://via.placeholder.com/400x300?text=No+Image"}
                                    alt={viewDetailsModal.title}
                                    className="w-full h-64 object-cover hover:opacity-90 transition-opacity"
                                    onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = "https://via.placeholder.com/400x300?text=No+Image";
                                    }}
                                />
                            </div>

                            {/* Details Grid */}
                            <div className="space-y-4">
                                <div>
                                    <label className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Request Title</label>
                                    <p className="text-lg font-bold text-gray-800 mt-1">{viewDetailsModal.title}</p>
                                </div>

                                <div>
                                    <label className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Description</label>
                                    <p className="text-gray-700 mt-1">{viewDetailsModal.description}</p>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Type</label>
                                        <p className="mt-1">
                                            <span className="inline-block px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-700 border border-blue-200 uppercase">
                                                {viewDetailsModal.type || 'General'}
                                            </span>
                                        </p>
                                    </div>

                                    <div>
                                        <label className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Status</label>
                                        <p className="mt-1">
                                            <span className="inline-block px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-700 border border-green-200 capitalize">
                                                {viewDetailsModal.status || 'Active'}
                                            </span>
                                        </p>
                                    </div>
                                </div>

                                <div>
                                    <label className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Recipient ID</label>
                                    <div className="flex items-center gap-2 mt-1">
                                        <User className="w-5 h-5 text-green-600" />
                                        <p className="text-gray-700 font-medium">{viewDetailsModal.recipientId}</p>
                                    </div>
                                </div>

                                <div>
                                    <label className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Location</label>
                                    <div className="flex items-start gap-2 mt-1">
                                        <MapPin className="w-5 h-5 text-green-600 mt-0.5 shrink-0" />
                                        <p className="text-gray-700">{viewDetailsModal.location || viewDetailsModal.address || 'Location not specified'}</p>
                                    </div>
                                    {viewDetailsModal.latitude && viewDetailsModal.longitude && userLocation && (
                                        <p className="text-sm text-gray-500 ml-7 mt-1">
                                            Distance: {calculateDistance(userLocation.latitude, userLocation.longitude, viewDetailsModal.latitude, viewDetailsModal.longitude).toFixed(1)} km away
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Created Date</label>
                                    <div className="flex items-center gap-2 mt-1">
                                        <Calendar className="w-5 h-5 text-green-600" />
                                        <p className="text-gray-700">{formatDate(viewDetailsModal.createdAt)}</p>
                                    </div>
                                </div>

                                {viewDetailsModal.amount && (
                                    <div>
                                        <label className="text-sm font-semibold text-gray-500 uppercase tracking-wide">People to Serve</label>
                                        <div className="flex items-center gap-2 mt-1">
                                            <Package className="w-5 h-5 text-green-600" />
                                            <p className="text-gray-700 font-medium">{viewDetailsModal.amount} people</p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-3 pt-4 border-t">
                                {viewDetailsModal.latitude && viewDetailsModal.longitude && (
                                    <button
                                        onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${viewDetailsModal.latitude},${viewDetailsModal.longitude}`, '_blank')}
                                        className="flex-1 py-3 px-4 rounded-xl font-medium text-sm transition-all duration-200 flex items-center justify-center gap-2 bg-green-600 text-white hover:bg-green-700 shadow-lg shadow-green-600/20"
                                    >
                                        <MapPin className="w-5 h-5" />
                                        View on Map
                                    </button>
                                )}
                                <button
                                    onClick={() => handleDonateRequest(viewDetailsModal.id)}
                                    className="flex-1 py-3 px-4 rounded-xl font-medium text-sm transition-all duration-200 flex items-center justify-center gap-2 bg-orange-600 text-white hover:bg-orange-700 shadow-lg shadow-orange-600/20"
                                >
                                    <Heart className="w-5 h-5" />
                                    Donate Now
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RequestFeed;
