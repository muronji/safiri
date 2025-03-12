import React, { useEffect, useState } from "react";

const ProfilePage = () => {
    const [customer, setCustomer] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetch("http://localhost:8080/api/v1/customers/profile")
            .then(response => response.json())
            .then(data => {
                console.log("Fetched Customer Data:", data); // Debug API response
                setCustomer(data);
            })
            .catch(error => setError(error.message));
    }, []);


    if (error) {
        return <div>Error: {error}</div>;
    }

    if (!customer) {
        return <div>Loading...</div>;

        return (
            <div>
                <h2>Customer Profile</h2>
                <p><strong>Name:</strong> {customer.name}</p>
                <p><strong>Email:</strong> {customer.email}</p>
                <p><strong>Identifier Type:</strong> {customer.identifierType}</p>
                <p><strong>Identifier:</strong> {customer.identifier}</p>
                <p><strong>Wallet Balance:</strong> ${customer.walletBalance}</p>
            </div>
        );
    }
};

export default ProfilePage;

