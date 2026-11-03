import "./header/theme.mjs?v=1833beb78338";
import * as dialog from "./header/dialog.mjs?v=1833beb78338";
import "./header/github.mjs?v=1833beb78338";
import "./header/share.mjs?v=1833beb78338";
import * as dimensions from "./dimensions.mjs?v=1833beb78338";
import * as available from "./available-markets/available.mjs?v=1833beb78338";
import * as current from "./current-markets/current.mjs?v=1833beb78338";
import "./opacity.mjs?v=1833beb78338";
available.subscribe(current.addCurrentMarket);
available.subscribeCurrent(current.getCurrentMarkets, current.applyMarketMetadata);
dimensions.manage();
current.loadCurrentMarkets();
available.loadAvailable();

