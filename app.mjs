import "./header/theme.mjs?v=12d6ec78545e";
import * as dialog from "./header/dialog.mjs?v=12d6ec78545e";
import "./header/github.mjs?v=12d6ec78545e";
import "./header/share.mjs?v=12d6ec78545e";
import * as dimensions from "./dimensions.mjs?v=12d6ec78545e";
import * as available from "./available-markets/available.mjs?v=12d6ec78545e";
import * as current from "./current-markets/current.mjs?v=12d6ec78545e";
import "./opacity.mjs?v=12d6ec78545e";
available.subscribe(current.addCurrentMarket);
available.subscribeCurrent(current.getCurrentMarkets, current.applyMarketMetadata);
dimensions.manage();
current.loadCurrentMarkets();
available.loadAvailable();

