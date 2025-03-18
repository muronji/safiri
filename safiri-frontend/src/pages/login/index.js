import React, { useState } from "react";
import { Button, Form, Input, message } from "antd";
import "./../../stylesheets/form.css";
import logo from "./../../images/international.png";
import { Link, useNavigate } from "react-router-dom";
import {loginUser} from "../../apicalls";
import {useAuth} from "../../redux/AuthContext";

const Login = () => {
    const [form] = Form.useForm();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();
    const { login } = useAuth(); // Get login function from AuthContext

    const handleSubmit = async () => {
        try {
            setIsSubmitting(true);
            const values = await form.validateFields(); // Get form values

            const data = await loginUser(values); // Call API service function

            if (data.token) {
                login(data.user, data.token); // Update global auth state
                message.success("Login successful! Redirecting...");

                setTimeout(() => navigate("/home"), 2000);
            } else {
                throw new Error("Invalid login response.");
            }
        } catch (error) {
            message.error(error.message || "Login failed!");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="form-container">
            <div className="form-header">
                <div className="logo">
                    <img src={logo} alt="Safiri Logo" className="logo-img"/>
                    <h1>SAFIRI - LOGIN</h1>
                </div>
                <hr className="form-divider"/>
            </div>

            <Form form={form} layout="vertical">
                <Form.Item label="Email" name="email"
                           rules={[{ required: true, type: "email", message: "Enter a valid email" }]}>
                    <Input placeholder="Enter email"/>
                </Form.Item>

                <Form.Item label="Password" name="password"
                           rules={[{ required: true, message: "Enter your password" }]}>
                    <Input.Password placeholder="Enter password"/>
                </Form.Item>

                <div className="form-button-container">
                    <Button type="primary" className="form-button" onClick={handleSubmit} loading={isSubmitting}>Login</Button>
                </div>

                <div className="form-footer">
                    <p>Don't have an account? <Link to="/register">Register here</Link></p>
                </div>
            </Form>
        </div>
    );
}

export default Login;
