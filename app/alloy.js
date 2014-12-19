'use strict';

// Ui vars
Alloy.Globals.ui = {};

Alloy.Globals.ui.logicalDensity = Titanium.Platform.getDisplayCaps().logicalDensityFactor;

Alloy.Globals.ui.width = Titanium.Platform.getDisplayCaps().platformWidth / Alloy.Globals.ui.logicalDensity
Alloy.Globals.ui.grid = Math.floor((Alloy.Globals.ui.width - 50) / 5).toString() + 'dp';
Alloy.Globals.ui.half = Math.floor(Math.floor((Alloy.Globals.ui.width - 50) / 5) * 2.5) + 'dp';
