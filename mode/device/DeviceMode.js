// Written by Jürgen Moßgraber - mossgrabers.de
//            Michael Schmalle - teotigraphix.com
// (c) 2014
// Licensed under LGPLv3 - http://www.gnu.org/licenses/lgpl-3.0.txt

function DeviceMode (model)
{
    BaseMode.call (this, model);
    this.isTemporary = false;
}
DeviceMode.prototype = new BaseMode ();

DeviceMode.prototype.onSecondRow = function (index)
{
    if (index == 0)
        this.model.getCursorDevice ().toggleEnabledState ();
    else if (index == 7)
        this.model.getCursorDevice ().toggleWindowOpen ();
};

DeviceMode.prototype.updateSecondRow = function ()
{
    this.disableSecondRow ();
    this.surface.setButton (102, this.model.getSelectedDevice ().enabled ? PUSH_COLOR2_GREEN_HI : PUSH_COLOR2_GREY_LO);
    this.surface.setButton (109, this.model.getCursorDevice ().isWindowOpen () ? PUSH_COLOR2_TURQUOISE_HI : PUSH_COLOR2_GREY_LO);
};
