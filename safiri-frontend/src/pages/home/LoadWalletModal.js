import React, { useEffect } from "react";
import { Form, Modal, Input, Button, message } from "antd";
import { performWalletTopUp } from "../../apicalls";

function LoadWalletModal({ showLoadWalletModal, setShowLoadWalletModal, user = {} }) {
    const [form] = Form.useForm();

    useEffect(() => {
        console.log("LoadWalletModal opened. User:", user);
    }, [showLoadWalletModal]);

    const handleLoadWallet = async () => {
        try {
            const values = await form.validateFields();
            if (!user || !user.id) {
                message.error("User not found. Please log in.");
                return;
            }

            const response = await performWalletTopUp(user.id, values.amount);
            message.success("Wallet loaded successfully!");
            console.log("Wallet Top-Up Response:", response);

            setShowLoadWalletModal(false);
            form.resetFields();
        } catch (error) {
            message.error("Wallet top-up failed. Please try again.");
            console.log("Error:", error);
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
                    label="Amount"
                    name="amount"
                    rules={[
                        { required: true, message: "Please enter an amount" },
                        {
                            validator: (_, value) =>
                                value > 0
                                    ? Promise.resolve()
                                    : Promise.reject(new Error("Amount must be greater than zero")),
                        },
                    ]}
                >
                    <Input type="number" placeholder="Enter amount" />
                </Form.Item>

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
