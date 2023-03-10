import { createSlice } from "@reduxjs/toolkit"

const initialState = {
    selectedCollection: "",
    arrayProducts: [],
    nextGroup: [],
    defaultArray: [],
    collectInfo: {
        type: "",
        totalProducts: null,
        sort_order: ""
    },
    loadedAllProducts: false
}

const productsSlice = createSlice({
    name: "products",
    initialState,
    reducers: {
        setNextProducts: (state, action) => {
            state.nextGroup = action.payload
            if((state.arrayProducts.length + state.nextGroup.length) === state.collectInfo.totalProducts){
                state.loadedAllProducts = true
            }else if(state.arrayProducts.length === 0){
                state.loadedAllProducts = false
            }
        },
        setArrayProducts: (state, action) => {
            state.arrayProducts = action.payload
            if(action.payload.length === state.collectInfo.totalProducts){
                state.loadedAllProducts = true
            }else if(state.arrayProducts.length === 0){
                state.loadedAllProducts = false
            }
        },
        setDefaultArray: (state, action) => {

        },
        setSelectedColl: (state, action) => {
            state.selectedCollection = action.payload
        },
        setcollectInfo: (state, action) => {
            state.collectInfo = action.payload
        },
        setLoaded: (state, action) => {
            state.loadedAllProducts = action.payload
        },
    }
})

export const { setNextProducts, setArrayProducts, setDefaultArray, setSelectedColl, setcollectInfo, setLoaded } = productsSlice.actions

export default productsSlice.reducer