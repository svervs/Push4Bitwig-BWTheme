// Written by Jürgen Moßgraber - mossgrabers.de
//            Michael Schmalle - teotigraphix.com
// (c) 2014
// Licensed under LGPLv3 - http://www.gnu.org/licenses/lgpl-3.0.txt

function ModulationParamsMode (model)
{
    BaseParamsMode.call (this, model, MODE_BANK_MODULATE);
}
ModulationParamsMode.prototype = new BaseParamsMode ();

ModulationParamsMode.prototype.getParameterValues = function (index)
{
    return this.model.getCursorDevice ().getModulationParam (index);
};

ModulationParamsMode.prototype.getParameter = function (index)
{
    return this.model.getCursorDevice ().getModulationSource (index);
};

ModulationParamsMode.prototype.onValueKnob = function (index, value)
{
    var values = this.getParameterValues (index);
    if ((value <= 61 && !values.value) || (value > 61 && values.value))
        this.getParameter (index).toggleIsMapping ();
};

ModulationParamsMode.prototype.onValueKnobTouch = function (index, isTouched) {};
