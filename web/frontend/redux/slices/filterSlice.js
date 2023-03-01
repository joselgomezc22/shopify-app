import { createSlice } from "@reduxjs/toolkit"

const initialState = {
    filter: "",
    order: ""
}

const filterSlice = createSlice({
    name: "filter",
    initialState,
    reducers: {
        setFilter: (state, action) => {
            state.filter = action.payload
        },
        setOrder: (state, action) => {
            state.order = action.payload
        }
    }
})

export const {setFilter, setOrder} = filterSlice.actions

export default filterSlice.reducer