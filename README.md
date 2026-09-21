# 🎙️ Advanced Text-to-Speech Application

An advanced full-stack Text-to-Speech platform that converts written text into natural-sounding speech using ElevenLabs, with support for multiple languages, voice customization, AI-powered text enhancement, document extraction, speech history, favorites, cloud audio storage, usage tracking, authentication, and an admin dashboard.

---

## 🚀 Project Overview

This project is a Level-3 Advanced Text-to-Speech Application developed using a modern full-stack architecture.

Users can enter text, select a language and voice, customize speech settings, generate high-quality audio, listen to the generated speech, download the audio, save favorite speeches, and access their speech history.

The application also provides advanced features such as:

- AI-powered text enhancement
- TXT, PDF, and DOCX document upload
- Automatic text extraction
- Multiple language support
- Voice customization
- Cloud audio storage
- Speech history
- Favorites
- User profile management
- Usage tracking and limits
- Google authentication
- Admin dashboard
- User management
- Usage and speech analytics

---

# ✨ Features

## 👤 Authentication

- User registration
- User login
- JWT-based authentication
- Protected routes
- Current-user verification
- Google authentication
- Forgot password
- Reset password
- Update password
- Role-based authorization
- Admin authentication

---

## 🗣️ Text-to-Speech

Users can:

- Enter text manually
- Select a language
- Select a voice
- Customize voice parameters
- Generate speech
- Play generated audio
- Download generated audio
- Save generated speech to history

The application uses ElevenLabs for speech generation.

---

## 🌍 Multiple Languages

The application supports a multilingual speech workflow.

Users can:

- Select the source language
- Select the target language
- Process text using the translation workflow
- Generate speech using the selected voice

Available languages and voices are retrieved through backend APIs.

---

## 🎚️ Voice Customization

The speech generation workflow supports voice customization such as:

- Stability
- Similarity
- Style
- Speaker boost
- Voice selection

These settings are passed to the backend and used during speech generation.

---

## 🤖 AI Text Enhancement

The application includes an AI enhancement module with multiple operations:

- Summarization
- Grammar correction
- Rewriting
- Conversational enhancement

This allows users to improve their text before generating speech.

---

## 📄 Document Upload

Users can upload:

- TXT
- PDF
- DOCX

The backend processes the uploaded document and extracts readable text.

The extracted text can then be placed directly into the speech editor.

Maximum upload size is controlled by the backend upload configuration.

---

## ☁️ Cloud Audio Storage

Generated audio can be stored using Supabase Storage.

The application uses a dedicated audio bucket:

```text
tts-audio