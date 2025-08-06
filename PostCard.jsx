import React, { useState, useEffect } from 'react';
import {
  doc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
} from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';

/**
 * Renders a single post and provides actions for liking and commenting.  Comments
 * are loaded in real-time using Firestore listeners.  Likes are stored as an
 * array of user IDs on the post document.
 */
export default function PostCard({ post }) {
  const { currentUser } = useAuth();
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState('');

  useEffect(() => {
    // Listen for comments on this post in real-time
    const commentsRef = collection(db, 'posts', post.id, 'comments');
    const q = query(commentsRef, orderBy('timestamp', 'asc'));
    const unsubscribe = onSnapshot(q, (snap) => {
      const docs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setComments(docs);
    });
    return unsubscribe;
  }, [post.id]);

  const handleLike = async () => {
    const postRef = doc(db, 'posts', post.id);
    if (post.likes.includes(currentUser.uid)) {
      await updateDoc(postRef, {
        likes: arrayRemove(currentUser.uid),
      });
    } else {
      await updateDoc(postRef, {
        likes: arrayUnion(currentUser.uid),
      });
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    const text = commentText.trim();
    if (!text) return;
    await addDoc(collection(db, 'posts', post.id, 'comments'), {
      uid: currentUser.uid,
      content: text,
      timestamp: new Date(),
    });
    setCommentText('');
  };

  return (
    <div className="bg-white rounded shadow p-4 mb-4">
      <div className="mb-2">
        <p className="font-semibold">{post.authorName || post.uid}</p>
        <p className="text-sm text-gray-500">
          {post.timestamp?.toDate?.().toLocaleString() || ''}
        </p>
      </div>
      <p className="mb-2 whitespace-pre-line">{post.content}</p>
      {post.imageUrl && (
        <motion.img
          src={post.imageUrl}
          alt="post"
          className="w-full max-h-96 object-cover rounded mb-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        />
      )}
      <div className="flex items-center gap-4 mb-2">
        <button onClick={handleLike} className="flex items-center gap-1">
          {post.likes.includes(currentUser.uid) ? '❤️' : '🤍'} {post.likes.length}
        </button>
        <span>Comments {comments.length}</span>
      </div>
      <form onSubmit={handleAddComment} className="flex gap-2">
        <input
          type="text"
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          placeholder="Add a comment..."
          className="flex-1 border rounded px-2 py-1"
        />
        <button type="submit" className="bg-blue-500 text-white px-2 py-1 rounded">
          Send
        </button>
      </form>
      {comments.map((c) => (
        <div key={c.id} className="mt-2 pl-2 border-l">
          <p className="text-sm font-semibold">{c.uid}</p>
          <p className="text-sm whitespace-pre-line">{c.content}</p>
        </div>
      ))}
    </div>
  );
}