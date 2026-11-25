import "./header/theme.mjs?v=2e9671392e45";
import * as dialog from "./header/dialog.mjs?v=2e9671392e45";
import "./header/github.mjs?v=2e9671392e45";
import "./header/share.mjs?v=2e9671392e45";
import * as dimensions from "./dimensions.mjs?v=2e9671392e45";
import * as available from "./available-markets/available.mjs?v=2e9671392e45";
import * as current from "./current-markets/current.mjs?v=2e9671392e45";
import "./opacity.mjs?v=2e9671392e45";
available.subscribe(current.addCurrentMarket);
available.subscribeCurrent(current.getCurrentMarkets, current.applyMarketMetadata);
dimensions.manage();
current.loadCurrentMarkets();
available.loadAvailable();

