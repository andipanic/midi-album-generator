#!/usr/bin/env node

var fs = require('fs');
var albumName = 'Album_' + (new Date).getTime();
var scribble = require('scribbletune')
var midiFromTracks = require('./midiFromTracks')
const chromaticNotes = ['c', 'c#', 'd', 'd#', 'e', 'f', 'f#', 'g', 'g#', 'a', 'a#', 'b']

var randomKey = function () {
  return chromaticNotes[Math.floor(Math.random() * chromaticNotes.length)]
}

var randomScale = function () {
  var scales = scribble.modes
  return scales[Math.floor(Math.random() * scales.length)]
}

const KEY = randomKey()
const SCALE = randomScale()

var randomBar = function () {
  var notes = scribble.scale(KEY, SCALE)
  var bar = []
  for (var i = 0; i < 4; i++) {
    bar.push(notes[Math.floor(Math.random() * notes.length)])
  }
  return bar
}

var randomPattern = function () {
  var elements = ['x', '-', '_']
  var patt = []
  for (var i = 0; i < 4; i++) {
    patt.push(elements[Math.floor(Math.random() * elements.length)])
  }
  return patt.toString().replace(/,/g, '')
}

var randomClip = function () {
  var yn = Math.floor(Math.random() * 2)
  var shuf = false
  var sizzle = false
  if (yn) {
    shuf = true
  } else {
    sizzle = true
  }

  return scribble.clip({
    notes: randomBar(),
    pattern: randomPattern().repeat(4),
    shuffle: shuf,
    sizzle: sizzle
  })
}

var extendClip = function (clip, count) {
  var extendedClip = []

  for (var i = 0; i < count; i++) {
    extendedClip.push.apply(extendedClip, clip)
  }

  return extendedClip
}

var mergeClips = function (clips) {
  var newClip = []
  for (var i = 0; i < clips.length; i++) {
    newClip.push.apply(newClip, clips[i])
  }
  return newClip
}

var createPattern = function () {
  var clips = []
  for (var i = 0; i < 4; i++) {
    clips.push(randomClip())
  }
  return mergeClips(clips)
}

var buildTrack = function (chan, inst) {
  var partA = extendClip(createPattern(), 4)
  var partB = extendClip(createPattern(), 2)
  var partC = extendClip(createPattern(), 4)

  var track = mergeClips([partA, partB, partC])
  track.push({channel: chan, instrument: inst})
  return track
}

var randInst = function () {
  return Math.floor(Math.random() * 127)
}

var buildMultiTrack = function (numberOfTracks) {
  var tracks = []
  for (var i = 0; i < numberOfTracks; i++) {
    tracks.push(buildTrack(i, randInst()))
  }
  return tracks
}

var randRange = function (low, high) {
  return Math.floor(Math.random() * (high - low)) + low
}

var makeSongs = function (numberOfSongs) {
  for (var i = 0; i < numberOfSongs; i++) {
    midiFromTracks(buildMultiTrack(randRange(2, 8)), randRange(60, 135), albumName + '/Song' + (i + 1) + '.mid')
  }
}

if (!fs.existsSync(albumName)) {
  fs.mkdirSync(albumName);
  makeSongs(randRange(12, 20));
}
