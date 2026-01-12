# Firebase Setup Guide for Sungura

Since I am an AI, I cannot access your Google Account to create projects for you. You'll need to do this step, but it's quick!

## Step 1: Create Project
1.  Go to the [Firebase Console](https://console.firebase.google.com/).
2.  Click **"Add project"** (or "Create a project").
3.  Name it `Sungura`.
4.  Toggle off Google Analytics (optional, saves time).
5.  Click **"Create Project"**.

## Step 2: Enable Authentication
1.  In the left sidebar, click **Build** -> **Authentication**.
2.  Click **"Get started"**.
3.  In the **Sign-in method** tab, click **"Email/Password"**.
4.  Toggle **Enable** (top switch only).
5.  Click **"Save"**.

## Step 3: Get Configuration Keys
1.  Click the **Gear icon** (Project Settings) next to "Project Overview" in the top left.
2.  Scroll down to the **"Your apps"** section.
3.  Click the **Web** icon (`</>`).
4.  Register app with nickname: `Sungura Mobile`.
5.  **Copy the `firebaseConfig` object** (the part between `{` and `}` inside the code block).

It looks like this:
```javascript
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "sungura-xyz.firebaseapp.com",
  projectId: "sungura-xyz",
  storageBucket: "sungura-xyz.appspot.com",
  messagingSenderId: "123456...",
  appId: "1:1234..."
};
```

## Step 4: Paste into Code
1.  Open `apps/mobile/firebaseConfig.js` in your editor.
2.  Replace the placeholder config with the one you just copied.

Done! 🚀
