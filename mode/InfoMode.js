// Written by Jürgen Moßgraber - mossgrabers.de
//            Michael Schmalle - teotigraphix.com
// (c) 2014-2016
// Licensed under LGPLv3 - http://www.gnu.org/licenses/lgpl-3.0.txt

// Configuration settings for Push 1
function InfoMode (model)
{
    BaseMode.call (this, model);
    this.id = MODE_INFO;
    this.isTemporary = false;
}
InfoMode.prototype = new BaseMode ();

InfoMode.prototype.onSecondRow = function (index)
{
    if (index == 0)
        this.surface.setActiveMode (MODE_SETUP);
};

InfoMode.prototype.updateSecondRow = function ()
{
    this.surface.updateButton (102, AbstractMode.BUTTON_COLOR_ON);
    this.surface.updateButton (103, AbstractMode.BUTTON_COLOR_HI);
    for (var i = 2; i < 8; i++)
        this.surface.updateButton (102 + i, AbstractMode.BUTTON_COLOR_OFF);
};

InfoMode.prototype.updateDisplay = function () 
{
    var d = this.surface.getDisplay ();
    var message = d.createMessage (DisplayMessage.DISPLAY_COMMAND_GRID);
            
    message.addOptionElement ("  Firmware: " + this.surface.majorVersion + "." + this.surface.minorVersion + " Build " + this.surface.buildNumber, "Setup", false, "", "", false, true);
    message.addOptionElement ("", "Info", true, "", "", false, true);
    message.addOptionElement ("", "", false, "", "", false);
    message.addOptionElement ("Board Revision: " + this.surface.boardRevision, "", false, "", "", false);
    message.addOptionElement ("", "", false, "", "", false);
    message.addOptionElement ("        Serial Number: " + this.surface.serialNumber, "", false, "", "", false);
    message.addOptionElement ("", "", false, "", "", false);
    message.addOptionElement ("", "", false, "", "", false);
            
    message.send ();
};
