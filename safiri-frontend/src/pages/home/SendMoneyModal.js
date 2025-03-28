import React, { useEffect } from "react";
import { Form, Modal, Input, Button, message } from "antd";
import { useNavigate } from "react-router-dom";
import { performB2CTransaction } from "../../apicalls";

function SendMoneyModal({
  showSendMoneyModal,
  setShowSendMoneyModal,
  user = {},
}) {
  const [form] = Form.useForm();
  const navigate = useNavigate();

  useEffect(() => {
    console.log("Modal should be visible:", showSendMoneyModal);
  }, [showSendMoneyModal]);

  useEffect(() => {
    console.log("SendMoneyModal opened. User:", user);
  }, []);

  const handleSendMoney = async () => {
    try {
      const values = await form.validateFields();
      console.log("Sending money:", values);

      // Perform the transaction with KES amount
      const response = await performB2CTransaction({
        receiver: values.receiver,
        amount: values.amount,
      });

      // Log the full response for debugging
      console.log("Full API Response:", response);

      // Check transaction success based on the specific response structure
      const isTransactionSuccessful =
        response.ResponseCode === "0" &&
        response.ResponseDescription ===
          "Accept the service request successfully.";

      if (isTransactionSuccessful) {
        message.success("Transaction successful!");

        // Close the modal
        setShowSendMoneyModal(false);

        // Redirect to TransactionsReceipt with transaction details
        navigate("/transactionsReceipt", {
          state: {
            receiver: values.receiver,
            amount: values.amount,
            conversationId: response.ConversationID,
            originatorConversationId: response.OriginatorConversationID,
            timestamp: new Date().toISOString(),
          },
        });
      } else {
        // If success conditions are not met
        throw new Error(
          response.ResponseDescription || "Transaction processing failed"
        );
      }
    } catch (error) {
      // Log the full error for debugging
      console.error("Full Error:", error);

      // Display a more informative error message
      message.error(
        error.message ||
          "Transaction failed. Please check your connection and try again."
      );
    }
  };

  return (
    <Modal
      title="Send Money"
      open={showSendMoneyModal}
      onCancel={() => setShowSendMoneyModal(false)}
      footer={null}
    >
      <Form form={form} layout="vertical">
        <Form.Item
          label="Phone Number"
          name="receiver"
          rules={[
            { required: true, message: "Phone number is required" },
            {
              pattern: /^2547\d{8}$/,
              message: "Phone number must be 12 digits, starting with 2547",
            },
          ]}
        >
          <Input placeholder="254712345678" maxLength={12} />
        </Form.Item>

        <Form.Item
          label="Amount (KES)"
          name="amount"
          rules={[
            { required: true, message: "Please enter an amount" },
            {
              validator: (_, value) => {
                const kesAmount = parseFloat(value) || 0;
                // Convert USD wallet balance to KES for comparison
                const walletBalanceInKes = (user?.walletBalance ?? 0) * 150;
                return kesAmount <= walletBalanceInKes
                  ? Promise.resolve()
                  : Promise.reject(new Error("Insufficient funds"));
              },
            },
          ]}
        >
          <Input type="number" placeholder="1000" />
        </Form.Item>

        <div className="flex justify-end gap-1">
          <Button onClick={() => setShowSendMoneyModal(false)}>Cancel</Button>
          <Button
            type="primary"
            onClick={handleSendMoney}
            disabled={form.getFieldsError().some(({ errors }) => errors.length)}
          >
            Send
          </Button>
        </div>
      </Form>
    </Modal>
  );
}

export default SendMoneyModal;
