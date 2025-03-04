// @ts-check
"use strict";

document.addEventListener('DOMContentLoaded', () => {
    const pageTopBtn = document.getElementById('page-top-button');
    const check = pageTopBtn instanceof HTMLButtonElement;
    if (!check) {
        const e = TypeError('type is not expected', { cause: pageTopBtn });
        console.error(e.stack, e.cause);
        return -1;
    }
    window.addEventListener('scroll', () => {
        if (window.scrollY > 500) {
            pageTopBtn.dataset.visible = String(true);
        } else {
            delete pageTopBtn.dataset.visible;
        }
        
    }, false);
    
    pageTopBtn.addEventListener('click', () => {
        window.scroll({ top: 0 });
    }, false);
}, false);




 