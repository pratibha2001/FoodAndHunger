import React, { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import toast from 'react-hot-toast';

const ManageVolunteers = () => {
    const { publicAxiosInstance } = useOutletContext();
    const [volunteers, setVolunteers] = useState([]);
    const [loading, setLoading] = useState(true);

    const [selectedVolunteer, setSelectedVolunteer] = useState(null);

    useEffect(() => {
        fetchVolunteers();
    }, []);

    const fetchVolunteers = async () => {
        try {
            const response = await publicAxiosInstance.get('admin/volunteers');
            setVolunteers(response.data);
        } catch (error) {
            console.error('Error fetching volunteers:', error);
            toast.error('Failed to load volunteers');
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (id, newStatus) => {
        try {
            await publicAxiosInstance.put(`admin/volunteers/${id}/status`, { status: newStatus });
            toast.success(`Volunteer ${newStatus} successfully`);
            fetchVolunteers();
            if (selectedVolunteer && selectedVolunteer.id === id) {
                setSelectedVolunteer({ ...selectedVolunteer, status: newStatus });
            }
        } catch (error) {
            console.error('Error updating status:', error);
            toast.error('Failed to update status');
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">Manage Volunteers</h2>
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
                        {volunteers.map((volunteer) => (
                            <tr key={volunteer.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => setSelectedVolunteer(volunteer)}>
                                <td className="px-6 py-4 whitespace-nowrap">{volunteer.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{volunteer.email}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{volunteer.phone}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {volunteer.location}
                                    {volunteer.latitude && volunteer.longitude && (
                                        <a
                                            href={`https://www.google.com/maps/search/?api=1&query=${volunteer.latitude},${volunteer.longitude}`}
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
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${volunteer.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                                        volunteer.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                                            'bg-yellow-100 text-yellow-800'
                                        }`}>
                                        {volunteer.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <button
                                        onClick={(e) => { e.stopPropagation(); setSelectedVolunteer(volunteer); }}
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
            {selectedVolunteer && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50">
                    <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-2xl">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-2xl font-bold text-gray-900">Volunteer Details</h3>
                            <button
                                onClick={() => setSelectedVolunteer(null)}
                                className="text-gray-500 hover:text-gray-700 text-xl font-bold"
                            >
                                &times;
                            </button>
                        </div>

                        <div className="space-y-4">
                            <p><strong>Name:</strong> {selectedVolunteer.name}</p>
                            <p><strong>Email:</strong> {selectedVolunteer.email}</p>
                            <p><strong>Phone:</strong> {selectedVolunteer.phone}</p>
                            <p><strong>Address:</strong> {selectedVolunteer.address}</p>
                            <p><strong>Location:</strong> {selectedVolunteer.location}</p>
                            <p><strong>Availability:</strong> {selectedVolunteer.availability}</p>
                            <p><strong>Skills:</strong> {selectedVolunteer.skills}</p>
                            <p><strong>Reason:</strong> {selectedVolunteer.reason}</p>
                            <p><strong>Status:</strong> {selectedVolunteer.status}</p>

                            {selectedVolunteer.profilePhotoUrl && (
                                <div className="mt-4">
                                    <p className="font-semibold mb-2">Profile Photo:</p>
                                    <img src={`http://localhost:8080${selectedVolunteer.profilePhotoUrl}`} alt="Volunteer" className="w-full h-64 object-cover rounded" />
                                </div>
                            )}
                        </div>

                        <div className="mt-8 flex justify-end space-x-4">
                            {selectedVolunteer.status === 'PENDING' && (
                                <>
                                    <button
                                        onClick={() => updateStatus(selectedVolunteer.id, 'APPROVED')}
                                        className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                                    >
                                        Approve
                                    </button>
                                    <button
                                        onClick={() => updateStatus(selectedVolunteer.id, 'REJECTED')}
                                        className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                                    >
                                        Reject
                                    </button>
                                </>
                            )}
                            <button
                                onClick={() => setSelectedVolunteer(null)}
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

export default ManageVolunteers;
