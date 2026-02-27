import React, { useEffect } from 'react'

const ListRequests = () => {
    const [requests, setRequests] = useState([]);
    const [selectedLocation, setSelectedLocation] = useState(null);

    useEffect(() => {
        fetch("http://localhost:8080/api/request/all")
            .then((res) => res.json())
            .then((data) => setRequests(data));
    }, []);

    return (
        <div>ListRequests</div>
    )
}

export default ListRequests 