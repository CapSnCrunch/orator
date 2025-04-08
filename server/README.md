# Orator Server

Express backend for the Orator application providing image analysis and TTS functionality.

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create a `.env` file with:
   ```
   OPENAI_API_KEY=your_openai_key_here
   PORT=3000
   ```

3. Run the server:
   ```bash
   npx ts-node src/app.ts
   ```

## API Endpoints

### POST /api/scan
Analyzes text in an uploaded image.

### POST /api/tts
Converts text to speech using OpenAI's TTS API.

## Dependencies

- Express
- OpenAI
- Multer for file uploads
- CORS for cross-origin requests 