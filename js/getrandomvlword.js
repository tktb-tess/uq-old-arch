class OTMJSON {
    static words = [];
    static examples = [];
    static zpdic_online = {};
    static version = NaN;
    static url = '/assets/json/vl-ja.otm.json';
}


async function fetchOTMJSON() {
    
    try {
        const response = await fetch(OTMJSON.url);

        if (!response.ok) throw new Error(`failed to fetch!\nresponse status: ${response.status}`);
        //console.log(response.status);
        const parsed = await response.json();
        //console.log(parsed);

        OTMJSON.words = parsed.words;
        OTMJSON.examples = parsed.examples;
        OTMJSON.zpdic_online = parsed.zpdicOnline;
        OTMJSON.version = parsed.version;

        return;
    } catch (e) {
        throw new Error(e);
    }
}

fetchOTMJSON().then(async () => {

    const words = OTMJSON.words;
    if (!Array.isArray(words)) throw new Error('something wrong with fetching!');
    console.log(`fetching 'vl-ja-otm.json' was successful!`);

    // 日替わり乱数を取得
    const random = await Util.getRandIntFromDate() % words.length;

    const today_word_entry = words[random];
    const vocabulary = today_word_entry.entry.form;
    const translations = today_word_entry.translations;

    // コンテナ
    const today_word_E = document.getElementById('today-word');

    // 語彙
    const vocabulary_E = document.createElement('p');
    vocabulary_E.classList.add('vocabulary');
    vocabulary_E.textContent = vocabulary;
    today_word_E.appendChild(vocabulary_E);

    // 発音記号
    const pronunciation_E = document.createElement('p');
    pronunciation_E.classList.add('pronunciation');
    const pronunciation = today_word_entry.contents.find((content) => content.title === 'Pronunciation');

    if (pronunciation.text.includes('/')) {
        pronunciation_E.textContent = pronunciation.text;
    } else {
        pronunciation_E.textContent = `/${pronunciation.text}/`;
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

}).catch((err) => console.error(`caught a exception: ${err.message}`));



class Util {
    static async getRandIntFromDate() {
        const today = new Date().toDateString();
        const utf8arr = new TextEncoder().encode(today);
        const hashed = new Uint8Array(await crypto.subtle.digest('SHA-256', utf8arr)).slice(0, 4);

        const partialstr = Array.from(hashed, (e) => e.toString(16).padStart(2, '0')).join('');
        const parsed = Number.parseInt(partialstr, 16);

        return parsed;
    }
}


