// Written by Jürgen Moßgraber - mossgrabers.de
//            Michael Schmalle - teotigraphix.com
// (c) 2014-2016
// Licensed under LGPLv3 - http://www.gnu.org/licenses/lgpl-3.0.txt

function DeviceModeSelectMode (model)
{
    BaseMode.call (this, model);
    this.id = MODE_DEVICE_MODE_SELECT;
    this.bottomItems = [];
    this.selectedMode = MODE_DEVICE_PARAMS;
}
DeviceModeSelectMode.prototype = new BaseMode ();

DeviceModeSelectMode.prototype.updateDisplay = function ()
{
    this.surface.getDisplay ()
        .clear ()
        .setBlock (1, 0, "Parameter Banks:")
        .setBlock (1, 2, "Device Sections:")
        .setCell (3, 0, 'Device')
        .setCell (3, 1, 'Fixed')
        .setCell (3, 2, 'Direct')
        .setCell (3, 4, 'Expanded')
        .setCell (3, 5, 'Macros')
        .setCell (3, 6, 'Paramtrs')
        .allDone ();
};

DeviceModeSelectMode.prototype.updateFirstRow = function ()
{
    this.surface.setButton (20, this.selectedMode == MODE_DEVICE_PARAMS ? AbstractMode.BUTTON_COLOR_HI : AbstractMode.BUTTON_COLOR_ON);
    this.surface.setButton (21, this.selectedMode == MODE_DEVICE_COMMON || this.selectedMode == MODE_DEVICE_ENVELOPE || this.selectedMode == MODE_DEVICE_MACRO || this.selectedMode == MODE_DEVICE_MODULATE || this.selectedMode == MODE_DEVICE_USER ? AbstractMode.BUTTON_COLOR_HI : AbstractMode.BUTTON_COLOR_ON);
    this.surface.setButton (22, this.selectedMode == MODE_DEVICE_DIRECT ? AbstractMode.BUTTON_COLOR_HI : AbstractMode.BUTTON_COLOR_ON);
    
    this.surface.setButton (23, AbstractMode.BUTTON_COLOR_OFF);

    var cd = this.model.getDevice ();
    this.surface.setButton (24, cd.isExpanded () ? AbstractMode.BUTTON_COLOR_HI : AbstractMode.BUTTON_COLOR_ON);
    this.surface.setButton (25, cd.isMacroSectionVisible () ? AbstractMode.BUTTON_COLOR_HI : AbstractMode.BUTTON_COLOR_ON);
    this.surface.setButton (26, cd.isParameterPageSectionVisible () ? AbstractMode.BUTTON_COLOR_HI : AbstractMode.BUTTON_COLOR_ON);

    this.surface.setButton (27, AbstractMode.BUTTON_COLOR_OFF);
};

DeviceModeSelectMode.prototype.setMode = function (mode)
{
    Config.setDefaultDeviceMode (mode);
    this.selectedMode = mode;
    this.surface.setPendingMode (mode);
};

DeviceModeSelectMode.prototype.onFirstRow = function (index)
{
    switch (index)
    {
        case 0:
            this.setMode (MODE_DEVICE_PARAMS);
            break;
        case 1:
            this.setMode (MODE_DEVICE_COMMON);
            break;
        case 2:
            this.setMode (MODE_DEVICE_DIRECT);
            break;
            
        case 4:
            this.model.getDevice ().toggleExpanded ();
            break;
        case 5:
            this.model.getDevice ().toggleMacroSectionVisible ();
            break;
        case 6:
            this.model.getDevice ().toggleParameterPageSectionVisible ();
            break;
    }
};
