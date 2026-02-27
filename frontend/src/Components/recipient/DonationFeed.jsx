import React, { useState, useEffect } from 'react';
import { MapPin, Calendar, User, X, Navigation } from 'lucide-react';
import toast from 'react-hot-toast';

const DonationFeed = ({ axios }) => {
    const [donations, setDonations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [userLocation, setUserLocation] = useState(null);
    const [sortByDistance, setSortByDistance] = useState(false);
    const [requestedDonations, setRequestedDonations] = useState(new Set());
    const [viewDetailsModal, setViewDetailsModal] = useState(null);

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

    const handleRequestDonation = async (donationId) => {
        try {
            const donationToUpdate = donations.find(d => d.id === donationId);
            if (!donationToUpdate) return;

            // Get the recipient ID from localStorage
            const recipientId = localStorage.getItem('roleId');
            const updatedDonation = { 
                ...donationToUpdate, 
                status: "requested", 
                remarks: `Requested by recipient ID: ${recipientId}`
            };

            await axios.put(`/donation/update/${donationId}`, updatedDonation);

            // Notify volunteers about the new pickup
            try {
                await axios.post('/volunteer/notify', {
                    donationId: donationId,
                    message: `New donation requested: ${donationToUpdate.title}`,
                    location: donationToUpdate.address || donationToUpdate.location
                });
            } catch (notifyError) {
                console.warn("Failed to notify volunteers:", notifyError);
            }

            // Update local state
            setRequestedDonations((prev) => new Set(prev).add(donationId));
            setDonations((prev) =>
                prev.map((d) => (d.id === donationId ? { ...d, status: "requested" } : d))
            );
            
            // Close modal
            setViewDetailsModal(null);
            
            toast.success("Donation requested successfully! Volunteers have been notified.");
        } catch (error) {
            console.error("Error requesting donation:", error);
            toast.error("Failed to request donation.");
        }
    };

    const openLiveLocation = (lat, lng, address) => {
        let query = address;
        if (lat && lng) {
            query = `${lat},${lng}`;
        }
        window.open(`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(query)}`, "_blank");
    };

    const fetchDonations = async () => {
        try {
            // Fetch all donations. Ideally, this should be filtered by status 'active' or similar.
            // Assuming /api/donation/all returns all donations.
            const res = await axios.get('/donation/all');
            
            // Filter approved and requested donations, exclude completed and custom statuses
            const standardStatuses = ['pending', 'approved', 'rejected', 'requested', 'readytodonate', 'completed'];
            const approvedDonations = res.data.filter(d => 
                (d.approved === true || d.status === 'approved' || d.status === 'requested') && 
                d.status !== 'completed' &&
                (!d.status || standardStatuses.includes(d.status.toLowerCase()))
            );
            
            setDonations(approvedDonations);
        } catch (error) {
            console.error("Error fetching donations:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDonations();
    }, []);

    const sortedDonations = [...donations].sort((a, b) => {
        if (!sortByDistance || !userLocation) {
            const dateA = new Date(a.updatedAt || a.createdAt);
            const dateB = new Date(b.updatedAt || b.createdAt);
            return dateB - dateA;
        }
        const distA = calculateDistance(userLocation.latitude, userLocation.longitude, a.latitude, a.longitude);
        const distB = calculateDistance(userLocation.latitude, userLocation.longitude, b.latitude, b.longitude);
        return distA - distB;
    });

    const displayDonations = sortByDistance ? sortedDonations : donations;

    if (loading) return <div className="text-center py-8">Loading donations...</div>;

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-800">Available Donations</h2>
                <button
                    onClick={handleNearMe}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${sortByDistance
                        ? 'bg-green-600 text-white'
                        : 'bg-white border text-gray-700 hover:bg-gray-50'
                        }`}
                >
                    <MapPin className="w-4 h-4" />
                    Near Me
                </button>
            </div>

            {displayDonations.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                    <p className="text-gray-500">No donations available at the moment.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {displayDonations.map((donation) => (
                        <div key={donation.id} className="bg-white border rounded-xl overflow-hidden hover:shadow-md transition-shadow">
                            {donation.photo ? (
                                <img
                                    src={`http://localhost:8080${donation.photo}`}
                                    alt={donation.title}
                                    className="w-full h-48 object-cover"
                                    onError={(e) => { e.target.src = 'https://via.placeholder.com/400x300?text=No+Image'; }}
                                />
                            ) : (
                                <div className="w-full h-48 bg-gray-100 flex items-center justify-center text-gray-400">
                                    No Image
                                </div>
                            )}
                            <div className="p-5">
                                <div className="flex justify-between items-start mb-2">
                                    <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium uppercase">
                                        {donation.type}
                                    </span>
                                    <span className="text-xs text-gray-500 flex items-center gap-1">
                                        <Calendar className="w-3 h-3" />
                                        {new Date(donation.createdAt).toLocaleDateString()}
                                    </span>
                                </div>
                                <h3 className="font-bold text-lg text-gray-900 mb-2">{donation.title}</h3>
                                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{donation.description}</p>

                                <div className="flex items-center gap-2 text-gray-500 text-sm mb-4">
                                    <MapPin className="w-4 h-4" />
                                    <span className="truncate">{donation.location || donation.address || 'Location not specified'}</span>
                                </div>

                                {donation.latitude && donation.longitude && (
                                    <div className="mb-2">
                                        <div className="text-xs text-blue-600 mb-1">
                                            <a
                                                href={`https://www.google.com/maps/search/?api=1&query=${donation.latitude},${donation.longitude}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="hover:underline flex items-center gap-1"
                                            >
                                                <MapPin className="w-3 h-3" /> View on Map
                                            </a>
                                        </div>
                                        {userLocation && (
                                            <p className="text-xs text-gray-500">
                                                {calculateDistance(userLocation.latitude, userLocation.longitude, donation.latitude, donation.longitude).toFixed(1)} km away
                                            </p>
                                        )}
                                    </div>
                                )}

                                <button 
                                    onClick={() => setViewDetailsModal(donation)}
                                    disabled={requestedDonations.has(donation.id) || donation.status === 'requested'}
                                    className={`w-full py-2 rounded-lg font-medium transition-colors ${
                                        requestedDonations.has(donation.id) || donation.status === 'requested'
                                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                            : 'bg-green-600 text-white hover:bg-green-700'
                                    }`}
                                >
                                    {requestedDonations.has(donation.id) || donation.status === 'requested' ? 'Requested' : 'Request Donation'}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Donation Details Modal */}
            {viewDetailsModal && (
                <div className="fixed inset-0 backdrop-blur-md bg-black/30 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        {/* Modal Header */}
                        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
                            <h2 className="text-2xl font-bold text-gray-800">Donation Details</h2>
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
                                        src={`http://localhost:8080${viewDetailsModal.photo}`}
                                        alt={viewDetailsModal.title}
                                        className="w-full h-64 object-cover"
                                        onError={(e) => { e.target.src = 'https://via.placeholder.com/400x300?text=No+Image'; }}
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
                                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                                        {viewDetailsModal.type || 'Veg'}
                                    </span>
                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                        viewDetailsModal.status === 'approved' ? 'bg-blue-100 text-blue-700' :
                                        viewDetailsModal.status === 'requested' ? 'bg-yellow-100 text-yellow-700' :
                                        'bg-gray-100 text-gray-700'
                                    }`}>
                                        {viewDetailsModal.status?.toUpperCase() || 'AVAILABLE'}
                                    </span>
                                </div>

                                {/* Title */}
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-500 mb-1">Title</h3>
                                    <p className="text-lg font-bold text-gray-800">{viewDetailsModal.title}</p>
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
                                        <Calendar className="w-5 h-5 text-green-600" />
                                        <span>{new Date(viewDetailsModal.createdAt).toLocaleDateString()}</span>
                                    </div>
                                </div>

                                {/* Distance if location available */}
                                {viewDetailsModal.latitude && viewDetailsModal.longitude && userLocation && (
                                    <div>
                                        <h3 className="text-sm font-semibold text-gray-500 mb-1">Distance</h3>
                                        <p className="text-gray-700">
                                            {calculateDistance(userLocation.latitude, userLocation.longitude, viewDetailsModal.latitude, viewDetailsModal.longitude).toFixed(1)} km away
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Action Buttons */}
                            <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t">
                                <button
                                    onClick={() => openLiveLocation(viewDetailsModal.latitude, viewDetailsModal.longitude, viewDetailsModal.address || viewDetailsModal.location)}
                                    className="py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                                >
                                    <Navigation className="w-5 h-5" />
                                    View Location
                                </button>
                                <button
                                    onClick={() => handleRequestDonation(viewDetailsModal.id)}
                                    disabled={requestedDonations.has(viewDetailsModal.id) || viewDetailsModal.status === 'requested'}
                                    className={`py-3 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2 ${
                                        requestedDonations.has(viewDetailsModal.id) || viewDetailsModal.status === 'requested'
                                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                            : 'bg-green-600 text-white hover:bg-green-700'
                                    }`}
                                >
                                    {requestedDonations.has(viewDetailsModal.id) || viewDetailsModal.status === 'requested' ? 'Requested' : 'Request Donation'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DonationFeed;
