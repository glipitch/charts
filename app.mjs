import "./header/theme.mjs?v=51666aa8d9a2";
import * as dialog from "./header/dialog.mjs?v=51666aa8d9a2";
import "./header/github.mjs?v=51666aa8d9a2";
import "./header/share.mjs?v=51666aa8d9a2";
import * as dimensions from "./dimensions.mjs?v=51666aa8d9a2";
import * as available from "./available-markets/available.mjs?v=51666aa8d9a2";
import * as current from "./current-markets/current.mjs?v=51666aa8d9a2";
import "./opacity.mjs?v=51666aa8d9a2";
available.subscribe(current.addCurrentMarket);
available.subscribeCurrent(current.getCurrentMarkets, current.applyMarketMetadata);
dimensions.manage();
current.loadCurrentMarkets();
available.loadAvailable();

