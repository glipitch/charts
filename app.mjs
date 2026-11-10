import "./header/theme.mjs?v=58864121ca7f";
import * as dialog from "./header/dialog.mjs?v=58864121ca7f";
import "./header/github.mjs?v=58864121ca7f";
import "./header/share.mjs?v=58864121ca7f";
import * as dimensions from "./dimensions.mjs?v=58864121ca7f";
import * as available from "./available-markets/available.mjs?v=58864121ca7f";
import * as current from "./current-markets/current.mjs?v=58864121ca7f";
import "./opacity.mjs?v=58864121ca7f";
available.subscribe(current.addCurrentMarket);
available.subscribeCurrent(current.getCurrentMarkets, current.applyMarketMetadata);
dimensions.manage();
current.loadCurrentMarkets();
available.loadAvailable();

