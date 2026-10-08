import "./header/theme.mjs";
import * as dialog from "./header/dialog.mjs";
import "./header/github.mjs";
import * as dimensions from "./dimensions.mjs";
import * as available from "./available-markets/available.mjs";
import * as current from "./current-markets/current.mjs";
import "./opacity.mjs";
available.subscribe(current.addCurrentMarket);
dimensions.manage();
current.loadCurrentMarkets();
//dialog.open();//dev only
await available.loadAvailable();

