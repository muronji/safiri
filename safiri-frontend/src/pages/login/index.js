import React, { useState } from "react";
import { Button, Form, Input, message } from "antd";
import "./../../stylesheets/form.css";
import logo from "./../../images/international.png";
import { Link, useNavigate } from "react-router-dom";
import { loginUser } from "../../apicalls";
import { useAuth } from "../../redux/AuthContext";

const Login = () => {
  const [form] = Form.useForm();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { setUser, login } = useAuth();

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      const values = await form.validateFields();

      console.log("Login Attempt - Payload:", {
        email: values.email,
        passwordLength: values.password.length,
      });

      const authResponse = await loginUser(values);

      console.log("Full Login Response:", authResponse);

      // Directly set the user in the context
      setUser(authResponse);

      // Call login to update authentication state
      await login(values);

      // Debug log to check the role
      console.log("User Role:", authResponse.user.role);
      console.log("Role Type:", typeof authResponse.user.role);
      console.log("Role Comparison:", authResponse.user.role === "ADMIN");

      // Redirect based on user role
      const redirectRoute =
          authResponse.user.role === "ADMIN" ? "/dashboard" : "/home";

      message.success("Login successful! Redirecting...");
      setTimeout(() => navigate(redirectRoute), 1000);
    } catch (error) {
      console.error("Login Error:", error);
      message.error(
          error.response?.data?.message ||
          error.message ||
          "Login failed! Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
      <div className="form-container">
        <div className="form-header">
          <div className="logo">
            <img src={logo} alt="Safiri Logo" className="logo-img" />
            <h1>SAFIRI - LOGIN</h1>
          </div>
          <hr className="form-divider" />
        </div>

        <Form form={form} layout="vertical">
          <Form.Item
              label="Email"
              name="email"
              rules={[
                { required: true, type: "email", message: "Enter a valid email" },
              ]}
          >
            <Input placeholder="Enter email" />
          </Form.Item>

          <Form.Item
              label="Password"
              name="password"
              rules={[{ required: true, message: "Enter your password" }]}
          >
            <Input.Password placeholder="Enter password" />
          </Form.Item>

          <div className="form-button-container">
            <Button
                type="primary"
                className="form-button"
                onClick={handleSubmit}
                loading={isSubmitting}
            >
              Login
            </Button>
          </div>

          <div className="form-footer">
            <p>
              Don't have an account? <Link to="/register">Register here</Link>
            </p>
          </div>
        </Form>
      </div>
  );
};

export default Login;
