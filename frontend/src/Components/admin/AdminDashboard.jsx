import React, { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';

const AdminDashboard = () => {
    const { publicAxiosInstance } = useOutletContext();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await publicAxiosInstance.get('admin/stats');
                setStats(response.data);
            } catch (error) {
                console.error('Error fetching stats:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, [publicAxiosInstance]);

    if (loading) return <div>Loading...</div>;
    if (!stats) return <div>Error loading stats</div>;

    const StatCard = ({ title, value, color }) => (
        <div className={`bg-white p-6 rounded-lg shadow-md border-l-4 ${color}`}>
            <h3 className="text-gray-500 text-sm font-medium uppercase">{title}</h3>
            <p className="text-3xl font-bold text-gray-800 mt-2">{value}</p>
        </div>
    );

    return (
        <div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">Dashboard Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Total Donors" value={stats.totalDonors} color="border-blue-500" />
                <StatCard title="Total Recipients" value={stats.totalRecipients} color="border-green-500" />
                <StatCard title="Total Volunteers" value={stats.totalVolunteers} color="border-yellow-500" />
                <StatCard title="Total Requests" value={stats.totalRequests} color="border-red-500" />
                <StatCard title="Total Donations" value={stats.totalDonations} color="border-purple-500" />
                {/* Add more stats if needed */}
            </div>
        </div>
    );
};

export default AdminDashboard;
