"use strict";

const base64_btn = document.getElementById("base64-btn"); // ボタン共
const base64de_btn = document.getElementById("base64de-btn");
const p_generator_btn = document.getElementById('p-generator-btn');
const factori_btn = document.getElementById('factori-btn');
const factori_btn_2 = document.getElementById('factori-btn-2');
const prim_liste = [];

async function primListeHolen() {
    try {
        const geholt = await fetch("/assets/json/prim_liste.json");
        if (!geholt.ok) {
            throw new Error(`response status: ${geholt.status}`)
        }
        const json = await geholt.json();
        const p_list = json.list;

        for (const p of p_list) {
            prim_liste.push(p);
        }
        return "fetch \'prim_liste.json\' successful";
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

base64_btn.addEventListener("click", () => {
    const base64_input = document.getElementById('base64-input');
    const base64_result = document.getElementById('base64-result');
    const b64 = new Base64();
    b64.encoder(base64_input.value);
    base64_result.value = b64.getBase64();
}, false);

base64de_btn.addEventListener("click", () => {
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
            throw new TypeError("keineZahl");
        }
        this.#p = val_p;
        this.#q = val_q;
        this.#pq = val_p * val_q;
        this.#phi_pq = (val_p - 1) * (val_q - 1);
    }
}

// min以上max以下の素数の配列を返す
function primListeKallen(min_, max_) {
    if (min_ === "" || max_ === "") { // 空文字は弾く
        throw new Error("keine Zahl");
    }
    const min = Number(min_), max = Number(max_);
    if (Number.isNaN(min) || Number.isNaN(max)) { // 非数は弾く
        throw new Error("keine Zahl");
    }
    if (max > 1000000) { // 1,000,000より大きいのを弾く
        throw new Error("Limit überschreitet");
    }
    if (min > max) { // minの方がデカかったら空のままにする
        return [];
    }

    let p_list_itibu = [...prim_liste];

    while (p_list_itibu[0] < min) {
        p_list_itibu.shift();
    }
    while (p_list_itibu[p_list_itibu.length - 1] > max) {
        p_list_itibu.pop();
    }
    return p_list_itibu;
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
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
        }
    }
}, false);

class Cached {
    static p = null;
    static q = null;
}


factori_btn.addEventListener('click', () => { // 素数生成
    const factori_seego = document.getElementById('factori-seego');
    factori_seego.style.display = null;
    Cached.p = null, Cached.q = null;
    const factori_result_2 = document.getElementById('factori-result-2');
    factori_result_2.textContent = "-";
    factori_result_2.style.color = null;

    const factori_result = document.getElementById('factori-result');
    const input_min = document.getElementById('factori-input-1');
    const input_max = document.getElementById('factori-input-2');
    
    try {
        const p_list = primListeKallen(input_min.value, input_max.value);
        const p = p_list[getRandomInt(0, p_list.length - 1)];
        const q = p_list[getRandomInt(0, p_list.length - 1)];

        if (isNaN(p) || isNaN(q)) {
            throw new Error("Out of range");
        }
        factori_result.textContent = p * q;
        Cached.p = p, Cached.q = q;

        
        factori_seego.style.display = "block";
    } catch (e) {
        console.error(`ein Ausnahme fange: ${e.message}`);

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

        }
    }
}, false);

factori_btn_2.addEventListener('click', () => {
    const factori_result_2 = document.getElementById('factori-result-2');

    try {
        if (Cached.p === null || Cached.q === null) {
            factori_result_2.textContent = "-";
            factori_result_2.style.color = null;
        } else {
            const pred_p_elem = document.getElementById('factori-input-3');
            const pred_q_elem = document.getElementById('factori-input-4');

            if (pred_p_elem.value === "" || pred_q_elem.value === "") {
                throw new Error("keine Zahl");
            }
            const pred_p = Number(pred_p_elem.value);
            const pred_q = Number(pred_q_elem.value);
    
            if (isNaN(pred_p) || isNaN(pred_q)) {
                throw new Error("keine Zahl");
            }
            if ((pred_p === Cached.p && pred_q === Cached.q) || (pred_p === Cached.q && pred_q === Cached.p)) {
                factori_result_2.textContent = "〇";
                factori_result_2.style.color = "red";
            } else {
                factori_result_2.textContent = "×";
                factori_result_2.style.color = "blue";
            }
        }
    } catch (e) {
        console.error(`ein Ausnahme fange: ${e.message}`);
        switch (e.message) {
            case "keine Zahl":
                factori_result_2.textContent = "エラー: 数値を入力して下さい。";
                factori_result_2.style.color = null;
                break;
        }
    }
}, false);




