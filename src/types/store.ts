export interface StoreTheme {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  gradientFrom: string;
  gradientTo: string;
}

export interface StoreDefinition {
  id: string;
  name: string;
  rewardsProgram: {
    name: string;
    cardPrefix: string;
    memberIdLength: number;
  };
  theme: StoreTheme;
  emoji: string;
}

export interface LinkedStore {
  storeId: string;
  memberId: string;
  linkedAt: string;
  lastSyncAt: string;
  syncStatus: 'synced' | 'syncing' | 'error';
  isPrimary: boolean;
}
