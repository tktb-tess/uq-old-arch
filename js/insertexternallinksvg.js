// @ts-check

const svg_external_link = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" style="fill:currentColor;display:inline-block;width:.75rem;height:auto;">
        <!--!Font Awesome Free 6.7.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc.-->
        <path d="M320 0c-17.7 0-32 14.3-32 32s14.3 32 32 32l82.7 0L201.4 265.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L448 109.3l0 82.7c0 17.7 14.3 32 32 32s32-14.3 32-32l0-160c0-17.7-14.3-32-32-32L320 0zM80 32C35.8 32 0 67.8 0 112L0 432c0 44.2 35.8 80 80 80l320 0c44.2 0 80-35.8 80-80l0-112c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 112c0 8.8-7.2 16-16 16L80 448c-8.8 0-16-7.2-16-16l0-320c0-8.8 7.2-16 16-16l112 0c17.7 0 32-14.3 32-32s-14.3-32-32-32L80 32z"/>
    </svg>
`;

window.addEventListener('load', () => {
    const ext_link_Es = document.getElementsByClassName('external-link');

    if (ext_link_Es.length === 0) return;
    
    for (const ext_link of ext_link_Es) {
        ext_link.insertAdjacentHTML('beforeend', svg_external_link);
    }
});

export {};