import re
import base64
import requests
from google.adk.agents import Agent

def analyze_radar_image_from_url(url: str) -> dict:
    """Fetch a RIDGE reflectivity still image by URL and hand it to the model for analysis.

    Expected URL pattern (example):
      https://radar.weather.gov/ridge/standard/KOKX_0.gif

    Returns a base64-encoded image and a tiny guidance prompt so the model
    writes a short, friendly nowcast like weather news.
    """
    try:
        resp = requests.get(url, timeout=12)
        if resp.status_code != 200 or not resp.content:
            return {"status": "error", "error_message": f"HTTP {resp.status_code} from {url}"}
        mime = resp.headers.get("Content-Type", "image/gif")
        # grab the radar id if present in the URL (optional)
        rid = None
        m = re.search(r"/standard/([A-Za-z0-9]{3,4})_0\\.gif$", url)
        if m:
            rid = m.group(1).upper()
        return {
            "status": "success",
            "radar_id": rid,
            "source_url": url,
            "media": {
                "mime_type": mime,
                "base64_data": base64.b64encode(resp.content).decode("ascii"),
            },
            "guidance": (
                "You are looking at a single-frame radar reflectivity image. "
                "Write a very short, friendly nowcast like a weather update: "
                "1) say if precipitation is present or not; 2) rate intensity (light/moderate/heavy); "
                "3) mention any obvious danger signals (very intense cores). "
                "Avoid jargon and numbers; do NOT infer motion from a single frame; keep to 2–3 sentences; "
                "start with a brief headline (3–6 words)."
            ),
        }
    except Exception as e:
        return {"status": "error", "error_message": str(e)}


root_agent = Agent(
    name="radar_nowcaster",
    model="gemini-2.0-flash",
    description="Given a RIDGE reflectivity image URL, produce a simple, newsy nowcast.",
    instruction=(
        "When a tool returns 'media', analyze the image directly. Output a brief headline and a 2–3 sentence, "
        "plain-English nowcast. Say whether it's dry or precipitating, approximate intensity, and any obvious hazard cues. "
        "Avoid jargon and precise motion/timing claims from a single frame."
    ),
    tools=[analyze_radar_image_from_url],
)
