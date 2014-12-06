// Written by Jürgen Moßgraber - mossgrabers.de
//            Michael Schmalle - teotigraphix.com
// (c) 2014
// Licensed under LGPLv3 - http://www.gnu.org/licenses/lgpl-3.0.txt

function DeviceMacroMode (model)
{
    AbstractDeviceFixedMode.call (this, model, MODE_DEVICE_MACRO);
}
DeviceMacroMode.prototype = new AbstractDeviceFixedMode ();

DeviceMacroMode.prototype.getParameterValues = function (index)
{
    return this.model.getCursorDevice ().getMacroParam (index);
};

DeviceMacroMode.prototype.getParameter = function (index)
{
    return this.model.getCursorDevice ().getMacro (index).getAmount ();
};

DeviceMacroMode.prototype.onSecondRow = function (index)
{
    var macro = this.model.getCursorDevice ().getMacro (index);
    if (macro)
        macro.getModulationSource ().toggleIsMapping ();
};

DeviceMacroMode.prototype.updateSecondRow = function ()
{
    for (var i = 0; i < 8; i++)
        this.surface.setButton (102 + i, this.model.getCursorDevice ().isMacroMapping (i) ? PUSH_COLOR2_GREEN_SPRING : PUSH_COLOR2_BLACK);
};
