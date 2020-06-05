export const IS_DEBUG =
    (typeof window !== "undefined" && window.location.search.indexOf("isdebug") >= 0) ||
    (G_IS_DEV &&
        typeof window !== "undefined" &&
        window.location.port === "3005" &&
        (window.location.host.indexOf("localhost:") >= 0 ||
            window.location.host.indexOf("192.168.0.") >= 0) &&
        window.location.search.indexOf("nodebug") < 0);

export const IS_DEMO =
    (G_IS_PROD &&
        !G_IS_STANDALONE &&
        !(typeof window !== "undefined" && window.location.search.indexOf("nodemo") >= 0)) ||
    (typeof window !== "undefined" && window.location.search.indexOf("isdemo") >= 0);

const smoothCanvas = true;

export const THIRDPARTY_URLS = {
    discord: "https://discord.gg/HN7EVzV",
    github: "https://github.com/tobspr/shapez.io",

    // standaloneStorePage: "https://steam.shapez.io",
    standaloneStorePage: "https://tobspr.itch.io/shapez.io",
};

export const globalConfig = {
    // Size of a single tile in Pixels.
    // NOTICE: Update webpack.production.config too!
    tileSize: 32,
    halfTileSize: 16,

    // Which dpi the assets have
    assetsDpi: 192 / 32,
    assetsSharpness: 1.2,
    shapesSharpness: 1.4,

    // Production analytics
    statisticsGraphDpi: 2.5,
    statisticsGraphSlices: 100,
    analyticsSliceDurationSeconds: 10,

    minimumTickRate: 25,
    maximumTickRate: 500,

    // Map
    mapChunkSize: 16,
    mapChunkPrerenderMinZoom: 1.15,
    mapChunkOverviewMinZoom: 0.7,

    // Belt speeds
    // NOTICE: Update webpack.production.config too!
    beltSpeedItemsPerSecond: 1,
    itemSpacingOnBelts: 0.63,
    minerSpeedItemsPerSecond: 0, // COMPUTED

    undergroundBeltMaxTilesByTier: [5, 8],

    buildingSpeeds: {
        cutter: 1 / 4,
        cutterQuad: 1 / 4,
        rotater: 1 / 1,
        rotaterCCW: 1 / 1,
        painter: 1 / 6,
        painterDouble: 1 / 8,
        sorter: 1 / 1,
        painterQuad: 1 / 8,
        mixer: 1 / 5,
        stacker: 1 / 6,
    },

    // Zooming
    initialZoom: 2,
    minZoomLevel: 0.125,
    maxZoomLevel: 4,

    // Global game speed
    gameSpeed: 1,

    warmupTimeSecondsFast: 0.1,
    warmupTimeSecondsRegular: 1,

    smoothing: {
        smoothMainCanvas: smoothCanvas && true,
        quality: "low", // Low is CRUCIAL for mobile performance!
    },

    rendering: {},

    debug: {
        /* dev:start */

        // Settings menu is generated *automatically*,
        // but does not changes globalConfig.debug if enableDebugSettings is off
        // DEFAULT VALUES:
        enableDebugSettings: true,
        
        // UI
        waitForImages: true,
        showChunkBorders: false,
        disableZoomLimits: false,
        disableShortNumbers: false,

        // FEATURE
        disableSavegameWrite: false,
        disableUnlockDialog: false,
        disableTutorialHints: false,
        disableUpgradeNotification: false,
        disableDynamicTickrate: false,
        fastGameEnter: false,
        pauseGameOnFastEnter: false,

        // ASSERT
        disableInternalCheckTile: false,
        disableGetTileAsserts: false,
        disableBeltAsserts: false,

        // CHEATS
        rewardsInstant: false,
        allBuildingsUnlocked: false,
        blueprintsNoCost: true,
        upgradesNoCost: false,
        instantBelts: false,
        instantProcessors: false,
        instantMiners: false,

        // TEST
        noArtificialDelays: false,
        showEntityBounds: false,
        showAcceptorEjectors: false,
        disableMusic: false,
        doNotRenderStatics: false,
        disableLogicTicks: false,
        testClipping: false,
        testTranslations: false,
        enableEntityInspector: false,
        testAds: false,
        disableMapOverview: false,
        disableBulkOperations: false,

        // framePausesBetweenTicks: 40,

        renderForTrailer: false,
        /* dev:end */
    },

    // Secret vars
    info: {
        // Binary file salt
        file: "Ec'])@^+*9zMevK3uMV4432x9%iK'=",

        // Savegame salt
        sgSalt: "}95Q3%8/.837Lqym_BJx%q7)pAHJbF",

        // Analytics key
        analyticsApiKey: "baf6a50f0cc7dfdec5a0e21c88a1c69a4b34bc4a",
    },
};

export const IS_MOBILE = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

// Automatic calculations

globalConfig.minerSpeedItemsPerSecond = globalConfig.beltSpeedItemsPerSecond / 5;

if (globalConfig.debug.disableMapOverview) {
    globalConfig.mapChunkOverviewMinZoom = 0;
    globalConfig.mapChunkPrerenderMinZoom = 0;
}

if (G_IS_DEV && globalConfig.debug.renderForTrailer) {
    globalConfig.debug.framePausesBetweenTicks = 32;
    // globalConfig.mapChunkOverviewMinZoom = 0.0;
    // globalConfig.mapChunkPrerenderMinZoom = globalConfig.mapChunkOverviewMinZoom;
    // globalConfig.debug.instantBelts = true;
    // globalConfig.debug.instantProcessors = true;
    // globalConfig.debug.instantMiners = true;
    globalConfig.debug.disableSavegameWrite = true;
    // globalConfig.beltSpeedItemsPerSecond *= 2;
}
