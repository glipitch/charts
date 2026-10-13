import "./header/theme.mjs?v=7d0691b8c6f8";
import * as dialog from "./header/dialog.mjs?v=7d0691b8c6f8";
import "./header/github.mjs?v=7d0691b8c6f8";
import "./header/share.mjs?v=7d0691b8c6f8";
import * as dimensions from "./dimensions.mjs?v=7d0691b8c6f8";
import * as available from "./available-markets/available.mjs?v=7d0691b8c6f8";
import * as current from "./current-markets/current.mjs?v=7d0691b8c6f8";
import "./opacity.mjs?v=7d0691b8c6f8";
import "./welcome.mjs?v=7d0691b8c6f8";
available.subscribe(current.addCurrentMarket);
available.subscribeCurrent(current.getCurrentMarkets, current.applyMarketMetadata);
dimensions.manage();
current.loadCurrentMarkets();
available.loadAvailable();

