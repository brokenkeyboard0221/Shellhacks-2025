# from google.adk import Agent
# from google.genai import types
# from vertexai.agent_engines import AdkApp
from agent import root_agent, analyze_radar_image_from_url
from flask import Flask, request, jsonify
import requests

# model = "gemini-2.0-flash"

# # Create the tool to fetch weather data based on user longitude and latitude
def main():
        latitude = request.json.get("latitude")
        longitude = request.json.get("longitude")

        radar_id_json = get_weather_radar_id(latitude, longitude)
        get_weather_radar_image(radar_id_json(radar_id_json[2]))
        result = analyze_radar_image_from_url(radar_id_json['url'])
        return jsonify(result)

def get_weather_radar_id(user_longitude: str, user_latitude: str) -> dict:
        return f"https://api.weather.gov/points/{user_latitude},{user_longitude}"


def get_weather_radar_image(radar_id: str) -> dict:
        return {"url": f"https://radar.weather.gov/ridge/standard/{radar_id}_0.gif"}

# # Create safety parameters for generation coming out of the AI
# safety_settings = [
#         types.SafetySetting(
#                 category=types.HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
#                 threshold=types.HarmBlockThreshold.OFF,
#         ),
# ]

# # Create parameters for content generation, like randomness and parsing
# generate_content_config = types.GenerateContentConfig(
#         safety_settings=safety_settings,
#         temperature=0.3,
#         max_output_tokens=1000,
#         top_p=0.95,
# )


# # Create the agent
# root_agent = Agent(
#         model=model,
#         name="radar_finder",
#         generate_content_config=generate_content_config,
#         tools=[get_weather_radar_id],
# )

# # Place the agent in an AdkApp
# app = AdkApp(agent=root_agent)


# root_agent.query("What is the weather radar for the following coordinates?")