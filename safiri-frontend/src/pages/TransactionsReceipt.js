import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { Card, Button, Typography, Spin, Alert } from "antd";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable"; // Change the import to this
import "../stylesheets/Receipt.css";
import { fetchTransactionsReceipt } from "../apicalls";
import logo from "./../images/international.png";

const { Title, Text } = Typography;

const TransactionsReceipt = () => {
  const location = useLocation();
  const receiver = location.state?.receiver || null;

  const [transaction, setTransaction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadTransaction = async () => {
      try {
        const data = await fetchTransactionsReceipt();
        setTransaction(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    loadTransaction();
  }, []);

  const downloadPDF = () => {
    if (!transaction) {
      console.error("Transaction data is null or undefined.");
      return;
    }

    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    // Colors
    const primaryColor = [0, 75, 35]; // dark green
    const white = [255, 255, 255]; // white

    // Add green header background
    doc.setFillColor(...primaryColor);
    doc.rect(0, 0, 210, 40, "F"); // Full width green header

    // Create a canvas to manipulate the image
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;

      // Draw the original image
      ctx.drawImage(img, 0, 0);

      // Get the image data
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      // Convert to white
      for (let i = 0; i < data.length; i += 4) {
        // If pixel is not transparent
        if (data[i + 3] > 0) {
          data[i] = 255; // Red
          data[i + 1] = 255; // Green
          data[i + 2] = 255; // Blue
        }
      }

      ctx.putImageData(imageData, 0, 0);

      // Add the white logo to PDF
      const imgWidth = 20,
          imgHeight = 20;
      const imgX = 20;
      const imgY = 10;
      doc.addImage(canvas.toDataURL(), "PNG", imgX, imgY, imgWidth, imgHeight);

      // Title next to logo in white
      doc.setTextColor(...white);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(24);
      doc.text("Safiri", imgX + imgWidth + 5, imgY + 15);

      // Subtitle - Transaction Receipt (left aligned)
      doc.setTextColor(...primaryColor); // Back to green color for subtitle
      doc.setFontSize(18);
      doc.text("Transaction Receipt", 20, 55); // Left aligned at 20mm from left

      // Prepare data for table
      const tableData = [
        [
          { content: "Transaction ID:", styles: { fontStyle: "bold" } },
          transaction.transactionId,
        ],
        [
          { content: "Reference:", styles: { fontStyle: "bold" } },
          transaction.transactionReference,
        ],
        [
          { content: "Amount:", styles: { fontStyle: "bold" } },
          `$${transaction.amount.toFixed(2)}`,
        ],
        [
          { content: "Type:", styles: { fontStyle: "bold" } },
          transaction.transactionType,
        ],
        [
          { content: "Status:", styles: { fontStyle: "bold" } },
          transaction.transactionStatus,
        ],
        [
          { content: "Date:", styles: { fontStyle: "bold" } },
          transaction.formattedTransactionDate,
        ],
        [
          { content: "Previous Balance:", styles: { fontStyle: "bold" } },
          `$${transaction.previousBalance.toFixed(2)}`,
        ],
        [
          { content: "Current Balance:", styles: { fontStyle: "bold" } },
          `$${transaction.currentBalance.toFixed(2)}`,
        ],
      ];

      if (receiver) {
        tableData.push([
          { content: "Receiver:", styles: { fontStyle: "bold" } },
          receiver,
        ]);
      }

      if (transaction.additionalDetails) {
        tableData.push([
          { content: "Details:", styles: { fontStyle: "bold" } },
          transaction.additionalDetails,
        ]);
      }

      // Add table to document
      autoTable(doc, {
        startY: 65,
        head: [], // No header
        body: tableData,
        theme: "plain",
        styles: {
          fontSize: 11,
          cellPadding: 5,
        },
        columnStyles: {
          0: { cellWidth: 50, textColor: primaryColor },
          1: { cellWidth: "auto" },
        },
        margin: { left: 20 }, // Aligned with the "Transaction Receipt" text
        tableWidth: "auto",
      });

      // Save the PDF
      doc.save(`Transaction_Receipt_${transaction.transactionId}.pdf`);
    };

    img.src = logo;
  };

  if (loading) {
    return <Spin tip="Loading receipt..." className="loading-spinner" />;
  }

  if (error) {
    return <Alert message="Error" description={error} type="error" showIcon />;
  }

  if (!transaction) {
    return (
        <Text className="no-transaction">No transaction data available</Text>
    );
  }

  return (
      <Card className="receipt-container">
        <div className="receipt-header">
          <img src={logo} alt="Safiri Logo" className="safiri-logo" />
          <Title level={2} className="safiri-title">
            Safiri
          </Title>
        </div>

        <Title level={3} className="receipt-title">
          Transaction Receipt
        </Title>

        <div className="receipt-details">
          <Text>
            <span className="label">Transaction ID:</span>{" "}
            {transaction.transactionId}
          </Text>
          <Text>
            <span className="label">Reference:</span>{" "}
            {transaction.transactionReference}
          </Text>
          <Text>
            <span className="label">Amount:</span> $
            {transaction.amount.toFixed(2)}
          </Text>
          <Text>
            <span className="label">Type:</span> {transaction.transactionType}
          </Text>
          <Text>
            <span className="label">Status:</span> {transaction.transactionStatus}
          </Text>
          <Text>
            <span className="label">Date:</span>{" "}
            {transaction.formattedTransactionDate}
          </Text>
          <Text>
            <span className="label">Previous Balance:</span> $
            {transaction.previousBalance.toFixed(2)}
          </Text>
          <Text>
            <span className="label">Current Balance:</span> $
            {transaction.currentBalance.toFixed(2)}
          </Text>

          {receiver && (
              <Text>
                <span className="label">Receiver:</span> {receiver}
              </Text>
          )}

          {transaction.additionalDetails && (
              <Text>
                <span className="label">Details:</span>{" "}
                {transaction.additionalDetails}
              </Text>
          )}
        </div>

        <div className="receipt-footer">
          <Button
              type="primary"
              className="download-button"
              onClick={downloadPDF}
          >
            Download Receipt
          </Button>
        </div>
      </Card>
  );
};

export default TransactionsReceipt;
