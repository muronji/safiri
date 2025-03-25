import React, {useEffect} from "react";
import "./../stylesheets/layout.css";
import { useNavigate, useLocation } from "react-router-dom";
import logo from "./../images/international.png";
import { useAuth } from "../redux/AuthContext";
import { logoutUser } from "./../apicalls/index";

const DefaultLayout = ({ children }) => {
    const [showSidebar, setShowSidebar] = React.useState(true);
    const location = useLocation();
    const navigate = useNavigate();
    const { user } = useAuth();

    const getDisplayName = () => {
        // Direct check on the full user object
        if (user) {
            // Try firstName first, then fall back to other options
            if (user.firstName) {
                return user.firstName;
            }

            if (user.username) {
                // If username is an email, split it
                return user.username.split('@')[0];
            }

            if (user.email) {
                return user.email.split('@')[0];
            }
        }

        return "Guest";
    };

    useEffect(() => {
        console.log("DefaultLayout - Current user:", user);
    }, [user]);

    const userMenu = [
        { title: 'Home', icon: <i className="ri-home-7-line"></i>, onClick: () => navigate("/home"), path: '/home' },
        { title: 'Transactions', icon: <i className="ri-bank-line"></i>, onClick: () => navigate("/transactions"), path: '/transactions' },
        { title: 'Profile', icon: <i className="ri-user-line"></i>, onClick: () => navigate("/profile"), path: '/profile' },
        {title: 'Customer Reports', icon: <i className="ri-file-list-3-line"></i>, onClick: () => navigate("/CustomerReports"), path: '/CustomerReports'},
        {
            title: 'Logout',
            icon: <i className="ri-logout-box-line"></i>,
            onClick: async () => {
                const success = await logoutUser();
                if (success) navigate("/login");
            }
        }
    ];

    return (
        <div className="layout">
            <div className={`sidebar ${showSidebar ? "" : "collapsed"}`}>
                <div className="logo">
                    <img src={logo} alt="Safiri logo" className="logo-img" />
                    {showSidebar && <h2>SAFIRI</h2>}
                </div>
                <div className="menu">
                    {userMenu.map((item) => {
                        const isActive = location.pathname === item.path;
                        return (
                            <div key={item.path}
                                 className={`menu-item ${isActive ? "active-menu-item" : ""}`}
                                 onClick={item.onClick}
                            >
                                {item.icon}
                                {showSidebar && <h1 className="text-white text-sm">{item.title}</h1>}
                            </div>
                        );
                    })}
                </div>
            </div>
            <div className="body">
                <div className="header flex items-center justify-between px-4">
                    <div className="menu-icon">
                        <i className={showSidebar ? "ri-close-line" : "ri-menu-line"}
                           onClick={() => setShowSidebar(!showSidebar)}
                        ></i>
                    </div>
                    <h1 className="text-xl text-center flex-grow text-white">SAFIRI</h1>
                    <div>
                        <h1 className="text-sm underline">{getDisplayName()}</h1>
                    </div>
                </div>
                <div className="content">{children}</div>
            </div>
        </div>
    );
};

export default DefaultLayout;