import "./header/theme.mjs?v=29d236d31bea";
import * as dialog from "./header/dialog.mjs?v=29d236d31bea";
import "./header/github.mjs?v=29d236d31bea";
import "./header/share.mjs?v=29d236d31bea";
import * as dimensions from "./dimensions.mjs?v=29d236d31bea";
import * as available from "./available-markets/available.mjs?v=29d236d31bea";
import * as current from "./current-markets/current.mjs?v=29d236d31bea";
import "./opacity.mjs?v=29d236d31bea";
available.subscribe(current.addCurrentMarket);
available.subscribeCurrent(current.getCurrentMarkets, current.applyMarketMetadata);
dimensions.manage();
current.loadCurrentMarkets();
available.loadAvailable();

