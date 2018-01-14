#!/usr/bin/env node

var fs = require('fs');
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


var albumName = 'Album_' + (new Date).getTime();
// Config stuff
var info = function () {
  return {
    tempo: randRange(25, 50),
    key: randomKey(),
    scale: randomScale()
  }
}
// End Config


var randomBar = function (key, scale) {
  var notes = scribble.scale(key, scale)
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

var randomClip = function (info) {
  var yn = Math.floor(Math.random() * 2)
  var shuf = false
  var sizzle = false
  if (yn) {
    shuf = true
  } else {
    sizzle = true
  }

  return scribble.clip({
    notes: randomBar(info['key'], info['scale']),
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

var createPattern = function (info) {
  var clips = []
  for (var i = 0; i < 4; i++) {
    clips.push(randomClip(info))
  }
  return mergeClips(clips)
}

var buildTrack = function (chan, inst, info) {
  var partA = extendClip(createPattern(info), 4)
  var partB = extendClip(createPattern(info), 2)
  var partC = extendClip(createPattern(info), 4)

  var track = mergeClips([partA, partB, partC])
  track.push({channel: chan, instrument: inst})
  return track
}

var randInst = function () {
  return Math.floor(Math.random() * 127)
}

var buildMultiTrack = function (numberOfTracks, info) {
  var tracks = []
  for (var i = 0; i < numberOfTracks; i++) {
    tracks.push(buildTrack(i, randInst(), info))
  }
  return tracks
}

function randRange(low, high) {
  return Math.floor(Math.random() * (high - low)) + low
}

var makeSongs = function (numberOfSongs) {
  for (var i = 0; i < numberOfSongs; i++) {
    var songInfo = info()
    console.log(songInfo)
    midiFromTracks(buildMultiTrack(randRange(2, 8), songInfo), songInfo['tempo'], albumName + '/Song' + (i + 1) + '_' + songInfo['key'] +'_'+ songInfo['scale'].replace(/ /g, "_") +'_'+ songInfo['tempo'] + '.mid')
  }
}

if (!fs.existsSync(albumName)) {
  fs.mkdirSync(albumName);
  makeSongs(randRange(12, 20));
}
