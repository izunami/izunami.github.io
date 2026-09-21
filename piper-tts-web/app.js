// Import piper-phonemize WASM bundle chính thức
import { createPiperPhonemize } from "https://cdn.jsdelivr.net/npm/@gutenye/piper-phonemize-js@0.1.0/dist/piper-phonemize.mjs";

let session = null;
let modelConfig = null;
let currentModelPath = null;
let phonemizerInstance = null;
let isPhonemizerReady = false;

// Danh sách mô hình quét trong thư mục ./model/
const MODEL_LIST = [
  { name: 'Trấn Thành (tranthanh)', path: './model/tranthanh.onnx.json' },
  { name: 'Mỹ Tâm (mytam)', path: './model/mytam.onnx.json' },
  { name: 'Ngọc Ngạn (ngocngan)', path: './model/ngocngan.onnx.json' },
  { name: 'Việt Thảo (vietthao)', path: './model/vietthao.onnx.json' },
  { name: 'Ban Mai (banmai)', path: './model/banmai.onnx.json' },
  { name: 'Mai Phương (maiphuong)', path: './model/maiphuong.onnx.json' },
  { name: 'Mạnh Dũng (manhdung)', path: './model/manhdung.onnx.json' },
  { name: 'Minh Khang (minhkhang)', path: './model/minhkhang.onnx.json' },
  { name: 'Minh Quang (minhquang)', path: './model/minhquang.onnx.json' },
  { name: 'Ngọc Huyền (ngochuyen)', path: './model/ngochuyen.onnx.json' },
  { name: 'Ngọc Huyền Mới (ngochuyennew)', path: './model/ngochuyennew.onnx.json' },
  { name: 'Phương Trang (phuongtrang)', path: './model/phuongtrang.onnx.json' },
  { name: 'Thái An (taian)', path: './model/taian.onnx.json' },
  { name: 'Thanh Phương Viettel (thanhphuongviettel)', path: './model/thanhphuongviettel.onnx.json' },
  { name: 'Thiện Tâm (thientam)', path: './model/thientam.onnx.json' },
  { name: 'Chiêu Thành (chieuthanh)', path: './model/chieuthanh.onnx.json' },
  { name: 'Cúc (cuc)', path: './model/cuc.onnx.json' },
  { name: 'Lạc Phi (lacphi)', path: './model/lacphi.onnx.json' },
  { name: 'Calm Woman (calmwoman3688)', path: './model/calmwoman3688.onnx.json' },
  { name: 'Deep Man (deepman3909)', path: './model/deepman3909.onnx.json' },
  { name: 'Duy Oryx (duyoryx3175)', path: './model/duyoryx3175.onnx.json' },
  { name: 'VAIS 1000 Medium (vi_VN-vais1000-medium)', path: './model/vi_VN-vais1000-medium.onnx.json' }
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

function setStatus(state, text) {
  if (!statusText || !statusBadge) return;
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

// 1. Khởi tạo WASM Phonemizer & Ép Emscripten nạp file piper_phonemize.data (~25MB) từ CDN
async function initWasmPhonemizer() {
  try {
    log("Đang tải dữ liệu từ điển eSpeak Tiếng Việt (piper_phonemize.data ~25MB)...");
    log("Lần đầu tiên nạp sẽ mất khoảng 10-20 giây tùy tốc độ mạng, vui lòng chờ...");

    phonemizerInstance = await createPiperPhonemize({
      locateFile: (file) => {
        const cdnUrl = `https://cdn.jsdelivr.net/npm/@gutenye/piper-phonemize-js@0.1.0/dist/${file}`;
        log(`[WASM CDN] Đang nạp tài nguyên: ${file}`);
        return cdnUrl;
      }
    });

    isPhonemizerReady = true;
    log("Đã tải xong 100% bộ từ điển eSpeak-NG Tiếng Việt (piper_phonemize.data)!");
    
    if (speakBtn && session) speakBtn.disabled = false;
  } catch (err) {
    log(`LỖI NẠP TỪ ĐIỂN WASM: ${err.message}`, "error");
    isPhonemizerReady = false;
  }
}

// 2. Nạp danh sách Dropdown
function populateModelDropdown() {
  if (!modelSelect) return;
  modelSelect.innerHTML = '';
  MODEL_LIST.forEach(m => {
    const opt = document.createElement('option');
    opt.value = m.path;
    opt.innerText = m.name;
    modelSelect.appendChild(opt);
  });
  modelSelect.disabled = false;
}

// 3. Nạp Mô hình ONNX từ đường dẫn
async function loadModelFromPath(jsonPath) {
  try {
    if (speakBtn) speakBtn.disabled = true;
    setStatus('warning', 'Đang nạp ONNX Model...');
    log(`Bắt đầu nạp cấu hình: ${jsonPath}...`);

    const configRes = await fetch(jsonPath);
    if (!configRes.ok) throw new Error(`Không tìm thấy file ${jsonPath}`);
    modelConfig = await configRes.json();

    updateMetadataUI(modelConfig);
    setupSpeakerSelect(modelConfig);

    const onnxPath = jsonPath.replace('.json', '');
    log(`Đang nạp trọng số ONNX: ${onnxPath}...`);

    if (session) {
      try { await session.release(); } catch(e) {}
    }

    session = await ort.InferenceSession.create(onnxPath);
    currentModelPath = jsonPath;
    
    log(`Đã nạp xong mô hình [${jsonPath.split('/').pop().replace('.onnx.json', '')}]!`);
    
    if (isPhonemizerReady) {
      setStatus('success', '100% Offline Engine Sẵn Sàng');
      if (speakBtn) speakBtn.disabled = false;
    } else {
      setStatus('warning', 'Đang chờ nạp từ điển Tiếng Việt...');
    }
  } catch (err) {
    log(`LỖI NẠP MODEL: ${err.message}`, "error");
    setStatus('error', 'Lỗi nạp model');
  }
}

// 4. Nạp Mô hình từ File chọn từ Máy tính
async function loadModelFromFiles(onnxFile, jsonFile) {
  try {
    if (speakBtn) speakBtn.disabled = true;
    setStatus('warning', 'Đang đọc file chọn...');
    log(`Đang đọc file JSON từ máy: ${jsonFile.name}...`);

    const jsonText = await jsonFile.text();
    modelConfig = JSON.parse(jsonText);

    updateMetadataUI(modelConfig);
    setupSpeakerSelect(modelConfig);

    log(`Đang nạp binary ONNX: ${onnxFile.name}...`);
    const onnxArrayBuffer = await onnxFile.arrayBuffer();

    if (session) {
      try { await session.release(); } catch(e) {}
    }

    session = await ort.InferenceSession.create(onnxArrayBuffer);
    log("Nạp mô hình từ máy tính thành công!");

    setStatus('success', 'Model từ máy (Sẵn sàng)');
    if (speakBtn && isPhonemizerReady) speakBtn.disabled = false;
  } catch (err) {
    log(`Lỗi nạp file: ${err.message}`, "error");
    setStatus('error', 'Lỗi file');
  }
}

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

function setupSpeakerSelect(config) {
  if (!speakerSelect) return;
  speakerSelect.innerHTML = '';
  const numSpeakers = config.num_speakers || 1;
  const speakerMap = config.speaker_id_map || {};

  if (numSpeakers > 1) {
    speakerSelect.disabled = false;
    if (speakerInfo) speakerInfo.innerText = `Mô hình chứa ${numSpeakers} giọng đọc.`;

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
    opt.innerText = "Giọng mặc định";
    speakerSelect.appendChild(opt);
    speakerSelect.disabled = true;
    if (speakerInfo) speakerInfo.innerText = "Mô hình đơn giọng.";
  }
}

// 5. CHUYỂN ĐỔI CHỮ TIẾNG VIỆT SANG PHONEME IDs DÙNG WASM PIPER PHONEMIZE
async function textToPhonemeIds(text, config) {
  const idMap = config.phoneme_id_map;
  if (!idMap) return [];

  if (!isPhonemizerReady || !phonemizerInstance) {
    throw new Error("Bộ từ điển eSpeak WASM chưa tải xong! Vui lòng chờ vài giây rồi thử lại.");
  }

  let phonemesArray = [];

  try {
    // Dịch chữ "Xin chào" -> Mảng âm tiết IPA chuẩn eSpeak "vi_VN"
    const res = phonemizerInstance.phonemize(text, "vi_VN");
    
    if (res && res.length > 0) {
      const phonemesStr = Array.isArray(res[0]) ? res[0].join("") : res[0];
      // Dùng Array.from để bảo toàn ký tự Unicode IPA ghép (như ː, ʔ, ɓ, ɗ...)
      phonemesArray = Array.from(phonemesStr);
    }
    
    log(`Âm tiết IPA thu được: "${phonemesArray.join("")}"`);
  } catch (e) {
    throw new Error(`Lỗi phiên âm WASM: ${e.message}`);
  }

  const ids = [];

  // Token BOS ^
  if (idMap["^"]) ids.push(...idMap["^"]);

  // Tra từng ký tự IPA vào phoneme_id_map của Piper
  for (const char of phonemesArray) {
    if (idMap[char]) {
      ids.push(...idMap[char]);
      if (idMap["_"]) ids.push(...idMap["_"]); // Token đệm PAD
    } else if (idMap[" "]) {
      ids.push(...idMap[" "]);
    }
  }

  // Token EOS $
  if (idMap["$"]) ids.push(...idMap["$"]);

  return ids;
}

// 6. PCM Float32 sang WAV Audio Blob
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

// Event Listeners
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
      textInput.value = "Xin chào, đây là ứng dụng Piper TTS chạy hoàn toàn bằng WebAssembly trực tiếp trên trình duyệt.";
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

// 7. Thực thi Tạo Giọng Đọc
if (speakBtn) {
  speakBtn.addEventListener('click', async () => {
    const text = textInput ? textInput.value.trim() : '';
    if (!text || !session || !modelConfig) return;

    try {
      speakBtn.disabled = true;
      log(`Đang xử lý câu: "${text}"...`);

      const phonemeIds = await textToPhonemeIds(text, modelConfig);
      if (phonemeIds.length === 0) {
        throw new Error("Không thể tạo ID âm tiết từ văn bản nhập vào!");
      }

      log(`Mảng Phoneme IDs chuẩn được tạo (Độ dài: ${phonemeIds.length})`);

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

      log(`Suy luận ONNX hoàn tất trong ${duration}ms!`);

      const audioData = results.output.data;
      const sampleRate = modelConfig.audio?.sample_rate || 22050;
      const wavBlob = pcmToWav(audioData, sampleRate);

      if (audioPlayer) {
        audioPlayer.src = URL.createObjectURL(wavBlob);
        audioPlayer.play();
      }
    } catch (err) {
      log(`LỖI TẠO GIỌNG ĐỌC: ${err.message}`, 'error');
    } finally {
      speakBtn.disabled = false;
    }
  });
}

// Khởi tạo khi load trang
window.addEventListener('DOMContentLoaded', async () => {
  populateModelDropdown();
  initWasmPhonemizer(); // Nạp song song từ điển eSpeak WASM
  if (MODEL_LIST.length > 0) {
    await loadModelFromPath(MODEL_LIST[0].path);
  }
});
