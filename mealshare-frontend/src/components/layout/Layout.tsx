import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { useSocket } from '../../hooks/useSocket';

export const Layout = () => {
  useSocket(); // Initialize socket connection and listeners

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <Outlet />
      </main>
    </div>
  );
};
