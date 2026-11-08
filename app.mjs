import "./header/theme.mjs?v=570fc7bce8dd";
import * as dialog from "./header/dialog.mjs?v=570fc7bce8dd";
import "./header/github.mjs?v=570fc7bce8dd";
import "./header/share.mjs?v=570fc7bce8dd";
import * as dimensions from "./dimensions.mjs?v=570fc7bce8dd";
import * as available from "./available-markets/available.mjs?v=570fc7bce8dd";
import * as current from "./current-markets/current.mjs?v=570fc7bce8dd";
import "./opacity.mjs?v=570fc7bce8dd";
available.subscribe(current.addCurrentMarket);
available.subscribeCurrent(current.getCurrentMarkets, current.applyMarketMetadata);
dimensions.manage();
current.loadCurrentMarkets();
available.loadAvailable();

