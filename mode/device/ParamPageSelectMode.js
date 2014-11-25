// Written by Jürgen Moßgraber - mossgrabers.de
//            Michael Schmalle - teotigraphix.com
// (c) 2014
// Licensed under LGPLv3 - http://www.gnu.org/licenses/lgpl-3.0.txt

ParamPageSelectMode.firstRowButtonColorUp = PUSH_COLOR_GREEN_LO;
ParamPageSelectMode.firstRowButtonColorSelected = PUSH_COLOR_YELLOW_LO;


function ParamPageSelectMode (model)
{
    BaseMode.call (this, model);
    this.id = MODE_PARAM_PAGE_SELECT;
    this.bottomItems = [];
    this.selectedMode = MODE_BANK_DEVICE;
}
ParamPageSelectMode.prototype = new BaseMode ();

ParamPageSelectMode.prototype.updateDisplay = function ()
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

ParamPageSelectMode.prototype.updateFirstRow = function ()
{
    this.surface.setButton (20, this.selectedMode == MODE_BANK_DEVICE ? ParamPageSelectMode.firstRowButtonColorSelected : ParamPageSelectMode.firstRowButtonColorUp);
    this.surface.setButton (21, this.selectedMode == MODE_BANK_COMMON ? ParamPageSelectMode.firstRowButtonColorSelected : ParamPageSelectMode.firstRowButtonColorUp);
    this.surface.setButton (22, this.selectedMode == MODE_BANK_DIRECT ? ParamPageSelectMode.firstRowButtonColorSelected : ParamPageSelectMode.firstRowButtonColorUp);
    
    this.surface.setButton (23, PUSH_COLOR_BLACK);

    var cd = this.model.getCursorDevice ();
    this.surface.setButton (24, cd.isExpanded () ? ParamPageSelectMode.firstRowButtonColorSelected : ParamPageSelectMode.firstRowButtonColorUp);
    this.surface.setButton (25, cd.isMacroSectionVisible () ? ParamPageSelectMode.firstRowButtonColorSelected : ParamPageSelectMode.firstRowButtonColorUp);
    this.surface.setButton (26, cd.isParameterPageSectionVisible () ? ParamPageSelectMode.firstRowButtonColorSelected : ParamPageSelectMode.firstRowButtonColorUp);

    this.surface.setButton (27, PUSH_COLOR_BLACK);
};

ParamPageSelectMode.prototype.setMode = function (mode)
{
    this.selectedMode = mode;
    this.surface.setPendingMode (mode);
};

ParamPageSelectMode.prototype.onFirstRow = function (index)
{
    switch (index)
    {
        case 0:
            this.setMode (MODE_BANK_DEVICE);
            break;
        case 1:
            this.setMode (MODE_BANK_COMMON);
            break;
        case 2:
            this.setMode (MODE_BANK_DIRECT);
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
