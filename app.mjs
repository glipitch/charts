import "./header/theme.mjs?v=eab82fc427d2";
import * as dialog from "./header/dialog.mjs?v=eab82fc427d2";
import "./header/github.mjs?v=eab82fc427d2";
import "./header/share.mjs?v=eab82fc427d2";
import * as dimensions from "./dimensions.mjs?v=eab82fc427d2";
import * as available from "./available-markets/available.mjs?v=eab82fc427d2";
import * as current from "./current-markets/current.mjs?v=eab82fc427d2";
import "./opacity.mjs?v=eab82fc427d2";
import "./welcome.mjs?v=eab82fc427d2";
available.subscribe(current.addCurrentMarket);
available.subscribeCurrent(current.getCurrentMarkets, current.applyMarketMetadata);
dimensions.manage();
current.loadCurrentMarkets();
available.loadAvailable();

