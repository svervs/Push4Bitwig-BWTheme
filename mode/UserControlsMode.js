// Written by Jürgen Moßgraber - mossgrabers.de
//            Michael Schmalle - teotigraphix.com
// (c) 2014
// Licensed under GPLv3 - http://www.gnu.org/licenses/gpl.html

function UserControlsMode (model)
{
	BaseMode.call (this, model);
	this.id = MODE_BANK_USER;
	this.usercontrols = [ { index: 0, name: '' }, { index: 1, name: '' }, { index: 2, name: '' }, { index: 3, name: '' }, { index: 4, name: '' }, { index: 5, name: '' }, { index: 6, name: '' }, { index: 7, name: '' } ];
}
UserControlsMode.prototype = new BaseMode ();

UserControlsMode.prototype.attachTo = function (aPush) 
{
	for (var i = 0; i < 8; i++)
	{
		var c = userControlBank.getControl (i);

		c.addNameObserver (8, '', doObjectIndex (this, i, function (index, name)
		{
			this.usercontrols[index].name = name;
		}));
		c.addValueObserver (128, doObjectIndex (this, i, function (index, value)
		{
			this.usercontrols[index].value = value;
		}));
		// Macro value text
		c.addValueDisplayObserver (8, '',  doObjectIndex (this, i, function (index, value)
		{
			this.usercontrols[index].valueStr = value;
		}));
	}
};

UserControlsMode.prototype.onValueKnob = function (index, value)
{
	this.usercontrols[index].value = this.changeValue (value, this.usercontrols[index].value);
	userControlBank.getControl (index).set (this.usercontrols[index].value, 128);
};

UserControlsMode.prototype.updateDisplay = function () 
{
	var d = push.display;
	
	if (this.hasUserControls ())
	{
		for (var i = 0; i < 8; i++)
		{
			if (this.usercontrols[i].name.length == 0)
				d.clearCell (0, i).clearCell (1, i).clearCell (2, i);
			else				
			{
				d.setCell (0, i, this.usercontrols[i].name, Display.FORMAT_RAW)
				 .setCell (1, i, this.usercontrols[i].valueStr, Display.FORMAT_RAW)
				 .setCell (2, i, this.usercontrols[i].value, Display.FORMAT_VALUE);
			}
		}
	}
	else
	{
		d.clearRow (0).clearRow (1).clearRow (2)
		 .setBlock (1, 1, ' No User Controls').setCell (1, 4, 'Assigned');
	}

	d.done (0).done (1).done (2);
};

UserControlsMode.prototype.hasUserControls = function () 
{
	for (var i = 0; i < 8; i++)
	{
		if (this.usercontrols[i].name.length != 0)
			return true;
	}
	return false;
};
