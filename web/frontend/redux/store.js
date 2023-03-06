import { configureStore } from '@reduxjs/toolkit'
import filterReducer from './slices/filterSlice'
import productsReducer from './slices/productsSlice'

export const store = configureStore({
  reducer: {
    filter: filterReducer,
    products: productsReducer
  },
})