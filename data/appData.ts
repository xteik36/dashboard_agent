import * as liveData from './liveData';
import * as mockData from './mockData';

const dataSource = import.meta.env.VITE_DATA_SOURCE === 'mock' ? 'mock' : 'live';
const selectedData = dataSource === 'mock' ? mockData : liveData;

export const DATA_SOURCE = dataSource;
export const LIVE_SELECTED_SPRINT =
  dataSource === 'mock' ? 'Sprint 36' : liveData.LIVE_SELECTED_SPRINT;

export const INITIAL_TASKS = selectedData.INITIAL_TASKS;
export const INITIAL_RISKS = selectedData.INITIAL_RISKS;
export const OWNER_RISK_EXPOSURE_DATA = selectedData.OWNER_RISK_EXPOSURE_DATA;
export const SPRINT_DATA = selectedData.SPRINT_DATA;

export const INITIAL_AUDIT_DOCS = mockData.INITIAL_AUDIT_DOCS;
export const INITIAL_FUNCTIONS = mockData.INITIAL_FUNCTIONS;
export const INITIAL_MEETINGS = mockData.INITIAL_MEETINGS;
