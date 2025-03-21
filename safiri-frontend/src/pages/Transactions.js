import React, { useEffect, useState } from "react";
import { useAuth } from "../redux/AuthContext";
import axios from "axios";
import PageTitle from "../components/PageTitle";
import "../stylesheets/transaction.css";
import {fetchUserTransactions} from "../apicalls";
import { InboxOutlined } from "@ant-design/icons";

const Transactions = () => {
    const { user, token } = useAuth();
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!user) return;

        (async () => {
            try {
                const data = await fetchUserTransactions(user.id, token);
                setTransactions(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        })();
    }, [user, token]);

    return (
        <div>
            <PageTitle title="Transactions" />
            <div className="transactions-container">
                {loading && <p className="loading">Loading transactions...</p>}
                {error && <p className="error">{error}</p>}

                {!loading && !error && (
                    <table className="transactions-table">
                        <thead>
                        <tr>
                            <th>Date</th>
                            <th>Tx Ref</th>
                            <th>Amount</th>
                            <th>Type</th>
                            <th>Status</th>
                        </tr>
                        </thead>
                        <tbody>
                        {transactions.length > 0 ? (
                            transactions.map((tx, index) => {
                                console.log("Rendering transaction:", tx); // Add this for debugging
                                return (
                                    <tr key={index}>
                                        <td>{tx.transactionDate ? new Date(tx.transactionDate).toLocaleString() : 'N/A'}</td>
                                        <td>{tx.txRef || 'N/A'}</td>
                                        <td>${typeof tx.amount === 'number' ? tx.amount.toFixed(2) : '0.00'}</td>
                                        <td>{tx.transactionType || 'Unknown'}</td>
                                        <td className={(tx.transactionStatus || "unknown").toLowerCase()}>
                                            {tx.transactionStatus || 'Unknown'}
                                        </td>
                                    </tr>
                                );
                            })
                        ) : (
                            <tr>
                                <td colSpan="5" className="no-transactions">
                                    <InboxOutlined style={{fontSize: "40px", color: "#888"}}/>
                                    <p>No transactions found</p>
                                </td>
                            </tr>
                        )}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default Transactions;