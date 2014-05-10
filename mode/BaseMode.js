// Written by Jürgen Moßgraber - mossgrabers.de
//            Michael Schmalle - teotigraphix.com
// (c) 2014
// Licensed under GPLv3 - http://www.gnu.org/licenses/gpl.html

BaseMode.INC_FRACTION_VALUE = 1;

function BaseMode (model)
{
	this.model = model;
	this.id = null;
}

BaseMode.prototype.attachTo = function (push) {};
BaseMode.prototype.onActivate = function () {};
BaseMode.prototype.getId = function () { return this.id; };
BaseMode.prototype.onValueKnob = function (index, value) {};
BaseMode.prototype.onValueKnobTouch = function (index, isTouched) {};
BaseMode.prototype.onFirstRow = function (index) {};
BaseMode.prototype.onSecondRow = function (index) {};
BaseMode.prototype.updateDisplay = function () {};

BaseMode.prototype.changeValue = function (control, value)
{
	return control <= 61 ? Math.min (value + BaseMode.INC_FRACTION_VALUE, 127) : Math.max (value - BaseMode.INC_FRACTION_VALUE, 0);
}
