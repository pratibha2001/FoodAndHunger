import React, { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import toast from 'react-hot-toast';

const ManageRequests = () => {
    const { publicAxiosInstance } = useOutletContext();
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);

    const [selectedRequest, setSelectedRequest] = useState(null);

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        try {
            const response = await publicAxiosInstance.get('admin/requests');
            setRequests(response.data);
        } catch (error) {
            console.error('Error fetching requests:', error);
            toast.error('Failed to load requests');
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (id, newStatus) => {
        try {
            await publicAxiosInstance.put(`admin/requests/${id}/status`, { status: newStatus });
            toast.success(`Request ${newStatus} successfully`);
            fetchRequests();
            if (selectedRequest && selectedRequest.id === id) {
                setSelectedRequest({ ...selectedRequest, status: newStatus });
            }
        } catch (error) {
            console.error('Error updating status:', error);
            toast.error('Failed to update status');
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">Manage Requests</h2>
            <div className="bg-white shadow-md rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {requests.map((request) => (
                            <tr key={request.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => setSelectedRequest(request)}>
                                <td className="px-6 py-4 whitespace-nowrap">{request.title}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {request.location}
                                    {request.latitude && request.longitude && (
                                        <a
                                            href={`https://www.google.com/maps/search/?api=1&query=${request.latitude},${request.longitude}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="ml-2 text-blue-500 hover:underline text-xs"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            (Map)
                                        </a>
                                    )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">{request.type}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${request.status === 'approved' ? 'bg-green-100 text-green-800' :
                                        request.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                            'bg-yellow-100 text-yellow-800'
                                        }`}>
                                        {request.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <button
                                        onClick={(e) => { e.stopPropagation(); setSelectedRequest(request); }}
                                        className="text-blue-600 hover:text-blue-900 mr-4"
                                    >
                                        View
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Detail Modal */}
            {selectedRequest && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50">
                    <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-2xl">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-2xl font-bold text-gray-900">Request Details</h3>
                            <button
                                onClick={() => setSelectedRequest(null)}
                                className="text-gray-500 hover:text-gray-700 text-xl font-bold"
                            >
                                &times;
                            </button>
                        </div>

                        <div className="space-y-4">
                            <p><strong>Title:</strong> {selectedRequest.title}</p>
                            <p><strong>Description:</strong> {selectedRequest.description}</p>
                            <p><strong>Amount:</strong> {selectedRequest.amount}</p>
                            <p><strong>Type:</strong> {selectedRequest.type}</p>
                            <p><strong>Location:</strong> {selectedRequest.location}</p>
                            <p><strong>Address:</strong> {selectedRequest.address}</p>
                            <p><strong>Status:</strong> {selectedRequest.status}</p>

                            {selectedRequest.photo && (
                                <div className="mt-4">
                                    <p className="font-semibold mb-2">Photo:</p>
                                    <img src={`http://localhost:8080${selectedRequest.photo}`} alt="Request" className="w-full h-64 object-cover rounded" />
                                </div>
                            )}
                        </div>

                        <div className="mt-8 flex justify-end space-x-4">
                            {selectedRequest.status === 'pending' && (
                                <>
                                    <button
                                        onClick={() => updateStatus(selectedRequest.id, 'approved')}
                                        className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                                    >
                                        Approve
                                    </button>
                                    <button
                                        onClick={() => updateStatus(selectedRequest.id, 'rejected')}
                                        className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                                    >
                                        Reject
                                    </button>
                                </>
                            )}
                            <button
                                onClick={() => setSelectedRequest(null)}
                                className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageRequests;
