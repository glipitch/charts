import "./header/theme.mjs?v=75b6f4773e20";
import * as dialog from "./header/dialog.mjs?v=75b6f4773e20";
import "./header/github.mjs?v=75b6f4773e20";
import "./header/share.mjs?v=75b6f4773e20";
import * as dimensions from "./dimensions.mjs?v=75b6f4773e20";
import * as available from "./available-markets/available.mjs?v=75b6f4773e20";
import * as current from "./current-markets/current.mjs?v=75b6f4773e20";
import "./opacity.mjs?v=75b6f4773e20";
available.subscribe(current.addCurrentMarket);
available.subscribeCurrent(current.getCurrentMarkets, current.applyMarketMetadata);
dimensions.manage();
current.loadCurrentMarkets();
available.loadAvailable();

