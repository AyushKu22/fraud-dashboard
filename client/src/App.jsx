import { useState } from 'react';
import { Routes, Route, Link, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import ThemeToggle from './components/ThemeToggle';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';
import TransactionDetail from './pages/TransactionDetail';
import Cases from './pages/Cases';
import CaseDetail from './pages/CaseDetail';
import Account from './pages/Account';

const LINKS = [['/', 'Dashboard'], ['/transactions', 'Transactions'], ['/cases', 'Cases']];

function Layout({ children }) {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-slate-900 text-white">
        <div className="flex items-center gap-4 px-4 sm:px-6 py-3">
          <Link to="/" className="flex items-center gap-2 font-bold">
  <span className="flex bg-[#ffffff] rounded-md p-0.5">
    <img src="image/logo.png" alt="" className="h-7 w-7" />
  </span>
  <span>FraudGuard</span>
</Link>

          <div className="hidden md:flex gap-6 ml-4">
            {LINKS.map(([to, label]) => <Link key={to} to={to}>{label}</Link>)}
          </div>

          <div className="hidden md:flex items-center gap-4 ml-auto">
            <Link to="/account" className="text-sm">{user?.name} ({user?.role})</Link>
            <ThemeToggle />
            <button onClick={logout} className="text-sm underline">Logout</button>
          </div>

          <button
            onClick={() => setOpen(!open)}
            aria-expanded={open}
            aria-label="Toggle menu"
            className="md:hidden ml-auto border px-3 py-1 rounded text-sm"
          >
            {open ? 'Close' : 'Menu'}
          </button>
        </div>

        {open && (
          <div className="md:hidden px-4 pb-4 pt-3 flex flex-col gap-3 border-t border-slate-700">
            {LINKS.map(([to, label]) => <Link key={to} to={to} onClick={close}>{label}</Link>)}
            <Link to="/account" onClick={close}>My account ({user?.name})</Link>
            <div className="flex items-center gap-4">
              <ThemeToggle />
              <button onClick={logout} className="text-sm underline">Logout</button>
            </div>
          </div>
        )}
      </nav>
      <main>{children}</main>
    </div>
  );
}

const Page = ({ children }) => <ProtectedRoute><Layout>{children}</Layout></ProtectedRoute>;

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/" element={<Page><Dashboard /></Page>} />
      <Route path="/transactions" element={<Page><Transactions /></Page>} />
      <Route path="/transactions/:id" element={<Page><TransactionDetail /></Page>} />
      <Route path="/cases" element={<Page><Cases /></Page>} />
      <Route path="/cases/:id" element={<Page><CaseDetail /></Page>} />
      <Route path="/account" element={<Page><Account /></Page>} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}