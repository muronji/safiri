import React, { useState, useEffect } from "react";
import "./App.css";
import {performWalletTopUp} from "./index";

const WalletFunding = () => {
    const [amount, setAmount] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (event) => {
        event.preventDefault();
        setLoading(true);
        setError("");

        try {
            const user = JSON.parse(localStorage.getItem("user")); // Get user from storage
            if (!user) {
                setError("User not found. Please log in.");
                return;
            }
            const response = await performWalletTopUp(user.id, amount);

            window.location.href = response.sessionUrl; // Redirect to Stripe checkout
        } catch (err) {
            setError(err.message || "An error occurred. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <section>
            <h2>Fund Your Wallet</h2>
            {error && <p className="error">{error}</p>}
            <form onSubmit={handleSubmit}>
                <label>
                    Enter Amount:
                    <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        required
                        min="1"
                    />
                </label>
                <button type="submit" disabled={loading}>
                    {loading ? "Processing..." : "Fund Wallet"}
                </button>
            </form>
        </section>
    );
};

const Message = ({ message }) => (
    <section>
        <p>{message}</p>
    </section>
);

export default function App() {
    const [message, setMessage] = useState("");

    useEffect(() => {
        const query = new URLSearchParams(window.location.search);

        if (query.get("success")) {
            setMessage("Wallet funded successfully!");
        }

        if (query.get("canceled")) {
            setMessage("Funding canceled. Try again when you're ready.");
        }
    }, []);

    return message ? <Message message={message} /> : <WalletFunding />;
}
