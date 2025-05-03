# SubGenix

SubGenix is a powerful web application for generating and translating subtitles from audio or video files. Built with Flask, Whisper, and SocketIO, it provides a user-friendly interface to transcribe audio into subtitles and translate them into multiple languages. SubGenix supports real-time progress tracking for both model downloading and subtitle generation, making it an efficient tool for content creators, translators, and developers.

## Features

- **Subtitle Generation**: Transcribe audio/video files into subtitles using OpenAI's Whisper models (`tiny`, `small`, `medium`).
- **Translation**: Translate generated subtitles into various languages using Google Translate.
- **Real-Time Progress**: Track model download and subtitle generation progress with dynamic progress bars.
- **Multilingual Interface**: Supports English and Persian (Farsi) with RTL/LTR layout switching.
- **Preview & Download**: Preview subtitles in the browser and download them as `.srt` files.
- **Error Handling**: Robust error reporting for file processing, model loading, and translation issues.

## Prerequisites

To run SubGenix, you need to have the following installed:

- **Python**: Version 3.8 or higher. Download and install from [python.org](https://www.python.org/downloads/).
- A modern web browser (e.g., Chrome, Firefox, Edge) for accessing the web interface.
- Internet connection (for downloading Whisper models and translation services).

## Installation

Follow these steps to set up SubGenix on your local machine:

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/tahasite/SubGenix.git
   cd SubGenix
   ```

2. **Set Up a Virtual Environment** (recommended):
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install Dependencies**:
   Ensure you have `pip` installed, then run:
   ```bash
   pip install -r requirements.txt
   ```
   The `requirements.txt` file includes:
   - Flask==2.3.3
   - flask-socketio==5.3.6
   - openai-whisper==20231117
   - librosa==0.10.2
   - deep-translator==1.11.4
   - werkzeug==3.0.1
   - regex==2023.12.25

4. **Verify Python Installation**:
   Confirm that Python is installed and accessible:
   ```bash
   python --version
   ```
   If this command fails, ensure Python is installed and added to your system's PATH.

## Usage

1. **Run the Application**:
   Start the Flask server:
   ```bash
   python app.py
   ```
   The server will run on `http://localhost:5000` by default.

2. **Access the Web Interface**:
   Open your web browser and navigate to `http://localhost:5000`.

3. **Generate Subtitles**:
   - Select the **Generate** tab.
   - Upload an audio or video file (max 500MB).
   - Choose a Whisper model (`tiny`, `small`, or `medium`).
   - Select the source language or use "Auto Detect".
   - Click **Generate Subtitles**.
   - Monitor the progress bar for model download (if needed) and subtitle generation.
   - Once complete, download the `.srt` file or preview the subtitles.

4. **Translate Subtitles**:
   - Switch to the **Translate** tab.
   - Select the generated `.srt` file (automatically populated after generation).
   - Choose the target language.
   - Click **Translate Subtitles**.
   - Download or preview the translated `.srt` file.

## Progress Tracking

- **Model Download**: If a Whisper model is not cached, SubGenix displays a progress bar showing download progress (e.g., "Downloading model... (tiny, 72.1MB of 75MB)").
- **Subtitle Generation**: Progress is calculated based on the timestamp of each subtitle segment relative to the total duration of the audio/video file (e.g., a segment ending at 41.36 seconds in a 23-minute video shows ~3% progress).

## Troubleshooting

- **Python Not Found**:
  Ensure Python is installed and added to your PATH. Run `python --version` to verify.
- **Module Not Found**:
  Re-run `pip install -r requirements.txt` in the virtual environment.
- **Progress Bar Stalls**:
  Check the terminal for error logs (e.g., `ERROR:__main__:...`). Common issues include:
  - Invalid audio/video file: Ensure the file is a supported format.
  - Internet issues: Verify your connection for model downloads or translations.
  - Model corruption: Delete the model file (e.g., `~/.cache/whisper/tiny.pt`) and try again.
- **WebSocket Errors**:
  If the browser console shows `WebSocket disconnected`, ensure no firewall is blocking port 5000.

## Contributing

Contributions are welcome! To contribute:

1. Fork the repository.
2. Create a new branch (`git checkout -b feature/your-feature`).
3. Make your changes and commit (`git commit -m "Add your feature"`).
4. Push to your branch (`git push origin feature/your-feature`).
5. Open a Pull Request.

Please ensure your code follows the project's coding style and includes appropriate tests.

## Acknowledgments

- [OpenAI Whisper](https://github.com/openai/whisper) for speech-to-text transcription.
- [Flask](https://flask.palletsprojects.com/) and [Flask-SocketIO](https://flask-socketio.readthedocs.io/) for the web framework and real-time communication.
- [librosa](https://librosa.org/) for audio duration analysis.
- [deep-translator](https://github.com/nidhaloff/deep-translator) for subtitle translation.

## 📜 Additional Resources

- **[Persian README (README-FA.md)](README-FA.md)** - توضیحات کامل به زبان فارسی  

---

## 📞 Support & Contact

If you have any questions or issues, feel free to contact us via Telegram:  
📩 [@AdminTahaSite](https://t.me/AdminTahaSite)

<img src="https://s6.uupload.ir/files/image_2025-03-12_01-27-52_3a5r.png" alt="QR Code for @AdminTahaSite" width="150" height="150">

---

Happy subtitling with SubGenix! 🎥
