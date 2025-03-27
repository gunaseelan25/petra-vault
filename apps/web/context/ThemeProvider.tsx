'use client';

import * as React from 'react';

import {
  ThemeProvider as NextThemesProvider,
  type ThemeProviderProps,
  useTheme
} from 'next-themes';

const ThemeProvider = ({ children, ...props }: ThemeProviderProps) => {
  return (
    <NextThemesProvider defaultTheme="light" {...props}>
      {children}
    </NextThemesProvider>
  );
};

export { ThemeProvider, useTheme };
