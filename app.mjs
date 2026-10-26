import "./header/theme.mjs?v=3dc27d15579f";
import * as dialog from "./header/dialog.mjs?v=3dc27d15579f";
import "./header/github.mjs?v=3dc27d15579f";
import "./header/share.mjs?v=3dc27d15579f";
import * as dimensions from "./dimensions.mjs?v=3dc27d15579f";
import * as available from "./available-markets/available.mjs?v=3dc27d15579f";
import * as current from "./current-markets/current.mjs?v=3dc27d15579f";
import "./opacity.mjs?v=3dc27d15579f";
available.subscribe(current.addCurrentMarket);
available.subscribeCurrent(current.getCurrentMarkets, current.applyMarketMetadata);
dimensions.manage();
current.loadCurrentMarkets();
available.loadAvailable();

