import "./header/theme.mjs?v=e698ad81464a";
import * as dialog from "./header/dialog.mjs?v=e698ad81464a";
import "./header/github.mjs?v=e698ad81464a";
import "./header/share.mjs?v=e698ad81464a";
import * as dimensions from "./dimensions.mjs?v=e698ad81464a";
import * as available from "./available-markets/available.mjs?v=e698ad81464a";
import * as current from "./current-markets/current.mjs?v=e698ad81464a";
import "./opacity.mjs?v=e698ad81464a";
import "./welcome.mjs?v=e698ad81464a";
available.subscribe(current.addCurrentMarket);
available.subscribeCurrent(current.getCurrentMarkets, current.applyMarketMetadata);
dimensions.manage();
current.loadCurrentMarkets();
available.loadAvailable();

