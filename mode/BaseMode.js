// Written by Jürgen Moßgraber - mossgrabers.de
//            Michael Schmalle - teotigraphix.com
// (c) 2014-2016
// Licensed under LGPLv3 - http://www.gnu.org/licenses/lgpl-3.0.txt

function BaseMode (model)
{
    AbstractMode.call (this, model);
    
    this.isKnobTouched = initArray (false, 8);
}
BaseMode.prototype = new AbstractMode ();

BaseMode.prototype.onFirstRow = function (index) {};
BaseMode.prototype.onSecondRow = function (index) {};

BaseMode.prototype.updateFirstRow = function ()
{
    this.disableFirstRow ();
};

BaseMode.prototype.updateSecondRow = function ()
{
    this.disableSecondRow ();
};

BaseMode.prototype.disableFirstRow = function ()
{
    for (var i = 0; i < 8; i++)
        this.surface.setButton (20 + i, PUSH_COLOR_BLACK);
};

BaseMode.prototype.disableSecondRow = function ()
{
    for (var i = 0; i < 8; i++)
        this.surface.setButton (102 + i, PUSH_COLOR2_BLACK);
};
