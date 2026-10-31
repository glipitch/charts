import "./header/theme.mjs?v=aa1bcf55945e";
import * as dialog from "./header/dialog.mjs?v=aa1bcf55945e";
import "./header/github.mjs?v=aa1bcf55945e";
import "./header/share.mjs?v=aa1bcf55945e";
import * as dimensions from "./dimensions.mjs?v=aa1bcf55945e";
import * as available from "./available-markets/available.mjs?v=aa1bcf55945e";
import * as current from "./current-markets/current.mjs?v=aa1bcf55945e";
import "./opacity.mjs?v=aa1bcf55945e";
available.subscribe(current.addCurrentMarket);
available.subscribeCurrent(current.getCurrentMarkets, current.applyMarketMetadata);
dimensions.manage();
current.loadCurrentMarkets();
available.loadAvailable();

