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
        console.error("ein Ausnahme fange: " + e);
        window.alert("Base64形式を入力してください");
    }
}, false);

class RSA {
    #p; #q; #pq; #phi_pq;
    
    constructor(val_p_, val_q_) {
        const val_p = Number(val_p_), val_q = Number(val_q_);
        if (Number.isNaN(val_p) || Number.isNaN(val_q)) {
            throw new TypeError("keineZahl");
        }
        this.#p = val_p;
        this.#q = val_q;
        this.#pq = val_p * val_q;
        this.#phi_pq = (val_p - 1) * (val_q - 1);
    }

    static primzahlIst(n_) {
        
    }

    // max以下の素数の配列を返す
    static primListeMachen(min_, max_) {
        const min = Number(min_), max = Number(max_);
        
        if (Number.isNaN(min) || Number.isNaN(max)) {
            throw new Error("keine Zahl");
        }
        if (max > 500000) {
            throw new Error("überschreitet Limit");
        }
        if (min > max) {
            return;
        }

        console.log(min); console.log(max);

        werker.postMessage([min, max]);
        console.log('message postete');
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
    try {
        RSA.primListeMachen(p_generator_input_1.value, p_generator_input_2.value);
    } catch (e) {
        console.error("ein Ausnahme fange: " + e);
        switch (e.message) {
            case "überschreitet Limit":
                p_generator_result.value = "最大値が大きすぎます。500000以下の値を入力して下さい。";
                break;
            case "keine Zahl":
                p_generator_result.value = "数値を入力して下さい。";
                break;
        }
        
    }
    
}, false);



function primListeMachen_1(min, max) {
    if(min > max) {
        return [];
    }
    const prim_liste = [...Array(max - 1)].map((_, i) => i + 2);

    for (let i = 0; i < prim_liste.length; i++) {
        const p_ = prim_liste[i];
        for (let j = i + 1; j < prim_liste.length; j++) {
            if (prim_liste[j] % p_ === 0) {
                prim_liste.splice(j, 1);
            }
        }
    }
    while (prim_liste[0] < min) {
        prim_liste.shift();
    }
    return prim_liste;
}

