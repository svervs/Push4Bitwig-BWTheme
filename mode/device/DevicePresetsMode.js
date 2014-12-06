// Written by Jürgen Moßgraber - mossgrabers.de
//            Michael Schmalle - teotigraphix.com
// (c) 2014
// Licensed under LGPLv3 - http://www.gnu.org/licenses/lgpl-3.0.txt

DevicePresetsMode.SELECTION_OFF      = 0;
DevicePresetsMode.SELECTION_PRESET   = 1;
DevicePresetsMode.SELECTION_CATEGORY = 2;
DevicePresetsMode.SELECTION_CREATOR  = 3;

function DevicePresetsMode (model)
{
    BaseMode.call (this, model);
    this.id = MODE_DEVICE_PRESETS;
    this.isTemporary = false;

    this.knobInvalidated = false;
    this.selectionMode = DevicePresetsMode.SELECTION_OFF;
    
    this.activeButtons = [];
    this.activeButtons[20] = {};
    this.activeButtons[22] = {};
    this.activeButtons[24] = {};
    this.activeButtons[102] = {};
    this.activeButtons[104] = {};
    this.activeButtons[106] = {};
}
DevicePresetsMode.prototype = new BaseMode ();

DevicePresetsMode.knobDuration = 150;
DevicePresetsMode.firstRowButtonColor = PUSH_COLOR_GREEN_LO;
DevicePresetsMode.secondRowButtonColor = PUSH_COLOR2_GREEN_LO;

DevicePresetsMode.prototype.onValueKnobTouch = function (index, isTouched)
{
    if (!isTouched)
    {
        this.selectionMode = DevicePresetsMode.SELECTION_OFF;
        return;
    }
    switch (index)
    {
        case 0:
            this.selectionMode = DevicePresetsMode.SELECTION_PRESET;
            break;
        case 2:
            this.selectionMode = DevicePresetsMode.SELECTION_CATEGORY;
            break;
        case 4:
            this.selectionMode = DevicePresetsMode.SELECTION_CREATOR;
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
            this.onFirstRow (index);
        else
            this.onSecondRow (index);
        this.knobInvalidated = false;
    }), null, DevicePresetsMode.knobDuration - (this.surface.isShiftPressed ()) ? 100 : 0);
};

DevicePresetsMode.prototype.onFirstRow = function (index)
{
    var device = this.model.getCursorDevice ();
    var count = this.surface.isShiftPressed () ? 4 : 1;
    for (var i = 0; i < count; i++)
    {
        if (index == 0)
            device.switchToPreviousPreset ();
        else if (index == 2)
            device.switchToPreviousPresetCategory ();
        else if (index == 4)
            device.switchToPreviousPresetCreator ();
    }
};

DevicePresetsMode.prototype.onSecondRow = function (index)
{
    var device = this.model.getCursorDevice ();
    var count = this.surface.isShiftPressed () ? 4 : 1;
    for (var i = 0; i < count; i++)
    {
        if (index == 0)
            device.switchToNextPreset ();
        else if (index == 2)
            device.switchToNextPresetCategory ();
        else if (index == 4)
            device.switchToNextPresetCreator ();
    }
};

DevicePresetsMode.prototype.updateDisplay = function ()
{
    var d = this.surface.getDisplay ();
    if (!this.model.hasSelectedDevice ())
    {
        d.clear ().setBlock (1, 1, '    Please select').setBlock (1, 2, 'a Device...    ').allDone ();
        return;
    }

    var cd = this.model.getCursorDevice ();
    d.clear ();

    switch (this.selectionMode)
    {
        case DevicePresetsMode.SELECTION_OFF:
            d.setBlock (0, 0, "Preset:")
             .setBlock (0, 1, "Category:")
             .setBlock (0, 2, "Creator:")
             .setBlock (0, 3, "Device:")
             .setBlock (1, 0, cd.presetProvider.getSelectedItem ())
             .setBlock (1, 1, cd.categoryProvider.getSelectedItem ())
             .setBlock (1, 2, cd.creatorProvider.getSelectedItem ())
             .setBlock (1, 3, this.model.getSelectedDevice ().name);
            break;
        case DevicePresetsMode.SELECTION_PRESET:
            // Preset column
            var view = cd.presetProvider.getPagedView (16);
            var selPos = cd.presetProvider.getSelectedIndex () % 16;
            for (var i = 0; i < 16; i++)
                d.setBlock (i % 4, Math.floor (i / 4), (i == selPos ? Display.RIGHT_ARROW : ' ') + (view[i] != null ? view[i] : ""));
            break;
        case DevicePresetsMode.SELECTION_CATEGORY:
            // Categories column
            var view = cd.categoryProvider.getPagedView (12);
            var selPos = cd.categoryProvider.getSelectedIndex () % 12;
            for (var i = 0; i < 12; i++)
                d.setBlock (i % 4, 1 + Math.floor (i / 4), (i == selPos ? Display.RIGHT_ARROW : ' ') + (view[i] != null ? view[i] : ""));
            break;
        case DevicePresetsMode.SELECTION_CREATOR:
            // Creator column
            var view = cd.creatorProvider.getPagedView (8);
            var selPos = cd.creatorProvider.getSelectedIndex () % 8;
            for (var i = 0; i < 8; i++)
                d.setBlock (i % 4, 2 + Math.floor (i / 4), (i == selPos ? Display.RIGHT_ARROW : ' ') + (view[i] != null ? view[i] : ""));
            break;
    }
    d.allDone ();
};

DevicePresetsMode.prototype.updateFirstRow = function ()
{
    for (var i = 20; i < 28; i++)
        this.surface.setButton (i, this.activeButtons[i] != null ? DevicePresetsMode.firstRowButtonColor : PUSH_COLOR_BLACK);
};

DevicePresetsMode.prototype.updateSecondRow = function ()
{
    for (var i = 102; i < 110; i++)
        this.surface.setButton (i, this.activeButtons[i] != null ? DevicePresetsMode.secondRowButtonColor : PUSH_COLOR_BLACK);
};
