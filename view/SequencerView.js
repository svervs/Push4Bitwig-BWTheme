// Written by Jürgen Moßgraber - mossgrabers.de
// (c) 2014
// Licensed under GPLv3 - http://www.gnu.org/licenses/gpl.html

SequencerView.NUM_DISPLAY_ROWS = 8;
SequencerView.NUM_DISPLAY_COLS = 8;
SequencerView.NUM_OCTAVE       = 12;
SequencerView.START_KEY = 36;

function SequencerView (model)
{
	AbstractSequencerView.call (this, model, 128, 8);
	this.scales = model.getScales ();
	this.offsetY = SequencerView.START_KEY;
	this.clip.scrollToKey (SequencerView.START_KEY);
	this.clip.scrollToStep (0);
}
SequencerView.prototype = new AbstractSequencerView ();

SequencerView.prototype.onActivate = function ()
{
	this.updateScale ();
	AbstractSequencerView.prototype.onActivate.call (this);
};

SequencerView.prototype.updateNoteMapping = function ()
{
	AbstractSequencerView.prototype.updateNoteMapping.call (this);
	this.updateScale ();
};

SequencerView.prototype.updateScale = function ()
{
	this.noteMap = this.scales.getSequencerMatrix (SequencerView.NUM_DISPLAY_ROWS, this.offsetY);
};

SequencerView.prototype.updateArrows = function ()
{
	this.canScrollUp = this.offsetY + SequencerView.NUM_OCTAVE <= this.rows - SequencerView.NUM_OCTAVE;
	this.canScrollDown = this.offsetY - SequencerView.NUM_OCTAVE >= 0;
	this.canScrollLeft = this.offsetX > 0;
	BaseView.prototype.updateArrows.call (this);
};

SequencerView.prototype.usesButton = function (buttonID)
{
	switch (buttonID)
	{
		case PUSH_BUTTON_OCTAVE_DOWN:
		case PUSH_BUTTON_OCTAVE_UP:
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

SequencerView.prototype.onGrid = function (note, velocity)
{
	if (velocity == 0)
		return;
	var index = note - 36;
	var x = index % 8;
	var y = Math.floor (index / 8);
	this.clip.toggleStep (x, this.noteMap[y], Config.accentActive ? Config.fixedAccentValue : velocity);
};

SequencerView.prototype.onLeft = function (event)
{
	if (!event.isDown ())
		return;
	var newOffset = this.offsetX - SequencerView.NUM_DISPLAY_COLS;
	if (newOffset < 0)
		this.offsetX = 0;
	else
	{
		this.offsetX = newOffset;
		this.clip.scrollStepsPageBackwards ();
	}
};

SequencerView.prototype.onRight = function (event)
{
	if (!event.isDown ())
		return;
	this.offsetX = this.offsetX + SequencerView.NUM_DISPLAY_COLS;
	this.clip.scrollStepsPageForward ();
};

SequencerView.prototype.onUp = function (event)
{
	if (!event.isDown ())
		return;
	this.offsetY = Math.min (this.rows - SequencerView.NUM_OCTAVE, this.offsetY + SequencerView.NUM_OCTAVE);
	this.updateScale ();
};

SequencerView.prototype.onDown = function (event)
{
	if (!event.isDown ())
		return;
	this.offsetY = Math.max (0, this.offsetY - SequencerView.NUM_OCTAVE);
	this.updateScale ();
};

SequencerView.prototype.drawGrid = function ()
{
	this.turnOffBlink ();

	var hiStep = this.isInXRange (this.step) ? this.step % SequencerView.NUM_DISPLAY_COLS : -1;
	for (var x = 0; x < SequencerView.NUM_DISPLAY_COLS; x++)
	{
		for (var y = 0; y < SequencerView.NUM_DISPLAY_ROWS; y++)
		{
			var row = this.noteMap[y];
			var isSet = this.data[x][row];
			var hilite = x == hiStep;
			this.push.pads.lightEx (x, y, isSet ? (hilite ? PUSH_COLOR_GREEN_LO : PUSH_COLOR_BLUE_HI) : hilite ? PUSH_COLOR_GREEN_HI : this.scales.getSequencerColor (this.noteMap, y));
		}
	}
};

SequencerView.prototype.isInXRange = function (x)
{
	return x >= this.offsetX && x < this.offsetX + SequencerView.NUM_DISPLAY_COLS;
};
