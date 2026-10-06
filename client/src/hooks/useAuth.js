import { useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { AuthContext } from '../context/AuthContext';

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AppProvider');
  return ctx;
}

// Returns a function: call it before an action that needs an account.
// If nobody is logged in it sends them to the login page and brings them back afterwards.
export function useRequireLogin() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  return () => {
    if (user) return true;
    toast('Please log in to continue');
    navigate('/login', { state: { from: location } });
    return false;
  };
}
