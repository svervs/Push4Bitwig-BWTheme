// Written by Jürgen Moßgraber - mossgrabers.de
//            Michael Schmalle - teotigraphix.com
// (c) 2014-2015
// Licensed under LGPLv3 - http://www.gnu.org/licenses/lgpl-3.0.txt

function AutomationMode (model)
{
    BaseMode.call (this, model);
    this.id = MODE_ACCENT;
}
AutomationMode.prototype = new BaseMode ();

AutomationMode.prototype.updateDisplay = function () 
{
    var t = this.model.getTransport ();
    this.surface.getDisplay ().clear ()
        .setBlock (1, 0, "Automation Mode:", Display.FORMAT_RAW)
        .setCell (3, 0, (t.automationWriteMode == 'latch' ? Display.RIGHT_ARROW : '') + 'Latch', Display.FORMAT_RAW)
        .setCell (3, 1, (t.automationWriteMode == 'touch' ? Display.RIGHT_ARROW : '') + 'Touch', Display.FORMAT_RAW)
        .setCell (3, 2, (t.automationWriteMode == 'write' ? Display.RIGHT_ARROW : '') + 'Write', Display.FORMAT_RAW)
        .allDone ();
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
    this.surface.setButton (20, t.automationWriteMode == 'latch' ? FrameMode.BUTTON_COLOR_ON : FrameMode.BUTTON_COLOR_OFF);
    this.surface.setButton (21, t.automationWriteMode == 'touch' ? FrameMode.BUTTON_COLOR_ON : FrameMode.BUTTON_COLOR_OFF);
    this.surface.setButton (22, t.automationWriteMode == 'write' ? FrameMode.BUTTON_COLOR_ON : FrameMode.BUTTON_COLOR_OFF);
    for (var i = 0; i < 5; i++)
        this.surface.setButton (23 + i, PUSH_COLOR_BLACK);
};
