import { createSlice } from "@reduxjs/toolkit"

const initialState = {
    nextGroup: [],
}

const productsSlice = createSlice({
    name: "products",
    initialState,
    reducers: {
        setNextProducts: (state, action) => {
            state.nextGroup = action.payload
        },
    }
})

export const {setNextProducts} = productsSlice.actions

export default productsSlice.reducer