// 1.
const pianoKeys = {
    "C":  { note: "C",  keyChar: "a", audio: new Audio("./sounds/C.mp3"),  elementId: "keyC" },
    "C#": { note: "C#", keyChar: "w", audio: new Audio("./sounds/C5.mp3"), elementId: "keyCsharp" },
    "D":  { note: "D",  keyChar: "s", audio: new Audio("./sounds/D.mp3"),  elementId: "keyD" },
    "D#": { note: "D#", keyChar: "e", audio: new Audio("./sounds/D5.mp3"), elementId: "keyDsharp" },
    "E":  { note: "E",  keyChar: "d", audio: new Audio("./sounds/E.mp3"),  elementId: "keyE" },
    "F":  { note: "F",  keyChar: "f", audio: new Audio("./sounds/F.mp3"),  elementId: "keyF" },
    "F#": { note: "F#", keyChar: "t", audio: new Audio("./sounds/F5.mp3"), elementId: "keyFsharp" },
    "G":  { note: "G",  keyChar: "g", audio: new Audio("./sounds/G.mp3"),  elementId: "keyG" },
    "G#": { note: "G#", keyChar: "z", audio: new Audio("./sounds/G5.mp3"), elementId: "keyGsharp" },
    "A":  { note: "A",  keyChar: "h", audio: new Audio("./sounds/A.mp3"),  elementId: "keyA" },
    "A#": { note: "A#", keyChar: "u", audio: new Audio("./sounds/A4.mp3"), elementId: "keyAsharp" },
    "B":  { note: "B",  keyChar: "j", audio: new Audio("./sounds/B.mp3"),  elementId: "keyB" }
};

// 'a' -> 'C'
const charToNoteMap = {};
for (let key in pianoKeys) {
    charToNoteMap[pianoKeys[key].keyChar] = key;
}

let loadedSequence = [];
let playbackTimeouts = [];
let isPlaying = false;


// playNote
function playNote(noteName) {
    const keyObj = pianoKeys[noteName];
    if (!keyObj) return;

    // visual feedback
    const element = document.getElementById(keyObj.elementId);
    if (element) {
        element.classList.add("pressed");
        setTimeout(() => element.classList.remove("pressed"), 250);
    }

    // audio playback
    keyObj.audio.currentTime = 0;
    keyObj.audio.play();
}



document.addEventListener("keydown", (e) => {
    const char = e.key.toLowerCase();
    if (charToNoteMap[char]) playNote(charToNoteMap[char]);
});

document.querySelectorAll(".key").forEach(keyEl => {
    keyEl.addEventListener("click", function() {
        playNote(this.dataset.note);
    });
});


// 2.
document.getElementById("btnLoad").addEventListener("click", () => {
    resetApp();
    
    fetch('song.json')
        .then(response => {
            if (!response.ok) throw new Error("network response not ok");
            return response.json();
        })
        .then(data => {
            loadedSequence = data;
            renderNotes();
            document.getElementById("btnPlay").disabled = false;
        })
        .catch(error => alert("could not load JSON"));
});

function renderNotes() {
    const noteLine = document.getElementById("note-line");
    noteLine.innerHTML = ""; 
    
    loadedSequence.forEach((item) => {
        const span = document.createElement("span");
        span.className = "badge badge-primary mx-1 p-2";
        span.innerText = item.note;
        
        // 3.
        span.addEventListener("click", () => {
            playNote(item.note);
        });
        
        noteLine.appendChild(span);
    });
}


// 3.
document.addEventListener("keydown", (e) => {
    if (e.code === "Space") {
        e.preventDefault();
        if (loadedSequence.length > 0) {
            isPlaying ? pausePlayback() : startPlayback();
        }
    }
    if (e.code === "Escape") {
        resetApp();
    }
});

// bind buttons to playback functions
document.getElementById("btnPlay").addEventListener("click", startPlayback);
document.getElementById("btnPause").addEventListener("click", pausePlayback);
document.getElementById("btnReset").addEventListener("click", resetApp);

function startPlayback() {
    if (isPlaying || loadedSequence.length === 0) return;
    isPlaying = true;
    
    document.getElementById("btnPlay").disabled = true;
    document.getElementById("btnPause").disabled = false;

    let delay = 0;
    loadedSequence.forEach((item) => {
        let timeoutId = setTimeout(() => {
            playNote(item.note);
        }, delay);
        
        playbackTimeouts.push(timeoutId);
        delay += item.duration;
    });
    
    // reset play button when song finishes
    playbackTimeouts.push(setTimeout(() => {
        pausePlayback();
    }, delay));
}

function pausePlayback() {
    isPlaying = false;
    document.getElementById("btnPlay").disabled = false;
    document.getElementById("btnPause").disabled = true;
    
    playbackTimeouts.forEach(clearTimeout);
    playbackTimeouts = [];
}


// 4.
function resetApp() {
    //stop playing
    pausePlayback(); 
    
    //stop audio
    for (let note in pianoKeys) {
        pianoKeys[note].audio.pause();
        pianoKeys[note].audio.currentTime = 0;
    }

    //reset visuals
    document.querySelectorAll(".key").forEach(key => {
        key.classList.remove("pressed");
    });

    //clear 
    loadedSequence = [];
    document.getElementById("note-line").innerHTML = "";
    document.getElementById("btnPlay").disabled = true;
    document.getElementById("btnPause").disabled = true;
}