// Written by Jürgen Moßgraber - mossgrabers.de
//            Michael Schmalle - teotigraphix.com
// (c) 2014-2016
// Licensed under LGPLv3 - http://www.gnu.org/licenses/lgpl-3.0.txt

function DeviceUserMode (model)
{
    AbstractDeviceFixedMode.call (this, model, MODE_DEVICE_USER);
}
DeviceUserMode.prototype = new AbstractDeviceFixedMode ();

DeviceUserMode.prototype.getParameterValues = function (index)
{
    return this.model.getUserControlBank ().getUserParam (index);
};

DeviceUserMode.prototype.getParameter = function (index)
{
    return this.model.getUserControlBank ().getControl (index);
};
