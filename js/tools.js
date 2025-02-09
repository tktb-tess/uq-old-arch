"use strict";

/**
 * @type {number[]}
 */
const prim_liste = [];

class util {
    /**
     * min以上, max未満の整数を返す
     * @param {number} min 
     * @param {number} max 
     * @returns 範囲内の整数乱数
     */
    static getRndInt(min, max) { // 
        return Math.floor(Math.random() * (max - min) + min);
    }

    /**
     * 
     * @param {any[]} arr1 
     * @param {any[]} arr2 
     * @returns 
     */
    static isEqArray(arr1, arr2) {
        if (arr1.length !== arr2.length) 
            return false;
        else {
            for (let i = 0; i < arr1.length; i++) {
                if (arr1.at(i) !== arr2.at(i)) return false;
            }
            return true;
        }
    }

    /**
     * SHA-256ハッシュのBase64
     * @param {string} str 
     * @returns 
     */
    static async getHashb64(str) {
        const encoded = new TextEncoder().encode(str);
        const hash = new Uint8Array(await crypto.subtle.digest('SHA-256', encoded));
        return util.binToB64(hash);
    }

    /**
     * バイナリデータをBase64形式のテキストに変換する
     * @param {Uint8Array} bin バイナリデータ
     */
    static binToB64(bin) {
        return btoa(Array.from(bin, n => String.fromCodePoint(n)).join(''));
    }

    /**
     * Base64テキストをバイナリデータに変換する
     * @param {string} base64 
     */
    static b64ToBin(base64) {
        return Uint8Array.from(atob(base64), s => s.charCodeAt(0));
    }

    /**
     * min以上max以下の素数の配列を返す
     * @param {number} min 
     * @param {number} max 
     * @returns 
     */
    static primListeKallen(min, max) {
        // type guard
        if (typeof min !== 'number' || typeof max !== 'number') throw TypeError('引数は \`number\` 型でなければなりません。');
        
        if (!Number.isFinite(min) || !Number.isFinite(max))  // 非数は弾く
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
}

async function primListeHolen() {
    try {
        const geholt = await fetch("/assets/misc/primzahlen.bin");
        if (!geholt.ok) throw new Error(`response status: ${geholt.status}`);
        
        const bin = await geholt.bytes();
        const p_list = Array.from(bin, bit => bit.toString(16).padStart(2, '0')).join('').match(/.{6}/g).map(s => Number.parseInt(s, 16));

        p_list.forEach((p) => {
            prim_liste.push(p);
        });
        
        console.log(`fetching \'prim_liste.json\' was successful!`);
        
        return;
    } catch (e) {
        throw new Error(e.message);
    }
}

primListeHolen().catch((err) => console.error(err.message));

class Base64 {

    constructor() { throw TypeError('class \`Base64\` cannot construct!'); };

    /**
     * Base64エンコード
     * @param {string} text テキスト
     * @returns エンコードされたBase64テキスト
     */
    static encode(text) {
        const utf8Arr = new TextEncoder().encode(text); // UTF-8(整数)にエンコード
        return util.binToB64(utf8Arr);
    }

    /**
     * Base64デコード
     * @param {string} base64 Base64テキスト
     * @returns デコードされたテキスト
     */
    static decode(base64) {
        const binStr = util.b64ToBin(base64); // 疑似的な文字列にデコード
        return new TextDecoder().decode(binStr);
    }
}



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

class CachedPrime {
    /**
     * @type {[number, number] | null}
     */
    static #data = null;

    constructor() {
        throw TypeError('Cannot construct!');
    }

    /**
     * 
     * @param {number} p 
     * @param {number} q 
     */
    static setValue(p, q) {
        if (typeof p !== 'number' || typeof q !== 'number') throw TypeError('引数型は \`number\` でなければなりません。')
        if (!Number.isFinite(p) || !Number.isFinite(q)) throw Error('引数が不正です。');

        this.#data = [p, q];
    }

    static getValue() {
        return this.#data;
    }

    static delete() {
        this.#data = null;
    }

    static isCached() {
        return !!this.#data;
    }
}

Object.toString = () => {
    console.log('called toString!');
    return 'おぶじぇ';
}


/* イベントリスナー */

const base64_btn = document.getElementById("base64-btn"); // ボタン共
const base64de_btn = document.getElementById("base64de-btn");
const p_generator_btn = document.getElementById('p-generator-btn');
const factori_btn = document.getElementById('factori-btn');
const factori_btn_2 = document.getElementById('factori-btn-2');

base64_btn.addEventListener('click', () => {
    const base64_input = document.getElementById('base64-input');
    const base64_result = document.getElementById('base64-result');
    base64_result.value = Base64.encode(base64_input.value);
}, false);

base64de_btn.addEventListener('click', () => {
    const base64de_input = document.getElementById('base64de-input');
    const base64de_result = document.getElementById('base64de-result');
    try {
        base64de_result.value = Base64.decode(base64de_input.value);
    } catch (e) { // Base64以外が来たら警告
        console.error(`ein Ausnahme fange: ${e.message}`);
        base64de_result.value = "エラー: Base64形式を入力してください";
    }
}, false);

p_generator_btn.addEventListener('click', () => {
    const p_generator_result = document.getElementById('p-generator-result');
    const p_generator_input_1 = document.getElementById('p-generator-input-1');
    const p_generator_input_2 = document.getElementById('p-generator-input-2');
    if (!(p_generator_input_1 instanceof HTMLInputElement && p_generator_input_2 instanceof HTMLInputElement)) return;
    try {
        const value_1 = Number.parseInt(p_generator_input_1.value), value_2 = Number.parseInt(p_generator_input_2.value);
        p_generator_result.value =  util.primListeKallen(value_1, value_2).join(" "); // 計算
    } catch (e) { // 諸々のエラー処理
        
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

factori_btn.addEventListener('click', () => { // 素数生成
    const factori_seego = document.getElementById('factori-seego');
    const factori_result = document.getElementById('factori-result');
    const factori_result_2 = document.getElementById('factori-result-2');
    const input_min = document.getElementById('factori-input-1');
    const input_max = document.getElementById('factori-input-2');

    factori_seego.style.visibility = null;
    factori_result.style.fontSize = null;
    CachedPrime.delete();
    
    factori_result_2.textContent = "-";
    factori_result_2.style.color = null;
    factori_result_2.style.fontSize = null;
    
    try {
        const min = Number.parseInt(input_min.value), max = Number.parseInt(input_max.value);
        const p_list = util.primListeKallen(min, max);
        const p = p_list.at(util.getRndInt(0, p_list.length));
        const q = p_list.at(util.getRndInt(0, p_list.length));

        if (!p || !q) {
            throw new Error("Out of range");
        }
        factori_result.textContent = p * q;
        CachedPrime.setValue(p, q);
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
        if (!CachedPrime.isCached()) {
            factori_result_2.textContent = "-";
        } else {
            const pred_p_tag = document.getElementById('factori-input-3');
            const pred_q_tag = document.getElementById('factori-input-4');

            const pred_p = Number.parseInt(pred_p_tag.value), pred_q = Number.parseInt(pred_q_tag.value);
            if (!Number.isFinite(pred_p) || !Number.isFinite(pred_q)) {
                throw new Error("keine Zahl");
            }

            const is_correct = util.isEqArray(CachedPrime.getValue(), [pred_p, pred_q]) || util.isEqArray(CachedPrime.getValue(), [pred_q, pred_p]);
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

const hashb64_btn_E = document.getElementById('hashb64-btn');
hashb64_btn_E.addEventListener('click', async () => {
    const hashb64_input = document.getElementById('hashb64-input');
    const hashb64_result = document.getElementById('hashb64-result');
    const result = await util.getHashb64(hashb64_input.value);
    hashb64_result.value = result;
});


