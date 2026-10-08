import "./header/theme.mjs?v=e5e8dd98c0fa";
import * as dialog from "./header/dialog.mjs?v=e5e8dd98c0fa";
import "./header/github.mjs?v=e5e8dd98c0fa";
import * as dimensions from "./dimensions.mjs?v=e5e8dd98c0fa";
import * as available from "./available-markets/available.mjs?v=e5e8dd98c0fa";
import * as current from "./current-markets/current.mjs?v=e5e8dd98c0fa";
import "./opacity.mjs?v=e5e8dd98c0fa";
available.subscribe(current.addCurrentMarket);
dimensions.manage();
current.loadCurrentMarkets();
available.loadAvailable();

