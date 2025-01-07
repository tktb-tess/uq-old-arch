"use strict";

const base64_btn = document.getElementById("base64-btn"); // ボタン共
const base64de_btn = document.getElementById("base64de-btn");
const p_generator_btn = document.getElementById('p-generator-btn');
const factori_btn = document.getElementById('factori-btn');
const factori_btn_2 = document.getElementById('factori-btn-2');
const prim_liste = [];

class util {
    static getRandomInt(min, max) { // min以上, max未満の整数を返す
        return Math.floor(Math.random() * (max - min) + min);
    }

    static isEqArray(arr1, arr2) {
        if (arr1.length !== arr2.length) 
            return false;
        else {
            for (let i = 0; i < arr1.length; i++) {
                if (arr1[i] !== arr2[i])
                    return false;
            }
            return true;
        }
    }

    static async getHashb64(str) {
        const encoded = new TextEncoder().encode(str);
        const hash = new Uint8Array(await crypto.subtle.digest('SHA-256', encoded));
        const binstrarr = Array.from(hash, (byte) => String.fromCodePoint(byte));
        return btoa(binstrarr.join(''));
    }
}

async function primListeHolen() {
    try {
        const geholt = await fetch("/assets/json/prim_liste.json");
        if (!geholt.ok) 
            throw new Error(`response status: ${geholt.status}`);
        
        const json = await geholt.json();
        const p_list = json.list;

        for (const p of p_list) 
            prim_liste.push(p);
        
        console.log(`fetching \'prim_liste.json\' was successful!`);
        
        return;
    } catch (e) {
        throw new Error(e.message);
    }
}

primListeHolen().catch((err) => console.error(err.message));

class Base64 {
    #str; // テキスト
    #base64; // Base64

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

    // ゲッター
    getStr() {
        return this.#str;
    }

    getBase64() {
        return this.#base64;
    }
}

base64_btn.addEventListener('click', () => {
    const base64_input = document.getElementById('base64-input');
    const base64_result = document.getElementById('base64-result');
    const b64 = new Base64();
    b64.encoder(base64_input.value);
    base64_result.value = b64.getBase64();
}, false);

base64de_btn.addEventListener('click', () => {
    const b64 = new Base64();
    const base64de_input = document.getElementById('base64de-input');
    const base64de_result = document.getElementById('base64de-result');
    try {
        b64.decoder(base64de_input.value);
        base64de_result.value = b64.getStr();
    } catch (e) { // Base64以外が来たら警告
        console.error(`ein Ausnahme fange: ${e.message}`);
        base64de_result.value = "エラー: Base64形式を入力してください";
    }
}, false);

class RSA {
    #p; #q; #pq; #phi_pq;
    
    constructor(val_p_, val_q_) {
        const val_p = Number(val_p_), val_q = Number(val_q_);
        if (Number.isNaN(val_p) || Number.isNaN(val_q)) {
            throw new Error("keine Zahl");
        }
        this.#p = val_p;
        this.#q = val_q;
        this.#pq = val_p * val_q;
        this.#phi_pq = (val_p - 1) * (val_q - 1);
    }
}

// min以上max以下の素数の配列を返す
function primListeKallen(min_, max_) {
    if (min_ === "" || max_ === "")  // 空文字は弾く
        throw new Error("keine Zahl");
    
    const min = Number(min_), max = Number(max_);
    if (Number.isNaN(min) || Number.isNaN(max))  // 非数は弾く
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

p_generator_btn.addEventListener('click', () => {
    const p_generator_result = document.getElementById('p-generator-result');
    const p_generator_input_1 = document.getElementById('p-generator-input-1');
    const p_generator_input_2 = document.getElementById('p-generator-input-2');

    try {
        p_generator_result.value =  primListeKallen(p_generator_input_1.value, p_generator_input_2.value).join(" "); // 計算
    } catch (e) { // 諸々のエラー処理
        console.error(`ein Ausnahme fange: ${e.message}`);

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

class CachedPrime {
    static #p = NaN;
    static #q = NaN;

    static set(_p, _q) {
        this.#p = Number(_p);
        this.#q = Number(_q);
    }

    static get() {
        return [this.#p, this.#q];
    }

    static isNaN() {
        return Number.isNaN(this.#p) || Number.isNaN(this.#q);
    }
}

factori_btn.addEventListener('click', () => { // 素数生成
    const factori_seego = document.getElementById('factori-seego');
    const factori_result = document.getElementById('factori-result');
    const factori_result_2 = document.getElementById('factori-result-2');
    const input_min = document.getElementById('factori-input-1');
    const input_max = document.getElementById('factori-input-2');

    factori_seego.style.visibility = null;
    factori_result.style.fontSize = null;
    CachedPrime.set(NaN, NaN);
    
    factori_result_2.textContent = "-";
    factori_result_2.style.color = null;
    factori_result_2.style.fontSize = null;
    
    try {
        const p_list = primListeKallen(input_min.value, input_max.value);
        const p = Number(p_list[util.getRandomInt(0, p_list.length)]);
        const q = Number(p_list[util.getRandomInt(0, p_list.length)]);

        if (Number.isNaN(p) || Number.isNaN(q)) {
            throw new Error("Out of range");
        }
        factori_result.textContent = p * q;
        CachedPrime.set(p, q);
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
        if (CachedPrime.isNaN()) {
            factori_result_2.textContent = "-";
        } else {
            const pred_p_tag = document.getElementById('factori-input-3');
            const pred_q_tag = document.getElementById('factori-input-4');

            if (pred_p_tag.value === "" || pred_q_tag.value === "") {
                throw new Error("keine Zahl");
            }
            const pred_p = Number(pred_p_tag.value);
            const pred_q = Number(pred_q_tag.value);
    
            if (Number.isNaN(pred_p) || Number.isNaN(pred_q)) {
                throw new Error("keine Zahl");
            }

            const is_correct = util.isEqArray(CachedPrime.get(), [pred_p, pred_q]) || util.isEqArray(CachedPrime.get(), [pred_q, pred_p]);
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
                factori_result_2.textContent = "不明なエラー";
                break;
        }
    }
}, false);




