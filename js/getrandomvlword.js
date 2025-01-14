class OTMJSON {
    static words = [];
    static examples = [];
    static zpdic_online = {};
    static version = NaN;
    static url = '/assets/json/vl-ja-otm.json';
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
    const random = await Util.getIntFromDate() % words.length;
    const today_word_entry = words[random];
    const vocabulary = today_word_entry.entry.form;
    const translations = today_word_entry.translations;

    const today_word_E = document.getElementById('today-word');

    const vocabulary_E = document.createElement('p');
    vocabulary_E.classList.add('vocabulary');
    vocabulary_E.textContent = vocabulary;
    today_word_E.appendChild(vocabulary_E);

    const pronunciation_E = document.createElement('p');
    pronunciation_E.classList.add('pronunciation');
    const pronunciation = today_word_entry.contents.find((content) => content.title === 'Pronunciation');

    if (pronunciation.text.includes('/')) {
        pronunciation_E.textContent = pronunciation.text;
    } else {
        pronunciation_E.textContent = `/${pronunciation.text}/`;
    }

    


    today_word_E.appendChild(pronunciation_E);

    today_word_E.appendChild(document.createElement('hr'));

    const yaku_E = document.createElement('p');
    yaku_E.classList.add('translation-title');
    yaku_E.textContent = `訳`;
    today_word_E.appendChild(yaku_E);

    const translation_contents_E = document.createElement('div');
    translation_contents_E.classList.add('translation-contents');
    const column_hinshi_E = document.createElement('div');
    const column_forms_E = document.createElement('div');
    column_hinshi_E.classList.add('column-hinshi');
    column_forms_E.classList.add('column-forms');

    const hinshis = [], formses = [];

    for (const translation of translations) {
        hinshis.push(translation.title);
        formses.push(translation.forms);
    }

    // 品詞
    for (const hinshi of hinshis) {
        const hinshi_E = document.createElement('span');
        hinshi_E.classList.add('hinshi');
        hinshi_E.textContent = hinshi;
        column_hinshi_E.appendChild(hinshi_E);
    }

    // 訳語
    for (const forms of formses) {
        const forms_E = document.createElement('span');
        forms_E.classList.add('form');

        let pre = '';
        forms.forEach((form) => {
            pre += `${form}, `;
        });

        forms_E.textContent = pre.slice(0, -2);
        column_forms_E.appendChild(forms_E);
    }

    translation_contents_E.appendChild(column_hinshi_E);
    translation_contents_E.appendChild(column_forms_E);

    today_word_E.appendChild(translation_contents_E);

}).catch((err) => console.error(`caught a exception: ${err.message}`));



class Util {
    static async getIntFromDate() {
        const today = new Date().toDateString();
        const utf8arr = new TextEncoder().encode(today);
        const hashed = new Uint8Array(await crypto.subtle.digest('SHA-256', utf8arr)).slice(0, 4);

        const partialstr = Array.from(hashed, (e) => {
            const str = e.toString(16);
            return (e < 16) ? `0${str}` : str;
        }).join('');
        const parsed = Number.parseInt(partialstr, 16);

        return parsed;
    }
}


