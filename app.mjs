import "./header/theme.mjs?v=cd8614d864f0";
import * as dialog from "./header/dialog.mjs?v=cd8614d864f0";
import "./header/github.mjs?v=cd8614d864f0";
import "./header/share.mjs?v=cd8614d864f0";
import * as dimensions from "./dimensions.mjs?v=cd8614d864f0";
import * as available from "./available-markets/available.mjs?v=cd8614d864f0";
import * as current from "./current-markets/current.mjs?v=cd8614d864f0";
import "./opacity.mjs?v=cd8614d864f0";
available.subscribe(current.addCurrentMarket);
available.subscribeCurrent(current.getCurrentMarkets, current.applyMarketMetadata);
dimensions.manage();
current.loadCurrentMarkets();
available.loadAvailable();

