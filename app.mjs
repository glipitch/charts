import "./header/theme.mjs?v=c76b1df3feb1";
import * as dialog from "./header/dialog.mjs?v=c76b1df3feb1";
import "./header/github.mjs?v=c76b1df3feb1";
import "./header/share.mjs?v=c76b1df3feb1";
import * as dimensions from "./dimensions.mjs?v=c76b1df3feb1";
import * as available from "./available-markets/available.mjs?v=c76b1df3feb1";
import * as current from "./current-markets/current.mjs?v=c76b1df3feb1";
import "./opacity.mjs?v=c76b1df3feb1";
available.subscribe(current.addCurrentMarket);
available.subscribeCurrent(current.getCurrentMarkets, current.applyMarketMetadata);
dimensions.manage();
current.loadCurrentMarkets();
available.loadAvailable();

