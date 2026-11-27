import "./header/theme.mjs?v=610a51f02dca";
import * as dialog from "./header/dialog.mjs?v=610a51f02dca";
import "./header/github.mjs?v=610a51f02dca";
import "./header/share.mjs?v=610a51f02dca";
import * as dimensions from "./dimensions.mjs?v=610a51f02dca";
import * as available from "./available-markets/available.mjs?v=610a51f02dca";
import * as current from "./current-markets/current.mjs?v=610a51f02dca";
import "./opacity.mjs?v=610a51f02dca";
available.subscribe(current.addCurrentMarket);
available.subscribeCurrent(current.getCurrentMarkets, current.applyMarketMetadata);
dimensions.manage();
current.loadCurrentMarkets();
available.loadAvailable();

