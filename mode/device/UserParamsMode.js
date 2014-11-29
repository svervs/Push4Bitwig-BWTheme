// Written by Jürgen Moßgraber - mossgrabers.de
//            Michael Schmalle - teotigraphix.com
// (c) 2014
// Licensed under LGPLv3 - http://www.gnu.org/licenses/lgpl-3.0.txt

function UserParamsMode (model)
{
    BaseParamsMode.call (this, model, MODE_BANK_USER);
}
UserParamsMode.prototype = new BaseParamsMode ();

UserParamsMode.prototype.getParameterValues = function (index)
{
    return this.model.getUserControlBank ().getUserParam (index);
};

UserParamsMode.prototype.getParameter = function (index)
{
    return this.model.getUserControlBank ().getControl (index);
};
