import { CONFIG } from "./config.js";

export class Utils {

    /* ========================================================
     * Type
     * ====================================================== */

    static Type = {

        isString(value) {
            return typeof value === "string";
        },

        isNumber(value) {
            return typeof value === "number"
                && !Number.isNaN(value);
        },

        isBoolean(value) {
            return typeof value === "boolean";
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
            return typeof value === "function";
        },

        isNull(value) {
            return value === null;
        },

        isUndefined(value) {
            return value === undefined;
        },

        isNullOrUndefined(value) {
            return (
                value === null ||
                value === undefined
            );
        }

    };


    /* ========================================================
     * Object
     * ====================================================== */

    static Object = {

        clone(obj) {

            if (
                obj === null ||
                obj === undefined
            ) {
                return obj;
            }

            return JSON.parse(
                JSON.stringify(obj)
            );

        },

        isEmpty(obj) {

            if (
                obj === null ||
                obj === undefined
            ) {
                return true;
            }

            return (
                Object.keys(obj).length === 0
            );

        }

    };


    /* ========================================================
     * Number
     * ====================================================== */

    static Numbers = {

        toNumber(value) {

            const number =
                Number(value);

            return Number.isNaN(number)
                ? 0
                : number;

        },

        toInteger(value) {

            const number =
                parseInt(value, 10);

            return Number.isNaN(number)
                ? 0
                : number;

        },

        isInteger(value) {

            return Number.isInteger(
                value
            );

        },

        isPositive(value) {

            return (
                typeof value === "number" &&
                !Number.isNaN(value) &&
                value > 0
            );

        }

    };


    /* ========================================================
     * UUID
     * ====================================================== */

    static UUID = {

        create() {

            if (
                typeof crypto !== "undefined" &&
                crypto.randomUUID
            ) {

                return crypto.randomUUID();

            }

            return (
                "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx"
            ).replace(
                /[xy]/g,
                function(c) {

                    const r =
                        Math.random() * 16 | 0;

                    const v =
                        c === "x"
                            ? r
                            : (r & 0x3 | 0x8);

                    return v.toString(16);

                }
            );

        }

    };

    /* ========================================================
     * String
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
                Utils.Text
                    .trim(value)
                    .length === 0
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


        safeJsonParse(value, fallback = null) {

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
                    "safeJsonParse:",
                    error
                );

                return fallback;

            }

        },


        safeJsonStringify(value, fallback = "") {

            try {

                return JSON.stringify(
                    value
                );

            } catch (error) {

                console.warn(
                    "safeJsonStringify:",
                    error
                );

                return fallback;

            }

        }

    };

    /* ========================================================
     * API CORE
     * ====================================================== */

    /**
     * Gọi API bằng GET
     *
     * @param {string} action
     * @param {Object} params
     * @returns {Promise<Object>}
     */
    static async apiGet(
        action,
        params = {}
    ) {

        if (!action) {

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

        Object.keys(
            params
        ).forEach(
            function(key) {

                const value =
                    params[key];

                if (
                    value !== undefined &&
                    value !== null
                ) {

                    /*
                     * Object / Array:
                     * chuyển thành JSON.
                     *
                     * Ví dụ:
                     * answers = {
                     *     "1": "B",
                     *     "2": "B"
                     * }
                     */

                    if (
                        typeof value === "object"
                    ) {

                        query.set(
                            key,
                            JSON.stringify(
                                value
                            )
                        );

                    } else {

                        query.set(
                            key,
                            String(value)
                        );

                    }

                }

            }
        );

        const url =
            CONFIG.API.BASE_URL +
            "?" +
            query.toString();

        const controller =
            new AbortController();

        const timeout =
            setTimeout(
                function() {

                    controller.abort();

                },
                CONFIG.API.TIMEOUT
            );

        try {

            const response =
                await fetch(
                    url,
                    {
                        method:
                            "GET",

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

            const result =
                await response.json();

            return result;

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

    }


    /**
     * Gọi API bằng POST
     *
     * @param {string} action
     * @param {Object} data
     * @returns {Promise<Object>}
     */
    static async apiPost(
        action,
        data = {}
    ) {

        if (!action) {

            throw new Error(
                "Thiếu action."
            );

        }

        const controller =
            new AbortController();

        const timeout =
            setTimeout(
                function() {

                    controller.abort();

                },
                CONFIG.API.TIMEOUT
            );

        try {

            const payload = {

                action:
                    action,

                ...data

            };

            const response =
                await fetch(
                    CONFIG.API.BASE_URL,
                    {
                        method:
                            "POST",

                        /*
                         * Dùng text/plain để tránh
                         * preflight CORS của Google Apps Script.
                         */
                        headers: {

                            "Content-Type":
                                "text/plain;charset=utf-8"

                        },

                        body:
                            JSON.stringify(
                                payload
                            ),

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

            const result =
                await response.json();

            return result;

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

    }


    /**
     * Kiểm tra response API
     *
     * @param {Object} response
     * @returns {*}
     */
    static apiCheckResponse(
        response
    ) {

        if (!response) {

            throw new Error(
                "API không trả về dữ liệu."
            );

        }

        if (
            response.success !== true
        ) {

            throw new Error(
                response.message ||
                "API request thất bại."
            );

        }

        return response.data;

    }

        /* ========================================================
     * SESSION
     * ====================================================== */

    static SESSION_KEY =
        "studentExamSession";


    /**
     * Lấy session hiện tại
     *
     * @returns {Object|null}
     */
    static getSession() {

        try {

            const raw =
                localStorage.getItem(
                    Utils.SESSION_KEY
                );

            if (!raw) {

                return null;

            }

            const session =
                JSON.parse(
                    raw
                );

            if (
                !session ||
                typeof session !== "object"
            ) {

                return null;

            }

            return session;

        } catch (error) {

            console.error(
                "Không đọc được session:",
                error
            );

            return null;

        }

    }


    /**
     * Lưu session
     *
     * @param {Object} session
     */
    static setSession(
        session
    ) {

        if (
            !session ||
            typeof session !== "object"
        ) {

            Utils.clearSession();

            return;

        }

        try {

            localStorage.setItem(
                Utils.SESSION_KEY,
                JSON.stringify(
                    session
                )
            );

        } catch (error) {

            console.error(
                "Không lưu được session:",
                error
            );

        }

    }


    /**
     * Xóa session
     */
    static clearSession() {

        try {

            localStorage.removeItem(
                Utils.SESSION_KEY
            );

        } catch (error) {

            console.error(
                "Không xóa được session:",
                error
            );

        }

    }


    /**
     * Lấy session token
     *
     * Hỗ trợ:
     * - token
     * - loginKey
     *
     * @returns {string}
     */
    static getToken() {

        const session =
            Utils.getSession();

        if (!session) {

            return "";

        }

        return (
            Utils.Text.trim(
                session.token ||
                session.loginKey ||
                ""
            )
        );

    }


    /**
     * Kiểm tra đã đăng nhập hay chưa
     *
     * @returns {boolean}
     */
    static isLoggedIn() {

        return (
            Utils.getToken()
                .length > 0
        );

    }

        /* ========================================================
     * STUDENT API
     * ====================================================== */

    /**
     * Lấy dashboard học sinh
     *
     * @returns {Promise<Object>}
     */
    static async getDashboard() {

        const token =
            Utils.getToken();

        if (!token) {

            throw new Error(
                "Phiên đăng nhập đã hết hạn."
            );

        }

        const response =
            await Utils.apiGet(
                "getDashboard",
                {
                    token:
                        token
                }
            );

        return Utils.apiCheckResponse(
            response
        );

    }


    /**
     * Lấy danh sách bài kiểm tra
     *
     * @returns {Promise<Array>}
     */
    static async getExams() {

        const token =
            Utils.getToken();

        if (!token) {

            throw new Error(
                "Phiên đăng nhập đã hết hạn."
            );

        }

        const response =
            await Utils.apiGet(
                "getExams",
                {
                    token:
                        token
                }
            );

        return Utils.apiCheckResponse(
            response
        );

    }


    /**
     * Lấy đề thi
     *
     * @param {string} examId
     * @returns {Promise<Object>}
     */
    static async getExam(
        examId
    ) {

        const token =
            Utils.getToken();

        if (!token) {

            throw new Error(
                "Phiên đăng nhập đã hết hạn."
            );

        }

        if (!examId) {

            throw new Error(
                "Thiếu mã bài kiểm tra."
            );

        }

        const response =
            await Utils.apiGet(
                "getExam",
                {
                    token:
                        token,

                    examId:
                        examId
                }
            );

        return Utils.apiCheckResponse(
            response
        );

    }


    /**
     * Nộp bài kiểm tra
     *
     * @param {string} examId
     * @param {Object} answers
     * @param {string|null} startTime
     * @param {number} duration
     * @returns {Promise<Object>}
     */
    static async submitExam(
        examId,
        answers,
        startTime = null,
        duration = 0
    ) {

        const token =
            Utils.getToken();

        if (!token) {

            throw new Error(
                "Phiên đăng nhập đã hết hạn."
            );

        }

        if (!examId) {

            throw new Error(
                "Thiếu mã bài kiểm tra."
            );

        }

        if (
            !answers ||
            typeof answers !== "object" ||
            Array.isArray(answers)
        ) {

            throw new Error(
                "Dữ liệu câu trả lời không hợp lệ."
            );

        }

        const payload = {

            token:
                token,

            examId:
                examId,

            answers:
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
            await Utils.apiPost(
                "submitExam",
                payload
            );

        return Utils.apiCheckResponse(
            response
        );

    }


    /**
     * Lấy danh sách kết quả
     *
     * @returns {Promise<Array>}
     */
    static async getResults() {

        const token =
            Utils.getToken();

        if (!token) {

            throw new Error(
                "Phiên đăng nhập đã hết hạn."
            );

        }

        const response =
            await Utils.apiGet(
                "getResults",
                {
                    token:
                        token
                }
            );

        return Utils.apiCheckResponse(
            response
        );

    }


    /**
     * Lấy một kết quả cụ thể
     *
     * @param {string} resultId
     * @returns {Promise<Object>}
     */
    static async getResult(
        resultId
    ) {

        const token =
            Utils.getToken();

        if (!token) {

            throw new Error(
                "Phiên đăng nhập đã hết hạn."
            );

        }

        if (!resultId) {

            throw new Error(
                "Thiếu mã kết quả."
            );

        }

        const response =
            await Utils.apiGet(
                "getResult",
                {
                    token:
                        token,

                    resultId:
                        resultId
                }
            );

        return Utils.apiCheckResponse(
            response
        );

    }

    /* ============================================================
    * AUTH / LOGIN API
    * ============================================================ */

    /**
     * Đăng nhập học sinh.
    *
    * Backend:
    * action=login
    * studentId=HS001
    *
    * @param {string} studentId
          * @returns {Promise<Object>}
     */
    static async login(
      studentId
    ) {

      const id =
          Utils.Text.trim(
                studentId
         );

        if (!id) {

           throw new Error(
            "Vui lòng nhập mã học sinh."
           );

     }

        const response =
            await Utils.apiGet(
                "login",
                {
                    studentId:
                        id
                }
            );

        const data =
         Utils.apiCheckResponse(
               response
         );

        /*
        * Backend trả:
        *
        * {
        *   loginKey: "...",
         *   student: {
        *       id: "...",
        *       name: "...",
        *       class: "..."
        *   }
        * }
         */

     if (
          !data ||
         !data.loginKey
     ) {

         throw new Error(
             "Đăng nhập không trả về Login Key."
         );

     }

        /*
         * Lưu Login Key.
        */

     Utils.setSession({

           token:
             data.loginKey,

          loginKey:
                data.loginKey,

          student:
             data.student || null

      });

     return data;

    }


    /**
     * Đăng xuất học sinh.
     *
     * Backend hiện tại chưa có API logout.
     *
     * Vì vậy frontend chỉ xóa session
    * ở trình duyệt.
    *
     * @returns {boolean}
    */
    static logout() {

     Utils.clearSession();

     return true;

    }


    /**
    * Kiểm tra session hiện tại.
    *
    * Không gọi API.
    * Chỉ kiểm tra session local.
    *
    * @returns {Object|null}
    */
    static checkSession() {

     const session =
         Utils.getSession();

     if (
         !session
     ) {

            return null;

     }

     const token =
          Utils.Text.trim(
             session.token ||
             session.loginKey
            );

     if (!token) {

           Utils.clearSession();

         return null;

     }

     return session;

    }


    /**
     * Yêu cầu session hợp lệ.
    *
    * Dùng ở các màn hình cần đăng nhập.
    *
     * @returns {Object}
    */
    static requireSession() {

     const session =
            Utils.checkSession();

     if (!session) {

         throw new Error(
             "Phiên đăng nhập đã hết hạn."
         );

        }

     return session;

    }


    /**
    * Lấy thông tin học sinh đang đăng nhập.
    *
    * @returns {Object|null}
    */
    static getCurrentStudent() {

      const session =
         Utils.getSession();

     if (
            !session
     ) {

         return null;

     }

     return (
           session.student ||
            null
        );

    }


    /**
    * Lấy mã học sinh hiện tại.
    *
    * @returns {string}
    */
    static getCurrentStudentId() {

     const student =
            Utils.getCurrentStudent();

     if (
         !student
     ) {

         return "";

     }

     return Utils.Text.trim(
         student.id
     );

    }

    /* ========================================================
     * SESSION / UI HELPERS
     * ====================================================== */


    /**
     * Kiểm tra session có token hợp lệ hay không.
     *
     * @returns {boolean}
     */
    static hasSession() {

        const token =
            Utils.getToken();

        return (
            typeof token === "string" &&
            token.trim() !== ""
        );

    }


    /**
     * Kiểm tra session và tự xóa
     * nếu session không hợp lệ.
     *
     * @returns {boolean}
     */
    static validateSession() {

        const session =
            Utils.checkSession();

        if (!session) {

            return false;

        }

        return true;

    }


    /**
     * Xử lý session hết hạn.
     *
     * Dùng khi API trả về:
     *
     * "Phiên đăng nhập đã hết hạn."
     *
     * @param {Object|string|null} response
     * @returns {boolean}
     */
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

        } else if (
            typeof response === "string"
        ) {

            message =
                Utils.Text.trim(
                    response
                );

        }

        const expiredMessages = [

            "Phiên đăng nhập đã hết hạn.",

            "Phiên đăng nhập đã hết hạn",

            "Session expired",

            "Unauthorized"

        ];

        const isExpired =
            expiredMessages.some(
                function(item) {

                    return (
                        message
                            .toLowerCase() ===
                        item
                            .toLowerCase()
                    );

                }
            );

        if (
            isExpired
        ) {

            Utils.clearSession();

            return true;

        }

        return false;

    }


    /**
     * Yêu cầu người dùng phải đăng nhập.
     *
     * Hàm này không tự chuyển trang.
     *
     * @returns {Object}
     */
    static requireLogin() {

        const session =
            Utils.checkSession();

        if (!session) {

            throw new Error(
                "Vui lòng đăng nhập."
            );

        }

        return session;

    }


    /**
     * Lấy Login Key hiện tại.
     *
     * Alias của getToken().
     *
     * @returns {string}
     */
    static getLoginKey() {

        return Utils.getToken();

    }


    /**
     * Kiểm tra session có phải của
     * một học sinh cụ thể hay không.
     *
     * @param {string} studentId
     * @returns {boolean}
     */
    static isCurrentStudent(
        studentId
    ) {

        const currentId =
            Utils.getCurrentStudentId();

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


    /**
     * Xóa session và trả về trạng thái.
     *
     * @returns {boolean}
     */
    static resetSession() {

        Utils.clearSession();

        return (
            !Utils.hasSession()
        );

    }

}
