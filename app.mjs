import "./header/theme.mjs?v=bed574eac4d1";
import * as dialog from "./header/dialog.mjs?v=bed574eac4d1";
import "./header/github.mjs?v=bed574eac4d1";
import "./header/share.mjs?v=bed574eac4d1";
import * as dimensions from "./dimensions.mjs?v=bed574eac4d1";
import * as available from "./available-markets/available.mjs?v=bed574eac4d1";
import * as current from "./current-markets/current.mjs?v=bed574eac4d1";
import "./opacity.mjs?v=bed574eac4d1";
available.subscribe(current.addCurrentMarket);
available.subscribeCurrent(current.getCurrentMarkets, current.applyMarketMetadata);
dimensions.manage();
current.loadCurrentMarkets();
available.loadAvailable();

