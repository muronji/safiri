import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../redux/AuthContext";
import { logoutUser } from "../apicalls";
import logo from "./../images/international.png";
import "./../stylesheets/layout.css";

// Separate menu configuration for easier management
const MENU_CONFIG = {
    ADMIN: [
        {
            title: 'Customer Reports',
            icon: <i className="ri-user-line"></i>,
            path: '/customerReports'
        },
        {
            title: 'Transactions Report',
            icon: <i className="ri-bank-line"></i>,
            path: '/transactionsReport'
        },
        {
            title: 'Logout',
            icon: <i className="ri-logout-box-line"></i>,
            action: 'logout'
        }
    ],
    CUSTOMER: [
        {
            title: 'Home',
            icon: <i className="ri-home-7-line"></i>,
            path: '/home'
        },
        {
            title: 'Transactions',
            icon: <i className="ri-bank-line"></i>,
            path: '/transactions'
        },
        {
            title: 'Profile',
            icon: <i className="ri-user-line"></i>,
            path: '/profile'
        },
        {
            title: 'Logout',
            icon: <i className="ri-logout-box-line"></i>,
            action: 'logout'
        }
    ]
};

// Routes configuration
const ROUTES_CONFIG = {
    HIDE_HEADER: ["/transactions", "/customerReports", "/transactionsReport"],
    AUTO_CLOSE_SIDEBAR: ["/transactions", "/customerReports", "/transactionsReport"]
};

const DefaultLayout = ({ children }) => {
    const [showSidebar, setShowSidebar] = useState(true);
    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    // Improved logout handler with more robust error management
    const handleLogout = async () => {
        try {
            const success = await logoutUser();
            if (success) {
                // Use the logout method from AuthContext
                await logout();
                navigate("/login");
            } else {
                // Optionally show a toast or error notification
                console.error("Logout failed: Server did not confirm logout");
            }
        } catch (error) {
            console.error("Logout error:", error);
            // Handle specific error scenarios
            if (error.response) {
                // The request was made and the server responded with a status code
                // that falls out of the range of 2xx
                alert(`Logout failed: ${error.response.data.message}`);
            } else if (error.request) {
                // The request was made but no response was received
                alert("No response received from server. Please check your connection.");
            } else {
                // Something happened in setting up the request that triggered an Error
                alert("An unexpected error occurred during logout.");
            }
        }
    };

    // Determine user role and menu
    const isAdmin = user?.role === "ADMIN";
    const currentMenu = isAdmin ? MENU_CONFIG.ADMIN : MENU_CONFIG.CUSTOMER;

    // Get user display name with improved fallback logic
    const getDisplayName = () => {
        if (!user) return "Guest";

        return user.firstName
            || user.username?.split('@')[0]
            || user.email?.split('@')[0]
            || "Guest";
    };

    // Handle menu item click
    const handleMenuItemClick = (item) => {
        if (item.path) {
            navigate(item.path);

            // Conditionally close sidebar for specific routes
            if (ROUTES_CONFIG.AUTO_CLOSE_SIDEBAR.includes(item.path)) {
                setShowSidebar(false);
            }
        }

        if (item.action === 'logout') {
            handleLogout();
        }
    };

    // Automatically manage sidebar based on route
    useEffect(() => {
        if (ROUTES_CONFIG.AUTO_CLOSE_SIDEBAR.includes(location.pathname)) {
            setShowSidebar(false);
        }
    }, [location.pathname]);

    // Determine if header should be hidden
    const shouldHideHeader = ROUTES_CONFIG.HIDE_HEADER.includes(location.pathname);

    return (
        <div className="layout">
            <div className={`sidebar ${showSidebar ? "" : "collapsed"}`}>
                <div className="logo">
                    <img src={logo} alt="Safiri logo" className="logo-img" />
                    {showSidebar && <h2>SAFIRI</h2>}
                </div>
                <div className="menu">
                    {currentMenu.map((item) => {
                        const isActive = location.pathname === item.path;
                        return (
                            <div
                                key={item.title}
                                className={`menu-item ${isActive ? "active-menu-item" : ""}`}
                                onClick={() => handleMenuItemClick(item)}
                            >
                                {item.icon}
                                {showSidebar && <h1 className="text-white text-sm">{item.title}</h1>}
                            </div>
                        );
                    })}
                </div>
            </div>
            <div className="body">
                {!shouldHideHeader && (
                    <div className="header flex items-center justify-between px-4">
                        <div className="menu-icon">
                            <i
                                className={showSidebar ? "ri-close-line" : "ri-menu-line"}
                                onClick={() => setShowSidebar(!showSidebar)}
                            ></i>
                        </div>
                        <h1 className="text-xl text-center flex-grow text-white">SAFIRI</h1>
                        <div>
                            <h1 className="text-sm underline">{getDisplayName()}</h1>
                        </div>
                    </div>
                )}
                <div className="content">{children}</div>
            </div>
        </div>
    );
};

export default DefaultLayout;