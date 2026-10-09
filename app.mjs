import "./header/theme.mjs?v=4ae14f326071";
import * as dialog from "./header/dialog.mjs?v=4ae14f326071";
import "./header/github.mjs?v=4ae14f326071";
import * as dimensions from "./dimensions.mjs?v=4ae14f326071";
import * as available from "./available-markets/available.mjs?v=4ae14f326071";
import * as current from "./current-markets/current.mjs?v=4ae14f326071";
import "./opacity.mjs?v=4ae14f326071";
available.subscribe(current.addCurrentMarket);
dimensions.manage();
current.loadCurrentMarkets();
available.loadAvailable();

