// Written by Michael Schmalle
// (c) 2014
// Licensed under GPLv3 - http://www.gnu.org/licenses/gpl.html

//--------------------------------------
// BaseMode
//--------------------------------------

function BaseMode ()
{
	this.id = null;
}

BaseMode.prototype.attachTo = function (aPush) {};
BaseMode.prototype.getId = function () { return this.id; };
BaseMode.prototype.onValueKnob = function (index, value) {};
BaseView.prototype.onValueKnobTouch = function (index, isTouched) {};
BaseMode.prototype.onFirstRow = function (index) {};
BaseMode.prototype.onSecondRow = function (index) {};
BaseMode.prototype.updateDisplay = function () {};

//------------------------------------------------------------------------------
// DeviceMode
//------------------------------------------------------------------------------

function DeviceMode ()
{
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
	fxparams[index].value = changeValue (value, fxparams[index].value);
	device.getParameter (index).set (fxparams[index].value, 128);
};

DeviceMode.prototype.onValueKnobTouch = function (index, isTouched) 
{
	if (push.isDeletePressed ())
		device.getParameter (index).reset ();
};

DeviceMode.prototype.updateDisplay = function () 
{
	var d = push.display;
	
	for (var i = 0; i < 8; i++)
	{
		var isEmpty = fxparams[i].name.length == 0;
		d.setCell (0, i, fxparams[i].name, PushDisplay.FORMAT_RAW)
		 .setCell (1, i, isEmpty ? '' : fxparams[i].valueStr, PushDisplay.FORMAT_RAW);
		if (isEmpty)
			d.clearCell (2, i);
		else				
			d.setCell (2, i, fxparams[i].value, PushDisplay.FORMAT_VALUE);
					
		// Light up fx selection buttons
		push.setButton (20 + i, i == 7 && selectedDevice.enabled ? PUSH_COLOR_GREEN_LO - 4 : PUSH_COLOR_BLACK);
		push.setButton (102 + i, PUSH_COLOR_BLACK);
	}
	
	if (selectedDevice.name == 'None')
		d.setBlock(1, 1, '    Please select').setBlock(1, 2, 'a Device...    ');
	
	d.done (0).done (1).done (2)
	 .setCell (3, 0, 'Selected', PushDisplay.FORMAT_RAW).setCell (3, 1, 'Device: ', PushDisplay.FORMAT_RAW)
	 .setBlock (3, 1, selectedDevice.name)
	 .clearBlock (3, 2).clearCell (3, 6)
	 .setCell (3, 7, selectedDevice.enabled ? 'Enabled' : 'Disabled').done (3);
};


//------------------------------------------------------------------------------
// MacroMode
//------------------------------------------------------------------------------

function MacroMode ()
{
	this.id = MODE_FRAME;
	this.bottomItems = [];
}
MacroMode.prototype = new BaseMode ();

MacroMode.prototype.attachTo = function (aPush) 
{
	for (var i = 0; i < 8; i++)
	{
		var m = device.getMacro (i);
		m.addLabelObserver (8, '', doIndex (i, function (index, name)
 		{
			macros[index].name = name;
		}));
		m.getAmount().addValueObserver (128, doIndex (i, function (index, value)
		{
			macros[index].value = value;
		}));
		// Macro value text
		m.getAmount().addValueDisplayObserver (8, '',  doIndex (i, function (index, value)
		{
			macros[index].valueStr = value;
		}));
	}
};

MacroMode.prototype.onValueKnob = function (index, value)
{
	macros[index].value = changeValue (value, macros[index].value);
	device.getMacro (index).getAmount ().set (macros[index].value, 128);
};

MacroMode.prototype.updateDisplay = function () 
{
	var d = push.display;
	
	if (this.hasMacros())
	{
		for (var i = 0; i < 8; i++)
		{
			if (macros[i].name.length == 0)
				d.clearCell (0, i).clearCell (1, i).clearCell (2, i);
			else				
			{
				d.setCell (0, i, macros[i].name, PushDisplay.FORMAT_RAW)
				 .setCell (1, i, macros[i].valueStr, PushDisplay.FORMAT_RAW)
				 .setCell (2, i, macros[i].value, PushDisplay.FORMAT_VALUE);
			}
		}
	}
	else
	{
		d.clearRow (0).clearRow (1).clearRow (2)
		 .setCell(1, 3, 'No Macro').setCell(1, 4, 'Assigned');
	}

	d.done (0).done (1).done (2);
};

MacroMode.prototype.hasMacros = function () 
{
	for (var i = 0; i < 8; i++)
	{
		if (macros[i].name.length != 0)
			return true;
	}
	return false;
};

//------------------------------------------------------------------------------
// FrameMode
//------------------------------------------------------------------------------

function FrameToggleCommand (label, command)
{
	this.label = label;
	this.command = command;
}

FrameToggleCommand.prototype.getLabel = function ()
{
	return this.label;
};

FrameToggleCommand.prototype.execute = function ()
{
	this.command.call(this);
};

function FrameMode ()
{
	this.id = MODE_FRAME;
	this.bottomItems = [];
}
FrameMode.prototype = new BaseMode ();

FrameMode.firstRowButtonColor = PUSH_COLOR_GREEN_LO - 4;

FrameMode.prototype.attachTo = function (aPush)
{
	this.addFirstRowCommand ('Arrange ', function () { application.setPerspective('ARRANGE'); });
	this.addFirstRowCommand ('  Mix   ', function () { application.setPerspective('MIX'); });
	this.addFirstRowCommand ('  Edit  ', function () { application.setPerspective('EDIT'); });
	this.addFirstRowCommand ('NoteEdit', function () { application.toggleNoteEditor(); });
	this.addFirstRowCommand ('Automate', function () { application.toggleAutomationEditor(); });
	this.addFirstRowCommand (' Device ', function () { application.toggleDevices(); });
	this.addFirstRowCommand (' Mixer  ', function () { application.toggleMixer(); });
	this.addFirstRowCommand ('  Full  ', function () { application.toggleFullScreen(); });
};

FrameMode.prototype.onValueKnob = function (index, value)
{
};

FrameMode.prototype.onFirstRow = function (index) 
{
	this.bottomItems[index].execute();
};

FrameMode.prototype.onSecondRow = function (index) 
{
};

FrameMode.prototype.updateDisplay = function () 
{
	var d = push.display;

	d.clear ().setBlock (0, 0, "Perspectives:").setCell (0, 3, "Panels:");
	
	for (var i = 0; i < this.bottomItems.length; i++)
		d.setCell (3, i, this.bottomItems[i].getLabel());
	
	for (var i = 20; i < 28; i++)
		push.setButton (i, FrameMode.firstRowButtonColor);
	
	d.done (0).done (1).done (2).done (3);
};

FrameMode.prototype.addFirstRowCommand = function (label, command)
{
	this.bottomItems.push(new FrameToggleCommand(label, command));
};

//------------------------------------------------------------------------------
// PresetMode
//------------------------------------------------------------------------------

function PresetMode ()
{
	this.id = MODE_PRESET;
	
	this.presetWidth = 16;
	this.knobInvalidated = false;
	
	this.categoryProvider = new PresetProvider(PresetProvider.Kind.CATEGORY);
	this.creatorProvider = new PresetProvider(PresetProvider.Kind.CREATOR);
	//this.presetProvider = new PresetProvider(PresetProvider.Kind.PRESET);
	
	this.currentPreset = null;
}
PresetMode.prototype = new BaseMode ();

PresetMode.knobDuration = 150;
PresetMode.firstRowButtonColor = PUSH_COLOR_GREEN_LO-4;
PresetMode.secondRowButtonColor = PUSH_COLOR_GREEN_LO;

PresetMode.prototype.attachTo = function (aPush)
{
	var self = this;
	
	// - Category
	device.addPresetCategoriesObserver (function ()
	{
		self.categoryProvider.setItems (arguments);
	});
	
	// this allows matching from selection made in DAW (full name)
	device.addPresetCategoryObserver (100, '', function (name)
	{
		self.categoryProvider.setSelectedItemVerbose (name);
	});
	
	// character display
	device.addPresetCategoryObserver (this.presetWidth, '', function (name)
	{
		self.categoryProvider.setSelectedItem (name);
	});
	
	// - Creator
	device.addPresetCreatorsObserver (function ()
	{
		self.creatorProvider.setItems(arguments);
	});
	
	// this allows matching from selection made in DAW (full name)
	device.addPresetCreatorObserver (100, '', function (name)
	{
		self.creatorProvider.setSelectedItemVerbose(name);
	});
	
	// character display
	device.addPresetCreatorObserver (this.presetWidth, '', function (name)
	{
		self.creatorProvider.setSelectedItem(name);
	});
	
	// - Preset
	device.addPresetNameObserver (this.presetWidth, '', function (name)
	{
		self.currentPreset = name;
	});
};

PresetMode.prototype.onValueKnob = function (index, value)
{
	if (this.knobInvalidated)
		return;
	
	this.knobInvalidated = true;
	
	var self = this;
	host.scheduleTask (function ()
	{
		if (value >= 61)
			self.onFirstRow (index);
		else
			self.onSecondRow (index);
		self.knobInvalidated = false;
	}, null, PresetMode.knobDuration - (push.isShiftPressed()) ? 100 : 0);
};

PresetMode.prototype.onFirstRow = function (index)
{
	if (index == 2 || index == 3)
		device.switchToPreviousPresetCategory();
	else if (index == 4 || index == 5)
		device.switchToPreviousPresetCreator();
	else if (index == 6 || index == 7)
		device.switchToPreviousPreset();
};

PresetMode.prototype.onSecondRow = function (index)
{
	if (index == 2 || index == 3)
		device.switchToNextPresetCategory();
	else if (index == 4 || index == 5)
		device.switchToNextPresetCreator();
	else if (index == 6 || index == 7)
		device.switchToNextPreset();
};

PresetMode.prototype.updateDisplay = function ()
{
	var d = push.display;
	
	d.clearColumn (0).setBlock( 0, 0, "Select Preset:").setBlock (3, 0,"Device: " + selectedDevice.name);
	
	var view = this.categoryProvider.getView (4);
	for (var i = 0; i < 4; i++)
	{
		var value = (view[i] != null) ? view[i] : "";
		if (i == 0)
			d.setBlock (i, 1, RIGHT_ARROW + value);
		else
			d.setBlock (i, 1, value);
	}
	
	var view = this.creatorProvider.getView (4);
	for (var i = 0; i < 4; i++)
	{
		var value = (view[i] != null) ? view[i] : "";
		if (i == 0)
			d.setBlock (i, 2, RIGHT_ARROW + value);
		else
			d.setBlock (i, 2, value);
	}

	d.clearColumn(3).setBlock (0, 3, RIGHT_ARROW + this.currentPreset).done (0).done (1).done (2).done (3);
	
	for (var i = 22; i < 28; i++)
		push.setButton (i, PresetMode.firstRowButtonColor);

	for (var i = 104; i < 110; i++)
		push.setButton (i, PresetMode.secondRowButtonColor);
};

function PresetProvider (kind)
{
	this.kind = kind;
	this.items = [];
	this.selectedItem = null;
	this.selectedItemVerbose = null;
	this.selectedIndex = -1;
}

PresetProvider.Kind =
{
	CATEGORY:0,
	CREATOR:1,
	PRESET:2
};

PresetProvider.prototype.getSelectedIndex = function (index)
{
	return this.selectedIndex;
};

PresetProvider.prototype.getSelectedItem = function ()
{
	return this.selectedItem;
};

PresetProvider.prototype.setSelectedItem = function (item)
{
	this.selectedItem = item;
};

PresetProvider.prototype.setSelectedItemVerbose = function (selectedItemVerbose)
{
	this.selectedItemVerbose = selectedItemVerbose;
	this.itemsChanged();
};

PresetProvider.prototype.getView = function (length)
{
	var result = [];
	for (var i = this.selectedIndex; i < this.selectedIndex + length; i++)
		result.push(this.items[i]);
	return result;
};

PresetProvider.prototype.setItems = function (items)
{
	this.items = items;
	this.itemsChanged();
};

PresetProvider.prototype.itemsChanged = function ()
{
	this.selectedIndex = 0;
	
	if (this.items == null)
		return;
		
	var len = this.items.length;
	for (var i = 0; i < len; i++)
	{
		if (this.items[i] == this.selectedItemVerbose) 
		{
			this.selectedIndex = i;
			break;
		}
	}
};
