import "./header/theme.mjs?v=bee61d58d306";
import * as dialog from "./header/dialog.mjs?v=bee61d58d306";
import "./header/github.mjs?v=bee61d58d306";
import "./header/share.mjs?v=bee61d58d306";
import * as dimensions from "./dimensions.mjs?v=bee61d58d306";
import * as available from "./available-markets/available.mjs?v=bee61d58d306";
import * as current from "./current-markets/current.mjs?v=bee61d58d306";
import "./opacity.mjs?v=bee61d58d306";
available.subscribe(current.addCurrentMarket);
available.subscribeCurrent(current.getCurrentMarkets, current.applyMarketMetadata);
dimensions.manage();
current.loadCurrentMarkets();
available.loadAvailable();

