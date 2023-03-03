export const sortBy = (filter, productsArray,setProductsArray) => {
    switch (filter) {
        case "taz":
          setProductsArray([...productsArray.sort((a, b) => a.title.localeCompare(b.title))])
          break
        case "tza":
          setProductsArray([...productsArray.sort((a, b) => b.title.localeCompare(a.title))])
          break
        case "vaz":
          setProductsArray([...productsArray.sort((a, b) => a.vendor.localeCompare(b.vendor))])
          break
        case "vza":
          setProductsArray([...productsArray.sort((a, b) => b.vendor.localeCompare(a.vendor))])
          break
        case "nc":
          setProductsArray([...productsArray.sort((a, b) => new Date(b.variants[0].created_at
          ) - new Date(a.variants[0].created_at
          ))])
          break
        case "oc":
          setProductsArray
            ([...productsArray.sort((a, b) => new Date(a.variants[0].created_at
            ) - new Date(b.variants[0].created_at
            ))])
          break
        case "np":
          setProductsArray([...productsArray.sort((a, b) => new Date(b.published_at) - new Date(a.published_at))])
          break
        case "op":
          setProductsArray([...productsArray.sort((a, b) => new Date(a.published_at) - new Date(b.published_at))])
          break
        case "hp":
          setProductsArray([...productsArray.sort((a, b) => (+b.variants[0].price) - (+a.variants[0].price))])
          break
        case "lp":
          setProductsArray([...productsArray.sort((a, b) => (+a.variants[0].price) - (+b.variants[0].price))])
          break
        case "hi":
          setProductsArray([...productsArray.sort((a, b) => b.variants.reduce((total, variant) => total + variant.inventory_quantity
            , 0) - a.variants.reduce((total, variant) => total + variant.inventory_quantity
              , 0))])
          break
        case "li":
          setProductsArray([...productsArray.sort((a, b) => a.variants.reduce((total, variant) => total + variant.inventory_quantity
            , 0) - b.variants.reduce((total, variant) => total + variant.inventory_quantity
              , 0))])
          break
      }
}