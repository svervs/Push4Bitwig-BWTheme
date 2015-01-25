// Written by Jürgen Moßgraber - mossgrabers.de
//            Michael Schmalle - teotigraphix.com
// (c) 2014-2015
// Licensed under LGPLv3 - http://www.gnu.org/licenses/lgpl-3.0.txt

function DeviceEnvelopeMode (model)
{
    AbstractDeviceFixedMode.call (this, model, MODE_DEVICE_ENVELOPE);
}
DeviceEnvelopeMode.prototype = new AbstractDeviceFixedMode ();

DeviceEnvelopeMode.prototype.getParameterValues = function (index)
{
    return this.cursorDevice.getEnvelopeParam (index);
};

DeviceEnvelopeMode.prototype.getParameter = function (index)
{
    return this.cursorDevice.getEnvelopeParameter (index);
};
