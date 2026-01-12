# Sungura AI Study Buddy

A fast, intelligent, and encouraging AI study companion for East African university students.

## Project Structure
*   **`apps/mobile`**: React Native (Expo) Application.
*   **`apps/api`**: Node.js Express Backend API.

## Getting Started

### 1. Backend API
The API handles user data, AI integration, and core logic.

```bash
cd apps/api
npm install
node index.js
```
The server runs on `http://localhost:3000`.

### 2. Mobile App
The mobile app is built with Expo.

```bash
cd apps/mobile
npm install
npx expo start
```
Press `w` in the terminal to open the web preview, or scan the QR code with your phone (Expo Go app required).

## Environment Variables
Create a `.env` file in `apps/api` based on `.env.example` (coming soon).
