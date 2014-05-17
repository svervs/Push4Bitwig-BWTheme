// Written by Jürgen Moßgraber - mossgrabers.de
//            Michael Schmalle - teotigraphix.com
// (c) 2014
// Licensed under GPLv3 - http://www.gnu.org/licenses/gpl.html

function UserControlBankProxy (push)
{
	this.push = push;

	this.userControlBank = host.createUserControls (8);

	for (var i = PUSH_KNOB1; i <= PUSH_KNOB8; i++)
		this.userControlBank.getControl (i - PUSH_KNOB1).setLabel ("CC" + i);
}

/**
 * @param {int} index
 * @returns {AutomatableRangedValue}
 */
UserControlBankProxy.prototype.getControl = function (index)
{
	return this.userControlBank.getControl (index);
};

UserControlBankProxy.prototype.updateIndication = function (index, isOurMode)
{
	this.userControlBank.getControl (index).setIndication (isOurMode);
};

