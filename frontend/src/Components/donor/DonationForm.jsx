import React, { useState, useEffect } from 'react';
import { X, Upload, MapPin } from 'lucide-react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const LocationMarker = ({ position, setPosition }) => {
    const map = useMapEvents({
        click(e) {
            setPosition(e.latlng);
            map.flyTo(e.latlng, map.getZoom());
        },
    });

    useEffect(() => {
        if (position) {
            map.flyTo(position, map.getZoom());
        }
    }, [position, map]);

    return position === null ? null : (
        <Marker position={position}></Marker>
    );
};

const DonationForm = ({ isOpen, onClose, onSuccess, donation, donorId, axios }) => {
    const [step, setStep] = useState(1);
    const [createdDonationId, setCreatedDonationId] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        type: 'Veg',
        location: '',
        address: '',
        latitude: null,
        longitude: null
    });
    const [photo, setPhoto] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (donation) {
            setFormData({
                title: donation.title || '',
                description: donation.description || '',
                type: donation.type || 'Veg',
                location: donation.location || '',
                address: donation.address || '',
                latitude: donation.latitude || null,
                longitude: donation.longitude || null
            });
            setStep(1); // Reset to step 1 on edit
        } else {
            // Reset form for new donation
            setFormData({
                title: '',
                description: '',
                type: 'Veg',
                location: '',
                address: '',
                latitude: null,
                longitude: null
            });
            setStep(1);
            setCreatedDonationId(null);
            setPhoto(null);
        }
    }, [donation, isOpen]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        if (e.target.files[0]) {
            setPhoto(e.target.files[0]);
        }
    };

    const handleLocationSelect = async (lat, lng) => {
        setFormData(prev => ({ ...prev, latitude: lat, longitude: lng }));

        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
            const data = await response.json();
            if (data && data.address) {
                setFormData(prev => ({
                    ...prev,
                    latitude: lat,
                    longitude: lng,
                    address: data.display_name
                }));
            }
        } catch (error) {
            console.error("Error fetching address:", error);
        }
    };

    const handleGetLocation = () => {
        if (navigator.geolocation) {
            setLoading(true);
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const lat = position.coords.latitude;
                    const lng = position.coords.longitude;
                    handleLocationSelect(lat, lng);
                    setLoading(false);
                },
                (error) => {
                    console.error("Error getting location:", error);
                    setLoading(false);
                    alert("Failed to get location. Please allow location access.");
                }
            );
        } else {
            alert("Geolocation is not supported by this browser.");
        }
    };

    const handleStep1Submit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (donation) {
                // Update existing donation
                await axios.put(`/donation/update/${donation.id}`, { ...formData, donorId });
                // If updating, we might want to allow photo update too, but for now let's keep it simple
                // or maybe move to step 2 if they want to update photo?
                // The requirement is specifically for "Add New Donation".
                // For edit, let's just save and close for now, or we can check if they want to update photo.
                // Let's assume edit stays as is (single step) or we can make it 2 steps too.
                // Given the prompt "fix Add New Donation", I'll focus on Add.
                // But to be consistent, let's allow photo update in step 2 for edit too if needed.
                // However, the current edit flow doesn't seem to support photo update easily in the same request.
                // Let's stick to the plan: Step 1 creates/updates data.

                // If it's edit, we can just close or go to step 2.
                // Let's go to step 2 to allow photo update.
                setCreatedDonationId(donation.id);
                setStep(2);
            } else {
                // Create new donation
                const response = await axios.post('/donation/add', { ...formData, donorId, status: 'pending' });
                // Expecting JSON response with id
                if (response.data && response.data.id) {
                    setCreatedDonationId(response.data.id);
                    setStep(2);
                } else {
                    throw new Error("Invalid response from server");
                }
            }
        } catch (error) {
            console.error("Error saving donation details:", error);
            alert("Failed to save donation details");
        } finally {
            setLoading(false);
        }
    };

    const handleStep2Submit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (photo && createdDonationId) {
                const photoData = new FormData();
                photoData.append('photo', photo);
                // Use fetch to avoid axios header issues with FormData
                const response = await fetch(`http://localhost:8080/api/donation/${createdDonationId}/photo`, {
                    method: 'POST',
                    body: photoData,
                });

                if (!response.ok) {
                    const errorText = await response.text();
                    throw new Error(`Server responded with ${response.status}: ${errorText}`);
                }
            }
            onSuccess();
            onClose();
        } catch (error) {
            console.error("Error uploading photo:", error);
            alert(`Failed to upload photo: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] shadow-2xl overflow-y-auto animate-in fade-in zoom-in duration-200">
                <div className="flex justify-between items-center p-4 border-b sticky top-0 bg-white z-10">
                    <h2 className="text-lg font-bold text-gray-900">
                        {donation ? 'Edit Donation' : 'Add New Donation'} - Step {step} of 2
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                {step === 1 ? (
                    <form onSubmit={handleStep1Submit} className="p-4 space-y-2">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                required
                                className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all text-sm"
                                placeholder="e.g., Fresh Vegetables"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                            <select
                                name="type"
                                value={formData.type}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all text-sm"
                            >
                                <option value="Veg">Veg</option>
                                <option value="Non-Veg">Non-Veg</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={(e) => {
                                    const words = e.target.value.trim().split(/\s+/).filter(word => word.length > 0);
                                    if (words.length <= 200 || e.target.value.length < formData.description.length) {
                                        handleChange(e);
                                    }
                                }}
                                rows="2"
                                className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all text-sm"
                                placeholder="Describe the donation..."
                            />
                            <div className="text-xs text-gray-500 mt-1 text-right">
                                {formData.description.trim().split(/\s+/).filter(word => word.length > 0).length}/200 words
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Address (Landmark)</label>
                                <div className="relative">
                                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type="text"
                                        name="location"
                                        value={formData.location}
                                        onChange={handleChange}
                                        className="w-full pl-9 pr-3 py-2 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all text-sm"
                                        placeholder="Landmark"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Live Location</label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        name="address"
                                        value={formData.address}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all text-sm"
                                        placeholder="Street address"
                                    />
                                    <button
                                        type="button"
                                        onClick={handleGetLocation}
                                        className="p-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-colors shrink-0"
                                        title="Use Current Location"
                                    >
                                        <MapPin className="w-4 h-4" />
                                    </button>
                                </div>
                                {formData.latitude && (
                                    <p className="text-xs text-green-600 mt-1">
                                        Location: {formData.latitude.toFixed(4)}, {formData.longitude.toFixed(4)}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="h-40 w-full rounded-xl overflow-hidden border">
                            <MapContainer
                                center={[formData.latitude || 20.5937, formData.longitude || 78.9629]}
                                zoom={formData.latitude ? 13 : 5}
                                style={{ height: '100%', width: '100%' }}
                            >
                                <TileLayer
                                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                />
                                <LocationMarker
                                    position={formData.latitude && formData.longitude ? { lat: formData.latitude, lng: formData.longitude } : null}
                                    setPosition={(latlng) => handleLocationSelect(latlng.lat, latlng.lng)}
                                />
                            </MapContainer>
                        </div>
                        <p className="text-xs text-gray-500">Click on the map to set location</p>

                        <div className="pt-2 flex gap-2">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition-colors disabled:opacity-50"
                            >
                                {loading ? 'Saving...' : 'Next: Upload Photo'}
                            </button>
                        </div>
                    </form>
                ) : (
                    <form onSubmit={handleStep2Submit} className="p-6 space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Photo</label>
                            <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-green-500 transition-colors">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    className="hidden"
                                    id="donation-photo"
                                />
                                <label htmlFor="donation-photo" className="cursor-pointer flex flex-col items-center gap-2">
                                    <Upload className="w-8 h-8 text-gray-400" />
                                    <span className="text-sm text-gray-600">
                                        {photo ? photo.name : "Click to upload photo"}
                                    </span>
                                </label>
                            </div>
                        </div>

                        <div className="pt-4 flex gap-3">
                            <button
                                type="button"
                                onClick={() => setStep(1)}
                                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
                            >
                                Back
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition-colors disabled:opacity-50"
                            >
                                {loading ? 'Uploading...' : 'Finish'}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default DonationForm;
