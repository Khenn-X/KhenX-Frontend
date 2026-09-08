export interface CompareColumnState {
  error?: boolean;
  notFound?: boolean;
}

export const isRealCompareError = (state: CompareColumnState | undefined): boolean =>
  state?.error === true && state.notFound !== true;