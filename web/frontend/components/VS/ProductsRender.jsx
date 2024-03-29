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
  Frame,
} from "@shopify/polaris";
import { ProductCard } from "./ProductCard";
import { ContextData } from "../../Routes";
import { useAuthenticatedFetch } from "../../hooks";
import ReorderHelper from "../../hooks/reorderHelper";

import { useDispatch, useSelector } from "react-redux";
import { sortBy } from "../../hooks/SortByHelper";
import { chunks } from "../../utils/tools";

import { ReactSortable } from "react-sortablejs";
import Sortable, { MultiDrag } from "sortablejs";
import ModalQuickActions from "./ModalQuickActions";
import { setDefaultArray } from "../../redux/slices/productsSlice";

import { setAutoFreeze } from "immer";

setAutoFreeze(false);

function mountMultiDragPlugin() {
  if (typeof window === "undefined") {
    return;
  }
  Sortable.mount(new MultiDrag());
}
mountMultiDragPlugin();

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
  const filterState = useSelector((state) => state.filter);
  const productsState = useSelector((state) => state.products);
  const dispatch = useDispatch();
  //toast
  const [activeToast, setActiveToast] = useState(false);
  const toggleActiveToast = useCallback(
    () => setActiveToast((activeToast) => !activeToast),
    []
  );
  const [activeToastOrder, setActiveToastOrder] = useState(false);
  const toggleActiveToastOrder = useCallback(
    () => setActiveToastOrder((activeToastOrder) => !activeToastOrder),
    []
  );

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

  const [isSortable, setIsSortable] = useState(true);

  const fetch = useAuthenticatedFetch();

  const handleClick = useCallback((event) => {
    if (!event.target.closest("#grid")) {
      event.preventDefault();
      event.stopPropagation();
    }
  }, []);

  useEffect(
    (_) => {
      setIsSortable(false);
      /*  setProductsArray([...productsArray, ...productsState.nextGroup]) */
      sortBy(filterState.filter, productsArray, setProductsArray);
      // probe if sort is correct
      console.log(productsArray.map((item) => item.variants[0].created_at));
      if (filterState.filter) {
        setEnableFixedBar(true);
      }
      refTemp.current = [];
      setIsSortable(true);
      // probe quantity sort with reduce
      /* console.log(productsArray.map(item => item.variants.reduce((total, variant) => total + variant.inventory_quantity
      , 0))) */
    },
    [filterState]
  );
  useEffect(
    (_) => {
      if (productsState.loadedAllProducts) {
        //console.log("loaded all products");
        toggleActiveToast();
        dispatch(
          setDefaultArray([...productsArray, ...productsState.nextGroup])
        );
        setProductsArray([...productsArray, ...productsState.nextGroup]);
      }
    },
    [productsState.loadedAllProducts]
  );
  useEffect(() => {
    if (
      displaySettings.selectedItems &&
      displaySettings.selectedItems.length > 0
    ) {
      let reOrdered = reorderHelper.init(displaySettings, productsArray, {
        productPerPage,
        currentPage,
      });
      if (reOrdered.length > 0) {
        setProductsArray(
          reOrdered.map(({ selected, chosen, ...rest }) => {
            return { ...rest };
          })
        );
        setEnableFixedBar(true);
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
        position: product.position,
        id: product.id,
        images: images,
        title: product.title,
        product_type: product.product_type,
        vendor: product.vendor,
        published_at: product.published_at,
        variants: product.variants,
      };
    });

    productsArrayMap = productsArrayMap.filter((product) => {
      return (
        (product.published_at != null && displaySettings.published != true) ||
        displaySettings.published == true
      );
    });

    
    setProductsArray(productsArrayMap);
    setProductsBackup(JSON.stringify(productsArrayMap));


    setTimeout(() => {
      
      console.log(productsArray);
    }, 1000);
  }, [allProducts]);

  useEffect(() => {
    const indexOfLastProduct = currentPage * productPerPage;
    const indexOfFirstProduct = indexOfLastProduct - productPerPage;
    const currentProducts = productsArray.slice(
      indexOfFirstProduct,
      indexOfLastProduct
    );
    console.log(indexOfLastProduct);
    const products = currentProducts.map(({ chosen, ...rest }) => {
      return { ...rest };
    });
    setPaginatedProducts(products);
    clearSelectionRef(products);
  }, [currentPage, productsArray, productPerPage]);

  /**
   *
   */

  const reorderAPI = async (selectedCollection, toChange) => {
    try {
      const response = await fetch("/api/shopify/products/reorder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          collection_id: selectedCollection,
          toChange,
        }),
      });
      //console.log("order", response);
      toggleActiveToastOrder();
      setTimeout(() => {
        toggleActiveToastOrder();
      }, 1000);
    } catch (error) {
      console.log(error);
    }
  };

  const reorderAPIMultiple = (selectedCollection, toChangeChunks) =>
    fetch("/api/shopify/products/reorder", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        collection_id: selectedCollection,
        toChange: toChangeChunks[i],
      }),
    });

  const saveOrderingChanges = async () => {
    setEnableFixedBar(false);
    if (filterState.filter === "") {
      if (productsState.loadedAllProducts) {
        console.log("defArray", productsState.defaultArray);
        const toChange = productsArray.reduce((changes, item, index) => {
          // console.log(item.id, productsState.defaultArray[index].id)
          //console.log("changue up", changes)
          if (item.id !== productsState.defaultArray[index].id) {
            console.log("diff");
            return [
              ...changes,
              {
                id: item.id,
                position: index,
              },
            ];
          }
          return changes;
        }, []);
        console.log("no bulk actions", toChange);
        reorderAPI(selectedCollection, toChange);
      } else {
        alert("not loaded all products");

        console.log("defArray", productsState.defaultArray);
        const toChange = productsArray.reduce((changes, item, index) => {
          // console.log(item.id, productsState.defaultArray[index].id)
          //console.log("changue up", changes)
          if (item.id !== productsState.defaultArray[index].id) {
            console.log("diff");
            return [
              ...changes,
              {
                id: item.id,
                position: index,
              },
            ];
          }
          return changes;
        }, []);
        console.log("no bulk actions", toChange);
        reorderAPI(selectedCollection, toChange);


      }
    } else {
      const toChange = productsArray.map(({ id }, index) => {
        return {
          id,
          position: index,
        };
      });
      if (toChange.length > 250) {
        const iterations = Math.ceil(toChange.length / 250);
        const toChangeChunks = [...chunks(toChange, 250)];
        let promises = [];
        for (let i = 0; i < iterations; i++) {
          promises = [
            ...promises,
            reorderAPIMultiple(selectedCollection, toChangeChunks),
          ];
        }
        Promise.all(promises)
          .then((res) => {
            //console.log("good", res);
            toggleActiveToastOrder();
            setTimeout(() => {
              toggleActiveToastOrder();
            }, 1000);
          })
          .catch((err) => {
            console.log(err);
          });
      } else {
        console.log("here");
        reorderAPI(selectedCollection, toChange);
      }
    }
  };

  const handlePageChange = (newPage) => {
    refTemp.current = [];
    setCurrentPage(newPage);
  };

  const updateNewList = (newElements) => {
    if (paginatedProducts.length) {
      console.log(newElements);
      const newProductsArray = [...productsArray];
      const numberOfElementsToReplace = newElements.length;
      const startIndexToReplace = newProductsArray.findIndex(
        (item) => item.id === paginatedProducts[0].id
      );
      newProductsArray.splice(
        startIndexToReplace,
        numberOfElementsToReplace,
        ...newElements
      );
      // console.clear()
      // console.log("🚀 ~ file: ProductsRender.jsx:258 ~ updateNewList ~ oldProductsArray:", newProductsArray)
      // console.log("OLD",productsArray)
      // console.log("NEW",newProductsArray)
      setProductsArray(newProductsArray);
    }
  };

  const [selectedItems2, setSelectedItems2] = useState([]);
  const [chooseAnyProduct, setChooseAnyProduct] = useState(false);

  const [showModalQuickActions, setShowModalQuickActions] = useState(false);
  const refTemp = useRef([]);

  const saveSelectionAndOpenQuickActionsModal = (e) => {
    e.preventDefault();
    if (chooseAnyProduct) refTemp.current = selectedItems2;
    window.setTimeout(() => {
      refTemp.current.forEach((node) => {
        if (node) node.classList.add("selected");
      });
    }, 100);
    setShowModalQuickActions(true);
  };

  const handleCloseModalQuickActions = () => {
    refTemp.current.forEach((node) => Sortable.utils.select(node));
    setChooseAnyProduct(false);
    setShowModalQuickActions(false);
  };
  const clearSelectionRef = (products) => {
    const itemsToDelete = [];
    refTemp.current.forEach((node) => {
      const id = Number(node.getAttribute("data-id"));
      const isElementInCurrentPage = products.find(
        (product) => product.id === id
      );
      if (!isElementInCurrentPage) {
        node.classList.remove("selected");
        Sortable.utils.deselect(node);
        itemsToDelete.push(id);
      }
    });
    const elementsInCurrentPage = refTemp.current.filter(
      (node) => !itemsToDelete.includes(Number(node.getAttribute("data-id")))
    );
    refTemp.current = elementsInCurrentPage;
  };

  const getItemsWithClassNameSelected = () => {
    return document.querySelectorAll(".product-item.selected").length > 0;
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
        {(getItemsWithClassNameSelected() || showModalQuickActions) && (
          <button
            className="Polaris-Button"
            onMouseDown={saveSelectionAndOpenQuickActionsModal}
          >
            <span className="Polaris-Button__Content">Quick Actions</span>
          </button>
        )}
        <ReactSortable
          sort={isSortable}
          onSelect={(e) => {
            setSelectedItems2(e.items);
          }}
          onChoose={() => {
            setChooseAnyProduct(true);
          }}
          onDeselect={(e) => {
            setSelectedItems2(e.items);
          }}
          onEnd={(elem) => {
            if (refTemp.current.length > 1) elem.item.classList.add("selected");
            setEnableFixedBar(true);
          }}
          selectedClass="selected"
          multiDragKey={"CTRL"}
          multiDrag={true}
          ref={gridEl}
          className="Polaris-Grid"
          list={paginatedProducts}
          setList={updateNewList}
        >
          {paginatedProducts.length > 0 &&
            paginatedProducts.map((product, index) => {
              if (
                product.published_at != null &&
                displaySettings.published != true
              ) {
                return (
                  <label
                    className={`Polaris-Grid-Cell Polaris-Grid-Cell--cell_${columns}ColumnXs Polaris-Grid-Cell--cell_${columns}ColumnSm Polaris-Grid-Cell--cell_${columns}ColumnMd Polaris-Grid-Cell--cell_${columns}ColumnLg Polaris-Grid-Cell--cell_${columns}ColumnXl product-item`}
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
                    className={`Polaris-Grid-Cell Polaris-Grid-Cell--cell_${columns}ColumnXs Polaris-Grid-Cell--cell_${columns}ColumnSm Polaris-Grid-Cell--cell_${columns}ColumnMd Polaris-Grid-Cell--cell_${columns}ColumnLg Polaris-Grid-Cell--cell_${columns}ColumnXl product-item`}
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
              } else {
                return <></>;
              }
            })}
        </ReactSortable>
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
              // onClick={() => {
              //   console.log("bulk ");
              //   console.log(selectedItems);
              // }}
            >
              bulk actions
            </Button>
          </Layout.Section>
        </div>
      </div>
      <Modal
        open={activeModal}
        title="Bulk Actions"
        onClose={(_) => {
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
      <ModalQuickActions
        showModal={showModalQuickActions}
        selectedItems={refTemp.current}
        closeModal={handleCloseModalQuickActions}
        clearSelection={clearSelectionRef}
        productsArray={productsArray}
        setProductsArray={setProductsArray}
        perPage={productPerPage}
        showSaveButton={setEnableFixedBar}
      />
      <Frame>
        {activeToast && (
          <Toast
            content="All products loaded"
            duration={3000}
            onDismiss={toggleActiveToast}
          />
        )}
        {activeToastOrder && (
          <Toast
            content="changes saved"
            duration={3000}
            onDismiss={toggleActiveToast}
          />
        )}
      </Frame>
    </>
  );
};

export default ProductsRender;
