// Written by Jürgen Moßgraber - mossgrabers.de
//            Michael Schmalle - teotigraphix.com
// (c) 2014-2016
// Licensed under LGPLv3 - http://www.gnu.org/licenses/lgpl-3.0.txt

AutomationMode.MODES        = [ 'Latch', 'Touch', 'Write' ];
AutomationMode.MODES_VALUES = [ 'latch', 'touch', 'write' ];

function AutomationMode (model)
{
    BaseMode.call (this, model);
    this.id = MODE_ACCENT;
}
AutomationMode.prototype = new BaseMode ();

AutomationMode.prototype.updateDisplay = function () 
{
    var d = this.surface.getDisplay ();
    var writeMode = this.getWriteMode ();
    
    if (Config.isPush2)
    {
        var message = d.createMessage (DisplayMessage.DISPLAY_COMMAND_GRID);
        for (var i = 0; i < 8; i++)
        {
            message.addOptionElement ("", "", false, i == 0 ? "Automation Mode" : "",
                                      i < AutomationMode.MODES.length ? AutomationMode.MODES[i] : "",
                                      i < AutomationMode.MODES.length && writeMode == AutomationMode.MODES_VALUES[i]);
        }
        message.send ();
        return;
    }

    d.clear ().setBlock (1, 0, "Automation Mode:", Display.FORMAT_RAW);
    for (var i = 0; i < AutomationMode.MODES.length; i++)
        d.setCell (3, i, (writeMode == AutomationMode.MODES_VALUES[i] ? Display.RIGHT_ARROW : '') + AutomationMode.MODES[i], Display.FORMAT_RAW);
    d.allDone ();
};

AutomationMode.prototype.onFirstRow = function (index) 
{
    if (index < AutomationMode.MODES_VALUES.length)
        this.setWriteMode (AutomationMode.MODES_VALUES[index]);
};

AutomationMode.prototype.updateFirstRow = function ()
{
    var writeMode = this.getWriteMode ();
    for (var i = 0; i < AutomationMode.MODES_VALUES.length; i++)
        this.surface.setButton (20 + i, writeMode == AutomationMode.MODES_VALUES[i] ? AbstractMode.BUTTON_COLOR_HI : AbstractMode.BUTTON_COLOR_ON);
    for (var i = AutomationMode.MODES_VALUES.length; i < 8; i++)
        this.surface.setButton (20 + i, AbstractMode.BUTTON_COLOR_OFF);
};

AutomationMode.prototype.getWriteMode = function ()
{
    return this.model.getTransport ().automationWriteMode;
};


AutomationMode.prototype.setWriteMode = function (writeMode)
{
    this.model.getTransport ().setAutomationWriteMode (writeMode);
};
