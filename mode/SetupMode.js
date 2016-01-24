// Written by Jürgen Moßgraber - mossgrabers.de
//            Michael Schmalle - teotigraphix.com
// (c) 2014-2016
// Licensed under LGPLv3 - http://www.gnu.org/licenses/lgpl-3.0.txt

// Configuration settings for Push 1
function SetupMode (model)
{
    BaseMode.call (this, model);
    this.id = MODE_SETUP;
    this.isTemporary = false;
}
SetupMode.prototype = new BaseMode ();

SetupMode.prototype.onValueKnobTouch = function (index, isTouched) 
{
    this.isKnobTouched[index] = isTouched;
};

SetupMode.prototype.onValueKnob = function (index, value)
{
    switch (index)
    {
        case 2:
            Config.changeDisplayBrightness (value);
            break;
        case 3:
            Config.changeLEDBrightness (value);
            break;
        case 5:
            Config.changePadSensitivity (value);
            break;
        case 6:
            Config.changePadGain (value);
            break;
        case 7:
            Config.changePadDynamics (value);
            break;
        default:
            // Not used
            break;
    }
};

SetupMode.prototype.updateSecondRow = function ()
{
    this.surface.updateButton (102, AbstractMode.BUTTON_COLOR_HI);
    this.surface.updateButton (103, AbstractMode.BUTTON_COLOR_ON);
    for (var i = 2; i < 8; i++)
        this.surface.updateButton (102 + i, AbstractMode.BUTTON_COLOR_OFF);
};

SetupMode.prototype.onSecondRow = function (index)
{
    if (index == 1)
        this.surface.setActiveMode (MODE_INFO);
};

SetupMode.prototype.updateDisplay = function () 
{
    var d = this.surface.getDisplay ();
    var message = d.createMessage (DisplayMessage.DISPLAY_COMMAND_GRID);
    message.addOptionElement ("", "Setup", true, "", "", false, true);
    message.addOptionElement ("Brightness", "Info", false, "", "", false, true);
    for (var i = 2; i < 8; i++)
    {
        if (i == 4)
        {
            message.addOptionElement ("        Pads", "", false, "", "", false);
            continue;
        }
        
        message.addByte (DisplayMessage.GRID_ELEMENT_PARAMETERS);
        
        // The menu item
        message.addString ("");
        message.addBoolean (i == 0);

        message.addString ("");
        message.addString ("");
        message.addColor (0);
        message.addBoolean (false);

        switch (i)
        {
            case 2:
                message.addString ("Display");
                message.addInteger (Config.displayBrightness * 1023 / 100);
                message.addString (Config.displayBrightness + "%");
                break;
            case 3:
                message.addString ("LEDs");
                message.addInteger (Config.ledBrightness * 1023 / 100);
                message.addString (Config.ledBrightness + "%");
                break;
            case 5:
                message.addString ("Sensitivity");
                message.addInteger (Config.padSensitivity * 1023 / 10);
                message.addString (Config.padSensitivity + "");
                break;
            case 6:
                message.addString ("Gain");
                message.addInteger (Config.padGain * 1023 / 10);
                message.addString (Config.padGain + "");
                break;
            case 7:
                message.addString ("Dynamics");
                message.addInteger (Config.padDynamics * 1023 / 10);
                message.addString (Config.padDynamics + "");
                break;
            default:
                message.addString ("");
                message.addInteger (-1);
                message.addString ( "");
                break;
        }
        
        message.addBoolean (this.isKnobTouched[i]);
    }
    message.send ();
};
