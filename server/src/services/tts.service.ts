import { storage, firestore } from '../lib/firebase-admin.ts';
import * as admin from 'firebase-admin';
import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface TTSResponse {
  message?: string;
  path?: string;
  error?: string;
}

/**
 * Generates speech from text using OpenAI's TTS model
 * @param text - The text to convert to speech
 * @param voice - The voice to use for the speech
 * @returns The generated speech as a buffer
 */
export async function generateSpeech(text: string, voice: string = 'nova'): Promise<TTSResponse> {
  try {
    const availableVoices = ['alloy', 'ash', 'ballad', 'coral', 'echo', 'fable', 'onyx', 'nova', 'sage', 'shimmer', 'verse'];
    if (!availableVoices.includes(voice.toLowerCase())) {
      throw new Error('Invalid voice option');
    }

    const mp3 = await openai.audio.speech.create({
      model: 'gpt-4o-mini-tts',
      voice: voice.toLowerCase(),
      input: text,
      instructions: 'Speak in a cheerful and positive tone.',
    });

    const buffer = Buffer.from(await mp3.arrayBuffer());
    const filePath = path.resolve(`./server/audio/${Date.now()}.mp3`);
    await fs.promises.writeFile(filePath, buffer);

    return { message: 'Audio file created', path: filePath };
  } catch (error) {
    console.error('Error in TTS service:', error);
    throw error;
  }
}

export class TtsService {
  private readonly collection = firestore.collection('tts-results');

  /**
   * Generates an audio buffer from text using OpenAI's TTS model
   * @param text - The text to convert to speech
   * @param voice - The voice to use for the speech
   * @returns The generated speech as a buffer
   */
  async generateAudio(text: string, voice: string): Promise<Buffer> {
    try {
      const availableVoices = ['alloy', 'ash', 'ballad', 'coral', 'echo', 'fable', 'onyx', 'nova', 'sage', 'shimmer', 'verse'];
      if (!availableVoices.includes(voice.toLowerCase())) {
        throw new Error('Invalid voice option');
      }

      const mp3 = await openai.audio.speech.create({
        model: 'gpt-4o-mini-tts',
        voice: voice.toLowerCase(),
        input: text,
        instructions: 'Speak in a cheerful and positive tone.',
      });

      return Buffer.from(await mp3.arrayBuffer());
    } catch (error) {
      console.error('Error in TTS service:', error);
      throw error;
    }
  }

  /**
   * Saves an audio file to Firebase Storage and returns the URL
   * @param buffer - The audio buffer to save
   * @param fileName - The name of the file to save
   * @returns The URL of the saved audio file
   */
  async saveAudioFile(buffer: Buffer, fileName: string) {
    const bucket = storage.bucket();
    const fileUpload = bucket.file(`tts-audio/${fileName}`);
    
    await fileUpload.save(buffer, {
      metadata: { contentType: 'audio/mp3' }
    });

    const [url] = await fileUpload.getSignedUrl({
      action: 'read',
      expires: '03-01-2500'
    });

    return url;
  }

  /**
   * Saves a TTS result to Firestore
   * @param text - The text that was converted to speech
   * @param audioUrl - The URL of the saved audio file
   * @returns The ID of the saved document
   */
  async saveTtsResult(text: string, audioUrl: string) {
    const docRef = await this.collection.add({
      text,
      audioUrl,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
    });

    return docRef.id;
  }
} 