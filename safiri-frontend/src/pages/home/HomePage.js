import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../stylesheets/home.css";
import "../../stylesheets/form.css";
import {fetchWalletBalance} from "../../apicalls";
import SendMoneyModal from "./SendMoneyModal";

const Home = () => {
    const navigate = useNavigate();

    // Retrieve user info from localStorage
    const user = JSON.parse(localStorage.getItem("user")) || {};

    // Simulated wallet balance (replace with API call if needed)
    const [walletBalance, setWalletBalance] = useState(0);
    const [showSendMoneyModal, setShowSendMoneyModal] = useState(false);

    useEffect(() => {
        console.log("showSendMoneyModal state changed:", showSendMoneyModal);
    }, [showSendMoneyModal]);


    useEffect(() => {
        if (!user.id) return;

        const loadBalance = async () => {
            try {
                const balance = await fetchWalletBalance(user.id);
                console.log("Wallet balance fetched:", balance); // Debug the balance returned
                setWalletBalance(balance); // Set state with returned balance
            } catch (error) {
                console.error(error);
            }
        };

        loadBalance();
    }, [user.id]);


    useEffect(() => {
        console.log("Wallet balance updated in state:", walletBalance);
    }, [walletBalance]);

    return (
        <div className="home-container">
            <h1 className="welcome-text">Welcome, {user.firstName || "Guest"}!</h1>

            {/* Wallet Info Card */}
            <div className="wallet-card">
                <h2>Wallet Balance</h2>
                <p><strong>Balance:</strong> ${walletBalance.toFixed(2)}</p>
                <p><strong>User ID:</strong> {user.id || "N/A"}</p>
            </div>

            <div className="action-cards">
                {/* Load Wallet Card */}
                <div className="card">
                    <h2>Load Wallet</h2>
                    <p>Add money to your wallet to use for transactions.</p>
                    <button className="form-button" onClick={() => navigate("/loadwallet")}>Load Wallet</button>
                </div>

                {/* Send Money */}
                <div className="card">
                    <h2>Send Money</h2>
                    <p>Transfer funds to other users easily.</p>
                    <button
                        className="form-button"
                        onClick={() => {
                            console.log("Send Money button clicked");
                            setShowSendMoneyModal(true);
                        }}
                    >
                        Send Money
                    </button>
                </div>
            </div>
            {showSendMoneyModal ? (
                <>
                    {console.log("Rendering SendMoneyModal...")}
                    <SendMoneyModal
                        showSendMoneyModal={showSendMoneyModal}
                        setShowSendMoneyModal={setShowSendMoneyModal}
                        user={user}
                    />
                </>
            ) : null}

        </div>
    );
};

export default Home;
