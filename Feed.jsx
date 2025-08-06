import React, { useEffect, useState } from 'react';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import PostComposer from '../components/PostComposer';
import PostCard from '../components/PostCard';

/**
 * Displays the timeline feed.  Posts are loaded from Firestore in reverse
 * chronological order and rendered using the PostCard component.  Users
 * authenticated via the AuthContext can compose new posts.
 */
export default function Feed() {
  const { currentUser } = useAuth();
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    // Listen for all posts ordered by timestamp.  In a production app you
    // would filter posts by the user's friends using a collection group query
    // or by storing follower relationships.  Firestore's `onValue` or
    // `onSnapshot` attaches a listener and provides real-time updates whenever
    // data changes【20935166357378†L1348-L1404】.
    const q = query(collection(db, 'posts'), orderBy('timestamp', 'desc'));
    const unsubscribe = onSnapshot(q, (snap) => {
      const postsData = [];
      snap.forEach((docSnap) => {
        postsData.push({ id: docSnap.id, ...docSnap.data() });
      });
      setPosts(postsData);
    });
    return unsubscribe;
  }, []);

  return (
    <div className="container mx-auto max-w-xl p-4">
      {currentUser && <PostComposer />}
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
}