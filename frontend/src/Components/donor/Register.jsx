import React, { useState, useEffect } from "react";
import {
    MapContainer,
    TileLayer,
    Marker,
    useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const markerIcon = new L.Icon({
    iconUrl: "https://cdn-icons-png.flaticon.com/512/447/447031.png",
    iconSize: [35, 35],
});

// Marker Logic - Unchanged
const DraggableMarker = ({ position, setPosition }) => {
    useMapEvents({
        click(e) {
            setPosition(e.latlng);
        },
    });
    return (
        <Marker
            draggable
            icon={markerIcon}
            position={[position.lat, position.lng]}
            eventHandlers={{
                dragend: (e) => setPosition(e.target.getLatLng()),
            }}
        />
    );
};

const DonorForm = ({ onClose }) => {
    const [form, setForm] = useState({
        name: "",
        age: "",
        address: "",
        organizationName: "",
        pan: "",
        aadhaar: "",
        phone: "",
        email: "",
        location: "",
        organizationCertificate: null,
        photo: null,
        signature: null,
    });

    const [position, setPosition] = useState({ lat: 20.5937, lng: 78.9629 });
    const [readableLocation, setReadableLocation] = useState("");

    // Convert Lat/Lng → Human Address
    const fetchReadableAddress = async (lat, lng) => {
        try {
            const res = await fetch(
                `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`
            );
            const data = await res.json();
            const loc = data.display_name || `${lat}, ${lng}`;
            setReadableLocation(loc);
            setForm({ ...form, location: loc });
        } catch {
            setReadableLocation("Unknown Location");
        }
    };

    useEffect(() => {
        if (position.lat && position.lng) {
            fetchReadableAddress(position.lat, position.lng);
        }
    }, [position]);

    const handleInput = (e) =>
        setForm({ ...form, [e.target.name]: e.target.value });

    const autoDetect = () => {
        navigator.geolocation.getCurrentPosition(
            ({ coords }) => {
                setPosition({ lat: coords.latitude, lng: coords.longitude });
            },
            () => alert("Location Permission Denied")
        );
    };

    const handleFile = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const ext = file.name.split(".").pop();
        const newName = `${form.pan}_${form.phone}_${e.target.name}.${ext}`;
        const renamed = new File([file], newName, { type: file.type });

        setForm({ ...form, [e.target.name]: renamed });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const data = new FormData();
        Object.keys(form).forEach((key) => data.append(key, form[key]));

        try {
            const response = await fetch("http://localhost:8080/api/donor/add", {
                method: "POST",
                body: data,
            });

            if (!response.ok) throw new Error("Registration failed");

            alert("Donor Registered Successfully!");
            if (onClose) onClose();

        } catch (err) {
            alert(err.message);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white w-full max-w-2xl p-6 rounded-lg shadow-lg overflow-auto max-h-[90vh]">

                {/* Header */}
                <div className="flex justify-between mb-3">
                    <h2 className="text-xl font-bold text-green-700">Donor Registration</h2>
                    <button className="text-red-600 font-bold" onClick={onClose}>
                        ✕
                    </button>
                </div>

                <form className="space-y-3" onSubmit={handleSubmit}>

                    {/* Basic Fields */}
                    {[
                        "name",
                        "age",
                        "pan",
                        "aadhaar",
                        "phone",
                        "email",
                        "address",
                        "organizationName",
                    ].map((field) => (
                        <input
                            key={field}
                            name={field}
                            required
                            placeholder={field.split(/(?=[A-Z])/).join(" ")}
                            type={field === "age" ? "number" : field === "email" ? "email" : "text"}
                            onChange={handleInput}
                            className="w-full p-2 border border-green-600 rounded"
                        />
                    ))}

                    {/* Location + Map */}
                    <label className="font-semibold text-green-700">Location *</label>
                    <div className="flex gap-2">
                        <input
                            required
                            name="location"
                            value={readableLocation}
                            className="flex-1 border p-2 rounded"
                            onChange={(e) => {
                                setReadableLocation(e.target.value);
                                setForm({ ...form, location: e.target.value });
                            }}
                        />
                        <button
                            type="button"
                            onClick={autoDetect}
                            className="bg-green-700 text-white px-3 rounded"
                        >
                            📍 Auto
                        </button>
                    </div>

                    <div className="w-full h-56 rounded overflow-hidden">
                        <MapContainer center={[position.lat, position.lng]} zoom={14} style={{ height: "100%" }}>
                            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                            <DraggableMarker position={position} setPosition={setPosition} />
                        </MapContainer>
                    </div>

                    {/* File Uploads */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-2">
                        <div>
                            <label className="text-green-700 font-semibold">Organization Certificate *</label>
                            <input required type="file" name="organizationCertificate" onChange={handleFile} />
                        </div>

                        <div>
                            <label className="text-green-700 font-semibold">Photo *</label>
                            <input required type="file" name="photo" onChange={handleFile} />
                        </div>

                        <div className="md:col-span-2">
                            <label className="text-green-700 font-semibold">Signature *</label>
                            <input required type="file" name="signature" onChange={handleFile} />
                        </div>
                    </div>

                    {/* Submit */}
                    <button type="submit" className="w-full bg-green-700 text-white py-3 rounded font-bold">
                        Submit
                    </button>

                </form>
            </div>
        </div>
    );
};

export default DonorForm;
