# Palabras por minuto - audio gaps

No audio is played by this screen. The slots below exist in the markup as `data-audio-slot` attributes and stay empty
until the owner's own recordings are supplied. No voice is generated.

| Slot | Where | Needed |
| --- | --- | --- |
| `palabras-minuto/instruccion` | speaker button in the instruction bar | owner recording of "Lee cada palabra. Antes de comenzar ajusta el cronómetro." |
| `palabras-minuto/<game id>/palabra-N` | each of the 18 word cells | owner recording of each word (18 per letter set) |
| feedback, correct | on a correct word | owner voice confirmation (not recorded yet) |
| feedback, wrong | on an out-of-order tap | owner voice encouragement (not recorded yet) |
| title | banner question | owner recording of "¿Cuántas palabras puedo leer por minuto?" |
