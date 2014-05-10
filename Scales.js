// Written by Jürgen Moßgraber - mossgrabers.de
// Contributions by Michael Schmalle - teotigraphix.com
// Additional scales by Alexandre Bique
// (c) 2014
// Licensed under GPLv3 - http://www.gnu.org/licenses/gpl.html

var NOTE_NAMES    = [ 'C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B' ];
var SCALE_BASES   = [ 'C', 'G', 'D', 'A', 'E', 'B', 'F', 'Bb', 'Eb', 'Ab', 'Db', 'Gb' ];
var SCALE_OFFSETS = [  0,   7,   2,   9,   4,   11,  5,   10,   3,    8,    1,    6 ];

var SCALE_DRUM_NOTES =
[
	0,   1,  2,  3, -1, -1, -1, -1, 
	4,   5,  6,  7, -1, -1, -1, -1, 
	8,   9, 10, 11, -1, -1, -1, -1, 
	12, 13, 14, 15, -1, -1, -1, -1, 
	-1, -1, -1, -1, -1, -1, -1, -1, 
	-1, -1, -1, -1, -1, -1, -1, -1, 
	-1, -1, -1, -1, -1, -1, -1, -1, 
	-1, -1, -1, -1, -1, -1, -1, -1
];

var SCALE_INTERVALS =
[
	{ name: 'Major',            notes: [ 0, 2, 4, 5, 7,  9,  11 ] },
	{ name: 'Minor',            notes: [ 0, 2, 3, 5, 7,  8,  10 ] },
	{ name: 'Dorian',           notes: [ 0, 2, 3, 5, 7,  9,  10 ] },
	{ name: 'Mixolydian',       notes: [ 0, 2, 4, 5, 7,  9,  10 ] },
	{ name: 'Lydian',           notes: [ 0, 2, 4, 6, 7,  9,  11 ] },
	{ name: 'Phrygian',         notes: [ 0, 1, 3, 5, 7,  8,  10 ] },
	{ name: 'Locrian',          notes: [ 0, 1, 3, 4, 6,  8,  10 ] },
	{ name: 'Diminished',       notes: [ 0, 1, 3, 4, 6,  7,  9  ] },
	{ name: 'Whole-half',       notes: [ 0, 2, 3, 5, 6,  8,  9  ] },
	{ name: 'Whole Tone',       notes: [ 0, 2, 4, 6, 8,  10 ] },
	{ name: 'Minor Blues',      notes: [ 0, 3, 5, 6, 7,  10 ] },
	{ name: 'Minor Pentatonic', notes: [ 0, 3, 5, 7, 10 ] },
	{ name: 'Major Pentatonic', notes: [ 0, 2, 4, 7, 9  ] },
	{ name: 'Harmonic Minor',   notes: [ 0, 2, 3, 5, 7,  8,  11 ] },
	{ name: 'Melodic Minor',    notes: [ 0, 2, 3, 5, 7,  9,  11 ] },
	{ name: 'Super Locrian',    notes: [ 0, 1, 3, 4, 6,  8,  10 ] },
	{ name: 'Bhairav',          notes: [ 0, 1, 4, 5, 7,  8,  11 ] },
	{ name: 'Hungarian Minor',  notes: [ 0, 2, 3, 6, 7,  8,  11 ] },
	{ name: 'Minor Gypsy',      notes: [ 0, 1, 4, 5, 7,  8,  10 ] },
	{ name: 'Hirojoshi',        notes: [ 0, 4, 6, 7, 11 ] },
	{ name: 'In-Sen',           notes: [ 0, 1, 5, 7, 10 ] },
	{ name: 'Iwato',            notes: [ 0, 1, 5, 6, 10 ] },
	{ name: 'Kumoi',            notes: [ 0, 2, 3, 7, 9  ] },
	{ name: 'Pelog',            notes: [ 0, 1, 3, 7, 8  ] },
	{ name: 'Spanish',          notes: [ 0, 1, 4, 5, 7,  9,  10 ] }
];


function Scales ()
{
	this.selectedScale = 0;      // Major
	this.scaleOffset   = 0;      // C
	this.chromaticOn   = false;
	this.octave        = 0;
	this.shift         = 3;
	this.drumOctave    = 0;

	this.generateMatrices ();
}

Scales.prototype.getName = function (scale)
{
	return scale < SCALE_INTERVALS.length ? SCALE_INTERVALS[scale].name : '';
};

Scales.prototype.getSelectedScale = function ()
{
	return this.selectedScale;
};

Scales.prototype.setScale = function (scale)
{
	this.selectedScale = Math.max (0, Math.min (scale, this.scales.length - 1));
};

Scales.prototype.nextScale = function ()
{
	this.setScale (this.selectedScale + 1);
};

Scales.prototype.prevScale = function ()
{
	this.setScale (this.selectedScale - 1);
};

Scales.prototype.getScaleOffset = function ()
{
	return this.scaleOffset;
};

Scales.prototype.setScaleOffset = function (scaleOffset)
{
	this.scaleOffset = Math.max (0, Math.min (scaleOffset, SCALE_OFFSETS.length - 1));
};

Scales.prototype.setChromatic = function (enable)
{
	this.chromaticOn = enable;
};

Scales.prototype.toggleChromatic = function ()
{
	this.chromaticOn = !this.chromaticOn;
};

Scales.prototype.isChromatic = function ()
{
	return this.chromaticOn;
};

Scales.prototype.setOctave = function (octave)
{
	this.octave = Math.max (-3, Math.min (octave, 3));
};

Scales.prototype.getOctave = function ()
{
	return this.octave;
};

Scales.prototype.incOctave = function ()
{
	this.setOctave (this.octave + 1);
};

Scales.prototype.decOctave = function ()
{
	this.setOctave (this.octave - 1);
};

Scales.prototype.setDrumOctave = function (drumOctave)
{
	this.drumOctave = Math.max (-3, Math.min (drumOctave, 5));
};

Scales.prototype.getDrumOctave = function ()
{
	return this.drumOctave;
};

Scales.prototype.incDrumOctave = function ()
{
	this.setDrumOctave (this.drumOctave + 1);
};

Scales.prototype.decDrumOctave = function ()
{
	this.setDrumOctave (this.drumOctave - 1);
};

Scales.prototype.setPlayShift = function (shift)
{
	this.shift = shift;
	this.generateMatrices ();
}

Scales.prototype.getColor = function (note)
{
	var matrix = this.getActiveMatrix ();
	var n = matrix[note - 36] % 12;
	if (n == 0)
		return PUSH_COLOR_BLUE_LGHT;
	if (this.isChromatic ())
	{
		var notes = SCALE_INTERVALS[this.selectedScale].notes;
		for (var i = 0; i < notes.length; i++)
		{
			if (notes[i] == n)
				return PUSH_COLOR_WHITE_HI;
		}
		return PUSH_COLOR_BLACK;
	}
	return PUSH_COLOR_WHITE_HI;
};

Scales.prototype.getNoteMatrix = function ()
{
	var matrix = this.getActiveMatrix ();
	var noteMap = this.getEmptyMatrix ();
	for (var note = 36; note < 100; note++)
	{
		var n = matrix[note - 36] + SCALE_OFFSETS[this.scaleOffset] + 36 + this.octave * 12;
		noteMap[note] = n < 0 || n > 127 ? -1 : n;
	}
	return noteMap;
};

Scales.prototype.getEmptyMatrix = function ()
{
	return initArray (-1, 128);
};

Scales.prototype.getDrumMatrix = function ()
{
	var matrix = SCALE_DRUM_NOTES;
	var noteMap = this.getEmptyMatrix ();
	for (var note = 36; note < 100; note++)
	{
		var n = matrix[note - 36] == -1 ? -1 : matrix[note - 36] + 36 + this.drumOctave * 16;
		noteMap[note] = n < 0 || n > 127 ? -1 : n;
	}
	return noteMap;
};

Scales.prototype.getRangeText = function ()
{
	var matrix = this.getActiveMatrix ();
	var offset = SCALE_OFFSETS[this.scaleOffset];
	return this.formatNote (offset + matrix[0]) + ' to ' + this.formatNote (offset + matrix[matrix.length - 1]);
};

Scales.prototype.formatNote = function (note)
{
	return NOTE_NAMES[note % 12] + (2 + Math.floor (note / 12) + this.octave);
}

Scales.prototype.createScale = function (scale)
{
	var len = scale.notes.length;
	var matrix = [];
	var chromatic = [];
	for (var row = 0; row < 8; row++)
	{
		for (var column = 0; column < 8; column++)
		{
			var offset = row * this.shift + column;
			matrix.push ((Math.floor (offset / len)) * 12 + scale.notes[offset % len]);
			chromatic.push (row * (4 + this.shift) + column);
		}
	}
	return { name: scale.name, matrix: matrix, chromatic: chromatic };
};

Scales.prototype.getActiveMatrix = function ()
{
	return this.isChromatic () ? this.scales[this.selectedScale].chromatic : this.scales[this.selectedScale].matrix;
};

Scales.prototype.generateMatrices = function ()
{
	this.scales = [];
	for (var i = 0; i < SCALE_INTERVALS.length; i++)
		this.scales.push (this.createScale (SCALE_INTERVALS[i]));
};