import { Options } from '@substance/common/extract';
import { create } from 'zustand';

import { extractManager } from './api';


export interface State {
  url: string
  title: string
  contentMarkdown: string
  extraData: any
  // setTitleAndContent: (title: string, contentMarkdown: string) => void
}

export const useStore = create<State>()((set) => ({
  url: '',
  title: '',
  contentMarkdown: '',
  extraData: null,
  // options: extractManager.getDefaultOptions(),

  /*
  setTitleAndContent: (title, contentMarkdown) =>
    set((state) => ({
      title,
      contentMarkdown,
    }))
  */
}))


export class OptionsManager {
  options: Options
  key = 'substance-extractor-options:wikipedia'

  constructor() {
    this.options = {...extractManager.getDefaultOptions(), ...this.readLS()}
  }

  updateOption(key: string, value: any) {
    this.options[key] = value
    this.writeLS()
  }

  readLS() {
    const raw = localStorage.getItem(this.key)
    if (raw) {
      return JSON.parse(raw)
    }
    return {}
  }

  writeLS() {
    localStorage.setItem(this.key, JSON.stringify(this.options))
  }
}
