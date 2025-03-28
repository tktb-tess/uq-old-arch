// @ts-check
import * as util from './modules/util.js';
import RSA from './modules/rsa.js';
import Base64 from './modules/base64.js';
import PCGMinimal from './modules/pcg_minimal.js';

document.addEventListener('DOMContentLoaded', async () => {

    class CachedPrime {
        /**
         * @type {[number, number] | null}
         */
        #data;

        constructor() {
            this.#data = null;
        }

        /**
         * 
         * @param {number} p 
         * @param {number} q 
         */
        setValue(p, q) {
            if (typeof p !== 'number' || typeof q !== 'number') throw TypeError('引数型は \`number\` でなければなりません。', { cause: [p, q] });
            if (!Number.isFinite(p) || !Number.isFinite(q)) throw Error('keine zahl');
            this.#data = [p, q];
        }

        getValue() {
            if (this.#data) return this.#data;
            else throw Error(`CachedPrime is empty`, { cause: this });
        }

        delete() {
            this.#data = null;
        }

        isCached() {
            return !!this.#data;
        }
    }


    // 素数表の読み込み
    const fetchPrimListe = async () => {
        const geholt = await fetch("/assets/bin/primzahlen.bin");
        if (!geholt.ok) throw Error(`failed to fetch\nresponse status: ${geholt.status}`, { cause: geholt });

        const bin = await geholt.bytes();

        /** @type {number[]} */
        const result = [];

        for (let i = 0; i < bin.length; i++) {
            let byte = bin[i];
            for (let j = 0; j < 8; j++) {
                if (byte & (1 << j)) result.push(8 * i + j);
            }
        }
        const r = { p_list: Uint32Array.from(result), b64: new Base64(bin.buffer) };
        console.log(`fetching \`primzahlen.bin\` was successful`);
        return r;
    };



    const tools = await fetchPrimListe()
        .then(async (result) => {

            const date = new Date().toISOString();
            const utf8 = new TextEncoder().encode(date);
            const hash = new Base64(await crypto.subtle.digest('SHA-256', utf8));

            console.log(`all works was successful!`);
            return {
                prim_liste: result.p_list,
                hash_b64: hash,
                exEuclidean: util.exEuclidean,
                factorial: util.factorial,
                getRndBI: util.getRndBI,
                getRndInt: util.getRndInt,
                isEqArray: util.isEqArray,
                lazify: util.lazify,
                lazyExec: util.lazyExec,
                millerRabin: util.millerRabin,
                modPow: util.modPow,
                toBigInt: util.toBigInt,
                typeOf: util.typeOf,
                getRandIntFromDate: util.getRandIntFromDate,
                Base64,
                RSA,
                PCGMinimal,
            }

        })
        .catch((e) => {
            if (e instanceof Error) {
                return e;
            } else {
                return Error('unidentified error!', { cause: e });
            }
        });

    if (tools instanceof Error) {
        console.error(`works failed: ${tools.stack}`, tools.cause);
        return false;
    }

    Object.freeze(tools);

    Object.defineProperties(window, {
        tools: {
            value: tools,
        },
    });


    /**
     * min以上max以下の素数の配列を返す
     * @param {number} min 
     * @param {number} max 
     * @returns 
     */
    const primListeKallen = (min, max) => {
        // type guard
        if (typeof min !== 'number' || typeof max !== 'number') throw TypeError('引数は \`number\` 型でなければなりません。');


        if (min < 0 || min > 2 ** 26 - 1 || max < 0 || max > 2 ** 26 - 1) throw Error("außerhalb der spanne");

        if (min > max) return new Uint32Array(0);

        let min_index = 0, max_index = tools.prim_liste.length - 1;

        while (tools.prim_liste[min_index] < min) min_index++;

        while (tools.prim_liste[max_index] > max) max_index--;

        const p_list_itibu = tools.prim_liste.slice(min_index, max_index + 1);

        return p_list_itibu;
    };

    /* イベントリスナー */

    const base64_btn = document.getElementById("base64-btn"); // ボタン共
    const base64de_btn = document.getElementById("base64de-btn");
    const p_generator_btn = document.getElementById('p-generator-btn');
    const factori_btn = document.getElementById('factori-btn');
    const factori_btn_2 = document.getElementById('factori-btn-2');
    const hashb64_btn_E = document.getElementById('hashb64-btn');
    const miller_rabin_btn_E = document.getElementById('miller-rabin-btn');
    const cached_p = new CachedPrime();

    if (!(base64_btn instanceof HTMLButtonElement)) {
        console.error(TypeError(`couldn't get base64-btn`));
        return;
    } else if (!(base64de_btn instanceof HTMLButtonElement)) {
        console.error(TypeError(`couldn't get base64de-btn`));
        return;
    } else if (!(p_generator_btn instanceof HTMLButtonElement)) {
        console.error(TypeError(`couldn't get p-generator-btn`));
        return;
    } else if (!(factori_btn instanceof HTMLButtonElement)) {
        console.error(TypeError(`couldn't get factori-btn`));
        return;
    } else if (!(factori_btn_2 instanceof HTMLButtonElement)) {
        console.error(TypeError(`couldn't get factori-btn-2`));
        return;
    } else if (!(hashb64_btn_E instanceof HTMLButtonElement)) {
        console.error(TypeError(`couldn't get hash64-btn`));
        return;
    } else if (!(miller_rabin_btn_E instanceof HTMLButtonElement)) {
        console.error(TypeError(`couldn't get miller-rabin-btn`));
        return;
    }

    base64_btn.addEventListener('click', () => {
        const base64_input = document.getElementById('base64-input');
        const base64_result = document.getElementById('base64-result');
        const val = (base64_input instanceof HTMLInputElement) && (base64_result instanceof HTMLTextAreaElement);
        if (!val) {
            console.error(TypeError(`DOM types are not expected`).stack, [base64_input, base64_result]);
            return;
        }

        base64_result.value = Base64.encode(base64_input.value);
    }, false);

    base64de_btn.addEventListener('click', () => {
        const base64de_input = document.getElementById('base64de-input');
        const base64de_result = document.getElementById('base64de-result');
        if (!(base64de_input instanceof HTMLInputElement) || !(base64de_result instanceof HTMLTextAreaElement)) {
            console.error(TypeError(`DOM types are not expected`).stack, [base64de_input, base64de_result]);
            return;
        }

        try {
            base64de_result.value = Base64.decode(base64de_input.value);
        } catch (e) { // Base64以外が来たら警告
            base64de_result.value = "エラー: Base64形式を入力してください";
        }
    }, false);


    p_generator_btn.addEventListener('click', () => {
        const p_generator_result = document.getElementById('p-generator-result');
        const p_generator_input_1 = document.getElementById('p-generator-input-1');
        const p_generator_input_2 = document.getElementById('p-generator-input-2');
        if (!(p_generator_input_1 instanceof HTMLInputElement
            && p_generator_input_2 instanceof HTMLInputElement
            && p_generator_result instanceof HTMLTextAreaElement)) {
            console.error(`failed to get p-generator-input`);
            return;
        }
        try {
            const value_1 = Number.parseInt(p_generator_input_1.value), value_2 = Number.parseInt(p_generator_input_2.value);
            if (!Number.isFinite(value_1) || !Number.isFinite(value_2)) {
                throw Error('keine zahl');
            }
            p_generator_result.value = primListeKallen(value_1, value_2).join(" "); // 計算
        } catch (e) { // 諸々のエラー処理
            if (!(e instanceof Error)) {
                console.error(Error(`予期せぬエラー`).stack, e);
                return;
            }

            switch (e.message) {
                case "außerhalb der spanne": {
                    p_generator_result.value = "エラー: 範囲外の数値です。0以上67,108,864未満の値を入力して下さい。";
                    break;
                }

                case "keine zahl": {
                    p_generator_result.value = "エラー: 数値を入力して下さい。";
                    break;
                }
                default: {
                    console.error(`予期せぬエラー: ${e.stack}`);
                    break;
                }
            }
        }
    }, false);

    factori_btn.addEventListener('click', () => { // 素数生成
        const factori_seego = document.getElementById('factori-seego');
        const factori_result = document.getElementById('factori-result');
        const factori_result_2 = document.getElementById('factori-result-2');
        const input_min = document.getElementById('factori-input-1');
        const input_max = document.getElementById('factori-input-2');

        if (!(factori_seego instanceof HTMLDivElement)) {
            console.error(`couldn't get factori-seego`, factori_seego);
            return;
        } else if (!(factori_result instanceof HTMLParagraphElement)) {
            console.error(`couldn't get factori-result`, factori_result);
            return;
        } else if (!(factori_result_2 instanceof HTMLParagraphElement)) {
            console.error(`couldn't get factori-result-2`, factori_result_2);
            return;
        } else if (!(input_min instanceof HTMLInputElement)) {
            console.error(`couldn't get factori-input-1`, input_min);
            return;
        } else if (!(input_max instanceof HTMLInputElement)) {
            console.error(`couldn't get factori-input-2`, input_max);
            return;
        }

        factori_seego.style.visibility = '';
        factori_result.style.fontSize = '';
        cached_p.delete();

        factori_result_2.textContent = "-";
        factori_result_2.style.color = '';
        factori_result_2.style.fontSize = '';

        try {
            const min = Number.parseInt(input_min.value), max = Number.parseInt(input_max.value);
            if (!Number.isFinite(min) || !Number.isFinite(max)) throw Error('keine zahl');
            const p_list = primListeKallen(min, max);
            if (p_list.length === 0) throw Error('vacuum');
            const p = p_list.at(util.getRndInt(0, p_list.length));
            const q = p_list.at(util.getRndInt(0, p_list.length));

            if (!p || !q) throw TypeError('');
            factori_result.textContent = String(p * q);
            cached_p.setValue(p, q);
            factori_seego.style.visibility = "visible";
        } catch (e) {
            factori_result.style.fontSize = "1em";
            if (!(e instanceof Error)) {
                const er = Error('予期せぬエラー', { cause: e });
                console.error(er.stack, er.cause);
                return;
            }

            switch (e.message) {
                case "außerhalb der spanne": {
                    factori_result.textContent = "エラー: 範囲外の数値です。0以上67,108,864未満の値を入力して下さい。";
                    break;
                }
                case "keine zahl": {
                    factori_result.textContent = "エラー: 数値を入力して下さい。";
                    break;
                }
                case "vacuum": {
                    factori_result.textContent = "エラー: 範囲内に素数がありません。";
                    break;
                }
                default: {
                    console.error(`予期せぬエラー: ${e.stack}`);
                    break;
                }
            }
        }
    }, false);

    factori_btn_2.addEventListener('click', () => {
        const factori_result_2 = document.getElementById('factori-result-2');
        if (!(factori_result_2 instanceof HTMLParagraphElement)) {
            console.error(`typeof factori-result-2 are not expected`);
            return;
        }
        factori_result_2.style.fontSize = '';
        factori_result_2.style.color = '';

        try {
            if (!cached_p.isCached()) {
                factori_result_2.textContent = "-";
            } else {

                const pred_p_tag = document.getElementById('factori-input-3');
                const pred_q_tag = document.getElementById('factori-input-4');

                if (!(pred_p_tag instanceof HTMLInputElement) || !(pred_q_tag instanceof HTMLInputElement)) {
                    const e = TypeError(`typeof factori-input-3, -4 are not expected type ${HTMLInputElement.prototype}`, { cause: [pred_p_tag, pred_q_tag] });
                    console.error(`${e.stack}\n${e.cause}`);
                    return;
                }
                const pred_p = Number.parseInt(pred_p_tag.value), pred_q = Number.parseInt(pred_q_tag.value);
                if (!Number.isFinite(pred_p) || !Number.isFinite(pred_q)) {
                    throw new Error("keine zahl");
                }
                const cache = cached_p.getValue();

                const is_correct = util.isEqArray(cache, [pred_p, pred_q]) || util.isEqArray(cache, [pred_q, pred_p]);
                if (is_correct) {
                    factori_result_2.textContent = "〇";
                    factori_result_2.style.color = "red";
                } else {
                    factori_result_2.textContent = "×";
                    factori_result_2.style.color = "blue";
                }
            }
        } catch (e) {
            factori_result_2.style.fontSize = "1em";
            if (!(e instanceof Error)) {
                console.error(Error('予期せぬエラー').stack, e);
                return;

            }

            switch (e.message) {
                case "keine zahl":
                    factori_result_2.textContent = "エラー: 数値を入力して下さい。";
                    break;

                default:
                    factori_result_2.textContent = '';
                    console.error(`予期せぬエラー: ${e.stack}`);
                    break;
            }
        }
    }, false);


    hashb64_btn_E.addEventListener('click', async () => {
        const hashb64_input = document.getElementById('hashb64-input');
        const hashb64_result = document.getElementById('hashb64-result');
        const check = (hashb64_input instanceof HTMLInputElement) && (hashb64_result instanceof HTMLTextAreaElement);

        if (!check) {
            const e = TypeError(`gotten DOM types are not expected types`, { cause: [hashb64_input, hashb64_result] });
            console.error(e.stack, e.cause);
            return;
        }
        const result = await Base64.getHashb64(hashb64_input.value);
        hashb64_result.value = result;
    });


    miller_rabin_btn_E.addEventListener('click', () => {

        const input_E = document.getElementById('miller-rabin-input');
        const result_E = document.getElementById('miller-rabin-result');
        const check = (input_E instanceof HTMLInputElement) && (result_E instanceof HTMLParagraphElement);

        if (!check) {
            const e = TypeError(`DOM types are not expected types`, { cause: [input_E, result_E] });
            console.error(e.stack, e.cause);
            return;
        }

        try {
            if (input_E.value === '') throw Error('keine zahl');

            const maybe_p = BigInt(input_E.value);
            const result = util.millerRabin(maybe_p);
            if (result) {
                result_E.textContent = (maybe_p >= 2n ** 64n) ? '多分素数' : '素数';
            } else {
                result_E.textContent = '素数ではない';
            }

        } catch (e) {
            if (!(e instanceof Error)) {
                const er = Error('予期せぬエラー', { cause: e });
                console.error(er.stack, er.cause);
                return;
            }

            switch (e.message) {
                case 'keine zahl':
                    result_E.textContent = "エラー: 数値を入力して下さい。";
                    break;

                case '引数は正の整数でなければなりません':
                    result_E.textContent = 'エラー: 正の整数を入力してください';
                    break;

                default:
                    if (e.message.includes('Cannot convert')) {
                        result_E.textContent = "エラー: 数値を入力して下さい。";
                    } else {
                        console.error(`予期せぬエラー: ${e.stack}`);
                    }
                    break;
            }
        }
    }, false);
}, false);

export {};

