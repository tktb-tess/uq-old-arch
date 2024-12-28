const pageTopBtn = document.getElementById('page-top-button');

window.addEventListener('scroll', function() {
    if (window.scrollY > 500) {
        pageTopBtn.dataset.visible = true;
    } else {
        delete pageTopBtn.dataset.visible;
    }
    
}, false);

pageTopBtn.addEventListener('click', function() {
    window.scroll({top: 0});
}, false);

