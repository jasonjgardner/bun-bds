export type SubscribeEvents =
  | "AdditionalContentLoaded"
  | "AgentCommand"
  | "AgentCreated"
  | "ApiInit"
  | "AppPaused"
  | "AppResumed"
  | "AppSuspended"
  | "AwardAchievement"
  | "BlockBroken"
  | "BlockPlaced"
  | "BoardTextUpdated"
  | "BossKilled"
  | "CameraUsed"
  | "CauldronUsed"
  | "ChunkChanged"
  | "ChunkLoaded"
  | "ChunkUnloaded"
  | "ConfigurationChanged"
  | "ConnectionFailed"
  | "CraftingSessionCompleted"
  | "EndOfDay"
  | "EntitySpawned"
  | "FileTransmissionCancelled"
  | "FileTransmissionCompleted"
  | "FileTransmissionStarted"
  | "FirstTimeClientOpen"
  | "FocusGained"
  | "FocusLost"
  | "GameSessionComplete"
  | "GameSessionStart"
  | "HardwareInfo"
  | "HasNewContent"
  | "ItemAcquired"
  | "ItemCrafted"
  | "ItemDestroyed"
  | "ItemDropped"
  | "ItemEnchanted"
  | "ItemSmelted"
  | "ItemUsed"
  | "JoinCanceled"
  | "JukeboxUsed"
  | "LicenseCensus"
  | "MascotCreated"
  | "MenuShown"
  | "MobInteracted"
  | "MobKilled"
  | "MultiplayerConnectionStateChanged"
  | "MultiplayerRoundEnd"
  | "MultiplayerRoundStart"
  | "NpcPropertiesUpdated"
  | "OptionsUpdated"
  | "performanceMetrics"
  | "PackImportStage"
  | "PlayerBounced"
  | "PlayerDied"
  | "PlayerJoin"
  | "PlayerLeave"
  | "PlayerMessage"
  | "PlayerTeleported"
  | "PlayerTransform"
  | "PlayerTraveled"
  | "PortalBuilt"
  | "PortalUsed"
  | "PortfolioExported"
  | "PotionBrewed"
  | "PurchaseAttempt"
  | "PurchaseResolved"
  | "RegionalPopup"
  | "RespondedToAcceptContent"
  | "ScreenChanged"
  | "ScreenHeartbeat"
  | "SignInToEdu"
  | "SignInToXboxLive"
  | "SignOutOfXboxLive"
  | "SpecialMobBuilt"
  | "StartClient"
  | "StartWorld"
  | "TextToSpeechToggled"
  | "UgcDownloadCompleted"
  | "UgcDownloadStarted"
  | "UploadSkin"
  | "VehicleExited"
  | "WorldExported"
  | "WorldFilesListed"
  | "WorldGenerated"
  | "WorldLoaded"
  | "WorldUnloaded";

export type Axis = "x" | "y" | "z";

export type WssState = {
  currentRequestIdx: number;
  updatePending?: boolean;
  sendRate?: number;
  offset?: [number, number, number];
  useAbsolutePosition?: boolean;
  axis?: Axis;
  material?: string;
  enableBlockHistory?: boolean;
  blockHistory: Array<[number, number, number]>;
  blockHistoryMaxLength: number;
  functionLog?: string;
};

export interface WssParams {
  parameters: URLSearchParams;
  queueCommandRequest: (commandLine: string) => void;
  state?: WssState;
}
