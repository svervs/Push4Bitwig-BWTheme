// Written by Jürgen Moßgraber - mossgrabers.de
// (c) 2014
// Licensed under GPLv3 - http://www.gnu.org/licenses/gpl.html

var DRUM_NUM_ROWS = 128;
var DRUM_NUM_COLS = 32;
var DRUM_NUM_DISPLAY_ROWS = 16;
var DRUM_NUM_DISPLAY_COLS = 32;
var DRUM_START_KEY = 36;

function DrumView ()
{
	this.pads = initArray ({ exists: false, solo: false, mute: false }, 16);
	this.selectedPad = 0;

	this.offsetX = 0;
	this.offsetY = DRUM_START_KEY;
	this.step    = -1;
	
	this.data = [];
	for (var y = 0; y < DRUM_NUM_ROWS; y++)
		this.data[y] = initArray (false, DRUM_NUM_COLS);
	
	this.clip = host.createCursorClip (DRUM_NUM_COLS, DRUM_NUM_ROWS);
	this.lengthInBeatTime = 16;
	this.clip.setStepSize (this.lengthInBeatTime);
	
	this.clip.addPlayingStepObserver (doObject (this, function (step)
	{
		this.step = step;
	}));
	
	this.clip.addStepDataObserver (doObject (this, function (column, row, state)
	{
		this.data[column][row] = state;
	}));
	
	
	// Note: Undocumented API and still very crash happy
	/*this.drumPadGrid = device.createDrumPadGrid (4, 4);
	this.cursorDrumPad = this.drumPadGrid.getCursorDrumPad ();
	for(var i = 0; i < 16; i++)
	{
		var pad = this.drumPadGrid.getDrumPad (i);

		pad.addColorObserver (doObjectIndex (this, i, function (index, red, green, blue)
		{
			// println ("Color: "+index+" - "+ red+" - "+ green+" - "+ blue);
		}));

		pad.exists ().addValueObserver (doObjectIndex (this, i, function (index, exists)
		{
			this.pads[index].exists = exists;
		}));

		pad.getMute ().addValueObserver (doObjectIndex (this, i, function (index, isMuted)
		{
			this.pads[index].mute = isMuted;
		}));

		pad.getSolo ().addValueObserver (doObjectIndex (this, i, function (index, isSoloed)
		{
			this.pads[index].solo = isSoloed;
		}));
	}

	this.drumPadGrid.addCanScrollUpObserver (function (canScroll)
	{
		println (canScroll);
		// drumPadButtonGrid.setCanScrollUp(canScroll)
	});

	this.drumPadGrid.addCanScrollDownObserver (function (canScroll)
	{
		println (canScroll);
		// drumPadButtonGrid.setCanScrollDown(canScroll)
	});*/
}
DrumView.prototype = new BaseView ();

DrumView.prototype.updateArrows = function ()
{
	this.canScrollUp = this.offsetY + DRUM_NUM_DISPLAY_ROWS <= DRUM_NUM_ROWS - DRUM_NUM_DISPLAY_ROWS;
	this.canScrollDown = this.offsetY - DRUM_NUM_DISPLAY_ROWS >= 0;
	this.canScrollLeft = this.offsetX > 0;
	BaseView.prototype.updateArrows.call (this);
};

DrumView.prototype.onActivate = function ()
{
	BaseView.prototype.onActivate.call (this);

	push.setButton (PUSH_BUTTON_NOTE, PUSH_BUTTON_STATE_HI);
	push.setButton (PUSH_BUTTON_SESSION, PUSH_BUTTON_STATE_ON);
	for (var i = 0; i < 8; i++)
		trackBank.getTrack (i).getClipLauncherSlots ().setIndication (false);
	for (var i = PUSH_BUTTON_SCENE1; i <= PUSH_BUTTON_SCENE8; i++)
		push.setButton (i, i % 2 == 0 ? PUSH_COLOR_SCENE_GREEN : PUSH_COLOR_BLACK);
};

DrumView.prototype.updateNoteMapping = function ()
{
	var noteMap = initArray (-1, 128);
	
	var t = getSelectedTrack ();
	if (t != null && t.canHoldNotes)
	{
		var matrix = SCALE_DRUM_NOTES;
		for (var note = 36; note < 100; note++)
		{
			var n = matrix[note - 36] == -1 ? -1 : matrix[note - 36] /*+ SCALE_OFFSETS[currentScaleOffset]*/ + 36 /*+ currentOctave * 12*/;
			noteMap[note] = n < 0 || n > 127 ? -1 : n;
		}
	}
	noteInput.setKeyTranslationTable (noteMap);
};

DrumView.prototype.usesButton = function (buttonID)
{
	switch (buttonID)
	{
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

DrumView.prototype.onScene = function (index)
{
	var button = 7 - index;
	if (button % 2 != 0)
		return;
	this.lengthInBeatTime = Math.pow (0.5, button / 2);
	this.clip.setStepSize (this.lengthInBeatTime);
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
			this.clip.toggleStep (col, this.offsetY + this.selectedPad, velocity);
		}
	}
};

DrumView.prototype.onLeft = function ()
{
	var newOffset = this.offsetX - DRUM_NUM_DISPLAY_COLS;
	if (newOffset < 0)
		this.offsetX = 0;
	else
	{
		this.offsetX = newOffset;
		this.clip.scrollStepsPageBackwards ();
	}
	this.updateArrows ();
};

DrumView.prototype.onRight = function ()
{
	this.offsetX = this.offsetX + DRUM_NUM_DISPLAY_COLS;
	this.clip.scrollStepsPageForward ();
	this.updateArrows ();
};

DrumView.prototype.onUp = function ()
{
	this.offsetY = Math.min (DRUM_NUM_ROWS - DRUM_NUM_DISPLAY_ROWS, this.offsetY + DRUM_NUM_DISPLAY_ROWS);
	this.updateArrows ();
};

DrumView.prototype.onDown = function ()
{
	this.offsetY = Math.max (0, this.offsetY - DRUM_NUM_DISPLAY_ROWS);
	this.updateArrows ();
};

DrumView.prototype.drawGrid = function ()
{
	// 4x4 Grid
	for (var x = 0; x < 4; x++)
	{
		for (var y = 0; y < 4; y++)
		{
			var index = x + y * 4;
			var p = this.pads[index];
			var c = this.playedPad == index ? PUSH_COLOR_GREEN_HI : (this.selectedPad == index ? PUSH_COLOR_BLUE_HI : (p.exists ? (p.mute ? PUSH_COLOR_ORANGE_LO : (p.solo ? PUSH_COLOR_BLUE_LO : PUSH_COLOR_YELLOW_HI)) : PUSH_COLOR_YELLOW_LO));
			push.pads.lightEx (x, y, c);
		}
	}
	
	// Clip length/loop
	for (var x = 4; x < 8; x++)
		for (var y = 0; y < 4; y++)
			push.pads.lightEx (x, y, PUSH_COLOR_BLACK);
			
	// Paint the sequencer steps
	var hiStep = this.isInXRange (this.step) ? this.step % DRUM_NUM_DISPLAY_COLS : -1;
	for (var col = 0; col < DRUM_NUM_DISPLAY_COLS; col++)
	{
		var isSet = this.data[col][this.offsetY + this.selectedPad];
		var hilite = col == hiStep;
		var x = col % 8;
		var y = 7 - Math.floor (col / 8);
		push.pads.lightEx (x, y, isSet ? (hilite ? PUSH_COLOR_GREEN_LO : PUSH_COLOR_BLUE_HI) : hilite ? PUSH_COLOR_GREEN_HI : PUSH_COLOR_BLACK);
	}
};

DrumView.prototype.isInXRange = function (x)
{
	return x >= this.offsetX && x < this.offsetX + DRUM_NUM_DISPLAY_COLS;
};
