import "./header/theme.mjs?v=fba6b13b20ea";
import * as dialog from "./header/dialog.mjs?v=fba6b13b20ea";
import "./header/github.mjs?v=fba6b13b20ea";
import "./header/share.mjs?v=fba6b13b20ea";
import * as dimensions from "./dimensions.mjs?v=fba6b13b20ea";
import * as available from "./available-markets/available.mjs?v=fba6b13b20ea";
import * as current from "./current-markets/current.mjs?v=fba6b13b20ea";
import "./opacity.mjs?v=fba6b13b20ea";
import "./welcome.mjs?v=fba6b13b20ea";
available.subscribe(current.addCurrentMarket);
available.subscribeCurrent(current.getCurrentMarkets, current.applyMarketMetadata);
dimensions.manage();
current.loadCurrentMarkets();
available.loadAvailable();

