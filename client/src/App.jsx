import { Toaster } from 'react-hot-toast';
import { useLocation } from 'react-router-dom';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import AppRoutes from './routes/AppRoutes';

export default function App() {
  const { pathname } = useLocation();

  // The admin dashboard has its own menu and no shop header or footer
  if (pathname === '/admin' || pathname.startsWith('/admin/')) return <AppRoutes />;

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <AppRoutes />
      </main>
      <Footer />
      <Toaster position="top-right" />
    </div>
  );
}
