import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import 'antd/dist/reset.css';
import {AuthProvider} from "./redux/AuthContext";  // For Ant Design v5+



const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <React.StrictMode>
        <AuthProvider>  {/* ✅ Wrap App inside AuthProvider */}
            <App />
        </AuthProvider>
    </React.StrictMode>
);


