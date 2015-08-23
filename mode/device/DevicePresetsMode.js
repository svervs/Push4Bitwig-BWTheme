// Written by Jürgen Moßgraber - mossgrabers.de
//            Michael Schmalle - teotigraphix.com
// (c) 2014-2015
// Licensed under LGPLv3 - http://www.gnu.org/licenses/lgpl-3.0.txt

DevicePresetsMode.SELECTION_OFF    = 0;
DevicePresetsMode.SELECTION_PRESET = 1;
DevicePresetsMode.SELECTION_FILTER = 2;

DevicePresetsMode.knobDuration = 150;
DevicePresetsMode.firstRowButtonColor = PUSH_COLOR_GREEN_LO;
DevicePresetsMode.secondRowButtonColor = PUSH_COLOR2_GREEN_LO;

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
            this.onFirstRow (index);
        else
            this.onSecondRow (index);
        this.knobInvalidated = false;
    }), null, DevicePresetsMode.knobDuration - (this.surface.isShiftPressed ()) ? 100 : 0);
};

DevicePresetsMode.prototype.onFirstRow = function (index)
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

DevicePresetsMode.prototype.onSecondRow = function (index)
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

DevicePresetsMode.prototype.isPresetSession = function ()
{
    return this.session === this.model.getBrowser ().getPresetSession ();
};

DevicePresetsMode.prototype.updateDisplay = function ()
{
    var d = this.surface.getDisplay ();
    if (this.isPresetSession ())
    {
        if (!this.session.isActive)
        {
            d.clear ().setBlock (1, 1, '   No active Brow').setBlock (1, 2, 'sing Session.')
                      .setBlock (2, 1, '            Press').setBlock (2, 2, 'Browse...').allDone ();
            return;
        }
        if (!this.model.hasSelectedDevice ())
        {
            d.clear ().setBlock (1, 1, '    Please select').setBlock (1, 2, 'a Device...    ').allDone ();
            return;
        }
    }

    d.clear ();

    switch (this.selectionMode)
    {
        case DevicePresetsMode.SELECTION_OFF:
            var selectedResult = this.session.getSelectedResult ();
            d.setBlock (0, 0, this.isPresetSession () ? "Preset:" : "Device")
             .setBlock (1, 0, selectedResult == null ? "None" : selectedResult)
             .setBlock (3, 0, "Selected Device:")
             .setBlock (3, 1, this.model.getSelectedDevice ().name);
            for (var i = 0; i < 6; i++)
            {
                var column = this.session.getFilterColumn (i);
                d.setCell (0, 2 + i, optimizeName (column.name + ":", 8))
                 .setCell (1, 2 + i, column.cursorExists ? column.cursorName : '');
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

DevicePresetsMode.prototype.updateFirstRow = function ()
{
    for (var i = 20; i < 28; i++)
        this.surface.setButton (i, DevicePresetsMode.firstRowButtonColor);
};

DevicePresetsMode.prototype.updateSecondRow = function ()
{
    for (var i = 102; i < 110; i++)
        this.surface.setButton (i, DevicePresetsMode.secondRowButtonColor);
};
