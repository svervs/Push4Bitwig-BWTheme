// ------------------------------
// Static configurations
// ------------------------------

// Inc/Dec of knobs
Config.fractionValue     = 1;
Config.fractionMinValue  = 0.5;
Config.maxParameterValue = 127;

// How fast the track and scene arrows scroll the banks/scenes
Config.trackScrollInterval = 100;
Config.sceneScrollInterval = 100;


// ------------------------------
// Editable configurations
// ------------------------------

Config.ACTIVATE_FIXED_ACCENT = 0;
Config.FIXED_ACCENT_VALUE    = 1;
Config.RIBBON_MODE           = 2;
Config.RIBBON_MODE_CC_VAL    = 3;

Config.RIBBON_MODE_PITCH = 0;
Config.RIBBON_MODE_CC    = 1;
Config.RIBBON_MODE_MIXED = 2;

Config.accentActive      = false;                       // Accent button active
Config.fixedAccentValue  = 127;                         // Fixed velocity value for accent
Config.ribbonMode        = Config.RIBBON_MODE_PITCH;    // What does the ribbon send?
Config.ribbonModeCCVal   = 1;


Config.init = function ()
{
    var prefs = host.getPreferences ();

    Config.accentActiveSetting = prefs.getEnumSetting ("Activate Fixed Accent", "Fixed Accent", [ "Off", "On" ], "Off");
    Config.accentActiveSetting.addValueObserver (function (value)
    {
        Config.accentActive = value == "On";
        Config.notifyListeners (Config.ACTIVATE_FIXED_ACCENT);
    });
    
    Config.accentValueSetting = prefs.getNumberSetting ("Fixed Accent Value", "Fixed Accent", 1, 127, 1, "", 127);
    Config.accentValueSetting.addRawValueObserver (function (value)
    {
        Config.fixedAccentValue = Math.floor (value) + 1;
        Config.notifyListeners (Config.FIXED_ACCENT_VALUE);
    });

    Config.ribbonModeSetting = prefs.getEnumSetting ("Mode", "Ribbon", [ "Pitch", "CC", "Mixed" ], "Pitch");
    Config.ribbonModeSetting.addValueObserver (function (value)
    {
        switch (value)
        {
            case "Pitch": Config.ribbonMode = 0; break;
            case "CC": Config.ribbonMode = 1; break;
            case "Mixed": Config.ribbonMode = 2; break;
        }
        Config.notifyListeners (Config.RIBBON_MODE);
    });
    
    Config.ribbonModeCCSetting = prefs.getNumberSetting ("CC", "Ribbon", 0, 127, 1, "", 1);
    Config.ribbonModeCCSetting.addRawValueObserver (function (value)
    {
        Config.ribbonModeCCVal = Math.floor (value);
        Config.notifyListeners (Config.RIBBON_MODE_CC_VAL);
    });
}

Config.setAccentEnabled = function (enabled)
{
    Config.accentActiveSetting.set (enabled ? "On" : "Off");
}

Config.setAccentValue = function (value)
{
    Config.accentValueSetting.setRaw (value);
}

Config.setRibbonMode = function (mode)
{
    switch (mode)
    {
        case Config.RIBBON_MODE_PITCH: Config.ribbonModeSetting.set ("Pitch"); break;
        case Config.RIBBON_MODE_CC: Config.ribbonModeSetting.set ("CC"); break;
        case Config.RIBBON_MODE_MIXED: Config.ribbonModeSetting.set ("Mixed"); break;
    }
}

Config.setRibbonModeCC = function (value)
{
    Config.ribbonModeCCSetting.setRaw (value);
}


// ------------------------------
// Property listeners
// ------------------------------

Config.listeners = [];
for (var i = 0; i <= Config.RIBBON_MODE_CC_VAL; i++)
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
