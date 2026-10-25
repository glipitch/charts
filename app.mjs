import "./header/theme.mjs?v=96ca637f308a";
import * as dialog from "./header/dialog.mjs?v=96ca637f308a";
import "./header/github.mjs?v=96ca637f308a";
import "./header/share.mjs?v=96ca637f308a";
import * as dimensions from "./dimensions.mjs?v=96ca637f308a";
import * as available from "./available-markets/available.mjs?v=96ca637f308a";
import * as current from "./current-markets/current.mjs?v=96ca637f308a";
import "./opacity.mjs?v=96ca637f308a";
available.subscribe(current.addCurrentMarket);
available.subscribeCurrent(current.getCurrentMarkets, current.applyMarketMetadata);
dimensions.manage();
current.loadCurrentMarkets();
available.loadAvailable();

