import "./header/theme.mjs";
import * as dialog from "./header/dialog.mjs";
import "./header/github.mjs";
import "./header/share.mjs";
import * as dimensions from "./dimensions.mjs";
import * as available from "./available-markets/available.mjs";
import * as current from "./current-markets/current.mjs";
import "./opacity.mjs";
import "./welcome.mjs";
available.subscribe(current.addCurrentMarket);
available.subscribeCurrent(current.getCurrentMarkets, current.applyMarketMetadata);
dimensions.manage();
current.loadCurrentMarkets();
available.loadAvailable();

