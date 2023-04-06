import { MetaData } from '@substance/common/metadata';
import { create } from 'zustand';


export interface Page {
  url: string
  html: string
  meta: MetaData
}

export interface ExtractorStore {
  page: Page|null
}

export const useExtractorStore = create<ExtractorStore>()((set) => ({
  page: null,
}))
