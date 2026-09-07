#!/usr/bin/env python3
"""Local NVIDIA image server for ChapterKin illustrations."""

from __future__ import annotations

import io
import json
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

import torch
from diffusers import AutoPipelineForText2Image
from PIL import Image

MODEL_ID = "stabilityai/sd-turbo"
HOST = "127.0.0.1"
PORT = 7860
SIZE = 512

if not torch.cuda.is_available():
    raise SystemExit(
        "CUDA is not available. Install a CUDA PyTorch wheel "
        "(see requirements-images.txt) and confirm nvidia-smi works. "
        "If /dev/nvidia0 is missing, run: sudo /sbin/ub-device-create"
    )

DEVICE = torch.device("cuda")
DTYPE = torch.float16
GPU_NAME = torch.cuda.get_device_name(0)

print(f"Loading {MODEL_ID} on {GPU_NAME}…", flush=True)
pipe = AutoPipelineForText2Image.from_pretrained(
    MODEL_ID,
    dtype=DTYPE,
    safety_checker=None,
)
pipe.to(DEVICE)
print(f"Image server ready at http://{HOST}:{PORT} ({GPU_NAME})", flush=True)


def render(prompt: str) -> bytes:
    styled = (
        "children's picture book illustration, watercolor gouache, warm lighting, "
        "painted not photorealistic, no text, no letters, no watermark, "
        f"{prompt}"
    )
    image = pipe(
        styled,
        num_inference_steps=2,
        guidance_scale=0.0,
        width=SIZE,
        height=SIZE,
    ).images[0]
    image = image.resize((1024, 1024), Image.Resampling.LANCZOS)
    buffer = io.BytesIO()
    image.save(buffer, format="PNG")
    return buffer.getvalue()


class Handler(BaseHTTPRequestHandler):
    def log_message(self, format: str, *args) -> None:  # noqa: A003
        print(format % args)

    def do_GET(self) -> None:  # noqa: N802
        if self.path != "/health":
            self.send_error(404)
            return
        body = json.dumps(
            {
                "ok": True,
                "model": MODEL_ID,
                "device": "cuda",
                "gpu": GPU_NAME,
            }
        ).encode()
        self.send_response(200)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_POST(self) -> None:  # noqa: N802
        if self.path != "/generate":
            self.send_error(404)
            return
        length = int(self.headers.get("Content-Length", "0"))
        payload = json.loads(self.rfile.read(length) or b"{}")
        prompt = str(payload.get("prompt") or "").strip()
        if not prompt:
            self.send_error(400, "prompt required")
            return
        try:
            png = render(prompt)
        except Exception as error:  # noqa: BLE001
            message = str(error).encode()
            self.send_response(500)
            self.send_header("Content-Type", "text/plain")
            self.send_header("Content-Length", str(len(message)))
            self.end_headers()
            self.wfile.write(message)
            return
        self.send_response(200)
        self.send_header("Content-Type", "image/png")
        self.send_header("Content-Length", str(len(png)))
        self.end_headers()
        self.wfile.write(png)


if __name__ == "__main__":
    ThreadingHTTPServer((HOST, PORT), Handler).serve_forever()
