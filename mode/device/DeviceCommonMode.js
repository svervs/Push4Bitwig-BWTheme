// Written by Jürgen Moßgraber - mossgrabers.de
//            Michael Schmalle - teotigraphix.com
// (c) 2014
// Licensed under LGPLv3 - http://www.gnu.org/licenses/lgpl-3.0.txt

function DeviceCommonMode (model)
{
    AbstractDeviceFixedMode.call (this, model, MODE_DEVICE_COMMON);
}
DeviceCommonMode.prototype = new AbstractDeviceFixedMode ();

DeviceCommonMode.prototype.getParameterValues = function (index)
{
    return this.model.getCursorDevice ().getCommonParam (index);
};

DeviceCommonMode.prototype.getParameter = function (index)
{
    return this.model.getCursorDevice ().getCommonParameter (index);
};
