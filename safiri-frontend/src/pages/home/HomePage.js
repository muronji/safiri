import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../stylesheets/home.css";
import "../../stylesheets/form.css";
import { fetchWalletBalance } from "../../apicalls";
import SendMoneyModal from "./SendMoneyModal";
import LoadWalletModal from "./LoadWalletModal";

const Home = () => {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem("user")) || {};

    // State management
    const [walletBalance, setWalletBalance] = useState(0);
    const [showSendMoneyModal, setShowSendMoneyModal] = useState(false);
    const [showLoadWalletModal, setShowLoadWalletModal] = useState(false);

    useEffect(() => {
        if (!user?.id) return;

        const loadBalance = async () => {
            try {
                const balance = await fetchWalletBalance(user.id);
                console.log("Wallet balance fetched:", balance);
                setWalletBalance(balance);
            } catch (error) {
                console.error("Error fetching balance:", error);
            }
        };

        loadBalance();
    }, [user?.id]);

    return (
        <div className="home-container">
            <h1 className="welcome-text">Welcome, {user?.firstName || "Guest"}!</h1>

            {/* Wallet Info */}
            <div className="wallet-card">
                <h2>Wallet Balance</h2>
                <p><strong>Balance:</strong> ${walletBalance.toFixed(2)}</p>
                <p><strong>User ID:</strong> {user?.id || "N/A"}</p>
            </div>

            {/* Load Wallet */}
            <div className="action-cards">
            <div className="card">
                <h2>Load Wallet</h2>
                <p>Add money to your wallet to use for transactions.</p>
                <button className="form-button" onClick={() => setShowLoadWalletModal(true)}>
                    Load Wallet
                </button>
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

            {/* Modals */}
            {showLoadWalletModal && (
                <LoadWalletModal
                    showLoadWalletModal={showLoadWalletModal}
                    setShowLoadWalletModal={setShowLoadWalletModal}
                    user={user}
                />
            )}

            {showSendMoneyModal && (
                <SendMoneyModal
                    showSendMoneyModal={showSendMoneyModal}
                    setShowSendMoneyModal={setShowSendMoneyModal}
                    user={user}
                />
            )}
        </div>
    );
};

export default Home;
