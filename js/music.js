// @ts-check
"use strict";

document.addEventListener('DOMContentLoaded', async () => {
    const audioList = document.querySelectorAll('audio');
    const playBtnSvg = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 16 16\"><path d=\"m11.596 8.697-6.363 3.692c-.54.313-1.233-.066-1.233-.697V4.308c0-.63.692-1.01 1.233-.696l6.363 3.692a.802.802 0 0 1 0 1.393z\"/></svg>";
    const pauseBtnSvg = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 16 16\"><path d=\"M5.5 3.5A1.5 1.5 0 0 1 7 5v6a1.5 1.5 0 0 1-3 0V5a1.5 1.5 0 0 1 1.5-1.5zm5 0A1.5 1.5 0 0 1 12 5v6a1.5 1.5 0 0 1-3 0V5a1.5 1.5 0 0 1 1.5-1.5z\"/></svg>";

    /** @type {HTMLAudioElement | null} */
    let current_play = null;

    /**
     * 秒の小数表示を時刻表示に変換
     * @param {number} time 
     * @returns 
     */
    const toTime = (time) => {
        const sec = (time >>> 0) % 60;
        const min = time / 60 >>> 0;
        const sec_str = sec.toString().padStart(2, '0');
        return min.toString() + ':' + sec_str;
    }

    for (const audio_E of audioList) {
        const musicID = audio_E.id;
        const time_E = document.getElementById(musicID + '-time');
        const play_btn_E = document.getElementById(musicID + '-play');
        const stop_btn_E = document.getElementById(musicID + '-stop');
        const loop_btn_E = document.getElementById(musicID + '-loop');
        const dur = toTime(audio_E.duration);

        if (!(play_btn_E instanceof HTMLButtonElement)) {
            const e = Error(`typeof ${musicID}-play is not expected`, { cause: play_btn_E });
            console.error(e.stack, e.cause);
            return false;
        }

        if (!(stop_btn_E instanceof HTMLButtonElement)) {
            const e = Error(`typeof ${musicID}-stop is not expected`, { cause: stop_btn_E });
            console.error(e.stack, e.cause);
            return false;
        }

        if (!(loop_btn_E instanceof HTMLButtonElement)) {
            const e = Error(`typeof ${musicID}-loop is not expected`, { cause: loop_btn_E });
            console.error(e.stack, e.cause);
            return false;
        }

        if (!(time_E instanceof HTMLSpanElement)) {
            const e = Error(`typeof ${musicID}-time is not expected`, { cause: time_E });
            console.error(e.stack, e.cause);
            return false;
        }

        audio_E.addEventListener('timeupdate', () => {
            time_E.textContent = toTime(audio_E.currentTime) + ' / ' + dur;
        }, false);

        audio_E.addEventListener('ended', () => { // 最後まで再生された場合の処理
            time_E.textContent = '0:00 / ' + dur;
            current_play = null;
            play_btn_E.innerHTML = playBtnSvg;
        }, false);

        play_btn_E.addEventListener('click', () => {
            if (!current_play) { // 何も再生されていない場合
                current_play = audio_E;
                current_play.play();
                play_btn_E.innerHTML = pauseBtnSvg;
            } else if (current_play.id !== musicID) { // 他の曲が再生されている場合
                const prev_musicID = current_play.id;
                const play_btn_prev_E = document.getElementById(`${prev_musicID}-play`);
                const play_time_prev_E = document.getElementById(`${prev_musicID}-time`);

                if (!(play_btn_prev_E instanceof HTMLButtonElement)) {
                    const e = Error(`typeof ${prev_musicID}-play is not expected ${HTMLButtonElement.prototype}`, { cause: play_btn_prev_E });
                    console.error(e.stack, e.cause);
                    return false;
                } else if (!(play_time_prev_E instanceof HTMLSpanElement)) {
                    const e = Error(`typeof ${prev_musicID}-time is not expected ${HTMLSpanElement.prototype}`, { cause: play_time_prev_E });
                    console.error(e.stack, e.cause);
                    return false;
                }

                // 前の曲を止める
                current_play.pause();
                play_btn_prev_E.innerHTML = playBtnSvg;

                // 再生処理
                current_play = audio_E;
                current_play.play();
                play_btn_E.innerHTML = pauseBtnSvg;
            } else if (current_play.paused) { // 再開
                current_play.play();
                play_btn_E.innerHTML = pauseBtnSvg;

            } else if (!current_play.paused) { // 一時停止
                current_play.pause();
                play_btn_E.innerHTML = playBtnSvg;

            } else {
                const e = Error(`unidentified error!`, { cause: current_play });
                console.error(e.stack, e.cause);
            }
        }, false);

        stop_btn_E.addEventListener('click', () => {
            if (current_play && current_play.id === musicID) {
                current_play.pause();
                current_play.currentTime = 0;
                current_play = null;
                play_btn_E.innerHTML = playBtnSvg;
                // console.log('music stopped');
            }
        }, false);

        loop_btn_E.addEventListener('click', () => {
            if (!loop_btn_E.dataset.active) {
                loop_btn_E.dataset.active = 'true';
                audio_E.loop = true;
            } else {
                delete loop_btn_E.dataset.active;
                audio_E.loop = false;
            }
        }, false);
    }
    Object.defineProperty(window, 'current_playing_audio', {
        get() {
            return current_play;
        },
        enumerable: true,
    });
    console.log(`all works were successfully completed`);
}, false);



