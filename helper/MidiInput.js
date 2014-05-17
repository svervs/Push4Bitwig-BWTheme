// Written by Jürgen Moßgraber - mossgrabers.de
//            Michael Schmalle - teotigraphix.com
// (c) 2014
// Licensed under GPLv3 - http://www.gnu.org/licenses/gpl.html

function MidiInput ()
{
	this.port = host.getMidiInPort (0);
}

/**
 * @returns {MidiIn}
 */
MidiInput.prototype.getPort = function ()
{
	return this.port;
};
