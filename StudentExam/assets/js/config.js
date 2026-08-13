/**
 * ============================================================
 * StudentExam v2.0
 * Configuration
 * ------------------------------------------------------------
 * Author  : Nguyễn Thuận
 * Version : 2.0.0
 * ============================================================
 */


/* ============================================================
 * DEEP FREEZE
 * ========================================================== */

/**
 * Khóa toàn bộ object nhiều cấp.
 *
 * @param {Object} object
 * @returns {Object}
 */
function deepFreeze(object) {

    Object.getOwnPropertyNames(object).forEach(
        function(name) {

            const value =
                object[name];

            if (
                value &&
                typeof value === "object" &&
                !Object.isFrozen(value)
            ) {

                deepFreeze(value);

            }

        }
    );

    return Object.freeze(object);

}


/* ============================================================
 * CONFIG
 * ========================================================== */

const config = {


    /* ========================================================
     * APPLICATION
     * ====================================================== */

    APP: {

        NAME:
            "StudentExam",

        SHORT_NAME:
            "SE",

        VERSION:
            "2.0.0",

        BUILD:
            "2026.08",

        AUTHOR:
            "Nguyễn Thuận",

        COMPANY:
            "CTEGroup",

        COPYRIGHT:
            "© 2026",

        DESCRIPTION:
            "Student Examination Management System",

        LOGO:
            "assets/img/logo.png",

        FAVICON:
            "assets/img/favicon.png"

    },


    /* ========================================================
     * API
     * ====================================================== */

    API: {

        /**
         * Google Apps Script Web App URL
         */

        BASE_URL:
            "https://script.google.com/macros/s/AKfycbz4ABTzME_gqjbSEJSZFoiiXAwOAJGSaO1dYg6fuZ6PwboAppz8nTlz9wgK8vyhVPry/exec",

        /**
         * Request timeout
         * Đơn vị: milliseconds
         */

        TIMEOUT:
            15000,

        /**
         * Retry khi lỗi mạng
         */

        RETRY:
            2,

        /**
         * Delay giữa các lần retry
         * Đơn vị: milliseconds
         */

        RETRY_DELAY:
            1000,

        /**
         * HTTP Headers
         */

        HEADERS: {

            "Content-Type":
                "application/json",

            "Accept":
                "application/json"

        },

        /**
         * Apps Script actions
         *
         * Phải khớp với Backend đã test.
         */

        ACTION: {

            /* Authentication */

            LOGIN:
                "login",

            LOGOUT:
                "logout",

            CHECK_SESSION:
                "checkSession",


            /* Student */

            GET_CLASSES:
                "getClasses",

            GET_STUDENTS:
                "getStudents",
            
            VERIFY_STUDENT: 
                "verifyStudent",

            FIND_STUDENT:
                "findStudent",


            /* Dashboard */

            GET_DASHBOARD:
                "dashboard",


            /* Exam */

            GET_EXAMS:
                "getExams",

            GET_EXAM:
                "getExam",

            SUBMIT_EXAM:
                "submitExam",


            /* Result */

            GET_RESULTS:
                "getResults",

            GET_RESULT:
                "getResult"

        }

    },


    /* ========================================================
     * ENVIRONMENT
     * ====================================================== */

    ENV: {

        MODE:
            "production",

        DEBUG:
            false,

        DEVELOP:
            false,

        TEST:
            false,

        PRODUCTION:
            true

    },


    /* ========================================================
     * AUTHENTICATION
     * ====================================================== */

    AUTH: {

        /**
         * Ghi nhớ đăng nhập
         */

        REMEMBER_LOGIN:
            true,

        /**
         * Số ngày ghi nhớ
         */

        REMEMBER_DAYS:
            30,

        /**
         * Thời gian hết hạn phía Frontend
         * Đơn vị: giây
         *
         * Backend vẫn là nơi quyết định
         * session thực tế có hợp lệ hay không.
         */

        SESSION_TIMEOUT:
            86400,

        /**
         * Tự động đăng nhập
         */

        AUTO_LOGIN:
            true,

        /**
         * Cho phép nhiều tab
         */

        MULTI_TAB:
            true

    },


    /* ========================================================
     * USER ROLE
     * ====================================================== */

    ROLE: {

        STUDENT:
            "student",

        TEACHER:
            "teacher",

        ADMIN:
            "admin"

    },


    /* ========================================================
     * SESSION
     * ====================================================== */

    SESSION: {

        PREFIX:
            "studentexam.v2",

        VERSION:
            "2.0",

        EXPIRE_CHECK_INTERVAL:
            60000

    },


    /* ========================================================
     * LOCAL STORAGE
     * ====================================================== */

    STORAGE: {

        PREFIX:
            "studentexam.v2",

        TOKEN:
            "studentexam.v2.token",

        LOGIN:
            "studentexam.v2.login",

        STUDENT:
            "studentexam.v2.student",

        CLASS:
            "studentexam.v2.class",

        PROFILE:
            "studentexam.v2.profile",

        DASHBOARD:
            "studentexam.v2.dashboard",

        EXAM:
            "studentexam.v2.exam",

        ANSWERS:
            "studentexam.v2.answers",

        RESULT:
            "studentexam.v2.result",

        THEME:
            "studentexam.v2.theme",

        LANGUAGE:
            "studentexam.v2.language",

        SETTINGS:
            "studentexam.v2.settings",

        CACHE:
            "studentexam.v2.cache"

    },


    /* ========================================================
     * ROUTE
     * ====================================================== */

    ROUTE: {

        LOGIN:
            "login",

        DASHBOARD:
            "dashboard",

        EXAM:
            "exam",

        RESULT:
            "result",

        PROFILE:
            "profile",

        REVIEW:
            "review",

        NOT_FOUND:
            "404"

    },


    /* ========================================================
     * NAVIGATION
     * ====================================================== */

    NAVIGATION: {

        DEFAULT_PAGE:
            "dashboard",

        ENABLE_HISTORY:
            true,

        SCROLL_TOP:
            true

    },


    /* ========================================================
     * EXAM ENGINE
     * ====================================================== */

    EXAM: {

        /**
         * Tự động lưu đáp án
         *
         * Backend hiện tại chưa có API saveAnswer,
         * nên tính năng này chỉ nên xử lý local.
         */

        AUTO_SAVE:
            true,

        /**
         * Chu kỳ tự động lưu
         * Đơn vị: milliseconds
         */

        AUTO_SAVE_INTERVAL:
            30000,

        /**
         * Tự động nộp bài khi hết giờ
         */

        AUTO_SUBMIT:
            true,

        /**
         * Cho phép đổi đáp án
         */

        ALLOW_CHANGE_ANSWER:
            true,

        /**
         * Cho phép bỏ qua câu hỏi
         */

        ALLOW_SKIP:
            true,

        /**
         * Hiển thị đồng hồ
         */

        SHOW_TIMER:
            true,

        /**
         * Hiển thị thanh tiến độ
         */

        SHOW_PROGRESS:
            true,

        /**
         * Hiển thị bảng điều hướng câu hỏi
         */

        SHOW_QUESTION_PALETTE:
            true,

        /**
         * Cho phép đánh dấu xem lại
         */

        REVIEW_MODE:
            true,

        /**
         * Hiển thị ảnh câu hỏi
         */

        SHOW_QUESTION_IMAGE:
            true,

        /**
         * Trộn câu hỏi
         */

        SHUFFLE_QUESTION:
            false,

        /**
         * Trộn đáp án
         */

        SHUFFLE_ANSWER:
            false,

        /**
         * Tự chuyển câu sau khi chọn đáp án
         */

        AUTO_NEXT:
            false,

        /**
         * Hỏi xác nhận khi nộp bài
         */

        REQUIRE_CONFIRM_SUBMIT:
            true,

        /**
         * Cảnh báo còn bao nhiêu giây
         */

        WARNING_TIME:
            300,

        /**
         * Kích thước ảnh tối đa
         */

        IMAGE_MAX_WIDTH:
            900,

        IMAGE_MAX_HEIGHT:
            700,

        /**
         * Số lần làm bài tối đa
         *
         * 0 = không giới hạn
         */

        MAX_ATTEMPT:
            1

    },


    /* ========================================================
     * RESULT
     * ====================================================== */

    RESULT: {

        /**
         * Điểm đạt
         */

        PASS_SCORE:
            5,

        /**
         * Số chữ số thập phân
         */

        DECIMAL:
            2,

        /**
         * Hiển thị xếp hạng
         */

        SHOW_RANK:
            true,

        /**
         * Hiển thị số câu đúng
         */

        SHOW_CORRECT:
            true,

        /**
         * Hiển thị thời gian làm bài
         */

        SHOW_DURATION:
            true,

        /**
         * Cho phép xem lại bài
         */

        SHOW_REVIEW:
            true,

        /**
         * Cho phép tải PDF
         */

        EXPORT_PDF:
            false,

        /**
         * Cho phép tải Excel
         */

        EXPORT_EXCEL:
            false

    },


    /* ========================================================
     * THEME
     * ====================================================== */

    THEME: {

        DEFAULT:
            "light",

        LIGHT:
            "light",

        DARK:
            "dark",

        ALLOW_SWITCH:
            true

    },


    /* ========================================================
     * LANGUAGE
     * ====================================================== */

    LANGUAGE: {

        DEFAULT:
            "vi",

        AVAILABLE: [

            "vi",

            "en"

        ]

    },


    /* ========================================================
     * UI
     * ====================================================== */

    UI: {

        /**
         * Hiệu ứng
         */

        ENABLE_ANIMATION:
            true,

        /**
         * Sidebar mặc định
         */

        SIDEBAR_COLLAPSED:
            false,

        /**
         * Hiển thị Splash Screen
         */

        SHOW_SPLASH:
            true,

        /**
         * Ripple Effect
         */

        ENABLE_RIPPLE:
            true,

        /**
         * Âm thanh
         */

        ENABLE_SOUND:
            false,

        /**
         * Tooltip
         */

        ENABLE_TOOLTIP:
            true,

        /**
         * Breadcrumb
         */

        SHOW_BREADCRUMB:
            true,

        /**
         * Footer
         */

        SHOW_FOOTER:
            true

    },


    /* ========================================================
     * TOAST
     * ====================================================== */

    TOAST: {

        DURATION:
            3000,

        POSITION:
            "top-end",

        MAX_STACK:
            5

    },


    /* ========================================================
     * MODAL
     * ====================================================== */

    MODAL: {

        STATIC_BACKDROP:
            true,

        KEYBOARD:
            false,

        ANIMATION:
            true

    },


    /* ========================================================
     * PAGINATION
     * ====================================================== */

    PAGINATION: {

        RESULT_PAGE_SIZE:
            20,

        EXAM_PAGE_SIZE:
            10

    },


    /* ========================================================
     * DATE / TIME
     * ====================================================== */

    DATE: {

        LOCALE:
            "vi-VN",

        TIMEZONE:
            "Asia/Ho_Chi_Minh",

        DATE_FORMAT:
            "dd/MM/yyyy",

        DATETIME_FORMAT:
            "dd/MM/yyyy HH:mm:ss"

    },


    /* ========================================================
     * CACHE
     * ====================================================== */

    CACHE: {

        ENABLE:
            true,

        DASHBOARD:
            60,

        PROFILE:
            300,

        RESULT:
            300,

        EXAM:
            60,

        CLASS:
            3600,

        STUDENT:
            3600

    },


    /* ========================================================
     * FEATURE FLAGS
     * ====================================================== */

    FEATURE: {

        /**
         * Dark Mode
         */

        DARK_MODE:
            true,

        /**
         * Offline Mode
         */

        OFFLINE_MODE:
            false,

        /**
         * Progressive Web App
         */

        PWA:
            false,

        /**
         * Export PDF
         */

        EXPORT_PDF:
            false,

        /**
         * Export Excel
         */

        EXPORT_EXCEL:
            false,

        /**
         * Question Image
         */

        QUESTION_IMAGE:
            true,

        /**
         * Result Review
         */

        RESULT_REVIEW:
            true,

        /**
         * Toast
         */

        TOAST:
            true,

        /**
         * Fullscreen Exam
         */

        FULLSCREEN_EXAM:
            false

    },


    /* ========================================================
     * HTTP STATUS
     * ====================================================== */

    HTTP: {

        OK:
            200,

        CREATED:
            201,

        BAD_REQUEST:
            400,

        UNAUTHORIZED:
            401,

        FORBIDDEN:
            403,

        NOT_FOUND:
            404,

        SERVER_ERROR:
            500

    },


    /* ========================================================
     * COMMON MESSAGES
     * ====================================================== */

    MESSAGE: {

        NETWORK_ERROR:
            "Không thể kết nối máy chủ.",

        SESSION_EXPIRED:
            "Phiên đăng nhập đã hết hạn.",

        LOGIN_SUCCESS:
            "Đăng nhập thành công.",

        LOGIN_FAILED:
            "Đăng nhập thất bại.",

        SAVE_SUCCESS:
            "Lưu thành công.",

        SAVE_FAILED:
            "Lưu thất bại.",

        SUBMIT_SUCCESS:
            "Nộp bài thành công.",

        SUBMIT_FAILED:
            "Không thể nộp bài.",

        UNKNOWN_ERROR:
            "Đã xảy ra lỗi không xác định."

    },


    /* ========================================================
     * DEBUG
     * ====================================================== */

    DEBUG: {

        ENABLE:
            false,

        API:
            false,

        UI:
            false,

        STORAGE:
            false,

        EXAM:
            false,

        TIMER:
            false,

        CACHE:
            false

    }

};


/* ============================================================
 * FREEZE + EXPORT
 * ========================================================== */

const CONFIG =
    deepFreeze(
        config
    );

export {
    CONFIG
};


/* ============================================================
 * HELPER
 * ========================================================== */

/**
 * Trả về URL Apps Script.
 *
 * @returns {string}
 */
export function getApiUrl() {

    return CONFIG.API.BASE_URL;

}


/**
 * Ghép BASE_URL với action.
 *
 * Ví dụ:
 *
 * https://script.google.com/macros/s/xxx/exec?action=login
 *
 * @param {string} action
 * @returns {string}
 */
export function getApiActionUrl(
    action
) {

    return (
        CONFIG.API.BASE_URL +
        "?action=" +
        encodeURIComponent(
            action
        )
    );

}


/**
 * Lấy khóa LocalStorage theo tên.
 *
 * @param {string} key
 * @returns {string|null}
 */
export function getStorageKey(
    key
) {

    return (
        CONFIG.STORAGE[key] ||
        null
    );

}
