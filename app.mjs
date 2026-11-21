import "./header/theme.mjs?v=621928549cbe";
import * as dialog from "./header/dialog.mjs?v=621928549cbe";
import "./header/github.mjs?v=621928549cbe";
import "./header/share.mjs?v=621928549cbe";
import * as dimensions from "./dimensions.mjs?v=621928549cbe";
import * as available from "./available-markets/available.mjs?v=621928549cbe";
import * as current from "./current-markets/current.mjs?v=621928549cbe";
import "./opacity.mjs?v=621928549cbe";
available.subscribe(current.addCurrentMarket);
available.subscribeCurrent(current.getCurrentMarkets, current.applyMarketMetadata);
dimensions.manage();
current.loadCurrentMarkets();
available.loadAvailable();

