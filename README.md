# Neural DEEP net

A minimal, smart, and light local agent design system powered by Gemini 3.1 Pro with High Thinking capabilities.

## Features

- **High Thinking Mode**: Utilizes `gemini-3.1-pro-preview` with `ThinkingLevel.HIGH` for deep reasoning and complex problem-solving.
- **Minimalist Aesthetic**: Clean, dark-mode-first UI built with Tailwind CSS, shadcn/ui, and Framer Motion.
- **Local-First Design**: Built to run seamlessly in your local environment while taking advantage of powerful external APIs.
- **Markdown Support**: Full rendering of agent responses including code blocks and formatting.

## Prerequisites

Before you begin, ensure you have the following installed:
- [Node.js](https://nodejs.org/) (v18 or higher)
- npm, yarn, pnpm, or bun
- A [Google Gemini API Key](https://aistudio.google.com/app/apikey)

## Local Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/neural-deep-net.git
   cd neural-deep-net
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file in the root directory and add your Gemini API key:
   ```env
   NEXT_PUBLIC_GEMINI_API_KEY="your_gemini_api_key_here"
   ```

4. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

5. **Open the application**
   Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Deployment

This project is a standard Next.js application and can be easily deployed to platforms like Vercel, Netlify, or GitHub Pages.

To deploy to Vercel:
1. Push your code to a GitHub repository.
2. Import the project in Vercel.
3. Add your `NEXT_PUBLIC_GEMINI_API_KEY` to the Environment Variables in the Vercel dashboard.
4. Deploy!

## License

MIT
