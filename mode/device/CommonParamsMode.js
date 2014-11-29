// Written by Jürgen Moßgraber - mossgrabers.de
//            Michael Schmalle - teotigraphix.com
// (c) 2014
// Licensed under LGPLv3 - http://www.gnu.org/licenses/lgpl-3.0.txt

function CommonParamsMode (model)
{
    BaseParamsMode.call (this, model, MODE_BANK_COMMON);
}
CommonParamsMode.prototype = new BaseParamsMode ();

CommonParamsMode.prototype.getParameterValues = function (index)
{
    return this.model.getCursorDevice ().getCommonParam (index);
};

CommonParamsMode.prototype.getParameter = function (index)
{
    return this.model.getCursorDevice ().getCommonParameter (index);
};
