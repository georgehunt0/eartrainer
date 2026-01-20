const noteListEl = document.getElementById("note-list");
const currentStringEl = document.getElementById("current-string");
const currentFretEl = document.getElementById("current-fret");
const currentNoteEl = document.getElementById("current-note");
const statusEl = document.getElementById("status");
const scoreRightEl = document.getElementById("score-right");
const scoreWrongEl = document.getElementById("score-wrong");
const toggleAllButton = document.getElementById("toggle-all");

const replayButton = document.getElementById("replay");
const revealButton = document.getElementById("reveal");
const nextButton = document.getElementById("next");

const state = {
  notes: [],
  selectedNoteIds: new Set(),
  currentNote: null,
  reveal: false,
  scoreRight: 0,
  scoreWrong: 0,
  audio: null,
};

const AUDIO_BASE = "./audio/";

const setStatus = (message) => {
  statusEl.textContent = message;
};

const updateScore = () => {
  scoreRightEl.textContent = state.scoreRight.toString();
  scoreWrongEl.textContent = state.scoreWrong.toString();
};

const updateDisplay = () => {
  if (!state.currentNote) {
    currentStringEl.textContent = "—";
    currentFretEl.textContent = "—";
    currentNoteEl.textContent = "?";
    return;
  }

  currentStringEl.textContent = state.currentNote.string;
  currentFretEl.textContent = state.currentNote.fret;
  currentNoteEl.textContent = state.reveal ? state.currentNote.note : "?";
};

const createAudio = (note) => {
  if (!note) return null;
  const audio = new Audio(`${AUDIO_BASE}${note.file}`);
  audio.preload = "auto";
  audio.addEventListener("error", () => {
    setStatus(`Missing audio file: ${note.file}`);
  });
  return audio;
};

const playCurrent = () => {
  if (!state.currentNote) {
    setStatus("Select at least one note to begin.");
    return;
  }
  if (!state.audio) {
    state.audio = createAudio(state.currentNote);
  }
  state.audio.currentTime = 0;
  state.audio.play().catch(() => {
    setStatus("Audio playback failed. Check your browser autoplay settings.");
  });
};

const reveal = () => {
  if (!state.currentNote) return;
  state.reveal = true;
  updateDisplay();
  setStatus(`Answer: ${state.currentNote.note}`);
};

const pickRandomNote = () => {
  const enabledNotes = state.notes.filter((note) =>
    state.selectedNoteIds.has(note.id),
  );

  if (!enabledNotes.length) {
    setStatus("Select at least one note to begin.");
    state.currentNote = null;
    state.audio = null;
    updateDisplay();
    return;
  }

  const nextNote =
    enabledNotes[Math.floor(Math.random() * enabledNotes.length)];
  state.currentNote = nextNote;
  state.reveal = false;
  state.audio = createAudio(nextNote);
  updateDisplay();
  setStatus("Press space to replay or reveal the answer.");
  playCurrent();
};

const toggleAll = () => {
  const allSelected = state.selectedNoteIds.size === state.notes.length;
  state.selectedNoteIds = new Set(
    allSelected ? [] : state.notes.map((note) => note.id),
  );
  toggleAllButton.textContent = allSelected ? "Select all" : "Deselect all";
  renderNotes();
  pickRandomNote();
};

const updateToggleAllLabel = () => {
  const allSelected = state.selectedNoteIds.size === state.notes.length;
  toggleAllButton.textContent = allSelected ? "Deselect all" : "Select all";
};

const renderNotes = () => {
  noteListEl.innerHTML = "";

  state.notes.forEach((note) => {
    const item = document.createElement("div");
    item.className = "note-item";

    const label = document.createElement("label");
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = state.selectedNoteIds.has(note.id);
    checkbox.addEventListener("change", () => {
      if (checkbox.checked) {
        state.selectedNoteIds.add(note.id);
      } else {
        state.selectedNoteIds.delete(note.id);
      }
      updateToggleAllLabel();
    });

    const text = document.createElement("span");
    text.textContent = `String ${note.string} / Fret ${note.fret}`;

    label.appendChild(checkbox);
    label.appendChild(text);

    const meta = document.createElement("span");
    meta.className = "note-meta";
    meta.textContent = note.note;

    item.appendChild(label);
    item.appendChild(meta);
    noteListEl.appendChild(item);
  });
};

const parseNote = (entry) => ({
  id: entry.id,
  note: entry.note,
  string: entry.string,
  fret: entry.fret,
  file: entry.file,
});

const loadNotes = async () => {
  try {
    const response = await fetch("./notes.json");
    if (!response.ok) {
      throw new Error("Unable to load notes.json");
    }
    const payload = await response.json();
    state.notes = payload.notes.map(parseNote);
  } catch (error) {
    setStatus("Failed to load notes.json. Using sample data.");
    state.notes = [
      {
        id: "sample-1",
        note: "E2",
        string: 6,
        fret: 0,
        file: "040_E2_S6F0.wav",
      },
      {
        id: "sample-2",
        note: "F2",
        string: 6,
        fret: 1,
        file: "041_F2_S6F1.wav",
      },
    ];
  }

  state.selectedNoteIds = new Set(state.notes.map((note) => note.id));
  updateToggleAllLabel();
  renderNotes();
  pickRandomNote();
};

replayButton.addEventListener("click", playCurrent);
revealButton.addEventListener("click", reveal);
nextButton.addEventListener("click", pickRandomNote);
toggleAllButton.addEventListener("click", toggleAll);

document.addEventListener("keydown", (event) => {
  if (event.target instanceof HTMLInputElement) return;
  if (event.code === "Space") {
    event.preventDefault();
    playCurrent();
  }
  if (event.key.toLowerCase() === "r") {
    reveal();
  }
  if (event.key === "Enter") {
    pickRandomNote();
  }
});

updateScore();
loadNotes();
