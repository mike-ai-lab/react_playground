# Quick Start Guide

## 1. Install Dependencies

Open terminal in this folder and run:

```bash
npm install
```

## 2. Setup API Key

Copy the example environment file:

```bash
copy .env.example .env.local
```

Then edit `.env.local` and add your Groq API key:

```
VITE_GROQ_API_KEY=gsk_your_actual_key_here
```

Get a free API key at: https://console.groq.com

## 3. Start Server

```bash
npm start
```

## 4. Open Browser

Go to: http://localhost:5000

## That's it!

You should see the AI Code Editor interface with:
- File explorer on the left
- Code editor in the middle  
- AI chat on the right

Try asking the AI to "create a React login form" to test it out!

## Troubleshooting

**Port 5000 already in use?**
- Close other applications using port 5000
- Or edit `server.js` and change the port number

**API key not working?**
- Make sure you copied the key correctly (no extra spaces)
- Restart the server after adding the key
- Check that the file is named `.env.local` (not `.env.local.txt`)

**Need help?**
- Check the full README.md for more details
- Look at the browser console (F12) for error messages
