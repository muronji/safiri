import React, {useEffect} from "react";
import { Form, Modal, Input, Button, message } from "antd";
import {performB2CTransaction} from "../../apicalls";

function SendMoneyModal({ showSendMoneyModal, setShowSendMoneyModal, user = {} }) {  // Default to empty object

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

            const transactionData = {
                receiver: values.receiver,
                amount: values.amount,
            };

            // Call the API to perform the transaction
            const response = await performB2CTransaction(user.id, transactionData);

            message.success("Transaction successful!");
            console.log("Transaction Response:", response);
            setShowSendMoneyModal(false);
        } catch (error) {
            message.error("Transaction failed. Please try again.");
            console.log("Error:", error);
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
                    className="w-100"
                    rules={[
                        { required: true, message: "Phone number is required" },
                        {
                            pattern: /^2547\\d{8}$/,
                            message: "Phone number must be 10 digits and start with 254",
                        },
                    ]}
                >
                    <Input placeholder="254712345678" maxLength={12} />
                </Form.Item>

                <Form.Item
                    label="Amount"
                    name="amount"
                    className="w-100"
                    rules={[
                        { required: true, message: "Please enter an amount" },
                        {
                            validator: (_, value) =>
                                value > 0 && value <= (user?.balance ?? 0)  // Use optional chaining to avoid undefined errors
                                    ? Promise.resolve()
                                    : Promise.reject(new Error("Insufficient funds")),
                        },
                    ]}
                >
                    <Input type="number" placeholder="1000" />
                </Form.Item>

                <div className="flex justify-end gap-1">
                    <Button onClick={() => setShowSendMoneyModal(false)}>Cancel</Button>
                    <Button type="primary" onClick={handleSendMoney}>
                        Send
                    </Button>
                </div>
            </Form>
        </Modal>
    );
}

export default SendMoneyModal;
