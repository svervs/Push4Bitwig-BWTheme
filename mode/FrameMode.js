// Written by Michael Schmalle
// (c) 2014
// Licensed under GPLv3 - http://www.gnu.org/licenses/gpl.html

function FrameToggleCommand (label, command)
{
	this.label = label;
	this.command = command;
}

FrameToggleCommand.prototype.getLabel = function ()
{
	return this.label;
};

FrameToggleCommand.prototype.execute = function ()
{
	this.command.call(this);
};

function FrameMode ()
{
	this.id = MODE_FRAME;
	this.bottomItems = [];
}
FrameMode.prototype = new BaseMode ();

FrameMode.firstRowButtonColor = PUSH_COLOR_GREEN_LO - 4;

FrameMode.prototype.attachTo = function (aPush)
{
	this.addFirstRowCommand ('Arrange ', function () { application.setPerspective('ARRANGE'); });
	this.addFirstRowCommand ('  Mix   ', function () { application.setPerspective('MIX'); });
	this.addFirstRowCommand ('  Edit  ', function () { application.setPerspective('EDIT'); });
	this.addFirstRowCommand ('NoteEdit', function () { application.toggleNoteEditor(); });
	this.addFirstRowCommand ('Automate', function () { application.toggleAutomationEditor(); });
	this.addFirstRowCommand (' Device ', function () { application.toggleDevices(); });
	this.addFirstRowCommand (' Mixer  ', function () { application.toggleMixer(); });
	this.addFirstRowCommand ('  Full  ', function () { application.toggleFullScreen(); });
};

FrameMode.prototype.onValueKnob = function (index, value)
{
};

FrameMode.prototype.onFirstRow = function (index) 
{
	this.bottomItems[index].execute();
};

FrameMode.prototype.onSecondRow = function (index) 
{
};

FrameMode.prototype.updateDisplay = function () 
{
	var d = push.display;

	d.clear ().setBlock (0, 0, "Perspectives:").setCell (0, 3, "Panels:");
	
	for (var i = 0; i < this.bottomItems.length; i++)
		d.setCell (3, i, this.bottomItems[i].getLabel());
	
	for (var i = 20; i < 28; i++)
		push.setButton (i, FrameMode.firstRowButtonColor);
	
	d.done (0).done (1).done (2).done (3);
};

FrameMode.prototype.addFirstRowCommand = function (label, command)
{
	this.bottomItems.push(new FrameToggleCommand(label, command));
};
