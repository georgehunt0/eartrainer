# Guitar Ear Trainer (Web)

This is a lightweight, static web app for guitar-specific ear training. It is
designed to work with WAV files named like:

```
040_E2_S6F0.wav
041_F2_S6F1.wav
```

## Quick start

1. Place WAV files in the `audio/` folder at the project root.
2. Update `notes.json` to list each file with its note, string, and fret.
3. Serve the folder with any static server, for example:

```bash
python -m http.server 8000
```

Then open `http://localhost:8000`.

## File format

Each entry in `notes.json` uses this structure:

```json
{
  "id": "040_E2_S6F0",
  "note": "E2",
  "string": 6,
  "fret": 0,
  "file": "040_E2_S6F0.wav"
}
```

The app will display string + fret in the UI and use the WAV file for playback.
