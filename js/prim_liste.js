

onmessage = (e) => {
    // console.log('message received');
    const [min, max] = e.data;
    if(min > max) {
        postMessage([]);
        return;
    }
    const prim_liste = [...Array(max)].map((_, i) => i + 2);

    for (let i = 0; i < prim_liste.length; i++) {
        const p_ = prim_liste[i];
        for (let j = i + 1; j < prim_liste.length; j++) {
            if (prim_liste[j] % p_ === 0) {
                prim_liste.splice(j, 1);
            }
        }
    }
    while (prim_liste[0] < min) {
        prim_liste.shift();
    }
    postMessage(prim_liste);
    return;
};


