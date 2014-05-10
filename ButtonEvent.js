// Written by Jürgen Moßgraber - mossgrabers.de
// (c) 2014
// Licensed under GPLv3 - http://www.gnu.org/licenses/gpl.html

var BUTTON_STATE_DOWN = 0;
var BUTTON_STATE_UP   = 1;
var BUTTON_STATE_LONG = 2;


function ButtonEvent (aState)
{
	this.state = aState;
}

ButtonEvent.prototype.getState = function ()
{
	return this.state;
};

ButtonEvent.prototype.isDown = function ()
{
	return this.state == BUTTON_STATE_DOWN;
};

ButtonEvent.prototype.isUp = function ()
{
	return this.state == BUTTON_STATE_UP;
};

ButtonEvent.prototype.isLong = function ()
{
	return this.state == BUTTON_STATE_LONG;
};