// Written by Jürgen Moßgraber - mossgrabers.de
//            Michael Schmalle - teotigraphix.com
// (c) 2014
// Licensed under GPLv3 - http://www.gnu.org/licenses/gpl.html

function PresetMode (model)
{
	BaseMode.call (this, model);
	this.id = MODE_PRESET;
	this.fullDisplay = true;

	this.knobInvalidated = false;
	
	this.firstRowButtons = [];
	this.firstRowButtons[22] = {};
	this.firstRowButtons[24] = {};
	this.firstRowButtons[26] = {};
	
	this.secondRowButtons = [];
	this.secondRowButtons[104] = {};
	this.secondRowButtons[106] = {};
	this.secondRowButtons[108] = {};
}
PresetMode.prototype = new BaseMode ();

PresetMode.knobDuration = 150;
PresetMode.firstRowButtonColor = PUSH_COLOR_GREEN_LO-4;
PresetMode.secondRowButtonColor = PUSH_COLOR_GREEN_LO;

PresetMode.prototype.onActivate = function ()
{
};

PresetMode.prototype.onValueKnob = function (index, value)
{
	if (this.knobInvalidated)
		return;
	
	this.knobInvalidated = true;

	host.scheduleTask (doObject (this, function ()
	{
		if (value >= 61)
			this.onFirstRow (index);
		else
			this.onSecondRow (index);
		this.knobInvalidated = false;
	}), null, PresetMode.knobDuration - (this.push.isShiftPressed()) ? 100 : 0);
};

PresetMode.prototype.onFirstRow = function (index)
{
	if (index == 2)
		this.push.cursorDevice.switchToPreviousPresetCategory();
	else if (index == 4)
		this.push.cursorDevice.switchToPreviousPresetCreator();
	else if (index == 6)
		this.push.cursorDevice.switchToPreviousPreset();
};

PresetMode.prototype.onSecondRow = function (index)
{
	if (index == 2)
		this.push.cursorDevice.switchToNextPresetCategory ();
	else if (index == 4)
		this.push.cursorDevice.switchToNextPresetCreator ();
	else if (index == 6)
		this.push.cursorDevice.switchToNextPreset ();
};

PresetMode.prototype.updateDisplay = function ()
{
	var d = this.push.display;

	if (!this.model.hasSelectedDevice ())
	{
		d.clear ()
		 .setBlock (1, 1, '    Please select').setBlock (1, 2, 'a Device...    ')
		 .done (0).done (1).done (2).done (3);
		return;
	}

	d.clearColumn (0).setBlock ( 0, 0, "Select Preset:")
	 .setBlock (3, 0, "Device: " + this.model.getSelectedDevice ().name);
	
	var view = this.push.cursorDevice.categoryProvider.getView (4);
	for (var i = 0; i < 4; i++)
	{
		var value = (view[i] != null) ? view[i] : "";
		if (i == 0)
			d.setBlock (i, 1, Display.RIGHT_ARROW + value);
		else
			d.setBlock (i, 1, ' ' + value);
	}
	
	var view = this.push.cursorDevice.creatorProvider.getView (4);
	for (var i = 0; i < 4; i++)
	{
		var value = (view[i] != null) ? view[i] : "";
		if (i == 0)
			d.setBlock (i, 2, Display.RIGHT_ARROW + value);
		else
			d.setBlock (i, 2, ' ' + value);
	}

	d.clearColumn(3).setBlock (0, 3, Display.RIGHT_ARROW + this.push.cursorDevice.currentPreset).done (0).done (1).done (2).done (3);
	
	for (var i = 20; i < 28; i++)
		push.setButton (i, this.firstRowButtons[i] != null ? PresetMode.firstRowButtonColor : PUSH_COLOR_BLACK);
	
	for (var i = 104; i < 110; i++)
		push.setButton (i, this.secondRowButtons[i] != null ? PresetMode.secondRowButtonColor : PUSH_COLOR_BLACK);
};
