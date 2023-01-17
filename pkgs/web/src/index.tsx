import React from 'react';

import { MantineProvider } from '@mantine/core';
import { createRoot } from 'react-dom/client';

import { App } from './App';


createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
  <MantineProvider
      withGlobalStyles
      withNormalizeCSS
      theme={{
        colorScheme: 'light',
        colors: {
          // Add your color, 10 shades
          // tool: https://themera.vercel.app/ , https://smart-swatch.netlify.app/
          signature: ['#fff9db', '#ffecad', '#ffdf7e', '#fdd24c', '#fdc51b', '#e4ab02', '#b18500', '#7e5f00', '#4d3900', '#1c1300'],
        },
        primaryShade: 5,  // default: 6
        primaryColor: 'yellow',

        headings: {
          sizes: {
            h1: { fontSize: 30 },
          },
        },
        globalStyles: (theme) => ({
          'a': {
            color: theme.colors.blue[8],
          }
        })
      }}
    >
      <App />
    </MantineProvider>
  </React.StrictMode>
)
