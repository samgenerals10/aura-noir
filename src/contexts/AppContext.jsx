/**
 * AppContext
 *
 * WHAT IT DOES
 * - Stores UI state shared across the app (right now: sidebar open/close).
 * - Provides `sidebarOpen` and `toggleSidebar` to any component that calls `useAppContext()`.
 *
 * WHERE IT’S CONNECTED
 * - Wrap your app with <AppProvider> (usually in main.jsx or App.jsx)
 * - Any component can do:
 *     const { sidebarOpen, toggleSidebar } = useAppContext()
 *   to read state + toggle it.
 */

import React, { createContext, useContext, useState } from "react";

/**
 * Default context value.
 * This prevents crashes if someone calls useAppContext() outside the provider,
 * but you should still ensure <AppProvider> wraps the app.
 */
const AppContext = createContext({
  sidebarOpen: false,
  toggleSidebar: () => {},
});

/**
 * Custom hook so you don't import useContext(AppContext) everywhere.
 */
export const useAppContext = () => useContext(AppContext);

/**
 * Provider component that holds the real state.
 */
export const AppProvider = ({ children }) => {
  // Shared UI state: is the sidebar open?
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Flip open/close state.
  const toggleSidebar = () => setSidebarOpen((prev) => !prev);

  return (
    <AppContext.Provider value={{ sidebarOpen, toggleSidebar }}>
      {children}
    </AppContext.Provider>
  );
};
