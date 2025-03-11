// @ts-check

document.addEventListener('DOMContentLoaded', () => {
    const page_top_btn = document.getElementById('page-top-button');
    const val = page_top_btn instanceof HTMLButtonElement;

    if (!val) {
        console.error(Error(`typeof page_top_btn is not expected ${HTMLButtonElement.prototype}`).stack, page_top_btn);
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




 