import "./header/theme.mjs?v=ef01fe13c1eb";
import * as dialog from "./header/dialog.mjs?v=ef01fe13c1eb";
import "./header/github.mjs?v=ef01fe13c1eb";
import "./header/share.mjs?v=ef01fe13c1eb";
import * as dimensions from "./dimensions.mjs?v=ef01fe13c1eb";
import * as available from "./available-markets/available.mjs?v=ef01fe13c1eb";
import * as current from "./current-markets/current.mjs?v=ef01fe13c1eb";
import "./opacity.mjs?v=ef01fe13c1eb";
available.subscribe(current.addCurrentMarket);
available.subscribeCurrent(current.getCurrentMarkets, current.applyMarketMetadata);
dimensions.manage();
current.loadCurrentMarkets();
available.loadAvailable();

