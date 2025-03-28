import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../stylesheets/home.css";
import "../../stylesheets/form.css";
import { fetchWalletBalance, getCustomerProfile } from "../../apicalls";
import SendMoneyModal from "./SendMoneyModal";
import LoadWalletModal from "./LoadWalletModal";
import { useAuth } from "../../redux/AuthContext";
import { convertUSDToKES } from "../../services/currencyService";

const Home = () => {
  const navigate = useNavigate();
  // Use the auth context instead of localStorage
  const { user } = useAuth(); // If using your AuthContext

  // State management
  const [walletBalance, setWalletBalance] = useState(0);
  const [kesBalance, setKesBalance] = useState("0.00");
  const [userProfile, setUserProfile] = useState({});
  const [showSendMoneyModal, setShowSendMoneyModal] = useState(false);
  const [showLoadWalletModal, setShowLoadWalletModal] = useState(false);

  useEffect(() => {
    // Fetch user profile
    const loadUserData = async () => {
      try {
        // Get user profile
        const profile = await getCustomerProfile();
        setUserProfile(profile);

        // Get wallet balance - note: no parameter needed
        const balance = await fetchWalletBalance();
        setWalletBalance(balance);

        // Convert USD balance to KES
        const kesValue = await convertUSDToKES(balance);
        setKesBalance(kesValue);
      } catch (error) {
        console.error("Error loading user data:", error);
      }
    };

    loadUserData();
  }, []);

  return (
    <div className="home-container">
      <h1 className="welcome-text">
        Welcome, {userProfile?.firstName || user?.firstName || "Guest"}!
      </h1>

      {/* Wallet Info */}
      <div className="wallet-card">
        <h2>Wallet Balance</h2>
        <p>
          <strong>Balance (USD):</strong> ${walletBalance.toFixed(2)}
        </p>
        <p>
          <strong>Balance (KES):</strong> KES {kesBalance}
        </p>
        <p>
          <strong>User ID:</strong> {userProfile?.id || user?.id || "N/A"}
        </p>
      </div>

      {/* Load Wallet */}
      <div className="action-cards">
        <div className="card">
          <h2>Load Wallet</h2>
          <p>Add money to your wallet to use for transactions.</p>
          <button
            className="form-button"
            onClick={() => setShowLoadWalletModal(true)}
          >
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
          user={userProfile || user}
        />
      )}

      {showSendMoneyModal && (
        <SendMoneyModal
          showSendMoneyModal={showSendMoneyModal}
          setShowSendMoneyModal={setShowSendMoneyModal}
          user={userProfile || user}
        />
      )}
    </div>
  );
};

export default Home;
