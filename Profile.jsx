import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  doc,
  getDoc,
  updateDoc,
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  arrayUnion,
} from 'firebase/firestore';
import { db, storage } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import PostCard from '../components/PostCard';

/**
 * Displays a user's profile including their avatar, name, bio and list of posts.
 * If the profile belongs to the current user, they can edit their bio and
 * upload a new avatar.  Users can also add the profile as a friend to their
 * friends list.  Friends are stored as an array of user IDs on each user
 * document.
 */
export default function Profile() {
  const { id } = useParams();
  const { currentUser } = useAuth();
  const [profileUser, setProfileUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [bio, setBio] = useState('');
  const [photo, setPhoto] = useState(null);

  useEffect(() => {
    // Fetch the profile user's document from Firestore.
    const fetchUser = async () => {
      const userRef = doc(db, 'users', id);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        const data = userSnap.data();
        setProfileUser(data);
        setBio(data.bio || '');
      }
    };
    fetchUser();
  }, [id]);

  useEffect(() => {
    // Fetch posts authored by this user.  Results are ordered newest first.
    const q = query(collection(db, 'posts'), where('uid', '==', id), orderBy('timestamp', 'desc'));
    const unsubscribe = onSnapshot(q, (snap) => {
      const userPosts = [];
      snap.forEach((d) => userPosts.push({ id: d.id, ...d.data() }));
      setPosts(userPosts);
    });
    return unsubscribe;
  }, [id]);

  // Save changes to the current user's bio and/or avatar
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    const updates = { bio };
    if (photo) {
      const avatarRef = ref(storage, `avatars/${id}`);
      await uploadBytes(avatarRef, photo);
      updates.photoURL = await getDownloadURL(avatarRef);
    }
    await updateDoc(doc(db, 'users', id), updates);
    setPhoto(null);
  };

  // Add this user as a friend to both the current user and the profile user
  const handleAddFriend = async () => {
    if (!currentUser || currentUser.uid === id) return;
    await updateDoc(doc(db, 'users', currentUser.uid), {
      friends: arrayUnion(id),
    });
    await updateDoc(doc(db, 'users', id), {
      friends: arrayUnion(currentUser.uid),
    });
  };

  return (
    <div className="container mx-auto max-w-xl p-4">
      {profileUser ? (
        <>
          <div className="bg-white p-4 rounded shadow mb-4 flex items-center gap-4">
            {profileUser.photoURL ? (
              <img
                src={profileUser.photoURL}
                alt="avatar"
                className="h-16 w-16 rounded-full object-cover"
              />
            ) : (
              <div className="h-16 w-16 rounded-full bg-gray-300 flex items-center justify-center">
                <span className="text-xl">
                  {profileUser.name ? profileUser.name.charAt(0) : '?'}
                </span>
              </div>
            )}
            <div className="flex-1">
              <h2 className="text-xl font-semibold">{profileUser.name}</h2>
              <p className="text-sm text-gray-500">{profileUser.email}</p>
              <p className="mt-2 whitespace-pre-line">{profileUser.bio}</p>
            </div>
            {currentUser && currentUser.uid !== id && (
              <button
                onClick={handleAddFriend}
                className="bg-blue-500 text-white px-3 py-1 rounded"
              >
                Add Friend
              </button>
            )}
          </div>
          {currentUser && currentUser.uid === id && (
            <form
              onSubmit={handleUpdateProfile}
              className="bg-white p-4 rounded shadow mb-4"
            >
              <h3 className="text-lg font-semibold mb-2">Edit Profile</h3>
              <div className="mb-2">
                <label className="block text-sm font-medium">Bio</label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full border rounded p-2"
                />
              </div>
              <div className="mb-2">
                <label className="block text-sm font-medium">Profile Picture</label>
                <input
                  type="file"
                  onChange={(e) => setPhoto(e.target.files[0])}
                  accept="image/*"
                />
              </div>
              <button
                type="submit"
                className="bg-blue-500 text-white px-3 py-1 rounded"
              >
                Save
              </button>
            </form>
          )}
          <div>
            <h3 className="text-lg font-semibold mb-2">Posts</h3>
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        </>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
}