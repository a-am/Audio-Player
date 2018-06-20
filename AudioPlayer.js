/**
 * HTML/JS Audio Player
 * by Adam Randlett (adam@randlett.net)
 * version 1.0.0
 * MIT License
 */

class AudioPlayer {
    constructor(audioElm, uiElm, options) {
        this.audio = audioElm;
        this.ui = uiElm;
        this.StripAudioElement();
        this.TouchDetect();
        this.DownloadDetect();

        let defaults = {
            classes: {
                pause: '-pausing',
                play: '-playing',
                end: '-ended'
            },
            controls: {
                playpause: this.ui.querySelector('.play-btn'),
                play: this.ui.querySelector('.play-btn'),
                pause: this.ui.querySelector('.ap__pause'),
                progressBar: this.ui.querySelector('.play-bar'),
                loadBar: this.ui.querySelector('.load-bar'),
                scrub: this.ui.querySelector('.seek-bar'),
                track: this.ui.querySelector('.progress-bar-wrapper'),
                volumeBtn: '',
                cTimeRef: this.ui.querySelector('.time-current'),
                dTimeRef: this.ui.querySelector('.time-duration'),
                download: this.ui.querySelector('.ap__download')
            }
        };

        // sync incoming options with defaults
        this.options = Object.assign(defaults, options);

        this.options.controls.progressBar.style.width = 0 + '%';
        this.options.controls.loadBar.style.width = 0 + '%';

        if (!this._download) {
            this.options.controls.download.style.display = 'none';
        }

        this.PlayerEvents();

        this.audio.pause();
    }

    play() {
        this.audio.play();
    }

    pause() {
        this.audio.pause();
    }

    PlayerEvents() {
        this.audio.addEventListener('play', this.ExtraEventData(this.UISetPause, this), false);
        this.audio.addEventListener('pause', this.ExtraEventData(this.UISetPlay, this), false);
        this.audio.addEventListener('ended', this.ExtraEventData(this.UISetEnd, this), false);

        this.options.controls.playpause.addEventListener('click', this.ExtraEventData(this.UITogglePlay, this), false);
        this.options.controls.scrub.addEventListener('click', this.ExtraEventData(this.UIPlayProgress, this), false);
        this.options.controls.scrub.addEventListener('mousedown', this.ExtraEventData(this.UIPlayProgress, this), false);

        this.audio.addEventListener('progress', this.ExtraEventData(this.UpdateLoadState, this), false);
        this.audio.addEventListener('timeupdate', this.ExtraEventData(this.UpdateProgress, this), false);
    }

    UISetPause(e, _this) {
        _this.ui.classList.add(_this.options.classes.play);
        _this.ui.classList.remove(_this.options.classes.pause);
        _this.ui.classList.remove(_this.options.classes.end);
    }

    UISetPlay(e, _this) {
        _this.ui.classList.add(_this.options.classes.pause);
        _this.ui.classList.remove(_this.options.classes.play);
    }

    UISetEnd(e, _this) {
        _this.ui.classList.add(_this.options.classes.pause);
        _this.ui.classList.add(_this.options.classes.end);
        _this.ui.classList.remove(_this.options.classes.play);
    }

    UITogglePlay(e, _this) {
        if (_this.audio.paused || _this.audio.ended) {
            if (_this.audio.ended) {
                _this.audio.currentTime = 0;
            }
            _this.audio.play();
        } else {
            _this.audio.pause();
        }
    }

    UIPlayProgress(e, _this) {
        let findPosX = function(obj) {
            let curleft = obj.offsetLeft;
            while (obj = obj.offsetParent) {
                curleft += obj.offsetLeft;
            }
            return curleft;
        }

        let xpos = e.pageX;
        let newPercent = Math.max(0, Math.min(1, (xpos - findPosX(_this.options.controls.track)) / _this.options.controls.track.offsetWidth));
        _this.audio.currentTime = newPercent * _this.audio.duration;
        _this.options.controls.progressBar.style.width = newPercent * (_this.options.controls.track.offsetWidth - 2) + "px";
    }

    ExtraEventData(orig) {
        let args = [].slice.call(arguments, 1);
        return function() {
            return orig.apply(this, [].slice.call(arguments).concat(args));
        }
    }

    FormatTime(seconds) {
        seconds = Math.round(seconds);
        let minutes = Math.floor(seconds / 60);
        minutes = (minutes >= 10) ? minutes : "0" + minutes;
        seconds = Math.floor(seconds % 60);
        seconds = (seconds >= 10) ? seconds : "0" + seconds;
        return minutes + ":" + seconds;
    }

    UpdateProgress(e, _this) {
        let length = e.target.duration;
        let secs = e.target.currentTime;
        let played = (secs / length) * 100;
        let timeLeft = _this.FormatTime(length - secs);
        let currentTime = _this.FormatTime(secs);

        _this.options.controls.progressBar.style.width = played + "%";
        _this.options.controls.cTimeRef.innerHTML = currentTime;
        _this.options.controls.dTimeRef.innerHTML = timeLeft;
    }

    UpdateLoadState(e, _this) {
        let maxLoaded = 0.0;
        if (e.target.buffered.length > 0) {
            maxLoaded = e.target.buffered.end(e.target.buffered.length - 1);
        }
        let percentLoaded = maxLoaded / e.target.duration;
        _this.options.controls.loadBar.style.width = percentLoaded * 100 + "%";
    }

    CreatePlayerControls() {
        this.ui.setAttribute("class", "AudioPlayer AudioPlayer-unibody live");
        this.ui.innerHTML = this.options.ui.parts;
        this.audio.parentNode.insertBefore(this.ui_unibody, this.audio.nextSibling);
    }

    StripAudioElement() {
        this.audio.removeAttribute("controls");
        this.audio.style.display = 'none';
    }

    TouchDetect() {
        const isTouch = (('ontouchstart' in window) || (navigator.msMaxTouchPoints > 0));
        if (isTouch) {
            this._touch = true;
        } else {
            this._touch = false;
        }
    }

    DownloadDetect() {
        var a = document.createElement('a');
        if (typeof a.download != "undefined") {
            this._download = true;
        } else {
            this._download = false;
        }
    }
}