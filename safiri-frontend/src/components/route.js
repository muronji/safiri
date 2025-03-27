import HomePage from "../pages/home/HomePage";
import Transactions from '../pages/Transactions';
import ProfilePage from '../pages/ProfilePage';
import SendMoneyModal from "../pages/home/SendMoneyModal";
import LoadWalletModal from "../pages/home/LoadWalletModal";
import {TransactionsReport} from "../pages/admin/TransactionsReport";
import CustomersReport from "../pages/admin/CustomersReport";
import TransactionsReceipt from "../pages/TransactionsReceipt";

const routes = [
    { path: "/home", element: <HomePage /> },
    { path: "/transactions", element: <Transactions /> },
    { path: "/profile", element: <ProfilePage /> },
    {path: "/send-money", element: <SendMoneyModal />},
    {path: "/load-wallet", element: <LoadWalletModal />},
    {path: "/customersReports", element: <CustomersReport />},
    {path: "/transactionsReport", element: <TransactionsReport />},
    {path: "/transactionsReceipt", element: <TransactionsReceipt />}
];

export default routes;
