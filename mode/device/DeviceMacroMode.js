// Written by Jürgen Moßgraber - mossgrabers.de
//            Michael Schmalle - teotigraphix.com
// (c) 2014-2015
// Licensed under LGPLv3 - http://www.gnu.org/licenses/lgpl-3.0.txt

function DeviceMacroMode (model)
{
    AbstractDeviceFixedMode.call (this, model, MODE_DEVICE_MACRO);
}
DeviceMacroMode.prototype = new AbstractDeviceFixedMode ();

DeviceMacroMode.prototype.getParameterValues = function (index)
{
    return this.model.getDevice ().getMacroParam (index);
};

DeviceMacroMode.prototype.getParameter = function (index)
{
    return this.model.getDevice ().getMacro (index).getAmount ();
};

DeviceMacroMode.prototype.onSecondRow = function (index)
{
    if (Config.isPush2)
    {
        // No support for macro mapping on Push 2, the buttons are required for navigation
        AbstractDeviceMode.prototype.onSecondRow.call (this, index);
        return;
    }
    
    var macro = this.model.getDevice ().getMacro (index);
    if (macro)
        macro.getModulationSource ().toggleIsMapping ();
};

DeviceMacroMode.prototype.updateSecondRow = function ()
{
    if (Config.isPush2)
    {
        // No support for macro mapping on Push 2, the buttons are required for navigation
        AbstractDeviceMode.prototype.updateSecondRow.call (this);
        return;
    }
    
    for (var i = 0; i < 8; i++)
        this.surface.setButton (102 + i, this.model.getDevice ().isMacroMapping (i) ? PUSH_COLOR2_GREEN_SPRING : PUSH_COLOR2_BLACK);
};
