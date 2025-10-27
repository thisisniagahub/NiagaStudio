# 🕌 NiagaStudio - AI-Powered Kufic Calligraphy Generator

[![Made with Gemini](https://img.shields.io/badge/Made%20with-Gemini%20AI-blueviolet)](https://ai.google.dev/) [![Powered by React](https://img.shields.io/badge/Powered%20by-React-blue)](https://react.dev/) [![Styled with Tailwind CSS](https://img.shields.io/badge/Styled%20with-Tailwind%20CSS-38B2AC)](https://tailwindcss.com/)

**NiagaStudio** is a modern web application that leverages the power of **Google Gemini AI** to generate beautiful, geometric Kufic calligraphy from text. Transform words, names, or phrases into stunning minimalist artworks, perfect for logos, business branding, wall art, and digital designs.

---

## ✨ Key Features

This application is built with a powerful set of features to give you complete creative control:

-   **🎨 AI-Powered Generation**: Utilizes the `gemini-2.5-flash-image` model to turn detailed text prompts into high-quality calligraphy images.
-   **🖼️ Multiple Composition Styles**: Generate art in four distinct Kufic styles:
    -   **Square**: A dense, perfectly balanced square composition.
    -   **Linear**: An elegant, horizontal arrangement.
    -   **Diamond**: A symmetrical, diamond-shaped design.
    -   **Circular**: A beautiful, radial or mandala-like pattern.
-   **✒️ Stroke Control**: Choose the calligraphy's line thickness (`thin`, `medium`, `thick`, `bold`) to achieve your desired aesthetic.
-   **🎨 Full Color Control**: Use color pickers to independently set the calligraphy and background colors.
-   **🖼️ Optional Border & Caption**: Add a clean border around your design and include a text caption underneath.
-   **💡 Inspiration & Remix Gallery**: Explore a gallery of pre-configured design examples. Click any example to instantly load its settings and start "remixing".
-   **🎨 Dynamic Theming**: Choose from beautifully designed UI themes (`Modern Light`, `Desert Dark`) for a comfortable creative experience.
-   **📱 Responsive Design**: A clean interface that works great on both desktop and mobile devices.
-   **💾 Download as PNG**: Download your final artwork as a high-resolution PNG file with a single click.
-   **갤러리 Your Creations Gallery**: Automatically saves every generated artwork to a personal gallery in your browser's local database (IndexedDB), allowing you to view, remix, and manage your past creations.

---

## 🛠️ Tech Stack

-   **Frontend**: [React 19](https://react.dev/), [TypeScript](https://www.typescriptlang.org/)
-   **AI Model**: [Google Gemini 2.5 Flash Image](https://ai.google.dev/) via the `@google/genai` SDK
-   **Styling**: [Tailwind CSS](https://tailwindcss.com/) (via CDN)
-   **Local Database**: [IndexedDB](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API) for the user's creation gallery.
-   **Tooling**: No build step required; the app runs directly in the browser using `importmap`.

---

## 🚀 Getting Started

Since this project uses CDNs and `importmap`, no `npm` installation is necessary.

### Prerequisites

-   A modern web browser (e.g., Chrome, Firefox, Edge).
-   **Google Gemini API Key**: You must have a valid API key from [Google AI Studio](https://aistudio.google.com/app/apikey).

### Running the Application

1.  **Clone the Repository:**
    ```bash
    git clone https://github.com/your-username/niagastudio.git
    cd niagastudio
    ```

2.  **Set up the API Key:**
    The application is designed to load your API key from an environment variable. Since it's a client-side app, you'll need to use a simple development server or manually set this up. For development, create a `.env` file in the root directory and add your key:
    ```
    API_KEY=YOUR_GEMINI_API_KEY_HERE
    ```
    > **Important Note**: Never commit your `.env` file or expose your API key in a public repository.

3.  **Run with a Live Server:**
    The easiest way to run this project is with an extension like **Live Server** in VS Code.
    -   Install the [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) extension.
    -   Right-click on the `index.html` file and select "Open with Live Server".
    -   This will start a local development server and open the app in your browser.

---

## 📁 Project File Structure

Here's an overview of the main files in the project:

```
.
├── index.html          # Main HTML entry point, loads scripts and Tailwind CSS.
├── index.tsx           # React entry point, mounts the App component to the DOM.
├── metadata.json       # Application metadata (name, description).
├── App.tsx             # The main application component, containing all UI, logic, and state management.
├── services/
│   ├── geminiService.ts  # Manages all interactions with the Google Gemini API.
│   └── databaseService.ts# Handles all IndexedDB operations for the user gallery.
├── components/
│   ├── ControlPanel.tsx    # Component for all user settings and inputs.
│   ├── DisplayPanel.tsx    # Component for displaying the generated art and loader.
│   ├── RemixGallery.tsx    # Component for the inspiration gallery.
│   ├── ThemeSelector.tsx   # Component for switching UI themes.
│   ├── UserGallery.tsx     # Component for displaying the user's saved creations.
│   └── icons.tsx         # Reusable SVG icon components.
└── types.ts            # TypeScript type definitions for the entire application.
```