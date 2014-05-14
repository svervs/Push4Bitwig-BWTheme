// Written by Jürgen Moßgraber - mossgrabers.de
//            Michael Schmalle - teotigraphix.com
// (c) 2014
// Licensed under GPLv3 - http://www.gnu.org/licenses/gpl.html

function DeviceMode (model)
{
	BaseMode.call (this, model);
	this.id = MODE_DEVICE;
	this.fullDisplay = true;
	
	this.fxparams = [ { index: 0, name: '' }, { index: 1, name: '' }, { index: 2, name: '' }, { index: 3, name: '' }, { index: 4, name: '' }, { index: 5, name: '' }, { index: 6, name: '' }, { index: 7, name: '' } ];
}
DeviceMode.prototype = new BaseMode ();

DeviceMode.prototype.attachTo = function (aPush) 
{
	device.addIsEnabledObserver (function (isEnabled)
	{
		selectedDevice.enabled = isEnabled;
	});
	device.addNameObserver (34, 'None', function (name)
	{
		selectedDevice.name = name;
	});
	
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
	if (index == 7)
		device.toggleEnabledState ();
};

DeviceMode.prototype.updateDisplay = function () 
{
	var d = push.display;
	
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
		push.setButton (20 + i, i == 7 && selectedDevice.enabled ? PUSH_COLOR_GREEN_LO - 4 : PUSH_COLOR_BLACK);
		push.setButton (102 + i, PUSH_COLOR_BLACK);
	}
	
	if (selectedDevice.name == 'None')
		d.setBlock(1, 1, '    Please select').setBlock(1, 2, 'a Device...    ');
	
	d.done (0).done (1).done (2);

	if (isEmpty)
		d.clearRow (3).done (3);
	else
	{
		d.setCell (3, 0, 'Selected', Display.FORMAT_RAW).setCell (3, 1, 'Device: ', Display.FORMAT_RAW)
		 .setBlock (3, 1, selectedDevice.name)
		 .clearBlock (3, 2).clearCell (3, 6)
		 .setCell (3, 7, selectedDevice.enabled ? 'Enabled' : 'Disabled').done (3);
	}
};
