import "./header/theme.mjs?v=f85cc399f4fb";
import * as dialog from "./header/dialog.mjs?v=f85cc399f4fb";
import "./header/github.mjs?v=f85cc399f4fb";
import "./header/share.mjs?v=f85cc399f4fb";
import * as dimensions from "./dimensions.mjs?v=f85cc399f4fb";
import * as available from "./available-markets/available.mjs?v=f85cc399f4fb";
import * as current from "./current-markets/current.mjs?v=f85cc399f4fb";
import "./opacity.mjs?v=f85cc399f4fb";
available.subscribe(current.addCurrentMarket);
available.subscribeCurrent(current.getCurrentMarkets, current.applyMarketMetadata);
dimensions.manage();
current.loadCurrentMarkets();
available.loadAvailable();

