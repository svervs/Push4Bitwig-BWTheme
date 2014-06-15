// Written by Jürgen Moßgraber - mossgrabers.de
//            Michael Schmalle - teotigraphix.com
// (c) 2014
// Licensed under GPLv3 - http://www.gnu.org/licenses/gpl.html

function AbstractTrackMode (model)
{
    BaseMode.call (this, model);
    this.hasSecondRowPriority = false;
    this.isTemporary = false;
}
AbstractTrackMode.prototype = new BaseMode ();

AbstractTrackMode.prototype.onSecondRow = function (index)
{
    this.model.getTrackBank ().toggleArm (index);
};
