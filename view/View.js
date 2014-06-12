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

View.prototype.updateDevice = function () {};
View.prototype.drawGrid = function () {};
View.prototype.onGrid = function (note, velocity) {};

//--------------------------------------
// Group 1
//--------------------------------------

View.prototype.onPlay = function (event) {};
View.prototype.onRecord = function (event) {};
View.prototype.onNew = function (event) {};
View.prototype.onDuplicate = function (event) {};
View.prototype.onAutomation = function (event) {};
View.prototype.onFixedLength = function (event) {};

//--------------------------------------
// Group 2
//--------------------------------------

View.prototype.onQuantize = function (event) {};
View.prototype.onDouble = function (event) {};
View.prototype.onDelete = function (event) {};
View.prototype.onUndo = function (event) {};

//--------------------------------------
// Group 3
//--------------------------------------

View.prototype.onSmallKnob1 = function (increase) {};
View.prototype.onSmallKnob1Touch = function (isTouched) {};
View.prototype.onSmallKnob2 = function (increase) {};
View.prototype.onSmallKnob2Touch = function (isTouched) {};

//--------------------------------------
// Group 4
//--------------------------------------

View.prototype.onMetronome = function (event) {};
View.prototype.onTapTempo = function (event) {};

//--------------------------------------
// Group 5
//--------------------------------------

View.prototype.onValueKnob = function (index, value) {};
View.prototype.onValueKnobTouch = function (knob, isTouched) {};
View.prototype.onValueKnob9 = function (value) {};
View.prototype.onValueKnob9Touch = function (isTouched) {};
View.prototype.onFirstRow = function (index) {};
View.prototype.onSecondRow = function (index) {};

//--------------------------------------
// Group 6
//--------------------------------------

View.prototype.onMaster = function (event) {};
View.prototype.onStop = function (event) {};
View.prototype.onScene = function (index) {};

//--------------------------------------
// Group 7
//--------------------------------------

View.prototype.onVolume = function () {};
View.prototype.onPanAndSend = function (event) {};
View.prototype.onTrack = function (event) {};
View.prototype.onClip = function (event) {};
View.prototype.onDevice = function (event) {};
View.prototype.onBrowse = function (event) {};

//--------------------------------------
// Group 8
//--------------------------------------

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

//--------------------------------------
// Group 9
//--------------------------------------

View.prototype.onAddEffect = function (event) {};
View.prototype.onAddTrack = function (event) {};
View.prototype.onNote = function (event) {};
View.prototype.onSession = function (event) {};
View.prototype.onSelect = function (event) {};
View.prototype.onShift = function (event) {};

//--------------------------------------
// Group 10
//--------------------------------------

View.prototype.onUp = function (event) {};
View.prototype.onDown = function (event) {};
View.prototype.onLeft = function (event) {};
View.prototype.onRight = function (event) {};

//--------------------------------------
// Group 11
//--------------------------------------

View.prototype.onFootswitch1 = function (value) {};
View.prototype.onFootswitch2 = function (value) {};
