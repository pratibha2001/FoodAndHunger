import React, { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import toast from 'react-hot-toast';

const ManageDonors = () => {
    const { publicAxiosInstance } = useOutletContext();
    const [donors, setDonors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedDonor, setSelectedDonor] = useState(null);

    useEffect(() => {
        fetchDonors();
    }, []);

    const fetchDonors = async () => {
        try {
            const response = await publicAxiosInstance.get('admin/donors');
            setDonors(response.data);
        } catch (error) {
            console.error('Error fetching donors:', error);
            toast.error('Failed to load donors');
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (id, newStatus) => {
        try {
            await publicAxiosInstance.put(`admin/donors/${id}/status`, { status: newStatus });
            toast.success(`Donor ${newStatus} successfully`);
            fetchDonors();
            if (selectedDonor && selectedDonor.id === id) {
                setSelectedDonor({ ...selectedDonor, status: newStatus });
            }
        } catch (error) {
            console.error('Error updating status:', error);
            toast.error('Failed to update status');
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">Manage Donors</h2>
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
                        {donors.map((donor) => (
                            <tr key={donor.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => setSelectedDonor(donor)}>
                                <td className="px-6 py-4 whitespace-nowrap">{donor.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{donor.email}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{donor.phone}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {donor.location}
                                    {donor.latitude && donor.longitude && (
                                        <a
                                            href={`https://www.google.com/maps/search/?api=1&query=${donor.latitude},${donor.longitude}`}
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
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${donor.status === 'verified' ? 'bg-green-100 text-green-800' :
                                            donor.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                                'bg-yellow-100 text-yellow-800'
                                        }`}>
                                        {donor.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <button
                                        onClick={(e) => { e.stopPropagation(); setSelectedDonor(donor); }}
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
            {selectedDonor && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50">
                    <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-2xl font-bold text-gray-900">Donor Details</h3>
                            <button
                                onClick={() => setSelectedDonor(null)}
                                className="text-gray-500 hover:text-gray-700 text-xl font-bold"
                            >
                                &times;
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <h4 className="text-lg font-semibold mb-2 border-b pb-1">Personal Info</h4>
                                <p><strong>Name:</strong> {selectedDonor.name}</p>
                                <p><strong>Age:</strong> {selectedDonor.age}</p>
                                <p><strong>Email:</strong> {selectedDonor.email}</p>
                                <p><strong>Phone:</strong> {selectedDonor.phone}</p>
                                <p><strong>Address:</strong> {selectedDonor.address}</p>
                                <p><strong>Location:</strong> {selectedDonor.location}</p>
                                <p><strong>Status:</strong> {selectedDonor.status}</p>
                            </div>

                            <div>
                                <h4 className="text-lg font-semibold mb-2 border-b pb-1">Organization Info</h4>
                                <p><strong>Org Name:</strong> {selectedDonor.organizationName}</p>
                                <p><strong>PAN:</strong> {selectedDonor.pan}</p>
                                <p><strong>Aadhaar:</strong> {selectedDonor.aadhaar}</p>
                            </div>
                        </div>

                        <div className="mt-6">
                            <h4 className="text-lg font-semibold mb-4 border-b pb-1">Documents & Photos</h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {selectedDonor.photo && (
                                    <div className="border p-2 rounded">
                                        <p className="text-sm font-medium mb-2">Photo</p>
                                        <img src={`http://localhost:8080${selectedDonor.photo}`} alt="Donor" className="w-full h-48 object-cover rounded" />
                                    </div>
                                )}
                                {selectedDonor.signature && (
                                    <div className="border p-2 rounded">
                                        <p className="text-sm font-medium mb-2">Signature</p>
                                        <img src={`http://localhost:8080${selectedDonor.signature}`} alt="Signature" className="w-full h-48 object-contain rounded" />
                                    </div>
                                )}
                                {selectedDonor.organizationCertificate && (
                                    <div className="border p-2 rounded">
                                        <p className="text-sm font-medium mb-2">Certificate</p>
                                        {selectedDonor.organizationCertificate.endsWith('.pdf') ? (
                                            <a
                                                href={`http://localhost:8080${selectedDonor.organizationCertificate}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-blue-500 hover:underline block mt-10 text-center"
                                            >
                                                View PDF
                                            </a>
                                        ) : (
                                            <img src={`http://localhost:8080${selectedDonor.organizationCertificate}`} alt="Certificate" className="w-full h-48 object-contain rounded" />
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="mt-8 flex justify-end space-x-4">
                            {selectedDonor.status === 'pending' && (
                                <>
                                    <button
                                        onClick={() => updateStatus(selectedDonor.id, 'verified')}
                                        className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                                    >
                                        Verify
                                    </button>
                                    <button
                                        onClick={() => updateStatus(selectedDonor.id, 'rejected')}
                                        className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                                    >
                                        Reject
                                    </button>
                                </>
                            )}
                            <button
                                onClick={() => setSelectedDonor(null)}
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

export default ManageDonors;
