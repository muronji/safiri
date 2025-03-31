import React, { useState, useEffect } from "react";
import {
  Card,
  Input,
  Select,
  Table,
  Alert,
  Button,
  DatePicker,
  Space,
} from "antd";
import { DownloadOutlined } from "@ant-design/icons";
import { fetchTransactions } from "../../apicalls";
import "../../stylesheets/TransactionsReport.css";
import "../../stylesheets/CustomerReports.css";
import { useProtectedRoute } from "../../redux/UseProtectedRoutes";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import moment from "moment";
import logo from "../../images/international.png";
import Loading from "../../components/Loading";

const { Option } = Select;
const { RangePicker } = DatePicker;

export function TransactionsReport() {
  const user = useProtectedRoute();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("");
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState(null);

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
    .map((tx) => ({
      ...tx,
      txRef: tx.txRef ? tx.txRef.toLowerCase() : "N/A",
    }))
    .filter((tx) => {
      const matchesSearch =
        tx.txRef.includes(search.toLowerCase()) || tx.txRef === "N/A";
      const matchesStatus = filter ? tx.transactionStatus === filter : true;
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
    { title: "ID", dataIndex: "transactionId", key: "transactionId" },
    { title: "Reference", dataIndex: "txRef", key: "txRef" },
    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
      render: (amount) => `$${Number(amount).toFixed(2)}`,
    },
    { title: "Type", dataIndex: "transactionType", key: "transactionType" },
    {
      title: "Status",
      dataIndex: "transactionStatus",
      key: "transactionStatus",
      render: (status) => (
        <span className={(status || "unknown").toLowerCase()}>
          {status || "Unknown"}
        </span>
      ),
      filters: [
        { text: "Success", value: "success" },
        { text: "Pending", value: "pending" },
        { text: "Failed", value: "failed" },
      ],
      onFilter: (value, record) =>
        record.transactionStatus.toLowerCase() === value,
    },
    { title: "Date", dataIndex: "transactionDate", key: "transactionDate" },
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
    const pageWidth = doc.internal.pageSize.width;
    const imgX = (pageWidth - imgWidth) / 2 - 30; // Shift logo left of center
    const imgY = 5;

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

      // Add "Transaction Report" subtitle (left aligned and in green)
      doc.setTextColor(...primaryGreen);
      doc.setFontSize(18);
      doc.text("Transaction Report", 15, 40);

      // Modified filters section
      let yPos = 45;
      if (search || filter || dateRange) {
        doc.setFontSize(10);
        doc.text("Applied Filters:", 15, yPos);
        yPos += 5;

        if (search) {
          doc.text(`Search Term: "${search}"`, 20, yPos);
          yPos += 5;
        }
        if (filter) {
          doc.text(
            `Status: ${filter.charAt(0).toUpperCase() + filter.slice(1)}`,
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

        doc.text(`Total Results: ${filteredTransactions.length}`, 15, yPos);
        yPos += 8;
      }

      // Add table with transaction data
      autoTable(doc, {
        head: [["ID", "Reference", "Amount", "Type", "Status", "Date"]],
        body: filteredTransactions.map((tx) => [
          tx.transactionId,
          tx.txRef || "N/A",
          `$${Number(tx.amount).toFixed(2)}`,
          tx.transactionType,
          tx.transactionStatus || "Unknown",
          tx.transactionDate,
        ]),
        startY: yPos + 2,
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
      doc.save("transaction-report.pdf");
    };

    // Load the image
    img.src = logo;
  };

  if (!user) return null;

  return (
    <div className="transactions-report-container">
      <h1 className="title">Transaction Reports</h1>
      {error && <Alert message={error} type="error" showIcon />}

      <Card className="filters-card" bordered={false}>
        <Space direction="vertical" size="middle" style={{ width: "100%" }}>
          <div className="filters">
            <Input
              placeholder="Search by Reference or Type..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="search-input"
              allowClear
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
        {loading ? (
          <Loading text="Loading transactions..." />
        ) : (
          <Table
            dataSource={filteredTransactions}
            columns={columns}
            rowKey="transactionId"
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              pageSizeOptions: [5, 10, 20, 50],
            }}
            scroll={{ x: "max-content", y: 400 }}
          />
        )}
      </Card>
    </div>
  );
}
