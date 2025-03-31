import React, { useState } from "react";
import { Button, Col, Form, Input, message, Row, Select} from "antd";
import "../../stylesheets/form.css";
import logo from "./../../images/international.png";
import { registerUser } from "../../apicalls";
import { useAuth } from "../../redux/AuthContext";
import {Link, useNavigate} from "react-router-dom";

const Register = () => {
  const [form] = Form.useForm();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth(); // Get login function from AuthContext

  const validatePassword = (_, value) => {
    if (!value) {
      return Promise.reject("Please enter a password");
    }
    if (
      !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(
        value
      )
    ) {
      return Promise.reject(
        "Password must be at least 8 characters, include an uppercase letter, a number, and a special character."
      );
    }
    return Promise.resolve();
  };

  const validateConfirmPassword = ({ getFieldValue }) => ({
    validator(_, value) {
      if (!value) {
        return Promise.reject("Please confirm your password");
      }
      if (value !== getFieldValue("password")) {
        return Promise.reject("Passwords do not match!");
      }
      return Promise.resolve();
    },
  });

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      await form.validateFields();

      const formData = {
        firstName: form.getFieldValue("firstName").trim(),
        lastName: form.getFieldValue("lastName").trim(),
        email: form.getFieldValue("email").trim(),
        phoneNumber: form.getFieldValue("phone").trim(),
        identifier: form.getFieldValue("idNumber").trim(),
        identifierType: form.getFieldValue("idType"),
        password: form.getFieldValue("password").trim(),
      };

      console.log("Submitting:", formData);

      const data = await registerUser(formData); // Call API

      if (data.token) {
        message.success("Registration successful! Redirecting to login...");
        setTimeout(() => navigate("/login"), 2000);
      } else {
        throw new Error("No token received, authentication failed.");
      }
    } catch (error) {
      message.error(error.message || "Registration failed!");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Define validation rules for the form
  const formRules = {
    firstName: [
      { required: true, message: "First name is required" },
      {
        pattern: /^[A-Za-z]+$/,
        message: "First name must contain only letters",
      },
    ],
    lastName: [
      { required: true, message: "Last name is required" },
      {
        pattern: /^[A-Za-z]+$/,
        message: "Last name must contain only letters",
      },
    ],
    email: [
      { required: true, message: "Email is required" },
      { type: "email", message: "Enter a valid email address" },
    ],
    phone: [
      { required: true, message: "Phone number is required" },
      { pattern: /^[0-9]{10}$/, message: "Phone number must be 10 digits" },
    ],
    idNumber: [
      { required: true, message: "Identifier is required" },
      { pattern: /^[0-9]+$/, message: "Identifier must contain only numbers" },
    ],
    password: [
      { required: true, message: "Password is required" },
      { validator: validatePassword },
    ],
  };

  return (
    <div className="form-container">
      <div className="form-header">
        <div className="logo">
          <img src={logo} alt="Safiri Logo" className="logo-img" />
          <h1>SAFIRI - REGISTER</h1>
        </div>
        <hr className="form-divider" />
      </div>

      <Form form={form} layout="vertical">
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="First Name"
              name="firstName"
              rules={formRules.firstName}
            >
              <Input placeholder="Enter your first name" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="Last Name"
              name="lastName"
              rules={formRules.lastName}
            >
              <Input placeholder="Enter your last name" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label="Email" name="email" rules={formRules.email}>
              <Input placeholder="Enter your email" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="Phone Number"
              name="phone"
              rules={formRules.phone}
            >
              <Input placeholder="Enter your phone number" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="ID Type"
              name="idType"
              rules={[
                { required: true, message: "Please select your ID type" },
              ]}
            >
              <Select placeholder="Select ID Type">
                <Select.Option value="national_id">National ID</Select.Option>
                <Select.Option value="passport">Passport</Select.Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="ID Number"
              name="idNumber"
              rules={formRules.idNumber}
            >
              <Input placeholder="Enter your ID number" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Password"
              name="password"
              rules={formRules.password}
              hasFeedback
            >
              <Input.Password placeholder="Enter your password" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="Confirm Password"
              name="confirmPassword"
              dependencies={["password"]}
              rules={[
                { required: true, message: "Please confirm your password" },
                validateConfirmPassword,
              ]}
              hasFeedback
            >
              <Input.Password placeholder="Confirm your password" />
            </Form.Item>
          </Col>
        </Row>

        {/* Submit Button */}
        <div className="form-button-container">
          <Button
            type="primary"
            className="form-button"
            onClick={handleSubmit}
            loading={isSubmitting}
          >
            Register
          </Button>
        </div>

        <div className="form-footer">
          <p>
            Already registered? <Link to="/login">Login</Link>
          </p>
        </div>
      </Form>
    </div>
  );
};

export default Register;
