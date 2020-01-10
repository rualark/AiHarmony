export let NoteData = {
  key: {
    mode: 0, // 0 - major, 2 - dorian, 9 - aeolian
    fifths: 0, // Number of alterations near key
    base_note: 0, // Base tonic note (C - 0, Am - 9)
    maj_base_note: 0, // Base note if it was major (C - 0, Am - 0)
    base_note_alter: 0 // Alteration to achieve base tonic note
  },
  time: {
    beats_per_measure: 4,
    beat_type: 4,
  },
  voice: [
    {
      clef: 'g',
      note: [
        {pitch: 0, len: 4, startsTie: false}
      ]
    }
  ]
};
