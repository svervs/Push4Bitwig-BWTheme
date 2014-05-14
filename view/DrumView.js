// Written by Jürgen Moßgraber - mossgrabers.de
// (c) 2014
// Licensed under GPLv3 - http://www.gnu.org/licenses/gpl.html

DrumView.NUM_DISPLAY_COLS = 32;
DrumView.DRUM_START_KEY = 36;

function DrumView (model, scales)
{
	AbstractSequencerView.call (this, model, scales, 128, 32);
	this.pads = initArray ({ exists: false, solo: false, mute: false }, 16);
	this.selectedPad = 0;
	this.offsetY = DrumView.DRUM_START_KEY;
}
DrumView.prototype = new AbstractSequencerView ();

DrumView.prototype.updateArrows = function ()
{
	this.canScrollUp = false;
	this.canScrollDown = false;
	this.canScrollLeft = this.offsetX > 0;
	BaseView.prototype.updateArrows.call (this);
};

DrumView.prototype.updateNoteMapping = function ()
{
	var t = this.model.getSelectedTrack ();
	var noteMap = t != null && t.canHoldNotes ? this.scales.getDrumMatrix () : this.scales.getEmptyMatrix ();
	noteInput.setKeyTranslationTable (noteMap);
};

DrumView.prototype.usesButton = function (buttonID)
{
	switch (buttonID)
	{
		case PUSH_BUTTON_CLIP:
		case PUSH_BUTTON_SELECT:
		case PUSH_BUTTON_ADD_EFFECT:
		case PUSH_BUTTON_ADD_TRACK:
		case PUSH_BUTTON_REPEAT:
		case PUSH_BUTTON_USER_MODE:
		case PUSH_BUTTON_DUPLICATE:
			return false;
	}
	return true;
};

DrumView.prototype.onGrid = function (note, velocity)
{
	var index = note - 36;
	var x = index % 8;
	var y = Math.floor (index / 8);
	
	if (x < 4 && y < 4)
	{
		this.selectedPad = 4 * y + x;
		this.playedPad = velocity == 0 ? -1 : this.selectedPad;
		return;
	}
	
	if (y >= 4)
	{
		if (velocity != 0)
		{
			var col = 8 * (7 - y) + x;
			this.clip.toggleStep (col, this.offsetY + this.selectedPad, Config.accentActive ? 127 : velocity);
		}
	}
};

DrumView.prototype.onOctaveDown = function (event)
{
	if (!event.isDown ())
		return;
	this.scales.decDrumOctave ();
	this.offsetY = DrumView.DRUM_START_KEY + this.scales.getDrumOctave () * 16;
	this.updateNoteMapping ();
};

DrumView.prototype.onOctaveUp = function (event)
{
	if (!event.isDown ())
		return;
	this.scales.incDrumOctave ();
	this.offsetY = DrumView.DRUM_START_KEY + this.scales.getDrumOctave () * 16;
	this.updateNoteMapping ();
};

DrumView.prototype.onLeft = function (event)
{
	if (!event.isDown ())
		return;
	var newOffset = this.offsetX - DrumView.NUM_DISPLAY_COLS;
	if (newOffset < 0)
		this.offsetX = 0;
	else
	{
		this.offsetX = newOffset;
		this.clip.scrollStepsPageBackwards ();
	}
	this.updateArrows ();
};

DrumView.prototype.onRight = function (event)
{
	if (!event.isDown ())
		return;
	this.offsetX = this.offsetX + DrumView.NUM_DISPLAY_COLS;
	this.clip.scrollStepsPageForward ();
	this.updateArrows ();
};

DrumView.prototype.drawGrid = function ()
{
	// Turn off blinking (from Session)
	for (var i = 36; i < 100; i++)
		this.push.pads.blink (i, PUSH_COLOR_BLACK);

	// 4x4 Grid
	for (var x = 0; x < 4; x++)
	{
		for (var y = 0; y < 4; y++)
		{
			var index = x + y * 4;
			var p = this.pads[index];
			var c = this.playedPad == index ? PUSH_COLOR_GREEN_HI : (this.selectedPad == index ? PUSH_COLOR_BLUE_HI : (p.exists ? (p.mute ? PUSH_COLOR_ORANGE_LO : (p.solo ? PUSH_COLOR_BLUE_LO : PUSH_COLOR_YELLOW_HI)) : PUSH_COLOR_YELLOW_LO));
			this.push.pads.lightEx (x, y, c);
		}
	}
	
	// Clip length/loop
	for (var x = 4; x < 8; x++)
		for (var y = 0; y < 4; y++)
			this.push.pads.lightEx (x, y, PUSH_COLOR_BLACK);
			
	// Paint the sequencer steps
	var hiStep = this.isInXRange (this.step) ? this.step % DrumView.NUM_DISPLAY_COLS : -1;
	for (var col = 0; col < DrumView.NUM_DISPLAY_COLS; col++)
	{
		var isSet = this.data[col][this.offsetY + this.selectedPad];
		var hilite = col == hiStep;
		var x = col % 8;
		var y = 7 - Math.floor (col / 8);
		this.push.pads.lightEx (x, y, isSet ? (hilite ? PUSH_COLOR_GREEN_LO : PUSH_COLOR_BLUE_HI) : hilite ? PUSH_COLOR_GREEN_HI : PUSH_COLOR_BLACK);
	}
};

DrumView.prototype.isInXRange = function (x)
{
	return x >= this.offsetX && x < this.offsetX + DrumView.NUM_DISPLAY_COLS;
};
