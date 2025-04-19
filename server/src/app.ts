import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import fs from 'fs';
import routes from './routes.ts';

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use('/api', routes);

// Ensure the audio directory exists
fs.mkdirSync('./server/audio', { recursive: true });

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
}); 