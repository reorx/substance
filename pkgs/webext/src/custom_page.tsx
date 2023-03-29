import React from 'react';
import { createRoot } from 'react-dom/client';

import { colors, getLogger } from './utils/log';


const lg = getLogger('custom_page', colors.bgYellowBright)

lg.info('custom_page.ts')


export default function CustomPage() {
  return (
    <div>
      <h1>Welcome to my app</h1>
    </div>
  );
}


const root = createRoot(document.getElementById("root")!);

root.render(
  <React.StrictMode>
    <CustomPage />
  </React.StrictMode>
);
