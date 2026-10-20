import "./header/theme.mjs?v=40fab349801d";
import * as dialog from "./header/dialog.mjs?v=40fab349801d";
import "./header/github.mjs?v=40fab349801d";
import "./header/share.mjs?v=40fab349801d";
import * as dimensions from "./dimensions.mjs?v=40fab349801d";
import * as available from "./available-markets/available.mjs?v=40fab349801d";
import * as current from "./current-markets/current.mjs?v=40fab349801d";
import "./opacity.mjs?v=40fab349801d";
available.subscribe(current.addCurrentMarket);
available.subscribeCurrent(current.getCurrentMarkets, current.applyMarketMetadata);
dimensions.manage();
current.loadCurrentMarkets();
available.loadAvailable();

