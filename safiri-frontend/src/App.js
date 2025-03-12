import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import DefaultLayout from "./components/DefaultLayout";
import routes from "./components/route";
import 'remixicon/fonts/remixicon.css';

const App = () => {
    return (
        <Router>
            <DefaultLayout>
                <Routes>
                    <Route path="/" element={<Navigate replace to="/home" />} />
                    {routes.map((route, index) => (
                        <Route key={index} path={route.path} element={route.element} />
                    ))}
                </Routes>

            </DefaultLayout>
        </Router>
    );
};

export default App;
