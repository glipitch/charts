import "./header/theme.mjs?v=d85cde1d93d9";
import * as dialog from "./header/dialog.mjs?v=d85cde1d93d9";
import "./header/github.mjs?v=d85cde1d93d9";
import "./header/share.mjs?v=d85cde1d93d9";
import * as dimensions from "./dimensions.mjs?v=d85cde1d93d9";
import * as available from "./available-markets/available.mjs?v=d85cde1d93d9";
import * as current from "./current-markets/current.mjs?v=d85cde1d93d9";
import "./opacity.mjs?v=d85cde1d93d9";
available.subscribe(current.addCurrentMarket);
available.subscribeCurrent(current.getCurrentMarkets, current.applyMarketMetadata);
dimensions.manage();
current.loadCurrentMarkets();
available.loadAvailable();

