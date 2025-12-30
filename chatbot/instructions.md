# How to create / active a venv
To create and activate a virtual environment (venv) in Python, follow these steps:

1. **Open your terminal or command prompt.**
2. **Navigate to your project directory** where you want to create the virtual environment:
   ```bash
   cd /chatbot
   ```

3. **Create a virtual environment** by running the following command:
   ```bash
    python -m venv venv
    ```

4. **Activate the virtual environment**:
    - On **Windows**:
      ```bash
      venv\Scripts\activate
      ```
    - On **macOS and Linux**:
      ```bash
      source venv/bin/activate
      ```

# What to do after activating the venv
After activating the virtual environment, you can install the necessary packages:
```bash
pip install flask flask-cors huggingface_hub
```
For environment variable management, you might also want to install:
```bash
pip install python-dotenv
```
# How to set up the Hugging Face token
Then, create a `.env` file in the `chatbot` directory and add your Hugging Face token:
```
HF_TOKEN=your_actual_token_here
```
Make sure not to quote the token value. (do not use "" or '')

# How to run the Flask app
To run the Flask app, make sure you are in the project directory and the virtual environment is activated. Then execute the following command:
```bash
python app.py
```
Use CTRL+C to stop the server when needed.