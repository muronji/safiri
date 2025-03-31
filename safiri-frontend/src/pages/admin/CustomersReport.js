import { useState, useEffect } from "react";
import {
  Card,
  Input,
  Select,
  Table,
  Button,
  DatePicker,
  Space,
  Typography,
} from "antd";
import { DownloadOutlined, FilterOutlined } from "@ant-design/icons";
import { fetchCustomerReports } from "../../apicalls";
import "../../stylesheets/CustomerReports.css";
import { useNavigate } from "react-router-dom";
import { useProtectedRoute } from "../../redux/UseProtectedRoutes";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import moment from "moment";
import logo from "../../images/international.png";
import Loading from "../../components/Loading";

const { Option } = Select;
const { RangePicker } = DatePicker;
const { Title } = Typography;

export default function CustomersReport() {
  const user = useProtectedRoute();
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("");
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState(null);
  const [balanceRange, setBalanceRange] = useState({ min: "", max: "" });

  useEffect(() => {
    const getCustomerReports = async () => {
      try {
        setLoading(true);
        const data = await fetchCustomerReports();
        setCustomers(data);
      } catch (error) {
        console.error("Failed to fetch customer reports:", error);
      } finally {
        setLoading(false);
      }
    };

    getCustomerReports();
  }, []);

  const filteredCustomers = customers.filter((customer) => {
    const matchesSearch =
      (customer.email
        ? customer.email.toLowerCase().includes(search.toLowerCase())
        : false) ||
      (customer.identifier
        ? customer.identifier.toLowerCase().includes(search.toLowerCase())
        : false);

    const matchesIdentifierType = filter
      ? customer.identifierType
        ? customer.identifierType === filter
        : false
      : true;

    const matchesBalance =
      (!balanceRange.min ||
        customer.walletBalance >= parseFloat(balanceRange.min)) &&
      (!balanceRange.max ||
        customer.walletBalance <= parseFloat(balanceRange.max));

    const matchesDate =
      !dateRange ||
      moment(customer.createdAt).isBetween(
        dateRange[0],
        dateRange[1],
        "day",
        "[]"
      );

    return (
      matchesSearch && matchesIdentifierType && matchesBalance && matchesDate
    );
  });

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      sorter: (a, b) => a.id - b.id,
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      sorter: (a, b) => a.email.localeCompare(b.email),
    },
    {
      title: "Identifier Type",
      dataIndex: "identifierType",
      key: "identifierType",
      filters: [
        { text: "Passport", value: "passport" },
        { text: "National ID", value: "national_id" },
      ],
      onFilter: (value, record) => record.identifierType === value,
      render: (type) => {
        if (!type) return "-";
        return type
          .split("_")
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" ");
      },
    },
    {
      title: "Identifier",
      dataIndex: "identifier",
      key: "identifier",
      render: (identifier) => identifier || "-",
    },
    {
      title: "Wallet Balance",
      dataIndex: "walletBalance",
      key: "walletBalance",
      sorter: (a, b) => a.walletBalance - b.walletBalance,
      render: (balance) =>
        `$${balance.toLocaleString("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}`,
      align: "right",
    },
  ];

  const downloadReport = () => {
    const doc = new jsPDF();

    // Colors
    const primaryGreen = [0, 75, 35]; // Dark green
    const goldColor = [201, 162, 39]; // #C9A227

    // Add header with green background
    doc.setFillColor(...primaryGreen);
    doc.rect(0, 0, 210, 30, "F");

    // Add centered logo and Safiri text
    const imgWidth = 20,
      imgHeight = 20;
    const imgX = 20;
    const imgY = 10;

    // Create a temporary canvas for white logo
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      // Convert to white
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      for (let i = 0; i < data.length; i += 4) {
        if (data[i + 3] > 0) {
          data[i] = data[i + 1] = data[i + 2] = 255;
        }
      }
      ctx.putImageData(imageData, 0, 0);

      // Add the white logo
      doc.addImage(canvas.toDataURL(), "PNG", imgX, imgY, imgWidth, imgHeight);

      // Add "Safiri" title in white next to logo
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(24);
      doc.text("Safiri", imgX + imgWidth + 5, imgY + 15);

      // Add "Customer Report" subtitle (left aligned and in green)
      doc.setTextColor(...primaryGreen);
      doc.setFontSize(18);
      doc.text("Customer Report", 15, 40);

      // Add filters applied (if any)
      let yPos = 45; // Reduced spacing
      if (filter) {
        doc.setFontSize(10);
        doc.text(`Identifier Type: ${filter}`, 15, yPos);
        yPos += 5;
      }
      if (dateRange) {
        doc.setFontSize(10);
        doc.text(
          `Date Range: ${dateRange[0].format(
            "MM/DD/YYYY"
          )} - ${dateRange[1].format("MM/DD/YYYY")}`,
          15,
          yPos
        );
        yPos += 5;
      }

      // Add table with reduced spacing
      autoTable(doc, {
        head: [
          ["ID", "Email", "Identifier Type", "Identifier", "Wallet Balance"],
        ],
        body: filteredCustomers.map((customer) => [
          customer.id,
          customer.email,
          customer.identifierType
            ? customer.identifierType
                .split("_")
                .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                .join(" ")
            : "-",
          customer.identifier || "-",
          `$${customer.walletBalance.toFixed(2)}`,
        ]),
        startY: yPos + 2, // Reduced spacing before table
        styles: { fontSize: 8 },
        headStyles: {
          fillColor: primaryGreen,
          textColor: goldColor,
          fontStyle: "bold",
        },
      });

      // Add generation date at bottom
      const pageHeight = doc.internal.pageSize.height;
      doc.setTextColor(...primaryGreen);
      doc.setFontSize(8);
      doc.text(
        `Generated on: ${moment().format("MMMM D, YYYY, h:mm A")}`,
        pageWidth / 2,
        pageHeight - 10,
        { align: "center" }
      );

      // Save the PDF
      doc.save("customer-report.pdf");
    };

    // Load the image
    img.src = logo;
  };

  return (
    <Card className="customer-reports-container">
      <Title level={2} className="title">
        Customer Reports
      </Title>

      <Card className="filters-card" bordered={false}>
        <Space direction="vertical" size="middle" style={{ width: "100%" }}>
          <div className="filters">
            <Input.Search
              placeholder="Search by Email or Identifier..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="search-input"
              allowClear
            />
            <Select
              placeholder="Filter by Identifier Type"
              onChange={setFilter}
              allowClear
              className="filter-select"
            >
              <Option value="passport">Passport</Option>
              <Option value="national_id">National ID</Option>
            </Select>
            <RangePicker
              onChange={(dates) => setDateRange(dates)}
              className="date-range"
            />
          </div>
          <div className="balance-filter">
            <Input
              placeholder="Min Balance"
              type="number"
              onChange={(e) =>
                setBalanceRange((prev) => ({ ...prev, min: e.target.value }))
              }
              style={{ width: 150 }}
            />
            <span style={{ margin: "0 8px" }}>to</span>
            <Input
              placeholder="Max Balance"
              type="number"
              onChange={(e) =>
                setBalanceRange((prev) => ({ ...prev, max: e.target.value }))
              }
              style={{ width: 150 }}
            />
          </div>
        </Space>
      </Card>

      <div className="table-actions">
        <Button
          type="primary"
          icon={<DownloadOutlined />}
          onClick={downloadReport}
          disabled={filteredCustomers.length === 0}
        >
          Download Report
        </Button>
      </div>

      <Card className="table-card">
        {loading ? (
          <Loading text="Loading customer reports..." />
        ) : (
          <Table
            dataSource={filteredCustomers}
            columns={columns}
            rowKey="id"
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} of ${total} customers`,
            }}
            scroll={{ x: "max-content" }}
          />
        )}
      </Card>
    </Card>
  );
}
