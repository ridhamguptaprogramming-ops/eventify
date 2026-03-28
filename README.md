<div align="center">
<!-- <img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div> -->

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/9184e481-82d9-4c20-8b9d-4f555ac04878

## Run Locally

**Prerequisites:** Node.js, MongoDB


1. Install dependencies:
   `npm install`
2. Create `.env` (or copy `.env.example`) and set `MONGODB_URI`
3. Set the `GEMINI_API_KEY` in `.env` if your flow uses Gemini
4. Run the app:
   `npm run dev`
