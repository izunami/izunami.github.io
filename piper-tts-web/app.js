let session = null;
let modelConfig = null;

// Danh sách các tên file cấu hình JSON phổ biến để hệ thống tự dò (Auto-Detect)
const POSSIBLE_JSON_NAMES = [
  './model/voice.onnx.json',
  './model/model.onnx.json',
  './model/config.json',
  './model/vi_VN.onnx.json'
];

// UI Elements
const statusBadge = document.getElementById('status-badge');
const statusText = document.getElementById('status-text');
const speakerSelect = document.getElementById('speaker-select');
const speakBtn = document.getElementById('speak-btn');
const logContainer = document.getElementById('log-container');

function log(msg, type = 'info') {
  const time = new Date().toLocaleTimeString();
  const color = type === 'error' ? 'text-red-400' : (type === 'warn' ? 'text-amber-400' : 'text-emerald-400');
  logContainer.innerHTML += `<div class="${color}">[${time}] ${msg}</div>`;
  logContainer.scrollTop = logContainer.scrollHeight;
}

// 1. Tự động tìm và nạp Model từ thư mục ./model/
async function autoDetectAndInit() {
  log("Đang quét tìm file cấu hình JSON trong thư mục ./model/...");
  
  let jsonUrl = null;
  // Thử lần lượt từng tên file trong danh sách
  for (const path of POSSIBLE_JSON_NAMES) {
    try {
      const res = await fetch(path, { method: 'HEAD' });
      if (res.ok) {
        jsonUrl = path;
        log(`Đã tìm thấy file cấu hình: ${path}`);
        break;
      }
    } catch (e) {
      // Bỏ qua lỗi và thử tiếp file khác
    }
  }

  if (!jsonUrl) {
    log("Không tìm thấy file JSON mặc định trong ./model/. Bạn có thể chọn file thủ công bên dưới.", "warn");
    statusBadge.className = "px-3 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20";
    statusText.innerText = "Chờ nạp file mô hình...";
    return;
  }

  // Nạp JSON
  try {
    const configRes = await fetch(jsonUrl);
    modelConfig = await configRes.json();
    setupSpeakerSelect(modelConfig);

    // Tìm file ONNX tương ứng (ví dụ: voice.onnx.json -> voice.onnx)
    const onnxUrl = jsonUrl.replace('.json', '');
    log(`Đang nạp file mô hình ONNX: ${onnxUrl}...`);

    session = await ort.InferenceSession.create(onnxUrl);
    log("Đã nạp xong mô hình ONNX!");

    statusBadge.className = "px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20";
    statusText.innerText = "Sẵn sàng hoạt động";
    speakBtn.disabled = false;
  } catch (err) {
    log(`Lỗi khi nạp từ thư mục ./model/: ${err.message}`, "error");
  }
}

// 2. Nạp Mô hình Trực tiếp từ File chọn từ máy tính
async function loadModelFromFiles(onnxFile, jsonFile) {
  try {
    log(`Bắt đầu đọc file JSON từ máy: ${jsonFile.name}...`);
    const jsonText = await jsonFile.text();
    modelConfig = JSON.parse(jsonText);
    setupSpeakerSelect(modelConfig);

    log(`Đang nạp file ONNX từ máy: ${onnxFile.name} (Có thể mất vài giây)...`);
    const onnxArrayBuffer = await onnxFile.arrayBuffer();
    session = await ort.InferenceSession.create(onnxArrayBuffer);

    log("Đã nạp xong mô hình từ file chọn thủ công!");
    statusBadge.className = "px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20";
    statusText.innerText = "Sẵn sàng (Model từ máy)";
    speakBtn.disabled = false;
  } catch (err) {
    log(`Lỗi khi đọc file chọn từ máy: ${err.message}`, "error");
  }
}

// 3. Thiết lập Dropdown chọn giọng
function setupSpeakerSelect(config) {
  speakerSelect.innerHTML = '';
  const numSpeakers = config.num_speakers || 1;
  const speakerMap = config.speaker_id_map || {};

  if (numSpeakers > 1) {
    speakerSelect.disabled = false;
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
        opt.innerText = `Giọng số ${i + 1} (ID: ${i})`;
        speakerSelect.appendChild(opt);
      }
    }
  } else {
    const opt = document.createElement('option');
    opt.value = "0";
    opt.innerText = "Giọng mặc định";
    speakerSelect.appendChild(opt);
    speakerSelect.disabled = true;
  }
}

// Chạy tự động khi mở trang
window.addEventListener('DOMContentLoaded', autoDetectAndInit);
