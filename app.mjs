import "./header/theme.mjs?v=4fa19015470d";
import * as dialog from "./header/dialog.mjs?v=4fa19015470d";
import "./header/github.mjs?v=4fa19015470d";
import "./header/share.mjs?v=4fa19015470d";
import * as dimensions from "./dimensions.mjs?v=4fa19015470d";
import * as available from "./available-markets/available.mjs?v=4fa19015470d";
import * as current from "./current-markets/current.mjs?v=4fa19015470d";
import "./opacity.mjs?v=4fa19015470d";
available.subscribe(current.addCurrentMarket);
available.subscribeCurrent(current.getCurrentMarkets, current.applyMarketMetadata);
dimensions.manage();
current.loadCurrentMarkets();
available.loadAvailable();

