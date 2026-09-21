let session = null;
let modelConfig = null;
let currentModelPath = null;

// 1. Danh sách tất cả các mô hình có trong thư mục ./model/
const MODEL_LIST = [
  { name: 'Bàn Mai (banmai)', path: './model/banmai.onnx.json' },
  { name: 'Calm Woman (calmwoman3688)', path: './model/calmwoman3688.onnx.json' },
  { name: 'Chiêu Thành (chieuthanh)', path: './model/chieuthanh.onnx.json' },
  { name: 'Cúc (cuc)', path: './model/cuc.onnx.json' },
  { name: 'Deep Man (deepman3909)', path: './model/deepman3909.onnx.json' },
  { name: 'Duy Oryx (duyoryx3175)', path: './model/duyoryx3175.onnx.json' },
  { name: 'Lạc Phi (lacphi)', path: './model/lacphi.onnx.json' },
  { name: 'Mai Phương (maiphuong)', path: './model/maiphuong.onnx.json' },
  { name: 'Mạnh Dũng (manhdung)', path: './model/manhdung.onnx.json' },
  { name: 'Minh Khang (minhkhang)', path: './model/minhkhang.onnx.json' },
  { name: 'Minh Quang (minhquang)', path: './model/minhquang.onnx.json' },
  { name: 'Mỹ Tâm (mytam)', path: './model/mytam.onnx.json' },
  { name: 'Ngọc Huyền (ngochuyen)', path: './model/ngochuyen.onnx.json' },
  { name: 'Ngọc Huyền Mới (ngochuyennew)', path: './model/ngochuyennew.onnx.json' },
  { name: 'Ngọc Ngạn (ngocngan)', path: './model/ngocngan.onnx.json' },
  { name: 'Phương Trang (phuongtrang)', path: './model/phuongtrang.onnx.json' },
  { name: 'Thái An (taian)', path: './model/taian.onnx.json' },
  { name: 'Thanh Phương Viettel (thanhphuongviettel)', path: './model/thanhphuongviettel.onnx.json' },
  { name: 'Thiện Tâm (thientam)', path: './model/thientam.onnx.json' },
  { name: 'Trấn Thành (tranthanh)', path: './model/tranthanh.onnx.json' },
  { name: 'VAIS 1000 Medium (vi_VN)', path: './model/vi_VN-vais1000-medium.onnx.json' },
  { name: 'Việt Thảo (vietthao)', path: './model/vietthao.onnx.json' }
];

// UI Elements
const statusBadge = document.getElementById('status-badge');
const statusDot = document.getElementById('status-dot');
const statusText = document.getElementById('status-text');

const modelSelect = document.getElementById('model-select');
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

// Hàm xuất log
function log(msg, type = 'info') {
  const time = new Date().toLocaleTimeString();
  let colorClass = 'text-emerald-400';
  if (type === 'error') colorClass = 'text-red-400';
  if (type === 'warn') colorClass = 'text-amber-400';

  if (logContainer) {
    logContainer.innerHTML += `<div class="${colorClass}">[${time}] ${msg}</div>`;
    logContainer.scrollTop = logContainer.scrollHeight;
  }
}

// Cập nhật thẻ trạng thái
function setStatus(state, text) {
  if (!statusText) return;
  statusText.innerText = text;
  if (state === 'success') {
    statusBadge.className = "px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-2";
    if (statusDot) statusDot.className = "w-2 h-2 rounded-full bg-emerald-400";
  } else if (state === 'warning') {
    statusBadge.className = "px-3 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center gap-2";
    if (statusDot) statusDot.className = "w-2 h-2 rounded-full bg-amber-400 animate-pulse";
  } else if (state === 'error') {
    statusBadge.className = "px-3 py-1 rounded-full text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20 flex items-center gap-2";
    if (statusDot) statusDot.className = "w-2 h-2 rounded-full bg-red-400";
  }
}

// 2. Tải danh sách Model vào Menu Chọn ngay lập tức
function populateModelDropdown() {
  if (!modelSelect) return;

  modelSelect.innerHTML = '';
  MODEL_LIST.forEach(m => {
    const opt = document.createElement('option');
    opt.value = m.path;
    opt.innerText = m.name;
    modelSelect.appendChild(opt);
  });

  // Mở khóa menu chọn mô hình ngay lập tức để người dùng bấm chọn được
  modelSelect.disabled = false;
  log("Đã kích hoạt danh sách chọn mô hình.");
}

// 3. Hàm Nạp Mô Hình cụ thể
async function loadModelFromPath(jsonPath) {
  try {
    if (speakBtn) speakBtn.disabled = true;
    setStatus('warning', 'Đang nạp ONNX Model...');
    log(`Bắt đầu nạp file cấu hình: ${jsonPath}...`);

    const configRes = await fetch(jsonPath);
    if (!configRes.ok) {
      throw new Error(`Không tìm thấy file ${jsonPath}. Kiểm tra lại thư mục ./model/`);
    }
    modelConfig = await configRes.json();

    updateMetadataUI(modelConfig);
    setupSpeakerSelect(modelConfig);

    const onnxPath = jsonPath.replace('.json', '');
    log(`Đang nạp file mô hình ONNX: ${onnxPath}...`);

    if (session) {
      try { await session.release(); } catch(e) {}
    }

    session = await ort.InferenceSession.create(onnxPath);
    currentModelPath = jsonPath;
    
    log(`Nạp thành công mô hình [${jsonPath.split('/').pop().replace('.onnx.json', '')}]!`);
    setStatus('success', 'Sẵn sàng phát âm');
    if (speakBtn) speakBtn.disabled = false;
  } catch (err) {
    log(`LỖI: ${err.message}`, "error");
    setStatus('error', 'Không nạp được model');
  }
}

// 4. Nạp Mô Hình Trực Tiếp từ File Chọn Trên Máy
async function loadModelFromFiles(onnxFile, jsonFile) {
  try {
    if (speakBtn) speakBtn.disabled = true;
    setStatus('warning', 'Đang đọc file từ máy...');
    log(`Đang đọc file JSON từ máy: ${jsonFile.name}...`);

    const jsonText = await jsonFile.text();
    modelConfig = JSON.parse(jsonText);

    updateMetadataUI(modelConfig);
    setupSpeakerSelect(modelConfig);

    log(`Đang nạp file ONNX binary: ${onnxFile.name}...`);
    const onnxArrayBuffer = await onnxFile.arrayBuffer();

    if (session) {
      try { await session.release(); } catch(e) {}
    }

    session = await ort.InferenceSession.create(onnxArrayBuffer);
    log("Đã nạp thành công mô hình thủ công từ máy tính!");

    setStatus('success', 'Sẵn sàng (Model từ máy)');
    if (speakBtn) speakBtn.disabled = false;
  } catch (err) {
    log(`Lỗi nạp file từ máy: ${err.message}`, "error");
    setStatus('error', 'Lỗi file từ máy');
  }
}

// Cập nhật Thông số Metadata
function updateMetadataUI(config) {
  const sampleRateEl = document.getElementById('meta-samplerate');
  const phonemesEl = document.getElementById('meta-phonemes');

  if (sampleRateEl && config.audio?.sample_rate) {
    sampleRateEl.innerText = `${config.audio.sample_rate.toLocaleString()} Hz`;
  }
  if (phonemesEl && config.phoneme_id_map) {
    phonemesEl.innerText = `${Object.keys(config.phoneme_id_map).length} tokens`;
  }
}

// 5. Cấu hình Dropdown Chọn Giọng Đọc (Multi-Speaker Support)
function setupSpeakerSelect(config) {
  if (!speakerSelect) return;

  speakerSelect.innerHTML = '';
  const numSpeakers = config.num_speakers || 1;
  const speakerMap = config.speaker_id_map || {};

  if (numSpeakers > 1) {
    speakerSelect.disabled = false;
    if (speakerInfo) speakerInfo.innerText = `Mô hình này chứa ${numSpeakers} giọng đọc khác nhau.`;

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
        opt.innerText = `Giọng đọc số ${i + 1} (ID: ${i})`;
        speakerSelect.appendChild(opt);
      }
    }
  } else {
    const opt = document.createElement('option');
    opt.value = "0";
    opt.innerText = "Giọng mặc định (Mô hình đơn giọng)";
    speakerSelect.appendChild(opt);
    speakerSelect.disabled = true; // Khóa lại vì mô hình chỉ có 1 giọng
    if (speakerInfo) speakerInfo.innerText = "Mô hình này là đơn giọng (Single Speaker).";
  }
}

// 6. Ánh xạ Chuỗi Tiếng Việt sang Mảng Phoneme IDs
function textToPhonemeIds(text, config) {
  const idMap = config.phoneme_id_map;
  if (!idMap) return [];

  const ids = [];
  const normalizedText = text.normalize('NFC').toLowerCase();

  if (idMap["^"]) ids.push(...idMap["^"]);

  for (const char of normalizedText) {
    if (idMap[char]) {
      ids.push(...idMap[char]);
      if (idMap["_"]) ids.push(...idMap["_"]);
    } else if (idMap[" "]) {
      ids.push(...idMap[" "]);
    }
  }

  if (idMap["$"]) ids.push(...idMap["$"]);

  return ids;
}

// 7. Chuyển PCM Float32 sang File WAV Blob
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

// Lắng nghe sự kiện người dùng chọn Model từ Menu
if (modelSelect) {
  modelSelect.addEventListener('change', async (e) => {
    const selectedPath = e.target.value;
    if (selectedPath && selectedPath !== currentModelPath) {
      await loadModelFromPath(selectedPath);
    }
  });
}

if (lengthScaleSlider) {
  lengthScaleSlider.addEventListener('input', (e) => {
    if (lengthScaleVal) lengthScaleVal.innerText = `${e.target.value}x`;
  });
}

if (noiseScaleSlider) {
  noiseScaleSlider.addEventListener('input', (e) => {
    if (noiseScaleVal) noiseScaleVal.innerText = e.target.value;
  });
}

if (textInput) {
  textInput.addEventListener('input', () => {
    const val = textInput.value;
    const words = val.trim() ? val.trim().split(/\s+/).length : 0;
    if (charCount) charCount.innerText = `${val.length} ký tự | ${words} từ`;
  });
}

const btnClear = document.getElementById('btn-clear');
if (btnClear) {
  btnClear.addEventListener('click', () => {
    if (textInput) textInput.value = '';
    if (charCount) charCount.innerText = '0 ký tự | 0 từ';
  });
}

const btnSample = document.getElementById('btn-sample');
if (btnSample) {
  btnSample.addEventListener('click', () => {
    if (textInput) {
      textInput.value = "Xin chào, đây là ứng dụng Piper TTS chạy trực tiếp trên trình duyệt.";
      textInput.dispatchEvent(new Event('input'));
    }
  });
}

const btnClearLog = document.getElementById('btn-clear-log');
if (btnClearLog) {
  btnClearLog.addEventListener('click', () => {
    if (logContainer) logContainer.innerHTML = '';
  });
}

const btnLoadCustom = document.getElementById('btn-load-custom');
if (btnLoadCustom) {
  btnLoadCustom.addEventListener('click', () => {
    const jsonFile = document.getElementById('input-json')?.files[0];
    const onnxFile = document.getElementById('input-onnx')?.files[0];

    if (!jsonFile || !onnxFile) {
      alert("Vui lòng chọn đầy đủ cả 2 file (.json và .onnx)!");
      return;
    }

    loadModelFromFiles(onnxFile, jsonFile);
  });
}

// 8. Thực thi Tạo Giọng Đọc
if (speakBtn) {
  speakBtn.addEventListener('click', async () => {
    const text = textInput ? textInput.value.trim() : '';
    if (!text || !session || !modelConfig) return;

    try {
      speakBtn.disabled = true;
      log(`Đang xử lý đọc câu: "${text}"`);

      const phonemeIds = textToPhonemeIds(text, modelConfig);
      if (phonemeIds.length === 0) {
        throw new Error("Không thể tạo ID âm tiết từ văn bản nhập vào!");
      }

      const inputSequence = new BigInt64Array(phonemeIds.map(id => BigInt(id)));
      const tensorInput = new ort.Tensor('int64', inputSequence, [1, inputSequence.length]);

      const lengthScale = lengthScaleSlider ? parseFloat(lengthScaleSlider.value) : 1.0;
      const noiseScale = noiseScaleSlider ? parseFloat(noiseScaleSlider.value) : 0.667;

      const feeds = {
        input: tensorInput,
        input_lengths: new ort.Tensor('int64', BigInt64Array.from([BigInt(inputSequence.length)]), [1]),
        scales: new ort.Tensor('float32', Float32Array.from([noiseScale, lengthScale, 0.8]), [3])
      };

      if (modelConfig.num_speakers && modelConfig.num_speakers > 1 && speakerSelect) {
        const selectedSpeakerId = parseInt(speakerSelect.value) || 0;
        feeds.sid = new ort.Tensor('int64', BigInt64Array.from([BigInt(selectedSpeakerId)]), [1]);
      }

      const startTime = performance.now();
      const results = await session.run(feeds);
      const duration = (performance.now() - startTime).toFixed(0);

      log(`Suy luận ONNX hoàn tất trong ${duration}ms`);

      const audioData = results.output.data;
      const sampleRate = modelConfig.audio?.sample_rate || 22050;
      const wavBlob = pcmToWav(audioData, sampleRate);

      if (audioPlayer) {
        audioPlayer.src = URL.createObjectURL(wavBlob);
        audioPlayer.play();
      }
    } catch (err) {
      log(`LỖI TỔNG HỢP: ${err.message}`, 'error');
    } finally {
      speakBtn.disabled = false;
    }
  });
}

// Khởi tạo ngay khi load xong trang
window.addEventListener('DOMContentLoaded', async () => {
  populateModelDropdown();
  // Nạp mặc định model đầu tiên
  if (MODEL_LIST.length > 0) {
    await loadModelFromPath(MODEL_LIST[0].path);
  }
});
