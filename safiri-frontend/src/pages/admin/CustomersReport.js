import { useState, useEffect } from "react";
import { Card } from "antd";
import { Input, Select, Table } from "antd";
import { fetchCustomerReports } from "../../apicalls";
import "../../stylesheets/CustomerReports.css";
import {useNavigate} from "react-router-dom";
import {useAuth} from "../../redux/AuthContext";

const { Option } = Select;

export default function CustomerReports() {
    const {user} = useAuth();
    const navigate = useNavigate();

    console.log("User in CustomerReports:", user);


    useEffect(() => {
        if (!user) {
            navigate("/login");  // Redirect to login if user is not authenticated
        }
    }, [user, navigate]);

    if (!user) return null;

    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState("");
    const [customers, setCustomers] = useState([]);

    useEffect(() => {
        const getCustomerReports = async () => {
            try {
                const data = await fetchCustomerReports();
                setCustomers(data);
            } catch (error) {
                console.error("Failed to fetch customer reports:", error);
            }
        };

        getCustomerReports();
    }, []);

    const filteredCustomers = customers.filter(
        (customer) =>
            (customer.email.toLowerCase().includes(search.toLowerCase()) ||
                customer.identifier.toLowerCase().includes(search.toLowerCase())) &&
            (filter ? customer.identifierType === filter : true)
    );

    const columns = [
        {title: "ID", dataIndex: "id", key: "id"},
        {title: "Email", dataIndex: "email", key: "email"},
        {title: "Identifier Type", dataIndex: "identifierType", key: "identifierType"},
        {title: "Identifier", dataIndex: "identifier", key: "identifier"},
        {
            title: "Wallet Balance",
            dataIndex: "walletBalance",
            key: "walletBalance",
            render: (balance) => `$${balance.toFixed(2)}`
        },
    ];

    return (
        <div className="customer-reports-container">
            <h1 className="title">Customer Reports</h1>
            <div className="filters">
                <Input
                    placeholder="Search by Email or Identifier..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="search-input"
                />
                <Select
                    placeholder="Filter by Identifier Type"
                    onChange={setFilter}
                    allowClear
                    className="filter-select"
                >
                    <Option value="passport">Passport</Option>
                    <Option value="national_id">National Id</Option>
                </Select>
            </div>
            <Card className="table-card">
                <Table dataSource={filteredCustomers} columns={columns} rowKey="id" pagination={{pageSize: 5}}/>
            </Card>
        </div>
    );
}
