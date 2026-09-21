// ⚠️ LƯU Ý QUAN TRỌNG: Thay đường link bên dưới bằng link Web Service thật trên Render của bạn!
// (Giữ lại đoạn "/tts" ở cuối)
const RENDER_API_URL = "https://piper-tts-53tr.onrender.com/tts";

// Danh sách các mô hình giọng đọc để hiển thị trên Dropdown
const MODEL_LIST = [
  { name: 'Trấn Thành (tranthanh)', value: 'tranthanh' },
  { name: 'Mỹ Tâm (mytam)', value: 'mytam' },
  { name: 'Ngọc Ngạn (ngocngan)', value: 'ngocngan' },
  { name: 'Việt Thảo (vietthao)', value: 'vietthao' },
  { name: 'Bàn Mai (banmai)', value: 'banmai' },
  { name: 'Mai Phương (maiphuong)', value: 'maiphuong' },
  { name: 'Mạnh Dũng (manhdung)', value: 'manhdung' },
  { name: 'Minh Khang (minhkhang)', value: 'minhkhang' },
  { name: 'Minh Quang (minhquang)', value: 'minhquang' },
  { name: 'Ngọc Huyền (ngochuyen)', value: 'ngochuyen' },
  { name: 'Ngọc Huyền Mới (ngochuyennew)', value: 'ngochuyennew' },
  { name: 'Phương Trang (phuongtrang)', value: 'phuongtrang' },
  { name: 'Thái An (taian)', value: 'taian' },
  { name: 'Thanh Phương Viettel (thanhphuongviettel)', value: 'thanhphuongviettel' },
  { name: 'Thiện Tâm (thientam)', value: 'thientam' },
  { name: 'Chiêu Thành (chieuthanh)', value: 'chieuthanh' },
  { name: 'Cúc (cuc)', value: 'cuc' },
  { name: 'Lạc Phi (lacphi)', value: 'lacphi' },
  { name: 'Calm Woman (calmwoman3688)', value: 'calmwoman3688' },
  { name: 'Deep Man (deepman3909)', value: 'deepman3909' },
  { name: 'Duy Oryx (duyoryx3175)', value: 'duyoryx3175' },
  { name: 'VAIS 1000 Medium (vi_VN-vais1000-medium)', value: 'vi_VN-vais1000-medium' }
];

// DOM Elements
const statusBadge = document.getElementById('status-badge');
const statusDot = document.getElementById('status-dot');
const statusText = document.getElementById('status-text');

const modelSelect = document.getElementById('model-select');
const textInput = document.getElementById('text-input');
const charCount = document.getElementById('char-count');
const speakBtn = document.getElementById('speak-btn');
const audioPlayer = document.getElementById('audio-player');
const logContainer = document.getElementById('log-container');

// Hàm xuất log ra màn hình console
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

// Cập nhật trạng thái Badge trên Header
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

// 1. Khởi tạo danh sách mô hình giọng đọc
function initModelDropdown() {
  if (!modelSelect) return;

  modelSelect.innerHTML = '';
  MODEL_LIST.forEach(m => {
    const opt = document.createElement('option');
    opt.value = m.value;
    opt.innerText = m.name;
    modelSelect.appendChild(opt);
  });

  modelSelect.disabled = false;
  log("Đã khởi tạo danh sách mô hình giọng đọc.");
}

// 2. Kiểm tra kết nối tới Render Backend API
async function checkServerStatus() {
  log("Đang kết nối tới Server Render API...");
  setStatus('warning', 'Đang kiểm tra Server...');

  try {
    // Gọi đường dẫn root / của server Render
    const rootUrl = RENDER_API_URL.replace('/tts', '/');
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 giây timeout

    const res = await fetch(rootUrl, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (res.ok) {
      log("Kết nối tới Server Backend Render thành công! Sẵn sàng xử lý Tiếng Việt.");
      setStatus('success', 'Server Sẵn Sàng');
      if (speakBtn) speakBtn.disabled = false;
    } else {
      throw new Error(`Server phản hồi mã lỗi: ${res.status}`);
    }
  } catch (err) {
    if (err.name === 'AbortError') {
      log("Server Render đang 'thức dậy' (cold start có thể mất 30-50s lần đầu tiên). Hãy bấm nút đọc để kích hoạt!", "warn");
    } else {
      log(`Chưa thể kết nối tới Server API: ${err.message}`, "warn");
    }
    setStatus('warning', 'Server đang khởi động...');
    if (speakBtn) speakBtn.disabled = false; // Vẫn cho bấm để kích hoạt Cold Start
  }
}

// 3. Xử lý Đếm số từ/ký tự
if (textInput) {
  textInput.addEventListener('input', () => {
    const val = textInput.value;
    const words = val.trim() ? val.trim().split(/\s+/).length : 0;
    if (charCount) charCount.innerText = `${val.length} ký tự | ${words} từ`;
  });
}

// 4. Các nút thao tác phụ
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
      textInput.value = "Xin chào các bạn, đây là ứng dụng chuyển đổi văn bản thành giọng nói Tiếng Việt chuẩn 100%.";
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

// 5. Thực thi Tổng Hợp & Tạo Giọng Đọc Tiếng Việt qua Render API
if (speakBtn) {
  speakBtn.addEventListener('click', async () => {
    const text = textInput ? textInput.value.trim() : '';
    if (!text) {
      alert("Vui lòng nhập văn bản Tiếng Việt cần chuyển thành giọng nói!");
      return;
    }

    // Lấy tên mô hình đang được chọn
    let selectedModel = 'tranthanh';
    if (modelSelect && modelSelect.value) {
      selectedModel = modelSelect.value.split('/').pop().replace('.onnx.json', '').replace('.onnx', '');
    }

    try {
      speakBtn.disabled = true;
      setStatus('warning', 'Đang xử lý âm thanh...');
      log(`Gửi yêu cầu: "${text}" [Model: ${selectedModel}]...`);

      // Khởi tạo URL gọi API
      const fullUrl = `${RENDER_API_URL}?text=${encodeURIComponent(text)}&model=${encodeURIComponent(selectedModel)}`;
      
      const startTime = performance.now();
      const response = await fetch(fullUrl);

      if (!response.ok) {
        let errorMsg = "Lỗi không xác định từ Server";
        try {
          const errData = await response.json();
          errorMsg = errData.detail || errorMsg;
        } catch(e) {}
        throw new Error(errorMsg);
      }

      const duration = (performance.now() - startTime).toFixed(0);
      log(`Tạo giọng đọc Tiếng Việt thành công trong ${duration}ms!`);

      // Nhận luồng dữ liệu file WAV từ Backend Render
      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);

      if (audioPlayer) {
        audioPlayer.src = audioUrl;
        audioPlayer.play();
      }

      setStatus('success', 'Đã tạo giọng đọc');
    } catch (err) {
      log(`LỖI TẠO GIỌNG ĐỌC: ${err.message}`, 'error');
      setStatus('error', 'Lỗi kết nối Server');
    } finally {
      speakBtn.disabled = false;
    }
  });
}

// Khởi chạy khi trang tải xong
window.addEventListener('DOMContentLoaded', () => {
  initModelDropdown();
  checkServerStatus();
});
