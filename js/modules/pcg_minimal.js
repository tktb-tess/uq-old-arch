// @ts-check

const i_seed = Object.freeze([0x853c49e6748fea9bn, 0xda3e39cb94b95bdbn]);
const multiplier = 0x5851f42d4c957f2dn;

/** PCG (Permuted congruential generator) 乱数のクラス */
export default class PCGMinimal {
    #state = new BigUint64Array(2);

    get [Symbol.toStringTag]() {
        return PCGMinimal.name;
    }

    /** シード値の配列を返す */
    static getSeed() {
        return crypto.getRandomValues(new BigUint64Array(2));
    }

    /**
     * 
     * @param {BigUint64Array<ArrayBuffer> | null} seeds 64bit整数の配列 (長さ2以上) nullまたは省略した場合常に同じ値によって初期化される
     */
    constructor(seeds = null) {

        if (seeds && seeds.length >= 2) {
            this.#state[1] = (seeds[1] << 1n) | 1n;
            this.step();
            this.#state[0] += seeds[0];
            this.step();
        } else {
            this.#state[0] = i_seed[0];
            this.#state[1] = i_seed[1];
        }
    }

    step() {
        this.#state[0] = this.#state[0] * multiplier + this.#state[1];
    }

    /**
     * 
     * @param {bigint} value 
     * @param {bigint} rot 
     */
    static #rot32(value, rot) {
        return BigInt.asUintN(32, value >> (rot & 31n) | value << (-rot & 31n));
    }

    get value() {
        const prev = this.#state[0];
        const rot = prev >> 59n;
        const shifted = BigInt.asUintN(32, (prev ^ (prev >> 18n)) >> 27n);
        return Number(PCGMinimal.#rot32(shifted, rot));
    }

    getRand() {
        this.step();
        return this.value;
    }

    /**
     * bound 以下の乱数を返す
     * @param {number} bound 
     */
    getBoundedRand(bound) {
        const limit = 0x100000000;
        if (bound > limit) throw Error('bound exceeds limit (2^32)');
        const threshold = limit % bound;

        while (true) {
            const r = this.getRand();
            if (r >= threshold) return r % bound;
        }
    }

    /**
     * 
     * @param {number} step 
     * @param {number | null} bound 
     */
    *genRands(step, bound = null) {

        for (let i = 0; i < step; i++) {
            yield bound ? this.getBoundedRand(bound) : this.getRand();
        }
    }
}