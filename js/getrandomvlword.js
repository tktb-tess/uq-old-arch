
async function fetchOTMJSON() {
    const url = '/assets/json/zpdic-vl-to-ja.json';
    try {
        const response = await fetch(url);

        if (!response.ok) throw new Error(`failed to fetch!\nresponse status: ${response.status}`);

        const parsed = await response.json();
        return parsed;
    } catch (e) {
        throw new Error(e);
    }
}

fetchOTMJSON().then((otmjson) => {

    const words = otmjson.words;
    console.log(words);
    console.log(`fetching 'zpdic-vl-to-ja.json' was successful!`);

    

}).catch((err) => console.error(`caught a exception: ${err.message}`));



class Util {
    static async getIntFromDate() {
        const today_word_E = document.getElementById('today-word');
        const utf8enc = new TextEncoder();
        const today = new Date().toDateString();
        const utf8arr = utf8enc.encode(today);
        const hashed = new Uint8Array(await crypto.subtle.digest('SHA-256', utf8arr));
        
    }
}




