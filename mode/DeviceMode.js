// Written by Jürgen Moßgraber - mossgrabers.de
//            Michael Schmalle - teotigraphix.com
// (c) 2014
// Licensed under GPLv3 - http://www.gnu.org/licenses/gpl.html

function DeviceMode (model)
{
	BaseMode.call (this, model);
	this.id = MODE_BANK_DEVICE;
	this.fullDisplay = true;
}
DeviceMode.prototype = new BaseMode ();

DeviceMode.prototype.onValueKnob = function (index, value)
{
	var param = this.model.getCursorDevice ().getFXParam (index);
	param.value = this.changeValue (value, param.value);
	this.model.getCursorDevice ().getParameter (index).set (param.value, 128);
};

DeviceMode.prototype.onValueKnobTouch = function (index, isTouched) 
{
	if (this.push.isDeletePressed ())
		this.model.getCursorDevice ().getParameter (index).reset ();
};

DeviceMode.prototype.onFirstRow = function (index)
{
	switch (index)
	{
		case 5:
			//if (hasPreviousParameterPage)
				this.model.getCursorDevice ().previousParameterPage ();
			break;

		case 6:
			//if (hasNextParameterPage)
			this.model.getCursorDevice ().nextParameterPage ();
			break;

		case 7:
			this.model.getCursorDevice ().toggleEnabledState ();
			break;
	}
};

DeviceMode.prototype.updateDisplay = function () 
{
	var d = this.push.display;
	var selectedDevice = this.model.getSelectedDevice ();
	var hasDevice = this.model.hasSelectedDevice ();

	if (hasDevice)
	{
		var cursorDevice = this.model.getCursorDevice ();
		for (var i = 0; i < 8; i++)
		{
			var param = cursorDevice.getFXParam (i);
			var isEmpty = param.name.length == 0;
			d.setCell (0, i, param.name, Display.FORMAT_RAW)
			 .setCell (1, i, param.valueStr, Display.FORMAT_RAW);

			if (isEmpty)
				d.clearCell (2, i);
			else
				d.setCell (2, i, param.value, Display.FORMAT_VALUE);

			// Light up fx selection buttons
			if (i < 5)
				this.push.setButton (20 + i, PUSH_COLOR_BLACK);
			if (i == 7 && selectedDevice.enabled)
				this.push.setButton (27, PUSH_COLOR_GREEN_LO - 4);

			this.push.setButton (102 + i, PUSH_COLOR_BLACK);
		}
	}
	else
		d.clear ().setBlock (1, 1, '    Please select').setBlock (1, 2, 'a Device...    ');

	d.done (0).done (1).done (2);

	if (!hasDevice)
		d.clearRow (3).done (3);
	else
	{
		d.setCell (3, 0, 'Selected', Display.FORMAT_RAW).setCell (3, 1, 'Device: ', Display.FORMAT_RAW)
		 .setBlock (3, 1, selectedDevice.name)
		 .clearBlock (3, 2).clearCell (3, 6);

		if (this.model.getCursorDevice ().selectedParameterPage > 0)
			d.setCell (3, 5, ' < Prev ', Display.FORMAT_RAW);

		d.setCell (3, 6, ' Next > ', Display.FORMAT_RAW)
		 .setCell (3, 7, selectedDevice.enabled ? 'Enabled' : 'Disabled').done (3);

		this.push.setButton (25, this.model.getCursorDevice ().selectedParameterPage > 0 ? PUSH_COLOR_ORANGE_LO : PUSH_COLOR_BLACK);
		this.push.setButton (26, PUSH_COLOR_ORANGE_LO);
	}
};
