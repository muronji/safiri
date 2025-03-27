import React from "react";
import { useAuth } from "../redux/AuthContext";
import { fetchUserTransactions } from "../apicalls";
import { SearchOutlined, DownloadOutlined } from "@ant-design/icons";
import { Card, Input, Table, Button, Space, DatePicker, Select } from "antd";
import "../stylesheets/transaction.css";
import { useProtectedRoute } from "../redux/UseProtectedRoutes";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import moment from "moment";
import logo from "../images/international.png";

const { RangePicker } = DatePicker;
const { Option } = Select;

// Constants
const STATUS_OPTIONS = [
  { text: "Success", value: "success" },
  { text: "Pending", value: "pending" },
  { text: "Failed", value: "failed" },
];

const COLORS = {
  primaryGreen: [0, 75, 35],
  goldColor: [201, 162, 39],
};

// PDF Generation Helper Functions
const createWhiteLogo = (img, canvas) => {
  const ctx = canvas.getContext("2d");
  canvas.width = img.width;
  canvas.height = img.height;
  ctx.drawImage(img, 0, 0);

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] > 0) {
      data[i] = data[i + 1] = data[i + 2] = 255;
    }
  }
  ctx.putImageData(imageData, 0, 0);
  return canvas;
};

const generatePDFHeader = (doc, imgX, imgY, imgWidth, imgHeight, canvas) => {
  doc.addImage(canvas.toDataURL(), "PNG", imgX, imgY, imgWidth, imgHeight);
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(24);
  doc.text("Safiri", imgX + imgWidth + 5, imgY + 15);
};

const generatePDFFilters = (doc, yPos, filters, totalResults) => {
  const { searchText, statusFilter, dateRange } = filters;

  if (searchText || statusFilter || dateRange) {
    doc.setFontSize(10);
    doc.text("Applied Filters:", 15, yPos);
    yPos += 5;

    if (searchText) {
      doc.text(`Search Term: "${searchText}"`, 20, yPos);
      yPos += 5;
    }
    if (statusFilter) {
      doc.text(
          `Status: ${
              statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)
          }`,
          20,
          yPos
      );
      yPos += 5;
    }
    if (dateRange) {
      doc.text(
          `Date Range: ${dateRange[0].format(
              "MM/DD/YYYY"
          )} - ${dateRange[1].format("MM/DD/YYYY")}`,
          20,
          yPos
      );
      yPos += 5;
    }

    doc.text(`Total Results: ${totalResults}`, 15, yPos);
    yPos += 8;
  }
  return yPos;
};

const Transactions = () => {
  const user = useProtectedRoute();
  const { token } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [dateRange, setDateRange] = useState(null);

  useEffect(() => {
    if (!user) return;

    const fetchTransactions = async () => {
      try {
        setLoading(true);
        const data = await fetchUserTransactions(user.id, token);
        setTransactions(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [user, token]);

  const filteredTransactions = transactions.filter((tx) => {
    const matchesSearch = Object.values(tx).some((value) =>
        String(value).toLowerCase().includes(searchText.toLowerCase())
    );

    const matchesStatus = statusFilter
        ? tx.transactionStatus?.toLowerCase() === statusFilter.toLowerCase()
        : true;

    const matchesDate = !dateRange
        ? true
        : moment(tx.transactionDate).isBetween(
            dateRange[0],
            dateRange[1],
            "day",
            "[]"
        );

    return matchesSearch && matchesStatus && matchesDate;
  });

  const columns = [
    {
      title: "Date",
      dataIndex: "transactionDate",
      key: "transactionDate",
      render: (date) => (date ? new Date(date).toLocaleString() : "N/A"),
      sorter: (a, b) =>
          new Date(a.transactionDate) - new Date(b.transactionDate),
    },
    {
      title: "Tx Ref",
      dataIndex: "txRef",
      key: "txRef",
      render: (txRef) => txRef || "N/A",
    },
    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
      render: (amount) =>
          `$${typeof amount === "number" ? amount.toFixed(2) : "0.00"}`,
      sorter: (a, b) => a.amount - b.amount,
    },
    {
      title: "Type",
      dataIndex: "transactionType",
      key: "transactionType",
      render: (type) => type || "Unknown",
    },
    {
      title: "Status",
      dataIndex: "transactionStatus",
      key: "transactionStatus",
      render: (status) => (
          <span className={(status || "unknown").toLowerCase()}>
          {status || "Unknown"}
        </span>
      ),
    },
  ];

  const downloadReport = () => {
    const doc = new jsPDF();

    // Add header with green background
    doc.setFillColor(...COLORS.primaryGreen);
    doc.rect(0, 0, 210, 30, "F");

    // Setup dimensions
    const imgWidth = 20,
        imgHeight = 20;
    const pageWidth = doc.internal.pageSize.width;
    const imgX = (pageWidth - imgWidth) / 2 - 30;
    const imgY = 5;

    // Create temporary canvas for white logo
    const canvas = document.createElement("canvas");
    const img = new Image();

    img.onload = () => {
      const whiteLogoCanvas = createWhiteLogo(img, canvas);
      generatePDFHeader(doc, imgX, imgY, imgWidth, imgHeight, whiteLogoCanvas);

      // Add "My Transactions" subtitle
      doc.setTextColor(...COLORS.primaryGreen);
      doc.setFontSize(18);
      doc.text("My Transactions", 15, 40);

      // Add filters
      let yPos = generatePDFFilters(
          doc,
          45,
          { searchText, statusFilter, dateRange },
          filteredTransactions.length
      );

      // Add table
      autoTable(doc, {
        head: [["Date", "Reference", "Amount", "Type", "Status"]],
        body: filteredTransactions.map((tx) => [
          moment(tx.transactionDate).format("MM/DD/YYYY HH:mm:ss"),
          tx.txRef || "N/A",
          `$${typeof tx.amount === "number" ? tx.amount.toFixed(2) : "0.00"}`,
          tx.transactionType || "Unknown",
          tx.transactionStatus || "Unknown",
        ]),
        startY: yPos + 2,
        styles: { fontSize: 8 },
        headStyles: {
          fillColor: COLORS.primaryGreen,
          textColor: COLORS.goldColor,
          fontStyle: "bold",
        },
      });

      // Add generation date at bottom
      const pageHeight = doc.internal.pageSize.height;
      doc.setTextColor(...COLORS.primaryGreen);
      doc.setFontSize(8);
      doc.text(
          `Generated on: ${moment().format("MMMM D, YYYY, h:mm A")}`,
          pageWidth / 2,
          pageHeight - 10,
          { align: "center" }
      );

      doc.save("my-transactions.pdf");
    };

    img.src = logo;
  };

  return (
      <div className="transactions-container">
        <h1 className="title">Transactions</h1>
        <Card className="filters-card" bordered={false}>
          <Space direction="vertical" size="middle" style={{ width: "100%" }}>
            <div className="filters">
              <Input
                  prefix={<SearchOutlined />}
                  placeholder="Search transactions"
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  className="search-input"
                  allowClear
              />
              <Select
                  placeholder="Filter by Status"
                  onChange={(value) => setStatusFilter(value)}
                  value={statusFilter}
                  allowClear
                  className="status-filter"
              >
                {STATUS_OPTIONS.map((option) => (
                    <Option key={option.value} value={option.value}>
                      {option.text}
                    </Option>
                ))}
              </Select>
              <RangePicker
                  onChange={(dates) => setDateRange(dates)}
                  className="date-range"
              />
              <Button
                  type="primary"
                  icon={<DownloadOutlined />}
                  onClick={downloadReport}
                  disabled={filteredTransactions.length === 0}
              >
                Download Report
              </Button>
            </div>
          </Space>
        </Card>

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
                    showTotal: (total, range) =>
                        `${range[0]}-${range[1]} of ${total} transactions`,
                  }}
                  scroll={{ x: "100%" }}
              />
          )}
        </Card>
      </div>
  );
};

export default Transactions;
