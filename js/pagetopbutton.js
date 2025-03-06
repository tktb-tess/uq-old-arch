// @ts-check
"use strict";

document.addEventListener('DOMContentLoaded', () => {
    const page_top_btn = document.getElementById('page-top-button');
    const check = page_top_btn instanceof HTMLButtonElement;
    if (!check) {
        const e = TypeError(`typeof page_top_btn is not expected ${HTMLButtonElement.prototype}`, { cause: page_top_btn });
        console.error(e.stack, e.cause);
        return false;
    }
    window.addEventListener('scroll', () => {
        if (window.scrollY > 500) {
            page_top_btn.dataset.visible = String(true);
        } else {
            delete page_top_btn.dataset.visible;
        }
    }, false);
    
    page_top_btn.addEventListener('click', () => {
        window.scroll({ top: 0 });
    }, false);
}, false);




 