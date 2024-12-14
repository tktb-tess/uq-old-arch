"use strict";

const base64_btn = document.getElementById("base64-btn");
const base64de_btn = document.getElementById("base64de-btn");

base64_btn.addEventListener("click", () => {
    const base64_input = document.getElementById("base64-input");
    const base64_result = document.getElementById("base64-result");
    base64_result.value =  Base64Encoder(base64_input.value);
}, false);

base64de_btn.addEventListener("click", () => {
    const base64de_input = document.getElementById("base64de-input");
    const base64de_result = document.getElementById("base64de-result");
    base64de_result.value = Base64Decoder(base64de_input.value);
}, false);

const Base64Encoder = (str) => {
    const utf8Arr = new TextEncoder().encode(str);
    const binStr = Array.from(utf8Arr, (bin) => String.fromCodePoint(bin)).join("");
    return btoa(binStr);
}

const Base64Decoder = (base64) => {
    const binStr = atob(base64);
    const utf8arr = Uint8Array.from(binStr, (c) => c.codePointAt(0));
    return new TextDecoder().decode(utf8arr);
}




