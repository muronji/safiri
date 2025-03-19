import HomePage from "../pages/home/HomePage";
import Transactions from '../pages/Transactions';
import ProfilePage from '../pages/ProfilePage';
import SendMoneyModal from "../pages/home/SendMoneyModal";

const routes = [
    { path: "/home", element: <HomePage /> },
    { path: "/transactions", element: <Transactions /> },
    { path: "/profile", element: <ProfilePage /> },
    {path: "/send-money", element: <SendMoneyModal />}
];

export default routes;
