"use strict";

const url = "https://kaeru2193.github.io/Conlang-List-Works/conlinguistics-wiki-list.ctc";
const ctc_content = [];
const ctc_metadata = {};

fetchConlangList(url)
    .then((data) => {
        const row_meta = data[0];
        ctc_metadata.datasize = row_meta[0].split('x').map((str) => Number.parseInt(str));
        ctc_metadata.title = row_meta[1];
        ctc_metadata.authors = row_meta[2].split(',').map((str) => str.trim());
        ctc_metadata.date_created = new Date(row_meta[3]);
        ctc_metadata.date_latest_update = new Date(row_meta[4]);
        ctc_metadata.license = { name: row_meta[5], content: row_meta[6] };
        ctc_metadata.advanced = Number.parseInt(row_meta[7]);


        for (let i = 1; i < data.length; i++) {
            ctc_content.push(data[i]);
        }
        console.log(`fetching & parsing ctc was successful!`);

        show();
    })
    .catch((e) => {
        console.error(`an exception caught:\n${e.message}`);
    });



async function fetchConlangList(_url) {
    try {
        const resp = await fetch(_url);
        if (!resp.ok) {
            throw new Error(`failed to fetch!\nresponse status: ${resp.status}`);
        }
        const csvText = await resp.text();
        const parsed = await parseCSV(csvText);
        return parsed;

    } catch (e) {
        throw new Error(e);
    }
};

async function show() {
    const containerE = document.getElementById('_container');
    const mainE = document.createElement('main');

    // タイトル
    const titleE = document.createElement('h1');
    titleE.id = 'title';
    titleE.textContent = ctc_metadata.title;
    mainE.appendChild(titleE);

    // 戻るリンク
    const linktotopE = document.createElement('p');
    const linktotoplinkE = document.createElement('a');
    linktotoplinkE.href = "../../";
    linktotoplinkE.textContent = "← 戻る";
    linktotopE.appendChild(linktotoplinkE);
    mainE.appendChild(linktotopE);

    // メタデータ
    const metadata_ulE = document.createElement('ul');
    metadata_ulE.classList.add('unstyled');
    metadata_ulE.id = 'metadata';

    const created_dateE = document.createElement('li');
    created_dateE.textContent = `作成日時: ${ctc_metadata.date_created}`;
    metadata_ulE.appendChild(created_dateE);

    const latest_updateE = document.createElement('li');
    latest_updateE.textContent = `最終更新日時: ${ctc_metadata.date_latest_update}`;
    metadata_ulE.appendChild(latest_updateE);

    const authorsE = document.createElement('li');
    authorsE.textContent = `著者: ${ctc_metadata.authors.join(', ')}`;
    metadata_ulE.appendChild(authorsE);
    mainE.appendChild(metadata_ulE);

    const licenseE = document.createElement('p');
    licenseE.textContent = ctc_metadata.license.content;
    mainE.appendChild(licenseE);

    const number_of_langs = document.createElement('h3');
    number_of_langs.id = 'number-of-langs';
    number_of_langs.textContent = `合計: ${ctc_metadata.datasize[0]} 語`;
    mainE.appendChild(number_of_langs);

    //テーブル本体とそのコンテナ
    const table_containerE = document.createElement('div');
    table_containerE.classList.add('table-container');
    const conlang_listE = document.createElement('table');
    conlang_listE.id = 'conlang-list';

    // ヘッダ
    const theadE = document.createElement('thead');
    const theadtrE = document.createElement('tr');
    for (const ths of ctc_content[0]) {
        const thE = document.createElement('th');
        thE.textContent = ths;
        theadtrE.appendChild(thE);
    }
    theadE.appendChild(theadtrE);
    conlang_listE.appendChild(theadE);

    // 中身
    const tbodyE = document.createElement('tbody');
    for (let i = 2; i < ctc_content.length; i++) {
        const tbodytrE = document.createElement('tr');
        for (const data of ctc_content[i]) {
            const tdE = document.createElement('td');
            const ofwrapperE = document.createElement('div');
            ofwrapperE.classList.add('wrapper');
            ofwrapperE.textContent = data;
            tdE.appendChild(ofwrapperE);
            tbodytrE.appendChild(tdE);
        }
        tbodyE.appendChild(tbodytrE);
    }
    conlang_listE.appendChild(tbodyE);

    // テーブルを追加
    table_containerE.appendChild(conlang_listE);
    mainE.appendChild(table_containerE);

    containerE.appendChild(mainE);
}

async function parseCSV(csvString) {
    if (typeof(csvString) !== 'string') throw new TypeError("not string");
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