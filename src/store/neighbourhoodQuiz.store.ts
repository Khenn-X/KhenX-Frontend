import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface NeighbourhoodQuizInputs {
  budget: string;
  priority: string;
  commute: string;
  workLocation: string;
}

interface NeighbourhoodQuizState extends NeighbourhoodQuizInputs {
  setInputs: (inputs: Partial<NeighbourhoodQuizInputs>) => void;
  clearInputs: () => void;
}

const EMPTY_INPUTS: NeighbourhoodQuizInputs = {
  budget: '',
  priority: '',
  commute: '',
  workLocation: '',
};

export const useNeighbourhoodQuizStore = create<NeighbourhoodQuizState>()(
  persist(
    (set) => ({
      ...EMPTY_INPUTS,
      setInputs: (inputs) => set(inputs),
      clearInputs: () => set(EMPTY_INPUTS),
    }),
    { name: 'khenx-neighbourhood-quiz' },
  ),
);