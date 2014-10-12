// Written by Jürgen Moßgraber - mossgrabers.de
//            Michael Schmalle - teotigraphix.com
// (c) 2014
// Licensed under LGPLv3 - http://www.gnu.org/licenses/lgpl-3.0.txt

function PresetMode (model)
{
    BaseMode.call (this, model);
    this.id = MODE_PRESET;

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
PresetMode.firstRowButtonColor = PUSH_COLOR_GREEN_LO;
PresetMode.secondRowButtonColor = PUSH_COLOR2_GREEN_LO;

PresetMode.prototype.onActivate = function ()
{
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
        if (index == 2)
            device.switchToPreviousPresetCategory ();
        else if (index == 4)
            device.switchToPreviousPresetCreator ();
        else if (index == 6)
            device.switchToPreviousPreset ();
    }
};

PresetMode.prototype.onSecondRow = function (index)
{
    var device = this.model.getCursorDevice ();
    var count = this.surface.isShiftPressed () ? 4 : 1;
    for (var i = 0; i < count; i++)
    {
        if (index == 2)
            device.switchToNextPresetCategory ();
        else if (index == 4)
            device.switchToNextPresetCreator ();
        else if (index == 6)
            device.switchToNextPreset ();
    }
};

PresetMode.prototype.updateDisplay = function ()
{
    var d = this.surface.getDisplay ();
    var cd = this.model.getCursorDevice ();

    if (!this.model.hasSelectedDevice ())
    {
        d.clear ()
         .setBlock (1, 1, '    Please select').setBlock (1, 2, 'a Device...    ')
         .allDone ();
        return;
    }

    d.clearColumn (0).setBlock ( 0, 0, "Select Preset:")
     .setBlock (3, 0, "Device: " + this.model.getSelectedDevice ().name);
    
    // Categories column
    var view = cd.categoryProvider.getView (4);
    for (var i = 0; i < 4; i++)
        d.setBlock (i, 1, (i == 0 ? Display.RIGHT_ARROW : ' ') + (view[i] != null ? view[i] : ""));
    
    // Creator column
    view = cd.creatorProvider.getView (4);
    for (var i = 0; i < 4; i++)
        d.setBlock (i, 2, (i == 0 ? Display.RIGHT_ARROW : ' ') + (view[i] != null ? view[i] : ""));

    // Creator column
    view = cd.presetProvider.getView (4);
    for (var i = 0; i < 4; i++)
        d.setBlock (i, 3, (i == 0 ? Display.RIGHT_ARROW : ' ') + (view[i] != null ? view[i] : ""));
        
    d.allDone ();
};

PresetMode.prototype.updateFirstRow = function ()
{
    for (var i = 20; i < 28; i++)
        this.surface.setButton (i, this.firstRowButtons[i] != null ? PresetMode.firstRowButtonColor : PUSH_COLOR_BLACK);
};

PresetMode.prototype.updateSecondRow = function ()
{
    for (var i = 102; i < 110; i++)
        this.surface.setButton (i, this.secondRowButtons[i] != null ? PresetMode.secondRowButtonColor : PUSH_COLOR_BLACK);
};
