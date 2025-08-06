# Social Network

This repository contains a simple yet fully‑functional social networking web app built with **React**, **Tailwind CSS**, **Framer Motion** and **Firebase**.  The goal of the project is to provide a feature set similar to Facebook or Instagram while remaining free to host and simple to extend.  Users can register, log in, create posts with images, like and comment on posts, search for other users, chat in real‑time and manage their profile.

## Features

The application implements the following core functionality:

| Feature | Description |
|-------|-------------|
|Authentication|Sign up and log in with email and password using Firebase Authentication.  Session state is managed via a React context so the UI updates reactively.|
|User profiles|Each user has a document in the `users` collection storing their display name, email, profile photo, bio and a list of friend IDs.  Users can edit their bio and avatar on their profile page.  Other users can add them as friends.|
|Posting|Users can compose text posts and optionally attach an image.  Posts are stored in the `posts` collection with a timestamp and an array of user IDs for likes.  Firestore Storage is used to host uploaded images.|
|Feed|The feed shows all posts in reverse chronological order.  In a production system you would filter by friends; for simplicity this demo shows all posts.  Posts update in real‑time using Firestore’s snapshot listeners so you never need to refresh the page.|
|Likes & comments|Each post displays its like count and comments.  Users can toggle a like, which updates the post document by adding or removing their user ID from the `likes` array.  Comments are stored in a `comments` subcollection under each post and stream live via listeners.|
|Friendship|Users can add each other as friends.  A simple implementation stores an array of friend IDs on each user document.  Pressing **Add Friend** updates both users’ `friends` arrays.|
|Search|A search page lets you look up other users by name.  In this example all user documents are loaded once and filtered client‑side, but Firestore queries could be added for scalability.|
|Real‑time chat|One‑to‑one messaging is implemented with a `conversations` collection.  Each chat between two users uses a deterministic ID composed of their UIDs.  Messages are stored in subcollections and displayed in ascending order.  Firestore listeners make the chat live, scrolling to the newest message automatically.|

### Optional enhancements

You can extend this application with additional features such as dark mode, story cards (à la Instagram), emoji pickers for posts and messages, social logins (Google, etc.) and notifications.  Hooks and components have been structured to make these additions straightforward.

## Architecture

The project uses the following technologies:

- **React & React Router** for building a responsive single‑page application with client‑side routing.
- **Tailwind CSS** for utility‑first styling.  The config lives in `tailwind.config.js` and all styles are compiled from the classes in your markup.
- **Framer Motion** for small animations (e.g. image fade‑ins).
- **Firebase** for the backend.  Firebase is a Google‑backed **Backend‑as‑a‑Service** platform providing authentication, storage, analytics and database services【49348652824032†L34-L59】.  This project uses two key products:
  - **Firebase Authentication**, which supports multiple sign‑in providers such as email/password and social accounts【49348652824032†L34-L59】.
  - **Cloud Firestore**, a cloud‑hosted NoSQL database where data is stored in **documents** organised into **collections**.  Each document contains key‑value pairs, may include subcollections or nested objects, and collections and documents are created implicitly【139491066033995†L1301-L1348】.  Firestore is optimized for storing large collections of small documents and automatically synchronizes data across clients【139491066033995†L1301-L1348】.
- **Firestore listeners** such as `onSnapshot` to retrieve data and listen for changes.  Attaching a listener triggers a callback with the current data immediately and whenever it changes, providing real‑time updates【20935166357378†L1348-L1404】.

### Data model

| Collection | Fields | Notes |
|-----------|-------|------|
|`users`|`uid`, `name`, `email`, `photoURL`, `bio`, `friends`|Stores user profiles.  `friends` is an array of other user IDs.|
|`posts`|`uid`, `content`, `imageUrl`, `likes`, `timestamp`|Each post belongs to the author’s UID.  `likes` is an array of user IDs.  Comments are stored in a `comments` subcollection under each post.|
|`posts/{postId}/comments`|`uid`, `content`, `timestamp`|Comments on a post.  Each comment stores the commenter’s UID.|
|`conversations`| — |Top‑level collection for chats.  Each document ID is created by sorting the two user IDs and joining them with an underscore.|
|`conversations/{conversationId}/messages`|`sender`, `recipient`, `text`, `timestamp`|Stores chat messages.|

## Getting started

Follow these steps to run the project locally:

1. **Clone the repository**

   ```bash
   git clone https://github.com/your‑username/social-network.git
   cd social-network
   ```

2. **Install dependencies**

   Make sure you have Node.js (v18 or later) and npm installed.  Then run:

   ```bash
   npm install
   ```

3. **Configure Firebase**

   - Create a new project in [Firebase](https://console.firebase.google.com/).  You can follow the setup guide on freeCodeCamp to register a web app and obtain your configuration keys【49348652824032†L34-L59】.
   - Enable **Email/Password** sign‑in under **Authentication → Sign‑in method**.
   - Enable **Cloud Firestore** in **Native** mode.  No rules changes are necessary for local development; in production you should tighten your security rules.
   - Create a `.env` file in the root of the project and copy the keys from your Firebase console.  Use `.env.example` as a template.  Example:

     ```bash
     VITE_FIREBASE_API_KEY=your_api_key
     VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
     VITE_FIREBASE_PROJECT_ID=your_project_id
     VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
     VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
     VITE_FIREBASE_APP_ID=your_app_id
     ```

4. **Run the development server**

   ```bash
   npm run dev
   ```

   This starts Vite on [`http://localhost:5173`](http://localhost:5173).  As you modify code it will hot‑reload your changes.  To build a production bundle run `npm run build`.

5. **Deploying to GitHub Pages**

   - Create a public GitHub repository and push the code.
   - Set the `base` option in `vite.config.js` to `'/your‑repository‑name/'` when deploying so that asset paths are resolved correctly.
   - Install the `gh-pages` package (`npm install --save-dev gh-pages`) if it is not already installed and run:

     ```bash
     npm run build
     npm run deploy
     ```

   - GitHub Pages will host your compiled site at `https://your‑username.github.io/your‑repository‑name/`.

## Project structure

```
social-network/
├── index.html            # Vite HTML entrypoint
├── package.json          # Project metadata and dependencies
├── vite.config.js        # Vite configuration (includes GitHub Pages base path)
├── tailwind.config.js    # Tailwind CSS configuration
├── postcss.config.js     # PostCSS configuration for Tailwind
├── .env.example          # Sample environment file with Firebase variables
├── src/
│   ├── main.jsx          # Entry point that mounts the React app
│   ├── index.css         # Global styles (imports Tailwind directives)
│   ├── firebase.js       # Firebase initialization and exported services
│   ├── contexts/
│   │   └── AuthContext.jsx   # Provides authentication state
│   ├── components/
│   │   ├── Navbar.jsx       # Top navigation bar
│   │   ├── PostComposer.jsx # Form for composing posts
│   │   └── PostCard.jsx     # Displays a post, likes and comments
│   ├── pages/
│   │   ├── Login.jsx        # Login form
│   │   ├── Signup.jsx       # Sign‑up form
│   │   ├── Feed.jsx         # Timeline feed
│   │   ├── Profile.jsx      # User profile with edit capability
│   │   ├── Chat.jsx         # Real‑time chat page
│   │   └── Search.jsx       # Search page for finding users
│   └── App.jsx             # Application routes and layout
└── README.md
```

## Security considerations

This project is intended as a learning resource.  When deploying a real social network you must write restrictive security rules for Firestore and Storage, rate‑limit operations, validate inputs on the backend and handle edge cases such as pagination and error retries.  See the Firebase documentation for guidance on designing scalable data structures and securing your application.

## Contributing

Pull requests are welcome!  Feel free to fork the project, customise the UI, add new features (such as dark mode, reactions, notifications) and send improvements.  If you find a bug or have suggestions please open an issue.