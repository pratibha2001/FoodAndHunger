    import React, { useState, useEffect } from 'react';
import { Package, Calendar, MapPin, Eye, X, Navigation, Clock, AlertCircle, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const OrderDetails = ({ axios, donorId }) => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewDetailsModal, setViewDetailsModal] = useState(null);

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                // Fetch donor's own donations
                const donationsRes = await axios.get(`/donation/donor/${donorId}`);
                
                // Fetch all requests to find ones donor donated to
                const requestsRes = await axios.get('/request/all');
                
                // Filter donations and requests with custom statuses or out_for_delivery/completed
                const standardStatuses = ['pending', 'approved', 'rejected', 'requested', 'readytodonate'];
                
                // Include donations with non-standard statuses OR out_for_delivery (exclude completed - they go to main list)
                const donorDonations = donationsRes.data.filter(d => 
                    (!standardStatuses.includes(d.status?.toLowerCase()) && d.status !== 'completed') ||
                    d.status === 'out_for_delivery'
                );
                
                // Filter requests with out_for_delivery or completed status (these are requests donor donated to)
                const donorRequests = requestsRes.data.filter(r => 
                    r.status === 'out_for_delivery' || r.status === 'completed'
                );
                
                // Combine both and mark type
                const allOrders = [
                    ...donorDonations.map(d => ({ ...d, orderType: 'donation' })),
                    ...donorRequests.map(r => ({ ...r, orderType: 'request' }))
                ].sort((a, b) => {
                    const dateA = new Date(a.updatedAt || a.createdAt);
                    const dateB = new Date(b.updatedAt || b.createdAt);
                    return dateB - dateA;
                });
                
                setOrders(allOrders);
            } catch (error) {
                console.error("Error fetching order details:", error);
                toast.error("Failed to load order details");
            } finally {
                setLoading(false);
            }
        };

        if (donorId) {
            fetchOrders();
        }
    }, [donorId]);

    if (loading) return <div className="text-center py-8">Loading order details...</div>;

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-800">Order Details</h2>
                <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg">
                    <Package className="w-4 h-4" />
                    <span className="font-medium">{orders.length} Orders</span>
                </div>
            </div>

            {orders.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                    <Package className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-500">No custom orders found.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {orders.map((order) => (
                        <div key={order.id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden border border-gray-200">
                            <div className="relative h-48 overflow-hidden">
                                {order.photo ? (
                                    <img
                                        src={`http://localhost:8080${order.photo}`}
                                        alt={order.title}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                                        <Package className="w-16 h-16 text-blue-500" />
                                    </div>
                                )}
                                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs font-semibold text-gray-700 shadow-lg">
                                    {order.status || 'Processing'}
                                </div>
                            </div>

                            <div className="p-5">
                                <h3 className="font-bold text-lg text-gray-800 mb-2 line-clamp-1">{order.title}</h3>
                                <p className="text-sm text-gray-600 mb-4 line-clamp-2">{order.description}</p>

                                <div className="space-y-2 mb-4">
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <Calendar className="w-4 h-4 text-blue-500" />
                                        <span>{formatDate(order.donationDate || order.requestDate)}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <Clock className="w-4 h-4 text-blue-500" />
                                        <span>Quantity: {order.quantity}</span>
                                    </div>
                                    {order.address && (
                                        <div className="flex items-start gap-2 text-sm text-gray-600">
                                            <MapPin className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
                                            <span className="line-clamp-1">{order.address}</span>
                                        </div>
                                    )}
                                    <div className="flex items-center gap-2 text-sm">
                                        <Package className="w-4 h-4 text-blue-500" />
                                        <span className="font-medium text-gray-700">
                                            {order.orderType === 'donation' ? 'Donation' : 'Request'}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setViewDetailsModal(order)}
                                        disabled={order.status === 'completed'}
                                        className={`flex-1 py-2 px-4 rounded-lg transition-colors text-sm font-medium flex items-center justify-center gap-2 ${
                                            order.status === 'completed'
                                                ? 'bg-gray-100 text-gray-600 cursor-not-allowed'
                                                : 'bg-blue-600 text-white hover:bg-blue-700'
                                        }`}
                                    >
                                        {order.status === 'completed' ? (
                                            <><CheckCircle className="w-4 h-4" /> Completed</>
                                        ) : (
                                            <><Eye className="w-4 h-4" /> View Details</>
                                        )}
                                    </button>
                                    {order.latitude && order.longitude && (
                                        <button
                                            onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${order.latitude},${order.longitude}`, "_blank")}
                                            className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                                        >
                                            <Navigation className="w-5 h-5" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* View Details Modal */}
            {viewDetailsModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-white border-b p-6 flex items-center justify-between z-10">
                            <h3 className="text-2xl font-bold text-gray-800">Order Details</h3>
                            <button
                                onClick={() => setViewDetailsModal(null)}
                                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                            >
                                <X className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            {viewDetailsModal.photo && (
                                <img
                                    src={`http://localhost:8080${viewDetailsModal.photo}`}
                                    alt={viewDetailsModal.title}
                                    className="w-full h-64 object-cover rounded-xl"
                                />
                            )}

                            <div>
                                <h4 className="font-bold text-xl text-gray-800 mb-2">{viewDetailsModal.title}</h4>
                                <p className="text-gray-600">{viewDetailsModal.description}</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-xl">
                                <div>
                                    <p className="text-sm text-gray-500 mb-1">Status</p>
                                    <p className="font-semibold text-gray-800">{viewDetailsModal.status || 'Processing'}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 mb-1">Quantity</p>
                                    <p className="font-semibold text-gray-800">{viewDetailsModal.quantity}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 mb-1">Date</p>
                                    <p className="font-semibold text-gray-800">{formatDate(viewDetailsModal.donationDate || viewDetailsModal.requestDate)}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 mb-1">{viewDetailsModal.orderType === 'donation' ? 'Expiry' : 'Type'}</p>
                                    <p className="font-semibold text-gray-800">{viewDetailsModal.orderType === 'donation' ? formatDate(viewDetailsModal.expiryDate) : 'Request'}</p>
                                </div>
                            </div>

                            {viewDetailsModal.address && (
                                <div>
                                    <p className="text-sm text-gray-500 mb-2">Pickup Location</p>
                                    <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg">
                                        <MapPin className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
                                        <p className="text-gray-700">{viewDetailsModal.address}</p>
                                    </div>
                                    {viewDetailsModal.latitude && viewDetailsModal.longitude && (
                                        <button
                                            onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${viewDetailsModal.latitude},${viewDetailsModal.longitude}`, "_blank")}
                                            className="mt-3 w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-2"
                                        >
                                            <Navigation className="w-4 h-4" /> Get Directions
                                        </button>
                                    )}
                                </div>
                            )}

                            {viewDetailsModal.remarks && (
                                <div>
                                    <p className="text-sm text-gray-500 mb-2">Remarks</p>
                                    <p className="text-gray-700 bg-yellow-50 p-3 rounded-lg">{viewDetailsModal.remarks}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OrderDetails;
