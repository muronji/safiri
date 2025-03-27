import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { Card, Button, Typography, Spin, Alert } from "antd";
import { jsPDF } from "jspdf";
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
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4'
        });

        // Colors
        const darkGreen = [0, 75, 35];
        const goldColor = [201, 162, 39];

        // Page background
        doc.setFillColor(255, 255, 255); // White background
        doc.rect(0, 0, 210, 297, 'F');

        // Header with Dark Green Background
        doc.setFillColor(...darkGreen);
        doc.rect(0, 0, 210, 30, 'F');

        // Add logo
        const imgWidth = 20, imgHeight = 20;
        const imgX = 10, imgY = 5;
        doc.addImage(logo, "PNG", imgX, imgY, imgWidth, imgHeight);

        // Title
        doc.setTextColor(...darkGreen);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(18);
        doc.text("Safiri", 180, 15, { align: 'right' });

        // Subtitle
        doc.setTextColor(0, 0, 0);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(16);
        doc.text("Transaction Receipt", 105, 45, { align: 'center' });

        // Transaction details
        const startY = 60;
        const lineHeight = 10;
        const leftMargin = 20;
        const valueMargin = 130;

        doc.setFont("helvetica", "normal");
        doc.setFontSize(12);
        doc.setTextColor(0, 0, 0);

        const details = [
            { label: "Transaction ID", value: transaction.transactionId },
            { label: "Reference", value: transaction.transactionReference },
            { label: "Amount", value: `$${transaction.amount.toFixed(2)}` },
            { label: "Type", value: transaction.transactionType },
            { label: "Status", value: transaction.transactionStatus },
            { label: "Date", value: transaction.formattedTransactionDate },
            { label: "Previous Balance", value: `$${transaction.previousBalance.toFixed(2)}` },
            { label: "Current Balance", value: `$${transaction.currentBalance.toFixed(2)}` },
        ];

        if (receiver) {
            details.push({ label: "Receiver", value: receiver });
        }

        if (transaction.additionalDetails) {
            details.push({ label: "Details", value: transaction.additionalDetails });
        }

        // Draw a border
        doc.setDrawColor(...goldColor);
        doc.setLineWidth(1);
        doc.rect(10, 10, 190, 277);

        // Render details with styled labels
        details.forEach((detail, index) => {
            // Label in dark green, bold
            doc.setFont("helvetica", "bold");
            doc.setTextColor(...darkGreen);
            doc.text(detail.label, leftMargin, startY + (index * lineHeight));

            // Value in black, normal weight
            doc.setFont("helvetica", "normal");
            doc.setTextColor(0, 0, 0);
            doc.text(detail.value, valueMargin, startY + (index * lineHeight));
        });

        // Add a subtle watermark or background pattern if desired
        doc.setTextColor(200, 200, 200);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(40);
        doc.text("SAFIRI", 105, 180, { align: 'center', angle: 45, opacity: 0.1 });

        // Save the PDF
        doc.save(`Transaction_Receipt_${transaction.transactionId}.pdf`);
    };

    if (loading) {
        return <Spin tip="Loading receipt..." className="loading-spinner" />;
    }

    if (error) {
        return <Alert message="Error" description={error} type="error" showIcon />;
    }

    if (!transaction) {
        return <Text className="no-transaction">No transaction data available</Text>;
    }

    return (
        <Card className="receipt-container">
            <div className="receipt-header">
                <img src={logo} alt="Safiri Logo" className="safiri-logo" />
                <Title level={2} className="safiri-title">Safiri</Title>
            </div>

            <Title level={3} className="receipt-title">Transaction Receipt</Title>

            <div className="receipt-details">
                <Text><span className="label">Transaction ID:</span> {transaction.transactionId}</Text>
                <Text><span className="label">Reference:</span> {transaction.transactionReference}</Text>
                <Text><span className="label">Amount:</span> ${transaction.amount.toFixed(2)}</Text>
                <Text><span className="label">Type:</span> {transaction.transactionType}</Text>
                <Text><span className="label">Status:</span> {transaction.transactionStatus}</Text>
                <Text><span className="label">Date:</span> {transaction.formattedTransactionDate}</Text>
                <Text><span className="label">Previous Balance:</span> ${transaction.previousBalance.toFixed(2)}</Text>
                <Text><span className="label">Current Balance:</span> ${transaction.currentBalance.toFixed(2)}</Text>

                {receiver && (
                    <Text><span className="label">Receiver:</span> {receiver}</Text>
                )}

                {transaction.additionalDetails && (
                    <Text><span className="label">Details:</span> {transaction.additionalDetails}</Text>
                )}
            </div>

            <div className="receipt-footer">
                <Button type="primary" className="download-button" onClick={downloadPDF}>
                    Download Receipt
                </Button>
            </div>
        </Card>
    );
};

export default TransactionsReceipt;