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

const App = () => {
    return (
        <AuthProvider>
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
                        </Route>
                    </Route>

                    {/* Default redirect */}
                    <Route path="*" element={<Login />} />
                </Routes>
        </Router>
        </AuthProvider>
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

export default App;