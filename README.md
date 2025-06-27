# SubGenix

<img src="https://s6.uupload.ir/files/1_7i9t.png" alt="SubGenix Logo" width="400" height="400" style="border-radius:15px;">

SubGenix is a powerful web application for generating and translating subtitles from audio or video files. Built with Flask, Whisper, and SocketIO, it provides a user-friendly interface to transcribe audio into subtitles and translate them into multiple languages. SubGenix supports real-time progress tracking for model downloading and subtitle generation, making it an efficient tool for content creators, translators, and developers.

## 📜 Additional Resources

- **[Persian README (README-FA.md)](README-FA.md)** - Comprehensive guide in Persian

## Features

- **Subtitle Generation**: Transcribe audio/video files into subtitles using OpenAI's Whisper models (`tiny`, `small`, `medium`).
- **Translation**: Translate subtitles into various languages using Google Translate.
- **Real-Time Progress**: Monitor model download and subtitle generation with dynamic progress bars in the web interface and detailed logs in the console (e.g., CMD or PowerShell).
- **Multilingual Interface**: Supports English and Persian with automatic RTL/LTR layout switching.
- **Preview & Download**: Preview subtitles in the browser and download them as `.srt` files.
- **Error Handling**: Displays detailed error messages in both the web interface (alerts) and console (logs) for issues like file processing, model loading, or translation failures.

## Prerequisites

To run SubGenix, ensure the following are installed:

- **Python**: Version 3.8 or higher. Download from [python.org](https://www.python.org/downloads/).
- A modern web browser (e.g., Chrome, Firefox, Edge) for the web interface.
- Internet connection for downloading Whisper models and translation services.

## Installation

Follow these steps to set up SubGenix locally:

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/tahasite/SubGenix.git
   cd SubGenix
   ```

2. **Install Dependencies**:
   Ensure `pip` is installed, then run the following commands to install the required libraries:
   ```bash
   pip install Flask
   pip install flask-socketio
   pip install librosa
   pip install deep-translator
   pip install werkzeug
   pip install python-socketio
   pip install python-engineio
   pip install git+https://github.com/openai/whisper.git@main
   ```

3. **Verify Python Installation**:
   Check that Python is installed and accessible:
   ```bash
   python --version
   ```
   If this fails, ensure Python is installed and added to your system's PATH.

## Usage

1. **Run the Application**:
   Start the Flask server:
   ```bash
   python app.py
   ```
   The server runs on `http://localhost:5000` by default. Console logs (e.g., in CMD or PowerShell) will show server startup and runtime messages (e.g., `INFO:__main__:Server started on port 5000`).

2. **Access the Web Interface**:
   Open a browser and navigate to `http://localhost:5000`.

3. **Generate Subtitles**:
   - Select the **Generate** tab.
   - Upload an audio or video file (max 500MB).
   - Choose a Whisper model (`tiny`, `small`, or `medium`).
   - Select the source language or use "Auto Detect".
   - Click **Generate Subtitles**.
   - Track progress via the web interface's progress bar and console logs (e.g., `INFO:__main__:Processing segment 1/50`).
   - Download the `.srt` file or preview subtitles once complete.

4. **Translate Subtitles**:
   - Switch to the **Translate** tab.
   - Select the generated `.srt` file (auto-populated after generation).
   - Choose the target language.
   - Click **Translate Subtitles**.
   - Monitor translation progress in the web interface and console logs (e.g., `INFO:__main__:Translating to Spanish (50% complete)`).
   - Download or preview the translated `.srt` file.

## Progress Tracking

- **Model Download**: If a Whisper model is not cached, a progress bar in the web interface shows download status (e.g., "Downloading model... (tiny, 72.1MB of 75MB)"). Console logs provide detailed progress (e.g., `INFO:__main__:Downloading tiny model (50%)`).
- **Subtitle Generation**: Progress is shown as a percentage in the web interface, calculated based on subtitle segment timestamps relative to the file's total duration. Console logs detail each segment (e.g., `INFO:__main__:Processed segment at 41.36s (3% complete)`).

## Troubleshooting

- **Python Not Found**:
   Ensure Python is installed and added to your PATH. Run `python --version` to verify.
- **Module Not Found**:
   Re-run the `pip install` commands listed above.
- **Progress Bar Stalls**:
   Check console logs for errors (e.g., `ERROR:__main__:Invalid audio file`). Common issues:
   - Invalid audio/video file: Ensure the file is in a supported format.
   - Internet issues: Verify your connection for model downloads or translations.
   - Model corruption: Delete the model file (e.g., `~/.cache/whisper/tiny.pt`) and try again.
- **WebSocket Errors**:
   If the browser console shows `WebSocket disconnected`, ensure no firewall is blocking port 5000. Check console logs for details (e.g., `ERROR:__main__:WebSocket connection failed`).

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

## 📞 Support & Contact

For questions or issues, contact us via Telegram:  
📩 [@AdminTahaSite](https://t.me/AdminTahaSite)

<img src="https://s6.uupload.ir/files/image_2025-03-12_01-27-52_3a5r.png" alt="QR Code for @AdminTahaSite" width="150" height="150">

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Project Status

SubGenix is actively maintained. Check the [Issues](https://github.com/tahasite/SubGenix/issues) section for planned features and bug reports.

---

Happy subtitling with SubGenix! 🎥