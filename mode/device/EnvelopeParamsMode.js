// Written by Jürgen Moßgraber - mossgrabers.de
//            Michael Schmalle - teotigraphix.com
// (c) 2014
// Licensed under LGPLv3 - http://www.gnu.org/licenses/lgpl-3.0.txt

function EnvelopeParamsMode (model)
{
    BaseParamsMode.call (this, model, MODE_BANK_ENVELOPE);
}
EnvelopeParamsMode.prototype = new BaseParamsMode ();

EnvelopeParamsMode.prototype.getParameterValues = function (index)
{
    return this.model.getCursorDevice ().getEnvelopeParam (index);
};

EnvelopeParamsMode.prototype.getParameter = function (index)
{
    return this.model.getCursorDevice ().getEnvelopeParameter (index);
};
