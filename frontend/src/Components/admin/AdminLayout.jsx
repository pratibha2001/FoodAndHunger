import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import axios from 'axios';

const publicAxiosInstance = axios.create({
    baseURL: 'http://localhost:8080/api/',
    withCredentials: false,
});

const AdminLayout = () => {
    const location = useLocation();

    const navItems = [
        { name: 'Dashboard', path: '/admin/dashboard' },
        { name: 'Requests', path: '/admin/requests' },
        { name: 'Donations', path: '/admin/donations' },
        { name: 'Users', path: '/admin/users' },
        { name: 'Donors', path: '/admin/donors' },
        { name: 'Recipients', path: '/admin/recipients' },
        { name: 'Volunteers', path: '/admin/volunteers' },
    ];

    return (
        <div className="flex h-screen bg-gray-100">
            <Toaster position="top-center" reverseOrder={false} />

            {/* Sidebar */}
            <div className="w-64 bg-white shadow-md">
                <div className="p-6">
                    <h1 className="text-2xl font-bold text-gray-800">Admin Panel</h1>
                </div>
                <nav className="mt-6">
                    {navItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`block px-6 py-3 text-gray-700 hover:bg-gray-100 ${location.pathname === item.path ? 'bg-gray-100 border-r-4 border-blue-500' : ''
                                }`}
                        >
                            {item.name}
                        </Link>
                    ))}
                </nav>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-y-auto">
                <div className="p-8">
                    <Outlet context={{ publicAxiosInstance }} />
                </div>
            </div>
        </div>
    );
};

export default AdminLayout;
