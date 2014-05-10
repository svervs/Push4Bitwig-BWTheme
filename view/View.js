// Written by Jürgen Moßgraber - mossgrabers.de
// (c) 2014
// Licensed under GPLv3 - http://www.gnu.org/licenses/gpl.html

function View ()
{
	this.push = null;
}

View.prototype.attachTo = function (push)
{
	this.push = push;
};

View.prototype.usesButton = function (buttonID)
{
	return true;
};

View.prototype.onActivate = function () {};

View.prototype.drawGrid = function () {};
View.prototype.onGrid = function (note, velocity) {};

View.prototype.onPlay = function (event) {};
View.prototype.onRecord = function (event) {};
View.prototype.onNew = function (event) {};
View.prototype.onDuplicate = function (event) {};
View.prototype.onAutomation = function (event) {};
View.prototype.onFixedLength = function (event) {};

View.prototype.onQuantize = function (event) {};
View.prototype.onDouble = function (event) {};
View.prototype.onDelete = function (event) {};
View.prototype.onUndo = function (event) {};

View.prototype.onSmallKnob1 = function (increase) {};
View.prototype.onSmallKnob2 = function (increase) {};

View.prototype.onClick = function (event) {};
View.prototype.onTapTempo = function (event) {};

View.prototype.onValueKnob = function (index, value) {};
View.prototype.onValueKnob9 = function (value) {};
View.prototype.onFirstRow = function (index) {};
View.prototype.onSecondRow = function (index) {};

View.prototype.onMaster = function (event) {};
View.prototype.onStop = function (event) {};
View.prototype.onScene = function (index) {};

View.prototype.onVolume = function () {};
View.prototype.onPanAndSend = function (event) {};
View.prototype.onTrack = function (event) {};
View.prototype.onClip = function (event) {};
View.prototype.onDevice = function (event) {};
View.prototype.onBrowse = function (event) {};

View.prototype.onDeviceLeft = function (event) {};
View.prototype.onDeviceRight = function (event) {};
View.prototype.onMute = function (event) {};
View.prototype.onSolo = function (event) {};
View.prototype.onScales = function (event) {};
View.prototype.onUser = function (event) {};
View.prototype.onRepeat = function (event) {};
View.prototype.onAccent = function (event) {};
View.prototype.onOctaveDown = function (event) {};
View.prototype.onOctaveUp = function (event) {};

View.prototype.onAddFX = function (event) {};
View.prototype.onAddTrack = function (event) {};
View.prototype.onNote = function (event) {};
View.prototype.onSession = function (event) {};
View.prototype.onSelect = function (event) {};
View.prototype.onShift = function (event) {};

View.prototype.onUp = function (event) {};
View.prototype.onDown = function (event) {};
View.prototype.onLeft = function (event) {};
View.prototype.onRight = function (event) {};

View.prototype.onValueKnobTouch = function (knob, isTouched) {};
View.prototype.onValueKnob9Touch = function (isTouched) {};
View.prototype.onSmallKnob1Touch = function (isTouched) {};
View.prototype.onSmallKnob1Touch = function (isTouched) {};
