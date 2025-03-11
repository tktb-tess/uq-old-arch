// @ts-check

export default class Base64 {
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
            throw TypeError(`type did not match any expected types: string | ArrayBuffer`);
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

    getDataView() {
        return new DataView(this.#data);
    }

    toJSON() {
        return this.base64;
    }

    get [Symbol.toStringTag]() {
        return Base64.name;
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

    /**
     * SHA-256ハッシュのBase64
     * @param {string} str 
     * @returns 
     */
    static async getHashb64(str) {
        const encoded = new TextEncoder().encode(str);
        const hash = new Uint8Array(await crypto.subtle.digest('SHA-256', encoded));
        return Base64.binToB64(hash);
    }
}