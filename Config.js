// Accent button active
Config.accentActive     = false;
// Fixed velocity value for accent
Config.fixedAccentValue = 127;
// Inc/Dec of knobs
Config.fractionValue    = 1;


Config.FIXED_ACCENT_VALUE = 0;
Config.INC_FRACTION_VALUE = 1;


Config.setAccentValue = function (value)
{
	Config.fixedAccentValue = value;
	Config.notifyListeners (Config.FIXED_ACCENT_VALUE);
}


//
// Property listeners
//

Config.listeners = [];
for (var i = Config.FIXED_ACCENT_VALUE; i <= Config.FIXED_ACCENT_VALUE; i++)
	Config.listeners[i] = [];

Config.addPropertyListener = function (property, listener)
{
	Config.listeners[property].push (listener);
};

Config.notifyListeners = function (property)
{
	var ls = Config.listeners[property];
	for (var i = 0; i < ls.length; i++)
		ls[i].call (null);
}

function Config () {}
