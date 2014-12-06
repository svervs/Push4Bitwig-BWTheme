// Written by Jürgen Moßgraber - mossgrabers.de
//            Michael Schmalle - teotigraphix.com
// (c) 2014
// Licensed under LGPLv3 - http://www.gnu.org/licenses/lgpl-3.0.txt

function DeviceModulationMode (model)
{
    AbstractDeviceFixedMode.call (this, model, MODE_DEVICE_MODULATE);
}
DeviceModulationMode.prototype = new AbstractDeviceFixedMode ();

DeviceModulationMode.prototype.getParameterValues = function (index)
{
    return this.model.getCursorDevice ().getModulationParam (index);
};

DeviceModulationMode.prototype.getParameter = function (index)
{
    return this.model.getCursorDevice ().getModulationSource (index);
};

DeviceModulationMode.prototype.onValueKnob = function (index, value)
{
    var values = this.getParameterValues (index);
    if ((value <= 61 && !values.value) || (value > 61 && values.value))
        this.getParameter (index).toggleIsMapping ();
};

DeviceModulationMode.prototype.onValueKnobTouch = function (index, isTouched) {};
