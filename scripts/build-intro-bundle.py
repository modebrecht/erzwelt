"""Build the web intro bundle from the original images with Pillow."""

import base64
from io import BytesIO
import json
from pathlib import Path

from PIL import Image, ImageEnhance, ImageFilter


def webp_url(image, quality):
    output = BytesIO()
    image.save(output, "WEBP", quality=quality, method=6)
    return "data:image/webp;base64," + base64.b64encode(output.getvalue()).decode("ascii")


root = Path(__file__).resolve().parents[1]
manifest = json.loads((root / "patches.json").read_text(encoding="utf-8"))
bundle = {}
for slide in manifest["introBilder"]:
    filename = slide["datei"]
    with Image.open(root / filename) as original:
        image = original.convert("RGB")
    image.thumbnail((1280, 720), Image.Resampling.LANCZOS)
    background = image.resize((48, 27), Image.Resampling.LANCZOS)
    background = ImageEnhance.Brightness(background.filter(ImageFilter.GaussianBlur(1.5))).enhance(0.55)
    bundle[filename] = {"src": webp_url(image, 80), "hintergrund": webp_url(background, 72)}

(root / "assets/intro/bilder.json").write_text(json.dumps(bundle, indent=2) + "\n", encoding="utf-8")
