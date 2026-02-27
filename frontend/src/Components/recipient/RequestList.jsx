import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, MapPin, Utensils, Clock, CheckCircle, AlertCircle, Users, Eye, X, Navigation, Calendar, Package, Ban, MessageSquare, Gift } from 'lucide-react';
import RequestForm from './RequestForm';

import toast from 'react-hot-toast';

const RequestList = ({ recipientId, axios, recipientProfile }) => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingRequest, setEditingRequest] = useState(null);
    const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0, rejected: 0, requested: 0, donated: 0, completed: 0 });
    const [viewDetailsModal, setViewDetailsModal] = useState(null);
    const [activeFilter, setActiveFilter] = useState('all');

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    const openLiveLocation = (lat, lon, address) => {
        if (lat && lon) {
            window.open(`https://www.google.com/maps?q=${lat},${lon}`, '_blank');
        } else if (address) {
            window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`, '_blank');
        } else {
            alert('Location information not available');
        }
    };

    const fetchRequests = async () => {
        try {
            const res = await axios.get(`/request/recipient/${recipientId}`);
            const standardStatuses = ['pending', 'approved', 'rejected', 'requested', 'readytodonate', 'completed'];
            const requestData = res.data.filter(r => 
                !r.status || standardStatuses.includes(r.status.toLowerCase())
            );
            setRequests(requestData);

            // Calculate statistics
            const calculatedStats = {
                total: requestData.length,
                pending: requestData.filter(r => r.status === 'pending' || !r.status).length,
                approved: requestData.filter(r => r.status === 'approved').length,
                rejected: requestData.filter(r => r.status === 'rejected').length,
                requested: requestData.filter(r => r.status === 'requested').length,
                donated: requestData.filter(r => r.status === 'readytodonate').length,
                completed: requestData.filter(r => r.status === 'completed').length
            };
            setStats(calculatedStats);
        } catch (error) {
            console.error("Error fetching requests:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, [recipientId]);

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this request?")) {
            try {
                await axios.delete(`/request/delete/${id}`);
                fetchRequests();
            } catch (error) {
                console.error("Error deleting request:", error);
                alert("Failed to delete request");
            }
        }
    };

    const handleEdit = (request) => {
        setEditingRequest(request);
        setIsFormOpen(true);
    };

    const handleAddNew = () => {
        if (recipientProfile) {
            if (recipientProfile.status !== 'verified') {
                toast.error("Your account must be verified to add requests.");
                return;
            }
            if (!recipientProfile.photo) {
                toast.error("Please upload your profile photo to add requests.");
                return;
            }
            if (recipientProfile.organizationName && !recipientProfile.organizationCertificate) {
                toast.error("Please upload your organization certificate to add requests.");
                return;
            }
        }
        setEditingRequest(null);
        setIsFormOpen(true);
    };

    const handleFormClose = () => {
        setIsFormOpen(false);
        setEditingRequest(null);
    };

    const handleFormSuccess = () => {
        handleFormClose();
        fetchRequests();
    };

    if (loading) return <div className="text-center py-8">Loading requests...</div>;

    return (
        <div>
            {/* Statistics Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 mb-8">
                <div 
                    onClick={() => setActiveFilter('all')}
                    className={`bg-gradient-to-br from-blue-100 to-blue-50 rounded-xl p-4 border-2 cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 ${
                        activeFilter === 'all' ? 'border-blue-500 shadow-lg ring-2 ring-blue-200' : 'border-gray-200 hover:border-blue-300'
                    }`}
                >
                    <div className="flex flex-col items-center text-center space-y-3">
                        <div className="p-3 bg-blue-50 rounded-lg">
                            <Utensils className="w-7 h-7 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-600 font-medium mb-1">Total</p>
                            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                        </div>
                    </div>
                </div>

                <div 
                    onClick={() => setActiveFilter('pending')}
                    className={`bg-gradient-to-br from-yellow-100 to-yellow-50 rounded-xl p-4 border-2 cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 ${
                        activeFilter === 'pending' ? 'border-yellow-500 shadow-lg ring-2 ring-yellow-200' : 'border-gray-200 hover:border-yellow-300'
                    }`}
                >
                    <div className="flex flex-col items-center text-center space-y-3">
                        <div className="p-3 bg-yellow-50 rounded-lg">
                            <Clock className="w-7 h-7 text-yellow-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-600 font-medium mb-1">Pending</p>
                            <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
                        </div>
                    </div>
                </div>

                <div 
                    onClick={() => setActiveFilter('approved')}
                    className={`bg-gradient-to-br from-green-100 to-green-50 rounded-xl p-4 border-2 cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 ${
                        activeFilter === 'approved' ? 'border-green-500 shadow-lg ring-2 ring-green-200' : 'border-gray-200 hover:border-green-300'
                    }`}
                >
                    <div className="flex flex-col items-center text-center space-y-3">
                        <div className="p-3 bg-green-50 rounded-lg">
                            <CheckCircle className="w-7 h-7 text-green-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-600 font-medium mb-1">Approved</p>
                            <p className="text-2xl font-bold text-gray-900">{stats.approved}</p>
                        </div>
                    </div>
                </div>

                <div 
                    onClick={() => setActiveFilter('rejected')}
                    className={`bg-gradient-to-br from-red-100 to-red-50 rounded-xl p-4 border-2 cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 ${
                        activeFilter === 'rejected' ? 'border-red-500 shadow-lg ring-2 ring-red-200' : 'border-gray-200 hover:border-red-300'
                    }`}
                >
                    <div className="flex flex-col items-center text-center space-y-3">
                        <div className="p-3 bg-red-50 rounded-lg">
                            <Ban className="w-7 h-7 text-red-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-600 font-medium mb-1">Rejected</p>
                            <p className="text-2xl font-bold text-gray-900">{stats.rejected}</p>
                        </div>
                    </div>
                </div>

                <div 
                    onClick={() => setActiveFilter('donated')}
                    className={`bg-gradient-to-br from-orange-100 to-orange-50 rounded-xl p-4 border-2 cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 ${
                        activeFilter === 'donated' ? 'border-orange-500 shadow-lg ring-2 ring-orange-200' : 'border-gray-200 hover:border-orange-300'
                    }`}
                >
                    <div className="flex flex-col items-center text-center space-y-3">
                        <div className="p-3 bg-orange-50 rounded-lg">
                            <Gift className="w-7 h-7 text-orange-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-600 font-medium mb-1">Donated</p>
                            <p className="text-2xl font-bold text-gray-900">{stats.donated}</p>
                        </div>
                    </div>
                </div>

                <div 
                    onClick={() => setActiveFilter('completed')}
                    className={`bg-gradient-to-br from-purple-100 to-purple-50 rounded-xl p-4 border-2 cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 ${
                        activeFilter === 'completed' ? 'border-purple-500 shadow-lg ring-2 ring-purple-200' : 'border-gray-200 hover:border-purple-300'
                    }`}
                >
                    <div className="flex flex-col items-center text-center space-y-3">
                        <div className="p-3 bg-purple-50 rounded-lg">
                            <CheckCircle className="w-7 h-7 text-purple-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-600 font-medium mb-1">Completed</p>
                            <p className="text-2xl font-bold text-gray-900">{stats.completed}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-800">
                    My Requests {activeFilter !== 'all' && `(${activeFilter.charAt(0).toUpperCase() + activeFilter.slice(1)})`}
                </h2>
                <button
                    onClick={handleAddNew}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    Add Request
                </button>
            </div>

            {requests.filter(r => {
                if (activeFilter === 'all') return true;
                if (activeFilter === 'pending') return r.status === 'pending' || !r.status;
                if (activeFilter === 'donated') return r.status === 'readytodonate';
                return r.status === activeFilter;
            }).length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                    <p className="text-gray-500 mb-4">
                        {activeFilter === 'all' 
                            ? "You haven't made any requests yet."
                            : `No ${activeFilter} requests found.`
                        }
                    </p>
                    <button
                        onClick={handleAddNew}
                        className="text-green-600 font-medium hover:underline"
                    >
                        Make a request
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {requests.filter(r => {
                        if (activeFilter === 'all') return true;
                        if (activeFilter === 'pending') return r.status === 'pending' || !r.status;
                        if (activeFilter === 'donated') return r.status === 'readytodonate';
                        return r.status === activeFilter;
                    }).sort((a, b) => {
                        const dateA = new Date(a.updatedAt || a.createdAt);
                        const dateB = new Date(b.updatedAt || b.createdAt);
                        return dateB - dateA;
                    }).map((req) => (
                        <div key={req.id} className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden border border-orange-100 group">
                            <div className="relative h-48 overflow-hidden">
                                <img
                                    src={req.photo ? `http://localhost:8080${req.photo}` : "https://images.unsplash.com/photo-1488459716781-31db52582fe9?auto=format&fit=crop&q=80"}
                                    alt={req.title}
                                    className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                                    onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = "https://images.unsplash.com/photo-1488459716781-31db52582fe9?auto=format&fit=crop&q=80";
                                    }}
                                />
                                <div className="absolute top-3 right-3">
                                    <span className={`px-3 py-1 rounded-full text-xs font-medium shadow-sm ${
                                        req.type?.toLowerCase() === 'veg'
                                            ? 'bg-green-100 text-green-700 border border-green-200'
                                            : 'bg-orange-100 text-orange-700 border border-orange-200'
                                    } uppercase`}>
                                        {req.type || 'General'}
                                    </span>
                                </div>
                            </div>

                            <div className="p-5 space-y-4">
                                <div>
                                    <h3 className="text-xl font-bold text-gray-800 mb-1">{req.title}</h3>
                                    {recipientProfile && (
                                        <p className="text-sm font-medium text-orange-600 mb-2">
                                            By: {recipientProfile.organizationName || recipientProfile.name}
                                        </p>
                                    )}
                                    <p className="text-gray-500 text-sm line-clamp-2">{req.description}</p>
                                </div>

                                <div className="space-y-2 text-sm text-gray-600">
                                    <div className="flex items-start gap-2">
                                        <MapPin className={`w-4 h-4 ${req.status === 'approved' ? 'text-green-600' : 'text-orange-600'} mt-0.5 shrink-0`} />
                                        <span className="line-clamp-1">{req.address || req.location || "Address Available"}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Clock className={`w-4 h-4 ${req.status === 'approved' ? 'text-green-600' : 'text-orange-600'} shrink-0`} />
                                        <span>Added: {formatDate(req.createdAt)}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <AlertCircle className={`w-4 h-4 ${req.status === 'approved' ? 'text-green-600' : 'text-orange-600'} shrink-0`} />
                                        <span>Status: {req.status || "Active"}</span>
                                    </div>
                                </div>

                                <div className="pt-4 flex gap-3 border-t border-gray-100">
                                    {req.status === 'approved' ? (
                                        <>
                                            <button
                                                onClick={() => setViewDetailsModal(req)}
                                                className="flex-1 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors font-medium flex items-center justify-center gap-2"
                                            >
                                                <Eye className="w-4 h-4" />
                                                View Details
                                            </button>
                                            <button
                                                onClick={() => openLiveLocation(req.latitude, req.longitude, req.address || req.location)}
                                                className="p-2.5 rounded-xl bg-green-50 text-green-600 hover:bg-green-100 transition-colors border border-green-200"
                                                title="Track Location"
                                            >
                                                <Navigation className="w-5 h-5" />
                                            </button>
                                        </>
                                    ) : req.status === 'readytodonate' || req.status === 'completed' ? (
                                        <>
                                            <button
                                                onClick={() => setViewDetailsModal(req)}
                                                disabled={req.status === 'completed'}
                                                className={`flex-1 py-2.5 rounded-xl font-medium flex items-center justify-center gap-2 ${
                                                    req.status === 'completed'
                                                        ? 'bg-gray-100 text-gray-600 cursor-not-allowed'
                                                        : 'bg-orange-50 text-orange-700 hover:bg-orange-100 transition-colors'
                                                }`}
                                            >
                                                {req.status === 'completed' ? (
                                                    <><CheckCircle className="w-4 h-4" /> Completed</>
                                                ) : (
                                                    <><Eye className="w-4 h-4" /> View Details</>
                                                )}
                                            </button>
                                            <button
                                                onClick={() => openLiveLocation(req.latitude, req.longitude, req.address || req.location)}
                                                className="p-2.5 rounded-xl bg-orange-50 text-orange-600 hover:bg-orange-100 transition-colors border border-orange-200"
                                                title="Track Location"
                                            >
                                                <Navigation className="w-5 h-5" />
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <button
                                                onClick={() => handleEdit(req)}
                                                disabled={req.status === 'out_for_delivery'}
                                                className={`flex-1 py-2.5 px-4 rounded-xl font-medium text-sm transition-all duration-200 flex items-center justify-center gap-2 ${
                                                    req.status === 'out_for_delivery'
                                                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                        : 'bg-orange-600 text-white hover:bg-orange-700 shadow-lg shadow-orange-600/20'
                                                }`}
                                            >
                                                <Edit2 className="w-4 h-4" />
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDelete(req.id)}
                                                disabled={req.status === 'out_for_delivery'}
                                                className={`flex-1 py-2.5 px-4 rounded-xl font-medium text-sm transition-all duration-200 flex items-center justify-center gap-2 ${
                                                    req.status === 'out_for_delivery'
                                                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                        : 'bg-red-600 text-white hover:bg-red-700 shadow-lg shadow-red-600/20'
                                                }`}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                                Delete
                                            </button>
                                            <button
                                                onClick={() => openLiveLocation(req.latitude, req.longitude, req.address || req.location)}
                                                className="p-2.5 rounded-xl bg-orange-50 text-orange-600 hover:bg-orange-100 transition-colors border border-orange-200"
                                                title="Track Location"
                                            >
                                                <Navigation className="w-5 h-5" />
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {isFormOpen && (
                <RequestForm
                    isOpen={isFormOpen}
                    onClose={handleFormClose}
                    onSuccess={handleFormSuccess}
                    request={editingRequest}
                    recipientId={recipientId}
                    axios={axios}
                />
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
                            <div className="rounded-xl overflow-hidden cursor-pointer" onClick={() => window.open(viewDetailsModal.photo ? `http://localhost:8080${viewDetailsModal.photo}` : "https://images.unsplash.com/photo-1488459716781-31db52582fe9?auto=format&fit=crop&q=80", '_blank')}>
                                <img
                                    src={viewDetailsModal.photo ? `http://localhost:8080${viewDetailsModal.photo}` : "https://images.unsplash.com/photo-1488459716781-31db52582fe9?auto=format&fit=crop&q=80"}
                                    alt={viewDetailsModal.title}
                                    className="w-full h-64 object-cover hover:opacity-90 transition-opacity"
                                    onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = "https://images.unsplash.com/photo-1488459716781-31db52582fe9?auto=format&fit=crop&q=80";
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
                                            <span className="inline-block px-3 py-1 rounded-full text-sm font-medium bg-orange-100 text-orange-700 border border-orange-200 uppercase">
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
                                    <label className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Recipient</label>
                                    <p className="text-gray-700 mt-1 font-medium">
                                        {recipientProfile?.organizationName || recipientProfile?.name || 'N/A'}
                                    </p>
                                </div>

                                <div>
                                    <label className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Location</label>
                                    <div className="flex items-start gap-2 mt-1">
                                        <MapPin className="w-5 h-5 text-orange-600 mt-0.5 shrink-0" />
                                        <p className="text-gray-700">{viewDetailsModal.address || viewDetailsModal.location || 'Address Available'}</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Created Date</label>
                                        <div className="flex items-center gap-2 mt-1">
                                            <Calendar className="w-5 h-5 text-orange-600" />
                                            <p className="text-gray-700">{formatDate(viewDetailsModal.createdAt)}</p>
                                        </div>
                                    </div>

                                    {viewDetailsModal.expiryDate && (
                                        <div>
                                            <label className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Expiry Date</label>
                                            <div className="flex items-center gap-2 mt-1">
                                                <Clock className="w-5 h-5 text-orange-600" />
                                                <p className="text-gray-700">{formatDate(viewDetailsModal.expiryDate)}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {viewDetailsModal.amount && (
                                    <div>
                                        <label className="text-sm font-semibold text-gray-500 uppercase tracking-wide">People to Serve</label>
                                        <div className="flex items-center gap-2 mt-1">
                                            <Users className="w-5 h-5 text-orange-600" />
                                            <p className="text-gray-700 font-medium">{viewDetailsModal.amount} people</p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-3 pt-4 border-t">
                                <button
                                    onClick={() => openLiveLocation(viewDetailsModal.latitude, viewDetailsModal.longitude, viewDetailsModal.address || viewDetailsModal.location)}
                                    className="flex-1 py-3 px-4 rounded-xl font-medium text-sm transition-all duration-200 flex items-center justify-center gap-2 bg-orange-600 text-white hover:bg-orange-700 shadow-lg shadow-orange-600/20"
                                >
                                    <Navigation className="w-5 h-5" />
                                    View on Map
                                </button>
                                <button
                                    onClick={() => setViewDetailsModal(null)}
                                    className="flex-1 py-3 px-4 rounded-xl font-medium text-sm transition-all duration-200 flex items-center justify-center gap-2 bg-gray-100 text-gray-700 hover:bg-gray-200"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RequestList;
