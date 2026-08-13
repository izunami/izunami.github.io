/**
 * ============================================================
 * StudentExam v2.0
 * Utility Library
 * ============================================================
 *
 * Author  : Nguyễn Thuận
 * Version : 2.0.0
 *
 * File:
 * assets/js/utils.js
 *
 * Purpose:
 * - Type helpers
 * - String helpers
 * - Number helpers
 * - Object helpers
 * - UUID
 * - LocalStorage
 * - Session
 * - API GET / POST
 * - Authentication
 * - Student API
 * - Exam API
 * - Result API
 * - UI helpers
 *
 * IMPORTANT:
 * - Không hard-code API action.
 * - Không hard-code Storage Key.
 * - Mọi cấu hình lấy từ CONFIG.
 * - ID HTML phải tuân theo index.html chuẩn.
 * ============================================================
 */

import { CONFIG } from "./config.js";


/* ============================================================
 * UTILS
 * ============================================================ */

export class Utils {


    /* ========================================================
     * TYPE
     * ====================================================== */

    static Type = {

        isString(value) {

            return (
                typeof value === "string"
            );

        },


        isNumber(value) {

            return (
                typeof value === "number" &&
                Number.isFinite(value)
            );

        },


        isBoolean(value) {

            return (
                typeof value === "boolean"
            );

        },


        isArray(value) {

            return Array.isArray(value);

        },


        isObject(value) {

            return (
                value !== null &&
                typeof value === "object" &&
                !Array.isArray(value)
            );

        },


        isFunction(value) {

            return (
                typeof value === "function"
            );

        },


        isNull(value) {

            return (
                value === null
            );

        },


        isUndefined(value) {

            return (
                value === undefined
            );

        },


        isNullOrUndefined(value) {

            return (
                value === null ||
                value === undefined
            );

        }

    };


    /* ========================================================
     * OBJECT
     * ====================================================== */

    static Object = {

        clone(object) {

            if (
                object === null ||
                object === undefined
            ) {

                return object;

            }

            try {

                return JSON.parse(
                    JSON.stringify(object)
                );

            } catch (error) {

                console.warn(
                    "Utils.Object.clone:",
                    error
                );

                return null;

            }

        },


        isEmpty(object) {

            if (
                object === null ||
                object === undefined
            ) {

                return true;

            }

            if (
                !Utils.Type.isObject(object)
            ) {

                return false;

            }

            return (
                Object.keys(object).length === 0
            );

        }

    };


    /* ========================================================
     * NUMBER
     * ====================================================== */

    static Numbers = {

        toNumber(value) {

            const number =
                Number(value);

            return Number.isFinite(number)
                ? number
                : 0;

        },


        toInteger(value) {

            const number =
                Number.parseInt(
                    value,
                    10
                );

            return Number.isFinite(number)
                ? number
                : 0;

        },


        isInteger(value) {

            return Number.isInteger(
                value
            );

        },


        isPositive(value) {

            return (
                Utils.Type.isNumber(value) &&
                value > 0
            );

        },


        round(
            value,
            decimals = CONFIG.RESULT.DECIMAL
        ) {

            const number =
                Utils.Numbers.toNumber(
                    value
                );

            const factor =
                10 ** decimals;

            return (
                Math.round(
                    number * factor
                ) / factor
            );

        }

    };


    /* ========================================================
     * TEXT
     * ====================================================== */

    static Text = {

        trim(value) {

            if (
                value === null ||
                value === undefined
            ) {

                return "";

            }

            return String(value).trim();

        },


        upper(value) {

            return Utils.Text
                .trim(value)
                .toUpperCase();

        },


        lower(value) {

            return Utils.Text
                .trim(value)
                .toLowerCase();

        },


        isEmpty(value) {

            return (
                Utils.Text.trim(value).length === 0
            );

        },


        isNotEmpty(value) {

            return !Utils.Text.isEmpty(
                value
            );

        },


        toString(value) {

            if (
                value === null ||
                value === undefined
            ) {

                return "";

            }

            return String(value);

        },


        equalsIgnoreCase(
            a,
            b
        ) {

            return (
                Utils.Text.lower(a) ===
                Utils.Text.lower(b)
            );

        },


        safeJsonParse(
            value,
            fallback = null
        ) {

            if (
                value === null ||
                value === undefined ||
                value === ""
            ) {

                return fallback;

            }

            if (
                typeof value === "object"
            ) {

                return value;

            }

            try {

                return JSON.parse(
                    value
                );

            } catch (error) {

                console.warn(
                    "Utils.Text.safeJsonParse:",
                    error
                );

                return fallback;

            }

        },


        safeJsonStringify(
            value,
            fallback = ""
        ) {

            try {

                return JSON.stringify(
                    value
                );

            } catch (error) {

                console.warn(
                    "Utils.Text.safeJsonStringify:",
                    error
                );

                return fallback;

            }

        }

    };


    /* ========================================================
     * UUID
     * ====================================================== */

    static UUID = {

        create() {

            if (
                typeof crypto !== "undefined" &&
                typeof crypto.randomUUID === "function"
            ) {

                return crypto.randomUUID();

            }

            return (
                "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx"
            ).replace(
                /[xy]/g,
                function(character) {

                    const random =
                        Math.random() * 16 | 0;

                    const value =
                        character === "x"
                            ? random
                            : (
                                random & 0x3
                            ) | 0x8;

                    return value.toString(16);

                }
            );

        }

    };


    /* ========================================================
     * DOM
     * ====================================================== */

    static DOM = {

        get(id) {

            if (
                !id
            ) {

                return null;

            }

            return document.getElementById(
                id
            );

        },


        exists(id) {

            return (
                Utils.DOM.get(id) !== null
            );

        },


        setText(
            id,
            value = ""
        ) {

            const element =
                Utils.DOM.get(id);

            if (
                !element
            ) {

                return false;

            }

            element.textContent =
                Utils.Text.toString(
                    value
                );

            return true;

        },


        setHTML(
            id,
            html = ""
        ) {

            const element =
                Utils.DOM.get(id);

            if (
                !element
            ) {

                return false;

            }

            element.innerHTML =
                Utils.Text.toString(
                    html
                );

            return true;

        },


        show(id) {

            const element =
                Utils.DOM.get(id);

            if (
                !element
            ) {

                return false;

            }

            element.classList.remove(
                "d-none"
            );

            return true;

        },


        hide(id) {

            const element =
                Utils.DOM.get(id);

            if (
                !element
            ) {

                return false;

            }

            element.classList.add(
                "d-none"
            );

            return true;

        },


        toggle(
            id,
            show
        ) {

            return show
                ? Utils.DOM.show(id)
                : Utils.DOM.hide(id);

        },


        setValue(
            id,
            value = ""
        ) {

            const element =
                Utils.DOM.get(id);

            if (
                !element
            ) {

                return false;

            }

            element.value =
                value ?? "";

            return true;

        },


        getValue(id) {

            const element =
                Utils.DOM.get(id);

            if (
                !element
            ) {

                return "";

            }

            return element.value ?? "";

        },


        setDisabled(
            id,
            disabled = true
        ) {

            const element =
                Utils.DOM.get(id);

            if (
                !element
            ) {

                return false;

            }

            element.disabled =
                Boolean(disabled);

            return true;

        }

    };


    /* ========================================================
     * STORAGE
     * ====================================================== */

    static Storage = {

        get(key) {

            if (
                !key
            ) {

                return null;

            }

            try {

                return localStorage.getItem(
                    key
                );

            } catch (error) {

                console.warn(
                    "Utils.Storage.get:",
                    error
                );

                return null;

            }

        },


        set(
            key,
            value
        ) {

            if (
                !key
            ) {

                return false;

            }

            try {

                localStorage.setItem(
                    key,
                    String(value)
                );

                return true;

            } catch (error) {

                console.error(
                    "Utils.Storage.set:",
                    error
                );

                return false;

            }

        },


        remove(key) {

            if (
                !key
            ) {

                return false;

            }

            try {

                localStorage.removeItem(
                    key
                );

                return true;

            } catch (error) {

                console.error(
                    "Utils.Storage.remove:",
                    error
                );

                return false;

            }

        },


        getJSON(
            key,
            fallback = null
        ) {

            const raw =
                Utils.Storage.get(
                    key
                );

            return Utils.Text.safeJsonParse(
                raw,
                fallback
            );

        },


        setJSON(
            key,
            value
        ) {

            const raw =
                Utils.Text.safeJsonStringify(
                    value
                );

            if (
                !raw
            ) {

                return false;

            }

            return Utils.Storage.set(
                key,
                raw
            );

        },


        clear() {

            try {

                localStorage.clear();

                return true;

            } catch (error) {

                console.error(
                    "Utils.Storage.clear:",
                    error
                );

                return false;

            }

        }

    };


    /* ========================================================
     * SESSION
     * ====================================================== */

    static Session = {

        get() {

            return Utils.Storage.getJSON(
                CONFIG.STORAGE.LOGIN,
                null
            );

        },


        set(session) {

            if (
                !session ||
                typeof session !== "object"
            ) {

                return Utils.Session.clear();

            }

            const saved =
                Utils.Storage.setJSON(
                    CONFIG.STORAGE.LOGIN,
                    session
                );

            if (
                !saved
            ) {

                return false;

            }

            if (
                session.token ||
                session.loginKey
            ) {

                Utils.Storage.set(
                    CONFIG.STORAGE.TOKEN,
                    session.token ||
                    session.loginKey
                );

            }

            if (
                session.student
            ) {

                Utils.Storage.setJSON(
                    CONFIG.STORAGE.STUDENT,
                    session.student
                );

            }

            if (
                session.class
            ) {

                Utils.Storage.set(
                    CONFIG.STORAGE.CLASS,
                    session.class
                );

            }

            return true;

        },


        clear() {

            Utils.Storage.remove(
                CONFIG.STORAGE.LOGIN
            );

            Utils.Storage.remove(
                CONFIG.STORAGE.TOKEN
            );

            Utils.Storage.remove(
                CONFIG.STORAGE.STUDENT
            );

            Utils.Storage.remove(
                CONFIG.STORAGE.CLASS
            );

            Utils.Storage.remove(
                CONFIG.STORAGE.PROFILE
            );

            return true;

        },


        getToken() {

            const session =
                Utils.Session.get();

            if (
                session
            ) {

                const token =
                    Utils.Text.trim(
                        session.token ||
                        session.loginKey ||
                        session.studentToken ||
                        ""
                    );

                if (
                    token
                ) {

                    return token;

                }

            }

            return Utils.Text.trim(
                Utils.Storage.get(
                    CONFIG.STORAGE.TOKEN
                ) || ""
            );

        },


        isLoggedIn() {

            return (
                Utils.Session.getToken()
                    .length > 0
            );

        },


        validate() {

            const session =
                Utils.Session.get();

            const token =
                Utils.Session.getToken();

            if (
                !session ||
                !token
            ) {

                Utils.Session.clear();

                return false;

            }

            return true;

        }

    };


    /* ========================================================
     * API CORE
     * ====================================================== */

    static API = {

        async get(
            action,
            params = {}
        ) {

            if (
                !action
            ) {

                throw new Error(
                    "Thiếu action."
                );

            }

            const query =
                new URLSearchParams();

            query.set(
                "action",
                action
            );

            Object.entries(
                params
            ).forEach(
                ([key, value]) => {

                    if (
                        value === undefined ||
                        value === null
                    ) {

                        return;

                    }

                    if (
                        typeof value === "object"
                    ) {

                        query.set(
                            key,
                            JSON.stringify(value)
                        );

                    } else {

                        query.set(
                            key,
                            String(value)
                        );

                    }

                }
            );

            const url =
                CONFIG.API.BASE_URL +
                "?" +
                query.toString();

            return Utils.API.request(
                url,
                {
                    method: "GET"
                }
            );

        },


        async post(
            action,
            data = {}
        ) {

            if (
                !action
            ) {

                throw new Error(
                    "Thiếu action."
                );

            }

            const payload = {

                action,

                ...data

            };

            return Utils.API.request(
                CONFIG.API.BASE_URL,
                {

                    method:
                        "POST",

                    headers: {

                        "Content-Type":
                            "text/plain;charset=utf-8"

                    },

                    body:
                        JSON.stringify(
                            payload
                        )

                }
            );

        },


        async request(
            url,
            options = {}
        ) {

            const controller =
                new AbortController();

            const timeout =
                setTimeout(
                    () => {

                        controller.abort();

                    },
                    CONFIG.API.TIMEOUT
                );

            try {

                const response =
                    await fetch(
                        url,
                        {
                            ...options,
                            signal:
                                controller.signal
                        }
                    );

                if (
                    !response.ok
                ) {

                    throw new Error(
                        "HTTP " +
                        response.status
                    );

                }

                return await response.json();

            } catch (error) {

                if (
                    error.name ===
                    "AbortError"
                ) {

                    throw new Error(
                        "API request timeout."
                    );

                }

                throw error;

            } finally {

                clearTimeout(
                    timeout
                );

            }

        },


        checkResponse(response) {

            if (
                !response
            ) {

                throw new Error(
                    "API không trả về dữ liệu."
                );

            }

            if (
                response.success !== true
            ) {

                throw new Error(
                    response.message ||
                    CONFIG.MESSAGE.UNKNOWN_ERROR
                );

            }

            return response.data;

        }

    };


    /* ========================================================
     * AUTHENTICATION
     * ====================================================== */

    static Auth = {

        async login(studentId) {

            const id =
                Utils.Text.trim(
                    studentId
                );

            if (
                !id
            ) {

                throw new Error(
                    "Vui lòng nhập mã học sinh."
                );

            }

            const response =
                await Utils.API.get(
                    CONFIG.API.ACTION.LOGIN,
                    {
                        studentId:
                            id
                    }
                );

            const data =
                Utils.API.checkResponse(
                    response
                );

            if (
                !data ||
                !(
                    data.loginKey ||
                    data.token
                )
            ) {

                throw new Error(
                    "Đăng nhập không trả về Login Key."
                );

            }

            const token =
                Utils.Text.trim(
                    data.loginKey ||
                    data.token
                );

            const session = {

                token,

                loginKey:
                    token,

                student:
                    data.student ||
                    null,

                loginTime:
                    Date.now()

            };

            Utils.Session.set(
                session
            );

            return data;

        },


        logout() {

            Utils.Session.clear();

            return true;

        },


        checkSession() {

            if (
                !Utils.Session.validate()
            ) {

                return null;

            }

            return Utils.Session.get();

        },


        requireLogin() {

            const session =
                Utils.Auth.checkSession();

            if (
                !session
            ) {

                throw new Error(
                    CONFIG.MESSAGE.SESSION_EXPIRED
                );

            }

            return session;

        },


        getCurrentStudent() {

            const session =
                Utils.Session.get();

            if (
                !session
            ) {

                return null;

            }

            return (
                session.student ||
                Utils.Storage.getJSON(
                    CONFIG.STORAGE.STUDENT,
                    null
                )
            );

        },


        getCurrentStudentId() {

            const student =
                Utils.Auth.getCurrentStudent();

            if (
                !student
            ) {

                return "";

            }

            return Utils.Text.trim(
                student.id ||
                student.studentId ||
                ""
            );

        },


        getLoginKey() {

            return Utils.Session.getToken();

        },


        isCurrentStudent(studentId) {

            const currentId =
                Utils.Auth.getCurrentStudentId();

            const id =
                Utils.Text.trim(
                    studentId
                );

            if (
                !currentId ||
                !id
            ) {

                return false;

            }

            return (
                currentId === id
            );

        }

    };


    /* ========================================================
     * STUDENT API
     * ====================================================== */

    static Student = {

        async getClasses() {

            const response =
                await Utils.API.get(
                    CONFIG.API.ACTION.GET_CLASSES
                );

            return Utils.API.checkResponse(
                response
            );

        },


        async getStudents(
            className = ""
        ) {

            const params = {};

            if (
                Utils.Text.isNotEmpty(
                    className
                )
            ) {

                params.class =
                    Utils.Text.trim(
                        className
                    );

            }

            const response =
                await Utils.API.get(
                    CONFIG.API.ACTION.GET_STUDENTS,
                    params
                );

            return Utils.API.checkResponse(
                response
            );

        },


        /*
         * ====================================================
         * VERIFY STUDENT
         * ====================================================
         *
         * Dùng riêng cho luồng /kiemtra.
         *
         * Không gọi getStudents().
         * Xác thực:
         *
         * - Mã học sinh
         * - Họ tên
         * - Lớp
         * - Mật khẩu
         *
         * Backend trả về studentToken.
         * Token được lưu vào Session.
         */

async verifyStudent(
    studentId,
    name,
    className,
    password
) {

    const response =
        await Utils.API.get(
            CONFIG.API.ACTION.VERIFY_STUDENT,
            {
                studentId:
                    Utils.Text.trim(
                        studentId
                    ),

                name:
                    Utils.Text.trim(
                        name
                    ),

                class:
                    Utils.Text.trim(
                        className
                    ),

                password:
                    Utils.Text.trim(
                        password
                    )
            }
        );

    /*
     * API.checkResponse() trả về
     * chính xác response.data
     *
     * => {
     *      verified: true,
     *      studentToken: "...",
     *      student: {...}
     *    }
     */

    return Utils.API.checkResponse(
        response
    );

},


    /* ========================================================
     * DASHBOARD API
     * ====================================================== */

    static Dashboard = {

        async get() {

            const token =
                Utils.Session.getToken();

            if (
                !token
            ) {

                throw new Error(
                    CONFIG.MESSAGE.SESSION_EXPIRED
                );

            }

            const response =
                await Utils.API.get(
                    CONFIG.API.ACTION.GET_DASHBOARD,
                    {
                        token
                    }
                );

            return Utils.API.checkResponse(
                response
            );

        }

    };


    /* ========================================================
     * EXAM API
     * ====================================================== */

    static Exam = {

        async getList() {

            const token =
                Utils.Session.getToken();

            if (
                !token
            ) {

                throw new Error(
                    CONFIG.MESSAGE.SESSION_EXPIRED
                );

            }

            const response =
                await Utils.API.get(
                    CONFIG.API.ACTION.GET_EXAMS,
                    {
                        token
                    }
                );

            return Utils.API.checkResponse(
                response
            );

        },


        async get(
            examId
        ) {

            const token =
                Utils.Session.getToken();

            if (
                !token
            ) {

                throw new Error(
                    CONFIG.MESSAGE.SESSION_EXPIRED
                );

            }

            const id =
                Utils.Text.trim(
                    examId
                );

            if (
                !id
            ) {

                throw new Error(
                    "Thiếu mã bài kiểm tra."
                );

            }

            const response =
                await Utils.API.get(
                    CONFIG.API.ACTION.GET_EXAM,
                    {

                        token,

                        examId:
                            id

                    }
                );

            return Utils.API.checkResponse(
                response
            );

        },


        async submit(
            examId,
            answers,
            startTime = null,
            duration = 0
        ) {

            const token =
                Utils.Session.getToken();

            if (
                !token
            ) {

                throw new Error(
                    CONFIG.MESSAGE.SESSION_EXPIRED
                );

            }

            const id =
                Utils.Text.trim(
                    examId
                );

            if (
                !id
            ) {

                throw new Error(
                    "Thiếu mã bài kiểm tra."
                );

            }

            if (
                !Utils.Type.isObject(
                    answers
                )
            ) {

                throw new Error(
                    "Dữ liệu câu trả lời không hợp lệ."
                );

            }

            const payload = {

                token,

                examId:
                    id,

                answers

            };

            if (
                startTime !== null &&
                startTime !== undefined &&
                startTime !== ""
            ) {

                payload.startTime =
                    startTime;

            }

            if (
                duration !== null &&
                duration !== undefined
            ) {

                payload.duration =
                    duration;

            }

            const response =
                await Utils.API.post(
                    CONFIG.API.ACTION.SUBMIT_EXAM,
                    payload
                );

            return Utils.API.checkResponse(
                response
            );

        }

    };


    /* ========================================================
     * RESULT API
     * ====================================================== */

    static Result = {

        async getList() {

            const token =
                Utils.Session.getToken();

            if (
                !token
            ) {

                throw new Error(
                    CONFIG.MESSAGE.SESSION_EXPIRED
                );

            }

            const response =
                await Utils.API.get(
                    CONFIG.API.ACTION.GET_RESULTS,
                    {
                        token
                    }
                );

            return Utils.API.checkResponse(
                response
            );

        },


        async get(
            resultId
        ) {

            const token =
                Utils.Session.getToken();

            if (
                !token
            ) {

                throw new Error(
                    CONFIG.MESSAGE.SESSION_EXPIRED
                );

            }

            const id =
                Utils.Text.trim(
                    resultId
                );

            if (
                !id
            ) {

                throw new Error(
                    "Thiếu mã kết quả."
                );

            }

            const response =
                await Utils.API.get(
                    CONFIG.API.ACTION.GET_RESULT,
                    {

                        token,

                        resultId:
                            id

                    }
                );

            return Utils.API.checkResponse(
                response
            );

        }

    };


    /* ========================================================
     * CACHE
     * ====================================================== */

    static Cache = {

        get(
            key
        ) {

            return Utils.Storage.getJSON(
                key,
                null
            );

        },


        set(
            key,
            value
        ) {

            return Utils.Storage.setJSON(
                key,
                value
            );

        },


        remove(key) {

            return Utils.Storage.remove(
                key
            );

        },


        clearAppCache() {

            const keys = [

                CONFIG.STORAGE.DASHBOARD,

                CONFIG.STORAGE.EXAM,

                CONFIG.STORAGE.RESULT,

                CONFIG.STORAGE.CACHE

            ];

            keys.forEach(
                function(key) {

                    Utils.Storage.remove(
                        key
                    );

                }
            );

            return true;

        }

    };


    /* ========================================================
     * DATE / TIME
     * ====================================================== */

    static DateTime = {

        formatDate(
            date = new Date()
        ) {

            const value =
                date instanceof Date
                    ? date
                    : new Date(date);

            if (
                Number.isNaN(
                    value.getTime()
                )
            ) {

                return "";

            }

            return new Intl.DateTimeFormat(
                CONFIG.DATE.LOCALE,
                {

                    timeZone:
                        CONFIG.DATE.TIMEZONE,

                    day:
                        "2-digit",

                    month:
                        "2-digit",

                    year:
                        "numeric"

                }
            ).format(value);

        },


        formatDateTime(
            date = new Date()
        ) {

            const value =
                date instanceof Date
                    ? date
                    : new Date(date);

            if (
                Number.isNaN(
                    value.getTime()
                )
            ) {

                return "";

            }

            return new Intl.DateTimeFormat(
                CONFIG.DATE.LOCALE,
                {

                    timeZone:
                        CONFIG.DATE.TIMEZONE,

                    day:
                        "2-digit",

                    month:
                        "2-digit",

                    year:
                        "numeric",

                    hour:
                        "2-digit",

                    minute:
                        "2-digit",

                    second:
                        "2-digit",

                    hour12:
                        false

                }
            ).format(value);

        }

    };


    /* ========================================================
     * SESSION ERROR HANDLING
     * ======================================================== */

    static handleSessionExpired(
        response
    ) {

        let message = "";

        if (
            response &&
            typeof response === "object"
        ) {

            message =
                Utils.Text.trim(
                    response.message ||
                    ""
                );

        } else {

            message =
                Utils.Text.trim(
                    response
                );

        }

        const normalized =
            message.toLowerCase();

        const expired = [

            "phiên đăng nhập đã hết hạn.",

            "phiên đăng nhập đã hết hạn",

            "session expired",

            "unauthorized"

        ];

        const isExpired =
            expired.includes(
                normalized
            );

        if (
            isExpired
        ) {

            Utils.Auth.logout();

            return true;

        }

        return false;

    }


    /* ========================================================
     * BACKWARD-COMPATIBILITY ALIASES
     * ========================================================
     *
     * Chỉ giữ các alias cần thiết để tránh
     * làm hỏng module cũ trong quá trình chuyển đổi.
     * ======================================================== */

    static getSession() {

        return Utils.Session.get();

    }


    static setSession(session) {

        return Utils.Session.set(
            session
        );

    }


    static clearSession() {

        return Utils.Session.clear();

    }


    static getToken() {

        return Utils.Session.getToken();

    }


    static isLoggedIn() {

        return Utils.Session.isLoggedIn();

    }


    static login(studentId) {

        return Utils.Auth.login(
            studentId
        );

    }


    static logout() {

        return Utils.Auth.logout();

    }


    static checkSession() {

        return Utils.Auth.checkSession();

    }


    static requireSession() {

        return Utils.Auth.requireLogin();

    }


    static getCurrentStudent() {

        return Utils.Auth.getCurrentStudent();

    }


    static getCurrentStudentId() {

        return Utils.Auth.getCurrentStudentId();

    }


    static getLoginKey() {

        return Utils.Auth.getLoginKey();

    }


    static isCurrentStudent(
        studentId
    ) {

        return Utils.Auth.isCurrentStudent(
            studentId
        );

    }


    static apiGet(
        action,
        params = {}
    ) {

        return Utils.API.get(
            action,
            params
        );

    }


    static apiPost(
        action,
        data = {}
    ) {

        return Utils.API.post(
            action,
            data
        );

    }


    static apiCheckResponse(
        response
    ) {

        return Utils.API.checkResponse(
            response
        );

    }


    static getDashboard() {

        return Utils.Dashboard.get();

    }


    static getExams() {

        return Utils.Exam.getList();

    }


    static getExam(
        examId
    ) {

        return Utils.Exam.get(
            examId
        );

    }


    static submitExam(
        examId,
        answers,
        startTime = null,
        duration = 0
    ) {

        return Utils.Exam.submit(
            examId,
            answers,
            startTime,
            duration
        );

    }


    static getResults() {

        return Utils.Result.getList();

    }


    static getResult(
        resultId
    ) {

        return Utils.Result.get(
            resultId
        );

    }

}


/* ============================================================
 * EXPORT
 * ============================================================ */

export default Utils;
