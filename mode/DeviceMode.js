// Written by Jürgen Moßgraber - mossgrabers.de
//            Michael Schmalle - teotigraphix.com
// (c) 2014
// Licensed under GPLv3 - http://www.gnu.org/licenses/gpl.html

function DeviceMode (model)
{
	BaseMode.call (this, model);
	this.id = MODE_DEVICE;
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
		p.addNameObserver (8, '', doIndex (i, function (index, name)
		{
			fxparams[index].name = name;
		}));
		p.addValueObserver (128, doIndex (i, function (index, value)
		{
			fxparams[index].value = value;
		}));
		// Parameter value text
		p.addValueDisplayObserver (8, '',  doIndex (i, function (index, value)
		{
			fxparams[index].valueStr = value;
		}));
	}
};

DeviceMode.prototype.onValueKnob = function (index, value)
{
	fxparams[index].value = this.changeValue (value, fxparams[index].value);
	device.getParameter (index).set (fxparams[index].value, 128);
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
		var isEmpty = fxparams[i].name.length == 0;
		d.setCell (0, i, fxparams[i].name, Display.FORMAT_RAW)
		 .setCell (1, i, isEmpty ? '' : fxparams[i].valueStr, Display.FORMAT_RAW);
		if (isEmpty)
			d.clearCell (2, i);
		else				
			d.setCell (2, i, fxparams[i].value, Display.FORMAT_VALUE);
					
		// Light up fx selection buttons
		push.setButton (20 + i, i == 7 && selectedDevice.enabled ? PUSH_COLOR_GREEN_LO - 4 : PUSH_COLOR_BLACK);
		push.setButton (102 + i, PUSH_COLOR_BLACK);
	}
	
	if (selectedDevice.name == 'None')
		d.setBlock(1, 1, '    Please select').setBlock(1, 2, 'a Device...    ');
	
	d.done (0).done (1).done (2)
	 .setCell (3, 0, 'Selected', Display.FORMAT_RAW).setCell (3, 1, 'Device: ', Display.FORMAT_RAW)
	 .setBlock (3, 1, selectedDevice.name)
	 .clearBlock (3, 2).clearCell (3, 6)
	 .setCell (3, 7, selectedDevice.enabled ? 'Enabled' : 'Disabled').done (3);
};
