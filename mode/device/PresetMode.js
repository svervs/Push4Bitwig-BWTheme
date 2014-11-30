// Written by Jürgen Moßgraber - mossgrabers.de
//            Michael Schmalle - teotigraphix.com
// (c) 2014
// Licensed under LGPLv3 - http://www.gnu.org/licenses/lgpl-3.0.txt

PresetMode.SELECTION_OFF      = 0;
PresetMode.SELECTION_PRESET   = 1;
PresetMode.SELECTION_CATEGORY = 2;
PresetMode.SELECTION_CREATOR  = 3;

function PresetMode (model)
{
    BaseMode.call (this, model);
    this.id = MODE_PRESET;
    this.isTemporary = false;

    this.knobInvalidated = false;
    this.selectionMode = PresetMode.SELECTION_OFF;
    
    this.activeButtons = [];
    this.activeButtons[20] = {};
    this.activeButtons[22] = {};
    this.activeButtons[24] = {};
    this.activeButtons[102] = {};
    this.activeButtons[104] = {};
    this.activeButtons[106] = {};
}
PresetMode.prototype = new BaseMode ();

PresetMode.knobDuration = 150;
PresetMode.firstRowButtonColor = PUSH_COLOR_GREEN_LO;
PresetMode.secondRowButtonColor = PUSH_COLOR2_GREEN_LO;

PresetMode.prototype.onValueKnobTouch = function (index, isTouched)
{
    if (!isTouched)
    {
        this.selectionMode = PresetMode.SELECTION_OFF;
        return;
    }
    switch (index)
    {
        case 0:
            this.selectionMode = PresetMode.SELECTION_PRESET;
            break;
        case 2:
            this.selectionMode = PresetMode.SELECTION_CATEGORY;
            break;
        case 4:
            this.selectionMode = PresetMode.SELECTION_CREATOR;
            break;
    }
};

PresetMode.prototype.onValueKnob = function (index, value)
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
    }), null, PresetMode.knobDuration - (this.surface.isShiftPressed ()) ? 100 : 0);
};

PresetMode.prototype.onFirstRow = function (index)
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

PresetMode.prototype.onSecondRow = function (index)
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

PresetMode.prototype.updateDisplay = function ()
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
        case PresetMode.SELECTION_OFF:
            d.setBlock (0, 0, "Preset:")
             .setBlock (0, 1, "Category:")
             .setBlock (0, 2, "Creator:")
             .setBlock (0, 3, "Device:")
             .setBlock (1, 0, cd.presetProvider.getSelectedItem ())
             .setBlock (1, 1, cd.categoryProvider.getSelectedItem ())
             .setBlock (1, 2, cd.creatorProvider.getSelectedItem ())
             .setBlock (1, 3, this.model.getSelectedDevice ().name);
            break;
        case PresetMode.SELECTION_PRESET:
            // Preset column
            var view = cd.presetProvider.getPagedView (16);
            var selPos = cd.presetProvider.getSelectedIndex () % 16;
            for (var i = 0; i < 16; i++)
                d.setBlock (i % 4, Math.floor (i / 4), (i == selPos ? Display.RIGHT_ARROW : ' ') + (view[i] != null ? view[i] : ""));
            break;
        case PresetMode.SELECTION_CATEGORY:
            // Categories column
            var view = cd.categoryProvider.getPagedView (12);
            var selPos = cd.categoryProvider.getSelectedIndex () % 12;
            for (var i = 0; i < 12; i++)
                d.setBlock (i % 4, 1 + Math.floor (i / 4), (i == selPos ? Display.RIGHT_ARROW : ' ') + (view[i] != null ? view[i] : ""));
            break;
        case PresetMode.SELECTION_CREATOR:
            // Creator column
            var view = cd.creatorProvider.getPagedView (8);
            var selPos = cd.creatorProvider.getSelectedIndex () % 8;
            for (var i = 0; i < 8; i++)
                d.setBlock (i % 4, 2 + Math.floor (i / 4), (i == selPos ? Display.RIGHT_ARROW : ' ') + (view[i] != null ? view[i] : ""));
            break;
    }
    d.allDone ();
};

PresetMode.prototype.updateFirstRow = function ()
{
    for (var i = 20; i < 28; i++)
        this.surface.setButton (i, this.activeButtons[i] != null ? PresetMode.firstRowButtonColor : PUSH_COLOR_BLACK);
};

PresetMode.prototype.updateSecondRow = function ()
{
    for (var i = 102; i < 110; i++)
        this.surface.setButton (i, this.activeButtons[i] != null ? PresetMode.secondRowButtonColor : PUSH_COLOR_BLACK);
};
