import { createContext, useContext } from "react";

export const ChromeContext = createContext(false);

export function useInAppChrome() {
  return useContext(ChromeContext);
}
