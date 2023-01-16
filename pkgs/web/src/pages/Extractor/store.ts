import { create } from 'zustand';


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
