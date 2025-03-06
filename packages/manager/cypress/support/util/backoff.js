"use strict";
/**
 * @file Utilities to handle retries with configurable backoff logic.
 */
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FibonacciBackoffMethod = exports.SimpleBackoffMethod = exports.BackoffMethod = exports.attemptWithBackoff = exports.defaultBackoffOptions = exports.timeout = void 0;
/**
 * Promise that waits a given number of milliseconds before resolving.
 *
 * @param timeout - Timeout in milliseconds.
 *
 * @returns Promise that resolves when timeout has passed.
 */
var timeout = function (timeout) {
    return new Promise(function (resolve) { return setTimeout(resolve, timeout); });
};
exports.timeout = timeout;
// Util to calculate fibonacci number for a given index.
var fibonacci = function (index) {
    if (index <= 1) {
        return 1;
    }
    return fibonacci(index - 1) + fibonacci(index - 2);
};
/**
 * Default backoff method options.
 */
exports.defaultBackoffOptions = {
    initialDelay: 0,
    maxAttempts: 10,
};
/**
 * Attempts to resolve a Promise using a given backoff method to limit and delay attempts.
 *
 * @param backoffMethod - Backoff method to use to calculate delay between attempts.
 * @param promiseCallback - Callback to generate Promise to attempt to resolve.
 *
 * @returns Promise that resolves when `promiseCallback` Promise succeeds, or rejects after a given number of attempts.
 */
var attemptWithBackoff = function (backoffMethod, promiseCallback) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, initialDelay, maxAttempts, attemptErrors, attempt, nextAttempt, e_1, backoffTime, errorMessage;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _a = backoffMethod.options, initialDelay = _a.initialDelay, maxAttempts = _a.maxAttempts;
                attemptErrors = [];
                if (!initialDelay) return [3 /*break*/, 2];
                return [4 /*yield*/, (0, exports.timeout)(initialDelay)];
            case 1:
                _b.sent();
                _b.label = 2;
            case 2:
                attempt = 1;
                _b.label = 3;
            case 3:
                if (!(attempt <= maxAttempts)) return [3 /*break*/, 10];
                nextAttempt = attempt + 1;
                _b.label = 4;
            case 4:
                _b.trys.push([4, 6, , 9]);
                return [4 /*yield*/, promiseCallback()];
            case 5: return [2 /*return*/, _b.sent()];
            case 6:
                e_1 = _b.sent();
                attemptErrors.push(e_1);
                if (!(nextAttempt <= maxAttempts)) return [3 /*break*/, 8];
                backoffTime = backoffMethod.calculateBackoff(nextAttempt);
                return [4 /*yield*/, (0, exports.timeout)(backoffTime)];
            case 7:
                _b.sent();
                _b.label = 8;
            case 8: return [3 /*break*/, 9];
            case 9:
                attempt++;
                return [3 /*break*/, 3];
            case 10:
                errorMessage = attemptErrors.reduce(function (acc, cur, index) {
                    return "".concat(acc, "\n\nAttempt #").concat(index + 1, ":\n").concat(cur);
                }, "Failed to resolve promise after ".concat(maxAttempts, " attempt(s):"));
                throw new Error(errorMessage);
        }
    });
}); };
exports.attemptWithBackoff = attemptWithBackoff;
/**
 * Calculates backoff time when retrying an attempt to do something.
 */
var BackoffMethod = /** @class */ (function () {
    /**
     * Constructor.
     *
     * @param options - Backoff method options.
     */
    function BackoffMethod(options) {
        this.options = __assign(__assign({}, exports.defaultBackoffOptions), (options || {}));
    }
    return BackoffMethod;
}());
exports.BackoffMethod = BackoffMethod;
/**
 * Calculates backoff time using a constant interval between attempts.
 */
var SimpleBackoffMethod = /** @class */ (function (_super) {
    __extends(SimpleBackoffMethod, _super);
    /**
     * Constructor.
     *
     * @param timeout - Timeout between each attempt, milliseconds.
     * @param options - Backoff method options.
     */
    function SimpleBackoffMethod(timeout, options) {
        var _this = _super.call(this, options) || this;
        _this.timeout = timeout;
        return _this;
    }
    /**
     * Returns the same backoff timeout for every attempt.
     *
     * @returns Backoff timeout (in milliseconds) corresponding to the value of `timeout`.
     */
    SimpleBackoffMethod.prototype.calculateBackoff = function (_attempt) {
        return this.timeout;
    };
    return SimpleBackoffMethod;
}(BackoffMethod));
exports.SimpleBackoffMethod = SimpleBackoffMethod;
/**
 * Calculates backoff time using Fibonacci sequence.
 */
var FibonacciBackoffMethod = /** @class */ (function (_super) {
    __extends(FibonacciBackoffMethod, _super);
    /**
     * Constructor.
     *
     * @param options - Backoff method options.
     * @param maxTimeout - Optional maximum backoff timeout (in milliseconds).
     * @param offset - Fibonacci starting index; useful for increasing delay between attempts.
     */
    function FibonacciBackoffMethod(options, maxTimeout, offset) {
        if (maxTimeout === void 0) { maxTimeout = undefined; }
        if (offset === void 0) { offset = 0; }
        var _this = _super.call(this, options) || this;
        _this.maxTimeout = maxTimeout;
        _this.offset = offset;
        return _this;
    }
    /**
     * Returns backoff derived from Fibonacci sequence.
     *
     * @returns Backoff timeout (in milliseconds) from Fibonacci sequence.
     */
    FibonacciBackoffMethod.prototype.calculateBackoff = function (attempt) {
        var fibonacciTimeout = fibonacci(attempt + this.offset) * 1000;
        return !!this.maxTimeout
            ? Math.min(fibonacciTimeout, this.maxTimeout)
            : fibonacciTimeout;
    };
    return FibonacciBackoffMethod;
}(BackoffMethod));
exports.FibonacciBackoffMethod = FibonacciBackoffMethod;
