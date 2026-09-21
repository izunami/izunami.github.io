let session = null;
let modelConfig = null;

// Danh sách các tên file cấu hình JSON phổ biến để hệ thống tự động thử dò trong thư mục ./model/
const POSSIBLE_JSON_PATHS = [
  './model/voice.onnx.json',
  './model/model.onnx.json',
  './model/config.json',
  './model/vi_VN.onnx.json'
];

// DOM Elements
const statusBadge = document.getElementById('status-badge');
const statusDot = document.getElementById('status-dot');
const statusText = document.getElementById('status-text');

const speakerSelect = document.getElementById('speaker-select');
const speakerInfo = document.getElementById('speaker-info');
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
  let colorClass = 'text-emerald-400';
  if (type === 'error') colorClass = 'text-red-400';
  if (type === 'warn') colorClass = 'text-amber-400';

  logContainer.innerHTML += `<div class="${colorClass}">[${time}] ${msg}</div>`;
  logContainer.scrollTop = logContainer.scrollHeight;
}

// 1. Tự động Dò tìm và Nạp Model từ Thư Mục ./model/
async function autoDetectAndInit() {
  log("Đang quét tìm file cấu hình .json trong thư mục ./model/...");
  
  let detectedJsonPath = null;

  for (const path of POSSIBLE_JSON_PATHS) {
    try {
      const res = await fetch(path, { method: 'HEAD' });
      if (res.ok) {
        detectedJsonPath = path;
        log(`Đã tìm thấy file cấu hình: ${path}`);
        break;
      }
    } catch (e) {
      // Tiếp tục thử tên tiếp theo
    }
  }

  if (!detectedJsonPath) {
    log("Không tìm thấy file JSON mặc định trong thư mục ./model/. Bạn hãy dùng khung 'Nạp File Thủ Công' để chọn file từ máy.", "warn");
    setStatus('warning', 'Chờ nạp file mô hình...');
    return;
  }

  try {
    const configRes = await fetch(detectedJsonPath);
    modelConfig = await configRes.json();
    updateMetadataUI(modelConfig);
    setupSpeakerSelect(modelConfig);

    // Tự suy ra đường dẫn file ONNX (Ví dụ: voice.onnx.json -> voice.onnx)
    const onnxPath = detectedJsonPath.replace('.json', '');
    log(`Đang nạp file ONNX: ${onnxPath} (Vui lòng chờ trong giây lát)...`);

    session = await ort.InferenceSession.create(onnxPath);
    log("Nạp mô hình ONNX thành công!");

    setStatus('success', 'Sẵn sàng hoạt động');
    speakBtn.disabled = false;
  } catch (err) {
    log(`Lỗi khi nạp từ thư mục ./model/: ${err.message}`, "error");
    setStatus('error', 'Lỗi nạp mô hình');
  }
}

// 2. Nạp Mô Hình Trực Tiếp Từ File Chọn Trên Máy
async function loadModelFromFiles(onnxFile, jsonFile) {
  try {
    log(`Bắt đầu đọc file JSON: ${jsonFile.name}...`);
    
    // Sử dụng readAsText chuẩn mã JS (Tránh lỗi reader.readText is not a function)
    const jsonText = await jsonFile.text();
    modelConfig = JSON.parse(jsonText);
    
    updateMetadataUI(modelConfig);
    setupSpeakerSelect(modelConfig);

    log(`Đang nạp file ONNX binary: ${onnxFile.name}...`);
    const onnxArrayBuffer = await onnxFile.arrayBuffer();
    
    session = await ort.InferenceSession.create(onnxArrayBuffer);
    log("Đã nạp xong mô hình thủ công từ máy tính!");

    setStatus('success', 'Sẵn sàng (Model từ máy)');
    speakBtn.disabled = false;
  } catch (err) {
    log(`Lỗi đọc file từ máy: ${err.message}`, "error");
    setStatus('error', 'Lỗi file chọn từ máy');
  }
}

// Cập nhật giao diện Trạng thái
function setStatus(state, text) {
  statusText.innerText = text;
  if (state === 'success') {
    statusBadge.className = "px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-2";
    statusDot.className = "w-2 h-2 rounded-full bg-emerald-400";
  } else if (state === 'warning') {
    statusBadge.className = "px-3 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center gap-2";
    statusDot.className = "w-2 h-2 rounded-full bg-amber-400 animate-pulse";
  } else if (state === 'error') {
    statusBadge.className = "px-3 py-1 rounded-full text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20 flex items-center gap-2";
    statusDot.className = "w-2 h-2 rounded-full bg-red-400";
  }
}

// Cập nhật Thông số Metadata
function updateMetadataUI(config) {
  if (config.audio?.sample_rate) {
    document.getElementById('meta-samplerate').innerText = `${config.audio.sample_rate.toLocaleString()} Hz`;
  }
  if (config.phoneme_id_map) {
    document.getElementById('meta-phonemes').innerText = `${Object.keys(config.phoneme_id_map).length} tokens`;
  }
}

// 3. Xử lý Multi-Speaker Dropdown
function setupSpeakerSelect(config) {
  speakerSelect.innerHTML = '';
  const numSpeakers = config.num_speakers || 1;
  const speakerMap = config.speaker_id_map || {};

  if (numSpeakers > 1) {
    speakerSelect.disabled = false;
    speakerInfo.innerText = `Mô hình chứa ${numSpeakers} giọng đọc.`;

    if (Object.keys(speakerMap).length > 0) {
      for (const [name, id] of Object.entries(speakerMap)) {
        const opt = document.createElement('option');
        opt.value = id;
        opt.innerText = `${name} (ID: ${id})`;
        speakerSelect.appendChild(opt);
      }
    } else {
      for (let i = 0; i < numSpeakers; i++) {
        const opt = document.createElement('option');
        opt.value = i;
        opt.innerText = `Giọng số ${i + 1} (Speaker ID: ${i})`;
        speakerSelect.appendChild(opt);
      }
    }
  } else {
    const opt = document.createElement('option');
    opt.value = "0";
    opt.innerText = "Giọng mặc định (Single Speaker)";
    speakerSelect.appendChild(opt);
    speakerSelect.disabled = true;
    speakerInfo.innerText = "Mô hình đơn giọng.";
  }
}

// 4. Ánh xạ Văn bản Tiếng Việt sang mảng Phoneme IDs
function textToPhonemeIds(text, config) {
  const idMap = config.phoneme_id_map;
  if (!idMap) return [];

  const ids = [];
  const normalizedText = text.normalize('NFC').toLowerCase();

  // Token bắt đầu câu (BOS)
  if (idMap["^"]) ids.push(...idMap["^"]);

  for (const char of normalizedText) {
    if (idMap[char]) {
      ids.push(...idMap[char]);
      if (idMap["_"]) ids.push(...idMap["_"]); // Token đệm PAD
    } else if (idMap[" "]) {
      ids.push(...idMap[" "]);
    }
  }

  // Token kết thúc câu (EOS)
  if (idMap["$"]) ids.push(...idMap["$"]);

  return ids;
}

// 5. Chuyển PCM Float32 sang File WAV Audio Blob
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

// Event Listeners UI
lengthScaleSlider.addEventListener('input', (e) => {
  lengthScaleVal.innerText = `${e.target.value}x`;
});

noiseScaleSlider.addEventListener('input', (e) => {
  noiseScaleVal.innerText = e.target.value;
});

textInput.addEventListener('input', () => {
  const val = textInput.value;
  const words = val.trim() ? val.trim().split(/\s+/).length : 0;
  charCount.innerText = `${val.length} ký tự | ${words} từ`;
});

document.getElementById('btn-clear').addEventListener('click', () => {
  textInput.value = '';
  charCount.innerText = '0 ký tự | 0 từ';
});

document.getElementById('btn-sample').addEventListener('click', () => {
  textInput.value = "Xin chào, đây là ứng dụng Piper TTS chạy trực tiếp trên GitHub Pages.";
  textInput.dispatchEvent(new Event('input'));
});

document.getElementById('btn-clear-log').addEventListener('click', () => {
  logContainer.innerHTML = '';
});

document.getElementById('btn-load-custom').addEventListener('click', () => {
  const jsonFile = document.getElementById('input-json').files[0];
  const onnxFile = document.getElementById('input-onnx').files[0];

  if (!jsonFile || !onnxFile) {
    alert("Vui lòng chọn đầy đủ cả 2 file (.json và .onnx)!");
    return;
  }

  loadModelFromFiles(onnxFile, jsonFile);
});

// 6. Thực thi Tạo Giọng Đọc
speakBtn.addEventListener('click', async () => {
  const text = textInput.value.trim();
  if (!text || !session || !modelConfig) return;

  try {
    speakBtn.disabled = true;
    log(`Đang tổng hợp: "${text}"`);

    const phonemeIds = textToPhonemeIds(text, modelConfig);
    if (phonemeIds.length === 0) {
      throw new Error("Không thể tạo ID âm tiết từ văn bản nhập vào!");
    }

    const inputSequence = new BigInt64Array(phonemeIds.map(id => BigInt(id)));
    const tensorInput = new ort.Tensor('int64', inputSequence, [1, inputSequence.length]);

    const lengthScale = parseFloat(lengthScaleSlider.value);
    const noiseScale = parseFloat(noiseScaleSlider.value);

    const feeds = {
      input: tensorInput,
      input_lengths: new ort.Tensor('int64', BigInt64Array.from([BigInt(inputSequence.length)]), [1]),
      scales: new ort.Tensor('float32', Float32Array.from([noiseScale, lengthScale, 0.8]), [3])
    };

    // Truyền Tensor sid nếu mô hình là Multi-Speaker
    if (modelConfig.num_speakers && modelConfig.num_speakers > 1) {
      const selectedSpeakerId = parseInt(speakerSelect.value) || 0;
      feeds.sid = new ort.Tensor('int64', BigInt64Array.from([BigInt(selectedSpeakerId)]), [1]);
      log(`Chọn Speaker ID: ${selectedSpeakerId}`);
    }

    const startTime = performance.now();
    const results = await session.run(feeds);
    const duration = (performance.now() - startTime).toFixed(0);

    log(`Suy luận ONNX hoàn tất trong ${duration}ms`);

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

// Chạy tự động khi trang tải xong
window.addEventListener('DOMContentLoaded', autoDetectAndInit);
