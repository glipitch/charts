import "./header/theme.mjs?v=2df584b8f1cb";
import * as dialog from "./header/dialog.mjs?v=2df584b8f1cb";
import "./header/github.mjs?v=2df584b8f1cb";
import * as dimensions from "./dimensions.mjs?v=2df584b8f1cb";
import * as available from "./available-markets/available.mjs?v=2df584b8f1cb";
import * as current from "./current-markets/current.mjs?v=2df584b8f1cb";
import "./opacity.mjs?v=2df584b8f1cb";
available.subscribe(current.addCurrentMarket);
dimensions.manage();
current.loadCurrentMarkets();
available.loadAvailable();

