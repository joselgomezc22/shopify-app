export const chunks = function* (arr, n) {
  for (let i = 0; i < arr.length; i += n) {
    yield arr.slice(i, i + n);
  }
}

export const reorderAPI = async (selectedCollection, toChange) => {
  try {
    const response = await fetch("/api/shopify/products/reorder", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        collection_id: selectedCollection,
        toChange,
      }),
    });
    console.log("order", response);
    //toggleActiveToastOrder();
  } catch (error) {
    console.log(error);
  }
}

export const reorderAPIMultiple = (selectedCollection, toChangeChunks) => fetch("/api/shopify/products/reorder", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    collection_id: selectedCollection,
    toChange: toChangeChunks[i],
  }),
})