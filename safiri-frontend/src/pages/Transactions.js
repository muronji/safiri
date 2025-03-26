import React, { useEffect, useState } from "react";
import { useAuth } from "../redux/AuthContext";
import { fetchUserTransactions } from "../apicalls";
import { SearchOutlined } from "@ant-design/icons";
import { Card, Input, Table } from "antd";
import "../stylesheets/transaction.css";
import {useProtectedRoute} from "../redux/UseProtectedRoutes";

const Transactions = () => {
    const user = useProtectedRoute();
    const { token } = useAuth();
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [searchText, setSearchText] = useState("");

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

    // Filter transactions based on search
    const filteredTransactions = transactions.filter(tx =>
        Object.values(tx).some(value =>
            String(value).toLowerCase().includes(searchText.toLowerCase())
        )
    );

    const columns = [
        {
            title: 'Date',
            dataIndex: 'transactionDate',
            key: 'transactionDate',
            render: (date) => date ? new Date(date).toLocaleString() : 'N/A',
            sorter: (a, b) => new Date(a.transactionDate) - new Date(b.transactionDate)
        },
        {
            title: 'Tx Ref',
            dataIndex: 'txRef',
            key: 'txRef',
            render: (txRef) => txRef || 'N/A'
        },
        {
            title: 'Amount',
            dataIndex: 'amount',
            key: 'amount',
            render: (amount) => `$${typeof amount === 'number' ? amount.toFixed(2) : '0.00'}`,
            sorter: (a, b) => a.amount - b.amount
        },
        {
            title: 'Type',
            dataIndex: 'transactionType',
            key: 'transactionType',
            render: (type) => type || 'Unknown'
        },
        {
            title: 'Status',
            dataIndex: 'transactionStatus',
            key: 'transactionStatus',
            render: (status) => (
                <span className={(status || "unknown").toLowerCase()}>
                    {status || 'Unknown'}
                </span>
            ),
            filters: [
                { text: 'Success', value: 'success' },
                { text: 'Pending', value: 'pending' },
                { text: 'Failed', value: 'failed' }
            ],
            onFilter: (value, record) =>
                record.transactionStatus.toLowerCase() === value
        }
    ];

    return (
        <div className="transactions-container">
            <h1 className="title">Transactions</h1>
            <div className="filters">
                <Input
                    prefix={<SearchOutlined />}
                    placeholder="Search transactions"
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    style={{ width: 250 }}
                />
            </div>
            <Card className="table-card">
                {loading && <p className="loading">Loading transactions...</p>}
                {error && <p className="error">{error}</p>}
                {!loading && !error && (
                    <Table
                        dataSource={filteredTransactions}
                        columns={columns}
                        rowKey="txRef"
                        pagination={{
                            pageSize: 10,
                            showSizeChanger: true,
                            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} transactions`
                        }}
                        scroll={{ x: "100%" }}
                    />
                )}
            </Card>
        </div>
    );

};

export default Transactions;