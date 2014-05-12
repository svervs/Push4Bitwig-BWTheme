// Written by Jürgen Moßgraber - mossgrabers.de
//            Michael Schmalle - teotigraphix.com
// (c) 2014
// Licensed under GPLv3 - http://www.gnu.org/licenses/gpl.html

function MacroMode (model)
{
	BaseMode.call (this, model);
	this.id = MODE_MACRO;
	this.bottomItems = [];
	this.macros = [ { index: 0, name: '' }, { index: 1, name: '' }, { index: 2, name: '' }, { index: 3, name: '' }, { index: 4, name: '' }, { index: 5, name: '' }, { index: 6, name: '' }, { index: 7, name: '' } ];
}
MacroMode.prototype = new BaseMode ();

MacroMode.prototype.attachTo = function (aPush) 
{
	for (var i = 0; i < 8; i++)
	{
		var m = device.getMacro (i);
		m.addLabelObserver (8, '', doObjectIndex (this, i, function (index, name)
 		{
			this.macros[index].name = name;
		}));
		m.getAmount().addValueObserver (128, doObjectIndex (this, i, function (index, value)
		{
			this.macros[index].value = value;
		}));
		// Macro value text
		m.getAmount().addValueDisplayObserver (8, '',  doObjectIndex (this, i, function (index, value)
		{
			this.macros[index].valueStr = value;
		}));
	}
};

MacroMode.prototype.onValueKnob = function (index, value)
{
	this.macros[index].value = this.changeValue (value, this.macros[index].value);
	device.getMacro (index).getAmount ().set (this.macros[index].value, 128);
};

MacroMode.prototype.updateDisplay = function () 
{
	var d = push.display;
	
	if (this.hasMacros())
	{
		for (var i = 0; i < 8; i++)
		{
			if (this.macros[i].name.length == 0)
				d.clearCell (0, i).clearCell (1, i).clearCell (2, i);
			else				
			{
				d.setCell (0, i, this.macros[i].name, Display.FORMAT_RAW)
				 .setCell (1, i, this.macros[i].valueStr, Display.FORMAT_RAW)
				 .setCell (2, i, this.macros[i].value, Display.FORMAT_VALUE);
			}
		}
	}
	else
	{
		d.clearRow (0).clearRow (1).clearRow (2)
		 .setCell(1, 3, 'No Macro').setCell(1, 4, 'Assigned');
	}

	d.done (0).done (1).done (2);
};

MacroMode.prototype.hasMacros = function () 
{
	for (var i = 0; i < 8; i++)
	{
		if (this.macros[i].name.length != 0)
			return true;
	}
	return false;
};
