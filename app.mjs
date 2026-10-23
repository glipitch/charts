import "./header/theme.mjs?v=28d787534369";
import * as dialog from "./header/dialog.mjs?v=28d787534369";
import "./header/github.mjs?v=28d787534369";
import "./header/share.mjs?v=28d787534369";
import * as dimensions from "./dimensions.mjs?v=28d787534369";
import * as available from "./available-markets/available.mjs?v=28d787534369";
import * as current from "./current-markets/current.mjs?v=28d787534369";
import "./opacity.mjs?v=28d787534369";
available.subscribe(current.addCurrentMarket);
available.subscribeCurrent(current.getCurrentMarkets, current.applyMarketMetadata);
dimensions.manage();
current.loadCurrentMarkets();
available.loadAvailable();

