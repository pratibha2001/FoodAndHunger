import React, { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import toast from 'react-hot-toast';

const ManageDonations = () => {
    const { publicAxiosInstance } = useOutletContext();
    const [donations, setDonations] = useState([]);
    const [loading, setLoading] = useState(true);

    const [selectedDonation, setSelectedDonation] = useState(null);

    useEffect(() => {
        fetchDonations();
    }, []);

    const fetchDonations = async () => {
        try {
            const response = await publicAxiosInstance.get('admin/donations');
            setDonations(response.data);
        } catch (error) {
            console.error('Error fetching donations:', error);
            toast.error('Failed to load donations');
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (id, newStatus) => {
        try {
            await publicAxiosInstance.put(`admin/donations/${id}/status`, { status: newStatus });
            toast.success(`Donation ${newStatus} successfully`);
            fetchDonations();
            if (selectedDonation && selectedDonation.id === id) {
                setSelectedDonation({ ...selectedDonation, status: newStatus });
            }
        } catch (error) {
            console.error('Error updating status:', error);
            toast.error('Failed to update status');
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">Manage Donations</h2>
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
                        {donations.map((donation) => (
                            <tr key={donation.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => setSelectedDonation(donation)}>
                                <td className="px-6 py-4 whitespace-nowrap">{donation.title}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {donation.location}
                                    {donation.latitude && donation.longitude && (
                                        <a
                                            href={`https://www.google.com/maps/search/?api=1&query=${donation.latitude},${donation.longitude}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="ml-2 text-blue-500 hover:underline text-xs"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            (Map)
                                        </a>
                                    )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">{donation.type}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${donation.status === 'approved' ? 'bg-green-100 text-green-800' :
                                        donation.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                            'bg-yellow-100 text-yellow-800'
                                        }`}>
                                        {donation.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <button
                                        onClick={(e) => { e.stopPropagation(); setSelectedDonation(donation); }}
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
            {selectedDonation && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50">
                    <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-2xl">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-2xl font-bold text-gray-900">Donation Details</h3>
                            <button
                                onClick={() => setSelectedDonation(null)}
                                className="text-gray-500 hover:text-gray-700 text-xl font-bold"
                            >
                                &times;
                            </button>
                        </div>

                        <div className="space-y-4">
                            <p><strong>Title:</strong> {selectedDonation.title}</p>
                            <p><strong>Description:</strong> {selectedDonation.description}</p>
                            <p><strong>Type:</strong> {selectedDonation.type}</p>
                            <p><strong>Location:</strong> {selectedDonation.location}</p>
                            <p><strong>Address:</strong> {selectedDonation.address}</p>
                            <p><strong>Status:</strong> {selectedDonation.status}</p>

                            {selectedDonation.photo && (
                                <div className="mt-4">
                                    <p className="font-semibold mb-2">Photo:</p>
                                    <img src={`http://localhost:8080${selectedDonation.photo}`} alt="Donation" className="w-full h-64 object-cover rounded" />
                                </div>
                            )}
                        </div>

                        <div className="mt-8 flex justify-end space-x-4">
                            {selectedDonation.status === 'pending' && (
                                <>
                                    <button
                                        onClick={() => updateStatus(selectedDonation.id, 'approved')}
                                        className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                                    >
                                        Approve
                                    </button>
                                    <button
                                        onClick={() => updateStatus(selectedDonation.id, 'rejected')}
                                        className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                                    >
                                        Reject
                                    </button>
                                </>
                            )}
                            <button
                                onClick={() => setSelectedDonation(null)}
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

export default ManageDonations;
