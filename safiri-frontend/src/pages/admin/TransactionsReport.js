import React, { useState, useEffect } from "react";
import { Card, Input, Select, Table, Alert, Spin } from "antd";
import {fetchTransactions} from "../../apicalls";
import "../../stylesheets/TransactionsReport.css";
import "../../stylesheets/CustomerReports.css";
import {useProtectedRoute} from "../../redux/UseProtectedRoutes";

const { Option } = Select;

export function TransactionsReport() {
    const user = useProtectedRoute();
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState("");
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const getTransactions = async () => {
            try {
                setLoading(true);
                const data = await fetchTransactions();
                setTransactions(data);
                setError(null);
            } catch (error) {
                console.error("Failed to fetch transactions:", error);
                setError("Unable to load transactions. Please try again later.");
            } finally {
                setLoading(false);
            }
        };

        getTransactions();
    }, []);

    const filteredTransactions = transactions
        .map(tx => ({
            ...tx,
            txRef: tx.txRef ? tx.txRef.toLowerCase() : "N/A"
        }))
        .filter(tx =>
            (tx.txRef.includes(search.toLowerCase()) || tx.txRef === "N/A") &&
            (filter ? tx.transactionStatus === filter : true)
        );

    const columns = [
        { title: "ID", dataIndex: "transactionId", key: "transactionId" },
        { title: "Reference", dataIndex: "txRef", key: "txRef" },
        {
            title: "Amount",
            dataIndex: "amount",
            key: "amount",
            render: (amount) => `$${Number(amount).toFixed(2)}`
        },
        { title: "Type", dataIndex: "transactionType", key: "transactionType" },
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
        },
        { title: "Date", dataIndex: "transactionDate", key: "transactionDate" },
    ];

    if (!user) return null;

    return (
        <div className="transactions-report-container">
            <h1 className="title">Transaction Reports</h1>
            {error && <Alert message={error} type="error" showIcon />}

            <div className="filters">
                <Input
                    placeholder="Search by Reference or Type..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="search-input"
                />
                <Select
                    placeholder="Filter by Status"
                    onChange={setFilter}
                    allowClear
                    className="filter-select"
                >
                    <Option value="success">Success</Option>
                    <Option value="pending">Pending</Option>
                    <Option value="failed">Failed</Option>
                </Select>
            </div>
            <Card className="table-card">
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '50px' }}>
                        <Spin size="large" />
                    </div>
                ) : (
                    <Table
                        dataSource={filteredTransactions}
                        columns={columns}
                        rowKey="transactionId"
                        pagination={{
                            pageSize: 10,
                            showSizeChanger: true,
                            pageSizeOptions: [5, 10, 20, 50]
                        }}
                        scroll={{ x: "max-content", y: 400 }}
                    />
                )}
            </Card>
        </div>
    );
}