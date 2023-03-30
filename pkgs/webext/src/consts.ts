export enum MsgType {
  Ping = 'Ping',
  // for background
  EnsurePageReady = 'EnsurePageReady',
  // for background, content_script, and extractor
  ExtractCurrentPage0 = 'ExtractCurrentPageStep0-backgroundToContentScript',
  ExtractCurrentPage1 = 'ExtractCurrentPageStep1-contentScriptToExtractor',
}
