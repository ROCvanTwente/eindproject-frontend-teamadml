import { Navigate, Outlet } from 'react-router-dom';

export function AdminRoute() {
  const role = localStorage.getItem('role');

  if (role !== 'Admin') {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}