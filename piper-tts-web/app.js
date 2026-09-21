let session = null;
let modelConfig = null;

// DOM Elements
const statusBadge = document.getElementById('status-badge');
const statusText = document.getElementById('status-text');
const speakerSelect = document.getElementById('speaker-select');
const speakerCountInfo = document.getElementById('speaker-count-info');
const lengthScaleSlider = document.getElementById('length-scale-slider');
const lengthScaleVal = document.getElementById('length-scale-val');
const noiseScaleSlider = document.getElementById('noise-scale-slider');
const noiseScaleVal = document.getElementById('noise-scale-val');

const textInput = document.getElementById('text-input');
const charCount = document.getElementById('char-count');
const speakBtn = document.getElementById('speak-btn');
const audioPlayer = document.getElementById('audio-player');
const logContainer = document.getElementById('log-container');

// Log Helper
function log(msg, type = 'info') {
  const time = new Date().toLocaleTimeString();
  const color = type === 'error' ? 'text-red-400' : (type === 'warn' ? 'text-amber-400' : 'text-emerald-400');
  logContainer.innerHTML += `<div class="${color}">[${time}] ${msg}</div>`;
  logContainer.scrollTop = logContainer.scrollHeight;
}

// 1. Khởi tạo mô hình ONNX và JSON Config
async function initTTS() {
  try {
    log("Đang tải file cấu hình model/voice.onnx.json...");
    const configRes = await fetch('./model/voice.onnx.json');
    if (!configRes.ok) throw new Error("Không thể tải file model/voice.onnx.json!");
    
    modelConfig = await configRes.json();
    log("Đã tải cấu hình JSON thành công.");

    // Cập nhật Metadata
    if (modelConfig.audio?.sample_rate) {
      document.getElementById('meta-samplerate').innerText = `${modelConfig.audio.sample_rate.toLocaleString()} Hz`;
    }
    if (modelConfig.phoneme_id_map) {
      document.getElementById('meta-phonemes').innerText = `${Object.keys(modelConfig.phoneme_id_map).length} tokens`;
    }

    // Xử lý Danh sách Giọng đọc (Multi-speaker Detection)
    setupSpeakerSelect(modelConfig);

    log("Đang nạp file ONNX model/voice.onnx (Vui lòng chờ giây lát)...");
    session = await ort.InferenceSession.create('./model/voice.onnx');
    log("Nạp thành công mô hình ONNX!");

    // Cập nhật trạng thái UI
    statusBadge.className = "px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-2";
    statusText.innerText = "Sẵn sàng phát âm";
    speakBtn.disabled = false;
  } catch (err) {
    log(`LỖI KHỞI TẠO: ${err.message}`, 'error');
    statusBadge.className = "px-3 py-1 rounded-full text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20 flex items-center gap-2";
    statusText.innerText = "Lỗi nạp mô hình";
  }
}

// 2. Thiết lập Dropdown Giọng đọc
function setupSpeakerSelect(config) {
  speakerSelect.innerHTML = '';
  
  const numSpeakers = config.num_speakers || 1;
  const speakerMap = config.speaker_id_map || {};

  if (numSpeakers > 1) {
    speakerCountInfo.innerText = `Mô hình phát hiện ${numSpeakers} giọng đọc khác nhau.`;
    speakerSelect.disabled = false;

    if (Object.keys(speakerMap).length > 0) {
      for (const [name, id] of Object.entries(speakerMap)) {
        const option = document.createElement('option');
        option.value = id;
        option.innerText = `Giọng: ${name} (ID: ${id})`;
        speakerSelect.appendChild(option);
      }
    } else {
      for (let i = 0; i < numSpeakers; i++) {
        const option = document.createElement('option');
        option.value = i;
        option.innerText = `Giọng đọc số ${i + 1} (Speaker ID: ${i})`;
        speakerSelect.appendChild(option);
      }
    }
    log(`Đã nạp ${numSpeakers} giọng đọc vào lựa chọn.`);
  } else {
    speakerCountInfo.innerText = "Mô hình này là đơn giọng (Single-Speaker).";
    const option = document.createElement('option');
    option.value = "0";
    option.innerText = "Giọng mặc định (Default)";
    speakerSelect.appendChild(option);
    speakerSelect.disabled = true;
  }
}

// 3. Chuyển đổi Văn bản sang Phoneme IDs
function textToPhonemeIds(text, config) {
  const idMap = config.phoneme_id_map;
  if (!idMap) return [];

  const ids = [];
  const normalizedText = text.normalize('NFC').toLowerCase();

  // BOS (Beginning Of Sentence)
  if (idMap["^"]) ids.push(...idMap["^"]);

  for (const char of normalizedText) {
    if (idMap[char]) {
      ids.push(...idMap[char]);
      if (idMap["_"]) ids.push(...idMap["_"]); // Pad token
    } else if (idMap[" "]) {
      ids.push(...idMap[" "]);
    }
  }

  // EOS (End Of Sentence)
  if (idMap["$"]) ids.push(...idMap["$"]);

  return ids;
}

// 4. Chuyển PCM Float32 sang WAV Blob
function pcmToWav(pcmData, sampleRate = 22050) {
  const buffer = new ArrayBuffer(44 + pcmData.length * 2);
  const view = new DataView(buffer);

  const writeString = (offset, string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  };

  writeString(0, 'RIFF');
  view.setUint32(4, 36 + pcmData.length * 2, true);
  writeString(8, 'WAVE');
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true); 
  view.setUint16(22, 1, true); 
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeString(36, 'data');
  view.setUint32(40, pcmData.length * 2, true);

  let offset = 44;
  for (let i = 0; i < pcmData.length; i++, offset += 2) {
    const s = Math.max(-1, Math.min(1, pcmData[i]));
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
  }

  return new Blob([view], { type: 'audio/wav' });
}

// Event Listeners cho Sliders & Input
lengthScaleSlider.addEventListener('input', (e) => {
  lengthScaleVal.innerText = `${e.target.value}x`;
});

noiseScaleSlider.addEventListener('input', (e) => {
  noiseScaleVal.innerText = e.target.value;
});

textInput.addEventListener('input', () => {
  const text = textInput.value;
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  charCount.innerText = `${text.length} ký tự | ${words} từ`;
});

document.getElementById('btn-clear').addEventListener('click', () => {
  textInput.value = '';
  charCount.innerText = '0 ký tự | 0 từ';
});

document.getElementById('btn-sample').addEventListener('click', () => {
  textInput.value = "Xin chào, đây là hệ thống chuyển đổi văn bản thành giọng nói Piper TTS chạy trực tiếp trên trình duyệt web.";
  textInput.dispatchEvent(new Event('input'));
});

document.getElementById('btn-clear-log').addEventListener('click', () => {
  logContainer.innerHTML = '';
});

// 5. Thực thi Tạo Giọng Đọc
speakBtn.addEventListener('click', async () => {
  const text = textInput.value.trim();
  if (!text || !session || !modelConfig) return;

  try {
    speakBtn.disabled = true;
    log(`Bắt đầu xử lý: "${text}"`);

    const phonemeIds = textToPhonemeIds(text, modelConfig);
    if (phonemeIds.length === 0) {
      throw new Error("Không chuyển đổi được văn bản sang mảng ID!");
    }

    const inputSequence = new BigInt64Array(phonemeIds.map(id => BigInt(id)));
    const tensorInput = new ort.Tensor('int64', inputSequence, [1, inputSequence.length]);

    // Đọc thông số từ UI Sliders
    const lengthScale = parseFloat(lengthScaleSlider.value);
    const noiseScale = parseFloat(noiseScaleSlider.value);

    // Chuẩn bị Feeds cho ONNX
    const feeds = {
      input: tensorInput,
      input_lengths: new ort.Tensor('int64', BigInt64Array.from([BigInt(inputSequence.length)]), [1]),
      scales: new ort.Tensor('float32', Float32Array.from([noiseScale, lengthScale, 0.8]), [3])
    };

    // Nếu mô hình hỗ trợ nhiều giọng đọc -> Truyền thêm Tensor `sid`
    if (modelConfig.num_speakers && modelConfig.num_speakers > 1) {
      const selectedSpeakerId = parseInt(speakerSelect.value) || 0;
      feeds.sid = new ort.Tensor('int64', BigInt64Array.from([BigInt(selectedSpeakerId)]), [1]);
      log(`Sử dụng Speaker ID: ${selectedSpeakerId}`);
    }

    const startTime = performance.now();
    const results = await session.run(feeds);
    const duration = (performance.now() - startTime).toFixed(0);

    log(`Suy luận hoàn tất trong ${duration}ms`);

    const audioData = results.output.data;
    const sampleRate = modelConfig.audio?.sample_rate || 22050;
    const wavBlob = pcmToWav(audioData, sampleRate);

    audioPlayer.src = URL.createObjectURL(wavBlob);
    audioPlayer.play();
  } catch (err) {
    log(`LỖI TỔNG HỢP: ${err.message}`, 'error');
  } finally {
    speakBtn.disabled = false;
  }
});

// Chạy ứng dụng khi tải trang xong
window.addEventListener('DOMContentLoaded', initTTS);