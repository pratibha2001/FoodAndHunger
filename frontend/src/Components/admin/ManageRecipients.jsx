import React, { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import toast from 'react-hot-toast';

const ManageRecipients = () => {
    const { publicAxiosInstance } = useOutletContext();
    const [recipients, setRecipients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedRecipient, setSelectedRecipient] = useState(null);

    useEffect(() => {
        fetchRecipients();
    }, []);

    const fetchRecipients = async () => {
        try {
            const response = await publicAxiosInstance.get('admin/recipients');
            setRecipients(response.data);
        } catch (error) {
            console.error('Error fetching recipients:', error);
            toast.error('Failed to load recipients');
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (id, newStatus) => {
        try {
            await publicAxiosInstance.put(`admin/recipients/${id}/status`, { status: newStatus });
            toast.success(`Recipient ${newStatus} successfully`);
            fetchRecipients();
            if (selectedRecipient && selectedRecipient.id === id) {
                setSelectedRecipient({ ...selectedRecipient, status: newStatus });
            }
        } catch (error) {
            console.error('Error updating status:', error);
            toast.error('Failed to update status');
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">Manage Recipients</h2>
            <div className="bg-white shadow-md rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {recipients.map((recipient) => (
                            <tr key={recipient.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => setSelectedRecipient(recipient)}>
                                <td className="px-6 py-4 whitespace-nowrap">{recipient.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{recipient.email}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{recipient.phone}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {recipient.location}
                                    {recipient.latitude && recipient.longitude && (
                                        <a
                                            href={`https://www.google.com/maps/search/?api=1&query=${recipient.latitude},${recipient.longitude}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="ml-2 text-blue-500 hover:underline text-xs"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            (Map)
                                        </a>
                                    )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${recipient.status === 'verified' ? 'bg-green-100 text-green-800' :
                                            recipient.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                                'bg-yellow-100 text-yellow-800'
                                        }`}>
                                        {recipient.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <button
                                        onClick={(e) => { e.stopPropagation(); setSelectedRecipient(recipient); }}
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
            {selectedRecipient && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50">
                    <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-2xl font-bold text-gray-900">Recipient Details</h3>
                            <button
                                onClick={() => setSelectedRecipient(null)}
                                className="text-gray-500 hover:text-gray-700 text-xl font-bold"
                            >
                                &times;
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <h4 className="text-lg font-semibold mb-2 border-b pb-1">Personal Info</h4>
                                <p><strong>Name:</strong> {selectedRecipient.name}</p>
                                <p><strong>Age:</strong> {selectedRecipient.age}</p>
                                <p><strong>Email:</strong> {selectedRecipient.email}</p>
                                <p><strong>Phone:</strong> {selectedRecipient.phone}</p>
                                <p><strong>Address:</strong> {selectedRecipient.address}</p>
                                <p><strong>Location:</strong> {selectedRecipient.location}</p>
                                <p><strong>Status:</strong> {selectedRecipient.status}</p>
                            </div>

                            <div>
                                <h4 className="text-lg font-semibold mb-2 border-b pb-1">Organization Info</h4>
                                <p><strong>Org Name:</strong> {selectedRecipient.organizationName}</p>
                                <p><strong>PAN:</strong> {selectedRecipient.pan}</p>
                                <p><strong>Aadhaar:</strong> {selectedRecipient.aadhaar}</p>
                            </div>
                        </div>

                        <div className="mt-6">
                            <h4 className="text-lg font-semibold mb-4 border-b pb-1">Documents & Photos</h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {selectedRecipient.photo && (
                                    <div className="border p-2 rounded">
                                        <p className="text-sm font-medium mb-2">Photo</p>
                                        <img src={`http://localhost:8080${selectedRecipient.photo}`} alt="Recipient" className="w-full h-48 object-cover rounded" />
                                    </div>
                                )}
                                {selectedRecipient.signature && (
                                    <div className="border p-2 rounded">
                                        <p className="text-sm font-medium mb-2">Signature</p>
                                        <img src={`http://localhost:8080${selectedRecipient.signature}`} alt="Signature" className="w-full h-48 object-contain rounded" />
                                    </div>
                                )}
                                {selectedRecipient.organizationCertificate && (
                                    <div className="border p-2 rounded">
                                        <p className="text-sm font-medium mb-2">Certificate</p>
                                        {selectedRecipient.organizationCertificate.endsWith('.pdf') ? (
                                            <a
                                                href={`http://localhost:8080${selectedRecipient.organizationCertificate}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-blue-500 hover:underline block mt-10 text-center"
                                            >
                                                View PDF
                                            </a>
                                        ) : (
                                            <img src={`http://localhost:8080${selectedRecipient.organizationCertificate}`} alt="Certificate" className="w-full h-48 object-contain rounded" />
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="mt-8 flex justify-end space-x-4">
                            {selectedRecipient.status === 'pending' && (
                                <>
                                    <button
                                        onClick={() => updateStatus(selectedRecipient.id, 'verified')}
                                        className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                                    >
                                        Verify
                                    </button>
                                    <button
                                        onClick={() => updateStatus(selectedRecipient.id, 'rejected')}
                                        className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                                    >
                                        Reject
                                    </button>
                                </>
                            )}
                            <button
                                onClick={() => setSelectedRecipient(null)}
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

export default ManageRecipients;
