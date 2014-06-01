// Written by Jürgen Moßgraber - mossgrabers.de
//            Michael Schmalle - teotigraphix.com
// (c) 2014
// Licensed under GPLv3 - http://www.gnu.org/licenses/gpl.html

function AbstractTrackMode (model)
{
	BaseMode.call (this, model);
}
AbstractTrackMode.prototype = new BaseMode ();

AbstractTrackMode.prototype.onSecondRow = function (index)
{
	if (this.push.isShiftPressed ())
		; // Toggle monitor: Currently not possible
	else
		this.model.getTrackBank ().toggleArm (index);
};
