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
Config.SCALES_SCALE          = 4;
Config.SCALES_BASE           = 5;
Config.SCALES_IN_KEY         = 6;
Config.SCALES_LAYOUT         = 7;
Config.ENABLE_VU_METERS      = 8;
Config.VELOCITY_CURVE        = 9;
Config.PAD_THRESHOLD         = 10;

Config.RIBBON_MODE_PITCH = 0;
Config.RIBBON_MODE_CC    = 1;
Config.RIBBON_MODE_CC_PB = 2;
Config.RIBBON_MODE_PB_CC = 3;

Config.accentActive      = false;                       // Accent button active
Config.fixedAccentValue  = 127;                         // Fixed velocity value for accent
Config.ribbonMode        = Config.RIBBON_MODE_PITCH;    // What does the ribbon send?
Config.ribbonModeCCVal   = 1;
Config.scale             = 'Major';
Config.scaleBase         = 'C';
Config.scaleInKey        = true;
Config.scaleLayout       = '4th ^';
Config.enableVUMeters    = false;
Config.velocityCurve     = 1;
Config.padThreshold      = 20;

Config.init = function ()
{
    var prefs = host.getPreferences ();

    ///////////////////////////
    // Accent

    Config.accentActiveSetting = prefs.getEnumSetting ("Activate Fixed Accent", "Fixed Accent", [ "Off", "On" ], "Off");
    Config.accentActiveSetting.addValueObserver (function (value)
    {
        Config.accentActive = value == "On";
        Config.notifyListeners (Config.ACTIVATE_FIXED_ACCENT);
    });
    
    Config.accentValueSetting = prefs.getNumberSetting ("Fixed Accent Value", "Fixed Accent", 1, 127, 1, "", 127);
    Config.accentValueSetting.addRawValueObserver (function (value)
    {
        Config.fixedAccentValue = value;
        Config.notifyListeners (Config.FIXED_ACCENT_VALUE);
    });
    
    ///////////////////////////
    // Ribbon

    Config.ribbonModeSetting = prefs.getEnumSetting ("Mode", "Ribbon", [ "Pitch", "CC", "CC/Pitch", "Pitch/CC" ], "Pitch");
    Config.ribbonModeSetting.addValueObserver (function (value)
    {
        switch (value)
        {
            case "Pitch": Config.ribbonMode = 0; break;
            case "CC": Config.ribbonMode = 1; break;
            case "CC/Pitch": Config.ribbonMode = 2; break;
            case "Pitch/CC": Config.ribbonMode = 3; break;
        }
        Config.notifyListeners (Config.RIBBON_MODE);
    });
    
    Config.ribbonModeCCSetting = prefs.getNumberSetting ("CC", "Ribbon", 0, 127, 1, "", 1);
    Config.ribbonModeCCSetting.addRawValueObserver (function (value)
    {
        Config.ribbonModeCCVal = Math.floor (value);
        Config.notifyListeners (Config.RIBBON_MODE_CC_VAL);
    });
    
    ///////////////////////////
    // Scale

    var scaleNames = Scales.getNames ();
    Config.scaleSetting = prefs.getEnumSetting ("Scale", "Scales", scaleNames, scaleNames[0]);
    Config.scaleSetting.addValueObserver (function (value)
    {
        Config.scale = value;
        Config.notifyListeners (Config.SCALES_SCALE);
    });
    
    Config.scaleBaseSetting = prefs.getEnumSetting ("Base", "Scales", Scales.BASES, Scales.BASES[0]);
    Config.scaleBaseSetting.addValueObserver (function (value)
    {
        Config.scaleBase = value;
        Config.notifyListeners (Config.SCALES_BASE);
    });

    Config.scaleInScaleSetting = prefs.getEnumSetting ("In Key", "Scales", [ "In Key", "Chromatic" ], "In Key");
    Config.scaleInScaleSetting.addValueObserver (function (value)
    {
        Config.scaleInKey = value == "In Key";
        Config.notifyListeners (Config.SCALES_IN_KEY);
    });

    Config.scaleLayoutSetting = prefs.getEnumSetting ("Layout", "Scales", Scales.LAYOUT_NAMES, Scales.LAYOUT_NAMES[0]);
    Config.scaleLayoutSetting.addValueObserver (function (value)
    {
        Config.scaleLayout = value;
        Config.notifyListeners (Config.SCALES_LAYOUT);
    });

    ///////////////////////////
    // Enable VU Meters

    Config.enableVUMetersSetting = prefs.getEnumSetting ("Activity", "VU Meters", [ "Off", "On" ], "Off");
    Config.enableVUMetersSetting.addValueObserver (function (value)
    {
        Config.enableVUMeters = value == "On";
        Config.notifyListeners (Config.ENABLE_VU_METERS);
    });

    ///////////////////////////
    // Pad Sensitivity

    Config.velocityCurveSetting = prefs.getEnumSetting ("Velocity Curve", "Pad Sensitivity", PUSH_PAD_CURVES_NAME, PUSH_PAD_CURVES_NAME[1]);
    Config.velocityCurveSetting.addValueObserver (function (value)
    {
        for (var i = 0; i < PUSH_PAD_CURVES_NAME.length; i++)
        {
            if (PUSH_PAD_CURVES_NAME[i] === value)
            {
                Config.velocityCurve = i;
                break;
            }
        }
        Config.notifyListeners (Config.VELOCITY_CURVE);
    });

    Config.padThresholdSetting = prefs.getEnumSetting ("Pad Threshold", "Pad Sensitivity", PUSH_PAD_THRESHOLDS_NAME, PUSH_PAD_THRESHOLDS_NAME[20]);
    Config.padThresholdSetting.addValueObserver (function (value)
    {
        for (var i = 0; i < PUSH_PAD_THRESHOLDS_NAME.length; i++)
        {
            if (PUSH_PAD_THRESHOLDS_NAME[i] === value)
            {
                Config.padThreshold = i;
                break;
            }
        }
        Config.notifyListeners (Config.PAD_THRESHOLD);
    });
};

Config.setAccentEnabled = function (enabled)
{
    Config.accentActiveSetting.set (enabled ? "On" : "Off");
};

Config.setAccentValue = function (value)
{
    Config.accentValueSetting.setRaw (value);
};

Config.setRibbonMode = function (mode)
{
    switch (mode)
    {
        case Config.RIBBON_MODE_PITCH: Config.ribbonModeSetting.set ("Pitch"); break;
        case Config.RIBBON_MODE_CC: Config.ribbonModeSetting.set ("CC"); break;
        case Config.RIBBON_MODE_CC_PB: Config.ribbonModeSetting.set ("CC/Pitch"); break;
        case Config.RIBBON_MODE_PB_CC: Config.ribbonModeSetting.set ("Pitch/CC"); break;
    }
};

Config.setRibbonModeCC = function (value)
{
    Config.ribbonModeCCSetting.setRaw (value);
};

Config.setScale = function (scale)
{
    Config.scaleSetting.set (scale);
};

Config.setScaleBase = function (scaleBase)
{
    Config.scaleBaseSetting.set (scaleBase);
};

Config.setScaleInScale = function (inScale)
{
    Config.scaleInScaleSetting.set (inScale ? "In Key" : "Chromatic");
};

Config.setScaleLayout = function (scaleLayout)
{
    Config.scaleLayoutSetting.set (scaleLayout);
};

Config.setVUMetersEnabled = function (enabled)
{
    Config.enableVUMetersSetting.set (enabled ? "On" : "Off");
};

Config.setVelocityCurve = function (value)
{
    Config.velocityCurve = Math.max (0, Math.min (value, PUSH_PAD_CURVES_NAME.length - 1));
    Config.velocityCurveSetting.set (PUSH_PAD_CURVES_NAME[Config.velocityCurve]);
};

Config.setPadThreshold = function (value)
{
    Config.padThreshold = Math.max (0, Math.min (value, PUSH_PAD_THRESHOLDS_NAME.length - 1));
    Config.padThresholdSetting.set (PUSH_PAD_THRESHOLDS_NAME[Config.padThreshold]);
};

// ------------------------------
// Property listeners
// ------------------------------

Config.listeners = [];
for (var i = 0; i <= Config.PAD_THRESHOLD; i++)
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
};

function Config () {}
