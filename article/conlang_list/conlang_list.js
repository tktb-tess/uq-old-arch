"use strict";



/**
 * 
 * @typedef {{
 *              datasize: [number, number];
 *              title: string;
 *              author: string[];
 *              date_created: string;
 *              date_last_updated: string;
 *              license: { name: string, content: string };
 *              advanced: number;
 *              label: string[];
 *              type: string[]
 *          }} CotecMetadata
 * @typedef {{ 
 *              messier: string;
 *              name: { normal: string[], kanji?: string[] };
 *              desc?: string[];
 *              creator: string[];
 *              period?: string;
 *              site?: { name?: string, url: string }[];
 *              twitter?: string[];
 *              dict?: string[];
 *              grammar?: string[];
 *              world?: string[];
 *              category?: { name: string, content?: string }[];
 *              moyune?: string[];
 *              clav3?: { dialect: string, language: string, family: string, creator: string };
 *              part?: string;
 *              example?: string[];
 *              script?: string[] 
 *          }} CotecContent
 * @typedef {{ metadata: CotecMetadata, contents: CotecContent[], raw: string, util: any }} Cotec
 * 
 */

/**
 * @type {Cotec}
 */
const cotec_json = {};


document.addEventListener('DOMContentLoaded', async () => {
    const ctcurl = "https://kaeru2193.github.io/Conlang-List-Works/conlinguistics-wiki-list.ctc";
    /**
     * @type {CotecMetadata}
     */
    const metadata = {};

    /**
     * @type {CotecContent[]}
     */
    const contents = [];
    /**
     * by ChatGPT
     * @param {string} csvString 
     * @returns 
     */
    const parseCSV = (csvString) => {
        if (typeof csvString !== 'string') throw TypeError('arg type is not `string`', { cause: typeof csvString });
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

    /**
     * 
     * @param {string} _url 
     * @returns 
     */
    const fetchConlangList = async (_url) => {
        
        const resp = await fetch(_url);
        if (!resp.ok) {
            throw new Error(`failed to fetch!\nresponse status: ${resp.status}`, { cause: resp });
        }
        const raw = await resp.text();
        const parsed = parseCSV(raw);
        if (!parsed) throw Error(`cotec is empty`);
        return { parsed, raw };
    };


    const fetched = await fetchConlangList(ctcurl);
    const parsed_data = fetched.parsed;
    const row_meta = parsed_data[0];
    

    // メタデータ
    metadata.datasize = row_meta[0].split('x').map((size) => Number.parseInt(size));
    metadata.title = row_meta[1];
    metadata.author = row_meta[2].split(',').map((str) => str.trim());
    metadata.date_created = row_meta[3];
    metadata.date_last_updated = row_meta[4];
    metadata.license = { name: row_meta[5], content: row_meta[6] };
    metadata.advanced = Number.parseInt(row_meta[7]);

    if (metadata.advanced !== 0) {}

    metadata.label = parsed_data[1];
    metadata.type = parsed_data[2];

    // console.log(metadata.type.join(', '));

    // messier,name,kanji,desc,creator,period,site,twitter,dict,grammar,world,category,moyune,cla,part,example,script
    for (let i = 3; i < parsed_data.length - 1; i++) {

        const row = parsed_data[i];

        /**
         * @type {CotecContent}
         */
        const cotec_one_content = {
            messier: '',
            name: {
                normal: [],
            },
            creator: [],
        };

        // messier, name, kanji
        if (row[0]) cotec_one_content.messier = row[0];
        if (row[1]) cotec_one_content.name.normal = row[1].split(';').map((datum) => datum.trim());
        if (row[2]) cotec_one_content.name.kanji = row[2].split(';').map((datum) => datum.trim());

        // desc
        if (row[3]) {
            const descs = row[3].split(';').map((datum) => datum.trim());

            // urlがあったら抽出してsiteに追加
            const regexurl = /(?:https:\/\/web\.archive\.org\/web\/[0-9]+\/)?https?:\/\/[\w\.\-]+[\w\-]+(?:\/[\w\?\+\-_~=\.&@#%]*)*/gu;
            const desc_ = [], site_ = [];
            for (const desc of descs) {
                desc_.push(desc);
                const matchurls = desc.match(regexurl);
                //console.log(matchurls);
                if (matchurls) {
                    const urlarray = Array.from(matchurls);

                    urlarray.forEach((url) => {
                        const res = { url };
                        site_.push(res);
                    });
                }
            }
            if (desc_.length > 0) cotec_one_content.desc = desc_;
            if (site_.length > 0) cotec_one_content.site = site_;
        }

        // creator, period
        if (row[4]) cotec_one_content.creator = row[4].split(';').map((datum) => datum.trim());
        if (row[5]) cotec_one_content.period = row[5];

        // site
        if (row[6]) {
            const site_p = row[6];

            const regex_for_site = /(?:(?<name>(?:\p{Script=Han}|\p{Script=Hiragana}|\p{Script=Katakana})+\d*):\s?|\s|^)(?<url>(?:https:\/\/web\.archive\.org\/web\/[0-9]+\/)?https?:\/\/[\w\-\.]+[\w\-]+(?:\/[\w\?\+\-_~=\.&@#%]*)*)/gu;
            const matches = site_p.matchAll(regex_for_site);
    
            
            const site_ = [];
            for (const match of matches) {
                const res = match.groups;
                if (res) {
                    if (!res.name) delete res.name;
                    site_.push(res);
                }
            }
            if (cotec_one_content.site) {
                cotec_one_content.site = cotec_one_content.site.concat(site_);
            } else {
                cotec_one_content.site = site_;
            }
            
        }
        


        // 辞書・文法のsiteをdict, grammarにパース
        if (cotec_one_content.site) {
            const grammar_ = [], dict_ = [];
            cotec_one_content.site.forEach((elem) => {
                if (typeof (elem) !== 'object' || Array.isArray(elem)) return;

                if (elem.name) {
                    if (elem.name.includes('文法')) grammar_.push(elem.url);
                    if (elem.name.includes('辞書')) dict_.push(elem.url);
                }
            });
            if (grammar_.length > 0) cotec_one_content.grammar = grammar_;
            if (dict_.length > 0) cotec_one_content.dict = dict_;
        }


        // console.log(cotec_one_content.dict);
        // console.log(cotec_one_content.grammar);

        // twitter
        if (row[7]) cotec_one_content.twitter = row[7].split(';').map((s) => s.trim());


        // dict
        if (row[8]) {
            const dict_p = row[8].split(';').map((s) => s.trim());
            if (cotec_one_content.dict) {
                cotec_one_content.dict = cotec_one_content.dict.concat(dict_p);
            } else {
                cotec_one_content.dict = dict_p;
            }

        }

        // grammar
        if (row[9]) {
            const grammar_p = row[9].split(';').map((s) => s.trim());

            if (cotec_one_content.grammar) {
                cotec_one_content.grammar = cotec_one_content.grammar.concat(grammar_p);
            } else {
                cotec_one_content.grammar = grammar_p;
            }
        }

        // world
        if (row[10]) cotec_one_content.world = row[10].split(';').map((s) => s.trim());

        // category
        if (row[11]) {
            const category_p = row[11].split(';').map((s) => s.trim());

            const regex = /^(?<name>[^:]+)(?::(?<content>.+))?$/u;
            const category_ = [];
            for (const elem of category_p) {
                const match = regex.exec(elem);

                if (match) {
                    const res = match.groups;
                    if (!res.content) delete res.content;
                    category_.push(res);
                }
            }
            if (category_.length > 0) cotec_one_content.category = category_;
        }

        // モユネ分類・CLA v3をmoyune, clav3にパース
        if (cotec_one_content.category) {
            cotec_one_content.category.forEach((elem) => {
                if (typeof elem !== 'object' || Array.isArray(elem)) return;

                switch (elem.name) {
                    case "CLA v3": {
                        const clav3_regex = /^(?<dialect>~|[a-z]{2})_(?<language>[a-z]{2})_(?<family>~|[a-z]{3})_(?<creator>[a-z]{3})$/;
                        const match = clav3_regex.exec(elem.content);
                        if (match && match.groups) {
                            cotec_one_content.clav3 = match.groups;
                        }
                        break;
                    }
                    case "モユネ分類": {
                        const parsed = Array.from(elem.content.match(/[A-Z]{3}/g));
                        cotec_one_content.moyune = parsed;
                        cotec_one_content.moyune.sort();
                        // console.log(cotec_one_content.moyune);
                        break;
                    }
                    default: break;
                }
            });
        }


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
            if (match && match.groups) {
                cotec_one_content.clav3 = match.groups;
            }
        }

        // console.log(cotec_one_content.clav3);

        // part
        if (row[14]) cotec_one_content.part = row[14].trim();

        // example, script
        if (row[15]) cotec_one_content.example = row[15].split(';').map((s) => s.trim());

        if (row[16]) cotec_one_content.script = row[16].split(';').map((s) => s.trim());

        contents.push(cotec_one_content);
    }

    cotec_json.metadata = metadata;
    cotec_json.contents = contents;

    /**
     * デバッグ用 
     */
    const util = {
        /**
         * JSONのダウンロード
         */
        downloadJSON() {
            const json_obj = JSON.stringify(cotec_json, null);
            const url = URL.createObjectURL(new Blob([json_obj], { type: 'application/json' }));
            const anchorE = document.createElement('a');
            anchorE.href = url;
            anchorE.download = "conlinguistics-wiki-list-cotec.json";
            anchorE.click();
            anchorE.remove();
            URL.revokeObjectURL(url);
        },

        /**
         * CTCのダウンロード
         */
        downloadCTC() {
            const anchorE = document.createElement('a');
            anchorE.href = ctcurl;
            anchorE.click();
            anchorE.remove();
        },
        /**
         * 
         * @param {string} key 
         */
        showData(key) {
            cotec_json.contents.forEach((lang, index) => {
                const data = lang[key];
                if (!data) return;
                const result = { index, name: lang.name.normal[0], data };
                if (Array.isArray(data)) {
                    if (data.length === 0 || data[0] === '') return;
                    console.log(result);
                    return;
                } else if (typeof data === 'object') {
                    if (Object.keys(data).length === 0) return;
                    console.log(result);
                    return;
                } else {
                    console.log(result);
                }
            });
        },

        /**
         * 
         * @param {string} key 
         */
        showdataAll(key) {
            cotec_json.contents.forEach((lang, index) => { console.log({ index, name: lang.name.normal[0], data: lang[key] }) });
        },

        showsiteurl() {
            cotec_json.contents.forEach((lang, index) => {
                for (const e of lang.site) {
                    console.log(`index: ${index}, ${(e.name) ? `${e.name}: ` : ``}${e.url}`);
                }
            });
        },

        showCategories() {
            cotec_json.contents.forEach((lang, index) => {
                for (const elem of lang.category) {
                    console.log(`index: ${index}, ${elem.name}${(elem.content) ? `: ${elem.content}` : ``}`);
                }
            });
        },

        /**
         * 
         * @param {string} name 
         * @returns 
         */
        searchByName(name) {
            const results = [];
            cotec_json.contents.forEach((lang, index) => {
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
        },

        /**
         * 
         * @param {string} name 
         * @returns 
         */
        searchByCreator(name) {
            const results = [];
            cotec_json.contents.forEach((lang, index) => {
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
        },
        /**
         * 
         * @param {number} min 
         * @param {number} max 
         * @returns 
         */
        getRandomInt(min, max) {
            return Math.floor(Math.random() * (max - min) + min);
        },
    };

    cotec_json.util = util;

    Object.freeze(cotec_json.util);
    Object.freeze(cotec_json.contents);
    Object.freeze(cotec_json.metadata);
    Object.freeze(cotec_json);
    console.log(`fetching & parsing cotec file was successful!`);

    // ライセンスを表示
    const license_E = document.getElementById('license');
    license_E.innerHTML = `Cotecファイルのライセンス表示<br>${cotec_json.metadata.license.content}`;

    // 最終更新日時を表示
    const last_update_E = document.getElementById('last-update');
    const last_update = new Date(cotec_json.metadata.date_last_updated);
    last_update_E.innerHTML = `Cotecファイルの最終更新日時: <code>${last_update.toLocaleString("ja-JP")}</code>`;

    // 合計の表示
    const totalnum_E = document.getElementById('totalnum');
    totalnum_E.textContent = `合計 ${cotec_json.metadata.datasize[0]} 語`;

    const gacha_btn_E = document.getElementById('gacha-button');

    gacha_btn_E.addEventListener('click', () => {
        // ガチャ
        const rand = cotec_json.util.getRandomInt(0, cotec_json.contents.length);
        showGachaResult(rand);
    });

    /**
     * 
     * @param {number} index 
     */
    const showGachaResult = (index) => {
        const gacha_result_E = document.getElementById('gacha-result');
        const svg_external_link = `<svg xmlns="http://www.w3.org/2000/svg" class="bi bi-box-arrow-up-right" style="fill: currentColor; display: inline-block; width: .8rem; height: auto; vertical-align: middle;" viewBox="0 0 16 16"><path fill-rule="evenodd" d="M8.636 3.5a.5.5 0 0 0-.5-.5H1.5A1.5 1.5 0 0 0 0 4.5v10A1.5 1.5 0 0 0 1.5 16h10a1.5 1.5 0 0 0 1.5-1.5V7.864a.5.5 0 0 0-1 0V14.5a.5.5 0 0 1-.5.5h-10a.5.5 0 0 1-.5-.5v-10a.5.5 0 0 1 .5-.5h6.636a.5.5 0 0 0 .5-.5"/><path fill-rule="evenodd" d="M16 .5a.5.5 0 0 0-.5-.5h-5a.5.5 0 0 0 0 1h3.793L6.146 9.146a.5.5 0 1 0 .708.708L15 1.707V5.5a.5.5 0 0 0 1 0z"/></svg>`;
        const lang = cotec_json.contents[index];
        console.log({ index, name: lang.name.normal[0], content: lang });

        if (gacha_result_E.dataset.visible) delete gacha_result_E.dataset.visible;

        const prev_result = document.getElementById('result-list');
        if (prev_result) prev_result.remove();

        // 結果リスト
        const result_list_E = document.createElement('ul');
        result_list_E.id = 'result-list';
        result_list_E.classList.add('u-ms-7');



        // 名前
        const li_name = document.createElement('li');
        li_name.id = 'json-name-normal';
        li_name.textContent = `名前: ${lang.name.normal.join(', ')}`;
        result_list_E.appendChild(li_name);

        // 漢字略称
        if (lang.name.kanji) {
            const li_kanji = document.createElement('li');
            li_kanji.id = 'json-name-kanji';
            li_kanji.textContent = `漢字名: ${lang.name.kanji.join(', ')}`;
            result_list_E.appendChild(li_kanji);
        }

        // 説明
        if (lang.desc) {
            const li_desc = document.createElement('li');
            li_desc.id = 'json-desc';
            li_desc.innerHTML = `<p>説明:</p>`;
            if (lang.desc) {
                const descs = lang.desc;
                for (const desc of descs) {
                    const paragraph = document.createElement('p');
                    paragraph.textContent = desc;
                    li_desc.insertAdjacentElement('beforeend', paragraph);
                }
            }
            result_list_E.appendChild(li_desc);
        }

        // 作者
        const li_creator = document.createElement('li');
        li_creator.id = 'json-creator';
        li_creator.textContent = `作者: ${lang.creator.join(', ')}`;
        result_list_E.appendChild(li_creator);

        // 創作期間
        if (lang.period) {
            const li_period = document.createElement('li');
            li_period.id = 'json-period';
            li_period.textContent = `創作時期: ${lang.period}`;
            result_list_E.appendChild(li_period);
        }

        // サイト
        if (lang.site) {
            const li_site = document.createElement('li');
            li_site.id = 'json-site';
            const sites = lang.site;
            li_site.textContent = `サイト:`

            const innerul_site = document.createElement('ul');
            for (const site of sites) {

                const regex = /^(?:文法|辞書)\d*$/u; // 「文法(n)」あるいは「辞書(n)」に一致
                const regex2 = /(?:^サイト(?<number>\d*)$)|^$/u; // 「サイト(n)」に一致
                
                const match2 = regex2.exec(site.name);

                if (regex.exec(site.name)) continue; // regexに一致は無視
                else if (!site.name || match2) { // undefinedあるいはregex2に一致はURLのみ取り出す
                    const li = document.createElement('li');
                    li.innerHTML = `<a class="ext-link" href="${site.url}" target="_blank" rel="noreferrer">${site.url} ${svg_external_link}</a>`;
                    innerul_site.appendChild(li);

                } else { // それ以外はフルで入れる
                    const li = document.createElement('li');
                    li.innerHTML = `<a class="ext-link" href="${site.url}" target="_blank" rel="noreferrer">${site.name}: ${site.url} ${svg_external_link}</a>`;
                    innerul_site.appendChild(li);
                }

            }
            li_site.insertAdjacentElement('beforeend', innerul_site);
            result_list_E.appendChild(li_site);
        }

        // twitter
        if (lang.twitter) {
            const li_twitter = document.createElement('li');
            li_twitter.id = 'json-twitter';
            li_twitter.textContent = `𝕏 (旧twitter): `;
            const innerul_twitter = document.createElement('ul');
            const twitters = lang.twitter;
            for (const twitter of twitters) {
                const li = document.createElement('li');
                const anchtxt = `<a class="ext-link" href="${twitter}" target="_blank" rel="noreferrer">${twitter} ${svg_external_link}</a>`;
                li.innerHTML = anchtxt;
                innerul_twitter.appendChild(li);
            }
            li_twitter.insertAdjacentElement('beforeend', innerul_twitter);
            result_list_E.appendChild(li_twitter);
        }

        // 辞書
        if (lang.dict) {
            const li_dict = document.createElement('li');
            li_dict.id = 'json-dict';
            li_dict.textContent = `辞書: `;
            const innerul_dict = document.createElement('ul');
            const dicts = lang.dict;
            for (const dict of dicts) {
                const li = document.createElement('li');
                const anchtxt = `<a class="ext-link" href="${dict}" target="_blank" rel="noreferrer">${dict} ${svg_external_link}</a>`;
                li.innerHTML = anchtxt;
                innerul_dict.appendChild(li);
            }
            li_dict.insertAdjacentElement('beforeend', innerul_dict);
            result_list_E.appendChild(li_dict);
        }

        // 文法
        if (lang.grammar) {
            const li_grammar = document.createElement('li');
            li_grammar.id = 'json-grammar';
            li_grammar.textContent = `文法: `;
            const innerul_grammar = document.createElement('ul');
            const grammars = lang.grammar;
            for (const grammar of grammars) {
                const li = document.createElement('li');
                const anchtxt = `<a class="ext-link" href="${grammar}" target="_blank" rel="noreferrer">${grammar} ${svg_external_link}</a>`;
                li.innerHTML = anchtxt;
                innerul_grammar.appendChild(li);
            }
            li_grammar.insertAdjacentElement('beforeend', innerul_grammar);
            result_list_E.appendChild(li_grammar);
        }

        // 世界
        if (lang.world) {
            const li_world = document.createElement('li');
            li_world.id = 'json-world';
            li_world.textContent = `世界: ${lang.world.join(', ')}`;
            result_list_E.appendChild(li_world);
        }

        // カテゴリ
        if (lang.category) {
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

            li_category.insertAdjacentElement('beforeend', innerul_cat);
            result_list_E.appendChild(li_category);
        }

        // モユネ分類
        if (lang.moyune) {
            const li_moyune = document.createElement('li');
            li_moyune.id = 'json-moyune';
            const moyunes = lang.moyune.join('/');
            li_moyune.textContent = `モユネ分類: ${moyunes}`;
            result_list_E.appendChild(li_moyune);
        }

        // CLA v3
        if (lang.clav3) {
            const li_clav3 = document.createElement('li');
            li_clav3.id = 'json-clav3';
            const clav3 = lang.clav3;

            const codestr = `${clav3.dialect}_${clav3.language}_${clav3.family}_${clav3.creator}`;
            li_clav3.textContent = `CLA v3: ${codestr}`;
            result_list_E.dataset.claV3 = codestr;
            const ietf = `art-x-v3-${clav3.creator}${(clav3.family === '~') ? '0' : clav3.family}${clav3.language}${(clav3.dialect === '~') ? '' : '-' + clav3.dialect}`;
            li_name.lang = ietf;
            
            result_list_E.appendChild(li_clav3);
        }

        // 例文
        if (lang.example) {
            const li_exp = document.createElement('li');
            li_exp.id = 'json-example';
            li_exp.textContent = `例文: ${lang.example.join(', ')}`;
            if (lang.clav3) {
                const ietf = `art-x-v3-${lang.clav3.creator}${(lang.clav3.family === '~') ? '0' : lang.clav3.family}${lang.clav3.language}${(lang.clav3.dialect === '~') ? '' : '-' + lang.clav3.dialect}`;
                li_exp.lang = ietf;
            }
            result_list_E.appendChild(li_exp);
        }

        // 使用文字
        if (lang.script) {
            const li_script = document.createElement('li');
            li_script.id = 'json-script';
            li_script.textContent = `使用文字: ${lang.script.join(', ')}`;
            result_list_E.appendChild(li_script);
        }

        gacha_result_E.appendChild(result_list_E);

        li_creator.textContent.includes('斗琴庭暁響')
            ? gacha_result_E.classList.add('--mylang')
            : gacha_result_E.classList.remove('--mylang');

        setTimeout(() => {
            gacha_result_E.dataset.visible = true;
        }, 2);
    }

}, false);





