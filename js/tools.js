"use strict";

const base64_btn = document.getElementById("base64-btn"); // ボタン共
const base64de_btn = document.getElementById("base64de-btn");
const base64_input = document.getElementById("base64-input"); // 入力欄
const base64_result = document.getElementById("base64-result"); // 結果欄
const base64de_input = document.getElementById("base64de-input");
const base64de_result = document.getElementById("base64de-result");
const p_generator_input_1 = document.getElementById('p-generator-input-1');
const p_generator_input_2 = document.getElementById('p-generator-input-2');
const p_generator_btn = document.getElementById('p-generator-btn');
const p_generator_result = document.getElementById('p-generator-result');
const werker = new Worker("prim_liste.js");

class Base64 {
    #str;
    #base64;

    // Base64エンコード
    encoder(_str) {
        this.#str = _str;
        const utf8Arr = new TextEncoder().encode(_str); // UTF-8(整数)にエンコード
        const binStr = Array.from(utf8Arr, (bin) => String.fromCodePoint(bin)).join(""); // ASCIIで対応する文字に置き換え連結し疑似的な文字列に
        this.#base64 = btoa(binStr); // Base64にエンコード
    }
    // Base64デコード
    decoder(_base64) {
        this.#base64 = _base64;
        const binStr = atob(_base64); // 疑似的な文字列にデコード
        const utf8arr = Uint8Array.from(binStr, (c) => c.codePointAt(0)); // UTF-8の整数配列に変換
        this.#str = new TextDecoder().decode(utf8arr); // UTF-8からデコード
    }

    getStr() {
        return this.#str;
    }

    getBase64() {
        return this.#base64;
    }
}

base64_btn.addEventListener("click", () => {
    const b64 = new Base64();
    b64.encoder(base64_input.value);
    base64_result.value = b64.getBase64();
}, false);

base64de_btn.addEventListener("click", () => {
    const b64 = new Base64();
    try {
        b64.decoder(base64de_input.value);
        base64de_result.value = b64.getStr();
    } catch (e) { // Base64以外が来たら警告
        console.error(e);
        window.alert("Base64形式を入力してください");
    }
}, false);

class RSA {
    #p; #q; #pq; #phi_pq;
    
    constructor(val_p, val_q) {
        if (typeof(val_p) !== 'number' || typeof(val_q) !== 'number') {
            throw new TypeError("Die Argumentstypen sind keine `number`.");
        }
        this.#p = val_p;
        this.#q = val_q;
        this.#pq = val_p * val_q;
        this.#phi_pq = (val_p - 1) * (val_q - 1);
    }

    static primzahlIst(n_) {
        const n = Number(n_);
        if (n === NaN) {
            throw new TypeError("Der Argumentstyp ist kein `number`.");
        }
        if (n < 2) return false;
        const limit = Math.floor(Math.sqrt(n));
        return true;
    }

    // max以下の素数の配列を返す
    static primListeMachen(min_, max_) {
        const min = Number(min_), max = Number(max_);
        if (min === NaN || max === NaN) {
            throw new TypeError("Das Argument ist kein `number`.");
        }
        if (max > 500000) {
            throw new Error("最大値が大きすぎます。\n500,000以下の値を入力してください。");
        }
        werker.postMessage([min, max]);
        console.log('message posted');
        return;
    }
}

if (window.Worker) {
    werker.onmessage = (e) => {
        console.log(e.data);
    };

} else {
    console.error("このブラウザではWeb workerがサポートされていません。");
}

p_generator_btn.addEventListener('click', () => {
    RSA.primListeMachen(p_generator_input_1.value, p_generator_input_2.value);
}, false);

