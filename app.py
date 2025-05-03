from flask import Flask, request, render_template, send_file, jsonify
from flask_socketio import SocketIO, emit
import os
import whisper
from werkzeug.utils import secure_filename
import threading
import time
import librosa
from deep_translator import GoogleTranslator
import re
import logging
import pathlib
import sys
import io
from contextlib import redirect_stderr
import warnings
import regex
app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = 'uploads'
app.config['MAX_CONTENT_LENGTH'] = 500 * 1024 * 1024
socketio = SocketIO(app)
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
WHISPER_CACHE = pathlib.Path.home() / '.cache' / 'whisper'
MODEL_SIZES = {
    'tiny': 75,
    'small': 461,
    'medium': 1500
}
DOWNLOAD_IN_PROGRESS = {}
DOWNLOAD_LOCK = threading.Lock()
@app.route('/')
def index():
    return render_template('index.html')
@app.route('/process', methods=['POST'])
def process():
    if 'file' not in request.files:
        return jsonify({'error': 'لطفاً یک فایل انتخاب کنید!'}), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'لطفاً یک فایل انتخاب کنید!'}), 400
    model_name = request.form.get('model', 'small')
    language = request.form.get('language', 'Auto')
    task = request.form.get('task', 'transcribe')
    filename = secure_filename(file.filename)
    file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
    file.save(file_path)
    logger.debug(f"فایل ذخیره شد: {file_path}")
    thread = threading.Thread(target=run_whisper, args=(file_path, model_name, language, task))
    thread.start()
    return jsonify({'message': 'در حال پردازش فایل...'})
def check_model_exists(model_name):
    """بررسی وجود مدل در مسیر کش"""
    model_file = WHISPER_CACHE / f"{model_name}.pt"
    return model_file.exists() and not is_file_corrupted(model_name)
def is_file_corrupted(model_name):
    """بررسی خطای checksum"""
    model_file = WHISPER_CACHE / f"{model_name}.pt"
    if not model_file.exists():
        return True
    try:
        with warnings.catch_warnings(record=True) as w:
            warnings.simplefilter("always")
            whisper.load_model(model_name)
            for warning in w:
                if "checksum does not match" in str(warning.message):
                    logger.warning(f"خطای checksum برای مدل {model_name}")
                    return True
        return False
    except Exception as e:
        logger.error(f"خطا در بررسی مدل {model_name}: {str(e)}")
        return True
class TqdmCapture(io.StringIO):
    """کلاس برای capture کردن خروجی tqdm"""
    def __init__(self, model_name):
        super().__init__()
        self.model_name = model_name
    def write(self, msg):
        super().write(msg)
        if not msg.strip():
            return
        logger.debug(f"خروجی tqdm: {msg.strip()}")
        pattern = r'(\d+)%\|.*?\| (\d+\.?\d*)M/(\d+\.?\d*)M \[.*?, (\d+\.?\d*)MiB/s\]'
        match = regex.search(pattern, msg)
        if match:
            try:
                progress = int(match.group(1))
                downloaded_mb = float(match.group(2))
                total_mb = float(match.group(3))
                speed_mb_s = float(match.group(4))
                socketio.emit('model_download_progress', {
                    'progress': progress,
                    'model_name': self.model_name,
                    'downloaded_mb': round(downloaded_mb, 1),
                    'model_size': round(total_mb, 1),
                    'speed_mb_s': round(speed_mb_s, 1),
                    'checksum_error': DOWNLOAD_IN_PROGRESS.get(self.model_name, {}).get('checksum_error', False)
                })
            except Exception as e:
                logger.debug(f"خطا در پردازش خروجی tqdm: {e}")
def track_download_progress(model_name, model_size):
    """ردیابی پیشرفت دانلود با capture کردن خروجی tqdm یا بررسی اندازه فایل"""
    global DOWNLOAD_IN_PROGRESS
    last_progress = 0
    start_time = time.time()
    timeout = 30
    model_file = WHISPER_CACHE / f"{model_name}.pt"
    try:
        logger.debug(f"شروع دانلود مدل {model_name}")
        with redirect_stderr(TqdmCapture(model_name)):
            whisper.load_model(model_name)
        if check_model_exists(model_name):
            logger.debug(f"دانلود مدل {model_name} کامل شد")
            socketio.emit('model_download_progress', {
                'progress': 100,
                'model_name': model_name,
                'downloaded_mb': model_size,
                'model_size': model_size,
                'speed_mb_s': 0,
                'checksum_error': DOWNLOAD_IN_PROGRESS.get(model_name, {}).get('checksum_error', False)
            })
            socketio.emit('model_download_complete', {'model_name': model_name})
        else:
            logger.error(f"مدل {model_name} پس از دانلود معتبر نیست")
            socketio.emit('model_download_error', {'error': f"مدل {model_name} پس از دانلود معتبر نیست"})
            raise Exception(f"مدل {model_name} پس از دانلود معتبر نیست")
    except Exception as e:
        logger.error(f"خطا در دانلود مدل {model_name}: {str(e)}")
        socketio.emit('model_download_error', {'error': f"خطا در دانلود مدل {model_name}: {str(e)}"})
        raise
    finally:
        with DOWNLOAD_LOCK:
            DOWNLOAD_IN_PROGRESS.pop(model_name, None)
            logger.debug(f"قفل دانلود برای مدل {model_name} آزاد شد")
    while not check_model_exists(model_name) and time.time() - start_time < timeout:
        if model_file.exists():
            current_size = os.path.getsize(model_file) / (1024 * 1024)
            progress = min(99, int((current_size / model_size) * 100))
            if progress > last_progress:
                socketio.emit('model_download_progress', {
                    'progress': progress,
                    'model_name': model_name,
                    'downloaded_mb': round(current_size, 1),
                    'model_size': model_size,
                    'speed_mb_s': 0,
                    'checksum_error': DOWNLOAD_IN_PROGRESS.get(model_name, {}).get('checksum_error', False)
                })
                last_progress = progress
        time.sleep(1)
    if time.time() - start_time >= timeout and last_progress == 0:
        logger.error(f"مهلت دانلود مدل {model_name} به پایان رسید")
        socketio.emit('model_download_timeout', {'error': 'Download timed out'})
        with DOWNLOAD_LOCK:
            DOWNLOAD_IN_PROGRESS.pop(model_name, None)
def run_whisper(file_path, model_name, language, task):
    global DOWNLOAD_IN_PROGRESS
    try:
        logger.debug(f"شروع پردازش Whisper برای فایل: {file_path}, مدل: {model_name}")
        socketio.emit('whisper_progress', {'progress': 0})
        logger.debug("پیام whisper_progress اولیه ارسال شد")
        checksum_error = False
        if not check_model_exists(model_name):
            with DOWNLOAD_LOCK:
                if model_name in DOWNLOAD_IN_PROGRESS:
                    logger.debug(f"مدل {model_name} در حال دانلود است، منتظر تکمیل...")
                    while model_name in DOWNLOAD_IN_PROGRESS:
                        time.sleep(1)
                    if not check_model_exists(model_name):
                        logger.error(f"دانلود مدل {model_name} ناموفق بود")
                        socketio.emit('whisper_error', {'error': f"دانلود مدل {model_name} ناموفق بود"})
                        return
                else:
                    logger.debug(f"مدل {model_name} یافت نشد، شروع دانلود...")
                    checksum_error = (WHISPER_CACHE / f"{model_name}.pt").exists()
                    DOWNLOAD_IN_PROGRESS[model_name] = {
                        'model_name': model_name,
                        'checksum_error': checksum_error
                    }
                    socketio.emit('model_download_start', {
                        'model_name': model_name,
                        'model_size': MODEL_SIZES.get(model_name, 461),
                        'checksum_error': checksum_error
                    })
                    download_thread = threading.Thread(target=track_download_progress, 
                                                   args=(model_name, MODEL_SIZES.get(model_name, 461)))
                    download_thread.start()
                    download_thread.join()
                    logger.debug(f"دانلود مدل {model_name} به اتمام رسید")
                    if check_model_exists(model_name):
                        socketio.emit('model_download_complete', {'model_name': model_name})
        try:
            logger.debug(f"بارگذاری مدل {model_name}")
            model = whisper.load_model(model_name)
            logger.debug(f"مدل {model_name} با موفقیت بارگذاری شد")
        except Exception as e:
            logger.error(f"خطا در بارگذاری مدل {model_name}: {str(e)}")
            socketio.emit('whisper_error', {'error': f"خطا در بارگذاری مدل {model_name}: {str(e)}"})
            return
        language = None if language == 'Auto' else language
        task = task.lower()
        try:
            duration = librosa.get_duration(path=file_path)
            logger.debug(f"مدت‌زمان فایل: {duration} ثانیه")
        except Exception as e:
            logger.error(f"خطا در محاسبه مدت‌زمان فایل {file_path}: {str(e)}")
            socketio.emit('whisper_error', {'error': f"خطا در پردازش فایل: {str(e)}"})
            return
        logger.debug(f"شروع تولید زیرنویس برای فایل {file_path}")
        options = {
            'language': language,
            'task': task
        }
        try:
            result = model.transcribe(file_path, **options)
        except Exception as e:
            logger.error(f"خطا در تولید زیرنویس: {str(e)}")
            socketio.emit('whisper_error', {'error': f"خطا در تولید زیرنویس: {str(e)}"})
            return
        segments = result['segments']
        total_segments = len(segments)
        for i, segment in enumerate(segments):
            end_time = segment['end']
            progress = min(99, int((end_time / duration) * 100))
            socketio.emit('whisper_progress', {'progress': progress})
            logger.debug(f"ارسال whisper_progress: {progress}% (قطعه {i+1}/{total_segments}, پایان: {end_time} ثانیه)")
            time.sleep(0.1)
        output_file = os.path.splitext(file_path)[0] + '.srt'
        with open(output_file, 'w', encoding='utf-8') as f:
            for i, segment in enumerate(segments, 1):
                start = segment['start']
                end = segment['end']
                text = segment['text'].strip()
                f.write(f"{i}\n")
                f.write(f"{format_timestamp(start)} --> {format_timestamp(end)}\n")
                f.write(f"{text}\n\n")
        logger.debug(f"فایل SRT تولید شد: {output_file}")
        socketio.emit('whisper_progress', {'progress': 100})
        socketio.emit('whisper_complete', {'srt_file': output_file})
    except Exception as e:
        logger.error(f"خطا در تولید زیرنویس: {str(e)}")
        socketio.emit('whisper_error', {'error': f"خطا در تولید زیرنویس: {str(e)}"})
@app.route('/translate_srt', methods=['POST'])
def translate_srt():
    srt_file = request.form.get('srt_file')
    target_language = request.form.get('target_language', 'fa')
    logger.debug(f"شروع ترجمه فایل: {srt_file} به زبان: {target_language}")
    try:
        if not os.path.exists(srt_file):
            logger.error(f"فایل {srt_file} یافت نشد")
            raise FileNotFoundError(f"فایل {srt_file} یافت نشد")
        with open(srt_file, 'r', encoding='utf-8') as f:
            srt_content = f.read()
        segments = re.split(r'\n\n', srt_content.strip())
        translated_segments = []
        total_segments = len(segments)
        translator = GoogleTranslator(source='auto', target=target_language)
        for i, segment in enumerate(segments):
            lines = segment.split('\n')
            if len(lines) >= 3:
                index = lines[0]
                timestamp = lines[1]
                text = '\n'.join(lines[2:])
                translated_text = translator.translate(text)
                if translated_text:
                    translated_segments.append(f"{index}\n{timestamp}\n{translated_text}")
                else:
                    logger.warning(f"ترجمه برای بخش {i} ناموفق بود، متن اصلی نگه داشته شد")
                    translated_segments.append(segment)
            progress = int(((i + 1) / total_segments) * 100)
            socketio.emit('translate_progress', {'progress': progress})
            time.sleep(0.01)
        translated_file = os.path.splitext(srt_file)[0] + f'_translated_{target_language}.srt'
        with open(translated_file, 'w', encoding='utf-8') as f:
            f.write('\n\n'.join(translated_segments) + '\n')
        logger.debug(f"فایل ترجمه‌شده ذخیره شد: {translated_file}")
        socketio.emit('translate_progress', {'progress': 100})
        socketio.emit('translate_complete', {'translated_file': translated_file})
        return jsonify({'message': 'در حال ترجمه فایل...'})
    except Exception as e:
        logger.error(f"خطا در ترجمه زیرنویس: {str(e)}")
        socketio.emit('translate_error', {'error': f"خطا در ترجمه زیرنویس: {str(e)}"})
        return jsonify({'error': str(e)}), 500
def format_timestamp(seconds):
    """تبدیل ثانیه به فرمت SRT (HH:MM:SS,mmm)"""
    hours = int(seconds // 3600)
    minutes = int((seconds % 3600) // 60)
    secs = int(seconds % 60)
    millis = int((seconds % 1) * 1000)
    return f"{hours:02d}:{minutes:02d}:{secs:02d},{millis:03d}"
@app.route('/download/<path:filename>')
def download(filename):
    logger.debug(f"درخواست دانلود فایل: {filename}")
    return send_file(filename, as_attachment=True)
if __name__ == '__main__':
    socketio.run(app, debug=True, host='0.0.0.0', port=5000)