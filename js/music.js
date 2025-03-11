// @ts-check

document.addEventListener('DOMContentLoaded', async () => {
    const audioList = document.querySelectorAll('audio');
    const playBtnSvg = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 16 16\"><path d=\"m11.596 8.697-6.363 3.692c-.54.313-1.233-.066-1.233-.697V4.308c0-.63.692-1.01 1.233-.696l6.363 3.692a.802.802 0 0 1 0 1.393z\"/></svg>";
    const pauseBtnSvg = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 16 16\"><path d=\"M5.5 3.5A1.5 1.5 0 0 1 7 5v6a1.5 1.5 0 0 1-3 0V5a1.5 1.5 0 0 1 1.5-1.5zm5 0A1.5 1.5 0 0 1 12 5v6a1.5 1.5 0 0 1-3 0V5a1.5 1.5 0 0 1 1.5-1.5z\"/></svg>";

    /** @type {HTMLAudioElement | null} */
    let current_play_track = null;

    /**
     * 秒の小数表示を時刻表示に変換
     * @param {number} time 
     * @returns 
     */
    const toTime = (time) => {
        const sec = (time | 0) % 60;
        const min = time / 60 | 0;
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
            console.error(Error(`typeof ${musicID}-play is not expected`).stack, play_btn_E);
            return false;
        }

        if (!(stop_btn_E instanceof HTMLButtonElement)) {
            console.error(Error(`typeof ${musicID}-stop is not expected`).stack, stop_btn_E);
            return false;
        }

        if (!(loop_btn_E instanceof HTMLButtonElement)) {
            console.error(Error(`typeof ${musicID}-loop is not expected`).stack, loop_btn_E);
            return false;
        }

        if (!(time_E instanceof HTMLSpanElement)) {
            console.error(Error(`typeof ${musicID}-time is not expected`).stack, time_E);
            return false;
        }

        audio_E.addEventListener('timeupdate', () => {
            time_E.textContent = toTime(audio_E.currentTime) + ' / ' + dur;
        }, false);

        audio_E.addEventListener('ended', () => { // 最後まで再生された場合の処理
            time_E.textContent = '0:00 / ' + dur;
            current_play_track = null;
            play_btn_E.innerHTML = playBtnSvg;
        }, false);

        play_btn_E.addEventListener('click', () => {
            if (!current_play_track) { // 何も再生されていない場合
                current_play_track = audio_E;
                current_play_track.play();
                play_btn_E.innerHTML = pauseBtnSvg;
            } else if (current_play_track.id !== musicID) { // 他の曲が再生されている場合
                const prev_musicID = current_play_track.id;
                const play_btn_prev_E = document.getElementById(`${prev_musicID}-play`);
                const play_time_prev_E = document.getElementById(`${prev_musicID}-time`);

                if (!(play_btn_prev_E instanceof HTMLButtonElement)) {
                    console.error(Error(`typeof ${prev_musicID}-play is not expected ${HTMLButtonElement.prototype}`).stack, prev_musicID);
                    return false;
                    
                } else if (!(play_time_prev_E instanceof HTMLSpanElement)) {
                    console.error(Error(`typeof ${play_time_prev_E}-play is not expected ${HTMLButtonElement.prototype}`).stack, play_time_prev_E);
                    return false;
                }

                // 前の曲を止める
                current_play_track.pause();
                current_play_track.currentTime = 0;
                play_btn_prev_E.innerHTML = playBtnSvg;

                // 再生処理
                current_play_track = audio_E;
                current_play_track.play();
                play_btn_E.innerHTML = pauseBtnSvg;

            } else if (current_play_track.paused) { // 再開
                current_play_track.play();
                play_btn_E.innerHTML = pauseBtnSvg;

            } else if (!current_play_track.paused) { // 一時停止
                current_play_track.pause();
                play_btn_E.innerHTML = playBtnSvg;

            } else {
                console.error(Error('unidentified error!').stack, current_play_track);
            }
        }, false);

        stop_btn_E.addEventListener('click', () => {

            if (current_play_track && current_play_track.id === musicID) {
                current_play_track.pause();
                current_play_track.currentTime = 0;
                current_play_track = null;
                play_btn_E.innerHTML = playBtnSvg;
                // console.log('music stopped');
            }

        }, false);

        loop_btn_E.addEventListener('click', () => {
            if (!loop_btn_E.dataset.active) {
                loop_btn_E.dataset.active = String(true);
                audio_E.loop = true;
            } else {
                delete loop_btn_E.dataset.active;
                audio_E.loop = false;
            }
        }, false);
    }

    Object.defineProperty(window, 'current_play_track', {
        get() {
            return current_play_track;
        },
        enumerable: true,
    });

    console.log(`all listeners were successfully added`);
    return true;
}, false);
