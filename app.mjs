import "./header/theme.mjs?v=a13bee668e78";
import * as dialog from "./header/dialog.mjs?v=a13bee668e78";
import "./header/github.mjs?v=a13bee668e78";
import "./header/share.mjs?v=a13bee668e78";
import * as dimensions from "./dimensions.mjs?v=a13bee668e78";
import * as available from "./available-markets/available.mjs?v=a13bee668e78";
import * as current from "./current-markets/current.mjs?v=a13bee668e78";
import "./opacity.mjs?v=a13bee668e78";
available.subscribe(current.addCurrentMarket);
available.subscribeCurrent(current.getCurrentMarkets, current.applyMarketMetadata);
dimensions.manage();
current.loadCurrentMarkets();
available.loadAvailable();

