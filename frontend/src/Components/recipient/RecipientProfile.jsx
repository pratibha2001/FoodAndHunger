import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, MapPin, Building, FileText, CheckCircle, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const RecipientProfile = ({ recipientId, axios, onUploadSuccess }) => {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    const [files, setFiles] = useState({
        photo: null,
        certificate: null,
        signature: null
    });
    const [uploading, setUploading] = useState(false);

    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({});
    const [saving, setSaving] = useState(false);
    const [editPhoto, setEditPhoto] = useState(null);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await axios.get(`/recipient/${recipientId}`);
                setProfile(res.data);
                setFormData(res.data);
            } catch (error) {
                console.error("Error fetching profile:", error);
                toast.error("Failed to load profile.");
            } finally {
                setLoading(false);
            }
        };

        if (recipientId) {
            fetchProfile();
        }
    }, [recipientId, axios]);

    if (loading) return <div className="text-center py-8">Loading profile...</div>;
    if (!profile) return <div className="text-center py-8 text-red-500">Failed to load profile.</div>;

    const handleFileChange = (e) => {
        const { name, files: selectedFiles } = e.target;
        if (selectedFiles && selectedFiles[0]) {
            setFiles(prev => ({
                ...prev,
                [name]: selectedFiles[0]
            }));
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            // First update profile data
            const res = await axios.put(`/recipient/update/${recipientId}`, formData);
            
            // If photo is changed, upload it
            if (editPhoto) {
                const formDataUpload = new FormData();
                formDataUpload.append('photo', editPhoto);
                const photoRes = await axios.post(`/recipient/${recipientId}/upload`, formDataUpload, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                setProfile(photoRes.data);
                setFormData(photoRes.data);
            } else {
                setProfile(res.data);
            }
            
            setIsEditing(false);
            setEditPhoto(null);
            toast.success("Profile updated successfully!");
            
            // Reload profile to get fresh data including new photo path
            const freshRes = await axios.get(`/recipient/${recipientId}`);
            setProfile(freshRes.data);
            setFormData(freshRes.data);
        } catch (error) {
            console.error("Error updating profile:", error);
            toast.error("Failed to update profile.");
        } finally {
            setSaving(false);
        }
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        setUploading(true);
        try {
            const formDataUpload = new FormData();
            if (files.photo) formDataUpload.append('photo', files.photo);
            if (files.certificate) formDataUpload.append('certificate', files.certificate);
            if (files.signature) formDataUpload.append('signature', files.signature);

            const res = await axios.post(`/recipient/${recipientId}/upload`, formDataUpload, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            toast.success("Documents uploaded successfully!");
            setProfile(res.data);
            setFiles({ photo: null, certificate: null, signature: null });

            // Check if all required documents are uploaded
            const updatedProfile = res.data;
            const isComplete = updatedProfile.photo && updatedProfile.signature &&
                (!updatedProfile.organizationName || updatedProfile.organizationCertificate);

            if (isComplete) {
                localStorage.setItem('document_uploaded', 'true');
                if (onUploadSuccess) {
                    onUploadSuccess();
                }
            }
        } catch (error) {
            console.error("Error uploading documents:", error);
            toast.error("Failed to upload documents.");
        } finally {
            setUploading(false);
        }
    };

    // Check if documents are already uploaded based on profile data
    const isDocumentUploaded = profile && profile.photo && profile.signature &&
        (!profile.organizationName || profile.organizationCertificate);

    return (
        <div className="max-w-5xl mx-auto space-y-8">
            <div className="bg-white rounded-3xl overflow-hidden shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-300">
                <div className="h-48 bg-gradient-to-r from-emerald-400 via-teal-500 to-cyan-600 relative overflow-hidden">
                    <div className="absolute inset-0 bg-black opacity-10"></div>
                    <div className="absolute inset-0" style={{
                        backgroundImage: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.05"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
                    }}></div>
                </div>
                <div className="px-8 pb-8">
                    <div className="relative flex justify-between items-end -mt-16 mb-6">
                        <div className="relative group">
                            <input
                                type="file"
                                id="photoUploadRecipient"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                    if (e.target.files && e.target.files[0]) {
                                        setEditPhoto(e.target.files[0]);
                                    }
                                }}
                            />
                            <label
                                htmlFor={isEditing ? "photoUploadRecipient" : undefined}
                                className={`w-32 h-32 rounded-full border-4 border-white overflow-hidden bg-white shadow-2xl transform group-hover:scale-105 transition-transform duration-300 block relative ${isEditing ? 'cursor-pointer' : ''}`}
                            >
                                <div className="w-full h-full relative">
                                    {editPhoto ? (
                                        <img
                                            src={URL.createObjectURL(editPhoto)}
                                            alt="Preview"
                                            className="w-full h-full object-cover"
                                        />
                                    ) : profile.photo ? (
                                        <img
                                            src={`http://localhost:8080${profile.photo}`}
                                            alt={profile.name}
                                            className="w-full h-full object-cover"
                                            onError={(e) => { e.target.src = 'https://via.placeholder.com/150?text=User'; }}
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-teal-100 to-cyan-100">
                                            <User className="w-14 h-14 text-teal-400" />
                                        </div>
                                    )}
                                    {isEditing && (
                                        <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-50 transition-opacity duration-200 flex items-center justify-center">
                                            <span className="text-white text-xs font-medium z-10 relative">Change Photo</span>
                                        </div>
                                    )}
                                </div>
                            </label>
                            <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full flex items-center justify-center shadow-lg transform group-hover:rotate-12 transition-transform duration-300">
                                {profile.status === 'verified' || profile.status === 'approved' ? (
                                    <CheckCircle className="w-6 h-6 text-white" />
                                ) : (
                                    <XCircle className="w-6 h-6 text-white" />
                                )}
                            </div>
                        </div>
                        <div className="mb-1 flex items-center gap-4">
                            <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                                {profile.status || 'PENDING'}
                            </span>
                            {!isEditing && (
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="px-3 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-md text-sm font-medium shadow-lg hover:shadow-xl hover:from-emerald-600 hover:to-teal-600 transform hover:scale-105 transition-all duration-200"
                                >
                                    Edit Profile
                                </button>
                            )}
                        </div>
                    </div>

                    {isEditing ? (
                        <form onSubmit={handleUpdateProfile} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name || ''}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Organization Name</label>
                                <input
                                    type="text"
                                    name="organizationName"
                                    value={formData.organizationName || ''}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email || ''}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none bg-gray-50"
                                    disabled
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone || ''}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                                    required
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                                <input
                                    type="text"
                                    name="address"
                                    value={formData.address || ''}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Organization Type</label>
                                <select
                                    name="organizationType"
                                    value={formData.organizationType || ''}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                                    required
                                >
                                    <option value="">Select Type</option>
                                    <option value="NGO">NGO</option>
                                    <option value="Orphanage">Orphanage</option>
                                    <option value="Old Age Home">Old Age Home</option>
                                    <option value="School">School</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>

                            <div className="md:col-span-2 flex justify-end gap-3 mt-4">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsEditing(false);
                                        setFormData(profile); // Reset changes
                                    }}
                                    className="px-6 py-2 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="px-6 py-2 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition-colors disabled:opacity-50"
                                >
                                    {saving ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        </form>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 mb-1">{profile.name}</h2>
                                <p className="text-gray-500 mb-6">{profile.organizationName}</p>

                                <div className="space-y-4">
                                    <div className="flex items-center gap-3 text-gray-600">
                                        <Mail className="w-5 h-5 text-gray-400" />
                                        <span>{profile.email}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-gray-600">
                                        <Phone className="w-5 h-5 text-gray-400" />
                                        <span>{profile.phone}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-gray-600">
                                        <MapPin className="w-5 h-5 text-gray-400" />
                                        <span>{profile.address}</span>
                                    </div>
                                    {/* <div className="flex items-center gap-3 text-gray-600">
                                        <Building className="w-5 h-5 text-gray-400" />
                                        <span>{profile.organizationType}</span>
                                    </div> */}
                                </div>
                            </div>

                            <div className="bg-gray-50 rounded-xl p-6">
                                <h3 className="font-semibold text-gray-900 mb-4">Verification Documents</h3>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                                        <div className="flex items-center gap-3">
                                            <FileText className="w-5 h-5 text-blue-500" />
                                            <span className="text-sm font-medium text-gray-700">Certificate</span>
                                        </div>
                                        {profile.organizationCertificate ? (
                                            <a
                                                href={`http://localhost:8080${profile.organizationCertificate}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-xs text-blue-600 hover:underline"
                                            >
                                                View
                                            </a>
                                        ) : (
                                            <span className="text-xs text-gray-400">Not uploaded</span>
                                        )}
                                    </div>
                                    <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                                        <div className="flex items-center gap-3">
                                            <FileText className="w-5 h-5 text-blue-500" />
                                            <span className="text-sm font-medium text-gray-700">Signature</span>
                                        </div>
                                        {profile.organizationCertificate ? (
                                            <a
                                                href={`http://localhost:8080${profile.organizationCertificate}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-xs text-blue-600 hover:underline"
                                            >
                                                View
                                            </a>
                                        ) : (
                                            <span className="text-xs text-gray-400">Not uploaded</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Document Upload Section - Only show if documents are NOT uploaded */}
            {!isDocumentUploaded && (
                <div className="bg-white rounded-xl border p-6 shadow-sm">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Upload Documents</h3>
                    <div className="mb-4 p-4 bg-yellow-50 text-yellow-800 rounded-lg text-sm">
                        Please upload your documents to verify your account. You won't be able to make requests until this is completed.
                    </div>
                    <form onSubmit={handleUpload} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Photo Upload */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Profile Photo</label>
                                <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 text-center hover:border-green-500 transition-colors">
                                    <input
                                        type="file"
                                        name="photo"
                                        accept="image/*"
                                        onChange={handleFileChange}
                                        className="hidden"
                                        id="recipient-photo-upload"
                                    />
                                    <label htmlFor="recipient-photo-upload" className="cursor-pointer flex flex-col items-center gap-2">
                                        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-400">
                                            <User className="w-6 h-6" />
                                        </div>
                                        <span className="text-xs text-gray-600 truncate max-w-full">
                                            {files.photo ? files.photo.name : "Change Photo"}
                                        </span>
                                    </label>
                                </div>
                            </div>

                            {/* Certificate Upload */}
                            {profile.organizationName && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Organization Certificate</label>
                                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 text-center hover:border-green-500 transition-colors">
                                        <input
                                            type="file"
                                            name="certificate"
                                            accept=".pdf,image/*"
                                            onChange={handleFileChange}
                                            className="hidden"
                                            id="recipient-certificate-upload"
                                        />
                                        <label htmlFor="recipient-certificate-upload" className="cursor-pointer flex flex-col items-center gap-2">
                                            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-400">
                                                <FileText className="w-6 h-6" />
                                            </div>
                                            <span className="text-xs text-gray-600 truncate max-w-full">
                                                {files.certificate ? files.certificate.name : "Upload Certificate"}
                                            </span>
                                        </label>
                                    </div>
                                </div>
                            )}

                            {/* Signature Upload */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Signature</label>
                                <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 text-center hover:border-green-500 transition-colors">
                                    <input
                                        type="file"
                                        name="signature"
                                        accept="image/*"
                                        onChange={handleFileChange}
                                        className="hidden"
                                        id="recipient-signature-upload"
                                    />
                                    <label htmlFor="recipient-signature-upload" className="cursor-pointer flex flex-col items-center gap-2">
                                        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-400">
                                            <FileText className="w-6 h-6" />
                                        </div>
                                        <span className="text-xs text-gray-600 truncate max-w-full">
                                            {files.signature ? files.signature.name : "Upload Signature"}
                                        </span>
                                    </label>
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-end">
                            <button
                                type="submit"
                                disabled={!files.photo && !files.certificate && !files.signature || uploading}
                                className="px-6 py-2 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {uploading ? 'Uploading...' : 'Upload Documents'}
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};

export default RecipientProfile;