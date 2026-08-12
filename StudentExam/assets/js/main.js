/**
 * ============================================================
 * StudentExam v2.0
 * Main Application Controller
 * ============================================================
 *
 * File    : main.js
 * Version : 2.0.0
 * Author  : Nguyễn Thuận
 *
 * Vai trò:
 * - Khởi tạo ứng dụng
 * - Quản lý application state
 * - Quản lý navigation / view
 * - Quản lý login / logout
 * - Quản lý theme
 * - Quản lý loading / toast / modal
 * - Điều phối các module
 *
 * Không xử lý:
 * - Logic bài kiểm tra
 * - Logic Dashboard
 * - Logic Result
 * - Logic Profile
 * - API nghiệp vụ riêng của từng module
 *
 * ============================================================
 */


/* ============================================================
 * IMPORT
 * ============================================================
 */

import {
    CONFIG,
    getApiActionUrl,
    getStorageKey
} from "./config.js";


/* ============================================================
 * APPLICATION STATE
 * ============================================================
 */

const APP_STATE = {

    initialized: false,

    authenticated: false,

    currentView:
        CONFIG.ROUTE.DEFAULT_PAGE,

    currentStudent:
        null,

    currentClass:
        null,

    currentProfile:
        null,

    dashboard:
        null,

    exams:
        [],

    results:
        [],

    currentExam:
        null,

    loading:
        false,

    theme:
        CONFIG.THEME.DEFAULT

};


/* ============================================================
 * DOM CACHE
 * ============================================================
 */

const DOM = {};


/* ============================================================
 * DOM HELPERS
 * ============================================================
 */

/**
 * Lấy phần tử theo ID.
 *
 * Không tạo ID mới tại đây.
 * ID phải tồn tại trong index.html chuẩn.
 *
 * @param {string} id
 * @returns {HTMLElement|null}
 */
function $(id) {

    return document.getElementById(id);

}


/**
 * Cache toàn bộ DOM element cần dùng bởi main.js.
 */
function cacheDOM() {

    DOM.preloader =
        $("preloader");

    DOM.appTitle =
        $("appTitle");

    DOM.appVersion =
        $("appVersion");

    DOM.syncStatus =
        $("syncStatus");

    DOM.btnTheme =
        $("btnTheme");

    DOM.themeIcon =
        $("themeIcon");


    /* Navbar */

    DOM.navbarAvatar =
        $("navbarAvatar");

    DOM.navbarUserName =
        $("navbarUserName");

    DOM.profileAvatar =
        $("profileAvatar");

    DOM.profileName =
        $("profileName");

    DOM.profileClass =
        $("profileClass");

    DOM.totalExamCount =
        $("totalExamCount");

    DOM.completedExamCount =
        $("completedExamCount");

    DOM.averageScore =
        $("averageScore");

    DOM.btnProfile =
        $("btnProfile");

    DOM.btnLogout =
        $("btnLogout");


    /* Sidebar */

    DOM.sidebarAppTitle =
        $("sidebarAppTitle");

    DOM.sidebarAvatar =
        $("sidebarAvatar");

    DOM.sidebarUserName =
        $("sidebarUserName");

    DOM.sidebarClassName =
        $("sidebarClassName");


    /* Navigation */

    DOM.menuDashboard =
        $("menuDashboard");

    DOM.menuExam =
        $("menuExam");

    DOM.menuResult =
        $("menuResult");

    DOM.menuProfile =
        $("menuProfile");

    DOM.menuRefresh =
        $("menuRefresh");

    DOM.menuLogout =
        $("menuLogout");


    /* Content */

    DOM.pageTitle =
        $("pageTitle");

    DOM.breadcrumbTitle =
        $("breadcrumbTitle");


    /* Views */

    DOM.viewDashboard =
        $("viewDashboard");

    DOM.viewExam =
        $("viewExam");

    DOM.viewResult =
        $("viewResult");

    DOM.viewProfile =
        $("viewProfile");


    /* Login */

    DOM.loginOverlay =
        $("loginOverlay");

    DOM.loginForm =
        $("loginForm");

    DOM.loginClass =
        $("loginClass");

    DOM.loginStudent =
        $("loginStudent");

    DOM.rememberLogin =
        $("rememberLogin");

    DOM.btnLogin =
        $("btnLogin");


    /* Loading */

    DOM.loadingOverlay =
        $("loadingOverlay");

    DOM.loadingText =
        $("loadingText");


    /* Toast */

    DOM.toastContainer =
        $("toastContainer");


    /* Modal */

    DOM.appModal =
        $("appModal");

    DOM.appModalHeader =
        $("appModalHeader");

    DOM.appModalIcon =
        $("appModalIcon");

    DOM.appModalTitle =
        $("appModalTitle");

    DOM.appModalMessage =
        $("appModalMessage");

    DOM.btnModalCancel =
        $("btnModalCancel");

    DOM.btnModalOk = 
        $("btnModalOk");

}


/* ============================================================
 * APPLICATION INFORMATION
 * ============================================================
 */

function initializeApplicationInfo() {

    if (DOM.appTitle) {

        DOM.appTitle.textContent =
            CONFIG.APP.NAME;

    }


    if (DOM.sidebarAppTitle) {

        DOM.sidebarAppTitle.textContent =
            CONFIG.APP.NAME;

    }


    if (DOM.appVersion) {

        DOM.appVersion.textContent =
            `v${CONFIG.APP.VERSION}`;

    }

}


/* ============================================================
 * THEME
 * ============================================================
 */

/**
 * Lấy theme đã lưu.
 *
 * @returns {string}
 */
function getSavedTheme() {

    const key =
        getStorageKey("THEME");

    if (!key) {

        return CONFIG.THEME.DEFAULT;

    }

    const saved =
        localStorage.getItem(key);

    if (
        saved === CONFIG.THEME.LIGHT ||
        saved === CONFIG.THEME.DARK
    ) {

        return saved;

    }

    return CONFIG.THEME.DEFAULT;

}


/**
 * Áp dụng theme.
 *
 * @param {string} theme
 */
function applyTheme(theme) {

    const normalizedTheme =
        theme === CONFIG.THEME.DARK
            ? CONFIG.THEME.DARK
            : CONFIG.THEME.LIGHT;


    APP_STATE.theme =
        normalizedTheme;


    document.documentElement
        .setAttribute(
            "data-theme",
            normalizedTheme
        );


    document.body
        .classList
        .toggle(
            "dark-mode",
            normalizedTheme === CONFIG.THEME.DARK
        );


    if (DOM.themeIcon) {

        DOM.themeIcon.className =
            normalizedTheme === CONFIG.THEME.DARK
                ? "fas fa-sun"
                : "fas fa-moon";

    }


    const key =
        getStorageKey("THEME");

    if (key) {

        localStorage.setItem(
            key,
            normalizedTheme
        );

    }

}


/**
 * Đổi theme.
 */
function toggleTheme() {

    if (!CONFIG.THEME.ALLOW_SWITCH) {

        return;

    }


    const nextTheme =
        APP_STATE.theme === CONFIG.THEME.DARK
            ? CONFIG.THEME.LIGHT
            : CONFIG.THEME.DARK;


    applyTheme(nextTheme);

}


/* ============================================================
 * VIEW MANAGEMENT
 * ============================================================
 */

const VIEW_CONFIG = {

    dashboard: {

        element:
            "viewDashboard",

        title:
            "Dashboard"

    },

    exam: {

        element:
            "viewExam",

        title:
            "Bài kiểm tra"

    },

    result: {

        element:
            "viewResult",

        title:
            "Kết quả"

    },

    profile: {

        element:
            "viewProfile",

        title:
            "Hồ sơ"

    }

};


/**
 * Ẩn toàn bộ view.
 */
function hideAllViews() {

    Object.values(VIEW_CONFIG)
        .forEach(
            view => {

                const element =
                    $(view.element);

                if (element) {

                    element.classList
                        .add("d-none");

                }

            }
        );

}


/**
 * Cập nhật trạng thái active của menu.
 *
 * @param {string} viewName
 */
function updateNavigation(viewName) {

    const menus = {

        dashboard:
            DOM.menuDashboard,

        exam:
            DOM.menuExam,

        result:
            DOM.menuResult,

        profile:
            DOM.menuProfile

    };


    Object.values(menus)
        .forEach(
            menu => {

                if (menu) {

                    menu.classList
                        .remove("active");

                }

            }
        );


    const activeMenu =
        menus[viewName];

    if (activeMenu) {

        activeMenu.classList
            .add("active");

    }

}


/**
 * Cập nhật tiêu đề trang.
 *
 * @param {string} viewName
 */
function updatePageTitle(viewName) {

    const config =
        VIEW_CONFIG[viewName];

    if (!config) {

        return;

    }


    if (DOM.pageTitle) {

        DOM.pageTitle.textContent =
            config.title;

    }


    if (DOM.breadcrumbTitle) {

        DOM.breadcrumbTitle.textContent =
            config.title;

    }

}


/**
 * Chuyển view.
 *
 * @param {string} viewName
 */
function navigate(viewName) {

    if (!VIEW_CONFIG[viewName]) {

        viewName =
            CONFIG.ROUTE.DEFAULT_PAGE;

    }


    hideAllViews();


    const viewElement =
        $(VIEW_CONFIG[viewName].element);

    if (viewElement) {

        viewElement.classList
            .remove("d-none");

    }


    APP_STATE.currentView =
        viewName;


    updateNavigation(viewName);

    updatePageTitle(viewName);


    if (CONFIG.NAVIGATION.SCROLL_TOP) {

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });

    }


    if (CONFIG.NAVIGATION.ENABLE_HISTORY) {

        updateHistory(viewName);

    }


    dispatchViewEvent(viewName);

}


/**
 * Cập nhật browser history.
 *
 * @param {string} viewName
 */
function updateHistory(viewName) {

    const url =
        `#${viewName}`;

    if (
        window.location.hash !== url
    ) {

        window.history.pushState(
            {
                view:
                    viewName
            },
            "",
            url
        );

    }

}


/**
 * Xử lý browser Back / Forward.
 */
function handlePopState() {

    const hash =
        window.location.hash
            .replace("#", "")
            .trim();


    if (VIEW_CONFIG[hash]) {

        navigateWithoutHistory(hash);

    } else {

        navigateWithoutHistory(
            CONFIG.ROUTE.DEFAULT_PAGE
        );

    }

}


/**
 * Navigate nhưng không ghi history mới.
 *
 * @param {string} viewName
 */
function navigateWithoutHistory(viewName) {

    hideAllViews();


    const viewElement =
        $(VIEW_CONFIG[viewName].element);

    if (viewElement) {

        viewElement.classList
            .remove("d-none");

    }


    APP_STATE.currentView =
        viewName;


    updateNavigation(viewName);

    updatePageTitle(viewName);

    dispatchViewEvent(viewName);

}


/**
 * Gửi event cho module tương ứng.
 *
 * Các module sau này có thể lắng nghe:
 *
 * studentexam:view-dashboard
 * studentexam:view-exam
 * studentexam:view-result
 * studentexam:view-profile
 *
 * @param {string} viewName
 */
function dispatchViewEvent(viewName) {

    document.dispatchEvent(
        new CustomEvent(
            `studentexam:view-${viewName}`,
            {
                detail: {
                    state:
                        APP_STATE
                }
            }
        )
    );

}


/* ============================================================
 * LOADING
 * ============================================================
 */

/**
 * Hiển thị loading.
 *
 * @param {string} message
 */
function showLoading(
    message = "Đang tải..."
) {

    APP_STATE.loading =
        true;


    if (DOM.loadingText) {

        DOM.loadingText.textContent =
            message;

    }


    if (DOM.loadingOverlay) {

        DOM.loadingOverlay
            .classList
            .remove("d-none");

    }

}


/**
 * Ẩn loading.
 */
function hideLoading() {

    APP_STATE.loading =
        false;


    if (DOM.loadingOverlay) {

        DOM.loadingOverlay
            .classList
            .add("d-none");

    }

}


/* ============================================================
 * TOAST
 * ============================================================
 */

/**
 * Hiển thị toast.
 *
 * @param {string} message
 * @param {string} type
 */
function showToast(
    message,
    type = "info"
) {

    if (!CONFIG.FEATURE.TOAST) {

        return;

    }


    if (!DOM.toastContainer) {

        return;

    }


    const toast =
        document.createElement("div");


    const allowedTypes = [
        "primary",
        "secondary",
        "success",
        "danger",
        "warning",
        "info",
        "light",
        "dark"
    ];


    const safeType =
        allowedTypes.includes(type)
            ? type
            : "info";


    toast.className =
        `alert alert-${safeType} shadow-sm mb-2`;


    toast.setAttribute(
        "role",
        "alert"
    );


    toast.textContent =
        String(message);


    DOM.toastContainer
        .appendChild(toast);


    const maxStack =
        Number(CONFIG.TOAST.MAX_STACK) || 5;


    while (
        DOM.toastContainer.children.length >
        maxStack
    ) {

        DOM.toastContainer
            .firstElementChild
            ?.remove();

    }


    window.setTimeout(
        () => {

            toast.remove();

        },
        Number(CONFIG.TOAST.DURATION) || 3000
    );

}


/* ============================================================
 * MODAL
 * ============================================================
 */

/**
 * Hiển thị modal thông báo.
 *
 * @param {Object} options
 */
function showModal({

    title =
        "Thông báo",

    message =
        "",

    type =
        "info",

    showCancel =
        false,

    onOk =
        null,

    onCancel =
        null

} = {}) {

    if (!DOM.appModal) {

        return;

    }


    if (DOM.appModalTitle) {

        DOM.appModalTitle.textContent =
            title;

    }


    if (DOM.appModalMessage) {

        DOM.appModalMessage.textContent =
            message;

    }


    if (DOM.btnModalCancel) {

        DOM.btnModalCancel
            .classList
            .toggle(
                "d-none",
                !showCancel
            );

    }


    if (DOM.appModalHeader) {

        DOM.appModalHeader.className =
            "modal-header";


        if (type === "success") {

            DOM.appModalHeader
                .classList
                .add("bg-success", "text-white");

        }

        else if (type === "danger") {

            DOM.appModalHeader
                .classList
                .add("bg-danger", "text-white");

        }

        else if (type === "warning") {

            DOM.appModalHeader
                .classList
                .add("bg-warning");

        }

        else {

            DOM.appModalHeader
                .classList
                .add("bg-primary", "text-white");

        }

    }


    if (DOM.appModalIcon) {

        const icons = {

            success:
                "fas fa-circle-check me-2",

            danger:
                "fas fa-circle-xmark me-2",

            warning:
                "fas fa-triangle-exclamation me-2",

            info:
                "fas fa-circle-info me-2"

        };


        DOM.appModalIcon.className =
            icons[type] ||
            icons.info;

    }


    let modalInstance =
        null;


    if (
        window.bootstrap &&
        window.bootstrap.Modal
    ) {

        modalInstance =
            window.bootstrap.Modal
                .getOrCreateInstance(
                    DOM.appModal
                );

    }


    const handleOk =
        () => {

            if (typeof onOk === "function") {

                onOk();

            }

            modalInstance?.hide();

        };


    const handleCancel =
        () => {

            if (typeof onCancel === "function") {

                onCancel();

            }

        };


    if (DOM.btnModalOk) {

        DOM.btnModalOk.onclick =
            handleOk;

    }


    if (DOM.btnModalCancel) {

        DOM.btnModalCancel.onclick =
            handleCancel;

    }


    modalInstance?.show();

}


/* ============================================================
 * API
 * ============================================================
 */

/**
 * Gọi Apps Script API.
 *
 * Đây là lớp API cơ bản.
 *
 * Không chứa logic nghiệp vụ.
 *
 * @param {string} action
 * @param {Object} payload
 * @returns {Promise<Object>}
 */
async function apiRequest(
    action,
    payload = {}
) {

    const url =
        getApiActionUrl(action);


    let lastError =
        null;


    const retryCount =
        Number(CONFIG.API.RETRY) || 0;


    for (
        let attempt = 0;
        attempt <= retryCount;
        attempt++
    ) {

        try {

            const controller =
                new AbortController();


            const timeoutId =
                window.setTimeout(
                    () => controller.abort(),
                    Number(CONFIG.API.TIMEOUT) || 15000
                );


            const response =
                await fetch(
                    url,
                    {
                        method:
                            "POST",

                        headers:
                            CONFIG.API.HEADERS,

                        body:
                            JSON.stringify(payload),

                        signal:
                            controller.signal
                    }
                );


            window.clearTimeout(
                timeoutId
            );


            if (!response.ok) {

                throw new Error(
                    `HTTP ${response.status}`
                );

            }


            const data =
                await response.json();


            return data;

        }

        catch (error) {

            lastError =
                error;


            if (
                attempt < retryCount
            ) {

                await delay(
                    Number(CONFIG.API.RETRY_DELAY) || 1000
                );

            }

        }

    }


    throw lastError ||
        new Error(
            CONFIG.MESSAGE.NETWORK_ERROR
        );

}


/**
 * Delay.
 *
 * @param {number} milliseconds
 * @returns {Promise<void>}
 */
function delay(milliseconds) {

    return new Promise(
        resolve =>
            window.setTimeout(
                resolve,
                milliseconds
            )
    );

}


/* ============================================================
 * SESSION
 * ============================================================
 */

/**
 * Lưu session local.
 *
 * @param {Object} session
 */
function saveSession(session) {

    if (!session) {

        return;

    }


    const loginKey =
        getStorageKey("LOGIN");

    const studentKey =
        getStorageKey("STUDENT");

    const classKey =
        getStorageKey("CLASS");

    const profileKey =
        getStorageKey("PROFILE");


    if (loginKey) {

        localStorage.setItem(
            loginKey,
            JSON.stringify(session)
        );

    }


    if (session.student && studentKey) {

        localStorage.setItem(
            studentKey,
            JSON.stringify(session.student)
        );

    }


    if (session.class && classKey) {

        localStorage.setItem(
            classKey,
            JSON.stringify(session.class)
        );

    }


    if (session.profile && profileKey) {

        localStorage.setItem(
            profileKey,
            JSON.stringify(session.profile)
        );

    }

}


/**
 * Đọc session local.
 *
 * @returns {Object|null}
 */
function loadSession() {

    const loginKey =
        getStorageKey("LOGIN");

    if (!loginKey) {

        return null;

    }


    const raw =
        localStorage.getItem(loginKey);

    if (!raw) {

        return null;

    }


    try {

        return JSON.parse(raw);

    }

    catch {

        localStorage.removeItem(
            loginKey
        );

        return null;

    }

}


/**
 * Xóa session.
 */
function clearSession() {

    const keys = [

        "TOKEN",
        "LOGIN",
        "STUDENT",
        "CLASS",
        "PROFILE",
        "DASHBOARD",
        "EXAM",
        "ANSWERS",
        "RESULT"

    ];


    keys.forEach(
        keyName => {

            const key =
                getStorageKey(keyName);

            if (key) {

                localStorage.removeItem(
                    key
                );

            }

        }
    );


    APP_STATE.authenticated =
        false;

    APP_STATE.currentStudent =
        null;

    APP_STATE.currentClass =
        null;

    APP_STATE.currentProfile =
        null;

}


/**
 * Khôi phục session.
 *
 * @returns {boolean}
 */
function restoreSession() {

    const session =
        loadSession();


    if (!session) {

        return false;

    }


    APP_STATE.authenticated =
        true;


    APP_STATE.currentStudent =
        session.student ||
        null;


    APP_STATE.currentClass =
        session.class ||
        null;


    APP_STATE.currentProfile =
        session.profile ||
        null;


    updateUserInterface();


    return true;

}


/* ============================================================
 * USER INTERFACE
 * ============================================================
 */

/**
 * Tạo avatar viết tắt.
 *
 * @param {string} name
 * @returns {string}
 */
function createInitials(name) {

    if (!name) {

        return "HS";

    }


    const words =
        String(name)
            .trim()
            .split(/\s+/)
            .filter(Boolean);


    if (!words.length) {

        return "HS";

    }


    if (words.length === 1) {

        return words[0]
            .substring(0, 2)
            .toUpperCase();

    }


    return (
        words[0][0] +
        words[words.length - 1][0]
    ).toUpperCase();

}


/**
 * Cập nhật toàn bộ UI user.
 */
function updateUserInterface() {

    const student =
        APP_STATE.currentStudent;


    const profile =
        APP_STATE.currentProfile;


    const name =
        student?.ho_ten ||
        student?.name ||
        profile?.ho_ten ||
        profile?.name ||
        "Chưa đăng nhập";


    const className =
        APP_STATE.currentClass?.lop ||
        APP_STATE.currentClass?.name ||
        student?.lop ||
        student?.class ||
        profile?.lop ||
        profile?.class ||
        "---";


    const initials =
        createInitials(name);


    const avatarElements = [

        DOM.navbarAvatar,
        DOM.profileAvatar,
        DOM.sidebarAvatar

    ];


    avatarElements.forEach(
        element => {

            if (element) {

                element.textContent =
                    initials;

            }

        }
    );


    if (DOM.navbarUserName) {

        DOM.navbarUserName.textContent =
            name;

    }


    if (DOM.profileName) {

        DOM.profileName.textContent =
            name;

    }


    if (DOM.profileClass) {

        DOM.profileClass.textContent =
            className;

    }


    if (DOM.sidebarUserName) {

        DOM.sidebarUserName.textContent =
            name;

    }


    if (DOM.sidebarClassName) {

        DOM.sidebarClassName.textContent =
            className;

    }


    if (DOM.syncStatus) {

        DOM.syncStatus.textContent =
            APP_STATE.authenticated
                ? "Online"
                : "Offline";

        DOM.syncStatus.className =
            APP_STATE.authenticated
                ? "badge bg-success"
                : "badge bg-secondary";

    }


}


/* ============================================================
 * LOGIN
 * ============================================================
 */

/**
 * Hiển thị login overlay.
 */
function showLogin() {

    if (DOM.loginOverlay) {

        DOM.loginOverlay
            .classList
            .remove("d-none");

    }

}


/**
 * Ẩn login overlay.
 */
function hideLogin() {

    if (DOM.loginOverlay) {

        DOM.loginOverlay
            .classList
            .add("d-none");

    }

}


/**
 * Xử lý login form.
 *
 * Chỉ là controller.
 * Logic API login có thể chuyển sang module auth
 * khi module đó được tạo.
 *
 * @param {SubmitEvent} event
 */
async function handleLogin(event) {

    event.preventDefault();


    const classValue =
        DOM.loginClass?.value?.trim();


    const studentValue =
        DOM.loginStudent?.value?.trim();


    if (!classValue) {

        showToast(
            "Vui lòng chọn lớp.",
            "warning"
        );

        return;

    }


    if (!studentValue) {

        showToast(
            "Vui lòng chọn học sinh.",
            "warning"
        );

        return;

    }


    try {

        showLoading(
            "Đang đăng nhập..."
        );


        const result =
            await apiRequest(
                CONFIG.API.ACTION.LOGIN,
                {
                    class:
                        classValue,

                    student:
                        studentValue
                }
            );


        if (
            !result ||
            result.success !== true
        ) {

            throw new Error(
                result?.message ||
                CONFIG.MESSAGE.LOGIN_FAILED
            );

        }


        const session =
            result.data ||
            result.session ||
            result;


        APP_STATE.authenticated =
            true;


        APP_STATE.currentStudent =
            session.student ||
            null;


        APP_STATE.currentClass =
            session.class ||
            classValue;


        APP_STATE.currentProfile =
            session.profile ||
            null;


        saveSession(session);

        updateUserInterface();

        hideLogin();

        showToast(
            CONFIG.MESSAGE.LOGIN_SUCCESS,
            "success"
        );


        navigate(
            CONFIG.ROUTE.DEFAULT_PAGE
        );


    }

    catch (error) {

        console.error(
            "[StudentExam] Login error:",
            error
        );


        showToast(
            error.message ||
            CONFIG.MESSAGE.LOGIN_FAILED,
            "danger"
        );

    }

    finally {

        hideLoading();

    }

}


/* ============================================================
 * LOGOUT
 * ============================================================
 */

/**
 * Đăng xuất.
 */
async function logout() {

    try {

        showLoading(
            "Đang đăng xuất..."
        );


        const session =
            loadSession();


        try {

            await apiRequest(
                CONFIG.API.ACTION.LOGOUT,
                {
                    session:
                        session
                }
            );

        }

        catch (error) {

            console.warn(
                "[StudentExam] Logout API warning:",
                error
            );

        }


    }

    finally {

        clearSession();

        updateUserInterface();

        hideLoading();

        showLogin();

    }

}


/**
 * Xác nhận logout.
 */
function confirmLogout() {

    showModal({

        title:
            "Đăng xuất",

        message:
            "Bạn có chắc chắn muốn đăng xuất?",

        type:
            "warning",

        showCancel:
            true,

        onOk:
            logout

    });

}


/* ============================================================
 * REFRESH
 * ============================================================
 */

/**
 * Đồng bộ dữ liệu.
 *
 * Hiện tại chỉ phát event.
 * Module tương ứng sẽ xử lý sau.
 */
function refreshCurrentView() {

    document.dispatchEvent(
        new CustomEvent(
            "studentexam:refresh",
            {
                detail: {
                    view:
                        APP_STATE.currentView,

                    state:
                        APP_STATE
                }
            }
        )
    );

}


/* ============================================================
 * EVENT BINDING
 * ============================================================
 */

function bindEvents() {


    /* Theme */

    DOM.btnTheme?.addEventListener(
        "click",
        event => {

            event.preventDefault();

            toggleTheme();

        }
    );


    /* Navbar profile */

    DOM.btnProfile?.addEventListener(
        "click",
        event => {

            event.preventDefault();

            navigate(
                CONFIG.ROUTE.PROFILE
            );

        }
    );


    /* Navbar logout */

    DOM.btnLogout?.addEventListener(
        "click",
        event => {

            event.preventDefault();

            confirmLogout();

        }
    );


    /* Sidebar navigation */

    DOM.menuDashboard?.addEventListener(
        "click",
        event => {

            event.preventDefault();

            navigate(
                CONFIG.ROUTE.DASHBOARD
            );

        }
    );


    DOM.menuExam?.addEventListener(
        "click",
        event => {

            event.preventDefault();

            navigate(
                CONFIG.ROUTE.EXAM
            );

        }
    );


    DOM.menuResult?.addEventListener(
        "click",
        event => {

            event.preventDefault();

            navigate(
                CONFIG.ROUTE.RESULT
            );

        }
    );


    DOM.menuProfile?.addEventListener(
        "click",
        event => {

            event.preventDefault();

            navigate(
                CONFIG.ROUTE.PROFILE
            );

        }
    );


    DOM.menuRefresh?.addEventListener(
        "click",
        event => {

            event.preventDefault();

            refreshCurrentView();

        }
    );


    DOM.menuLogout?.addEventListener(
        "click",
        event => {

            event.preventDefault();

            confirmLogout();

        }
    );


    /* Login */

    DOM.loginForm?.addEventListener(
        "submit",
        handleLogin
    );


    /* Browser navigation */

    window.addEventListener(
        "popstate",
        handlePopState
    );


    window.addEventListener(
        "hashchange",
        handlePopState
    );


    /* Global refresh */

    document.addEventListener(
        "studentexam:refresh-current",
        refreshCurrentView
    );

}


/* ============================================================
 * MODULE EVENTS
 * ============================================================
 */

function bindModuleEvents() {


    /*
     * Dashboard
     */

    document.addEventListener(
        "studentexam:dashboard-ready",
        event => {

            APP_STATE.dashboard =
                event.detail?.dashboard ||
                null;

        }
    );


    /*
     * Exam
     */

    document.addEventListener(
        "studentexam:exam-started",
        event => {

            APP_STATE.currentExam =
                event.detail?.exam ||
                null;

        }
    );


    /*
     * Result
     */

    document.addEventListener(
        "studentexam:results-loaded",
        event => {

            APP_STATE.results =
                event.detail?.results ||
                [];

        }
    );


    /*
     * Profile
     */

    document.addEventListener(
        "studentexam:profile-loaded",
        event => {

            APP_STATE.currentProfile =
                event.detail?.profile ||
                null;

            updateUserInterface();

        }
    );

}


/* ============================================================
 * INITIAL ROUTE
 * ============================================================
 */

function resolveInitialRoute() {

    const hash =
        window.location.hash
            .replace("#", "")
            .trim();


    if (
        hash &&
        VIEW_CONFIG[hash]
    ) {

        return hash;

    }


    return CONFIG.ROUTE.DEFAULT_PAGE;

}


/* ============================================================
 * PRELOADER
 * ============================================================
 */

function hidePreloader() {

    if (!DOM.preloader) {

        return;

    }


    window.setTimeout(
        () => {

            DOM.preloader.classList
                .add("d-none");

        },
        300
    );

}


/* ============================================================
 * APPLICATION INITIALIZATION
 * ============================================================
 */

async function initializeApplication() {

    if (APP_STATE.initialized) {

        return;

    }


    cacheDOM();


    initializeApplicationInfo();


    applyTheme(
        getSavedTheme()
    );


    bindEvents();

    bindModuleEvents();


    const restored =
        restoreSession();


    if (restored) {

        hideLogin();

    }

    else {

        showLogin();

    }


    navigateWithoutHistory(
        resolveInitialRoute()
    );


    APP_STATE.initialized =
        true;


    hidePreloader();


    document.dispatchEvent(
        new CustomEvent(
            "studentexam:ready",
            {
                detail: {
                    state:
                        APP_STATE
                }
            }
        )
    );


}


/* ============================================================
 * GLOBAL API
 * ============================================================
 */

/**
 * API công khai cho các module khác.
 *
 * Không export APP_STATE trực tiếp để tránh module khác
 * sửa state tùy tiện.
 */
export const App = {

    getState() {

        return {
            ...APP_STATE
        };

    },


    navigate,


    showLoading,


    hideLoading,


    showToast,


    showModal,


    apiRequest,


    saveSession,


    loadSession,


    clearSession,


    logout,


    refreshCurrentView

};


/* ============================================================
 * START APPLICATION
 * ============================================================
 */

if (
    document.readyState === "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        initializeApplication,
        {
            once:
                true
        }
    );

}

else {

    initializeApplication();

}