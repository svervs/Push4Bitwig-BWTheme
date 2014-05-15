// Written by Jürgen Moßgraber - mossgrabers.de
//            Michael Schmalle - teotigraphix.com
// (c) 2014
// Licensed under GPLv3 - http://www.gnu.org/licenses/gpl.html

function ParamPageMode (model)
{
	BaseMode.call (this, model);
	this.id = MODE_PARAM_PAGE;
	this.fullDisplay = true;

	this.bottomItems = [];
	this.selectedIndex = 0;

	this.setCurrentMode (MODE_DEVICE);
}
ParamPageMode.prototype = new BaseMode ();

ParamPageMode.firstRowButtonColorUp = PUSH_COLOR_BLACK;
ParamPageMode.firstRowButtonColorSelected = PUSH_COLOR_GREEN_LO - 4;

ParamPageMode.prototype.getCurrentMode = function ()
{
	return this.currentMode;
};

ParamPageMode.prototype.setCurrentMode = function (mode)
{
	this.currentMode = mode;
	this.currentModeChanged();
};

ParamPageMode.prototype.currentModeChanged = function ()
{
	this.selectedIndex = 0;
	for (var i = 0; i < this.bottomItems.length; i++) {
		if (this.bottomItems[i].getModeId() == this.currentMode) {
			this.selectedIndex = i;
			break;
		}
	}
};

ParamPageMode.prototype.attachTo = function (aPush)
{
	this.addFirstRowCommand (' Device ', MODE_BANK_DEVICE);
	this.addFirstRowCommand (' Common ', MODE_BANK_COMMON);
	this.addFirstRowCommand ('Envelope', MODE_BANK_ENVELOPE);
	this.addFirstRowCommand ('Modulate', MODE_BANK_MODULATE);
	this.addFirstRowCommand (' User   ', MODE_BANK_USER);
	this.addFirstRowCommand (' Macro  ', MODE_BANK_MACRO);
};

ParamPageMode.prototype.updateDisplay = function ()
{
	var d = push.display;

	d.clear ().setBlock (0, 0, "Parameter Banks:");

	for (var i = 0; i < this.bottomItems.length; i++)
		d.setCell (3, i, this.bottomItems[i].getLabel());

	for (var i = 20; i < 28; i++)
		push.setButton (i, ParamPageMode.firstRowButtonColorUp);

	for (var i = 102; i < 110; i++)
		push.setButton (i, PUSH_COLOR_BLACK);

	push.setButton (20 + this.selectedIndex, ParamPageMode.firstRowButtonColorSelected);

	d.done (0).done (1).done (2).done (3);
};

ParamPageMode.prototype.onFirstRow = function (index)
{
	this.bottomItems[index].execute();
};

ParamPageMode.prototype.addFirstRowCommand = function (label, modeId)
{
	this.bottomItems.push(new ModeToggleCommand(label, modeId,
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