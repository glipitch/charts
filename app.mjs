import "./header/theme.mjs?v=61a7eebadd5c";
import * as dialog from "./header/dialog.mjs?v=61a7eebadd5c";
import "./header/github.mjs?v=61a7eebadd5c";
import "./header/share.mjs?v=61a7eebadd5c";
import * as dimensions from "./dimensions.mjs?v=61a7eebadd5c";
import * as available from "./available-markets/available.mjs?v=61a7eebadd5c";
import * as current from "./current-markets/current.mjs?v=61a7eebadd5c";
import "./opacity.mjs?v=61a7eebadd5c";
import "./welcome.mjs?v=61a7eebadd5c";
available.subscribe(current.addCurrentMarket);
available.subscribeCurrent(current.getCurrentMarkets, current.applyMarketMetadata);
dimensions.manage();
current.loadCurrentMarkets();
available.loadAvailable();

