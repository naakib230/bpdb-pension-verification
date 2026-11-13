# BPDB Open-Source Face Verification Microservice
100% Free & Open-Source Server-Side Face Descriptor Comparison Engine

## Overview
This service provides zero-cost facial matching and liveness analysis using `@vladmandic/human` and TensorFlow.js models. It removes the need for expensive third-party cloud APIs like AWS Rekognition ($0.001/call) or Azure Cognitive Face API.

## Features
- Extracts 128-D facial vector descriptors directly from images.
- Computes Euclidean distance and Cosine Similarity.
- Enforces BPDB's strict `>= 85.0%` passing threshold.
- Zero paid API keys required.

## Quickstart (Local)
```bash
cd face-service
npm install
npm start
```
The server will start at `http://localhost:8080`.

## Docker Deployment (Free Render / Fly.io / Railway)
```dockerfile
FROM node:20-slim
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 8080
CMD ["node", "index.js"]
```

## Supabase Edge Function Integration
Set your deployed microservice URL in your Supabase project secrets:
```bash
supabase secrets set FACE_SERVICE_URL="https://your-face-service.onrender.com"
```
