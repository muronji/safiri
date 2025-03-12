import React, { useState, useEffect } from "react";
import "./App.css";

const WalletFunding = () => {
    const [amount, setAmount] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (event) => {
        event.preventDefault();
        setLoading(true);
        setError("");

        try {
            const response = await fetch("http://localhost:8080/api/payment/fund-wallet", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ amount }),
            });

            if (!response.ok) {
                throw new Error("Failed to create checkout session.");
            }

            const session = await response.json();
            window.location.href = session.sessionUrl; // Redirect to Stripe checkout
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
