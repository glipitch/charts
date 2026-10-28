import "./header/theme.mjs?v=910be8582395";
import * as dialog from "./header/dialog.mjs?v=910be8582395";
import "./header/github.mjs?v=910be8582395";
import "./header/share.mjs?v=910be8582395";
import * as dimensions from "./dimensions.mjs?v=910be8582395";
import * as available from "./available-markets/available.mjs?v=910be8582395";
import * as current from "./current-markets/current.mjs?v=910be8582395";
import "./opacity.mjs?v=910be8582395";
available.subscribe(current.addCurrentMarket);
available.subscribeCurrent(current.getCurrentMarkets, current.applyMarketMetadata);
dimensions.manage();
current.loadCurrentMarkets();
available.loadAvailable();

