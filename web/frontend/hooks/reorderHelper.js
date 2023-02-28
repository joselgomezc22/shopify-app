class ReorderHelper {
  init = (displaySettings, productsArray, extraObj) => {

    // if moveToTop is true
    if (displaySettings.moveToTop) {
      let reOrdered = this.moveSelectedItemsToTop(productsArray,displaySettings.selectedItems);
      return reOrdered;
    }
    // if moveToBot is true
    if (displaySettings.moveToBottom) {
      let reOrdered = this.moveSelectedItemsToBot(productsArray,displaySettings.selectedItems);
      return reOrdered; 
    }
    if (displaySettings.moveToPosition && displaySettings.moveToPosition.number) {
      let reOrdered = this.moveSelectedItemsToPosition(productsArray,displaySettings.selectedItems,displaySettings.moveToPosition.number);
      return reOrdered;
    }
    if (displaySettings.moveToPage && displaySettings.moveToPage.number) {
      console.log(displaySettings);
      let reOrdered = this.moveSelectedItemsToPage(productsArray,displaySettings.selectedItems,displaySettings.moveToPage.number,extraObj);
      return reOrdered;
    }
  };
  moveSelectedItemsToPage = (products, selectedItems, position, obj) => {
    const selectedProducts = products.filter((product) =>
      selectedItems.includes(product.id)
    );
    const unselectedProducts = products.filter(
      (product) => !selectedItems.includes(product.id)
    );
    return [
      ...unselectedProducts.slice(0, position * obj.productPerPage),
      ...selectedProducts,
      ...unselectedProducts.slice(position * obj.productPerPage)
    ];
  };
  moveSelectedItemsToPosition = (products, selectedItems, position) => {
    const selectedProducts = products.filter((product) =>
      selectedItems.includes(product.id)
    );
    const unselectedProducts = products.filter(
      (product) => !selectedItems.includes(product.id)
    );
    return [
      ...unselectedProducts.slice(0, position),
      ...selectedProducts,
      ...unselectedProducts.slice(position)
    ];
  };
  moveSelectedItemsToTop = (products, selectedItems) => {
    const selectedProducts = products.filter((product) =>
      selectedItems.includes(product.id)
    );
    const unselectedProducts = products.filter(
      (product) => !selectedItems.includes(product.id)
    );
    return [...selectedProducts, ...unselectedProducts];
  };
  moveSelectedItemsToBot = (products, selectedItems) => {
    const selectedProducts = products.filter((product) =>
      selectedItems.includes(product.id)
    );
    const unselectedProducts = products.filter(
      (product) => !selectedItems.includes(product.id)
    );
    return [...unselectedProducts, ...selectedProducts];
  };
}
 
export default ReorderHelper;
