import "./header/theme.mjs?v=2eeebaa694f4";
import * as dialog from "./header/dialog.mjs?v=2eeebaa694f4";
import "./header/github.mjs?v=2eeebaa694f4";
import * as dimensions from "./dimensions.mjs?v=2eeebaa694f4";
import * as available from "./available-markets/available.mjs?v=2eeebaa694f4";
import * as current from "./current-markets/current.mjs?v=2eeebaa694f4";
import "./opacity.mjs?v=2eeebaa694f4";
available.subscribe(current.addCurrentMarket);
available.subscribeCurrent(current.getCurrentMarkets, current.applyMarketMetadata);
dimensions.manage();
current.loadCurrentMarkets();
available.loadAvailable();

