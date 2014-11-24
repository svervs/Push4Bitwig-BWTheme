// Written by Jürgen Moßgraber - mossgrabers.de
//            Michael Schmalle - teotigraphix.com
// (c) 2014
// Licensed under LGPLv3 - http://www.gnu.org/licenses/lgpl-3.0.txt

ParamPageSelectMode.firstRowButtonColorUp = PUSH_COLOR_GREEN_LO;
ParamPageSelectMode.firstRowButtonColorSelected = PUSH_COLOR_YELLOW_LO;


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

ParamPageSelectMode.prototype.isPageMode = function (modeId)
{
    for (var i = 0; i < this.bottomItems.length; i++)
    {
        if (this.bottomItems[i].getModeId () == modeId)
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

    this.addFirstRowCommand ('Device', MODE_BANK_DEVICE);
    this.addFirstRowCommand ('Fixed', MODE_BANK_COMMON);
    this.addFirstRowCommand ('Direct', MODE_BANK_DIRECT);
    
    this.setCurrentMode (MODE_BANK_DEVICE);
};

ParamPageSelectMode.prototype.updateDisplay = function ()
{
    var d = this.surface.getDisplay ();
    d.clear ().setBlock (1, 0, "Parameter Banks:");
    for (var i = 0; i < this.bottomItems.length; i++)
        d.setCell (3, i, this.bottomItems[i].getLabel ());
    d.allDone ();
};

ParamPageSelectMode.prototype.updateFirstRow = function ()
{
    for (var i = 0; i < this.bottomItems.length; i++)
        this.surface.setButton (20 + i, i == this.selectedIndex ? ParamPageSelectMode.firstRowButtonColorSelected : ParamPageSelectMode.firstRowButtonColorUp);
    for (var i = this.bottomItems.length; i < 8; i++)
        this.surface.setButton (20 + i, PUSH_COLOR_BLACK);
};

ParamPageSelectMode.prototype.onFirstRow = function (index)
{
    if (index < this.bottomItems.length)
        this.bottomItems[index].execute ();
};

ParamPageSelectMode.prototype.addFirstRowCommand = function (label, modeId)
{
    this.bottomItems.push (new ModeToggleCommand (label, modeId,
        doObject (this, function () { this.setCurrentMode (modeId); })));
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