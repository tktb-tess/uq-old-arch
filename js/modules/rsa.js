// @ts-check
import { millerRabin, getRndBI, modPow, exEuclidean } from './util.js';
import Base64 from './base64.js';

export default class RSA {
    #p;
    #q;
    static get #e() { return 65537n };
    #d;

    get [Symbol.toStringTag]() {
        return RSA.name;
    }


    /**
     * @param {number} bits 
     */
    constructor(bits = 128) {
        if (typeof bits !== 'number') throw TypeError('type error! `number` 型でなければいけません', { cause: bits });

        loop: while (true) {
            let [p_, q_] = [1n, 1n];
            let counter = 0;
            while (!millerRabin(p_)) {
                p_ = getRndBI(bits, true);
                counter++;
                if (counter > 10000) throw Error('failed to construct.');
            }
            counter = 0;
            while (!millerRabin(q_)) {
                q_ = getRndBI(bits, true);
                counter++;
                if (counter > 10000) throw Error('failed to construct.');
            }

            this.#p = p_;
            this.#q = q_;

            // λ(pq) = LCM(p-1, q-1) = (p-1) * (q-1) / GCD(p-1, q-1)
            const lambda = (() => {
                const phi = (p_ - 1n) * (q_ - 1n);
                const gcd = exEuclidean(p_ - 1n, q_ - 1n).gcd;
                
                return phi / gcd;
            })();
            
            const result = exEuclidean(RSA.#e, lambda);

            if (result.gcd !== 1n) continue loop;

            this.#d = (() => {
                let d_ = result.x;
                while (d_ < 0n) d_ += lambda;
                return d_;
            })();

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
        if (n_hexstr.length & 1) n_hexstr = '0' + n_hexstr;

        let e_hexstr = RSA.#e.toString(16);
        if (e_hexstr.length & 1) e_hexstr = '0' + e_hexstr;

        const key_bin_str = n_hexstr + '0000' + e_hexstr;
        const key_bin = Uint8Array.from(key_bin_str.match(/.{2}/g) ?? [], n => Number.parseInt(n, 16));
        return key_bin.buffer;
    }

    /**
     * 暗号化
     * @param {string} text 平文
     * @returns Base64形式の暗号文
     */
    encrypt(text) {
        const radix = this.#p * this.#q;
        const utf8 = new TextEncoder().encode(text);
        const m_hexstr = Array.from(utf8, n => n.toString(16).padStart(2, '0')).join('');
        let m_bigint = BigInt('0x' + m_hexstr);

        const c_arr = [];
        while (m_bigint > 0n) {
            const m_one = m_bigint % radix;

            const c_one = modPow(m_one, RSA.#e, radix);

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
        return Base64.binToB64(c_bin.buffer);
    }

    /**
     * 復号
     * @param {string} base64 Base64形式の暗号文
     * @returns 平文
     */
    decrypt(base64) {
        const radix = this.#p * this.#q;
        const c_bin = new Uint8Array(Base64.b64ToBin(base64));
        const c_hexstr = Array.from(c_bin, n => n.toString(16).padStart(2, '0')).join('');
        let c_bigint = BigInt('0x' + c_hexstr);

        /** @type {bigint[]} */
        const m_arr = [];

        while (c_bigint > 0n) {
            const c_one = c_bigint % radix;

            const m_one = modPow(c_one, this.#d, radix);

            m_arr.push(m_one);

            c_bigint /= radix;
        }

        let m_bigint = 0n;

        for (let i = 0n; i < m_arr.length; i++) {
            m_bigint += m_arr[Number(i)] * radix ** i;
        }

        let m_hexstr = m_bigint.toString(16);

        if (m_hexstr.length & 1) m_hexstr = '0' + m_hexstr;

        const utf8 = Uint8Array.from(m_hexstr.match(/.{2}/g) ?? [], n => Number.parseInt(n, 16));

        return new TextDecoder().decode(utf8);
    }
}