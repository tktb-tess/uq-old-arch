// @ts-check
"use strict";

document.addEventListener('DOMContentLoaded', async () => {
    
    const util = Object.freeze({

        /**
         * min以上, max未満の整数を返す
         * @param {number} min 
         * @param {number} max 
         * @returns 範囲内の整数乱数
         */
        getRndInt(min, max) {
            return Math.floor(Math.random() * (max - min) + min);
        },

        /**
         * 
         * @param  {...number} nums 
         */
        toBigInt(...nums) {
            return nums.map(n => BigInt(n));
        },

        /** 
         * 指定ビット数の乱数 or 指定ビット数以下の乱数を出力する 
         * @param {number} length ビット長
         * @param {boolean} fixed true: 固定長 (デフォルト値), false: length_ ビット以下の可変ビット長
         * @returns length ビットの乱数
        */
        getRndBI(length, fixed = true) {

            if (length <= 0) throw Error('a bit length must be a positive');
            if (!Number.isFinite(length)) throw Error('a bit length is not a valid number');
            const div = Math.ceil(length / 32);

            const typed_arr = crypto.getRandomValues(new Uint32Array(div));

            let result = Array.from(typed_arr, n => n.toString(2).padStart(32, '0')).join('');

            result = result.slice(0, length);

            if (fixed) result = result.replace(/^./, '1');
            // console.log(result);
            return BigInt('0b' + result);
        },

        /**
         * 配列が等しいかどうかの真偽値を返す
         * @param {any[]} arr1 
         * @param {any[]} arr2 
         * @returns 
         */
        isEqArray(arr1, arr2) {
            if (!Array.isArray(arr1) || !Array.isArray(arr2)) throw TypeError('引数は配列でなければなりません');
            if (arr1.length !== arr2.length)
                return false;
            else {
                for (let i = 0; i < arr1.length; i++) {
                    if (arr1.at(i) !== arr2.at(i)) return false;
                }
                return true;
            }
        },

        /**
         * 冪剰余を計算する
         * @param {bigint} base 底
         * @param {bigint} power 指数
         * @param {bigint} mod 法
         * @returns 冪剰余
         */
        modPow(base, power, mod) {
            if (typeof base !== 'bigint' || typeof power !== 'bigint' || typeof mod !== 'bigint') throw TypeError('an argument type is not `bigint`');

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
        },

        /**
         * SHA-256ハッシュのBase64
         * @param {string} str 
         * @returns 
         */
        async getHashb64(str) {
            const encoded = new TextEncoder().encode(str);
            const hash = new Uint8Array(await crypto.subtle.digest('SHA-256', encoded));
            return Base64.binToB64(hash);
        },

        /**
         * 拡張ユークリッドの互除法
         * 参考: https://qiita.com/angel_p_57/items/56a902cbd1fe519747bd
         * 
         * @description `ax - by = gcd(a, b)`
         * @param {bigint} a a
         * @param {bigint} b b
         * @returns `{x, y, gcd(a, b)}`
         */
        exEuclidean(a, b) {
            if (typeof a !== 'bigint' || typeof b !== 'bigint') throw TypeError('type of arguments must be Bigint');

            // a, b に 0 がある場合の処理
            if (a === 0n && b === 0n) return { x: 0n, y: 0n, gcd: 0n };
            if (a === 0n) return (b > 0n) ? { x: 0n, y: -1n, gcd: b } : { x: 0n, y: 1n, gcd: -b};
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
        },

        /**
         * Miller-Rabin 素数判定法 (n < 2^64 の場合決定的に判定)
         * @param {bigint} n_ 判定したい整数
         */
        millerRabin(n_) {
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
                /**
                 * n が 2^64 未満の時、決定的に判定できる 参考: https://miller-rabin.appspot.com/#bases7
                 */
                const base_under_64 = Object.freeze([2n, 325n, 9375n, 28178n, 450775n, 9780504n, 1795265022n]);

                challenge: for (const base of base_under_64) {
                    const a = (base >= n) ? base % n : base;
                    if (a === 0n) continue challenge;

                    let y = util.modPow(a, d, n);
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
                    while (util.exEuclidean(a, n).gcd !== 1n) { // 最大公約数を計算する。1でなかったらやりなおし
                        // 乱数を取得
                        a = util.getRndBI(bit_num, false) % n;
                    }

                    let y = util.modPow(a, d, n);
                    if (y === 1n) continue challenge2;

                    for (let i = 0n; i < s; i++) {
                        if (y === n - 1n) continue challenge2;
                        y = y * y % n;
                    }
                    return false;
                }
                return true;
            }
        },

        /**
         * 階乗を計算する 参考: https://qiita.com/AkariLuminous/items/1b2e964ebabde9419224
         * @param {bigint} n 整数
         * @returns 引数の階乗
         */
        factorial(n) {
            if (typeof n !== 'bigint') throw TypeError(`type must be 'bigint'`);
            if (n < 0n) throw Error('a number must not be negative');
            if (n === 0n) return 1n;

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

            const one_num = n.toString(2).match(/1/g) ?? [];
            const two_exp = n - BigInt(one_num.length);
            const odd_part = oddPart(n);
            return odd_part << two_exp;
        },
        lazy(delay = 2000) {
            return new Promise((resolve, _) => {
                setTimeout(() => {
                    resolve(`resolved in ${delay} ms`);
                }, delay);
            });
        }
    });

    class Base64 {

        #data;

        /**
         * 
         * @param {string | ArrayBuffer} data 
         */
        constructor(data) {
            if (typeof data === 'string') {
                this.#data = Base64.b64ToBin(data);
            } else if (data instanceof ArrayBuffer) {
                this.#data = data;
            } else {
                throw TypeError('引数 `data` は `string` 型か `Uint8Array` 型でなければならない', { cause: (typeof data) });
            }
        };

        get base64() {
            return Base64.binToB64(this.#data);
        }

        get buffer() {
            return this.#data;
        }

        toString() {
            return this.base64;
        }

        getUint8() {
            return new Uint8Array(this.buffer);
        }

        toJSON() {
            return this.base64;
        }


        /**
         * Base64エンコード
         * @param {string} text テキスト
         * @returns エンコードされたBase64テキスト
         */
        static encode(text) {
            const utf8Arr = new TextEncoder().encode(text); // UTF-8(整数)にエンコード
            return this.binToB64(utf8Arr.buffer);
        }

        /**
         * Base64デコード
         * @param {string} base64 Base64テキスト
         * @returns デコードされたテキスト
         */
        static decode(base64) {
            const binStr = this.b64ToBin(base64); // 疑似的な文字列にデコード
            return new TextDecoder().decode(binStr);
        }

        /**
         * バイナリデータをBase64形式のテキストに変換する
         * @param {ArrayBuffer} bin バイナリデータ
         */
        static binToB64(bin) {
            return btoa(Array.from(new Uint8Array(bin), n => String.fromCodePoint(n)).join(''));
        }

        /**
         * Base64テキストをバイナリデータに変換する
         * @param {string} base64 
         */
        static b64ToBin(base64) {
            return Uint8Array.from(atob(base64), s => s.charCodeAt(0)).buffer;
        }
    }

    class RSA {
        #p = 0n;
        #q = 0n;
        static get #e() { return 65537n };
        #d = 0n;


        /**
         * 
         * @param {number} bits 
         */
        constructor(bits = 128) {
            if (typeof bits !== 'number') throw TypeError('type error! `number` 型でなければいけません', { cause: bits });

            loop: while (true) {
                let [p_, q_] = [1n, 1n];
                let counter = 0;
                while (!util.millerRabin(p_)) {
                    p_ = util.getRndBI(bits);
                    counter++;
                    if (counter > 1000) throw Error('failed to construct.');
                }
                counter = 0;
                while (!util.millerRabin(q_)) {
                    q_ = util.getRndBI(bits);
                    counter++;
                    if (counter > 1000) throw Error('failed to construct.');
                }

                this.#p = p_;
                this.#q = q_;

                // λ(pq) = LCM(p-1, q-1) = (p-1) * (q-1) / GCD(p-1, q-1)
                const phi = (p_ - 1n) * (q_ - 1n);
                const gcd = util.exEuclidean(p_ - 1n, q_ - 1n).gcd;
                const lambda = phi / gcd;

                const result = util.exEuclidean(RSA.#e, lambda);

                if (result.gcd !== 1n) continue loop;

                let d_ = result.x;
                while (d_ < 0n) d_ += lambda;
                this.#d = d_;

                break loop;
            }
        }


        /**
         * 
         * @param {number} radix 
         * @returns 
         */
        toString(radix = 10) {
            const n = this.#p * this.#q;
            return `n: ${n.toString(radix)}\ne: ${RSA.#e.toString(radix)}`;
        }

        toJSON() {
            let n_hexstr = (this.#p * this.#q).toString(16);
            if (n_hexstr.length % 2 === 1) n_hexstr = '0' + n_hexstr;

            const n_bin = Uint8Array.from(n_hexstr.match(/.{2}/g) ?? [], d => Number.parseInt(d, 16));

            let e_hexstr = RSA.#e.toString(16);
            if (e_hexstr.length % 2 === 1) e_hexstr = '0' + e_hexstr;
            const e_bin = Uint8Array.from(e_hexstr.match(/.{2}/g) ?? [], d => Number.parseInt(d, 16));
            const json = {
                n: Base64.binToB64(n_bin),
                e: Base64.binToB64(e_bin)
            }
            return json;
        }

        toBin() {
            let n_hexstr = (this.#p * this.#q).toString(16);
            if (n_hexstr.length % 2 === 1) n_hexstr = '0' + n_hexstr;

            let e_hexstr = RSA.#e.toString(16);
            if (e_hexstr.length % 2 === 1) e_hexstr = '0' + e_hexstr;

            const key_bin_str = n_hexstr + '0000' + e_hexstr;
            const key_bin = Uint8Array.from(key_bin_str.match(/.{2}/g) ?? [], n => Number.parseInt(n, 16));
            return key_bin;
        }

        /**
         * 暗号化
         * @param {string} text 
         */
        encrypt(text) {
            const radix = this.#p * this.#q;
            const utf8 = new TextEncoder().encode(text);
            const m_hexstr = Array.from(utf8, n => n.toString(16).padStart(2, '0')).join('');
            let m_bigint = BigInt('0x' + m_hexstr);

            const c_arr = [];
            while (m_bigint > 0n) {
                let m_one = m_bigint % radix;
                const c_one = util.modPow(m_one, RSA.#e, radix);
                c_arr.push(c_one);
                m_bigint /= radix;
            }

            let c_bigint = 0n;

            for (let i = 0n; i < c_arr.length; i++) {
                c_bigint += c_arr[Number(i)] * radix ** i;
            }

            let c_hexstr = c_bigint.toString(16);
            if (c_hexstr.length % 2 === 1) c_hexstr = '0' + c_hexstr;
            const c_bin = Uint8Array.from(c_hexstr.match(/.{2}/g) ?? [], n => Number.parseInt(n, 16));
            return Base64.binToB64(c_bin);
        }

        /**
         * 復号
         * @param {string} base64 
         */
        decrypt(base64) {
            const radix = this.#p * this.#q;
            const c_bin = new Uint8Array(Base64.b64ToBin(base64));
            const c_hexstr = Array.from(c_bin, n => n.toString(16).padStart(2, '0')).join('');
            let c_bigint = BigInt('0x' + c_hexstr);

            const m_arr = [];
            while (c_bigint > 0n) {
                let c_one = c_bigint % radix;
                const m_one = util.modPow(c_one, this.#d, radix);
                m_arr.push(m_one);
                c_bigint /= radix;
            }

            let m_bigint = 0n;
            for (let i = 0n; i < m_arr.length; i++) {
                m_bigint += m_arr[Number(i)] * radix ** i;
            }

            let m_hexstr = m_bigint.toString(16);
            if (m_hexstr.length % 2 === 1) m_hexstr = '0' + m_hexstr;
            const utf8 = Uint8Array.from(m_hexstr.match(/.{2}/g) ?? [], n => Number.parseInt(n, 16));

            return new TextDecoder().decode(utf8);
        }
    }

    class CachedPrime {
        /**
         * @type {[number, number] | null}
         */
        #data;

        constructor() {
            this.#data = null;
        }

        /**
         * 
         * @param {number} p 
         * @param {number} q 
         */
        setValue(p, q) {
            if (typeof p !== 'number' || typeof q !== 'number') throw TypeError('引数型は \`number\` でなければなりません。');
            if (!Number.isFinite(p) || !Number.isFinite(q)) throw Error('keine zahl');
            this.#data = [p, q];
        }

        getValue() {
            if (this.#data) return this.#data;
            else throw Error(`CachedPrime is empty`, { cause: this });
        }

        delete() {
            this.#data = null;
        }

        isCached() {
            return !!this.#data;
        }
    }

    /**
     * PCG (Permuted congruential generator) 乱数のクラス
     */
    class PCGMinimal {
        #state;
        #max;


        /**
         * @param {number} max_count イテレーターの反復回数, 指定なしの場合20
         * @param {BigUint64Array<ArrayBuffer> | null} seeds シード値, 指定なしかnullの場合自動で生成する
         */
        constructor(max_count = 20, seeds = null) {
            if (typeof max_count !== 'number') throw TypeError('`count` は `number` 型でなければならない', { cause: max_count });

            if (!seeds) {
                const seeds_ = crypto.getRandomValues(new BigUint64Array(3));

                for (let i = 0; i < 3; i++) {
                    seeds_[i] |= 1n;
                }
                this.#state = seeds_;
            } else if (seeds instanceof BigUint64Array && seeds.length >= 3) {
                this.#state = seeds.slice(0, 3);
            } else {
                throw TypeError('引数 `seeds` が一致しません', { cause: seeds });
            }

            this.#max = max_count;
            this.#state[0] = this.#state[0] * this.#state[1] + this.#state[2];
            
        }


        /**
         * 
         * @param {bigint} x 
         * @param {bigint} r 
         * @returns 
         */
        static #rot32(x, r) {
            return BigInt.asUintN(32, x >> (r & 31n) | x << (-r & 31n));
        }

        getRand() {
            let x = this.#state[0];
            const count = BigInt.asUintN(32, x >> 59n);                             // 59 = 64 - 5
            this.#state[0] = x * this.#state[1] + this.#state[2];
            x ^= x >> 18n;                                                          // 18 = (64 - 27)/2
            return Number(PCGMinimal.#rot32(BigInt.asUintN(32, x >> 27n), count));	// 27 = 32 - 5
        }

        
        *[Symbol.iterator]() {
            for (let count = 0; count < this.#max; count++) {
                yield this.getRand();
            }
        }

        valueOf() {
            return this.getRand();
        }

        /**
         * 
         * @param {number | undefined} radix
         * @returns 
         */
        toString(radix) {
            return this.getRand().toString(radix);
        }
    }

    Object.freeze(PCGMinimal.prototype);
    
    // 素数表の読み込み
    const fetchPrimListe = async () => {
        const geholt = await fetch("/assets/bin/primzahlen.bin");
        if (!geholt.ok) throw Error(`failed to fetch\nresponse status: ${geholt.status}`, { cause: geholt });

        const bin = await geholt.bytes();
        const result = [];

        for (let i = 0; i < bin.length; i++) {
            let byte = bin[i];
            for (let j = 0; j < 8; j++) {
                if (byte & 1) result.push(8 * i + j);
                byte >>>= 1;
            }
        }

        console.log(`fetching \`primzahlen.bin\` was successful`);
        return Uint32Array.from(result);
    };
    

    const tools = await fetchPrimListe()
        .then((result) => {
            const prim_liste = result;

            console.log(`all works was successful!`);
            return {
                prim_liste,
                funcs: util, 
                classes: {
                    Base64,
                    CachedPrime,
                    RSA,
                    PCGMinimal,
                }, 
            }

        })
        .catch((e) => {
            if (e instanceof Error) {
                return e;
            } else {
                return Error('unidentified error!', { cause: e });
            }
        });

    if (tools instanceof Error) {
        console.error(`works failed: ${tools.stack}`, tools.cause ?? 'empty');
        return false;
    }

    Object.freeze(tools);

    Object.defineProperty(window, 'tools', {
        get() {
            return tools;
        },
        enumerable: true,
    });

    
    

    /**
     * min以上max以下の素数の配列を返す
     * @param {number} min 
     * @param {number} max 
     * @returns 
     */
    const primListeKallen = (min, max) => {
        // type guard
        if (typeof min !== 'number' || typeof max !== 'number') throw TypeError('引数は \`number\` 型でなければなりません。');


        if (min < 0 || min > 2 ** 26 - 1 || max < 0 || max > 2 ** 26 - 1) throw Error("außerhalb der spanne");

        if (min > max) return new Uint32Array(0);

        let min_index = 0, max_index = tools.prim_liste.length - 1;

        while (tools.prim_liste[min_index] < min) min_index++;

        while (tools.prim_liste[max_index] > max) max_index--;

        const p_list_itibu = tools.prim_liste.slice(min_index, max_index + 1);

        return p_list_itibu;
    };

    /* イベントリスナー */

    const base64_btn = document.getElementById("base64-btn"); // ボタン共
    const base64de_btn = document.getElementById("base64de-btn");
    const p_generator_btn = document.getElementById('p-generator-btn');
    const factori_btn = document.getElementById('factori-btn');
    const factori_btn_2 = document.getElementById('factori-btn-2');
    const hashb64_btn_E = document.getElementById('hashb64-btn');
    const miller_rabin_btn_E = document.getElementById('miller-rabin-btn');
    const cached_p = new CachedPrime();

    if (!(base64_btn instanceof HTMLButtonElement)) {
        console.error(TypeError(`couldn't get base64-btn`));
        return;
    } else if (!(base64de_btn instanceof HTMLButtonElement)) {
        console.error(TypeError(`couldn't get base64de-btn`));
        return;
    } else if (!(p_generator_btn instanceof HTMLButtonElement)) {
        console.error(TypeError(`couldn't get p-generator-btn`));
        return;
    } else if (!(factori_btn instanceof HTMLButtonElement)) {
        console.error(TypeError(`couldn't get factori-btn`));
        return;
    } else if (!(factori_btn_2 instanceof HTMLButtonElement)) {
        console.error(TypeError(`couldn't get factori-btn-2`));
        return;
    } else if (!(hashb64_btn_E instanceof HTMLButtonElement)) {
        console.error(TypeError(`couldn't get hash64-btn`));
        return;
    } else if (!(miller_rabin_btn_E instanceof HTMLButtonElement)) {
        console.error(TypeError(`couldn't get miller-rabin-btn`));
        return;
    }

    base64_btn.addEventListener('click', () => {
        const base64_input = document.getElementById('base64-input');
        const base64_result = document.getElementById('base64-result');
        const val = (base64_input instanceof HTMLInputElement) && (base64_result instanceof HTMLTextAreaElement);
        if (!val) {
            const e = TypeError(`DOM types are not expected`, { cause: `${base64_input}, ${base64_result}` });
            console.error(`${e.stack}\n${e.cause}`);
            return;
        }
            
        base64_result.value = Base64.encode(base64_input.value);
    }, false);

    base64de_btn.addEventListener('click', () => {
        const base64de_input = document.getElementById('base64de-input');
        const base64de_result = document.getElementById('base64de-result');
        if (!(base64de_input instanceof HTMLInputElement) || !(base64de_result instanceof HTMLTextAreaElement)) {
            const e = TypeError(`DOM types are not expected`, { cause: `${base64de_input}, ${base64de_result}` });
            console.error(`${e.stack}\n${e.cause}`);
            return;
        }
            
        try {
            base64de_result.value = Base64.decode(base64de_input.value);
        } catch (e) { // Base64以外が来たら警告
            base64de_result.value = "エラー: Base64形式を入力してください";
        }
    }, false);

    p_generator_btn.addEventListener('click', () => {
        const p_generator_result = document.getElementById('p-generator-result');
        const p_generator_input_1 = document.getElementById('p-generator-input-1');
        const p_generator_input_2 = document.getElementById('p-generator-input-2');
        if (!(p_generator_input_1 instanceof HTMLInputElement
            && p_generator_input_2 instanceof HTMLInputElement
            && p_generator_result instanceof HTMLTextAreaElement)) {
            console.error(`failed to get p-generator-input`);
            return;
        }
        try {
            const value_1 = Number.parseInt(p_generator_input_1.value), value_2 = Number.parseInt(p_generator_input_2.value);
            if (!Number.isFinite(value_1) || !Number.isFinite(value_2)) {
                throw Error('keine zahl');
            }
            p_generator_result.value = primListeKallen(value_1, value_2).join(" "); // 計算
        } catch (e) { // 諸々のエラー処理

            switch (e.message) {
                case "außerhalb der spanne": {
                    p_generator_result.value = "エラー: 範囲外の数値です。0以上67,108,864未満の値を入力して下さい。";
                    break;
                }

                case "keine zahl": {
                    p_generator_result.value = "エラー: 数値を入力して下さい。";
                    break;
                }
                default: {
                    console.error(`予期せぬエラー: ${e.stack}`);
                    break;
                }
            }
        }
    }, false);



    factori_btn.addEventListener('click', () => { // 素数生成
        const factori_seego = document.getElementById('factori-seego');
        const factori_result = document.getElementById('factori-result');
        const factori_result_2 = document.getElementById('factori-result-2');
        const input_min = document.getElementById('factori-input-1');
        const input_max = document.getElementById('factori-input-2');

        if (!(factori_seego instanceof HTMLDivElement)) {
            console.error(`couldn't get factori-seego`);
            return;
        } else if (!(factori_result instanceof HTMLParagraphElement)) {
            console.error(`couldn't get factori-result`);
            return;
        } else if (!(factori_result_2 instanceof HTMLParagraphElement)) {
            console.error(`couldn't get factori-result-2`);
            return;
        } else if (!(input_min instanceof HTMLInputElement)) {
            console.error(`couldn't get factori-input-1`);
            return;
        } else if (!(input_max instanceof HTMLInputElement)) {
            console.error(`couldn't get factori-input-2`);
            return;
        }

        factori_seego.style.visibility = '';
        factori_result.style.fontSize = '';
        cached_p.delete();

        factori_result_2.textContent = "-";
        factori_result_2.style.color = '';
        factori_result_2.style.fontSize = '';

        try {
            const min = Number.parseInt(input_min.value), max = Number.parseInt(input_max.value);
            if (!Number.isFinite(min) || !Number.isFinite(max)) throw Error('keine zahl');
            const p_list = primListeKallen(min, max);
            if (p_list.length === 0) throw Error('vacuum');
            const p = p_list.at(util.getRndInt(0, p_list.length));
            const q = p_list.at(util.getRndInt(0, p_list.length));

            if (!p || !q) throw TypeError('');
            factori_result.textContent = String(p * q);
            cached_p.setValue(p, q);
            factori_seego.style.visibility = "visible";
        } catch (e) {
            factori_result.style.fontSize = "1em";

            switch (e.message) {
                case "außerhalb der spanne": {
                    factori_result.textContent = "エラー: 範囲外の数値です。0以上67,108,864未満の値を入力して下さい。";
                    break;
                }
                case "keine zahl": {
                    factori_result.textContent = "エラー: 数値を入力して下さい。";
                    break;
                }
                case "vacuum": {
                    factori_result.textContent = "エラー: 範囲内に素数がありません。";
                    break;
                }
                default: {
                    console.error(`予期せぬエラー: ${e.stack}`);
                    break;
                }
            }
        }
    }, false);

    factori_btn_2.addEventListener('click', () => {
        const factori_result_2 = document.getElementById('factori-result-2');
        if (!(factori_result_2 instanceof HTMLParagraphElement)) {
            console.error(`typeof factori-result-2 are not expected`);
            return;
        }
        factori_result_2.style.fontSize = '';
        factori_result_2.style.color = '';

        try {
            if (!cached_p.isCached()) {
                factori_result_2.textContent = "-";
            } else {

                const pred_p_tag = document.getElementById('factori-input-3');
                const pred_q_tag = document.getElementById('factori-input-4');

                if (!(pred_p_tag instanceof HTMLInputElement) || !(pred_q_tag instanceof HTMLInputElement)) {
                    const e = TypeError(`gotten types are not expected types`, { cause: `${pred_p_tag}, ${pred_q_tag}` });
                    console.error(`${e.stack}\n${e.cause}`);
                    return;
                }
                const pred_p = Number.parseInt(pred_p_tag.value), pred_q = Number.parseInt(pred_q_tag.value);
                if (!Number.isFinite(pred_p) || !Number.isFinite(pred_q)) {
                    throw new Error("keine zahl");
                }
                const cache = cached_p.getValue();

                const is_correct = util.isEqArray(cache, [pred_p, pred_q]) || util.isEqArray(cache, [pred_q, pred_p]);
                if (is_correct) {
                    factori_result_2.textContent = "〇";
                    factori_result_2.style.color = "red";
                } else {
                    factori_result_2.textContent = "×";
                    factori_result_2.style.color = "blue";
                }
            }
        } catch (e) {
            factori_result_2.style.fontSize = "1em";

            switch (e.message) {
                case "keine zahl":
                    factori_result_2.textContent = "エラー: 数値を入力して下さい。";
                    break;

                default:
                    factori_result_2.textContent = '';
                    console.error(`予期せぬエラー: ${e.stack}`);
                    break;
            }
        }
    }, false);


    hashb64_btn_E.addEventListener('click', async () => {
        const hashb64_input = document.getElementById('hashb64-input');
        const hashb64_result = document.getElementById('hashb64-result');
        const check = (hashb64_input instanceof HTMLInputElement) && (hashb64_result instanceof HTMLTextAreaElement);
        if (!check) {
            const e = TypeError(`gotten DOM types are not expected types`, { cause: `${hashb64_input}, ${hashb64_result}` });
            console.error(`${e.stack}\n${e.cause}`);
            return;
        }
        const result = await util.getHashb64(hashb64_input.value);
        hashb64_result.value = result;
    });


    miller_rabin_btn_E.addEventListener('click', () => {

        const input_E = document.getElementById('miller-rabin-input');
        const result_E = document.getElementById('miller-rabin-result');
        const check = (input_E instanceof HTMLInputElement) && (result_E instanceof HTMLParagraphElement);
        if (!check) {
            const e = TypeError(`gotten DOM types are not expected types`, { cause: `${input_E}, ${result_E}` });
            console.error(`${e.stack}\n${e.cause}`);
            return;
        }

        try {
            if (input_E.value === '') throw Error('keine zahl');

            const maybe_p = BigInt(input_E.value);
            const result = util.millerRabin(maybe_p);
            if (result) {
                result_E.textContent = (maybe_p >= 2n ** 64n) ? '多分素数' : '素数';
            } else {
                result_E.textContent = '素数ではない';
            }

        } catch (e) {

            switch (e.message) {
                case 'keine zahl':
                    result_E.textContent = "エラー: 数値を入力して下さい。";
                    break;

                case '引数は正の整数でなければなりません':
                    result_E.textContent = 'エラー: 正の整数を入力してください';
                    break;

                default:
                    if (e.message.includes('Cannot convert')) {
                        result_E.textContent = "エラー: 数値を入力して下さい。";
                    } else {
                        console.error(`予期せぬエラー: ${e.stack}`);
                    }
                    break;
            }
        }
    }, false);
}, false);

