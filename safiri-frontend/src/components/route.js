import HomePage from "../pages/HomePage";
import TransactionsPage from '../pages/TransactionsPage';
import ProfilePage from '../pages/ProfilePage';

const routes = [
    { path: "/home", element: <HomePage /> },
    { path: "/transactions", element: <TransactionsPage /> },
    { path: "/profile", element: <ProfilePage /> }
];

export default routes;
