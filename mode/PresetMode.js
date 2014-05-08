// Written by Michael Schmalle - teotigraphix.com
// (c) 2014
// Licensed under GPLv3 - http://www.gnu.org/licenses/gpl.html

function PresetMode ()
{
	this.id = MODE_PRESET;
	
	this.presetWidth = 16;
	this.knobInvalidated = false;
	
	this.categoryProvider = new PresetProvider(PresetProvider.Kind.CATEGORY);
	this.creatorProvider = new PresetProvider(PresetProvider.Kind.CREATOR);
	//this.presetProvider = new PresetProvider(PresetProvider.Kind.PRESET);
	
	this.currentPreset = null;
	
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

PresetMode.prototype.onActivate = function ()
{
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
	if (index == 2)
		device.switchToPreviousPresetCategory();
	else if (index == 4)
		device.switchToPreviousPresetCreator();
	else if (index == 6)
		device.switchToPreviousPreset();
};

PresetMode.prototype.onSecondRow = function (index)
{
	if (index == 2)
		device.switchToNextPresetCategory();
	else if (index == 4)
		device.switchToNextPresetCreator();
	else if (index == 6)
		device.switchToNextPreset();
};

PresetMode.prototype.updateDisplay = function ()
{
	var d = push.display;
	
	if (selectedDevice.name == 'None')
	{
		d.clear()
		 .setBlock(1, 1, '    Please select').setBlock(1, 2, 'a Device...    ');
		return;
	}		
	
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
	
	for (var i = 20; i < 28; i++)
		push.setButton (i, this.firstRowButtons[i] != null ? PresetMode.firstRowButtonColor : PUSH_COLOR_BLACK);
	
	for (var i = 104; i < 110; i++)
		push.setButton (i, this.secondRowButtons[i] != null ? PresetMode.secondRowButtonColor : PUSH_COLOR_BLACK);
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
