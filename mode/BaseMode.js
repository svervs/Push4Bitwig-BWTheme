// Written by Jürgen Moßgraber - mossgrabers.de
//            Michael Schmalle - teotigraphix.com
// (c) 2014
// Licensed under GPLv3 - http://www.gnu.org/licenses/gpl.html

function BaseMode (model)
{
	this.model = model;
	this.id = null;
}

BaseMode.prototype.attachTo = function (push)
{
	this.push = push;
};

BaseMode.prototype.getId = function ()
{
    return this.id;
};

BaseMode.prototype.onActivate = function () {};
BaseMode.prototype.onValueKnob = function (index, value) {};
BaseMode.prototype.onValueKnobTouch = function (index, isTouched) {};

BaseMode.prototype.onFirstRow = function (index)
{
    if (this.push.isPressed (PUSH_BUTTON_STOP))
        this.model.getTrackBank ().stop (index);
    else
        this.model.getTrackBank ().select (index);
};

BaseMode.prototype.onSecondRow = function (index) {};
BaseMode.prototype.updateDisplay = function () {};

BaseMode.prototype.drawTrackNames = function ()
{
    var tb = this.model.getTrackBank ()
	var t = tb.getSelectedTrack ();
    
	// Format track names
	var sel = t == null ? -1 : t.index;
	var d = this.push.display;
	for (var i = 0; i < 8; i++)
	{
		var isSel = i == sel;
		var t = tb.getTrack (i);
		var n = optimizeName (t.name, isSel ? 7 : 8);
		d.setCell (3, i, isSel ? Display.RIGHT_ARROW + n : n, Display.FORMAT_RAW);
		
		// Light up selection and record/monitor buttons
		this.push.setButton (20 + i, isSel ? PUSH_COLOR_ORANGE_LO : PUSH_COLOR_BLACK);
		if (this.push.isShiftPressed ())
			this.push.setButton (102 + i, t.monitor ? PUSH_COLOR_GREEN_LO : PUSH_COLOR_BLACK);
		else
			this.push.setButton (102 + i, t.recarm ? PUSH_COLOR_RED_LO : PUSH_COLOR_BLACK);
	}
	d.done (3);
};
