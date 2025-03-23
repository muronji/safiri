import React, { useEffect } from "react";
import { Form, Modal, Input, Button, message } from "antd";
import { performB2CTransaction } from "../../apicalls";

function SendMoneyModal({ showSendMoneyModal, setShowSendMoneyModal, user = {} }) {
    const [form] = Form.useForm();

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

            // Pass the values directly to performB2CTransaction
            const response = await performB2CTransaction({
                receiver: values.receiver,
                amount: values.amount
            });

            message.success("Transaction successful!");
            console.log("Transaction Response:", response);
            setShowSendMoneyModal(false);

            // Optionally refresh user balance after successful transaction
            // if you have a function to do so

        } catch (error) {
            message.error("Transaction failed. Please try again.");
            console.log("Error:", error);
        }
    };

    // Rest of the component remains the same
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
                    label="Amount"
                    name="amount"
                    rules={[
                        { required: true, message: "Please enter an amount" },
                        {
                            validator: (_, value) =>
                                value > 0 && value <= (user?.walletBalance ?? 0)
                                    ? Promise.resolve()
                                    : Promise.reject(new Error("Insufficient funds")),
                        },
                    ]}
                >
                    <Input type="number" placeholder="1000" />
                </Form.Item>

                <Form.Item shouldUpdate>
                    {() => (
                        <div className="flex justify-end gap-1">
                            <Button onClick={() => setShowSendMoneyModal(false)}>Cancel</Button>
                            <Button
                                type="primary"
                                onClick={handleSendMoney}
                                disabled={
                                    form.getFieldsError().some(({ errors }) => errors.length)
                                }
                            >
                                Send
                            </Button>
                        </div>
                    )}
                </Form.Item>
            </Form>
        </Modal>
    );
}

export default SendMoneyModal;