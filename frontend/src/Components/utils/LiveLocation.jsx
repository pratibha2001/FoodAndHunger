import { useState } from "react";

const GoogleMapViewer = ({ address }) => {
    const [expand, setExpand] = useState(false);
    const [focus, setFocus] = useState(false);

    const url = `https://www.google.com/maps?q=${encodeURIComponent(address)}&output=embed`;

    return (
        <>
            {/* Toggle expandable */}
            <button onClick={() => setExpand(!expand)} style={{ marginRight: 10 }}>
                {expand ? "Hide Map" : "Show Map"}
            </button>

            {/* Open focused popup */}
            <button onClick={() => setFocus(true)}>Full View</button>

            {/* Expandable mode */}
            {expand && (
                <iframe
                    src={url}
                    width="100%"
                    height="200"
                    style={{ border: 0, borderRadius: 8, marginTop: 8 }}
                    loading="lazy"
                ></iframe>
            )}

            {/* Focused popup mode */}
            {focus && (
                <div
                    style={{
                        position: "fixed",
                        inset: 0,
                        background: "rgba(0,0,0,0.5)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        zIndex: 999,
                    }}
                    onClick={() => setFocus(false)}
                >
                    <div
                        style={{
                            background: "#fff",
                            padding: 10,
                            borderRadius: 8,
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <iframe
                            src={url}
                            width="500"
                            height="350"
                            style={{ border: 0, borderRadius: 8 }}
                            loading="lazy"
                        ></iframe>

                        <button
                            onClick={() => setFocus(false)}
                            style={{ marginTop: 10 }}
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
        </>
    );
};

export default GoogleMapViewer;
