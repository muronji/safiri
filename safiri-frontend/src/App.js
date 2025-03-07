import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import SideBar from "./components/SideBar";
import HomePage from './components/HomePage';
import TransactionsPage from './components/TransactionsPage';
import ProfilePage from './components/ProfilePage';
import './App.css';


const App = () => {
    return (
        <Router>
            <div className="app">
                <SideBar />
                <div className="content">
                    <Routes>
                        <Route path="/home" element={<HomePage />} />
                        <Route path="/transactions" element={<TransactionsPage />} />
                        <Route path="/profile" element={<ProfilePage />} />
                    </Routes>
                </div>
            </div>
        </Router>
    );
};

export default App;