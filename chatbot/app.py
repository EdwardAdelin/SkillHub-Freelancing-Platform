import os
from dotenv import load_dotenv 
from flask import Flask, request, jsonify
from flask_cors import CORS
from huggingface_hub import InferenceClient
from knowledge_base import PLATFORM_DOCS

load_dotenv()  # Load environment variables from .env file

app = Flask(__name__)
CORS(app)

HF_TOKEN = os.getenv("HF_TOKEN")

# CHECK FOR TOKEN
if not HF_TOKEN:
    raise ValueError("Error: HF_TOKEN is missing. Make sure you created the .env file.")

# ✅ FALLBACK LIST: If the first one fails, we try the next one.
MODELS_TO_TRY = [
    "meta-llama/Meta-Llama-3-8B-Instruct",   # Best, most likely to work
    "Qwen/Qwen2.5-72B-Instruct",             # Very smart alternative
    "HuggingFaceH4/zephyr-7b-beta",          # Reliable backup
    "google/gemma-1.1-7b-it"                 # Google's lightweight model
]

client = InferenceClient(token=HF_TOKEN)

@app.route('/chat', methods=['POST'])
def chat():
    data = request.json
    user_message = data.get('message', '')

    if not user_message:
        return jsonify({"error": "No message provided"}), 400

    print(f"User Question: {user_message}")

    messages = [
        {
            "role": "system", 
            "content": f"You are a helpful assistant for SkillHub. Answer questions strictly based on the context below. If the answer is not in the context, say 'I don't know'.\n\nCONTEXT:\n{PLATFORM_DOCS}"
        },
        { "role": "user", "content": user_message }
    ]

    # ✅ LOOP THROUGH MODELS
    for model_id in MODELS_TO_TRY:
        try:
            print(f"Attempting to use model: {model_id}...")
            
            response = client.chat_completion(
                model=model_id,
                messages=messages,
                max_tokens=500,
                temperature=0.7
            )
            
            bot_reply = response.choices[0].message.content
            print(f"✅ Success with {model_id}")
            return jsonify({"reply": bot_reply})

        except Exception as e:
            print(f"⚠️ Failed with {model_id}: {e}")
            # Loop continues to the next model...

    # If ALL models fail
    return jsonify({"reply": "I apologize, but my AI servers are currently overloaded. Please try again in a minute."}), 503

if __name__ == '__main__':
    print("SkillHub Robust Backend Running...")
    app.run(port=5000, debug=True)