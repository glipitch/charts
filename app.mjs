import "./header/theme.mjs?v=865e3d4657b9";
import * as dialog from "./header/dialog.mjs?v=865e3d4657b9";
import "./header/github.mjs?v=865e3d4657b9";
import "./header/share.mjs?v=865e3d4657b9";
import * as dimensions from "./dimensions.mjs?v=865e3d4657b9";
import * as available from "./available-markets/available.mjs?v=865e3d4657b9";
import * as current from "./current-markets/current.mjs?v=865e3d4657b9";
import "./opacity.mjs?v=865e3d4657b9";
import "./welcome.mjs?v=865e3d4657b9";
available.subscribe(current.addCurrentMarket);
available.subscribeCurrent(current.getCurrentMarkets, current.applyMarketMetadata);
dimensions.manage();
current.loadCurrentMarkets();
available.loadAvailable();

