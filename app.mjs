import "./header/theme.mjs?v=98c895101b74";
import * as dialog from "./header/dialog.mjs?v=98c895101b74";
import "./header/github.mjs?v=98c895101b74";
import "./header/share.mjs?v=98c895101b74";
import * as dimensions from "./dimensions.mjs?v=98c895101b74";
import * as available from "./available-markets/available.mjs?v=98c895101b74";
import * as current from "./current-markets/current.mjs?v=98c895101b74";
import "./opacity.mjs?v=98c895101b74";
available.subscribe(current.addCurrentMarket);
available.subscribeCurrent(current.getCurrentMarkets, current.applyMarketMetadata);
dimensions.manage();
current.loadCurrentMarkets();
available.loadAvailable();

