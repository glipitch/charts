import "./header/theme.mjs?v=c2a4fb483601";
import * as dialog from "./header/dialog.mjs?v=c2a4fb483601";
import "./header/github.mjs?v=c2a4fb483601";
import "./header/share.mjs?v=c2a4fb483601";
import * as dimensions from "./dimensions.mjs?v=c2a4fb483601";
import * as available from "./available-markets/available.mjs?v=c2a4fb483601";
import * as current from "./current-markets/current.mjs?v=c2a4fb483601";
import "./opacity.mjs?v=c2a4fb483601";
available.subscribe(current.addCurrentMarket);
available.subscribeCurrent(current.getCurrentMarkets, current.applyMarketMetadata);
dimensions.manage();
current.loadCurrentMarkets();
available.loadAvailable();

