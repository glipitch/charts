import "./header/theme.mjs?v=6e45d42513a5";
import * as dialog from "./header/dialog.mjs?v=6e45d42513a5";
import "./header/github.mjs?v=6e45d42513a5";
import "./header/share.mjs?v=6e45d42513a5";
import * as dimensions from "./dimensions.mjs?v=6e45d42513a5";
import * as available from "./available-markets/available.mjs?v=6e45d42513a5";
import * as current from "./current-markets/current.mjs?v=6e45d42513a5";
import "./opacity.mjs?v=6e45d42513a5";
available.subscribe(current.addCurrentMarket);
available.subscribeCurrent(current.getCurrentMarkets, current.applyMarketMetadata);
dimensions.manage();
current.loadCurrentMarkets();
available.loadAvailable();

