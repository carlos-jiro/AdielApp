import { devtools } from 'zustand/middleware';
import type { AppState } from './types';
import { create } from 'zustand';

//Slices
import { createPlayerSlice } from './slices/createPlayerSlice';
import { createUserSlice } from './slices/createUserSlice';
import { createDataSlice } from './slices/createDataSlice';

export const useAppStore = create<AppState>()(
  // Debbugging middleware
  devtools( 
    (...a) => ({
      ...createPlayerSlice(...a),
      ...createUserSlice(...a),
      ...createDataSlice(...a),
    }),
    { name: 'CoroProStore' }
  )
);