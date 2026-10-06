import { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import AuthLayout from '../components/common/AuthLayout';
import { verifyEmail } from '../services/authService';
import { useAuth } from '../hooks/useAuth';

export default function VerifyEmail() {
  const { token } = useParams();
  const { user, setUser } = useAuth();
  const [state, setState] = useState({ status: 'loading', message: '' });
  const started = useRef(false); // the link works once, so never send it twice (React StrictMode runs effects twice in dev)

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    verifyEmail(token)
      .then((res) => {
        setState({ status: 'ok', message: res.message });
        setUser((u) => (u ? { ...u, isEmailVerified: true } : u));
      })
      .catch((err) => setState({ status: 'error', message: err.message }));
  }, [token, setUser]);

  return (
    <AuthLayout title="Email verification">
      {state.status === 'loading' && <p role="status">Verifying your email...</p>}
      {state.status === 'ok' && <p role="status" className="rounded-md bg-saffron-50 p-4">Your email is verified. Thank you!</p>}
      {state.status === 'error' && (
        <p role="alert" className="rounded-md bg-maroon-50 p-4 text-maroon-700">
          {state.message}. {user ? <Link to="/profile" className="underline">Request a new link from your profile</Link> : <Link to="/login" className="underline">Log in to request a new link</Link>}
        </p>
      )}
      <p className="mt-4 text-center"><Link to="/" className="text-saffron-600 hover:underline">Continue shopping</Link></p>
    </AuthLayout>
  );
}
