import "./header/theme.mjs?v=6a88367c3ca9";
import * as dialog from "./header/dialog.mjs?v=6a88367c3ca9";
import "./header/github.mjs?v=6a88367c3ca9";
import "./header/share.mjs?v=6a88367c3ca9";
import * as dimensions from "./dimensions.mjs?v=6a88367c3ca9";
import * as available from "./available-markets/available.mjs?v=6a88367c3ca9";
import * as current from "./current-markets/current.mjs?v=6a88367c3ca9";
import "./opacity.mjs?v=6a88367c3ca9";
available.subscribe(current.addCurrentMarket);
available.subscribeCurrent(current.getCurrentMarkets, current.applyMarketMetadata);
dimensions.manage();
current.loadCurrentMarkets();
available.loadAvailable();

