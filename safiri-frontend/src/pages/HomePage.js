import React, { useState } from 'react';

const HomePage = () => {
    const [balance, setBalance] = useState(1000); // Example balance

    const loadWallet = () => {
        alert('Loading Wallet...');
        // Placeholder for wallet loading functionality
    };

    return (
        <div className="home-page">
            <h1>Wallet Details</h1>
            <p>Balance: ${balance}</p>
            <button onClick={loadWallet}>Load Wallet</button>
        </div>
    );
};

export default HomePage;
