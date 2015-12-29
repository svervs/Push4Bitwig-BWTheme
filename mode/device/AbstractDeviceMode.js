// Written by Jürgen Moßgraber - mossgrabers.de
//            Michael Schmalle - teotigraphix.com
// (c) 2014-2015
// Licensed under LGPLv3 - http://www.gnu.org/licenses/lgpl-3.0.txt

// The base class for all device editing modes
function AbstractDeviceMode (model)
{
    BaseMode.call (this, model);
    if (!model)
        return;
    
    this.isTemporary = false;
    this.showDevices = true;
    this.cursorDevice = this.model.getCursorDevice ();
    
    this.menu = [ "On", "Device", "Fixed", "Direct", "Expanded", "Macros", "Parameters", "Window" ];
}
AbstractDeviceMode.prototype = new BaseMode ();

AbstractDeviceMode.prototype.setShowDevices = function (enable)
{
    this.showDevices = enable;
};

// Abstract functions
AbstractDeviceMode.prototype.updateParameters = function (display) {};
AbstractDeviceMode.prototype.calcBank = function () { return null; };
AbstractDeviceMode.prototype.hasPreviousPage = function () { return false; };
AbstractDeviceMode.prototype.hasNextPage = function () { return false; };
AbstractDeviceMode.prototype.previousPage = function () {};
AbstractDeviceMode.prototype.nextPage = function () {};
AbstractDeviceMode.prototype.previousPageBank = function () {};
AbstractDeviceMode.prototype.nextPageBank = function () {};
AbstractDeviceMode.prototype.onFirstRowBank = function (index) {};
AbstractDeviceMode.prototype.updateFirstRowBank = function () {};

AbstractDeviceMode.prototype.canSelectPreviousPage = function ()
{
    return this.showDevices ? this.cursorDevice.canSelectPreviousFX () : this.hasPreviousPage ();
};
 
AbstractDeviceMode.prototype.canSelectNextPage = function ()
{
    return this.showDevices ? this.cursorDevice.canSelectNextFX () : this.hasNextPage ();
};

AbstractDeviceMode.prototype.selectPreviousPage = function ()
{
    if (this.showDevices)
        this.cursorDevice.selectPrevious ();
    else
        this.previousPage ();
};

AbstractDeviceMode.prototype.selectNextPage = function ()
{
    if (this.showDevices)
        this.cursorDevice.selectNext ();
    else
        this.nextPage ();
};

AbstractDeviceMode.prototype.selectPreviousPageBank = function ()
{
    if (this.showDevices)
        this.cursorDevice.selectPreviousBank ();
    else
        this.previousPageBank ();
};

AbstractDeviceMode.prototype.selectNextPageBank = function ()
{
    if (this.showDevices)
        this.cursorDevice.selectNextBank ();
    else
        this.nextPageBank ();
};

AbstractDeviceMode.prototype.onFirstRow = function (index)
{
    if (!this.model.hasSelectedDevice ())
        return;
    if (this.showDevices)
        this.cursorDevice.selectSibling (index);
    else
        this.onFirstRowBank (index);
};

AbstractDeviceMode.prototype.updateFirstRow = function ()
{
    if (!this.model.hasSelectedDevice ())
    {
        this.disableFirstRow ();
        return;
    }
    
    if (this.showDevices)
    {
        var bank = this.calcDeviceBank ();
        for (var i = 0; i < 8; i++)
            this.surface.setButton (20 + i, i < bank.pages.length && bank.pages[i].length > 0 ? (i == bank.page ? PUSH_COLOR_ORANGE_HI : PUSH_COLOR_YELLOW_LO) : PUSH_COLOR_BLACK);
    }
    else
        this.updateFirstRowBank ();
};

AbstractDeviceMode.prototype.onSecondRow = function (index)
{
    if (!this.model.hasSelectedDevice ())
        return;
    switch (index)
    {
        case 0:
            this.cursorDevice.toggleEnabledState ();
            break;
        case 1:
            this.surface.getMode (MODE_DEVICE_MODE_SELECT).setMode (MODE_DEVICE_PARAMS);
            break;
        case 2:
            this.surface.getMode (MODE_DEVICE_MODE_SELECT).setMode (MODE_DEVICE_COMMON);
            break;
        case 3:
            this.surface.getMode (MODE_DEVICE_MODE_SELECT).setMode (MODE_DEVICE_DIRECT);
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
        case 7:
            this.cursorDevice.toggleWindowOpen ();
            break;
    }
};

AbstractDeviceMode.prototype.updateSecondRow = function ()
{
    if (!this.model.hasSelectedDevice ())
    {
        this.disableSecondRow ();
        return;
    }
    var selDevice = this.model.getSelectedDevice ();
    this.surface.setButton (102, selDevice.enabled ? PUSH_COLOR2_GREEN : PUSH_COLOR2_GREY_LO);
    
    var cd = this.model.getCursorDevice ();
    var selectedMode = this.surface.getMode (MODE_DEVICE_MODE_SELECT).selectedMode;
    
    this.surface.setButton (103, selectedMode == MODE_DEVICE_PARAMS ? PUSH_COLOR2_WHITE : PUSH_COLOR_BLACK);
    this.surface.setButton (104, selectedMode == MODE_DEVICE_COMMON || selectedMode == MODE_DEVICE_ENVELOPE || selectedMode == MODE_DEVICE_MACRO || selectedMode == MODE_DEVICE_MODULATE || selectedMode == MODE_DEVICE_USER ? PUSH_COLOR2_WHITE : PUSH_COLOR_BLACK);
    this.surface.setButton (105, selectedMode == MODE_DEVICE_DIRECT ? PUSH_COLOR2_WHITE : PUSH_COLOR_BLACK);
    
    this.surface.setButton (106, cd.isExpanded () ? PUSH_COLOR2_WHITE : PUSH_COLOR_BLACK);
    this.surface.setButton (107, cd.isMacroSectionVisible () ? PUSH_COLOR2_WHITE : PUSH_COLOR_BLACK);
    this.surface.setButton (108, cd.isParameterPageSectionVisible () ? PUSH_COLOR2_WHITE : PUSH_COLOR_BLACK);
    
    this.surface.setButton (109, selDevice.isPlugin ? (this.cursorDevice.isWindowOpen () ? PUSH_COLOR2_TURQUOISE_HI : PUSH_COLOR2_GREY_LO) : PUSH_COLOR2_BLACK);
};

AbstractDeviceMode.prototype.updateDisplay = function () 
{
    if (Config.isPush2)
    {
        this.updateDisplay2 ();
        return;
    }
    
    var d = this.surface.getDisplay ();
    d.clear ();
    
    if (!this.model.hasSelectedDevice ())
    {
        // TODO Improve: Check if there is a selected track, check if it has devices, display them
        
        d.setBlock (1, 1, '    Please select').setBlock (1, 2, 'a device...    ').allDone ();
        return;
    }

    // Row 1 & 2
    this.updateParameters (d);
    
    // Row 3
    d.setBlock (2, 0, 'Selected Device:').setBlock (2, 1, this.model.getSelectedDevice ().name);
    
    // Row 4
    if (this.showDevices)
        this.drawBanks (d, this.calcDeviceBank ());
    else
        this.updateBanks (d);

    d.allDone ();
};

AbstractDeviceMode.prototype.updateDisplay2 = function () 
{
    if (!this.model.hasSelectedDevice ())
    {
        // TODO Improve: Check if there is a selected track, check if it has devices, display them
        
        DisplayMessage.sendMessage (3, 'Please select a device...');
        return;
    }

    var banks = this.showDevices ? this.getBanks (d, this.calcDeviceBank ()) : this.updateBanks (d);
    var selDevice = this.model.getSelectedDevice ();
    var selectedMode = this.surface.getMode (MODE_DEVICE_MODE_SELECT).selectedMode;
    var tb = this.model.getCurrentTrackBank ();
    var selectedTrack = tb.getSelectedTrack ();
    var color = selectedTrack == null ? 0 : AbstractTrackBankProxy.getColorEntry (selectedTrack.color);
    
    var d = this.surface.getDisplay ();
    var message = d.createMessage (DisplayMessage.DISPLAY_COMMAND_GRID);
    
    for (var i = 0; i < 8; i++)
    {
        message.addByte (DisplayMessage.GRID_ELEMENT_PARAMETERS);
        
        // The menu item
        message.addString (i == 7 && !selDevice.isPlugin ? null :  this.menu[i]);
        
        switch (i)
        {
            case 0:
                message.addBoolean (selDevice.enabled);
                break;
            case 1:
                message.addBoolean (selectedMode == MODE_DEVICE_PARAMS);
                break;
            case 2:
                message.addBoolean (selectedMode == MODE_DEVICE_COMMON || selectedMode == MODE_DEVICE_ENVELOPE || selectedMode == MODE_DEVICE_MACRO || selectedMode == MODE_DEVICE_MODULATE || selectedMode == MODE_DEVICE_USER);
                break;
            case 3:
                message.addBoolean (selectedMode == MODE_DEVICE_DIRECT);
                break;
            case 4:
                var cd = this.model.getCursorDevice ();
                message.addBoolean (cd.isExpanded ());
                break;
            case 5:
                var cd = this.model.getCursorDevice ();
                message.addBoolean (cd.isMacroSectionVisible ());
                break;
            case 6:
                var cd = this.model.getCursorDevice ();
                message.addBoolean (cd.isParameterPageSectionVisible ());
                break;
            case 7:
                message.addBoolean (selDevice.isPlugin  && this.cursorDevice.isWindowOpen ());
                break;
        }

        message.addString (banks == null ? "" : banks[i].name);
        // TODO API extension required, add an icon if the type of the plugin is known
        message.addString ("");
        message.addColor (color);
        message.addBoolean (banks == null ? false : banks[i].selected);

        var param = this.getParameterAttributes (i);
        
        message.addString (param == null ? "" : param.name);
        message.addInteger (param == null ? 0 : param.value);
        message.addString (param == null ? "" : param.valueStr);
        message.addBoolean (this.isKnobTouched[i]);
    }

    message.send ();
};

AbstractDeviceMode.prototype.updateBanks = function (d)
{
    if (Config.isPush2)
    {
        var bank = this.calcBank ();
        return bank == null ? null : this.getBanks (d, bank);
    }
    
    var bank = this.calcBank ();
    if (bank != null)
        this.drawBanks (d, bank);
};

AbstractDeviceMode.prototype.drawBanks = function (d, bank)
{
    for (var p = 0; p < 8; p++)
    {
        var index = bank.offset + p;
        d.setCell (3, p, index < bank.pages.length ? ((index == bank.page ? Display.RIGHT_ARROW : "") + bank.pages[index]) : "", Display.FORMAT_RAW);
    }
};

AbstractDeviceMode.prototype.calcDeviceBank = function ()
{
    var pages = [];
    for (var i = 0; i < 8; i++)
        pages.push (this.cursorDevice.getSiblingDeviceName (i));
    return { pages: pages, page: this.cursorDevice.getPositionInBank (), offset: 0 };
};

//Push 2
AbstractDeviceMode.prototype.getBanks = function (d, bank)
{
    var banks = [];
    for (var p = 0; p < 8; p++)
    {
        var index = bank.offset + p;
        banks.push ({ name: index < bank.pages.length ? bank.pages[index] : "", selected: index < bank.pages.length && index == bank.page });
    }
    return banks;
};

AbstractDeviceMode.prototype.getParameterAttributes = function (index) {};
