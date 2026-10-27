import "./header/theme.mjs?v=4a1ba037781b";
import * as dialog from "./header/dialog.mjs?v=4a1ba037781b";
import "./header/github.mjs?v=4a1ba037781b";
import "./header/share.mjs?v=4a1ba037781b";
import * as dimensions from "./dimensions.mjs?v=4a1ba037781b";
import * as available from "./available-markets/available.mjs?v=4a1ba037781b";
import * as current from "./current-markets/current.mjs?v=4a1ba037781b";
import "./opacity.mjs?v=4a1ba037781b";
available.subscribe(current.addCurrentMarket);
available.subscribeCurrent(current.getCurrentMarkets, current.applyMarketMetadata);
dimensions.manage();
current.loadCurrentMarkets();
available.loadAvailable();

