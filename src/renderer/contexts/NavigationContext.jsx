import React, { createContext, useContext, useState } from 'react';

const NavigationContext = createContext();

export const useNavigation = () => {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
};

export const NavigationProvider = ({ children }) => {
  const [showJiraStatusConfig, setShowJiraStatusConfig] = useState(false);

  const openJiraStatusConfig = () => {
    setShowJiraStatusConfig(true);
  };

  const closeJiraStatusConfig = () => {
    setShowJiraStatusConfig(false);
  };

  const value = {
    showJiraStatusConfig,
    openJiraStatusConfig,
    closeJiraStatusConfig
  };

  return (
    <NavigationContext.Provider value={value}>
      {children}
    </NavigationContext.Provider>
  );
};
