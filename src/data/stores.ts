import type { StoreDefinition } from '../types/store';

export const STORES: StoreDefinition[] = [
  {
    id: 'kroger',
    name: 'Kroger',
    rewardsProgram: {
      name: 'Kroger Plus',
      cardPrefix: 'KRG',
      memberIdLength: 10,
    },
    theme: {
      primaryColor: '#004990',
      secondaryColor: '#FFFFFF',
      accentColor: '#E35205',
      gradientFrom: '#004990',
      gradientTo: '#0068D6',
    },
    emoji: '🛒',
  },
  {
    id: 'safeway',
    name: 'Safeway',
    rewardsProgram: {
      name: 'Club Card',
      cardPrefix: 'SFW',
      memberIdLength: 10,
    },
    theme: {
      primaryColor: '#E2231A',
      secondaryColor: '#FFFFFF',
      accentColor: '#003DA5',
      gradientFrom: '#E2231A',
      gradientTo: '#FF4D44',
    },
    emoji: '🏪',
  },
  {
    id: 'walmart',
    name: 'Walmart',
    rewardsProgram: {
      name: 'Walmart+ Rewards',
      cardPrefix: 'WMT',
      memberIdLength: 12,
    },
    theme: {
      primaryColor: '#0071CE',
      secondaryColor: '#FFC220',
      accentColor: '#004C91',
      gradientFrom: '#0071CE',
      gradientTo: '#0092FF',
    },
    emoji: '🌟',
  },
  {
    id: 'whole_foods',
    name: 'Whole Foods',
    rewardsProgram: {
      name: 'Prime Rewards',
      cardPrefix: 'WFM',
      memberIdLength: 10,
    },
    theme: {
      primaryColor: '#00674b',
      secondaryColor: '#FFFFFF',
      accentColor: '#F7941D',
      gradientFrom: '#00674b',
      gradientTo: '#009E73',
    },
    emoji: '🥬',
  },
  {
    id: 'trader_joes',
    name: "Trader Joe's",
    rewardsProgram: {
      name: 'Crew Rewards',
      cardPrefix: 'TJS',
      memberIdLength: 8,
    },
    theme: {
      primaryColor: '#C41230',
      secondaryColor: '#FFFFFF',
      accentColor: '#006847',
      gradientFrom: '#C41230',
      gradientTo: '#E83450',
    },
    emoji: '🌺',
  },
  {
    id: 'target',
    name: 'Target',
    rewardsProgram: {
      name: 'Target Circle',
      cardPrefix: 'TGT',
      memberIdLength: 9,
    },
    theme: {
      primaryColor: '#CC0000',
      secondaryColor: '#FFFFFF',
      accentColor: '#333333',
      gradientFrom: '#CC0000',
      gradientTo: '#FF1A1A',
    },
    emoji: '🎯',
  },
  {
    id: 'costco',
    name: 'Costco',
    rewardsProgram: {
      name: 'Executive Rewards',
      cardPrefix: 'CST',
      memberIdLength: 12,
    },
    theme: {
      primaryColor: '#E31837',
      secondaryColor: '#005DAA',
      accentColor: '#FFFFFF',
      gradientFrom: '#E31837',
      gradientTo: '#FF3B55',
    },
    emoji: '📦',
  },
  {
    id: 'publix',
    name: 'Publix',
    rewardsProgram: {
      name: 'Club Publix',
      cardPrefix: 'PBX',
      memberIdLength: 10,
    },
    theme: {
      primaryColor: '#3B8842',
      secondaryColor: '#FFFFFF',
      accentColor: '#F5A623',
      gradientFrom: '#3B8842',
      gradientTo: '#5AAF61',
    },
    emoji: '🍊',
  },
];
