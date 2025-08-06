import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { Link } from 'react-router-dom';

/**
 * Simple user search page.  All users are loaded once from Firestore and then
 * filtered client-side based on the search query.  In a larger application
 * you would query Firestore directly using indexes to keep the results in sync.
 */
export default function Search() {
  const [query, setQuery] = useState('');
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      const snap = await getDocs(collection(db, 'users'));
      setUsers(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    };
    fetchUsers();
  }, []);

  const filtered = users.filter((u) =>
    u.name?.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <div className="container mx-auto max-w-xl p-4">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search users..."
        className="w-full border rounded p-2 mb-4"
      />
      <ul>
        {filtered.map((user) => (
          <li key={user.id} className="mb-2">
            <Link to={`/profile/${user.id}`} className="flex items-center gap-2">
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt="avatar"
                  className="h-8 w-8 rounded-full object-cover"
                />
              ) : (
                <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center">
                  {user.name ? user.name.charAt(0) : '?'}
                </div>
              )}
              <span>{user.name || user.email}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}