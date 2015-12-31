// Written by Jürgen Moßgraber - mossgrabers.de
//            Michael Schmalle - teotigraphix.com
// (c) 2014-2015
// Licensed under LGPLv3 - http://www.gnu.org/licenses/lgpl-3.0.txt

DevicePresetsMode.SELECTION_OFF    = 0;
DevicePresetsMode.SELECTION_PRESET = 1;
DevicePresetsMode.SELECTION_FILTER = 2;

DevicePresetsMode.FILTER_ALL_PRESET_NAMES = [ "AllPresetLocatio", "Everything", "Any Creator", "Any Tags", "All Devices", "Any Category" ];
DevicePresetsMode.FILTER_ALL_DEVICE_NAMES = [ "AllDeviceLocatio", "Everything", "Any Creator", "Any Tags", "Any Category", "Any Device Type" ];

DevicePresetsMode.knobDuration = 150;

function DevicePresetsMode (model)
{
    BaseMode.call (this, model);
    this.id = MODE_DEVICE_PRESETS;
    this.isTemporary = false;

    this.knobInvalidated = false;
    this.selectionMode = DevicePresetsMode.SELECTION_OFF;
    this.filterColumn = -1;
    
    this.session = null;
}
DevicePresetsMode.prototype = new BaseMode ();

DevicePresetsMode.prototype.setSession = function (session)
{
    this.session = session;
};

DevicePresetsMode.prototype.onDeactivate = function () 
{
    this.model.getBrowser ().stopBrowsing (true);
};

DevicePresetsMode.prototype.onValueKnobTouch = function (index, isTouched)
{
    this.isKnobTouched[index] = isTouched;
    
    if (!isTouched)
    {
        this.selectionMode = DevicePresetsMode.SELECTION_OFF;
        return;
    }
    switch (index)
    {
        case 0:
        case 1:
            this.selectionMode = DevicePresetsMode.SELECTION_PRESET;
            this.filterColumn = -1;
            break;
        default:
            this.selectionMode = DevicePresetsMode.SELECTION_FILTER;
            this.filterColumn = index - 2;
            break;
    }
};

DevicePresetsMode.prototype.onValueKnob = function (index, value)
{
    if (this.knobInvalidated)
        return;
    
    this.knobInvalidated = true;

    scheduleTask (doObject (this, function ()
    {
        if (value >= 61)
            this.selectPrevious (index);
        else
            this.selectNext (index);
        this.knobInvalidated = false;
    }), null, DevicePresetsMode.knobDuration - (this.surface.isShiftPressed ()) ? 100 : 0);
};

DevicePresetsMode.prototype.onFirstRow = function (index, dontRedirect)
{
    if (Config.isPush2)
        this.selectNext (index);
    else
        this.selectPrevious (index);
};

DevicePresetsMode.prototype.onSecondRow = function (index, dontRedirect)
{
    if (Config.isPush2)
        this.selectPrevious (index);
    else
        this.selectNext (index);
};
  
DevicePresetsMode.prototype.selectNext = function (index)    
{
    var count = this.surface.isShiftPressed () ? 4 : 1;
    for (var i = 0; i < count; i++)
    {
        if (index < 2)
        {
            this.session.selectNextResult ();
            if (this.session.getSelectedResultIndex () == this.session.numResults - 1)
                this.session.nextResultPage ();
        }
        else
        {
            this.filterColumn = index - 2;
            this.session.selectNextFilterItem (this.filterColumn);
            if (this.session.getSelectedFilterItemIndex (this.filterColumn) == this.session.numFilterColumnEntries - 1)
                this.session.nextFilterItemPage (this.filterColumn);
        }
    }
};


DevicePresetsMode.prototype.selectPrevious = function (index)    
{
    var count = this.surface.isShiftPressed () ? 4 : 1;
    for (var i = 0; i < count; i++)
    {
        if (index < 2)
        {
            this.session.selectPreviousResult ();
            if (this.session.getSelectedResultIndex () == 0)
                this.session.previousResultPage ();
        }
        else
        {
            this.filterColumn = index - 2;
            this.session.selectPreviousFilterItem (this.filterColumn);
            if (this.session.getSelectedFilterItemIndex (this.filterColumn) == 0)
                this.session.previousFilterItemPage (this.filterColumn);
        }
    }
};


DevicePresetsMode.prototype.isPresetSession = function ()
{
    return this.session === this.model.getBrowser ().getPresetSession ();
};

DevicePresetsMode.prototype.updateDisplay = function ()
{
    if (Config.isPush2)
    {
        this.updateDisplayPush2 ();
        return;
    }
    
    var d = this.surface.getDisplay ();
    if (this.isPresetSession ())
    {
        if (!this.session.isActive || !this.model.getDevice ().hasSelectedDevice ())
        {
            d.clear ().setBlock (1, 1, '   No active Brow').setBlock (1, 2, 'sing Session.')
                      .setBlock (2, 1, 'Select device and').setBlock (2, 2, 'press Browse...').allDone ();
            return;
        }
    }

    d.clear ();

    switch (this.selectionMode)
    {
        case DevicePresetsMode.SELECTION_OFF:
            var selectedResult = this.session.getSelectedResult ();
            d.setBlock (0, 0, this.isPresetSession () ? "Preset" : "Device")
             .setBlock (1, 0, selectedResult == null ? "None" : selectedResult)
             .setBlock (3, 0, "Selected Device:")
             .setBlock (3, 1, this.model.getSelectedDevice ().name);
            var allNames = this.isPresetSession () ? DevicePresetsMode.FILTER_ALL_PRESET_NAMES : DevicePresetsMode.FILTER_ALL_DEVICE_NAMES;
            for (var i = 0; i < 6; i++)
            {
                var column = this.session.getFilterColumn (i);
                d.setCell (0, 2 + i, optimizeName (column.name, 8))
                 .setCell (1, 2 + i, column.cursorExists ? (column.cursorName == allNames[i] ? '-' : column.cursorName) : '');
            }
            break;

        case DevicePresetsMode.SELECTION_PRESET:
            var results = this.session.getResultColumn ();
            for (var i = 0; i < 16; i++)
                d.setBlock (i % 4, Math.floor (i / 4), (results[i].isSelected ? Display.RIGHT_ARROW : ' ') + results[i].name);
            break;

        case DevicePresetsMode.SELECTION_FILTER:
            var items = this.session.getFilterColumn (this.filterColumn).items;
            for (var i = 0; i < 16; i++)
            {
                var text = (items[i].isSelected ? Display.RIGHT_ARROW : ' ') + items[i].name + '                ';
                if (items[i].name.length > 0)
                {
                    var hitStr = "(" + items[i].hits + ")";
                    text = text.substr (0, 17 - hitStr.length) + hitStr;
                }
                d.setBlock (i % 4, Math.floor (i / 4), text);
            }
            break;
    }
    d.allDone ();
};

DevicePresetsMode.prototype.updateDisplayPush2 = function ()
{
    var d = this.surface.getDisplay ();
    
    var message = d.createMessage (DisplayMessage.DISPLAY_COMMAND_GRID);
    
    if (this.isPresetSession ())
    {
        if (!this.session.isActive || !this.model.getDevice ().hasSelectedDevice ())
        {
            DisplayMessage.sendMessage (1, "No active Browsing Session. Select a device and press Browse...");
            return;
        }
    }
    
    switch (this.selectionMode)
    {
        case DevicePresetsMode.SELECTION_OFF:
            var selectedResult = this.session.getSelectedResult ();
            
            message.addOptionElement (selectedResult == null ? "None" : selectedResult, this.isPresetSession () ? "Preset" : "Device", false, "Selected Device: " + this.model.getSelectedDevice ().name, "", false);
            message.addOptionElement ("", "", false, "", "", false);

            var allNames = this.isPresetSession () ? DevicePresetsMode.FILTER_ALL_PRESET_NAMES : DevicePresetsMode.FILTER_ALL_DEVICE_NAMES;
            for (var i = 0; i < 6; i++)
            {
                var column = this.session.getFilterColumn (i);
                message.addOptionElement ("", column.name, false, "", column.cursorExists ? (column.cursorName == allNames[i] ? ' ' : column.cursorName) : '', true);
            }
            break;

        case DevicePresetsMode.SELECTION_PRESET:
            var results = this.session.getResultColumn ();
            for (var i = 0; i < 8; i++)
            {
                message.addByte (DisplayMessage.GRID_ELEMENT_LIST);
                for (var item = 0; item < 6; item++)
                {
                    var pos = i * 6 + item;
                    message.addString (results[pos].name);
                    message.addBoolean (results[pos].isSelected);
                }
            }
            break;

        case DevicePresetsMode.SELECTION_FILTER:
            var items = this.session.getFilterColumn (this.filterColumn).items;
            for (var i = 0; i < 8; i++)
            {
                message.addByte (DisplayMessage.GRID_ELEMENT_LIST);
                for (var item = 0; item < 6; item++)
                {
                    var pos = i * 6 + item;
                    var text = optimizeName (items[pos].name, 10);
                    if (items[pos].name.length > 0)
                        text = text + " (" + items[pos].hits + ")";
                    message.addString (text);
                    message.addBoolean (items[pos].isSelected);
                }
            }
            break;
    }
    
    message.send ();
    
};

DevicePresetsMode.prototype.updateFirstRow = function ()
{
    for (var i = 20; i < 28; i++)
        this.surface.setButton (i, i == 21 ? AbstractMode.BUTTON_COLOR_OFF : AbstractMode.BUTTON_COLOR_ON);
};

DevicePresetsMode.prototype.updateSecondRow = function ()
{
    for (var i = 102; i < 110; i++)
        this.surface.setButton (i, i == 103 ? AbstractMode.BUTTON_COLOR_OFF : AbstractMode.BUTTON_COLOR2_ON);
};
