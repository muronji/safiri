import React from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import DefaultLayout from "./components/DefaultLayout";
import routes from "./components/route";
import "remixicon/fonts/remixicon.css";
import "./stylesheets/text-elements.css";
import "./stylesheets/form-elements.css";
import "./stylesheets/alignments.css";
import "./stylesheets/theme.css";
import Login from "./pages/login";
import Register from "./pages/register";
import { AuthProvider, useAuth } from "./redux/AuthContext";
import HomePage from "./pages/home/HomePage";
import ProtectedRoute from "./redux/ProtectedRoutes";
import Transactions from "./pages/Transactions";
import ProfilePage from "./pages/ProfilePage";
import SendMoneyModal from "./pages/home/SendMoneyModal";
import LoadWalletModal from "./pages/home/LoadWalletModal";
import {TransactionsReport} from "./pages/admin/TransactionsReport";
import CustomersReport from "./pages/admin/CustomersReport";
import TransactionsReceipt from "./pages/TransactionsReceipt";
import Dashboard from "./pages/admin/Dashboard";

// Create a separate component that uses useAuth
const AppRoutes = () => {
    const { loading } = useAuth();

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <Router>
            <Routes>
                {/* Redirect root ("/") to Login */}
                <Route path="/" element={<Navigate to="/login" />} />

                {/* Public Routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* Protected routes */}
                <Route element={<ProtectedRoute />}>
                    <Route element={<DefaultLayoutWrapper />}>
                        <Route path="/home" element={<HomePage />} />
                        <Route path="/transactions" element={<Transactions />} />
                        <Route path="/profile" element={<ProfilePage />} />
                        <Route path="/send-money" element={<SendMoneyModal />} />
                        <Route path="/load-wallet" element={<LoadWalletModal />} />
                        <Route path="/customersReports" element={<CustomersReport />} />
                        <Route path="/transactionsReport" element={<TransactionsReport />} />
                        <Route path="/transactionsReceipt" element={<TransactionsReceipt />} />
                        <Route path="/dashboard" element={<Dashboard />} />
                    </Route>
                </Route>

                {/* Default redirect */}
                <Route path="*" element={<Login />} />
            </Routes>
        </Router>
    );
};

// Wrapper for routes that need DefaultLayout
const DefaultLayoutWrapper = () => {
    return (
        <DefaultLayout>
            <Routes>
                {routes.map((route, index) => (
                    <Route key={index} path={route.path} element={route.element} />
                ))}
            </Routes>
        </DefaultLayout>
    );
};

// Main App component that provides the AuthProvider
const App = () => {
    return (
        <AuthProvider>
            <AppRoutes />
        </AuthProvider>
    );
};

export default App;