// Written by Jürgen Moßgraber - mossgrabers.de
//            Michael Schmalle - teotigraphix.com
// (c) 2014-2015
// Licensed under LGPLv3 - http://www.gnu.org/licenses/lgpl-3.0.txt

AutomationMode.MODES = [ 'Latch', 'Touch', 'Write' ];
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
    var t = this.model.getTransport ();
    
    if (Config.isPush2)
    {
        var message = d.createMessage (DisplayMessage.DISPLAY_COMMAND_GRID);
        for (var i = 0; i < 8; i++)
        {
            message.addOptionElement ("", "", false, i == 0 ? "Automation Mode" : "",
                                      i < AutomationMode.MODES.length ? AutomationMode.MODES[i] : "",
                                      i < AutomationMode.MODES.length && t.automationWriteMode == AutomationMode.MODES_VALUES[i]);
        }
        message.send ();
    }
    else
    {
        d.clear ().setBlock (1, 0, "Automation Mode:", Display.FORMAT_RAW);
        for (var i = 0; i < AutomationMode.MODES.length; i++)
            d.setCell (3, i, (t.automationWriteMode == AutomationMode.MODES_VALUES[i] ? Display.RIGHT_ARROW : '') + AutomationMode.MODES[i], Display.FORMAT_RAW);
        d.allDone ();
    }
};

AutomationMode.prototype.onFirstRow = function (index) 
{
    var t = this.model.getTransport ();
    switch (index)
    {
        case 0: t.setAutomationWriteMode ('latch'); break;
        case 1: t.setAutomationWriteMode ('touch'); break;
        case 2: t.setAutomationWriteMode ('write'); break;
    }
};

AutomationMode.prototype.updateFirstRow = function ()
{
    var t = this.model.getTransport ();
    this.surface.setButton (20, t.automationWriteMode == 'latch' ? AbstractMode.BUTTON_COLOR_HI : AbstractMode.BUTTON_COLOR_ON);
    this.surface.setButton (21, t.automationWriteMode == 'touch' ? AbstractMode.BUTTON_COLOR_HI : AbstractMode.BUTTON_COLOR_ON);
    this.surface.setButton (22, t.automationWriteMode == 'write' ? AbstractMode.BUTTON_COLOR_HI : AbstractMode.BUTTON_COLOR_ON);
    for (var i = 0; i < 5; i++)
        this.surface.setButton (23 + i, AbstractMode.BUTTON_COLOR_OFF);
};
