import "./header/theme.mjs?v=e6b0ec3e8f0b";
import * as dialog from "./header/dialog.mjs?v=e6b0ec3e8f0b";
import "./header/github.mjs?v=e6b0ec3e8f0b";
import "./header/share.mjs?v=e6b0ec3e8f0b";
import * as dimensions from "./dimensions.mjs?v=e6b0ec3e8f0b";
import * as available from "./available-markets/available.mjs?v=e6b0ec3e8f0b";
import * as current from "./current-markets/current.mjs?v=e6b0ec3e8f0b";
import "./opacity.mjs?v=e6b0ec3e8f0b";
available.subscribe(current.addCurrentMarket);
available.subscribeCurrent(current.getCurrentMarkets, current.applyMarketMetadata);
dimensions.manage();
current.loadCurrentMarkets();
available.loadAvailable();

