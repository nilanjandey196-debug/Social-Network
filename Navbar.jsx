import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';

/**
 * Navigation bar displayed across the top of the application.  It shows the
 * application name, links to search, the user's profile, and a logout button
 * when authenticated.  Otherwise it shows links to log in or sign up.
 */
export default function Navbar() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/login');
  };

  return (
    <nav className="bg-white shadow-md mb-4">
      <div className="container mx-auto px-4 py-2 flex justify-between items-center">
        <Link to="/" className="text-xl font-semibold">SocialApp</Link>
        {currentUser ? (
          <div className="flex items-center gap-4">
            <Link to="/search" className="hover:underline">Search</Link>
            <Link to={`/profile/${currentUser.uid}`} className="flex items-center">
              {currentUser.photoURL ? (
                <img
                  src={currentUser.photoURL}
                  alt="avatar"
                  className="h-8 w-8 rounded-full object-cover"
                />
              ) : (
                <span className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center">
                  {currentUser.email ? currentUser.email.charAt(0).toUpperCase() : '?'}
                </span>
              )}
            </Link>
            <button onClick={handleLogout} className="text-sm text-red-500 hover:underline">
              Logout
            </button>
          </div>
        ) : (
          <div className="flex gap-4">
            <Link to="/login" className="hover:underline">Login</Link>
            <Link to="/signup" className="hover:underline">Sign Up</Link>
          </div>
        )}
      </div>
    </nav>
  );
}