// Written by Jürgen Moßgraber - mossgrabers.de
//            Michael Schmalle - teotigraphix.com
// (c) 2014
// Licensed under GPLv3 - http://www.gnu.org/licenses/gpl.html

function DeviceMode (model)
{
	BaseMode.call (this, model);
	this.id = MODE_BANK_DEVICE;
	this.fullDisplay = true;

	this.hasNextParameterPage = false;
	this.hasPreviousParameterPage = false;
	this.selectedParameterPage = -1;
	
	this.fxparams = [ { index: 0, name: '' }, { index: 1, name: '' }, { index: 2, name: '' }, { index: 3, name: '' }, { index: 4, name: '' }, { index: 5, name: '' }, { index: 6, name: '' }, { index: 7, name: '' } ];
}
DeviceMode.prototype = new BaseMode ();

DeviceMode.prototype.attachTo = function (aPush) 
{
	device.addIsEnabledObserver (doObject (this, function (isEnabled)
	{
		this.model.getSelectedDevice ().enabled = isEnabled;
	}));
	device.addNameObserver (34, 'None', doObject (this, function (name)
	{
		this.model.getSelectedDevice ().name = name;
	}));
	// TODO (mschmalle) These don't seem to work, when working, the Next, Previous visibilities
	// can be managed correctly, right now just using selectedParameterPage
	device.addPreviousParameterPageEnabledObserver (doObject (this, function (isEnabled)
	{
		//println("hasPreviousParameterPage" + isEnabled);
		this.hasPreviousParameterPage = isEnabled;
	}));
	device.addNextParameterPageEnabledObserver (doObject (this, function (isEnabled)
	{
		//println("hasNextParameterPage" + isEnabled);
		this.hasNextParameterPage = isEnabled;
	}));
	device.addSelectedPageObserver (-1, doObject (this, function (page)
	{
		//println("addSelectedPageObserver" + page);
		this.selectedParameterPage = page;
	}));

	for (var i = 0; i < 8; i++)
	{
		var p = device.getParameter (i);
		
		// Parameter name
		p.addNameObserver (8, '', doObjectIndex (this, i, function (index, name)
		{
			this.fxparams[index].name = name;
		}));
		p.addValueObserver (128, doObjectIndex (this, i, function (index, value)
		{
			this.fxparams[index].value = value;
		}));
		// Parameter value text
		p.addValueDisplayObserver (8, '',  doObjectIndex (this, i, function (index, value)
		{
			this.fxparams[index].valueStr = value;
		}));
	}
};

DeviceMode.prototype.onValueKnob = function (index, value)
{
	this.fxparams[index].value = this.changeValue (value, this.fxparams[index].value);
	device.getParameter (index).set (this.fxparams[index].value, 128);
};

DeviceMode.prototype.onValueKnobTouch = function (index, isTouched) 
{
	if (push.isDeletePressed ())
		device.getParameter (index).reset ();
};

DeviceMode.prototype.onFirstRow = function (index)
{
	switch (index)
	{
		case 5:
			//if (hasPreviousParameterPage)
				device.previousParameterPage ();
			break;

		case 6:
			//if (hasNextParameterPage)
				device.nextParameterPage ();
			break;

		case 7:
			device.toggleEnabledState ();
			break;
	}
};

DeviceMode.prototype.updateDisplay = function () 
{
	var d = push.display;
	var selectedDevice = this.model.getSelectedDevice ();
	var hasDevice = this.model.hasSelectedDevice ();

	if (hasDevice)
	{
		for (var i = 0; i < 8; i++)
		{
			var isEmpty = this.fxparams[i].name.length == 0;
			d.setCell (0, i, this.fxparams[i].name, Display.FORMAT_RAW)
			 .setCell (1, i, isEmpty ? '' : this.fxparams[i].valueStr, Display.FORMAT_RAW);

			if (isEmpty)
				d.clearCell (2, i);
			else
				d.setCell (2, i, this.fxparams[i].value, Display.FORMAT_VALUE);

			// Light up fx selection buttons
			if (i < 5)
				push.setButton (20 + i, PUSH_COLOR_BLACK);
			if (i == 7 && selectedDevice.enabled)
				push.setButton (27, PUSH_COLOR_GREEN_LO - 4);

			push.setButton (102 + i, PUSH_COLOR_BLACK);
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

		if (this.selectedParameterPage > 0)
			d.setCell (3, 5, ' < Prev ', Display.FORMAT_RAW);

		d.setCell (3, 6, ' Next > ', Display.FORMAT_RAW)
		 .setCell (3, 7, selectedDevice.enabled ? 'Enabled' : 'Disabled').done (3);

		push.setButton (25, this.selectedParameterPage > 0 ? PUSH_COLOR_ORANGE_LO : PUSH_COLOR_BLACK);
		push.setButton (26, PUSH_COLOR_ORANGE_LO);
	}
};
