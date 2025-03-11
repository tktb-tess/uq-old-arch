// @ts-check
import { getRandIntFromDate } from "./modules/util.js";

document.addEventListener('DOMContentLoaded', async () => {
    /**
     * @typedef {{ id: number, form: string }} Entry
     * @typedef {{ id: number, sentence: string, translation: string, supplement: string, tags: string[], words: {id: number}[], offer: { catalog: string, number: number }}} Example
     * @typedef {{ entry: Entry, translations: { title: string, forms: string[] }[], tags: string[], contents: { title: string, text: string }[], variations: { title: string, form: string, }[], relations: { title: string, entry: Entry }[]}} Word
     * @typedef {{ explanation: string, punctuations: string[], pronounciationTitle: string, enableMarkdown: boolean}} ZpDICConfig
     * @typedef {{ words: Word[], examples: Example[], zpdicOnline: ZpDICConfig, version?: 1 | 2}} OTMJSON
     * 
     */

    const fetchOTMJSON = async () => {

        const url = '/assets/json/vl-ja.otm.json';

        const response = await fetch(url);

        if (!response.ok) return Error(`failed to fetch!\nresponse status: ${response.status}`, { cause: response });

        /**
         * @type {OTMJSON}
         */
        const parsed = await response.json();

        return parsed;
    }

    const otm_json = await fetchOTMJSON();

    if (otm_json instanceof Error) {
        console.error(otm_json.stack, otm_json.cause);
        return false;
    }
    
    
    
    
    Object.defineProperty(window, 'otm_json', {
        get() {
            return otm_json;
        },
        enumerable: true,
    });

    const words = otm_json.words;
    

    console.log(`fetching 'vl-ja-otm.json' was successful!`);

    // 日替わり乱数を取得
    const random = await getRandIntFromDate() % words.length;

    const today_word_entry = words[random];
    const vocabulary = today_word_entry.entry.form;
    const translations = today_word_entry.translations;

    // コンテナ
    const today_word_E = document.getElementById('today-word');
    if (!(today_word_E instanceof HTMLDivElement)) {
        const e = Error(`type of today_word_E is not expected ${HTMLDivElement.prototype}`, { cause: today_word_E });
        console.error(e.stack, e.cause);
        return false;
    }

    // 語彙
    const vocabulary_E = document.createElement('p');
    vocabulary_E.classList.add('vocabulary');
    vocabulary_E.textContent = vocabulary;
    today_word_E.appendChild(vocabulary_E);

    // 発音記号
    const pronunciation_E = document.createElement('p');
    pronunciation_E.classList.add('pronunciation');
    const pronunciation = today_word_entry.contents.find((content) => content.title === 'Pronunciation');

    if (pronunciation) {
        if (pronunciation.text.includes('/')) {
            pronunciation_E.textContent = pronunciation.text;
        } else {
            pronunciation_E.textContent = `/${pronunciation.text}/`;
        }
    }

    today_word_E.appendChild(pronunciation_E);

    // "訳"
    const yaku_E = document.createElement('p');
    yaku_E.classList.add('translation-title');
    yaku_E.textContent = `訳`;
    today_word_E.appendChild(yaku_E);

    const translation_contents_E = document.createElement('div');
    translation_contents_E.classList.add('translation-contents');

    // 品詞と訳語
    for (const translation of translations) {
        const hinshi_E = document.createElement('span');
        hinshi_E.classList.add('hinshi');
        const hinshi = translation.title;
        hinshi_E.textContent = (hinshi) ? hinshi : '-';

        const forms_E = document.createElement('span');
        forms_E.classList.add('form');
        let joined = '';
        const forms = translation.forms;
        forms.forEach((form) => {
            joined += `${form}, `;
        });

        joined = joined.slice(0, -2);
        forms_E.textContent = (joined) ? joined : '-';
        translation_contents_E.appendChild(hinshi_E);
        translation_contents_E.appendChild(forms_E);
    }

    today_word_E.appendChild(translation_contents_E);

    const query = `?text=${encodeURI(vocabulary)}&mode=name&type=exact`;
    const zpdicurl = 'https://zpdic.ziphil.com/dictionary/633' + query;
    const zpdic_link_E = document.createElement('a');
    const zpdic_link_wrap_E = document.createElement('p');
    zpdic_link_E.href = zpdicurl;
    zpdic_link_E.target = '_blank';
    zpdic_link_E.rel = 'noreferrer';
    zpdic_link_E.classList.add('zpdic-link');
    const svg_external_link = `<svg xmlns="http://www.w3.org/2000/svg" class="bi bi-box-arrow-up-right" style="fill: currentColor; display: inline-block; width: .8rem; height: auto; vertical-align: middle;" viewBox="0 0 16 16"><path fill-rule="evenodd" d="M8.636 3.5a.5.5 0 0 0-.5-.5H1.5A1.5 1.5 0 0 0 0 4.5v10A1.5 1.5 0 0 0 1.5 16h10a1.5 1.5 0 0 0 1.5-1.5V7.864a.5.5 0 0 0-1 0V14.5a.5.5 0 0 1-.5.5h-10a.5.5 0 0 1-.5-.5v-10a.5.5 0 0 1 .5-.5h6.636a.5.5 0 0 0 .5-.5"/><path fill-rule="evenodd" d="M16 .5a.5.5 0 0 0-.5-.5h-5a.5.5 0 0 0 0 1h3.793L6.146 9.146a.5.5 0 1 0 .708.708L15 1.707V5.5a.5.5 0 0 0 1 0z"/></svg>`;
    zpdic_link_E.innerHTML = `辞書 ${svg_external_link}`;

    zpdic_link_wrap_E.appendChild(zpdic_link_E);
    today_word_E.appendChild(zpdic_link_wrap_E);

    return true;
}, false);

