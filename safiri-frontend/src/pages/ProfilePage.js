import React, { useEffect, useState } from "react";
import { getCustomerProfile, updateCustomerProfile } from "../apicalls";
import "../stylesheets/profile.css"; // Ensure correct casing

const ProfilePage = () => {
    const [customer, setCustomer] = useState(null);
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        identifierType: "",
        identifier: "",
        phoneNumber: "",
        walletBalance: 0
    });
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState("");

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const data = await getCustomerProfile();
                setCustomer(data);
                setFormData({
                    firstName: data.firstName || "",
                    lastName: data.lastName || "",
                    email: data.email || "",
                    identifierType: data.identifierType || "",
                    identifier: data.identifier || "",
                    phoneNumber: data.phoneNumber || "",
                    walletBalance: data.walletBalance || 0
                });
            } catch (error) {
                setError("Failed to load profile. Please try again.");
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setUpdating(true);
        setError("");
        setSuccessMessage("");

        try {
            const updatedData = await updateCustomerProfile({
                firstName: formData.firstName,
                lastName: formData.lastName,
                email: formData.email,
                identifierType: formData.identifierType,
                identifier: formData.identifier,
                phoneNumber: formData.phoneNumber,
                walletBalance: formData.walletBalance
            });

            setCustomer(updatedData);
            setSuccessMessage("Profile updated successfully!");
        } catch (error) {
            setError("Failed to update profile. Please try again.");
        } finally {
            setUpdating(false);
        }
    };

    if (loading) return <div className="loading-container">Loading...</div>;
    if (error) return <div className="error-message">{error}</div>;

    return (
        <div>
            <h2 className="profile-title">Customer Profile</h2>
            <div className="profile-container">
                {successMessage && <p className="success-message">{successMessage}</p>}
                <form onSubmit={handleSubmit} className="profile-form">
                    <div className="form-group">
                        <label className="form-label">First Name:</label>
                        <input
                            type="text"
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleChange}
                            required
                            className="form-input"
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Last Name:</label>
                        <input
                            type="text"
                            name="lastName"
                            value={formData.lastName}
                            onChange={handleChange}
                            required
                            className="form-input"
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Email:</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            className="form-input"
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Identifier Type:</label>
                        <select
                            name="identifierType"
                            value={formData.identifierType}
                            onChange={handleChange}
                            required
                            className="form-input"
                        >
                            <option value="" disabled>Select Identifier Type</option>
                            <option value="National ID">National ID</option>
                            <option value="Passport">Passport</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Identifier:</label>
                        <input
                            type="text"
                            name="identifier"
                            value={formData.identifier}
                            onChange={handleChange}
                            required
                            className="form-input"
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Phone Number:</label>
                        <input
                            type="text"
                            name="phoneNumber"
                            value={formData.phoneNumber}
                            onChange={handleChange}
                            required
                            className="form-input"
                        />
                    </div>

                    <button
                        type="submit"
                        className="submit-button"
                        disabled={updating}
                    >
                        {updating ? "Updating..." : "Save Changes"}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ProfilePage;