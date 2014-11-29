// Written by Jürgen Moßgraber - mossgrabers.de
//            Michael Schmalle - teotigraphix.com
// (c) 2014
// Licensed under LGPLv3 - http://www.gnu.org/licenses/lgpl-3.0.txt

function MacroParamsMode (model)
{
    BaseParamsMode.call (this, model, MODE_BANK_MACRO);
}
MacroParamsMode.prototype = new BaseParamsMode ();

MacroParamsMode.prototype.getParameterValues = function (index)
{
    return this.model.getCursorDevice ().getMacroParam (index);
};

MacroParamsMode.prototype.getParameter = function (index)
{
    return this.model.getCursorDevice ().getMacro (index).getAmount ();
};

MacroParamsMode.prototype.onSecondRow = function (index)
{
    var macro = this.model.getCursorDevice ().getMacro (index);
    if (macro)
        macro.getModulationSource ().toggleIsMapping ();
};

MacroParamsMode.prototype.updateSecondRow = function ()
{
    for (var i = 0; i < 8; i++)
        this.surface.setButton (102 + i, this.model.getCursorDevice ().isMacroMapping (i) ? PUSH_COLOR2_GREEN_SPRING : PUSH_COLOR2_BLACK);
};
