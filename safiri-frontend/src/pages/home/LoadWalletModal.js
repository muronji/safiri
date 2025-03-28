import React, { useEffect, useState } from "react";
import { Form, Modal, Input, Button, message } from "antd";
import { fundWallet } from "../../apicalls";
import { convertUSDToKES } from "../../services/currencyService";

function LoadWalletModal({
  showLoadWalletModal,
  setShowLoadWalletModal,
  user = {},
}) {
  const [form] = Form.useForm();
  const [kesAmount, setKesAmount] = useState("0.00");

  useEffect(() => {
    console.log("LoadWalletModal opened. User:", user);
  }, [showLoadWalletModal]);

  const handleAmountChange = async (e) => {
    const usdAmount = parseFloat(e.target.value) || 0;
    const kesValue = await convertUSDToKES(usdAmount);
    setKesAmount(kesValue);
  };

  const handleLoadWallet = async () => {
    try {
      const values = await form.validateFields();
      console.log("Amount from form:", values.amount);

      const response = await fundWallet(values.amount);
      console.log("Wallet Top-Up Response:", response);

      message.success("Wallet loaded successfully!");
      setShowLoadWalletModal(false);
      form.resetFields();
      setKesAmount("0.00");
    } catch (error) {
      message.error("Wallet top-up failed. Please try again.");
      console.log("Error details:", error);
    }
  };

  return (
    <Modal
      title="Load Wallet"
      open={showLoadWalletModal}
      onCancel={() => setShowLoadWalletModal(false)}
      footer={null}
    >
      <Form form={form} layout="vertical">
        <Form.Item
          label="Amount (USD)"
          name="amount"
          rules={[
            { required: true, message: "Please enter an amount" },
            {
              validator: (_, value) =>
                value > 0
                  ? Promise.resolve()
                  : Promise.reject(
                      new Error("Amount must be greater than zero")
                    ),
            },
          ]}
        >
          <Input
            type="number"
            placeholder="Enter amount in USD"
            onChange={handleAmountChange}
          />
        </Form.Item>

        <div className="kes-equivalent">
          <p>Equivalent in KES: KES {kesAmount}</p>
        </div>

        <div className="flex justify-end gap-1">
          <Button onClick={() => setShowLoadWalletModal(false)}>Cancel</Button>
          <Button type="primary" onClick={handleLoadWallet}>
            Load Wallet
          </Button>
        </div>
      </Form>
    </Modal>
  );
}

export default LoadWalletModal;
