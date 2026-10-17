import "./header/theme.mjs?v=297ad0c0252b";
import * as dialog from "./header/dialog.mjs?v=297ad0c0252b";
import "./header/github.mjs?v=297ad0c0252b";
import "./header/share.mjs?v=297ad0c0252b";
import * as dimensions from "./dimensions.mjs?v=297ad0c0252b";
import * as available from "./available-markets/available.mjs?v=297ad0c0252b";
import * as current from "./current-markets/current.mjs?v=297ad0c0252b";
import "./opacity.mjs?v=297ad0c0252b";
available.subscribe(current.addCurrentMarket);
available.subscribeCurrent(current.getCurrentMarkets, current.applyMarketMetadata);
dimensions.manage();
current.loadCurrentMarkets();
available.loadAvailable();

