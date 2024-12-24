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
const p_generator_progress = document.getElementById('p-generator-progress'); // "計算中……" の表示
const prim_liste = [];

primListeHolen().then((json) => {
    const p_list = json.list;
    for (const p of p_list) {
        prim_liste.push(p);
    }
})


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
        console.error(`ein Ausnahme fange: ${e}`);
        base64de_result.value = "Error: Base64形式を入力してください";
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

async function primListeHolen() {
    try {
        const geholt = await fetch("/assets/prime_list.json");
        if (!geholt.ok) {
            throw new Error(`response status: ${geholt.status}`)
        }
        const json = await geholt.json();
        return json;
    } catch (e) {
        console.error(e.message);
    }
}

// max以下の素数の配列を返す
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

p_generator_btn.addEventListener('click', () => {
    delete p_generator_result.value; // 結果を一旦空に
    try {
        p_generator_result.value =  primListeKallen(p_generator_input_1.value, p_generator_input_2.value).join(" "); // 計算
    } catch (e) { // 諸々のエラー処理
        console.error(`ein Ausnahme fange: ${e}`);

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





