"use strict";

const ctcurl = "https://kaeru2193.github.io/Conlang-List-Works/conlinguistics-wiki-list.ctc";
let parsed_cotec = '';

const metadata = {
    datasize: [NaN],
    title: '',
    author: [''],
    created: '',
    last_updated: '',
    license: {
        name: '',
        content: '',
    },
    advanced: NaN,
    label: [''],
    type: [''],
};
const content = [];

async function fetchConlangList(_url) {
    try {
        const resp = await fetch(_url);
        if (!resp.ok) {
            throw new Error(`failed to fetch!\nresponse status: ${resp.status}`);
        }
        const raw = await resp.text();
        const parsed = parseCSV(raw);
        parsed_cotec = parsed;
        return parsed;

    } catch (e) {
        throw new Error(e);
    }
};

function parseCSV(csvString) {
    if (typeof (csvString) !== 'string') return;
    const rows = [];
    let row = [];
    let currentField = '';
    let is_inside_of_quote = false;

    for (let i = 0; i < csvString.length; i++) {
        const char = csvString[i];

        if (char === '\"' && (i === 0 || csvString[i - 1] !== '\\')) { // ダブルクォート（not エスケープ）に入った/出た時にトグル
            is_inside_of_quote = !is_inside_of_quote;
        } else if (char === ',' && !is_inside_of_quote) {  // クォート内でないコンマ
            row.push(currentField.trim());           // フィールドを列配列に追加
            currentField = '';                       // クリア
        } else if (char === '\n' && !is_inside_of_quote) { // クォート内でない改行
            row.push(currentField.trim());           // フィールドを列配列に追加
            rows.push(row);                          // 列配列を2次元配列に追加
            row = [];                                // 列配列, フィールドをクリア
            currentField = '';
        } else {                                     // フィールドに文字を追加
            currentField += char;
        }
    }

    // 最後のセルと行を追加
    row.push(currentField.trim());
    rows.push(row);

    return rows;
}

fetchConlangList(ctcurl)
    .then((result) => {
        const parsed_data = result;

        const row_meta = parsed_data[0];

        // メタデータ
        metadata.datasize = row_meta[0].split('x').map((size) => Number.parseInt(size));
        metadata.title = row_meta[1];
        metadata.author = row_meta[2].split(',').map((str) => str.trim());
        metadata.created = row_meta[3];
        metadata.last_updated = row_meta[4];
        metadata.license = { name: row_meta[5], content: row_meta[6] };
        metadata.advanced = Number.parseInt(row_meta[7]);

        if (metadata.advanced !== 0) { }

        metadata.label = parsed_data[1];
        metadata.type = parsed_data[2];

        // console.log(metadata.type.join(', '));

        // messier,name,kanji,desc,creator,period,site,twitter,dict,grammar,world,category,moyune,cla,part,example,script
        for (let i = 3; i < parsed_data.length - 1; i++) {

            const row = parsed_data[i];
            const cotec_one_content = {
                messier: '',
                name: {
                    normal: [],
                    kanji: [],
                },
                desc: [],
                creator: [],
                period: '',
                site: [],
                twitter: [],
                dict: [],
                grammar: [],
                world: [],
                category: [],
                moyune: [],
                clav3: {
                    dialect: '',
                    language: '',
                    family: '',
                    creator: '',
                },
                part: '',
                example: [],
                script: [],
            }

            // messier, name, kanji
            cotec_one_content.messier = row[0];
            cotec_one_content.name.normal = row[1].split(';').map((datum) => datum.trim());
            cotec_one_content.name.kanji = row[2].split(';').map((datum) => datum.trim());

            // desc
            if (row[3]) {
                const descs = row[3].split(';').map((datum) => datum.trim());

                // urlがあったら抽出してsiteに追加
                const regexurl = /(?:https:\/\/web\.archive\.org\/web\/[0-9]+\/)?https?:\/\/[\w\.\-]+[\w\-]+(?:\/[\w\?\+\-_~=\.&@#%]*)*/gu;
                for (const desc of descs) {
                    cotec_one_content.desc.push(desc);
                    const matchurls = desc.match(regexurl);
                    //console.log(matchurls);
                    if (matchurls) {
                        const urlarray = Array.from(matchurls);
                        urlarray.forEach((url) => {
                            const res = { name: '', url };
                            cotec_one_content.site.push(res);
                        });
                    }
                }
            }

            // creator, period
            cotec_one_content.creator = row[4].split(';').map((datum) => datum.trim());
            cotec_one_content.period = row[5];

            // site
            const site_p = row[6];

            const regex_for_site = /(?:(?<name>(?:\p{Script=Han}|\p{Script=Hiragana}|\p{Script=Katakana})+\d*):\s?|\s|^)(?<url>(?:https:\/\/web\.archive\.org\/web\/[0-9]+\/)?https?:\/\/[\w\-\.]+[\w\-]+(?:\/[\w\?\+\-_~=\.&@#%]*)*)/gu;
            const matches = site_p.matchAll(regex_for_site);

            for (const match of matches) {
                const res = match.groups;
                if (res) {
                    if (res.name === undefined) res.name = '';
                    // console.log(res);
                    cotec_one_content.site.push(res);
                }
            }

            // 辞書・文法のsiteをdict, grammarにパース
            cotec_one_content.site.forEach((elem) => {
                if (typeof (elem) !== 'object' || Array.isArray(elem)) return;

                if (elem.name.includes('文法')) cotec_one_content.grammar.push(elem.url);
                if (elem.name.includes('辞書')) cotec_one_content.dict.push(elem.url);
            });

            // console.log(cotec_one_content.dict);
            // console.log(cotec_one_content.grammar);

            // twitter
            if (row[7]) cotec_one_content.twitter = row[7].split(';').map((s) => s.trim());


            // dict
            if (row[8]) {
                const dict_p = row[8].split(';').map((s) => s.trim());
                cotec_one_content.dict = cotec_one_content.dict.concat(dict_p);
            }

            // grammar
            if (row[9]) {
                const grammar_p = row[9].split(';').map((s) => s.trim());
                cotec_one_content.grammar = cotec_one_content.grammar.concat(grammar_p);
            }

            // world
            if (row[10]) cotec_one_content.world = row[10].split(';').map((s) => s.trim());

            // category
            if (row[11]) {
                const category_p = row[11].split(';').map((s) => s.trim());

                const regex = /^(?<name>[^:]+)(?::(?<content>.+))?$/u;
                for (const elem of category_p) {
                    const match = regex.exec(elem);

                    if (match) {
                        const cat = match.groups;
                        if (!cat.content) cat.content = '';
                        //console.log(cat);
                        cotec_one_content.category.push(match.groups);
                    }
                }
            }

            cotec_one_content.clav3 = null;

            // モユネ分類・CLA v3をmoyune, clav3にパース
            cotec_one_content.category.forEach((elem) => {
                if (typeof (elem) !== 'object' || Array.isArray(elem)) return;

                switch (elem.name) {
                    case "CLA v3":
                        const clav3_regex = /^(?<dialect>~|[a-z]{2})_(?<language>[a-z]{2})_(?<family>~|[a-z]{3})_(?<creator>[a-z]{3})$/;
                        const match = clav3_regex.exec(elem.content);
                        if (match) {
                            cotec_one_content.clav3 = match.groups;
                        }
                        break;

                    case "モユネ分類":
                        const parsed = Array.from(elem.content.match(/[A-Z]{3}/g));
                        cotec_one_content.moyune = parsed;
                        cotec_one_content.moyune.sort();
                        // console.log(cotec_one_content.moyune);
                        break;

                    default:
                        break;
                }
            });

            //console.log(cotec_one_content.category);

            // moyune
            if (row[12]) {
                cotec_one_content.moyune = Array.from(row[12].match(/[A-Z]{3}/g));
                cotec_one_content.moyune.sort();
            }

            // clav3
            if (row[13]) {
                const clav3_regex = /^(?<dialect>~|[a-z]{2})_(?<language>[a-z]{2})_(?<family>~|[a-z]{3})_(?<creator>[a-z]{3})$/;
                const match = clav3_regex.exec(row[13]);
                if (match) {
                    cotec_one_content.clav3 = match.groups;
                }
            }

            // console.log(cotec_one_content.clav3);

            // part
            cotec_one_content.part = row[14].trim();

            // example, script
            if (row[15]) cotec_one_content.example = row[15].split(';').map((s) => s.trim());

            if (row[16]) cotec_one_content.script = row[16].split(';').map((s) => s.trim());

            content.push(cotec_one_content);
        }

        console.log(`fetching & parsing cotec file was successful!`);

        // ライセンスを表示
        const license_E = document.getElementById('license');
        license_E.innerHTML = `Cotecファイルのライセンス表示<br>${metadata.license.content}`;

        // 最終更新日時を表示
        const last_update_E = document.getElementById('last-update');
        const last_update = new Date(metadata.last_updated);
        last_update_E.innerHTML = `Cotecファイルの最終更新日時: <code>${last_update.toLocaleString("ja-JP")}</code>`;

        // 合計の表示
        const totalnum_E = document.getElementById('totalnum');
        totalnum_E.textContent = `合計 ${metadata.datasize[0]} 語`;
    })
    .catch((e) => {
        console.error(`ein Ausnahme fange: ${e.message}`);
    });

// JSONのダウンロード
const downloadJSON = () => {
    const json_obj = JSON.stringify({ metadata, content }, null);
    const url = URL.createObjectURL(new Blob([json_obj], { type: 'application/json' }));
    const anchorE = document.createElement('a');
    anchorE.href = url;
    anchorE.download = "conlinguistics-wiki-list-parsed-from-cotec.json";
    anchorE.click();
    anchorE.remove();
    URL.revokeObjectURL(url);
};

// CTCのダウンロード
const downloadCTC = () => {
    const anchorE = document.createElement('a');
    anchorE.href = ctcurl;
    anchorE.click();
    anchorE.remove();
};

// デバッグ用
function showdata(key) {
    content.forEach((lang, index) => {
        const data = lang[key];
        if (!data) return;
        const result = { index, name: lang.name.normal[0], data };
        if (Array.isArray(data)) {
            if (data.length === 0 || data[0] === '') return;
            console.log(result);
            return;
        } else if (typeof (data) === 'object') {
            if (Object.keys(data).length === 0) return;
            console.log(result);
            return;
        } else {
            console.log(result);
        }
    });
}

function showdataAll(key) {
    content.forEach((lang, index) => console.log({ index, name: lang.name.normal[0], data: lang[key] }));
}

function showsiteurl() {
    content.forEach((lang, index) => {
        for (const e of lang.site) {
            console.log(`index: ${index}, ${(e.name) ? `${e.name}: ` : ``}${e.url}`);
        }
    });
}

function showCategories() {
    content.forEach((lang, index) => {
        for (const elem of lang.category) {
            console.log(`index: ${index}, ${elem.name}${(elem.content) ? `: ${elem.content}` : ``}`);
        }
    });
}

function searchByName(name) {
    const results = [];
    content.forEach((lang, index) => {
        const names = lang.name.normal.concat(lang.name.kanji);
        const found = names.find((n) => n.includes(name));
        if (found) {
            results.push({ index, name: lang.name.normal[0], content: lang });
        }
    });
    if (results.length === 0) {
        console.log('Not found!');
        return;
    }
    return results;
}

function searchByCreator(name) {
    const results = [];
    content.forEach((lang, index) => {
        const creators = lang.creator;
        const found = creators.find((n) => n.includes(name));
        if (found) {
            results.push({ index, name: lang.name.normal[0], content: lang });
        }
    });
    if (results.length === 0) {
        console.log('Not found!');
        return;
    }
    return results;
}

class Util {
    static getRandomInt(min_, max_) {
        const min = Number(min_), max = Number(max_);
        return Math.floor(Math.random() * (max - min) + min);
    }
}

const gacha_btn_E = document.getElementById('gacha-button');

gacha_btn_E.addEventListener('click', () => {
    // ガチャ
    const rand = Util.getRandomInt(0, content.length);
    showGachaResult(rand);
});

function showGachaResult(index) {
    const gacha_result_E = document.getElementById('gacha-result');
    const svg_external_link = `<svg xmlns="http://www.w3.org/2000/svg" class="bi bi-box-arrow-up-right" style="fill: currentColor; display: inline-block; width: .8rem; height: auto; vertical-align: middle;" viewBox="0 0 16 16"><path fill-rule="evenodd" d="M8.636 3.5a.5.5 0 0 0-.5-.5H1.5A1.5 1.5 0 0 0 0 4.5v10A1.5 1.5 0 0 0 1.5 16h10a1.5 1.5 0 0 0 1.5-1.5V7.864a.5.5 0 0 0-1 0V14.5a.5.5 0 0 1-.5.5h-10a.5.5 0 0 1-.5-.5v-10a.5.5 0 0 1 .5-.5h6.636a.5.5 0 0 0 .5-.5"/><path fill-rule="evenodd" d="M16 .5a.5.5 0 0 0-.5-.5h-5a.5.5 0 0 0 0 1h3.793L6.146 9.146a.5.5 0 1 0 .708.708L15 1.707V5.5a.5.5 0 0 0 1 0z"/></svg>`;
    const lang = content[index];
    console.log({ index, name: lang.name.normal[0], content: lang });

    if (gacha_result_E.dataset.visible) delete gacha_result_E.dataset.visible;

    const prev_result = document.getElementById('result-list');
    if (prev_result)
        prev_result.remove();

    // 結果リスト
    const result_list_E = document.createElement('ul');
    result_list_E.id = 'result-list';
    result_list_E.classList.add('u-ms-7');



    // 名前,漢字名,説明,作者,世界,例文,使用文字
    const li_name = document.createElement('li');
    const li_kanji = document.createElement('li');
    const li_desc = document.createElement('li');
    const li_creator = document.createElement('li');
    const li_world = document.createElement('li');
    const li_exp = document.createElement('li');
    const li_script = document.createElement('li');
    li_name.id = 'json-name-normal';
    li_kanji.id = 'json-name-kanji';
    li_desc.id = 'json-desc';
    li_creator.id = 'json-creator';
    li_world.id = 'json-world';
    li_exp.id = 'json-example';
    li_script.id = 'json-script';
    li_name.textContent = `名前: ${lang.name.normal.join(', ')}`;
    li_kanji.textContent = `漢字名: ${lang.name.kanji.join(', ')}`;
    li_desc.innerHTML = `<p>説明:</p>`;
    li_creator.textContent = `作者: ${lang.creator.join(', ')}`;
    li_world.textContent = `世界: ${lang.world.join(', ')}`;
    li_exp.textContent = `例文: ${lang.example.join(', ')}`;
    li_script.textContent = `使用文字: ${lang.script.join(', ')}`;

    const descs = lang.desc;
    for (const desc of descs) {
        const paragraph = document.createElement('p');
        paragraph.textContent = desc;
        li_desc.insertAdjacentElement('beforeend', paragraph);
    }


    // 創作期間
    const li_period = document.createElement('li');
    li_period.id = 'json-period';
    li_period.textContent = `創作時期: ${lang.period}`;

    // twitter,辞書,文法
    const li_twitter = document.createElement('li');
    const li_dict = document.createElement('li');
    const li_grammar = document.createElement('li');
    li_twitter.id = 'json-twitter';
    li_dict.id = 'json-dict';
    li_grammar.id = 'json-grammar';
    li_twitter.textContent = `𝕏 (旧twitter): `;
    li_dict.textContent = `辞書: `;
    li_grammar.textContent = `文法: `;

    const innerul_twitter = document.createElement('ul');
    const innerul_dict = document.createElement('ul');
    const innerul_grammar = document.createElement('ul');

    const twitters = lang.twitter;
    const dicts = lang.dict;
    const grammars = lang.grammar;

    for (const twitter of twitters) {
        const li = document.createElement('li');
        const anchtxt = `<a class="ext-link" href="${twitter}" target="_blank" rel="noreferrer">${twitter} ${svg_external_link}</a>`;
        li.innerHTML = anchtxt;
        innerul_twitter.appendChild(li);
    }

    for (const dict of dicts) {
        const li = document.createElement('li');
        const anchtxt = `<a class="ext-link" href="${dict}" target="_blank" rel="noreferrer">${dict} ${svg_external_link}</a>`;
        li.innerHTML = anchtxt;
        innerul_dict.appendChild(li);
    }

    for (const grammar of grammars) {
        const li = document.createElement('li');
        const anchtxt = `<a class="ext-link" href="${grammar}" target="_blank" rel="noreferrer">${grammar} ${svg_external_link}</a>`;
        li.innerHTML = anchtxt;
        innerul_grammar.appendChild(li);
    }

    li_twitter.insertAdjacentElement('beforeend', innerul_twitter);
    li_dict.insertAdjacentElement('beforeend', innerul_dict);
    li_grammar.insertAdjacentElement('beforeend', innerul_grammar);

    // カテゴリ
    const li_category = document.createElement('li');
    li_category.id = 'json-category';
    const categories = lang.category;
    li_category.textContent = `カテゴリ:`;
    const innerul_cat = document.createElement('ul');
    categories.forEach((category) => {
        if (category.name === 'CLA v3' || category.name === 'モユネ分類') return;
        const innerli_cat = document.createElement('li');
        if (category.content) {
            innerli_cat.textContent = `${category.name}: ${category.content}`;
        } else {
            innerli_cat.textContent = `${category.name}`;
        }
        innerul_cat.appendChild(innerli_cat);
    });

    li_category.appendChild(innerul_cat);

    // サイト
    const li_site = document.createElement('li');
    li_site.id = 'json-site';
    const sites = lang.site;
    li_site.textContent = `サイト:`

    const innerul_site = document.createElement('ul');
    for (const site of sites) {

        const regex = /^(?:文法|辞書)\d*$/u; // 「文法(n)」あるいは「辞書(n)」に一致
        const regex2 = /(?:^サイト(?<number>\d*)$)|^$/u; // 「サイト(n)」あるいは空文字列に一致
        const match2 = regex2.exec(site.name);

        if (regex.exec(site.name)) continue; // regexに一致は無視
        else if (match2) { // regex2に一致はURLのみ取り出す
            const li = document.createElement('li');
            li.innerHTML = `<a class="ext-link" href="${site.url}" target="_blank" rel="noreferrer">${site.url} ${svg_external_link}</a>`;
            innerul_site.appendChild(li);

        } else { // それ以外はフルで入れる
            const li = document.createElement('li');
            li.innerHTML = `<a class="ext-link" href="${site.url}" target="_blank" rel="noreferrer">${site.name}: ${site.url} ${svg_external_link}</a>`;
            innerul_site.appendChild(li);
        }

    }

    if (innerul_site.firstChild) li_site.insertAdjacentElement('beforeend', innerul_site);

    // モユネ分類
    const li_moyune = document.createElement('li');
    li_moyune.id = 'json-moyune';
    const moyunes = lang.moyune.join('/');
    li_moyune.textContent = `モユネ分類: ${moyunes}`;

    // CLA v3
    const li_clav3 = document.createElement('li');
    li_clav3.id = 'json-clav3';
    const clav3 = lang.clav3;
    if (clav3) {
        const codestr = `${clav3.dialect}_${clav3.language}_${clav3.family}_${clav3.creator}`;
        li_clav3.textContent = `CLA v3: ${codestr}`;
        result_list_E.dataset.claV3 = codestr;
        const ietf = `art-x-v3-${clav3.creator}${(clav3.family === '~') ? '0' : clav3.family}${clav3.language}${(clav3.dialect === '~') ? '' : '-' + clav3.dialect}`;
        li_name.lang = ietf;
        li_exp.lang = ietf;
    } else {
        li_clav3.textContent = `CLA v3:`;
    }


    // 名前,漢字略称,説明,作者,創作期間,サイト,twitter,辞書文法,世界,カテゴリ,モユネ分類,CLA v3コード,例文,使用文字
    result_list_E.appendChild(li_name);
    result_list_E.appendChild(li_kanji);
    result_list_E.appendChild(li_desc);
    result_list_E.appendChild(li_creator);
    result_list_E.appendChild(li_period);
    result_list_E.appendChild(li_site);
    result_list_E.appendChild(li_twitter);
    result_list_E.appendChild(li_dict);
    result_list_E.appendChild(li_grammar);
    result_list_E.appendChild(li_world);
    result_list_E.appendChild(li_category);
    result_list_E.appendChild(li_moyune);
    result_list_E.appendChild(li_clav3);
    result_list_E.appendChild(li_exp);
    result_list_E.appendChild(li_script);

    gacha_result_E.appendChild(result_list_E);

    const class_list = gacha_result_E.classList;

    li_creator.textContent.includes('斗琴庭暁響')
        ? class_list.add('--mylang')
        : class_list.remove('--mylang');

    setTimeout(() => {
        gacha_result_E.dataset.visible = true;
    }, 2);
}


