// Written by Michael Schmalle - teotigraphix.com
// (c) 2014
// Licensed under GPLv3 - http://www.gnu.org/licenses/gpl.html

function MacroMode ()
{
	this.id = MODE_FRAME;
	this.bottomItems = [];
}
MacroMode.prototype = new BaseMode ();

MacroMode.prototype.attachTo = function (aPush) 
{
	for (var i = 0; i < 8; i++)
	{
		var m = device.getMacro (i);
		m.addLabelObserver (8, '', doIndex (i, function (index, name)
 		{
			macros[index].name = name;
		}));
		m.getAmount().addValueObserver (128, doIndex (i, function (index, value)
		{
			macros[index].value = value;
		}));
		// Macro value text
		m.getAmount().addValueDisplayObserver (8, '',  doIndex (i, function (index, value)
		{
			macros[index].valueStr = value;
		}));
	}
};

MacroMode.prototype.onValueKnob = function (index, value)
{
	macros[index].value = changeValue (value, macros[index].value);
	device.getMacro (index).getAmount ().set (macros[index].value, 128);
};

MacroMode.prototype.updateDisplay = function () 
{
	var d = push.display;
	
	if (this.hasMacros())
	{
		for (var i = 0; i < 8; i++)
		{
			if (macros[i].name.length == 0)
				d.clearCell (0, i).clearCell (1, i).clearCell (2, i);
			else				
			{
				d.setCell (0, i, macros[i].name, PushDisplay.FORMAT_RAW)
				 .setCell (1, i, macros[i].valueStr, PushDisplay.FORMAT_RAW)
				 .setCell (2, i, macros[i].value, PushDisplay.FORMAT_VALUE);
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
		if (macros[i].name.length != 0)
			return true;
	}
	return false;
};
