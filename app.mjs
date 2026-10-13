import "./header/theme.mjs?v=4f5e1c356323";
import * as dialog from "./header/dialog.mjs?v=4f5e1c356323";
import "./header/github.mjs?v=4f5e1c356323";
import * as dimensions from "./dimensions.mjs?v=4f5e1c356323";
import * as available from "./available-markets/available.mjs?v=4f5e1c356323";
import * as current from "./current-markets/current.mjs?v=4f5e1c356323";
import "./opacity.mjs?v=4f5e1c356323";
available.subscribe(current.addCurrentMarket);
dimensions.manage();
current.loadCurrentMarkets();
available.loadAvailable();

