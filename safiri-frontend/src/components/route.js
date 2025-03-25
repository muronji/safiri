import HomePage from "../pages/home/HomePage";
import Transactions from '../pages/Transactions';
import ProfilePage from '../pages/ProfilePage';
import SendMoneyModal from "../pages/home/SendMoneyModal";
import LoadWalletModal from "../pages/home/LoadWalletModal";
import CustomerReports from "../pages/CustomersReport";

const routes = [
    { path: "/home", element: <HomePage /> },
    { path: "/transactions", element: <Transactions /> },
    { path: "/profile", element: <ProfilePage /> },
    {path: "/send-money", element: <SendMoneyModal />},
    {path: "/load-wallet", element: <LoadWalletModal />},
    {path: "/CustomerReports", element: <CustomerReports />},
];

export default routes;
