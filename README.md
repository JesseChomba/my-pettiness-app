# Pettiness Analyzer

Ever wondered if your daily frustrations are legitimate or just a tad... petty? Let Gemma, our AI-powered pettiness judge, decide!

This fun, single-page React application takes your grievances, sends them to the Google Gemini API for a humorous analysis, and gives you a "pettiness score" from 0 to 100, complete with a witty judgment and some questionable advice. (Note this was Heavily and i mean heavily inspired by an Artifact on Claude, but I made some changes to the theme and of course the model used since I don't have the 🤑💵 to pay for a claude API key)

Check out a fully working version of it deployed to vercel on: https://my-pettiness-app.vercel.app/

## Features

*   **AI-Powered Analysis:** Leverages the Google Gemini API to provide unique and humorous feedback on any grievance.
*   **Dynamic Pettiness Gauge:** A visually engaging gauge that animates to show your score.
*   **Categorized Results:** See if your issue is a "Legitimate Concern" or if you've achieved "Peak Pettiness".
*   **Example Grievances:** Not sure what to complain about? Get inspired by some classic petty examples.
*   **Responsive Design:** Looks great on both desktop and mobile.
*   **Vercel Analytics:** Integrated for usage insights.

## Tech Stack

*   **Frontend:** React
*   **Build Tool:** Vite
*   **Styling:** Tailwind CSS
*   **AI:** Google Gemini API
*   **Icons:** Lucide React
*   **Analytics:** Vercel Analytics

## Getting Started

Follow these instructions to get a local copy up and running for development and testing purposes.

### Prerequisites

*   Node.js (v18 or newer recommended)
*   A package manager like `npm` or `yarn`

### Installation & Setup

1.  **Clone the repository.**

2.  **Navigate to the project directory:**
    ```sh
    cd my-pettiness-app
    ```

3.  **Install dependencies:**
    Using your preferred package manager:
    ```sh
    npm install
    # or
    yarn install
    ```

4.  **Set up environment variables:**
    This project requires a Google Gemini API key to function.
    *   In the root of your project directory, create a new file named `.env`.
    *   Add the following line to the `.env` file, replacing `YOUR_API_KEY_HERE` with your actual key:
        ```
        VITE_GEMINI_API_KEY=YOUR_API_KEY_HERE
        ```
    *   You can get a free API key from Google AI Studio.

### Running the Development Server

Once the setup is complete, you can start the local development server:

```sh
npm run dev
```

Open your browser to the local URL provided in the terminal (usually `http://localhost:5173`) to see the app.
