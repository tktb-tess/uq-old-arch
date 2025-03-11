// @ts-check
"use strict";

/**
 * min以上, max未満の整数を返す
 * @param {number} min 
 * @param {number} max 
 * @returns 範囲内の整数乱数
 */
export const getRndInt = (min, max) => {
    return Math.floor(Math.random() * (max - min) + min);
}

/**
 * 
 * @param  {number | number[]} nums 
 */
export const toBigInt = (nums) => {
    if (typeof nums === 'number') {
        return BigInt(nums);
    } else {
        return nums.map((n) => BigInt(n));
    }
}

/** 
 * 指定ビット数の乱数 or 指定ビット数以下の乱数を出力する 
 * @param {number} length ビット長
 * @param {boolean} fixed true: 固定長, false: length_ ビット以下の可変ビット長 (デフォルト値)
 * @returns length ビットの乱数
*/
export const getRndBI = (length, fixed = false) => {

    if (length <= 0) throw Error('a bit length must be a positive');
    if (!Number.isFinite(length)) throw Error('a bit length is not a valid number');
    const div = Math.ceil(length / 32);

    const typed_arr = crypto.getRandomValues(new Uint32Array(div));

    let result = Array.from(typed_arr, n => n.toString(2).padStart(32, '0')).join('');

    result = result.slice(0, length);

    if (fixed) result = result.replace(/^./, '1');
    // console.log(result);
    return BigInt('0b' + result);
}

/**
 * 配列が等しいかどうかの真偽値を返す
 * @template T
 * @param {T[]} arr1 
 * @param {T[]} arr2 
 * @returns 
 */
export const isEqArray = (arr1, arr2) => {
    if (!Array.isArray(arr1) || !Array.isArray(arr2)) throw TypeError('引数は配列でなければなりません');
    if (arr1.length !== arr2.length) return false;
    else {
        for (let i = 0; i < arr1.length; i++) {
            if (arr1.at(i) !== arr2.at(i)) return false;
        }
        return true;
    }
}

/**
 * 冪剰余を計算する
 * @param {bigint} base 底
 * @param {bigint} power 指数
 * @param {bigint} mod 法
 * @returns 冪剰余
 */
export const modPow = (base, power, mod) => {
    if (mod < 2n) throw Error('a modulo must be 2 or larger');
    if (power < 0n) throw Error('a power must not be a negative');
    while (base < 0n) base += mod;
    if (base % mod === 1n || base % mod === 0n) return base;
    if (base === mod - 1n) return (power & 1n) ? mod - 1n : 1n;

    let result = 1n;
    while (power > 0n) {
        if (power & 1n) result = result * base % mod;
        base = base * base % mod;
        power >>= 1n;
        // console.log(base, power, mod);
    }
    return result;
}

/**
 * 拡張ユークリッドの互除法
 * 参考: https://qiita.com/angel_p_57/items/56a902cbd1fe519747bd
 * 
 * @description `ax - by = gcd(a, b)`
 * @param {bigint} a a
 * @param {bigint} b b
 * @returns `{x, y, gcd(a, b)}`
 */
export const exEuclidean = (a, b) => {
    if (typeof a !== 'bigint' || typeof b !== 'bigint') throw TypeError('type of arguments must be Bigint');

    // a, b に 0 がある場合の処理
    if (a === 0n && b === 0n) return { x: 0n, y: 0n, gcd: 0n };
    if (a === 0n) return (b > 0n) ? { x: 0n, y: -1n, gcd: b } : { x: 0n, y: 1n, gcd: -b };
    if (b === 0n) return (a > 0n) ? { x: 1n, y: 0n, gcd: a } : { x: -1n, y: 0n, gcd: -a };

    let [x_1, y_1, c_1] = [1n, 0n, a], [x_2, y_2, c_2] = [0n, -1n, b];

    while (true) {
        const q = c_1 / c_2;
        const c_nxt = c_1 - q * c_2;

        if (c_nxt === 0n) break;

        [x_1, x_2] = [x_2, x_1 - q * x_2];
        [y_1, y_2] = [y_2, y_1 - q * y_2];
        [c_1, c_2] = [c_2, c_nxt];

    }

    // GCD が負の場合 -1 倍する
    if (c_2 < 0n) {
        x_2 *= -1n;
        y_2 *= -1n;
        c_2 *= -1n;
    }

    return { x: x_2, y: y_2, gcd: c_2 };
}

/**
 * Miller-Rabin 素数判定法 (n < 2^64 の場合決定的に判定)
 * @param {bigint} n_ 判定したい整数
 */
export const millerRabin = (n_) => {
    if (typeof n_ !== 'bigint') throw TypeError('引数型は \`bigint\` でなければなりません');
    if (n_ < 0n) throw Error('引数は正の整数でなければなりません');
    const n = n_;

    if (n === 2n) return true;
    if (n === 1n || n % 2n === 0n) return false;

    const bit_num = n.toString(2).length;
    const s = BigInt((n - 1n).toString(2).match(/0+$/g)?.[0].length ?? 0);
    const d = (n - 1n) >> s;

    if (n < 2n ** 64n) {
        /**
         * n が 2^64 未満の時、決定的に判定できる 参考: https://miller-rabin.appspot.com/#bases7
         */
        const bases_under_64 = Object.freeze([2n, 325n, 9375n, 28178n, 450775n, 9780504n, 1795265022n]);

        challenge: for (const b_ of bases_under_64) {
            const base = (b_ >= n) ? b_ % n : b_;
            if (base === 0n) continue challenge;
            if (exEuclidean(base, n).gcd != 1n) return false;

            let y = modPow(base, d, n);
            if (y === 1n) continue challenge;

            for (let i = 0n; i < s; i++) {
                if (y === n - 1n) continue challenge;
                y = y * y % n;
            }
            return false;

        }
        return true;

    } else {
        /** 試行回数 */
        const max_rot = 40;

        challenge2: for (let i = 0; i < max_rot; i++) {
            let b_ = 0n;

            while (b_ < 2n || b_ >= n) {
                b_ = getRndBI(bit_num);
            }
            if (exEuclidean(b_, n).gcd !== 1n) return false;

            const base = b_;

            let y = modPow(base, d, n);

            if (y === 1n) continue challenge2;

            for (let i = 0n; i < s; i++) {
                if (y === n - 1n) continue challenge2;
                y = y * y % n;
            }
            return false;
        }
        return true;
    }
}

/**
 * 階乗を計算する 参考: https://qiita.com/AkariLuminous/items/1b2e964ebabde9419224
 * @param {number} n_ 整数
 * @returns 引数の階乗
 */
export const factorial = (n_) => {

    if (!Number.isFinite(n_)) throw Error(`not a number`, { cause: n_ });
    if (n_ < 0) throw Error(`number must be non-negative`, { cause: n_ });
    if (n_ === 0) return 1n;

    const n = BigInt(n_);

    /**
     * min 以上 max 「未満」 の奇数の積を返す
     * @param {bigint} min 最小値
     * @param {bigint} max 最大値
     * @returns {bigint} min 以上 max 未満 の奇数の積
     */
    const oddProd = (min, max) => {
        if (min >= max) return 1n;

        const max_bits = BigInt((max - 2n).toString(2).length);
        const num_odds = (max - min) / 2n;

        if (max_bits * num_odds < 63n) {
            let result = min;
            for (let i = min + 2n; i < max; i += 2n) {
                result *= i;
            }
            return result;
        }

        const mid = min + num_odds | 1n;
        const lower = oddProd(min, mid);
        const higher = oddProd(mid, max);
        return lower * higher;
    };

    /**
     * 階乗の奇数部分を計算する
     * @param {bigint} n 整数
     * @returns 奇数部の積
     */
    const oddPart = (n) => {
        let L_i = 3n, m = BigInt(n.toString(2).length) - 1n, result = 1n, tmp = 1n;

        for (let i = m - 1n; i > -1n; i--) {
            let U_i = (n >> i) + 1n | 1n;

            tmp *= oddProd(L_i, U_i);
            L_i = U_i;
            result *= tmp;
        }

        return result;
    };

    const two_exp = n - BigInt(n.toString(2).match(/1/g)?.length ?? 0);
    const odd_part = oddPart(n);
    const res = odd_part << two_exp;

    return res;
};

export const lazyExec = (delay = 2000) => {
    return new Promise((resolve, _reject) => {
        setTimeout(() => {
            resolve(`resolved in ${delay} ms`);
        }, delay);
    });
};

/**
 * @template T
 * @param {(...args: T[]) => T} f 
 * @returns 
 */
export const lazify = (f) => /** @param {T[]} args */(...args) => () => f(...args);

/**
 * 
 * @param {unknown} v 
 */
export const typeOf = (v) => {
    if (v === null) {
        return 'null';
    } else if (typeof v === 'function') {
        return `[function ${v.name}]`;
    } else if (typeof v === 'object') {
        /** @type {string} */
        const name = Object.prototype.toString.call(v);
        return name;
    } else {
        return typeof v;
    }
}

export const getRandIntFromDate = async () => {
    const today = new Date().toDateString();
    const utf8arr = new TextEncoder().encode(today);
    const hashed = new Uint32Array(await crypto.subtle.digest('SHA-256', utf8arr.buffer), 0, 1);

    return hashed[0];
}