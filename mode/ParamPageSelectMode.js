// Written by Jürgen Moßgraber - mossgrabers.de
//            Michael Schmalle - teotigraphix.com
// (c) 2014
// Licensed under GPLv3 - http://www.gnu.org/licenses/gpl.html

ParamPageSelectMode.firstRowButtonColorUp = PUSH_COLOR_BLACK;
ParamPageSelectMode.firstRowButtonColorSelected = PUSH_COLOR_GREEN_LO - 4;


function ParamPageSelectMode (model)
{
    BaseMode.call (this, model);
    this.id = MODE_PARAM_PAGE_SELECT;
    this.bottomItems = [];
    this.selectedIndex = 0;
}
ParamPageSelectMode.prototype = new BaseMode ();

ParamPageSelectMode.prototype.getCurrentMode = function ()
{
    return this.currentMode;
};

ParamPageSelectMode.prototype.setCurrentMode = function (mode)
{
    this.currentMode = mode;
    this.currentModeChanged ();
    this.surface.setPendingMode (this.currentMode);
};

ParamPageSelectMode.prototype.isPageMode = function (mode)
{
    for (var i = 0; i < this.bottomItems.length; i++)
    {
        if (this.bottomItems[i].getModeId () == mode)
            return true;
    }
    return false;
};

ParamPageSelectMode.prototype.currentModeChanged = function ()
{
    this.selectedIndex = 0;
    for (var i = 0; i < this.bottomItems.length; i++)
    {
        if (this.bottomItems[i].getModeId () == this.currentMode)
        {
            this.selectedIndex = i;
            break;
        }
    }
};

ParamPageSelectMode.prototype.attachTo = function (surface)
{
    BaseMode.prototype.attachTo.call (this, surface);

    this.addFirstRowCommand (' Device ', MODE_BANK_DEVICE);
    this.addFirstRowCommand (' Common ', MODE_BANK_COMMON);
    this.addFirstRowCommand ('Envelope', MODE_BANK_ENVELOPE);
    this.addFirstRowCommand (' User   ', MODE_BANK_USER);
    this.addFirstRowCommand (' Macro  ', MODE_BANK_MACRO);
    this.addFirstRowCommand ('Modulate', MODE_BANK_MODULATE);
    
    this.setCurrentMode (MODE_BANK_DEVICE);
};

ParamPageSelectMode.prototype.updateDisplay = function ()
{
    var d = this.surface.display;
    d.clear ().setBlock (0, 0, "Parameter Banks:");
    for (var i = 0; i < this.bottomItems.length; i++)
        d.setCell (3, i, this.bottomItems[i].getLabel ());
    d.allDone ();
};

ParamPageSelectMode.prototype.updateFirstRow = function ()
{
    for (var i = 20; i < 28; i++)
    {
        if (i == 20 + this.selectedIndex)
            this.surface.setButton (i, ParamPageSelectMode.firstRowButtonColorSelected);
        else
            this.surface.setButton(i, ParamPageSelectMode.firstRowButtonColorUp);
    }
};

ParamPageSelectMode.prototype.updateSecondRow = function ()
{
    for (var i = 102; i < 110; i++)
        this.surface.setButton (i, PUSH_COLOR2_BLACK);
};

ParamPageSelectMode.prototype.onFirstRow = function (index)
{
    this.bottomItems[index].execute ();
};

ParamPageSelectMode.prototype.addFirstRowCommand = function (label, modeId)
{
    this.bottomItems.push (new ModeToggleCommand (label, modeId,
        doObject (this, function () { this.setCurrentMode (modeId) })));
};

function ModeToggleCommand (label, modeId, command)
{
    this.label = label;
    this.modeId = modeId;
    this.command = command;
}

ModeToggleCommand.prototype.getLabel = function ()
{
    return this.label;
};

ModeToggleCommand.prototype.getModeId = function ()
{
    return this.modeId;
};

ModeToggleCommand.prototype.execute = function ()
{
    this.command.call (this);
};