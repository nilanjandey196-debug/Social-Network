import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../firebase';

/**
 * Simple one-to-one chat component.  Messages are stored in a `conversations`
 * collection keyed by a sorted combination of the two user IDs.  Messages are
 * displayed in ascending order by timestamp and scroll automatically to the
 * bottom when new messages arrive.
 */
export default function Chat() {
  const { id: friendId } = useParams();
  const { currentUser } = useAuth();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const messagesEndRef = useRef(null);

  // Generate a consistent conversation ID by sorting the two user IDs
  const conversationId = currentUser && friendId
    ? [currentUser.uid, friendId].sort().join('_')
    : null;

  useEffect(() => {
    if (!conversationId) return;
    // Listen for messages in this conversation ordered oldest to newest
    const q = query(
      collection(db, 'conversations', conversationId, 'messages'),
      orderBy('timestamp', 'asc'),
    );
    const unsubscribe = onSnapshot(q, (snap) => {
      setMessages(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });
    return unsubscribe;
  }, [conversationId]);

  useEffect(() => {
    // Scroll to the bottom whenever messages change
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!text.trim() || !conversationId) return;
    await addDoc(collection(db, 'conversations', conversationId, 'messages'), {
      sender: currentUser.uid,
      recipient: friendId,
      text: text.trim(),
      timestamp: serverTimestamp(),
    });
    setText('');
  };

  if (!friendId) {
    return <p className="p-4">Select a friend to chat with.</p>;
  }

  return (
    <div className="container mx-auto max-w-xl p-4">
      <div className="bg-white rounded shadow h-96 flex flex-col">
        <div className="flex-1 overflow-y-auto p-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`mb-2 flex ${msg.sender === currentUser.uid ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`px-3 py-2 rounded text-white ${msg.sender === currentUser.uid ? 'bg-blue-500' : 'bg-gray-500'}`}
              >
                {msg.text}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
        <form onSubmit={sendMessage} className="p-2 flex gap-2 border-t">
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="flex-1 border rounded px-2 py-1"
            placeholder="Type your message..."
          />
          <button type="submit" className="bg-blue-500 text-white px-3 py-1 rounded">
            Send
          </button>
        </form>
      </div>
    </div>
  );
}