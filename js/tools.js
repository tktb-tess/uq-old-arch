"use strict";

/**
 * @type {number[]}
 */
const prim_liste = [];

class Queue {
    #stack_pop = [];
    #stack_push = [];

    constructor(...values) {
        values.forEach((value) => {
            this.#stack_push.push(value);
        });
    }

    enqueue(...values) {
        values.forEach((value) => {
            this.#stack_push.push(value);
        });
    }

    dequeue() {
        if (this.#stack_pop.length === 0) {
            while (this.#stack_push.length > 0) {
                this.#stack_pop.push(this.#stack_push.pop());
            }
        }

        return this.#stack_pop.pop();
    }
}

class util extends null {

    constructor() { throw TypeError('class \`util\` cannot construct!'); }
    /**
     * min以上, max未満の整数を返す
     * @param {number} min 
     * @param {number} max 
     * @returns 範囲内の整数乱数
     */
    static getRndInt(min, max) {
        return Math.floor(Math.random() * (max - min) + min);
    }

    /**
     * 
     * @param  {...number} nums 
     */
    static toBigInt(...nums) {
        return nums.map(n => BigInt(n));
    }

    /** 
     * 指定ビット数の乱数を出力する 
     * @param {number} length_ ビット長
     * @returns length ビットの乱数
    */
    static getRndBI(length_) {
        const length = Number.parseInt(length_);
        if (length <= 0) throw Error('a bit length must be a positive');
        if (!Number.isFinite(length)) throw Error('a bit length is not a number');
        const div = Math.ceil(length / 32);
        let result = '';

        // 32bitsずつ
        for (let i = 0; i < div; i++) {
            const fourbytes = Math.floor(Math.random() * Math.pow(2, 32));
            result += fourbytes.toString(2).padStart(32, '0');
        }
        result = result.replace(/^./, '1').slice(0, length);
        // console.log(result);
        return BigInt('0b' + result);
    }

    /**
     * min 以上 max 未満の桁数の乱数を返す
     * @param {number} _min 
     * @param {number} _max 
     * @returns 
     */
    static getRndBIR(_min, _max) {
        const min = Number.parseInt(_min), max = Number.parseInt(_max);
        const rand = Math.floor(Math.random() * (max - min) + min);
        return util.getRndBI(rand);
    }

    /**
     * 配列が等しいかどうかの真偽値を返す
     * @param {any[]} arr1 
     * @param {any[]} arr2 
     * @returns 
     */
    static isEqArray(arr1, arr2) {
        if (!Array.isArray(arr1) || !Array.isArray(arr2)) throw TypeError('引数は配列でなければなりません');
        if (arr1.length !== arr2.length)
            return false;
        else {
            for (let i = 0; i < arr1.length; i++) {
                if (arr1.at(i) !== arr2.at(i)) return false;
            }
            return true;
        }
    }

    /**
     * 冪剰余を計算する
     * @param {bigint} base_ 底
     * @param {bigint} power_ 指数
     * @param {bigint} mod_ 法
     * @returns 冪剰余
     */
    static ModPow(base_, power_, mod_) {
        let base = BigInt(base_), power = BigInt(power_); const mod = BigInt(mod_);
        if (mod < 2n) throw Error('a modulo must be 2 or larger');
        if (power < 0n) throw Error('a power must not be a negative');
        while (base < 0n) base += mod;
        if (base % mod === 1n || base % mod === 0n) return base;

        let result = 1n;
        while (power > 0n) {
            if (power % 2n === 1n) result = result * base % mod;
            base = base ** 2n % mod;
            power >>= 1n;
            // console.log(base, power, mod);
        }
        return result;
    }

    /**
     * SHA-256ハッシュのBase64
     * @param {string} str 
     * @returns 
     */
    static async getHashb64(str) {
        const encoded = new TextEncoder().encode(str);
        const hash = new Uint8Array(await crypto.subtle.digest('SHA-256', encoded));
        return util.binToB64(hash);
    }

    /**
     * バイナリデータをBase64形式のテキストに変換する
     * @param {Uint8Array} bin バイナリデータ
     */
    static binToB64(bin) {
        if (!(bin instanceof Uint8Array)) throw TypeError('type must be \`Uint8Array\`');
        return btoa(Array.from(bin, n => String.fromCodePoint(n)).join(''));
    }

    /**
     * Base64テキストをバイナリデータに変換する
     * @param {string} base64 
     */
    static b64ToBin(base64) {
        if (typeof base64 !== 'string') throw TypeError('type must be \`string\`')
        return Uint8Array.from(atob(base64), s => s.charCodeAt(0));
    }

    /**
     * min以上max以下の素数の配列を返す
     * @param {number} min 
     * @param {number} max 
     * @returns 
     */
    static primListeKallen(min, max) {
        // type guard
        if (typeof min !== 'number' || typeof max !== 'number') throw TypeError('引数は \`number\` 型でなければなりません。');

        if (!Number.isFinite(min) || !Number.isFinite(max))  // 非数は弾く
            throw new Error("keine Zahl");

        if (max > 1000000)  // 1,000,000より大きいのを弾く
            throw new Error("Limit überschreitet");

        if (min > max)  // minの方がデカかったら空にする
            return [];

        let min_index = 0, max_index = prim_liste.length - 1;

        while (prim_liste[min_index] < min)
            min_index++;

        while (prim_liste[max_index] > max)
            max_index--;

        const p_list_itibu = prim_liste.slice(min_index, max_index + 1);

        return p_list_itibu;
    }

    /**
     * 拡張ユークリッドの互除法
     * 参考: https://qiita.com/angel_p_57/items/56a902cbd1fe519747bd
     * 
     * @description `ax - by = gcd(a, b)`
     * @param {bigint} a a
     * @param {bigint} b b
     * @returns `[x, y, gcd(a, b)]`
     */
    static ExEuclidean(a, b) {
        if (typeof a !== 'bigint' || typeof b !== 'bigint') throw TypeError('type of arguments must be Bigint');

        // a, b に 0 がある場合の処理
        if (a === 0n && b === 0n) return [0n, 0n, 0n];
        if (a === 0n) return (b > 0n) ? [0n, -1n, b] : [0n, 1n, -b];
        if (b === 0n) return (a > 0n) ? [1n, 0n, a] : [-1n, 0n, -a];

        const v_1 = [1n, 0n, a], v_2 = [0n, -1n, b];

        while (true) {
            const q = v_1[2] / v_2[2];
            const c_nxt = v_1[2] - q * v_2[2];

            if (c_nxt === 0n) break;

            for (let i = 0; i < v_1.length; i++) {
                [v_1[i], v_2[i]] = [v_2[i], v_1[i] - q * v_2[i]];
            }
        }

        // GCD が負の場合 -1 倍する
        if (v_2[2] < 0n) {
            for (let i = 0; i < v_2.length; i++) {
                v_2[i] *= -1n;
            }
        }

        return v_2;
    }

    /**
     * Miller-Rabin 素数判定法
     * @param {bigint} n_ 判定したい整数
     */
    static MillerRabin(n_) {
        if (typeof n_ !== 'bigint') throw TypeError('引数型は \`bigint\` でなければなりません');
        if (n_ < 0n) throw Error('引数は正の整数でなければなりません');
        const n = n_;
        
        if (n === 2n) return true;
        if (n === 1n || n % 2n === 0n) return false;
        
        const bit_num = n.toString(2).length;
        let s = 0n, d = n - 1n;

        while (d % 2n === 0n) {
            d >>= 1n;
            ++s;
        }

        if (n < 2n ** 64n) {
            // n が 2^64 未満の時、決定的に判定できる 参考: https://miller-rabin.appspot.com/#bases7
            const base_under_64 = Object.freeze([2n, 325n, 9375n, 28178n, 450775n, 9780504n, 1795265022n]);

            challenge: for (const base of base_under_64) {
                const a = (base >= n) ? base % n : base;
                if (a === 0n) continue challenge;

                let y = util.ModPow(a, d, n);
                if (y === 1n) continue challenge;

                for (let i = 0n; i < s; i++) {
                    if (y === n - 1n) continue challenge;
                    y = y * y % n;
                }
                return false;

            }
            return true;

        } else {
            const max_rot = 40; // 試行回数
            challenge2: for (let i = 0; i < max_rot; i++) {
                let a = 0n;
                while (true) {
                    // 乱数を取得
                    const rnd_ = util.getRndBIR(1, bit_num + 1) % n;
    
                    // 最大公約数を計算する。1でなかったらやりなおし
                    const gcd = util.ExEuclidean(rnd_, n)[2];
                    if (gcd === 1n) {
                        a = rnd_;
                        break;
                    }
                }
    
                let y = util.ModPow(a, d, n);
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
     * @param {bigint} n 整数
     * @returns 引数の階乗
     */
    static Factorial(n) {
        if (typeof n !== 'bigint') throw TypeError(`type must be 'bigint'`);
        if (n < 0n) throw Error('a number must not be negative');
        if (n === 0n) return 1n;
        
        const two_exp = n - BigInt(n.toString(2).match(/1/g).length);
        const odd_part = util.#OddPart(n);
        return odd_part << two_exp;
    }

    /**
     * 階乗の奇数部分を計算する
     * @param {bigint} n 整数
     * @returns 奇数部分の積
     */
    static #OddPart(n) {

        let L_i = 3n, m = BigInt(n.toString(2).length) - 1n, result = 1n, tmp = 1n;

        for (let i = m - 1n; i > -1n; i--) {
            let U_i = (n >> i) + 1n | 1n;

            tmp *= util.#OddProd(L_i, U_i);
            L_i = U_i;
            result *= tmp;
        }

        return result;
    }

    /** 
     * min 以上 max "未満" の奇数の積を返す
     * @param {bigint} max 最大値
     * @param {bigint} min 最小値
     * @returns {bigint} min 以上 max 未満 の奇数の積
    */
    static #OddProd(min, max) {

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
        const lower = util.#OddProd(min, mid);
        const higher = util.#OddProd(mid, max);
        return lower * higher;
    }

}

class Base64 {

    constructor() { throw TypeError('class \`Base64\` cannot construct!'); };

    /**
     * Base64エンコード
     * @param {string} text テキスト
     * @returns エンコードされたBase64テキスト
     */
    static encode(text) {
        const utf8Arr = new TextEncoder().encode(text); // UTF-8(整数)にエンコード
        return util.binToB64(utf8Arr);
    }

    /**
     * Base64デコード
     * @param {string} base64 Base64テキスト
     * @returns デコードされたテキスト
     */
    static decode(base64) {
        const binStr = util.b64ToBin(base64); // 疑似的な文字列にデコード
        return new TextDecoder().decode(binStr);
    }
}



class RSA {
    #p = 0n;
    #q = 0n;
    #pq = 0n;

    /**
     * 
     * @param {number} bits 
     */
    constructor(bits = 512) {
        if (typeof bits !== 'number') throw TypeError('!');
        let [p_, q_] = [1n, 1n];
        while (!util.MillerRabin(p_)) {
            p_ = util.getRndBI(bits);
        }
        while (!util.MillerRabin(q_)) {
            q_ = util.getRndBI(bits);
        }
        this.#p = p_;
        this.#q = q_;
        this.#pq = p_ * q_;
    }

    getProd() {
        return this.#pq;
    }

    valueOf() {
        return Number(this.getProd());
    }

    /**
     * 
     * @param {number} radix 
     * @returns 
     */
    toString(radix = 10) {
        return this.getProd().toString(radix);
    }

    toBin() {
        let str = this.toString(16);
        if (str.length % 2 === 1) str = '0' + str;
        const arr = str.match(/.{2}/g);
        return Uint8Array.from(arr, s => Number.parseInt(s, 16));
    }
}

class CachedPrime {
    /**
     * @type {[number, number] | null}
     */
    static #data = null;

    constructor() {
        throw TypeError('Cannot construct!');
    }

    /**
     * 
     * @param {number} p 
     * @param {number} q 
     */
    static setValue(p, q) {
        if (typeof p !== 'number' || typeof q !== 'number') throw TypeError('引数型は \`number\` でなければなりません。')
        if (!Number.isFinite(p) || !Number.isFinite(q)) throw Error('引数が不正です。');

        this.#data = [p, q];
    }

    static getValue() {
        return this.#data;
    }

    static delete() {
        this.#data = null;
    }

    static isCached() {
        return !!this.#data;
    }
}

document.addEventListener('DOMContentLoaded', () => {

    // 素数表の読み込み
    (async () => {
        
        const geholt = await fetch("/assets/misc/primzahlen.bin");
        if (!geholt.ok) throw new Error(`response status: ${geholt.status}`);

        const bin = await geholt.bytes();
        const p_list = Array.from(bin, bit => bit.toString(16).padStart(2, '0')).join('').match(/.{6}/g).map(s => Number.parseInt(s, 16));

        p_list.forEach((p) => {
            prim_liste.push(p);
        });

        console.log(`fetching \`primzahlen.bin\` was successful!`);
    })().catch((err) => {
        console.error(`fetching failed!: ${err.stack}`);
    });

    /* イベントリスナー */

    const base64_btn = document.getElementById("base64-btn"); // ボタン共
    const base64de_btn = document.getElementById("base64de-btn");
    const p_generator_btn = document.getElementById('p-generator-btn');
    const factori_btn = document.getElementById('factori-btn');
    const factori_btn_2 = document.getElementById('factori-btn-2');

    base64_btn.addEventListener('click', () => {
        const base64_input = document.getElementById('base64-input');
        const base64_result = document.getElementById('base64-result');
        base64_result.value = Base64.encode(base64_input.value);
    }, false);

    base64de_btn.addEventListener('click', () => {
        const base64de_input = document.getElementById('base64de-input');
        const base64de_result = document.getElementById('base64de-result');
        try {
            base64de_result.value = Base64.decode(base64de_input.value);
        } catch (e) { // Base64以外が来たら警告
            console.error(`ein Ausnahme fange: ${e.message}`);
            base64de_result.value = "エラー: Base64形式を入力してください";
        }
    }, false);

    p_generator_btn.addEventListener('click', () => {
        const p_generator_result = document.getElementById('p-generator-result');
        const p_generator_input_1 = document.getElementById('p-generator-input-1');
        const p_generator_input_2 = document.getElementById('p-generator-input-2');
        if (!(p_generator_input_1 instanceof HTMLInputElement && p_generator_input_2 instanceof HTMLInputElement)) return;
        try {
            const value_1 = Number.parseInt(p_generator_input_1.value), value_2 = Number.parseInt(p_generator_input_2.value);
            p_generator_result.value = util.primListeKallen(value_1, value_2).join(" "); // 計算
        } catch (e) { // 諸々のエラー処理

            switch (e.message) {
                case "Limit überschreitet":
                    p_generator_result.value = "エラー: 最大値が大きすぎます。1,000,000以下の値を入力して下さい。";
                    break;
                case "keine Zahl":
                    p_generator_result.value = "エラー: 数値を入力して下さい。";
                    break;
                default:
                    p_generator_result.value = "不明なエラー";
                    break;
            }
        }
    }, false);

    factori_btn.addEventListener('click', () => { // 素数生成
        const factori_seego = document.getElementById('factori-seego');
        const factori_result = document.getElementById('factori-result');
        const factori_result_2 = document.getElementById('factori-result-2');
        const input_min = document.getElementById('factori-input-1');
        const input_max = document.getElementById('factori-input-2');

        factori_seego.style.visibility = null;
        factori_result.style.fontSize = null;
        CachedPrime.delete();

        factori_result_2.textContent = "-";
        factori_result_2.style.color = null;
        factori_result_2.style.fontSize = null;

        try {
            const min = Number.parseInt(input_min.value), max = Number.parseInt(input_max.value);
            if (!Number.isFinite(min) || !Number.isFinite(max)) throw Error('keine Zahl');
            const p_list = util.primListeKallen(min, max);
            const p = p_list.at(util.getRndInt(0, p_list.length));
            const q = p_list.at(util.getRndInt(0, p_list.length));

            if (!p || !q) {
                throw new Error("Out of range");
            }
            factori_result.textContent = p * q;
            CachedPrime.setValue(p, q);
            factori_seego.style.visibility = "visible";
        } catch (e) {
            console.error(`ein Ausnahme fange: ${e.message}`);
            factori_result.style.fontSize = "1em";

            switch (e.message) {
                case "Limit überschreitet":
                    factori_result.textContent = "エラー: 最大値が大きすぎます。1,000,000以下の値を入力して下さい。";
                    break;
                case "keine Zahl":
                    factori_result.textContent = "エラー: 数値を入力して下さい。";
                    break;
                case "Out of range":
                    factori_result.textContent = "エラー: 範囲内に素数がありません。";
                    break;
                default:
                    factori_result.textContent = "不明なエラー";
                    break;
            }
        }
    }, false);

    factori_btn_2.addEventListener('click', () => {
        const factori_result_2 = document.getElementById('factori-result-2');
        factori_result_2.style.fontSize = null;
        factori_result_2.style.color = null;

        try {
            if (!CachedPrime.isCached()) {
                factori_result_2.textContent = "-";
            } else {
                const pred_p_tag = document.getElementById('factori-input-3');
                const pred_q_tag = document.getElementById('factori-input-4');

                const pred_p = Number.parseInt(pred_p_tag.value), pred_q = Number.parseInt(pred_q_tag.value);
                if (!Number.isFinite(pred_p) || !Number.isFinite(pred_q)) {
                    throw new Error("keine Zahl");
                }

                const is_correct = util.isEqArray(CachedPrime.getValue(), [pred_p, pred_q]) || util.isEqArray(CachedPrime.getValue(), [pred_q, pred_p]);
                if (is_correct) {
                    factori_result_2.textContent = "〇";
                    factori_result_2.style.color = "red";
                } else {
                    factori_result_2.textContent = "×";
                    factori_result_2.style.color = "blue";
                }
            }
        } catch (e) {
            console.error(`ein Ausnahme fange: ${e.message}`);
            factori_result_2.style.fontSize = "1em";

            switch (e.message) {
                case "keine Zahl":
                    factori_result_2.textContent = "エラー: 数値を入力して下さい。";
                    break;

                default:
                    factori_result_2.textContent = `不明なエラー: ${e.stack}`;
                    break;
            }
        }
    }, false);

    const hashb64_btn_E = document.getElementById('hashb64-btn');
    hashb64_btn_E.addEventListener('click', async () => {
        const hashb64_input = document.getElementById('hashb64-input');
        const hashb64_result = document.getElementById('hashb64-result');
        const result = await util.getHashb64(hashb64_input.value);
        hashb64_result.value = result;
    });

    const miller_rabin_btn_E = document.getElementById('miller-rabin-btn');
    miller_rabin_btn_E.addEventListener('click', () => {
        
        const input_E = document.getElementById('miller-rabin-input');
        const result_E = document.getElementById('miller-rabin-result');

        try {
            if (input_E.value === '') throw Error('keine Zahl');
            
            const maybe_p = BigInt(input_E.value);
            const result = util.MillerRabin(maybe_p);
            result_E.textContent = result ? '多分素数' : '合成数';
        } catch (e) {
            
            switch (e.message) {
                case 'keine Zahl':
                    result_E.textContent = "エラー: 数値を入力して下さい。";
                    break;

                case '引数は正の整数でなければなりません':
                    result_E.textContent = 'エラー: 正の整数を入力してください';
                    break;

                default:
                    if (e.message.includes('Cannot convert')) {
                        result_E.textContent = "エラー: 数値を入力して下さい。";
                    } else {
                        result_E.textContent = `不明なエラー: ${e.stack}`;
                    }
                    break;
            }
        }
    }, false);
}, false);

/**
 * 
 * @returns {bigint[]} 素数の配列
 */
const test = () => {
    const arr = [...Array(2 ** 18)].map((_, i) => BigInt(i) + 2n ** 63n);
    const res = [];
    arr.forEach((n) => {
        if (util.MillerRabin(n)) res.push(n);
    });

    return res;
}


