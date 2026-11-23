import "./header/theme.mjs?v=b2fc3fb3165c";
import * as dialog from "./header/dialog.mjs?v=b2fc3fb3165c";
import "./header/github.mjs?v=b2fc3fb3165c";
import "./header/share.mjs?v=b2fc3fb3165c";
import * as dimensions from "./dimensions.mjs?v=b2fc3fb3165c";
import * as available from "./available-markets/available.mjs?v=b2fc3fb3165c";
import * as current from "./current-markets/current.mjs?v=b2fc3fb3165c";
import "./opacity.mjs?v=b2fc3fb3165c";
available.subscribe(current.addCurrentMarket);
available.subscribeCurrent(current.getCurrentMarkets, current.applyMarketMetadata);
dimensions.manage();
current.loadCurrentMarkets();
available.loadAvailable();

