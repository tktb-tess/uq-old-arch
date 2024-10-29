const pageTopBtn = document.getElementById('page-top-button');

window.addEventListener('scroll', function() {
    if (window.scrollY > 500) {
        pageTopBtn.classList.add('visible');
    } else {
        pageTopBtn.classList.remove('visible');
    }
}, false);

pageTopBtn.addEventListener('click', function() {
    window.scroll({top: 0});
}, false);

