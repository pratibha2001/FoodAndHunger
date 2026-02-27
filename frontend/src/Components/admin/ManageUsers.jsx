import React, { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import toast from 'react-hot-toast';

const ManageUsers = () => {
    const { publicAxiosInstance } = useOutletContext();
    const [activeTab, setActiveTab] = useState('donors'); // 'donors', 'recipients', 'volunteers', 'all'
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedUser, setSelectedUser] = useState(null);

    // Pagination state for 'all' users
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const pageSize = 10;

    useEffect(() => {
        fetchData();
    }, [activeTab, page]);

    const fetchData = async () => {
        setLoading(true);
        try {
            let endpoint = '';
            if (activeTab === 'donors') endpoint = 'admin/donors';
            else if (activeTab === 'recipients') endpoint = 'admin/recipients';
            else if (activeTab === 'volunteers') endpoint = 'admin/volunteers';
            else if (activeTab === 'all') endpoint = `auth/user/all?page=${page}&size=${pageSize}`;

            const response = await publicAxiosInstance.get(endpoint);

            if (activeTab === 'all') {
                setData(response.data.content);
                setTotalPages(response.data.totalPages);
            } else {
                setData(response.data);
            }
        } catch (error) {
            console.error(`Error fetching ${activeTab}:`, error);
            toast.error(`Failed to load ${activeTab}`);
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (id, newStatus) => {
        try {
            let endpoint = '';
            if (activeTab === 'donors') endpoint = `admin/donors/${id}/status`;
            else if (activeTab === 'recipients') endpoint = `admin/recipients/${id}/status`;
            else if (activeTab === 'volunteers') endpoint = `admin/volunteers/${id}/status`;

            if (endpoint) {
                await publicAxiosInstance.put(endpoint, { status: newStatus });
                toast.success(`User ${newStatus} successfully`);
                fetchData();
                if (selectedUser && selectedUser.id === id) {
                    setSelectedUser({ ...selectedUser, status: newStatus });
                }
            }
        } catch (error) {
            console.error('Error updating status:', error);
            toast.error('Failed to update status');
        }
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 0 && newPage < totalPages) {
            setPage(newPage);
        }
    };

    return (
        <div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">Manage Users</h2>

            {/* Tabs */}
            <div className="flex border-b border-gray-200 mb-6 overflow-x-auto">
                {['donors', 'recipients', 'volunteers', 'all'].map((tab) => (
                    <button
                        key={tab}
                        className={`py-2 px-4 font-medium text-sm focus:outline-none capitalize ${activeTab === tab ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                        onClick={() => { setActiveTab(tab); setPage(0); }}
                    >
                        {tab === 'all' ? 'All Users' : tab}
                    </button>
                ))}
            </div>

            {loading ? (
                <div>Loading...</div>
            ) : (
                <div className="bg-white shadow-md rounded-lg overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name/Username</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                {activeTab !== 'all' && <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>}
                                {activeTab !== 'all' && <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>}
                                {activeTab === 'all' && <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>}
                                {activeTab !== 'all' && <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>}
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {data.map((user) => (
                                <tr key={user.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => setSelectedUser(user)}>
                                    <td className="px-6 py-4 whitespace-nowrap">{user.name || user.username}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">{user.email}</td>
                                    {activeTab !== 'all' && <td className="px-6 py-4 whitespace-nowrap">{user.phone}</td>}
                                    {activeTab !== 'all' && (
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {user.location}
                                            {user.latitude && user.longitude && (
                                                <a
                                                    href={`https://www.google.com/maps/search/?api=1&query=${user.latitude},${user.longitude}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="ml-2 text-blue-500 hover:underline text-xs"
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    (Map)
                                                </a>
                                            )}
                                        </td>
                                    )}
                                    {activeTab === 'all' && <td className="px-6 py-4 whitespace-nowrap">{user.role}</td>}
                                    {activeTab !== 'all' && (
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${(user.status === 'verified' || user.status === 'APPROVED') ? 'bg-green-100 text-green-800' :
                                                    (user.status === 'rejected' || user.status === 'REJECTED') ? 'bg-red-100 text-red-800' :
                                                        'bg-yellow-100 text-yellow-800'
                                                }`}>
                                                {user.status}
                                            </span>
                                        </td>
                                    )}
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <button
                                            onClick={(e) => { e.stopPropagation(); setSelectedUser(user); }}
                                            className="text-blue-600 hover:text-blue-900 mr-4"
                                        >
                                            View
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* Pagination Controls for 'all' tab */}
                    {activeTab === 'all' && (
                        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                            <div className="flex-1 flex justify-between sm:hidden">
                                <button
                                    onClick={() => handlePageChange(page - 1)}
                                    disabled={page === 0}
                                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                                >
                                    Previous
                                </button>
                                <button
                                    onClick={() => handlePageChange(page + 1)}
                                    disabled={page >= totalPages - 1}
                                    className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                                >
                                    Next
                                </button>
                            </div>
                            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                                <div>
                                    <p className="text-sm text-gray-700">
                                        Showing page <span className="font-medium">{page + 1}</span> of <span className="font-medium">{totalPages}</span>
                                    </p>
                                </div>
                                <div>
                                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                                        <button
                                            onClick={() => handlePageChange(page - 1)}
                                            disabled={page === 0}
                                            className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                                        >
                                            Previous
                                        </button>
                                        <button
                                            onClick={() => handlePageChange(page + 1)}
                                            disabled={page >= totalPages - 1}
                                            className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                                        >
                                            Next
                                        </button>
                                    </nav>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Detail Modal */}
            {selectedUser && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50">
                    <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-2xl font-bold text-gray-900 capitalize">{activeTab === 'all' ? 'User' : activeTab.slice(0, -1)} Details</h3>
                            <button
                                onClick={() => setSelectedUser(null)}
                                className="text-gray-500 hover:text-gray-700 text-xl font-bold"
                            >
                                &times;
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <h4 className="text-lg font-semibold mb-2 border-b pb-1">Personal Info</h4>
                                <p><strong>Name/Username:</strong> {selectedUser.name || selectedUser.username}</p>
                                <p><strong>Email:</strong> {selectedUser.email}</p>
                                {activeTab !== 'all' && (
                                    <>
                                        <p><strong>Phone:</strong> {selectedUser.phone}</p>
                                        <p><strong>Address:</strong> {selectedUser.address}</p>
                                        <p><strong>Location:</strong> {selectedUser.location}</p>
                                        <p><strong>Status:</strong> {selectedUser.status}</p>
                                    </>
                                )}
                                {activeTab === 'all' && <p><strong>Role:</strong> {selectedUser.role}</p>}
                            </div>

                            {activeTab !== 'all' && activeTab !== 'volunteers' && (
                                <div>
                                    <h4 className="text-lg font-semibold mb-2 border-b pb-1">Organization Info</h4>
                                    <p><strong>Org Name:</strong> {selectedUser.organizationName}</p>
                                    <p><strong>PAN:</strong> {selectedUser.pan}</p>
                                    <p><strong>Aadhaar:</strong> {selectedUser.aadhaar}</p>
                                </div>
                            )}
                            {activeTab === 'volunteers' && (
                                <div>
                                    <h4 className="text-lg font-semibold mb-2 border-b pb-1">Volunteer Info</h4>
                                    <p><strong>Availability:</strong> {selectedUser.availability}</p>
                                    <p><strong>Skills:</strong> {selectedUser.skills}</p>
                                    <p><strong>Reason:</strong> {selectedUser.reason}</p>
                                </div>
                            )}
                        </div>

                        {activeTab !== 'all' && (
                            <div className="mt-6">
                                <h4 className="text-lg font-semibold mb-4 border-b pb-1">Documents & Photos</h4>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {(selectedUser.photo || selectedUser.profilePhotoUrl) && (
                                        <div className="border p-2 rounded">
                                            <p className="text-sm font-medium mb-2">Photo</p>
                                            <img src={`http://localhost:8080${selectedUser.photo || selectedUser.profilePhotoUrl}`} alt="User" className="w-full h-48 object-cover rounded" />
                                        </div>
                                    )}
                                    {selectedUser.signature && (
                                        <div className="border p-2 rounded">
                                            <p className="text-sm font-medium mb-2">Signature</p>
                                            <img src={`http://localhost:8080${selectedUser.signature}`} alt="Signature" className="w-full h-48 object-contain rounded" />
                                        </div>
                                    )}
                                    {selectedUser.organizationCertificate && (
                                        <div className="border p-2 rounded">
                                            <p className="text-sm font-medium mb-2">Certificate</p>
                                            {selectedUser.organizationCertificate.endsWith('.pdf') ? (
                                                <a
                                                    href={`http://localhost:8080${selectedUser.organizationCertificate}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-blue-500 hover:underline block mt-10 text-center"
                                                >
                                                    View PDF
                                                </a>
                                            ) : (
                                                <img src={`http://localhost:8080${selectedUser.organizationCertificate}`} alt="Certificate" className="w-full h-48 object-contain rounded" />
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        <div className="mt-8 flex justify-end space-x-4">
                            {(activeTab !== 'all' && (selectedUser.status === 'pending' || selectedUser.status === 'PENDING')) && (
                                <>
                                    <button
                                        onClick={() => updateStatus(selectedUser.id, activeTab === 'volunteers' ? 'APPROVED' : 'verified')}
                                        className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                                    >
                                        {activeTab === 'volunteers' ? 'Approve' : 'Verify'}
                                    </button>
                                    <button
                                        onClick={() => updateStatus(selectedUser.id, activeTab === 'volunteers' ? 'REJECTED' : 'rejected')}
                                        className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                                    >
                                        Reject
                                    </button>
                                </>
                            )}
                            <button
                                onClick={() => setSelectedUser(null)}
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

export default ManageUsers;
