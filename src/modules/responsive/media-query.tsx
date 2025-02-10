import {PropsWithChildren} from "react";
import {useMediaQuery} from "react-responsive";

export function MediaVisibleSM({children}: PropsWithChildren) {
  return useMediaQuery({ minWidth: 640 + 1 }) ? children : null;
}

export function MediaVisibleMD({ children }: PropsWithChildren) {
  return useMediaQuery({ minWidth: 768 + 1 }) ? children : null;
}

export function MediaVisibleLG({ children }: PropsWithChildren) {
  return useMediaQuery({ maxWidth: 1024 + 1 }) ? children : null;
}

export function MediaVisibleXL({ children }: PropsWithChildren) {
  return useMediaQuery({ minWidth: 1280 + 1 }) ? children : null;
}

export function MediaVisible2XL({ children }: PropsWithChildren) {
  return useMediaQuery({ minWidth: 1536 + 1 }) ? children : null;
}

export function MediaHiddenSM({children}: PropsWithChildren) {
  return useMediaQuery({ maxWidth: 640 }) ? children : null;
}

export function MediaHiddenMD({ children }: PropsWithChildren) {
  return useMediaQuery({ maxWidth: 768 }) ? children : null;
}

export function MediaHiddenLG({ children }: PropsWithChildren) {
  return useMediaQuery({ maxWidth: 1024 }) ? children : null;
}

export function MediaHiddenXL({ children }: PropsWithChildren) {
  return useMediaQuery({ maxWidth: 1280 }) ? children : null;
}

export function MediaHidden2XL({ children }: PropsWithChildren) {
  return useMediaQuery({ maxWidth: 1536 }) ? children : null;
}
