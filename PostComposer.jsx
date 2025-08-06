import React, { useState } from 'react';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../firebase';
import { useAuth } from '../contexts/AuthContext';

/**
 * Component that renders a form for composing new posts.  Users can write
 * textual content and optionally attach an image.  When submitted, the post
 * is stored in Firestore and the image is uploaded to Firebase Storage.
 */
export default function PostComposer() {
  const { currentUser } = useAuth();
  const [content, setContent] = useState('');
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim() && !image) return;
    setLoading(true);
    setError('');
    try {
      let imageUrl = null;
      if (image) {
        // Use the current timestamp to create a unique filename
        const storageRef = ref(storage, `posts/${currentUser.uid}/${Date.now()}`);
        await uploadBytes(storageRef, image);
        imageUrl = await getDownloadURL(storageRef);
      }
      await addDoc(collection(db, 'posts'), {
        uid: currentUser.uid,
        content: content.trim(),
        imageUrl: imageUrl || null,
        likes: [],
        timestamp: serverTimestamp(),
      });
      setContent('');
      setImage(null);
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-4 rounded shadow mb-4">
      {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
      <textarea
        className="w-full border rounded p-2 mb-2"
        placeholder="What's on your mind?"
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />
      {image && (
        <img
          src={URL.createObjectURL(image)}
          alt="preview"
          className="max-h-60 mb-2 object-contain rounded"
        />
      )}
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-1 cursor-pointer text-blue-600">
          <input
            type="file"
            className="hidden"
            accept="image/*"
            onChange={(e) => setImage(e.target.files[0])}
          />
          📷 Add Image
        </label>
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
        >
          Post
        </button>
      </div>
    </form>
  );
}