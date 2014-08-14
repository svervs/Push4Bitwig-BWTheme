// Written by Jürgen Moßgraber - mossgrabers.de
//            Michael Schmalle - teotigraphix.com
// (c) 2014
// Licensed under GPLv3 - http://www.gnu.org/licenses/gpl.html

function DeviceMode (model)
{
    AbstractTrackMode.call (this, model);
    this.id = MODE_BANK_DEVICE;
}
DeviceMode.prototype = new AbstractTrackMode ();

DeviceMode.prototype.onValueKnob = function (index, value)
{
    var param = this.model.getCursorDevice ().getFXParam (index);
    param.value = this.surface.changeValue (value, param.value);
    this.model.getCursorDevice ().setParameter (index, param.value);
};

DeviceMode.prototype.onValueKnobTouch = function (index, isTouched) 
{
    if (this.surface.isDeletePressed ())
        this.model.getCursorDevice ().resetParameter (index);
};

DeviceMode.prototype.onFirstRow = function (index)
{
    var device = this.model.getCursorDevice ();
    switch (index)
    {
        case 5:
            if (device.hasPreviousParameterPage ())
                device.previousParameterPage ();
            break;

        case 6:
            if (device.hasNextParameterPage ())
                device.nextParameterPage ();
            break;

        case 7:
            device.toggleEnabledState ();
            break;
    }
};

DeviceMode.prototype.onSecondRow = function (index)
{
    var macro = this.model.getCursorDevice ().getMacro (index);
    if (macro)
        macro.getModulationSource ().toggleIsMapping ();
};

DeviceMode.prototype.updateDisplay = function () 
{
    var d = this.surface.getDisplay ();
    var selectedDevice = this.model.getSelectedDevice ();
    var hasDevice = this.model.hasSelectedDevice ();

    if (hasDevice)
    {
        var cursorDevice = this.model.getCursorDevice ();
        for (var i = 0; i < 8; i++)
        {
            var param = cursorDevice.getFXParam (i);
            var isEmpty = param.name.length == 0;
            d.setCell (0, i, param.name, Display.FORMAT_RAW)
             .setCell (1, i, param.valueStr, Display.FORMAT_RAW);

            if (isEmpty)
                d.clearCell (2, i);
            else
                d.setCell (2, i, param.value, Display.FORMAT_VALUE);
        }

        d.setCell (3, 0, 'Selected', Display.FORMAT_RAW).setCell (3, 1, 'Device: ', Display.FORMAT_RAW)
         .setBlock (3, 1, selectedDevice.name)
         .setCell (3, 4, cursorDevice.getSelectedParameterPageName (), Display.FORMAT_RAW)
         .clearCell (3, 5).clearCell (3, 6);

        if (cursorDevice.hasPreviousParameterPage ())
            d.setCell (3, 5, ' < Prev ', Display.FORMAT_RAW);
        if (cursorDevice.hasNextParameterPage ())
            d.setCell (3, 6, ' Next > ', Display.FORMAT_RAW);

        d.setCell (3, 7, selectedDevice.enabled ? 'Enabled' : 'Disabled').done (3);
    }
    else
        d.clear ().setBlock (1, 1, '    Please select').setBlock (1, 2, 'a Device...    ').clearRow (3);

    d.allDone ();
};

DeviceMode.prototype.updateFirstRow = function ()
{
    var selectedDevice = this.model.getSelectedDevice ();
    if (this.model.hasSelectedDevice ())
    {
        this.surface.setButton (20, PUSH_COLOR_BLACK);
        this.surface.setButton (21, PUSH_COLOR_BLACK);
        this.surface.setButton (22, PUSH_COLOR_BLACK);
        this.surface.setButton (23, PUSH_COLOR_BLACK);
        this.surface.setButton (24, PUSH_COLOR_BLACK);
        this.surface.setButton (25, this.model.getCursorDevice ().hasPreviousParameterPage () ? PUSH_COLOR_ORANGE_HI : PUSH_COLOR_BLACK);
        this.surface.setButton (26, this.model.getCursorDevice ().hasNextParameterPage () ? PUSH_COLOR_ORANGE_HI : PUSH_COLOR_BLACK);
        this.surface.setButton (27, selectedDevice.enabled ? PUSH_COLOR_GREEN_LO : PUSH_COLOR_BLACK);
    }
    else
    {
        for (var i = 0; i < 8; i++)
            this.surface.setButton (20 + i, PUSH_COLOR_BLACK);
    }
};

DeviceMode.prototype.updateSecondRow = function ()
{
    for (var i = 0; i < 8; i++)
        this.surface.setButton (102 + i, this.model.getCursorDevice().isMacroMapping(i) ? PUSH_COLOR_GREEN_HI_FBLINK : PUSH_COLOR_BLACK);
};
