import React, {useEffect, useState} from 'react';
import { Row, Col, Card, Spin } from 'antd';
import {
    DollarOutlined,
    CreditCardOutlined,
    ArrowUpOutlined,
    ArrowDownOutlined,
    ClockCircleOutlined
} from '@ant-design/icons';
import "../../stylesheets/Dashboard.css"
import {fetchDashboardStatistics} from "../../apicalls";

const Dashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadStats = async () => {
            try {
                const dashboardStats = await fetchDashboardStatistics();
                setStats(dashboardStats);
                setLoading(false);
            } catch (error) {
                console.error("Failed to load dashboard statistics:", error);
                setLoading(false);
            }
        };

        loadStats();
    }, []);

    // Helper function to format currency
    const formatCurrency = (amount) =>
        new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount || 0);

    // Helper function to format date
    const formatDate = (dateString) =>
        dateString ? new Date(dateString).toLocaleString() : 'N/A';

    // Render loading state
    if (loading) {
        return (
            <div className="dashboard-container" style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh'
            }}>
                <Spin size="large" />
            </div>
        );
    }

    // Render error state if no stats
    if (!stats) {
        return (
            <div className="dashboard-container">
                <Card>
                    <p>Unable to load dashboard statistics. Please try again later.</p>
                </Card>
            </div>
        );
    }

    return (
        <div className="dashboard-container">
            {/* First Row: Total Deposit, Total Withdraw, Transaction Success Rate */}
            <Row gutter={16} className="dashboard-row">
                <Col span={8}>
                    <Card
                        className="dashboard-card"
                        hoverable
                        title={
                            <div className="card-header">
                                <span>Total Deposit</span>
                                <ArrowUpOutlined className="card-icon" style={{ color: 'green' }} />
                            </div>
                        }
                    >
                        <div className="card-content">
                            <div className="card-value">
                                {formatCurrency(stats.totalDepositAmount)}
                            </div>
                            <div className="card-subtext">
                                {stats.totalDepositTransactions} Transactions
                            </div>
                        </div>
                    </Card>
                </Col>

                <Col span={8}>
                    <Card
                        className="dashboard-card"
                        hoverable
                        title={
                            <div className="card-header">
                                <span>Total Withdrawal</span>
                                <ArrowDownOutlined className="card-icon" style={{ color: 'red' }} />
                            </div>
                        }
                    >
                        <div className="card-content">
                            <div className="card-value">
                                {formatCurrency(stats.totalWithdrawalAmount)}
                            </div>
                            <div className="card-subtext">
                                {stats.totalWithdrawalTransactions} Transactions
                            </div>
                        </div>
                    </Card>
                </Col>

                <Col span={8}>
                    <Card
                        className="dashboard-card"
                        hoverable
                        title={
                            <div className="card-header">
                                <span>Transaction Success</span>
                                <CreditCardOutlined className="card-icon" />
                            </div>
                        }
                    >
                        <div className="card-content">
                            <div className="card-value">
                                {stats.successfulTransactions} Successful
                            </div>
                            <div className="card-subtext">
                                {stats.pendingTransactions} Pending, {stats.failedTransactions} Failed
                            </div>
                        </div>
                    </Card>
                </Col>
            </Row>

            {/* Second Row: Total Customers and Average Transaction Amount */}
            <Row gutter={16} className="dashboard-row">
                <Col span={12}>
                    <Card
                        className="dashboard-card"
                        hoverable
                        title={
                            <div className="card-header">
                                <span>Total Customers</span>
                                <DollarOutlined className="card-icon" />
                            </div>
                        }
                    >
                        <div className="card-content">
                            <div className="card-value">{stats.totalCustomers}</div>
                        </div>
                    </Card>
                </Col>

                <Col span={12}>
                    <Card
                        className="dashboard-card"
                        hoverable
                        title={
                            <div className="card-header">
                                <span>Avg Transaction Amount</span>
                                <DollarOutlined className="card-icon" />
                            </div>
                        }
                    >
                        <div className="card-content">
                            <div className="card-value">
                                {formatCurrency(stats.averageTransactionAmount)}
                            </div>
                        </div>
                    </Card>
                </Col>
            </Row>

            {/* Third Row: Most Active Period */}
            <Row gutter={16} className="dashboard-row">
                <Col span={24}>
                    <Card
                        className="dashboard-card"
                        hoverable
                        title={
                            <div className="card-header">
                                <span>Most Active Period</span>
                                <ClockCircleOutlined className="card-icon" />
                            </div>
                        }
                    >
                        <div className="card-content">
                            <div className="card-value">
                                {formatDate(stats.mostActiveTransactionPeriod)}
                            </div>
                        </div>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default Dashboard;