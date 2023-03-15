import { useState, useEffect, useRef, useContext, useCallback } from "react";
import {
  Stack,
  Card,
  Grid,
  Pagination,
  Button,
  Layout,
  TextContainer,
  Modal,
  TextField,
  Toast,
  Frame
} from "@shopify/polaris";
import { ProductCard } from "./ProductCard";
import { ContextData } from "../../Routes";
import { useAuthenticatedFetch } from "../../hooks";
import ReorderHelper from "../../hooks/reorderHelper";

import Sortable, { MultiDrag, Swap } from "sortablejs";
import { useSelector } from "react-redux";
import { sortBy } from "../../hooks/SortByHelper";
import { chunks } from "../../utils/tools";

const ProductsRender = ({
  api,
  selectedCollection,
  allProducts,
  productWithVariants,
  productBackup,
  onEndHandler,
  openBulkModal,
  setOpenBulkModal,
  columns,
  productPerPage,
  displaySettings,
  InventoryLevels,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [productsPerPage] = useState(productPerPage);
  const [paginatedProducts, setPaginatedProducts] = useState([]);

  const gridEl = useRef();
  const auxInputCurrentPage = useRef();
  const auxInputProductsPerPage = useRef();

  const [productsBackup, setProductsBackup] = useState(
    JSON.stringify(allProducts)
  );
  const [productsArray, setProductsArray] = useState(allProducts);

  const { mountedSort, setMountedSort } = useContext(ContextData);
  const [enableFixedBar, setEnableFixedBar] = useState(false);
  const [enableBulkBar, setEnableBulkBar] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]); // selected Items
  const [selectedItemsBackup, setSelectedItemsBackup] = useState([]); // selected Items
  const [toChangeItems, setToChangeItems] = useState([]); // array of changed items

  //redux state
  const filterState = useSelector(state => state.filter)
  const productsState = useSelector(state => state.products)
  //toast 
  const [activeToast, setActiveToast] = useState(false);
  const toggleActiveToast = useCallback(() => setActiveToast((activeToast) => !activeToast), []);
  const [activeToastOrder, setActiveToastOrder] = useState(false);
  const toggleActiveToastOrder = useCallback(() => setActiveToastOrder((activeToastOrder) => !activeToastOrder), []);


  const [valueNumber, setValueNumber] = useState(0);
  const reorderHelper = new ReorderHelper();
  const handleChangeNumber = useCallback(
    (newValue) => setValueNumber(newValue),
    []
  );
  const handleChangeArray = useCallback(
    (newValue) => setProductsArray(newValue),

    []
  );

  const [activeModal, setActiveModal] = useState(false);

  const fetch = useAuthenticatedFetch();

  const handleClick = useCallback((event) => {
    if (!event.target.closest("#grid")) {
      event.preventDefault();
      event.stopPropagation();
    }
  }, []);

  useEffect(_ => {
    /*  setProductsArray([...productsArray, ...productsState.nextGroup]) */
    sortBy(filterState.filter, productsArray, setProductsArray)
    // probe if sort is correct
    console.log(productsArray.map(item => item.variants[0].created_at
    ))
    if (filterState.filter) {
      setEnableFixedBar(true)
    }
    // probe quantity sort with reduce
    /* console.log(productsArray.map(item => item.variants.reduce((total, variant) => total + variant.inventory_quantity
      , 0))) */
  }, [filterState])
  useEffect(_ => {
    if (productsState.loadedAllProducts) {
      console.log("loaded all products")
      toggleActiveToast()
      setProductsArray([...productsArray, ...productsState.nextGroup])
    }
  }, [productsState.loadedAllProducts])
  useEffect(() => {
    console.log(productsArray)
    if (displaySettings.selectedItems && displaySettings.selectedItems.length > 0) {
      let reOrdered = reorderHelper.init(displaySettings, productsArray, { productPerPage, currentPage });
      if (reOrdered.length > 0) {
        setProductsArray(reOrdered);
      }
    }
  }, [displaySettings]);
  useEffect(() => {
    if (openBulkModal) {
      setActiveModal(true);
      setSelectedItemsBackup(selectedItems);
    }
  }, [openBulkModal]);

  useEffect(() => {
    let productsArrayMap = allProducts.map((product) => {
      let images = product.images.map((image) => {
        return { src: image.src };
      });

      return {
        id: product.id,
        images: images,
        title: product.title,
        product_type: product.product_type,
        vendor: product.vendor,
        published_at: product.published_at,
        variants: product.variants,
      };
    });

    setProductsArray(productsArrayMap);
    setProductsBackup(JSON.stringify(productsArrayMap));
  }, [allProducts]);

  useEffect(() => {
    const indexOfLastProduct = currentPage * productPerPage;
    const indexOfFirstProduct = indexOfLastProduct - productPerPage;
    const currentProducts = productsArray.slice(
      indexOfFirstProduct,
      indexOfLastProduct
    );
    console.log(indexOfLastProduct);
    setPaginatedProducts(currentProducts);
  }, [currentPage, productsArray, productPerPage]);

  useEffect(() => {
    const handleChange = (e) => {
      setEnableFixedBar(true);
      const indexOfLastProduct =
        auxInputCurrentPage.current.value *
        auxInputProductsPerPage.current.value;
      const indexOfFirstProduct =
        indexOfLastProduct - auxInputProductsPerPage.current.value;
      if (e.oldIndicies.length > 1) {
        e.oldIndicies.forEach(
          (element, i) => {
            var element = e.items[i];

            let id = element.id;
            let newIndex = e.newIndicies[i].index;
            let oldIndex = e.oldIndicies[i].index;

            let objectIndex = toChangeItems.findIndex(
              (object) => object.id === id
            );

            if (objectIndex > -1) {
              toChangeItems[objectIndex] = {
                id: id,
                position: newIndex + indexOfFirstProduct,
              };
              setToChangeItems(toChangeItems);
            } else {
              toChangeItems.push({
                id: id,
                position: newIndex + indexOfFirstProduct,
              });
              setToChangeItems(toChangeItems);
            }

            let productsArrayF = productsArray;
            let reorderArray = reorderProducts(
              productsArrayF,
              oldIndex + indexOfFirstProduct,
              newIndex + indexOfFirstProduct
            );
            setProductsArray(reorderArray);
            console.log(oldIndex + indexOfFirstProduct);
          },
          () => {
            console.log("loop finished");
          }
        );
      } else {
        let id = e.item.id;
        let { oldIndex, newIndex } = e;

        let objectIndex = toChangeItems.findIndex((object) => object.id === id);
        if (objectIndex > -1) {
          toChangeItems[objectIndex] = {
            id: id,
            position: newIndex + indexOfFirstProduct,
          };
          setToChangeItems(toChangeItems);
        } else {
          toChangeItems.push({
            id: id,
            position: newIndex + indexOfFirstProduct,
          });
          setToChangeItems(toChangeItems);
        }

        let productsArrayF = productsArray;
        let reorderArray = reorderProducts(
          productsArrayF,
          oldIndex + indexOfFirstProduct,
          newIndex + indexOfFirstProduct
        );
        setProductsArray(reorderArray);
      }
    };

    const onChooseHandler = (event) => {
      //console.log("Choose Event");
      let newObject = { id: event.item.id, index: event.oldIndex };

      let objectIndex = selectedItems.findIndex(
        (object) => object.id === newObject.id
      );

      if (objectIndex > -1) {
      } else {
        console.log("added");
        let handleSelected = selectedItems;
        console.log(handleSelected);
        handleSelected.push(newObject);
        setSelectedItems(handleSelected);
        console.log(selectedItems);
      }
    };

    if (gridEl) {
      /*if (!mountedSort) {
        Sortable.mount(new MultiDrag(), new Swap());
        setMountedSort(true);
      }

      Sortable.create(gridEl.current, {
        multiDrag: true,
        selectedClass: "selected",
        onEnd: (event) => {
          console.log("on end dispatched");
          handleChange(event);
          //setSelectedItems([]);

          //handleSortEnd(event);
        },
        onChoose: onChooseHandler,
        onDeselect: handleUnselect,
      });*/
    }
  }, [productsArray, productsBackup, allProducts, selectedItems]);

  const saveOrderingChanges = async () => {
    /* setToChangeItems([]);
    setEnableFixedBar(false);
    const body = { toChange: toChangeItems };
    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    };
    const response = await fetch(
      "/api/shopify/products/reorder",
      requestOptions
    ); */
    setEnableFixedBar(false)
    const toChange = productsArray.map(({ id }, index) => {
      return {
        id,
        position: index
      }
    })
    if (toChange.length > 250) {
      const iterations = Math.ceil(toChange.length / 250)
      const toChangeChunks = [...chunks(toChange, 250)]
      let promises = []
      for (let i = 0; i < iterations; i++) {
        promises = [...promises, fetch("/api/shopify/products/reorder",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              collection_id: selectedCollection,
              toChange: toChangeChunks[i]
            })
          })];
        console.log("chunk", toChangeChunks[i])
      }
      Promise.all(promises)
        .then(res => {
          console.log("good", res)
          toggleActiveToastOrder()
        }).catch(err => {
          console.log(error)
        })
      /*    console.log([...chunks(productsArray,250)]) */
      //console.log("pro",promises)
    } else {
      try {
        const response = await fetch(
          "/api/shopify/products/reorder",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              collection_id: selectedCollection,
              toChange
            })
          }
        );
        console.log("order", response)
        toggleActiveToastOrder()
      } catch (error) {
        console.log(error);
      }
    }
    
    /* switch(productsState.collectInfo.type){
      case "smart":
        console.log("smart")
        break
      case "custom":
      const responseOrder = await api({
        method: "PUT",
        endpoint: `/admin/api/2023-01/custom_collections/${selectedCollection}.json`,
        data: {
          custom_collection:{
            id: selectedCollection,
            collects: [
              {
                product_id: 7392837468312,
                position: 1
              },
              {
                product_id: 7392838746264,
                position: 2
              }
            ]
          }
        }
      });
    } */
  };

  const handleUnselect = (e) => {
    console.log(e);
    let newObject = { id: e.item.id, index: e.oldIndex };
    let objectIndex = selectedItems.findIndex(
      (object) => object.id === newObject.id
    );

    selectedItems.splice(objectIndex, 1);
    setSelectedItems(selectedItems);

    if (selectedItems.length < 1) {
      //console.log("< 1");
      setEnableBulkBar(false);
    } else {
      setEnableBulkBar(true);
    }
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const handleSortEnd = ({ newIndex, oldIndex, item }) => {
    // Create a shallow copy of the products array
    let newProductsArray = productsArray;

    // Get the item that was moved
    let movedProduct = newProductsArray[oldIndex];

    // Remove the item from its original position
    newProductsArray.splice(oldIndex, 1);

    // Insert the item at its new position
    newProductsArray.splice(newIndex, 0, movedProduct);

    handleChangeArray(newProductsArray);

    /*
    let sortOrder = productsArray;
    console.log("oldIndex", oldIndex);
    console.log("newIndex", newIndex);
    let neighborIndex;
    let currentIndex = sortOrder.findIndex((x) => x.id === item.id);
    sortOrder.splice(
      sortOrder.findIndex((x) => x.id === item.id),
      1
    );
    if (oldIndex < newIndex)
      neighborIndex =
        sortOrder.findIndex((x) => x.id === item.previousElementSibling.id) + 1;
    else
      neighborIndex = sortOrder.findIndex(
        (x) => x.id === item.nextElementSibling.id
      );
    sortOrder.splice(neighborIndex, 0, productsArray[currentIndex]); 
    console.log(sortOrder);
    setProductsArray(sortOrder);
    */
  };
  const reorderProducts = (array, currentIndex, newIndex) => {
    if (
      currentIndex < 0 ||
      currentIndex >= array.length ||
      newIndex < 0 ||
      newIndex >= array.length
    ) {
      //console.log([currentIndex,newIndex,array])
      return "Invalid index";
    }

    var temp = array[currentIndex];
    array[currentIndex] = array[newIndex];
    array[newIndex] = temp;
    return array;
  };

  const bulkPositionChange = (newPosition) => {
    let totalFlag = selectedItems.length;
    let flag = 0;

    selectedItemsBackup.forEach((element, index) => {
      const newPositionNumber = Number(newPosition) + Number(flag);

      const reordered = reorderProducts(
        productsArray,
        element.index,
        newPositionNumber
      );
      console.log(reordered);
      handleChangeArray(reordered);
      setProductsArray(reordered);
      flag++;
    });
  };

  return (
    <>
      <>

        <input
          readOnly
          ref={auxInputCurrentPage}
          type="hidden"
          value={currentPage}
        />
        <input
          readOnly
          ref={auxInputProductsPerPage}
          type="hidden"
          value={productPerPage}
        />

        <div ref={gridEl} className="Polaris-Grid">
          {paginatedProducts.length > 0 &&
            paginatedProducts.map((product, index) => {
              if (
                product.published_at != null &&
                displaySettings.published != true
              ) {
                return (
                  <label
                    className={`Polaris-Grid-Cell Polaris-Grid-Cell--cell_${columns}ColumnXs Polaris-Grid-Cell--cell_${columns}ColumnSm Polaris-Grid-Cell--cell_${columns}ColumnMd Polaris-Grid-Cell--cell_${columns}ColumnLg Polaris-Grid-Cell--cell_${columns}ColumnXl`}
                    id={product.id}
                    key={product.id}
                  >
                    <input
                      className="hidden"
                      type="checkbox"
                      onChange={() => {
                        setTimeout(() => {
                          setSelectedItems([...selectedItems]);
                        }, 500);
                      }}
                    />
                    <ProductCard
                      product={product}
                      displaySettings={displaySettings}
                      variants={product.variants}
                      InventoryLevels={InventoryLevels}
                    />
                  </label>
                );
              } else if (displaySettings.published == true) {
                return (
                  <label
                    className={`Polaris-Grid-Cell Polaris-Grid-Cell--cell_${columns}ColumnXs Polaris-Grid-Cell--cell_${columns}ColumnSm Polaris-Grid-Cell--cell_${columns}ColumnMd Polaris-Grid-Cell--cell_${columns}ColumnLg Polaris-Grid-Cell--cell_${columns}ColumnXl`}
                    id={product.id}
                    key={product.id}
                  >
                    <input
                      className="hidden"
                      type="checkbox"
                      onChange={() => {
                        setTimeout(() => {
                          setSelectedItems([...selectedItems]);
                        }, 500);
                      }}
                    />

                    <ProductCard
                      product={product}
                      displaySettings={displaySettings}
                      variants={product.variants}
                      InventoryLevels={InventoryLevels}
                    />
                  </label>
                );
              }
            })}
        </div>
      </>
      <Pagination
        hasNext={currentPage < Math.ceil(productsArray.length / productPerPage)}
        hasPrevious={currentPage > 1}
        onNext={() => handlePageChange(currentPage + 1)}
        onPrevious={() => handlePageChange(currentPage - 1)}
      />
      <div className={"fixed-bar " + (enableFixedBar ? "active" : "")}>
        <Layout>
          <Layout.Section>
            <Button
              primary
              onClick={() => {
                saveOrderingChanges();
              }}
            >
              Save
            </Button>
          </Layout.Section>
        </Layout>
      </div>
      <div
        className={
          "fixed-bar-bulk " + (selectedItems.length > 800 ? "active" : "")
        }
      >
        <div className="fixed-bar-bulk-over">
          <Layout.Section>
            <Button
              primary
              onClick={() => {
                console.log("bulk ");
                console.log(selectedItems);
              }}
            >
              bulk actions
            </Button>
          </Layout.Section>
        </div>
      </div>
      <Modal
        open={activeModal}
        title="Bulk Actions"
        onClose={_ => {
          setActiveModal(false);
          setOpenBulkModal(false);
        }}
        primaryAction={{
          content: "Done",
          onAction: () => {
            bulkPositionChange(valueNumber);
            setActiveModal(false);
            setOpenBulkModal(false);
          },
        }}
        secondaryActions={[
          {
            content: "Cancel",
            onAction: () => {
              setActiveModal(false);
              setOpenBulkModal(false);
            },
          },
        ]}
      >
        <Modal.Section>
          <TextContainer>
            <p>
              You have {selectedItemsBackup.length} Selected Items, do you want
              to
            </p>
          </TextContainer>
        </Modal.Section>
        <Modal.Section>
          <TextField
            label="Move to position"
            value={valueNumber}
            onChange={handleChangeNumber}
            autoComplete="off"
            type="number"
          />
          <p>
            For the position {valueNumber} , will be moved for the page #
            {Math.ceil(valueNumber / productPerPage)}
          </p>
        </Modal.Section>
      </Modal>
      <Frame>{activeToast && <Toast content="All products loaded" duration={3000} onDismiss={toggleActiveToast} />}
        {activeToastOrder && <Toast content="Changues saved" duration={3000} onDismiss={toggleActiveToast} />}</Frame>

    </>
  );
};

export default ProductsRender;
