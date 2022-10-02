"use strict";
class MainPage {
    baseEl;
    lblTime;
    request = null;
    verticalBar;
    alarmSound;
    initialize() {
        const el = this.baseEl = document.body;
        this.lblTime = el.querySelector(".lbl-time");
        this.verticalBar = el.querySelector(".vertical-bar");
        el.addDelegate("click", "[data-op]", (_, t) => this.onOpButtonClick(t));
        el.querySelector("#panel-stopwatch .btn-pause").addEventListener("click", () => this.onStopwatchPauseButtonClick());
        el.querySelector("#panel-stopwatch .btn-resume").addEventListener("click", () => this.onStopwatchResumeButtonClick());
        el.querySelector("#panel-countdown .btn-resume").addEventListener("click", () => this.onCountdownResumeButtonClick());
        el.querySelector("#panel-countdown .btn-pause").addEventListener("click", () => this.onCountdownPauseButtonClick());
        el.querySelector("#panel-countdown .btn-stop").addEventListener("click", () => this.onCountdownStopButtonClick());
        el.querySelector("#panel-alarm .btn-stop").addEventListener("click", () => this.onAlarmStopButtonClick());
        this.alarmSound = document.createElement("audio");
        this.alarmSound.src = "audio/alarm.mp3";
        this.alarmSound.loop = true;
        this.setAlarmInitial();
        document.body.loc();
        document.title = "AppName".loc();
        this.countDown();
    }
    onStopwatchPauseButtonClick() {
        const r = this.request;
        if (!r) {
            return;
        }
        r.pause = true;
        r.btnPause.disabled = true;
        r.btnResume.disabled = false;
    }
    onStopwatchResumeButtonClick() {
        const r = this.request;
        r.lastTime = Date.now();
        r.pause = false;
        r.btnPause.disabled = false;
        r.btnResume.disabled = true;
    }
    onCountdownPauseButtonClick() {
        const r = this.request;
        r.pause = true;
        r.btnPause.disabled = true;
        r.btnResume.disabled = false;
    }
    onCountdownResumeButtonClick() {
        const r = this.request;
        r.lastTime = Date.now();
        r.pause = false;
        r.btnPause.disabled = false;
        r.btnResume.disabled = true;
    }
    onCountdownStopButtonClick() {
        this.stopAlarm();
        const r = this.request;
        r.finish = true;
        r.btnPause.disabled = true;
        r.btnStop.disabled = true;
        r.btnResume.disabled = true;
    }
    onAlarmStopButtonClick() {
        const r = this.request;
        r.finish = true;
        r.btnStop.disabled = true;
        this.stopAlarm();
    }
    setAlarmInitial() {
        const group = document.querySelectorAll(".area-alarm .time-group input");
        const time = new Date(Date.now() + 300000);
        group[0].value = this.padding(time.getHours());
        group[1].value = this.padding(time.getMinutes());
        group[2].value = this.padding(time.getSeconds());
    }
    onOpButtonClick(btn) {
        this.stopAlarm();
        const op = btn.getAttribute("data-op");
        const targetTimeEl = btn.closest(".area-panel").querySelector(".time-group");
        const time = this.parseTimeInput(targetTimeEl, op == "AlarmClock");
        const totalS = Math.max(time.hour * 3600 + time.minute * 60 + time.second, 0);
        const now = new Date();
        const nowMs = Date.now();
        let column = 2;
        switch (op) {
            case "Countdown":
                {
                    const el = this.baseEl.querySelector("#panel-countdown");
                    column = 2;
                    const r = this.request = {
                        op: "Countdown",
                        startTime: nowMs,
                        targetTime: totalS,
                        currTime: totalS,
                        lastTime: nowMs,
                        lblTimer: el.querySelector(".timer"),
                        btnPause: el.querySelector(".btn-pause"),
                        btnResume: el.querySelector(".btn-resume"),
                        btnStop: el.querySelector(".btn-stop"),
                    };
                    r.btnPause.disabled = false;
                    r.btnResume.disabled = true;
                    r.btnStop.disabled = false;
                }
                break;
            case "AlarmClock":
                {
                    const el = this.baseEl.querySelector("#panel-alarm");
                    column = 3;
                    const targetTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), time.hour, time.minute, time.second);
                    let targetMs = targetTime.getTime();
                    if (targetMs < nowMs) {
                        targetMs += 24 * 60 * 60 * 1000;
                    }
                    const r = this.request = {
                        op: "Alarm",
                        startTime: nowMs,
                        targetTime: targetMs,
                        lblTimer: el.querySelector(".timer"),
                        btnStop: el.querySelector(".btn-stop"),
                    };
                    r.btnStop.disabled = false;
                }
                break;
            case "Stopwatch":
                {
                    const el = this.baseEl.querySelector("#panel-stopwatch");
                    column = 4;
                    const r = this.request = {
                        op: "Stopwatch",
                        startTime: nowMs,
                        lastTime: nowMs,
                        currTime: 0,
                        lblTimer: el.querySelector(".timer"),
                        btnPause: el.querySelector(".btn-pause"),
                        btnResume: el.querySelector(".btn-resume"),
                    };
                    r.btnPause.disabled = false;
                    r.btnResume.disabled = true;
                }
                break;
        }
        this.verticalBar.setAttribute("data-col", column);
        this.baseEl.querySelectorAll(`.area-op-content`).forEach(el => {
            el.classList.add("d-none");
        });
        this.baseEl.querySelector(`.area-op-content[data-col="${column}"]`)
            .classList.remove("d-none");
    }
    parseTimeInput(el, limit24Hour = false) {
        const inputs = el.querySelectorAll("input");
        const result = {
            hour: parseInt(inputs[0].value) || 0,
            minute: parseInt(inputs[1].value) || 0,
            second: parseInt(inputs[2].value) || 0,
        };
        if (limit24Hour && result.hour > 23) {
            result.hour = 23;
        }
        inputs[0].value = this.padding(result.hour);
        inputs[1].value = this.padding(result.minute);
        inputs[2].value = this.padding(result.second);
        return result;
    }
    countDown() {
        try {
            const now = new Date();
            const nowMs = Date.now();
            const timeF = this.formatTime(now);
            let title = this.lblTime.innerHTML = timeF;
            if (this.request) {
                const r = this.request;
                switch (r.op) {
                    case "Stopwatch":
                        if (!r.pause) {
                            r.currTime += nowMs - r.lastTime;
                            r.lastTime = nowMs;
                            title = r.lblTimer.innerHTML = this.formatTimespan(this.request.currTime / 1000);
                        }
                        break;
                    case "Countdown":
                        if (!r.finish && !r.pause && r.currTime > 0) {
                            r.currTime -= (nowMs - r.lastTime) / 1000;
                            r.lastTime = nowMs;
                            if (r.currTime <= 0) {
                                r.finish = true;
                                r.currTime = 0;
                                r.btnPause.disabled = true;
                                r.btnResume.disabled = true;
                                r.btnStop.disabled = false;
                                this.startAlarm();
                            }
                            title = r.lblTimer.innerHTML = this.formatTimespan(r.currTime);
                        }
                        break;
                    case "Alarm":
                        if (!r.finish) {
                            r.currTime = (r.targetTime - nowMs) / 1000;
                            if (r.currTime <= 0) {
                                r.currTime = 0;
                                r.finish = true;
                                r.btnStop.disabled = false;
                                this.startAlarm();
                            }
                            title = r.lblTimer.innerHTML = this.formatTimespan(r.currTime);
                        }
                        break;
                }
            }
            document.title = title;
        }
        catch (e) {
            console.error(e);
        }
        window.setTimeout(() => this.countDown(), 50);
    }
    startAlarm() {
        this.alarmSound.currentTime = 0;
        this.alarmSound.play();
    }
    stopAlarm() {
        this.alarmSound.pause();
    }
    formatTimespan(seconds) {
        const hours = parseInt((seconds / 3600));
        seconds -= hours * 3600;
        const minutes = parseInt((seconds / 60));
        seconds -= minutes * 60;
        const intSeconds = parseInt(seconds);
        seconds -= intSeconds;
        const fraction = Math.round(seconds * 100);
        return `${this.padding(hours)}:${this.padding(minutes)}:${this.padding(intSeconds)}.${this.padding(fraction)}`;
    }
    formatTime(date) {
        return `${this.padding(date.getHours())}:${this.padding(date.getMinutes())}:${this.padding(date.getSeconds())}`;
    }
    padding(num) {
        if (num < 10) {
            return "0" + num;
        }
        else {
            return num;
        }
    }
}
new MainPage().initialize();
//# sourceMappingURL=MainPage.js.map