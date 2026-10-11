import "./header/theme.mjs?v=bbf9fbbdbabc";
import * as dialog from "./header/dialog.mjs?v=bbf9fbbdbabc";
import "./header/github.mjs?v=bbf9fbbdbabc";
import * as dimensions from "./dimensions.mjs?v=bbf9fbbdbabc";
import * as available from "./available-markets/available.mjs?v=bbf9fbbdbabc";
import * as current from "./current-markets/current.mjs?v=bbf9fbbdbabc";
import "./opacity.mjs?v=bbf9fbbdbabc";
available.subscribe(current.addCurrentMarket);
dimensions.manage();
current.loadCurrentMarkets();
available.loadAvailable();

