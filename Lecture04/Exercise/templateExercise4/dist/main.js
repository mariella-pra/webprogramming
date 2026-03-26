"use strict";
class PianoKey {
    constructor(props) {
        this.note = props.note;
        this.keyChar = props.keyChar;
        this.audio = new Audio(props.audioPath);
        this.elementId = props.elementId;
    }
    play() {
        this.audio.currentTime = 0;
        this.audio.play();
        const element = document.getElementById(this.elementId);
        if (element) {
            element.classList.add("pressed");
            setTimeout(() => element.classList.remove("pressed"), 250);
        }
    }
}
const pianoKeys = {
    "C": new PianoKey({ note: "C", keyChar: "a", audioPath: "./sounds/C.mp3", elementId: "keyC" }),
    "C#": new PianoKey({ note: "C#", keyChar: "w", audioPath: "./sounds/C5.mp3", elementId: "keyCsharp" }),
    "D": new PianoKey({ note: "D", keyChar: "s", audioPath: "./sounds/D.mp3", elementId: "keyD" }),
    "D#": new PianoKey({ note: "D#", keyChar: "e", audioPath: "./sounds/D5.mp3", elementId: "keyDsharp" }),
    "E": new PianoKey({ note: "E", keyChar: "d", audioPath: "./sounds/E.mp3", elementId: "keyE" }),
    "F": new PianoKey({ note: "F", keyChar: "f", audioPath: "./sounds/F.mp3", elementId: "keyF" }),
    "F#": new PianoKey({ note: "F#", keyChar: "t", audioPath: "./sounds/F5.mp3", elementId: "keyFsharp" }),
    "G": new PianoKey({ note: "G", keyChar: "g", audioPath: "./sounds/G.mp3", elementId: "keyG" }),
    "G#": new PianoKey({ note: "G#", keyChar: "z", audioPath: "./sounds/G5.mp3", elementId: "keyGsharp" }),
    "A": new PianoKey({ note: "A", keyChar: "h", audioPath: "./sounds/A.mp3", elementId: "keyA" }),
    "A#": new PianoKey({ note: "A#", keyChar: "u", audioPath: "./sounds/A4.mp3", elementId: "keyAsharp" }),
    "B": new PianoKey({ note: "B", keyChar: "j", audioPath: "./sounds/B.mp3", elementId: "keyB" })
};
// 'a' -> 'C'
const charToNoteMap = {};
for (let key in pianoKeys) {
    charToNoteMap[pianoKeys[key].keyChar] = key;
}
let loadedSequence = [];
let playbackTimeouts = [];
let isPlaying = false;
const getBtn = (id) => document.getElementById(id);
function playNote(noteName) {
    const keyObj = pianoKeys[noteName];
    if (keyObj)
        keyObj.play();
}
document.addEventListener("keydown", (e) => {
    const char = e.key.toLowerCase();
    if (charToNoteMap[char]) {
        playNote(charToNoteMap[char]);
    }
    if (e.code === "Space") {
        e.preventDefault();
        if (loadedSequence.length > 0) {
            isPlaying ? pausePlayback() : startPlayback();
        }
    }
    if (e.code === "Escape")
        resetApp();
});
document.querySelectorAll(".key").forEach(keyEl => {
    keyEl.addEventListener("click", (e) => {
        const target = e.currentTarget;
        const note = target.getAttribute("data-note");
        if (note)
            playNote(note);
    });
});
getBtn("btnLoad").addEventListener("click", () => {
    resetApp();
    fetch('song.json')
        .then(response => response.json())
        .then((data) => {
        loadedSequence = data;
        renderNotes();
        getBtn("btnPlay").disabled = false;
    })
        .catch(() => alert("could not load JSON"));
});
function renderNotes() {
    const noteLine = document.getElementById("note-line");
    if (!noteLine)
        return;
    noteLine.innerHTML = "";
    loadedSequence.forEach((item) => {
        const span = document.createElement("span");
        span.className = "badge badge-primary mx-1 p-2";
        span.innerText = item.note;
        span.addEventListener("click", () => playNote(item.note));
        noteLine.appendChild(span);
    });
}
function startPlayback() {
    if (isPlaying || loadedSequence.length === 0)
        return;
    isPlaying = true;
    getBtn("btnPlay").disabled = true;
    getBtn("btnPause").disabled = false;
    let delay = 0;
    loadedSequence.forEach((item) => {
        let timeoutId = window.setTimeout(() => {
            playNote(item.note);
        }, delay);
        playbackTimeouts.push(timeoutId);
        delay += item.duration;
    });
    playbackTimeouts.push(setTimeout(() => {
        pausePlayback();
    }, delay));
}
function pausePlayback() {
    isPlaying = false;
    getBtn("btnPlay").disabled = false;
    getBtn("btnPause").disabled = true;
    playbackTimeouts.forEach(clearTimeout);
    playbackTimeouts = [];
}
function resetApp() {
    pausePlayback();
    for (let note in pianoKeys) {
        pianoKeys[note].audio.pause();
        pianoKeys[note].audio.currentTime = 0;
    }
    document.querySelectorAll(".key").forEach(key => key.classList.remove("pressed"));
    loadedSequence = [];
    const noteLine = document.getElementById("note-line");
    if (noteLine)
        noteLine.innerHTML = "";
    getBtn("btnPlay").disabled = true;
    getBtn("btnPause").disabled = true;
}
getBtn("btnPlay").addEventListener("click", startPlayback);
getBtn("btnPause").addEventListener("click", pausePlayback);
getBtn("btnReset").addEventListener("click", resetApp);
