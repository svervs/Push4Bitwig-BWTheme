// Written by Jürgen Moßgraber - mossgrabers.de
//            Michael Schmalle - teotigraphix.com
// (c) 2014-2015
// Licensed under LGPLv3 - http://www.gnu.org/licenses/lgpl-3.0.txt

function Grid (output)
{
    this.output = output;

    // Note: The grid contains only 64 pads but is more efficient to use 
    // the 128 note values the pads understand
    this.currentButtonColors = initArray (PUSH_COLOR_BLACK, 128);
    this.buttonColors = initArray (PUSH_COLOR_BLACK, 128);
    this.currentBlinkColors = initArray (PUSH_COLOR_BLACK, 128);
    this.blinkColors = initArray (PUSH_COLOR_BLACK, 128);
    this.currentBlinkFast = initArray (false, 128);
    this.blinkFast = initArray (false, 128);
}

Grid.prototype.light = function (note, color, blinkColor, fast)
{
    this.setLight (note, color, blinkColor, fast);
};

Grid.prototype.lightEx = function (x, y, color, blinkColor, fast)
{
    this.setLight (92 + x - 8 * y, color, blinkColor, fast);
};

Grid.prototype.setLight = function (index, color, blinkColor, fast)
{
    if (blinkColor)
    {
        this.buttonColors[index] = color;
        this.blinkColors[index] = blinkColor;
    }
    else
    {
        this.buttonColors[index] = color;
        this.blinkColors[index]  = PUSH_COLOR_BLACK;
    }
    this.blinkFast[index] = fast;
};

Grid.prototype.flush = function ()
{
    for (var i = 36; i < 100; i++)
    {
        var baseChanged = false;
        if (this.currentButtonColors[i] != this.buttonColors[i])
        {
            this.currentButtonColors[i] = this.buttonColors[i];
            this.output.sendNote (i, this.buttonColors[i]);
            baseChanged = true;
        }
        // No "else" here: Blinking color needs a base color
        if (baseChanged || this.currentBlinkColors[i] != this.blinkColors[i] || this.currentBlinkFast[i] != this.blinkFast[i])
        {
            this.currentBlinkColors[i] = this.blinkColors[i];
            this.currentBlinkFast[i] = this.blinkFast[i];

            this.output.sendNote (i, this.currentButtonColors[i]);
            if (this.blinkColors[i] != PUSH_COLOR_BLACK)
                this.output.sendNoteEx (this.blinkFast[i] ? 14 : 10, i, this.blinkColors[i]);
        }
    }
};

Grid.prototype.turnOff = function ()
{
    for (var i = 36; i < 100; i++)
        this.light (i, PUSH_COLOR_BLACK, null, false);
    this.flush ();
};
