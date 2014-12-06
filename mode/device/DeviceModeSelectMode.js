// Written by Jürgen Moßgraber - mossgrabers.de
//            Michael Schmalle - teotigraphix.com
// (c) 2014
// Licensed under LGPLv3 - http://www.gnu.org/licenses/lgpl-3.0.txt

DeviceModeSelectMode.firstRowButtonColorUp = PUSH_COLOR_GREEN_LO;
DeviceModeSelectMode.firstRowButtonColorSelected = PUSH_COLOR_YELLOW_LO;


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
    this.surface.setButton (20, this.selectedMode == MODE_DEVICE_PARAMS ? DeviceModeSelectMode.firstRowButtonColorSelected : DeviceModeSelectMode.firstRowButtonColorUp);
    this.surface.setButton (21, this.selectedMode == MODE_DEVICE_COMMON ? DeviceModeSelectMode.firstRowButtonColorSelected : DeviceModeSelectMode.firstRowButtonColorUp);
    this.surface.setButton (22, this.selectedMode == MODE_DEVICE_DIRECT ? DeviceModeSelectMode.firstRowButtonColorSelected : DeviceModeSelectMode.firstRowButtonColorUp);
    
    this.surface.setButton (23, PUSH_COLOR_BLACK);

    var cd = this.model.getCursorDevice ();
    this.surface.setButton (24, cd.isExpanded () ? DeviceModeSelectMode.firstRowButtonColorSelected : DeviceModeSelectMode.firstRowButtonColorUp);
    this.surface.setButton (25, cd.isMacroSectionVisible () ? DeviceModeSelectMode.firstRowButtonColorSelected : DeviceModeSelectMode.firstRowButtonColorUp);
    this.surface.setButton (26, cd.isParameterPageSectionVisible () ? DeviceModeSelectMode.firstRowButtonColorSelected : DeviceModeSelectMode.firstRowButtonColorUp);

    this.surface.setButton (27, PUSH_COLOR_BLACK);
};

DeviceModeSelectMode.prototype.setMode = function (mode)
{
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
            this.model.getCursorDevice ().toggleExpanded ();
            break;
        case 5:
            this.model.getCursorDevice ().toggleMacroSectionVisible ();
            break;
        case 6:
            this.model.getCursorDevice ().toggleParameterPageSectionVisible ();
            break;
    }
};
