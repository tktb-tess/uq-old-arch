"use strict";

const base64_btn = document.getElementById("base64-btn"); // ボタン共
const base64de_btn = document.getElementById("base64de-btn");
const base64_input = document.getElementById("base64-input"); // 入力欄
const base64_result = document.getElementById("base64-result"); // 結果欄
const base64de_input = document.getElementById("base64de-input"); // 入力欄
const base64de_result = document.getElementById("base64de-result"); // 結果欄

class Base64 {
    // Base64エンコード
    static encoder(str) {
        const utf8Arr = new TextEncoder().encode(str); // UTF-8(整数)にエンコード
        const binStr = Array.from(utf8Arr, (bin) => String.fromCodePoint(bin)).join(""); // ASCIIで対応する文字に置き換え連結し疑似的な文字列に
        return btoa(binStr); // Base64にエンコード
    }
    // Base64デコード
    static decoder(base64) {
        const binStr = atob(base64); // 疑似的な文字列にデコード
        const utf8arr = Uint8Array.from(binStr, (c) => c.codePointAt(0)); // UTF-8の整数配列に変換
        return new TextDecoder().decode(utf8arr); // UTF-8からデコード
    }
}

base64_btn.addEventListener("click", () => {
    base64_result.value =  Base64.encoder(base64_input.value);
}, false);

base64de_btn.addEventListener("click", () => {
    try {
        base64de_result.value = Base64.decoder(base64de_input.value);
    } catch (e) { // Base64以外が来たら警告
        console.error(e);
        window.alert("Base64形式を入力してください");
    }
}, false);








