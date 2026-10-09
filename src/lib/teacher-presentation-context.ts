import { createContext, useContext } from "react";
import { getTeacherHandMode, setTeacherHandMode, type TeacherHandMode } from "./teacher-hand-mode";

interface TeacherPresentationContextValue {
  laserPointerActive: boolean;
  handMode: TeacherHandMode;
  setHandMode: (mode: TeacherHandMode) => void;
}

export const TeacherPresentationContext = createContext<TeacherPresentationContextValue>({
  laserPointerActive: false,
  handMode: "left",
  setHandMode: () => {},
});

export function useTeacherPresentation(): TeacherPresentationContextValue {
  const ctx = useContext(TeacherPresentationContext);
  if (ctx) return ctx;
  return {
    laserPointerActive: false,
    handMode: getTeacherHandMode(),
    setHandMode: setTeacherHandMode,
  };
}
