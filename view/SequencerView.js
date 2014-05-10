// Written by Jürgen Moßgraber - mossgrabers.de
// (c) 2014
// Licensed under GPLv3 - http://www.gnu.org/licenses/gpl.html

var SEQ_NUM_DISPLAY_ROWS = 8;
var SEQ_NUM_DISPLAY_COLS = 8;
var SEQ_START_KEY = 32;

function SequencerView (scales)
{
	AbstractSequencerView.call (this, scales, 128, 8);
	this.offsetY = SEQ_START_KEY;
	this.clip.scrollToKey (SEQ_START_KEY);
	this.clip.scrollToStep (0);
}
SequencerView.prototype = new AbstractSequencerView ();

SequencerView.prototype.updateArrows = function ()
{
	this.canScrollUp = this.offsetY + SEQ_NUM_DISPLAY_ROWS <= this.rows - SEQ_NUM_DISPLAY_ROWS;
	this.canScrollDown = this.offsetY - SEQ_NUM_DISPLAY_ROWS >= 0;
	this.canScrollLeft = this.offsetX > 0;
	BaseView.prototype.updateArrows.call (this);
};

SequencerView.prototype.usesButton = function (buttonID)
{
	switch (buttonID)
	{
		case PUSH_BUTTON_OCTAVE_DOWN:
		case PUSH_BUTTON_OCTAVE_UP:
		case PUSH_BUTTON_NEW:
		case PUSH_BUTTON_CLIP:
		case PUSH_BUTTON_SELECT:
		case PUSH_BUTTON_ADD_EFFECT:
		case PUSH_BUTTON_ADD_TRACK:
		case PUSH_BUTTON_REPEAT:
		case PUSH_BUTTON_ACCENT:
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
	this.clip.toggleStep (x, this.offsetY + y, velocity);
};

SequencerView.prototype.onLeft = function (event)
{
	if (!event.isDown ())
		return;
	var newOffset = this.offsetX - SEQ_NUM_DISPLAY_COLS;
	if (newOffset < 0)
		this.offsetX = 0;
	else
	{
		this.offsetX = newOffset;
		this.clip.scrollStepsPageBackwards ();
	}
	this.updateArrows ();
};

SequencerView.prototype.onRight = function (event)
{
	if (!event.isDown ())
		return;
	this.offsetX = this.offsetX + SEQ_NUM_DISPLAY_COLS;
	this.clip.scrollStepsPageForward ();
	this.updateArrows ();
};

SequencerView.prototype.onUp = function (event)
{
	if (!event.isDown ())
		return;
	this.offsetY = Math.min (this.rows - SEQ_NUM_DISPLAY_ROWS, this.offsetY + SEQ_NUM_DISPLAY_ROWS);
	this.updateArrows ();
};

SequencerView.prototype.onDown = function (event)
{
	if (!event.isDown ())
		return;
	this.offsetY = Math.max (0, this.offsetY - SEQ_NUM_DISPLAY_ROWS);
	this.updateArrows ();
};

SequencerView.prototype.drawGrid = function ()
{
	var hiStep = this.isInXRange (this.step) ? this.step % SEQ_NUM_DISPLAY_COLS : -1;
	for (var x = 0; x < SEQ_NUM_DISPLAY_COLS; x++)
	{
		for (var y = 0; y < SEQ_NUM_DISPLAY_ROWS; y++)
		{
			var isSet = this.data[x][this.offsetY + y];
			var hilite = x == hiStep;
			this.push.pads.lightEx (x, y, isSet ? (hilite ? PUSH_COLOR_GREEN_LO : PUSH_COLOR_BLUE_HI) : hilite ? PUSH_COLOR_GREEN_HI : PUSH_COLOR_BLACK);
		}
	}
};

SequencerView.prototype.isInXRange = function (x)
{
	return x >= this.offsetX && x < this.offsetX + SEQ_NUM_DISPLAY_COLS;
};
