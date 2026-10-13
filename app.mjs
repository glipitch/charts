import "./header/theme.mjs?v=e3a2a6ceab3c";
import * as dialog from "./header/dialog.mjs?v=e3a2a6ceab3c";
import "./header/github.mjs?v=e3a2a6ceab3c";
import "./header/share.mjs?v=e3a2a6ceab3c";
import * as dimensions from "./dimensions.mjs?v=e3a2a6ceab3c";
import * as available from "./available-markets/available.mjs?v=e3a2a6ceab3c";
import * as current from "./current-markets/current.mjs?v=e3a2a6ceab3c";
import "./opacity.mjs?v=e3a2a6ceab3c";
import "./welcome.mjs?v=e3a2a6ceab3c";
available.subscribe(current.addCurrentMarket);
available.subscribeCurrent(current.getCurrentMarkets, current.applyMarketMetadata);
dimensions.manage();
current.loadCurrentMarkets();
available.loadAvailable();

