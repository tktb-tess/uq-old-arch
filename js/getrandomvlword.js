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
        console.log(response.status);
        const parsed = await response.json();
        console.log(parsed);

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
    pronunciation_E.textContent = `/${pronunciation.text}/`;
    today_word_E.appendChild(pronunciation_E);

    today_word_E.appendChild(document.createElement('hr'));

    const yaku_E = document.createElement('p');
    yaku_E.classList.add('translation-title');
    yaku_E.textContent = `訳`;
    today_word_E.appendChild(yaku_E);

    for (const translation of translations) {
        const translation_row_E = document.createElement('div');
        translation_row_E.classList.add('translation-row');
        const hinshi_E = document.createElement('span');
        hinshi_E.classList.add('hinshi');
        hinshi_E.textContent = translation.title;

        const forms = translation.forms;
        const forms_E = document.createElement('span');
        forms_E.classList.add('form');
        let pre = '';
        for (const form of forms) {
            pre += `${form}, `;
        }
        pre = pre.slice(0, -2);
        forms_E.textContent = pre;
        
        translation_row_E.appendChild(hinshi_E);
        translation_row_E.appendChild(forms_E);
        today_word_E.appendChild(translation_row_E);
    }

}).catch((err) => console.error(`caught a exception: ${err.message}`));



class Util {
    static async getIntFromDate() {
        const today = new Date().toDateString();
        const utf8arr = new TextEncoder().encode(today);
        const hashed = new Uint8Array(await crypto.subtle.digest('SHA-256', utf8arr));
        const sum = hashed.reduce((accumulator, current_value) => accumulator + current_value);
        return sum;
    }
}


async function __test(str) {
    const date = new Date(str).toDateString();
    const utf8arr = new TextEncoder().encode(today);
    const hashed = new Uint8Array(await crypto.subtle.digest('SHA-256', utf8arr));
    const sum = hashed.reduce((accumulator, current_value) => accumulator + current_value);
    return sum;
}

