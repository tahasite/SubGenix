const socket = io();
const translations = {
    fa: {
        title: 'تولید و ترجمه زیرنویس',
        header: 'زیرنویس حرفه‌ای',
        language_label: 'زبان',
        tab_transcribe: 'تولید',
        tab_translate: 'ترجمه',
        file_label: 'فایل صوتی/ویدیویی',
        model_label: 'مدل',
        model_tiny: 'Tiny (سریع)',
        model_small: 'Small (متعادل)',
        model_medium: 'Medium (دقیق)',
        source_language_label: 'زبان',
        language_auto: 'تشخیص خودکار',
        language_en: 'انگلیسی',
        language_es: 'اسپانیایی',
        language_fr: 'فرانسوی',
        language_de: 'آلمانی',
        language_fa: 'فارسی',
        language_ar: 'عربی',
        language_zh: 'چینی',
        language_ja: 'ژاپنی',
        generate_button: 'تولید زیرنویس',
        generating: 'در حال تولید... (0%)',
        target_language_label: 'زبان مقصد',
        translate_button: 'ترجمه زیرنویس',
        translating: 'در حال ترجمه... (0%)',
        preview_title: 'پیش‌نمایش زیرنویس',
        close_button: 'بستن',
        generated_message: 'فایل زیرنویس تولید شد:',
        translated_message: 'فایل زیرنویس ترجمه‌شده تولید شد:',
        download: 'دانلود',
        preview: 'پیش‌نمایش',
        error: 'خطا',
        downloading_model: 'در حال دانلود مدل...',
        model_download_complete: 'دانلود مدل کامل شد',
        downloading_model_checksum: 'دانلود مجدد مدل به دلیل خطای checksum...',
        download_timeout: 'مهلت دانلود مدل به پایان رسید. لطفاً اتصال اینترنت را بررسی کنید.',
        processing_timeout: 'مهلت پردازش مدل به پایان رسید. لطفاً دوباره امتحان کنید.'
    },
    en: {
        title: 'Subtitle Generation & Translation',
        header: 'Professional Subtitles',
        language_label: 'Language',
        tab_transcribe: 'Generate',
        tab_translate: 'Translate',
        file_label: 'Audio/Video File',
        model_label: 'Model',
        model_tiny: 'Tiny (Fast)',
        model_small: 'Small (Balanced)',
        model_medium: 'Medium (Accurate)',
        source_language_label: 'Source Language',
        language_auto: 'Auto Detect',
        language_en: 'English',
        language_es: 'Spanish',
        language_fr: 'French',
        language_de: 'German',
        language_fa: 'Persian',
        language_ar: 'Arabic',
        language_zh: 'Chinese',
        language_ja: 'Japanese',
        generate_button: 'Generate Subtitles',
        generating: 'Generating... (0%)',
        target_language_label: 'Target Language',
        translate_button: 'Translate Subtitles',
        translating: 'Translating... (0%)',
        preview_title: 'Subtitle Preview',
        close_button: 'Close',
        generated_message: 'Subtitle file generated:',
        translated_message: 'Translated subtitle file generated:',
        download: 'Download',
        preview: 'Preview',
        error: 'Error',
        downloading_model: 'Downloading model...',
        model_download_complete: 'Model download completed',
        downloading_model_checksum: 'Redownloading model due to checksum error...',
        download_timeout: 'Model download timed out. Please check your internet connection.',
        processing_timeout: 'Model processing timed out. Please try again.'
    }
};
function switchLanguage(lang) {
    document.documentElement.lang = lang;
    document.documentElement.setAttribute('dir', lang === 'fa' ? 'rtl' : 'ltr');
    document.querySelectorAll('[data-translate]').forEach(element => {
        const key = element.getAttribute('data-translate');
        element.textContent = translations[lang][key] || element.textContent;
    });
    document.title = translations[lang].title;
    const whisperProgressText = document.getElementById('whisperProgressText');
    const translateProgressText = document.getElementById('translateProgressText');
    const modelDownloadText = document.getElementById('modelDownloadText');
    whisperProgressText.setAttribute('data-progress-text', translations[lang].generating);
    translateProgressText.setAttribute('data-progress-text', translations[lang].translating);
    modelDownloadText.setAttribute('data-progress-text', translations[lang].downloading_model);
    localStorage.setItem('selectedLanguage', lang);
    document.getElementById('language-switch').value = lang;
}
document.getElementById('language-switch').addEventListener('change', function () {
    const selectedLang = this.value;
    switchLanguage(selectedLang);
});
function showTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
    document.getElementById(tabId).classList.add('active');
    document.querySelector(`.tab-button[onclick="showTab('${tabId}')"]`).classList.add('active');
}
document.getElementById('uploadForm').addEventListener('submit', async function (e) {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);
    const modelDownloadContainer = document.getElementById('modelDownloadContainer');
    const whisperProgressContainer = document.getElementById('whisperProgressContainer');
    const result = document.getElementById('result');
    const submitButton = form.querySelector('button[type="submit"]');
    submitButton.disabled = true;
    modelDownloadContainer.classList.add('d-none');
    whisperProgressContainer.classList.add('d-none');
    result.innerHTML = '';
    try {
        const response = await fetch('/process', {
            method: 'POST',
            body: formData
        });
        const data = await response.json();
        if (data.error) {
            console.error('Error in process request:', data.error);
            result.innerHTML = `<p class="text-danger">${translations[document.documentElement.lang].error}: ${data.error}</p>`;
            submitButton.disabled = false;
        }
    } catch (error) {
        console.error('Error in process request:', error);
        result.innerHTML = `<p class="text-danger">${translations[document.documentElement.lang].error}: ${error.message}</p>`;
        submitButton.disabled = false;
    }
});
document.getElementById('translateForm').addEventListener('submit', async function (e) {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);
    const translateProgressContainer = document.getElementById('translateProgressContainer');
    const result = document.getElementById('result');
    const submitButton = form.querySelector('button[type="submit"]');
    const translateProgressBar = document.getElementById('translateProgressBar');
    const translateProgressText = document.getElementById('translateProgressText');
    const lang = document.documentElement.lang;
    submitButton.disabled = true;
    translateProgressContainer.classList.remove('d-none');
    result.innerHTML = '';
    translateProgressBar.style.width = '0%';
    translateProgressText.textContent = translations[lang].translating.replace('(0%)', '(0%)');
    try {
        const response = await fetch('/translate_srt', {
            method: 'POST',
            body: formData
        });
        const data = await response.json();
        if (data.error) {
            console.error('Error in translate request:', data.error);
            result.innerHTML = `<p class="text-danger">${translations[lang].error}: ${data.error}</p>`;
            translateProgressContainer.classList.add('d-none');
            submitButton.disabled = false;
        }
    } catch (error) {
        console.error('Error in translate request:', error);
        result.innerHTML = `<p class="text-danger">${translations[lang].error}: ${error.message}</p>`;
        translateProgressContainer.classList.add('d-none');
        submitButton.disabled = false;
    }
});
socket.on('connect', function () {
    console.log('WebSocket connected');
});
socket.on('disconnect', function () {
    console.log('WebSocket disconnected');
});
socket.on('model_download_start', function (data) {
    console.log('Received model_download_start:', data);
    const modelDownloadContainer = document.getElementById('modelDownloadContainer');
    const modelDownloadText = document.getElementById('modelDownloadText');
    const modelDownloadBar = document.getElementById('modelDownloadBar');
    const lang = document.documentElement.lang;
    modelDownloadContainer.classList.remove('d-none');
    modelDownloadText.textContent = data.checksum_error ? 
        `${translations[lang].downloading_model_checksum} (${data.model_name}, 0MB of ${data.model_size}MB)` :
        `${translations[lang].downloading_model} (${data.model_name}, 0MB of ${data.model_size}MB)`;
    modelDownloadBar.style.width = '0%';
});
socket.on('model_download_progress', function (data) {
    console.log('Received model_download_progress:', data);
    const modelDownloadBar = document.getElementById('modelDownloadBar');
    const modelDownloadText = document.getElementById('modelDownloadText');
    const lang = document.documentElement.lang;
    const progress = data.progress;
    modelDownloadBar.style.width = `${progress}%`;
    modelDownloadBar.setAttribute('aria-valuenow', progress);
    modelDownloadText.textContent = data.checksum_error ? 
        `${translations[lang].downloading_model_checksum} (${data.model_name}, ${data.downloaded_mb}MB of ${data.model_size}MB, ${data.speed_mb_s}MB/s)` :
        `${translations[lang].downloading_model} (${data.model_name}, ${data.downloaded_mb}MB of ${data.model_size}MB, ${data.speed_mb_s}MB/s)`;
});
socket.on('model_download_complete', function (data) {
    console.log('Received model_download_complete:', data);
    const modelDownloadContainer = document.getElementById('modelDownloadContainer');
    const whisperProgressContainer = document.getElementById('whisperProgressContainer');
    const whisperProgressBar = document.getElementById('whisperProgressBar');
    const whisperProgressText = document.getElementById('whisperProgressText');
    const result = document.getElementById('result');
    const lang = document.documentElement.lang;
    setTimeout(() => {
        modelDownloadContainer.classList.add('d-none');
        whisperProgressContainer.classList.remove('d-none');
        whisperProgressBar.style.width = '0%';
        whisperProgressText.textContent = translations[lang].generating.replace('(0%)', '(0%)');
    }, 100);
    setTimeout(() => {
        if (!whisperProgressContainer.classList.contains('d-none') && 
            parseInt(whisperProgressBar.style.width) === 0) {
            modelDownloadContainer.classList.add('d-none');
            whisperProgressContainer.classList.add('d-none');
            result.innerHTML = `<p class="text-danger">${translations[lang].processing_timeout}</p>`;
            document.querySelector('#uploadForm button[type="submit"]').disabled = false;
        }
    }, 5000);
});
socket.on('model_download_error', function (data) {
    console.log('Received model_download_error:', data);
    const modelDownloadContainer = document.getElementById('modelDownloadContainer');
    const result = document.getElementById('result');
    const submitButton = document.querySelector('#uploadForm button[type="submit"]');
    const lang = document.documentElement.lang;
    modelDownloadContainer.classList.add('d-none');
    result.innerHTML = `<p class="text-danger">${translations[lang].error}: ${data.error}</p>`;
    submitButton.disabled = false;
});
socket.on('model_download_timeout', function (data) {
    console.log('Received model_download_timeout:', data);
    const modelDownloadContainer = document.getElementById('modelDownloadContainer');
    const result = document.getElementById('result');
    const submitButton = document.querySelector('#uploadForm button[type="submit"]');
    const lang = document.documentElement.lang;
    modelDownloadContainer.classList.add('d-none');
    result.innerHTML = `<p class="text-danger">${translations[lang].download_timeout}</p>`;
    submitButton.disabled = false;
});
socket.on('whisper_progress', function (data) {
    console.log('Received whisper_progress:', data);
    const progress = data.progress;
    const lang = document.documentElement.lang;
    const whisperProgressContainer = document.getElementById('whisperProgressContainer');
    const whisperProgressBar = document.getElementById('whisperProgressBar');
    const whisperProgressText = document.getElementById('whisperProgressText');
    if (whisperProgressContainer.classList.contains('d-none')) {
        console.log('Showing whisperProgressContainer');
        whisperProgressContainer.classList.remove('d-none');
    }
    whisperProgressBar.style.width = `${progress}%`;
    whisperProgressBar.setAttribute('aria-valuenow', progress);
    whisperProgressText.textContent = translations[lang].generating.replace('(0%)', `(${progress}%)`);
});
socket.on('whisper_complete', function (data) {
    console.log('Received whisper_complete:', data);
    const srtFile = data.srt_file.replace(/\\/g, '/');
    const lang = document.documentElement.lang;
    document.getElementById('whisperProgressContainer').classList.add('d-none');
    document.getElementById('result').innerHTML = `
        <p class="text-success">
            ${translations[lang].generated_message}
            <a href="/download/${encodeURIComponent(srtFile)}" download><i class="fas fa-download me-2"></i> ${translations[lang].download}</a>
            <a href="#" onclick="previewSrt('${srtFile}')" class="ms-2"><i class="fas fa-eye me-2"></i> ${translations[lang].preview}</a>
        </p>`;
    document.getElementById('translateTab').style.display = 'inline-block';
    document.getElementById('srtFile').value = srtFile;
    document.querySelector('#uploadForm button[type="submit"]').disabled = false;
});
socket.on('whisper_error', function (data) {
    console.log('Received whisper_error:', data);
    const lang = document.documentElement.lang;
    document.getElementById('whisperProgressContainer').classList.add('d-none');
    document.getElementById('result').innerHTML = `<p class="text-danger">${translations[lang].error}: ${data.error}</p>`;
    document.querySelector('#uploadForm button[type="submit"]').disabled = false;
});
socket.on('translate_progress', function (data) {
    console.log('Received translate_progress:', data);
    const progress = data.progress;
    const lang = document.documentElement.lang;
    document.getElementById('translateProgressBar').style.width = `${progress}%`;
    document.getElementById('translateProgressBar').setAttribute('aria-valuenow', progress);
    document.getElementById('translateProgressText').textContent = translations[lang].translating.replace('(0%)', `(${progress}%)`);
});
socket.on('translate_complete', function (data) {
    console.log('Received translate_complete:', data);
    const translatedFile = data.translated_file.replace(/\\/g, '/');
    const lang = document.documentElement.lang;
    document.getElementById('translateProgressContainer').classList.add('d-none');
    const result = document.getElementById('result');
    result.innerHTML += `
        <p class="text-success">
            ${translations[lang].translated_message}
            <a href="/download/${encodeURIComponent(translatedFile)}" download><i class="fas fa-download me-2"></i> ${translations[lang].download}</a>
            <a href="#" onclick="previewSrt('${translatedFile}')" class="ms-2"><i class="fas fa-eye me-2"></i> ${translations[lang].preview}</a>
        </p>`;
    document.querySelector('#translateForm button[type="submit"]').disabled = false;
});
socket.on('translate_error', function (data) {
    console.log('Received translate_error:', data);
    const lang = document.documentElement.lang;
    document.getElementById('translateProgressContainer').classList.add('d-none');
    document.getElementById('result').innerHTML = `<p class="text-danger">${translations[lang].error}: ${data.error}</p>`;
    document.querySelector('#translateForm button[type="submit"]').disabled = false;
});
async function previewSrt(filePath) {
    try {
        const response = await fetch(`/download/${encodeURIComponent(filePath)}`);
        const text = await response.text();
        document.getElementById('srtPreview').textContent = text;
        const modal = new bootstrap.Modal(document.getElementById('previewModal'));
        modal.show();
    } catch (error) {
        console.error('Error in preview:', error);
        const lang = document.documentElement.lang;
        document.getElementById('result').innerHTML = `<p class="text-danger">${translations[lang].error}: ${error.message}</p>`;
    }
}
function initLanguage() {
    const savedLang = localStorage.getItem('selectedLanguage') || 'en';
    switchLanguage(savedLang);
}
initLanguage();