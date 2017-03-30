'use strict';

const fs = require('fs');
const assert = require('assert');
const jsmidgen = require('jsmidgen');

const midiFromTracks = (clips, tempo, fileName) => {
	fileName = fileName || 'music.mid';
	let file = new jsmidgen.File();
  
  clips.forEach((notes) => {
    let track = new jsmidgen.Track();
    let data = notes.pop();
    track.setInstrument(data.channel, data.instrument);
    track.setTempo(tempo);
    file.addTrack(track);
    
    notes.forEach((noteObj) => {
      assert(notes !== undefined && typeof notes !== 'string', 'You must provide an array of notes to write!');
      let level = noteObj.level || 127;
      // While writing chords (multiple notes per tick)
      // only the first noteOn (or noteOff) needs the complete arity of the function call
      // subsequent calls need only the first 2 args (channel and note)
      if (noteObj.note) {
        if (typeof noteObj.note === 'string') {
          track.noteOn(data.channel, noteObj.note, noteObj.length, level); // channel, pitch(note), length, velocity
          track.noteOff(data.channel, noteObj.note, noteObj.length, level);
        } else {
          track.addChord(data.channel, noteObj.note, noteObj.length, level);
        }
      } else {
        track
          .noteOff(data.channel, '', noteObj.length);
      }
    });
  });

  fs.writeFileSync(fileName, file.toBytes(), 'binary');
}

module.exports = midiFromTracks;
