# Orator

A speech and text analysis application that processes images and generates speech.

## Features

- Image text analysis via OpenAI
- Text-to-speech conversion
- API endpoints for scanning and TTS

## Getting Started

1. Clone the repository
2. Set up environment variables (see server/.env)
3. Install dependencies and start the server:

```bash
cd server
npm install
npx ts-node src/app.ts
```

## Project Structure

- `server/` - Backend Express API
- `server/src/app.ts` - Main application file 