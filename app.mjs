import "./header/theme.mjs?v=376a75580552";
import * as dialog from "./header/dialog.mjs?v=376a75580552";
import "./header/github.mjs?v=376a75580552";
import * as dimensions from "./dimensions.mjs?v=376a75580552";
import * as available from "./available-markets/available.mjs?v=376a75580552";
import * as current from "./current-markets/current.mjs?v=376a75580552";
import "./opacity.mjs?v=376a75580552";
available.subscribe(current.addCurrentMarket);
dimensions.manage();
current.loadCurrentMarkets();
available.loadAvailable();

