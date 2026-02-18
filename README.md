# heAIthy - AI Diet Planner

A comprehensive AI-powered diet planning web application features personalized meal generation, BMI tracking, nutrition chat assistant, and progressive feature unlocking (Freemium model).

## Project Structure

- **Frontend**: React, TypeScript, Tailwind CSS, Vite
- **Backend**: Simple Node.js/Express server (`server.js`)
- **AI**: Google Gemini API via `@google/genai`

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- A Google Gemini API Key

## Setup & Installation

1.  **Clone or Download this repository.**

2.  **Install Dependencies:**
    Open your terminal in the project folder and run:
    ```bash
    npm install
    ```

3.  **Environment Variables:**
    The app expects an API Key. For local development, ensure your environment provides `API_KEY` or modify `services/geminiService.ts` to use your key.

## Running the App

The app requires both the backend server (for auth/payments) and the frontend client to be running.

1.  **Start the Backend Server:**
    Open a terminal and run:
    ```bash
    npm start
    ```
    This runs `server.js` on port 3000.

2.  **Start the Frontend:**
    Open a second terminal and run:
    ```bash
    npm run dev
    ```
    This starts the Vite development server (usually at http://localhost:5173).

## Features

- **User Profiles**: Track age, weight, height, goals, and dietary preferences.
- **AI Meal Plans**: Generate daily plans based on user profile.
- **Chat Assistant**: Ask nutrition questions.
- **Premium System**: Simulated payment flow (USDT TRC20) and license key redemption.
- **Admin Dashboard**:
    - Login: `admin@admin.com` / `admin123`
    - View users, approve payments, and generate license keys.
    ```bash
    git push -u origin main
    ```
