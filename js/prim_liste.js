"use strict";

onmessage = (e) => {
    // console.log('message received');
    const [min, max] = e.data;
    if (min > max) {
        postMessage([]);
        return;
    }
    const prim_liste = [...Array(max - 1)].map((_, i) => i + 2); // [2, 3, 4, ..., max]

    for (let i = 0; i < prim_liste.length; i++) { // エラトステネスの篩
        const p_ = prim_liste[i];
        for (let j = i + 1; j < prim_liste.length; j++) {
            if (prim_liste[j] % p_ === 0) {
                prim_liste.splice(j, 1);
            }
        }
    }
    // [2, 3, 5, ..., p_k (< max)]

    postMessage({liste: prim_liste, min: min}); //メインスレッドに返す
    return;
};


