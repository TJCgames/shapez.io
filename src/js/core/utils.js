import { globalConfig, IS_DEBUG } from "./config";
import { Vector } from "./vector";
import { T } from "../translations";

// Constants
export const TOP = new Vector(0, -1);
export const RIGHT = new Vector(1, 0);
export const BOTTOM = new Vector(0, 1);
export const LEFT = new Vector(-1, 0);
export const ALL_DIRECTIONS = [TOP, RIGHT, BOTTOM, LEFT];

const bigNumberSuffixTranslationKeys = ["thousands", "millions", "billions", "trillions"];

/**
 * Returns the build id
 * @returns {string}
 */
export function getBuildId() {
    if (G_IS_DEV && IS_DEBUG) {
        return "local-dev";
    } else if (G_IS_DEV) {
        return "dev-" + getPlatformName() + "-" + G_BUILD_COMMIT_HASH;
    } else {
        return "prod-" + getPlatformName() + "-" + G_BUILD_COMMIT_HASH;
    }
}

/**
 * Returns the environment id (dev, prod, etc)
 * @returns {string}
 */
export function getEnvironmentId() {
    if (G_IS_DEV && IS_DEBUG) {
        return "local-dev";
    } else if (G_IS_DEV) {
        return "dev-" + getPlatformName();
    } else if (G_IS_RELEASE) {
        return "release-" + getPlatformName();
    } else {
        return "staging-" + getPlatformName();
    }
}

/**
 * Returns if this platform is android
 * @returns {boolean}
 */
export function isAndroid() {
    if (!G_IS_MOBILE_APP) {
        return false;
    }
    const platform = window.device.platform;
    return platform === "Android" || platform === "amazon-fireos";
}

/**
 * Returns if this platform is iOs
 * @returns {boolean}
 */
export function isIos() {
    if (!G_IS_MOBILE_APP) {
        return false;
    }
    return window.device.platform === "iOS";
}

/**
 * Returns a platform name
 * @returns {string}
 */
export function getPlatformName() {
    if (G_IS_STANDALONE) {
        return "standalone";
    } else if (G_IS_BROWSER) {
        return "browser";
    } else if (G_IS_MOBILE_APP && isAndroid()) {
        return "android";
    } else if (G_IS_MOBILE_APP && isIos()) {
        return "ios";
    }
    return "unknown";
}

/**
 * Returns the IPC renderer, or null if not within the standalone
 * @returns {object|null}
 */
let ipcRenderer = null;
export function getIPCRenderer() {
    if (!G_IS_STANDALONE) {
        return null;
    }
    if (!ipcRenderer) {
        ipcRenderer = eval("require")("electron").ipcRenderer;
    }
    return ipcRenderer;
}

/**
 * Formats a sensitive token by only displaying the first digits of it. Use for
 * stuff like savegame keys etc which should not appear in the log.
 * @param {string} key
 */
export function formatSensitive(key) {
    if (!key) {
        return "<null>";
    }
    key = key || "";
    return "[" + key.substr(0, 8) + "...]";
}

/**
 * Creates a new 2D array with the given fill method
 * @param {number} w Width
 * @param {number} h Height
 * @param {(function(number, number) : any) | number | boolean | string | null | undefined} filler Either Fill method, which should return the content for each cell, or static content
 * @param {string=} context Optional context for memory tracking
 * @returns {Array<Array<any>>}
 */
export function make2DArray(w, h, filler, context = null) {
    if (typeof filler === "function") {
        const tiles = new Array(w);
        for (let x = 0; x < w; ++x) {
            const row = new Array(h);
            for (let y = 0; y < h; ++y) {
                row[y] = filler(x, y);
            }
            tiles[x] = row;
        }
        return tiles;
    } else {
        const tiles = new Array(w);
        const row = new Array(h);
        for (let y = 0; y < h; ++y) {
            row[y] = filler;
        }

        for (let x = 0; x < w; ++x) {
            tiles[x] = row.slice();
        }
        return tiles;
    }
}

/**
 * Makes a new 2D array with undefined contents
 * @param {number} w
 * @param {number} h
 * @param {string=} context
 * @returns {Array<Array<any>>}
 */
export function make2DUndefinedArray(w, h, context = null) {
    const result = new Array(w);
    for (let x = 0; x < w; ++x) {
        result[x] = new Array(h);
    }
    return result;
}

/**
 * Clears a given 2D array with the given fill method
 * @param {Array<Array<any>>} array
 * @param {number} w Width
 * @param {number} h Height
 * @param {(function(number, number) : any) | number | boolean | string | null | undefined} filler Either Fill method, which should return the content for each cell, or static content
 */
export function clear2DArray(array, w, h, filler) {
    assert(array.length === w, "Array dims mismatch w");
    assert(array[0].length === h, "Array dims mismatch h");
    if (typeof filler === "function") {
        for (let x = 0; x < w; ++x) {
            const row = array[x];
            for (let y = 0; y < h; ++y) {
                row[y] = filler(x, y);
            }
        }
    } else {
        for (let x = 0; x < w; ++x) {
            const row = array[x];
            for (let y = 0; y < h; ++y) {
                row[y] = filler;
            }
        }
    }
}

/**
 * Creates a new map (an empty object without any props)
 */
export function newEmptyMap() {
    return Object.create(null);
}

/**
 * Returns a random integer in the range [start,end]
 * @param {number} start
 * @param {number} end
 */
export function randomInt(start, end) {
    return start + Math.round(Math.random() * (end - start));
}

/**
 * Access an object in a very annoying way, used for obsfuscation.
 * @param {any} obj
 * @param {Array<string>} keys
 */
export function accessNestedPropertyReverse(obj, keys) {
    let result = obj;
    for (let i = keys.length - 1; i >= 0; --i) {
        result = result[keys[i]];
    }
    return result;
}

/**
 * Chooses a random entry of an array
 * @param {Array | string} arr
 */
export function randomChoice(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Deletes from an array by swapping with the last element
 * @param {Array<any>} array
 * @param {number} index
 */
export function fastArrayDelete(array, index) {
    if (index < 0 || index >= array.length) {
        throw new Error("Out of bounds");
    }
    // When the element is not the last element
    if (index !== array.length - 1) {
        // Get the last element, and swap it with the one we want to delete
        const last = array[array.length - 1];
        array[index] = last;
    }

    // Finally remove the last element
    array.length -= 1;
}

/**
 * Deletes from an array by swapping with the last element. Searches
 * for the value in the array first
 * @param {Array<any>} array
 * @param {any} value
 */
export function fastArrayDeleteValue(array, value) {
    if (array == null) {
        throw new Error("Tried to delete from non array!");
    }
    const index = array.indexOf(value);
    if (index < 0) {
        console.error("Value", value, "not contained in array:", array, "!");
        return value;
    }
    return fastArrayDelete(array, index);
}

/**
 * @see fastArrayDeleteValue
 * @param {Array<any>} array
 * @param {any} value
 */
export function fastArrayDeleteValueIfContained(array, value) {
    if (array == null) {
        throw new Error("Tried to delete from non array!");
    }
    const index = array.indexOf(value);
    if (index < 0) {
        return value;
    }
    return fastArrayDelete(array, index);
}

/**
 * Deletes from an array at the given index
 * @param {Array<any>} array
 * @param {number} index
 */
export function arrayDelete(array, index) {
    if (index < 0 || index >= array.length) {
        throw new Error("Out of bounds");
    }
    array.splice(index, 1);
}

/**
 * Deletes the given value from an array
 * @param {Array<any>} array
 * @param {any} value
 */
export function arrayDeleteValue(array, value) {
    if (array == null) {
        throw new Error("Tried to delete from non array!");
    }
    const index = array.indexOf(value);
    if (index < 0) {
        console.error("Value", value, "not contained in array:", array, "!");
        return value;
    }
    return arrayDelete(array, index);
}

// Converts a direction into a 0 .. 7 index
/**
 * Converts a direction into a index from 0 .. 7, used for miners, zombies etc which have 8 sprites
 * @param {Vector} offset direction
 * @param {boolean} inverse if inverse, the direction is reversed
 * @returns {number} in range [0, 7]
 */
export function angleToSpriteIndex(offset, inverse = false) {
    const twoPi = 2.0 * Math.PI;
    const factor = inverse ? -1 : 1;
    const offs = inverse ? 2.5 : 3.5;
    const angle = (factor * Math.atan2(offset.y, offset.x) + offs * Math.PI) % twoPi;

    const index = Math.round((angle / twoPi) * 8) % 8;
    return index;
}

/**
 * Compare two floats for epsilon equality
 * @param {number} a
 * @param {number} b
 * @returns {boolean}
 */
export function epsilonCompare(a, b, epsilon = 1e-5) {
    return Math.abs(a - b) < epsilon;
}

/**
 * Compare a float for epsilon equal to 0
 * @param {number} a
 * @returns {boolean}
 */
export function epsilonIsZero(a) {
    return epsilonCompare(a, 0);
}

/**
 * Interpolates two numbers
 * @param {number} a
 * @param {number} b
 * @param {number} x Mix factor, 0 means 100% a, 1 means 100%b, rest is interpolated
 */
export function lerp(a, b, x) {
    return a * (1 - x) + b * x;
}

/**
 * Finds a value which is nice to display, e.g. 15669 -> 15000. Also handles fractional stuff
 * @param {number} num
 */
export function findNiceValue(num) {
    if (num > 1e8) {
        return num;
    }
    if (num < 0.00001) {
        return 0;
    }

    let roundAmount = 1;
    if (num > 50000) {
        roundAmount = 10000;
    } else if (num > 20000) {
        roundAmount = 5000;
    } else if (num > 5000) {
        roundAmount = 1000;
    } else if (num > 2000) {
        roundAmount = 500;
    } else if (num > 1000) {
        roundAmount = 100;
    } else if (num > 100) {
        roundAmount = 20;
    } else if (num > 20) {
        roundAmount = 5;
    }

    const niceValue = Math.floor(num / roundAmount) * roundAmount;
    if (num >= 10) {
        return Math.round(niceValue);
    }
    if (num >= 1) {
        return Math.round(niceValue * 10) / 10;
    }

    return Math.round(niceValue * 100) / 100;
}

/**
 * Finds a nice integer value
 * @see findNiceValue
 * @param {number} num
 */
export function findNiceIntegerValue(num) {
    return Math.ceil(findNiceValue(num));
}

/**
 * Smart rounding + fractional handling
 * @param {number} n
 */
function roundSmart(n) {
    if (n < 100) {
        return n.toFixed(1);
    }
    return Math.round(n);
}

/**
 * Formats a big number
 * @param {number} num
 * @param {string=} separator The decimal separator for numbers like 50.1 (separator='.')
 * @returns {string}
 */
export function formatBigNumber(num, separator = T.global.decimalSeparator) {
    const sign = num < 0 ? "-" : "";
    num = Math.abs(num);

    if (num > 1e54) {
        return sign + T.global.infinite;
    }

    if (num < 10 && !Number.isInteger(num)) {
        return sign + num.toFixed(2);
    }
    if (num < 50 && !Number.isInteger(num)) {
        return sign + num.toFixed(1);
    }
    num = Math.floor(num);

    if (num < 1000) {
        return sign + "" + num;
    } else {
        let leadingDigits = num;
        let suffix = "";
        for (let suffixIndex = 0; suffixIndex < bigNumberSuffixTranslationKeys.length; ++suffixIndex) {
            leadingDigits = leadingDigits / 1000;
            suffix = T.global.suffix[bigNumberSuffixTranslationKeys[suffixIndex]];
            if (leadingDigits < 1000) {
                break;
            }
        }
        const leadingDigitsRounded = round1Digit(leadingDigits);
        const leadingDigitsNoTrailingDecimal = leadingDigitsRounded
            .toString()
            .replace(".0", "")
            .replace(".", separator);
        return sign + leadingDigitsNoTrailingDecimal + suffix;
    }
}

/**
 * Formats a big number, but does not add any suffix and instead uses its full representation
 * @param {number} num
 * @param {string=} divider The divider for numbers like 50,000 (divider=',')
 * @returns {string}
 */
export function formatBigNumberFull(num, divider = T.global.thousandsDivider) {
    if (num < 1000) {
        return num + "";
    }
    if (num > 1e54) {
        return T.global.infinite;
    }
    let rest = num;
    let out = "";
    while (rest >= 1000) {
        out = (rest % 1000).toString().padStart(3, "0") + divider + out;
        rest = Math.floor(rest / 1000);
    }
    out = rest + divider + out;

    return out.substring(0, out.length - 1);
}

/**
 * Delayes a promise so that it will resolve after a *minimum* amount of time only
 * @param {Promise<any>} promise The promise to delay
 * @param {number} minTimeMs The time to make it run at least
 * @returns {Promise<any>} The delayed promise
 */
export function artificialDelayedPromise(promise, minTimeMs = 500) {
    if (G_IS_DEV && globalConfig.debug.noArtificialDelays) {
        return promise;
    }

    const startTime = performance.now();
    return promise.then(
        result => {
            const timeTaken = performance.now() - startTime;
            const waitTime = Math.floor(minTimeMs - timeTaken);
            if (waitTime > 0) {
                return new Promise(resolve => {
                    setTimeout(() => {
                        resolve(result);
                    }, waitTime);
                });
            } else {
                return result;
            }
        },
        error => {
            const timeTaken = performance.now() - startTime;
            const waitTime = Math.floor(minTimeMs - timeTaken);
            if (waitTime > 0) {
                // @ts-ignore
                return new Promise((resolve, reject) => {
                    setTimeout(() => {
                        reject(error);
                    }, waitTime);
                });
            } else {
                throw error;
            }
        }
    );
}

/**
 * Computes a sine-based animation which pulsates from 0 .. 1 .. 0
 * @param {number} time Current time in seconds
 * @param {number} duration Duration of the full pulse in seconds
 * @param {number} seed Seed to offset the animation
 */
export function pulseAnimation(time, duration = 1.0, seed = 0.0) {
    return Math.sin((time * Math.PI * 2.0) / duration + seed * 5642.86729349) * 0.5 + 0.5;
}

/**
 * Returns the smallest angle between two angles
 * @param {number} a
 * @param {number} b
 * @returns {number} 0 .. 2 PI
 */
export function smallestAngle(a, b) {
    return safeMod(a - b + Math.PI, 2.0 * Math.PI) - Math.PI;
}

/**
 * Modulo which works for negative numbers
 * @param {number} n
 * @param {number} m
 */
export function safeMod(n, m) {
    return ((n % m) + m) % m;
}

/**
 * Wraps an angle between 0 and 2 pi
 * @param {number} angle
 */
export function wrapAngle(angle) {
    return safeMod(angle, 2.0 * Math.PI);
}

/**
 * Waits two frames so the ui is updated
 * @returns {Promise<void>}
 */
export function waitNextFrame() {
    return new Promise(function (resolve, reject) {
        window.requestAnimationFrame(function () {
            window.requestAnimationFrame(function () {
                resolve();
            });
        });
    });
}

/**
 * Rounds 1 digit
 * @param {number} n
 * @returns {number}
 */
export function round1Digit(n) {
    return Math.floor(n * 10.0) / 10.0;
}

/**
 * Rounds 2 digits
 * @param {number} n
 * @returns {number}
 */
export function round2Digits(n) {
    return Math.floor(n * 100.0) / 100.0;
}

/**
 * Rounds 3 digits
 * @param {number} n
 * @returns {number}
 */
export function round3Digits(n) {
    return Math.floor(n * 1000.0) / 1000.0;
}

/**
 * Rounds 4 digits
 * @param {number} n
 * @returns {number}
 */
export function round4Digits(n) {
    return Math.floor(n * 10000.0) / 10000.0;
}

/**
 * Clamps a value between [min, max]
 * @param {number} v
 * @param {number=} minimum Default 0
 * @param {number=} maximum Default 1
 */
export function clamp(v, minimum = 0, maximum = 1) {
    return Math.max(minimum, Math.min(maximum, v));
}

/**
 * Measures how long a function took
 * @param {string} name
 * @param {function():void} target
 */
export function measure(name, target) {
    const now = performance.now();
    for (let i = 0; i < 25; ++i) {
        target();
    }
    const dur = (performance.now() - now) / 25.0;
    console.warn("->", name, "took", dur.toFixed(2), "ms");
}

/**
 * Helper method to create a new div element
 * @param {string=} id
 * @param {Array<string>=} classes
 * @param {string=} innerHTML
 */
export function makeDivElement(id = null, classes = [], innerHTML = "") {
    const div = document.createElement("div");
    if (id) {
        div.id = id;
    }
    for (let i = 0; i < classes.length; ++i) {
        div.classList.add(classes[i]);
    }
    div.innerHTML = innerHTML;
    return div;
}

/**
 * Helper method to create a new div
 * @param {Element} parent
 * @param {string=} id
 * @param {Array<string>=} classes
 * @param {string=} innerHTML
 */
export function makeDiv(parent, id = null, classes = [], innerHTML = "") {
    const div = makeDivElement(id, classes, innerHTML);
    parent.appendChild(div);
    return div;
}

/**
 * Helper method to create a new div and place before reference Node
 * @param {Element} parent
 * @param {Element} referenceNode
 * @param {string=} id
 * @param {Array<string>=} classes
 * @param {string=} innerHTML
 */
export function makeDivBefore(parent, referenceNode, id = null, classes = [], innerHTML = "") {
    const div = makeDivElement(id, classes, innerHTML);
    parent.insertBefore(div, referenceNode);
    return div;
}

/**
 * Helper method to create a new button element
 * @param {Array<string>=} classes
 * @param {string=} innerHTML
 */
export function makeButtonElement(classes = [], innerHTML = "") {
    const element = document.createElement("button");
    for (let i = 0; i < classes.length; ++i) {
        element.classList.add(classes[i]);
    }
    element.classList.add("styledButton");
    element.innerHTML = innerHTML;
    return element;
}

/**
 * Helper method to create a new button
 * @param {Element} parent
 * @param {Array<string>=} classes
 * @param {string=} innerHTML
 */
export function makeButton(parent, classes = [], innerHTML = "") {
    const element = makeButtonElement(classes, innerHTML);
    parent.appendChild(element);
    return element;
}

/**
 * Helper method to create a new button and place before reference Node
 * @param {Element} parent
 * @param {Element} referenceNode
 * @param {Array<string>=} classes
 * @param {string=} innerHTML
 */
export function makeButtonBefore(parent, referenceNode, classes = [], innerHTML = "") {
    const element = makeButtonElement(classes, innerHTML);
    parent.insertBefore(element, referenceNode);
    return element;
}

/**
 * Removes all children of the given element
 * @param {Element} elem
 */
export function removeAllChildren(elem) {
    if (elem) {
        var range = document.createRange();
        range.selectNodeContents(elem);
        range.deleteContents();
    }
}

export function smartFadeNumber(current, newOne, minFade = 0.01, maxFade = 0.9) {
    const tolerance = Math.min(current, newOne) * 0.5 + 10;
    let fade = minFade;
    if (Math.abs(current - newOne) < tolerance) {
        fade = maxFade;
    }

    return current * fade + newOne * (1 - fade);
}

/**
 * Fixes lockstep simulation by converting times like 34.0000000003 to 34.00.
 * We use 3 digits of precision, this allows to store sufficient precision of 1 ms without
 * the risk to simulation errors due to resync issues
 * @param {number} value
 */
export function quantizeFloat(value) {
    return Math.round(value * 1000.0) / 1000.0;
}

/**
 * Safe check to check if a timer is expired. quantizes numbers
 * @param {number} now Current time
 * @param {number} lastTick Last tick of the timer
 * @param {number} tickRate Interval of the timer
 */
export function checkTimerExpired(now, lastTick, tickRate) {
    if (G_IS_DEV) {
        if (quantizeFloat(now) !== now) {
            console.error("Got non-quantizied time:" + now + " vs " + quantizeFloat(now));
            now = quantizeFloat(now);
        }
        if (quantizeFloat(lastTick) !== lastTick) {
            // FIXME: REENABLE
            // console.error("Got non-quantizied timer:" + lastTick + " vs " + quantizeFloat(lastTick));
            lastTick = quantizeFloat(lastTick);
        }
    } else {
        // just to be safe
        now = quantizeFloat(now);
        lastTick = quantizeFloat(lastTick);
    }
    /*
    Ok, so heres the issue (Died a bit while debugging it):

    In multiplayer lockstep simulation, client A will simulate everything at T, but client B
    will simulate it at T + 3. So we are running into the following precision issue:
    Lets say on client A the time is T = 30. Then on clientB the time is T = 33.
    Now, our timer takes 0.1 seconds and ticked at 29.90 - What does happen now?
    Client A computes the timer and checks T > lastTick + interval. He computes

    30 >= 29.90 + 0.1   <=> 30 >= 30.0000  <=> True  <=> Tick performed

    However, this is what it looks on client B:

    33 >= 32.90 + 0.1   <=> 33 >= 32.999999999999998 <=> False <=> No tick performed!

    This means that Client B will only tick at the *next* frame, which means it from now is out
    of sync by one tick, which means the game will resync further or later and be not able to recover,
    since it will run into the same issue over and over.
    */

    // The next tick, in our example it would be 30.0000 / 32.99999999998. In order to fix it, we quantize
    // it, so its now 30.0000 / 33.0000
    const nextTick = quantizeFloat(lastTick + tickRate);

    // This check is safe, but its the only check where you may compare times. You always need to use
    // this method!
    return now >= nextTick;
}

/**
 * Returns if the game supports this browser
 */
export function isSupportedBrowser() {
    // please note,
    // that IE11 now returns undefined again for window.chrome
    // and new Opera 30 outputs true for window.chrome
    // but needs to check if window.opr is not undefined
    // and new IE Edge outputs to true now for window.chrome
    // and if not iOS Chrome check
    // so use the below updated condition

    if (G_IS_MOBILE_APP || G_IS_STANDALONE) {
        return true;
    }

    // @ts-ignore
    var isChromium = window.chrome;
    var winNav = window.navigator;
    var vendorName = winNav.vendor;
    // @ts-ignore
    var isIEedge = winNav.userAgent.indexOf("Edge") > -1;
    var isIOSChrome = winNav.userAgent.match("CriOS");

    if (isIOSChrome) {
        // is Google Chrome on IOS
        return false;
    } else if (
        isChromium !== null &&
        typeof isChromium !== "undefined" &&
        vendorName === "Google Inc." &&
        isIEedge === false
    ) {
        // is Google Chrome
        return true;
    } else {
        // not Google Chrome
        return false;
    }
}

/**
 * Helper function to create a json schema object
 * @param {any} properties
 */
export function schemaObject(properties) {
    return {
        type: "object",
        required: Object.keys(properties).slice(),
        additionalProperties: false,
        properties,
    };
}

/**
 * Quickly
 * @param {number} x
 * @param {number} y
 * @param {number} deg
 * @returns {Vector}
 */
export function fastRotateMultipleOf90(x, y, deg) {
    switch (deg) {
        case 0: {
            return new Vector(x, y);
        }
        case 90: {
            return new Vector(x, y);
        }
    }
}

/**
 * Formats an amount of seconds into something like "5s ago"
 * @param {number} secs Seconds
 * @returns {string}
 */
export function formatSecondsToTimeAgo(secs) {
    const seconds = Math.floor(secs);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (seconds < 60) {
        if (seconds === 1) {
            return T.global.time.oneSecondAgo;
        }
        return T.global.time.xSecondsAgo.replace("<x>", "" + seconds);
    } else if (minutes < 60) {
        if (minutes === 1) {
            return T.global.time.oneMinuteAgo;
        }
        return T.global.time.xMinutesAgo.replace("<x>", "" + minutes);
    } else if (hours < 24) {
        if (hours === 1) {
            return T.global.time.oneHourAgo;
        }
        return T.global.time.xHoursAgo.replace("<x>", "" + hours);
    } else {
        if (days === 1) {
            return T.global.time.oneDayAgo;
        }
        return T.global.time.xDaysAgo.replace("<x>", "" + days);
    }
}

/**
 * Formats seconds into a readable string like "5h 23m"
 * @param {number} secs Seconds
 * @returns {string}
 */
export function formatSeconds(secs) {
    const trans = T.global.time;
    secs = Math.ceil(secs);
    if (secs < 60) {
        return trans.secondsShort.replace("<seconds>", "" + secs);
    } else if (secs < 60 * 60) {
        const minutes = Math.floor(secs / 60);
        const seconds = secs % 60;
        return trans.minutesAndSecondsShort
            .replace("<seconds>", "" + seconds)
            .replace("<minutes>", "" + minutes);
    } else {
        const hours = Math.floor(secs / 3600);
        const minutes = Math.floor(secs / 60) % 60;
        return trans.hoursAndMinutesShort.replace("<minutes>", "" + minutes).replace("<hours>", "" + hours);
    }
}

/**
 * Generates a file download
 * @param {string} filename
 * @param {string} text
 */
export function generateFileDownload(filename, text) {
    var element = document.createElement("a");
    element.setAttribute("href", "data:text/plain;charset=utf-8," + encodeURIComponent(text));
    element.setAttribute("download", filename);

    element.style.display = "none";
    document.body.appendChild(element);

    element.click();
    document.body.removeChild(element);
}

/**
 * Capitalizes the first letter
 * @param {string} str
 */
export function capitalizeFirstLetter(str) {
    return str.substr(0, 1).toUpperCase() + str.substr(1).toLowerCase();
}

/**
 * Formats a number like 2.5 to "2.5 items / s"
 * @param {number} speed
 * @param {boolean=} double
 * @param {string=} separator The decimal separator for numbers like 50.1 (separator='.')
 */
export function formatItemsPerSecond(speed, double = false, separator = T.global.decimalSeparator) {
    return speed === 1.0
        ? T.ingame.buildingPlacement.infoTexts.oneItemPerSecond
        : T.ingame.buildingPlacement.infoTexts.itemsPerSecond.replace(
              "<x>",
              round2Digits(speed).toString().replace(".", separator)
          ) + (double ? "  " + T.ingame.buildingPlacement.infoTexts.itemsPerSecondDouble : "");
}
