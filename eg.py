import os
import json
import uuid
import base64
import asyncio
import websockets
from typing import AsyncIterator, Optional
from fastapi import WebSocket
import logging

logger = logging.getLogger(__name__)


class TTSService:
    """Service for handling Text-to-Speech operations using Murf API with WebSocket streaming"""

    def __init__(self):
        self.api_key = os.getenv("MURF_API_KEY")
        self.api_url = os.getenv("MURF_API_URL", "https://api.murf.ai/v1/speech/generate")
        self.websocket_url = "wss://api.murf.ai/v1/speech/stream-input"

        if not self.api_key:
            logger.error("MURF_API_KEY not found in environment variables")
            raise ValueError("MURF_API_KEY not configured")

        logger.info("TTSService initialized successfully with WebSocket streaming support")

    async def stream_text_to_murf_websocket(
        self,
        text_chunks: AsyncIterator[str],
        voice_id: str = "en-US-ken",
        client_websocket: Optional[WebSocket] = None
    ) -> Optional[str]:
        """
        Stream text chunks to Murf WebSocket and forward base64 audio to the client.
        """
        try:
            logger.info("Starting Murf WebSocket streaming session")
            print(f"\n{'='*80}\n🎵 MURF WEBSOCKET STREAMING SESSION STARTED\n{'='*80}")

            # ✅ Generate a fresh context ID for every session
            context_id = str(uuid.uuid4())

            # Construct the full WebSocket URL with parameters
            full_websocket_url = (
                f"{self.websocket_url}?api-key={self.api_key}"
                f"&sample_rate=24000"
                f"&channel_type=MONO"
                f"&format=MP3"
                f"&context_id={context_id}"
            )

            print(f"Connecting to: {full_websocket_url}")

            accumulated_audio = []
            chunk_count = 0

            async with websockets.connect(
                full_websocket_url,
                ping_interval=20,
                ping_timeout=10
            ) as websocket:
                logger.info("WebSocket connection established with Murf")
                print("✅ WebSocket connected to Murf API")

                # Concurrently send text chunks and receive audio
                async def receive_messages():
                    nonlocal accumulated_audio
                    try:
                        async for message in websocket:
                            response_data = json.loads(message)
                            if "audio" in response_data and response_data["audio"]:
                                base64_audio = response_data["audio"]
                                accumulated_audio.append(base64_audio)

                                # 🚀 Send audio chunk to the client WebSocket
                                if client_websocket:
                                    try:
                                        if client_websocket.client_state.value == 1:  # OPEN
                                            print("✅ Forwarding audio chunk to client")
                                            audio_message = {
                                                "type": "audio_chunk",
                                                "data": base64_audio
                                            }
                                            await client_websocket.send_text(json.dumps(audio_message))
                                        else:
                                            print("⚠️ Client WebSocket not open, skipping audio forward")
                                    except Exception as send_error:
                                        logger.error(f"Failed to forward audio to client: {send_error}")

                            elif response_data.get("event") == "completed":
                                print("✅ Murf reports stream completed.")
                                # 🔧 Send stream end notification
                                if client_websocket and client_websocket.client_state.value == 1:
                                    try:
                                        await client_websocket.send_text(json.dumps({"type": "audio_stream_end"}))
                                    except Exception as e:
                                        logger.error(f"Failed to send stream end: {e}")
                                break
                    except websockets.exceptions.ConnectionClosed:
                        logger.info("Connection to Murf closed.")
                    except Exception as e:
                        logger.error(f"Error receiving messages from Murf: {e}")

                receiver_task = asyncio.create_task(receive_messages())

                # Send all text chunks from the LLM
                text_sent = False
                async for text_chunk in text_chunks:
                    if text_chunk.strip():
                        text_sent = True
                        chunk_count += 1
                        text_message = {"text": text_chunk}
                        await websocket.send(json.dumps(text_message))
                        print(f"📤 Chunk {chunk_count:02d}: Sent '{text_chunk.strip()}' to Murf")

                # 🔧 Only wait for receiver if we actually sent text
                if text_sent:
                    print("📤 All text sent. Waiting for Murf to finish processing...")
                    await receiver_task
                else:
                    print("⚠️ No text was sent to Murf")
                    receiver_task.cancel()

            # Process the results
            if accumulated_audio:
                complete_base64_audio = "".join(accumulated_audio)
                print(f"\n{'='*80}\n🎉 MURF STREAMING COMPLETE\nTotal Audio Chunks Received: {len(accumulated_audio)}\n {'='*80}")
                return await self._save_base64_audio_to_file(complete_base64_audio)
            else:
                logger.warning("No audio received from Murf WebSocket")
                return None

        except websockets.exceptions.InvalidStatusCode as e:
            logger.error(f"WebSocket connection failed: {e.status_code} {e.reason}")
            print(f"❌ WebSocket connection failed: server rejected connection: HTTP {e.status_code}")
            return None
        except Exception as e:
            logger.error(f"Error in Murf WebSocket streaming: {str(e)}")
            print(f"❌ Murf WebSocket streaming failed: {str(e)}")
            return None

    async def _save_base64_audio_to_file(self, base64_audio: str) -> Optional[str]:
        """Saves base64 encoded audio to a file and returns its URL."""
        try:
            os.makedirs("static/audio", exist_ok=True)
            from datetime import datetime
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"murf_websocket_audio_{timestamp}.mp3"
            filepath = f"static/audio/{filename}"

            audio_data = base64.b64decode(base64_audio)
            with open(filepath, "wb") as audio_file:
                audio_file.write(audio_data)

            audio_url = f"/static/audio/{filename}"
            logger.info(f"Base64 audio saved to: {filepath}")
            print(f"💾 Base64 audio saved to file: {filepath}")
            return audio_url
        except Exception as e:
            logger.error(f"Error saving base64 audio to file: {str(e)}")
            return None

    async def stream_tts(self, text_chunks: AsyncIterator[str], voice_id: str = "en-US-ken", client_websocket: Optional[WebSocket] = None) -> Optional[str]:
        """Main method to generate speech from streaming text using Murf WebSocket."""
        return await self.stream_text_to_murf_websocket(text_chunks, voice_id, client_websocket)
