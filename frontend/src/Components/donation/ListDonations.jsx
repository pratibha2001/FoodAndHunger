import React, { useEffect, useState } from "react";
import demo from "../../assets/images/banner1.png";

const ListDonations = () => {
    const [donations, setDonations] = useState([]);
    const [selectedLocation, setSelectedLocation] = useState(null);

    useEffect(() => {
        fetch("http://localhost:8080/api/donation/all")
            .then((res) => res.json())
            .then((data) => setDonations(data));
    }, []);

    return (
        <>
            <div className="flex flex-wrap justify-center gap-6">
                {donations.map((item) => (
                    <div key={item.id} className="flex flex-col w-full sm:w-[48%] lg:w-[30%] max-w-sm border border-gray-200 rounded-lg shadow hover:shadow-md transition">

                        <img
                            src={item.photo ? `http://localhost:8080${item.photo}` : demo}
                            alt={item.title}
                            className="rounded-t-lg w-full h-48 object-cover"
                            onError={(e) => { e.target.src = demo; }}
                        />

                        <div className="p-5 text-center flex flex-col flex-grow">

                            <span className="text-green-700 text-xs font-medium px-2 py-1 rounded bg-green-100 inline-block mb-2">
                                {item.type}
                            </span>

                            <h5 className="text-xl font-semibold text-gray-800">{item.title}</h5>
                            <p className="text-sm text-gray-600 my-2">{item.description}</p>

                            <p className="text-xs text-gray-700">📍 Address: {item.address}</p>
                            <p className="text-xs text-gray-700">🌍 Location: {item.location}</p>

                            <p className="text-xs text-gray-600 mt-1">Status: {item.status || "N/A"}</p>
                            <p className="text-xs text-gray-600">Remarks: {item.remarks || "None"}</p>

                            <p className="text-[10px] text-gray-500 mt-2">Created: {item.createdAt}</p>

                            <button
                                className="bg-blue-600 text-white text-sm px-3 py-2 rounded-md mt-3 hover:bg-blue-700"
                                onClick={() => setSelectedLocation(item.location)}
                            >
                                Track on Map
                            </button>

                        </div>
                    </div>
                ))}
            </div>

            {/* Map Modal */}
            {selectedLocation && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg overflow-hidden w-full max-w-xl">
                        <iframe
                            title="map"
                            width="100%"
                            height="350px"
                            loading="lazy"
                            allowFullScreen
                            src={`https://www.google.com/maps?q=${selectedLocation}&output=embed`}
                        ></iframe>

                        <button
                            onClick={() => setSelectedLocation(null)}
                            className="w-full py-2 bg-red-600 text-white text-sm font-medium hover:bg-red-700"
                        >
                            Close Map
                        </button>
                    </div>
                </div>
            )}
        </>
    );
};

export default ListDonations;
