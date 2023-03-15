import { Frame, Loading, Pagination, Grid, Layout } from "@shopify/polaris";
import { useEffect, useState, useCallback, useContext } from "react";
import { ProductCard } from "./ProductCard";
import SearchResults from "./SearchResults";

import { ProductsContainer } from "./ProductsContainer";

import ProductsRender from "./ProductsRender";
import { useDispatch, useSelector } from "react-redux";
import { setArrayProducts, setcollectInfo, setNextProducts, setSelectedColl } from "../../redux/slices/productsSlice";

export const ProductsGrid = ({
  selectedCollection,
  api,
  apiWithPagination,
  text,
  limit,
  openBulkModal,
  serOpen,
  setOpenBulkModal,
  columns,
  productPerPage,
  setProductPerPage,

  displaySettings,
  setProductsExternal,
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const [nextPageToken, setNextPageToken] = useState("");
  const [prevPageToken, setPrevPageToken] = useState("");
  const [products, setProducts] = useState([]);
  const [productsBackup, setProductsBackup] = useState([]);
  const [productWithVariants, setWithVariants] = useState([]);
  const [flag, setFlag] = useState(false);
  const [inventoryLevels, setInventoryLevels] = useState([]);

  const [reOrderHandler, setReOrderHandler] = useState([]);

  // if a collection has mot than 250, this object will handle the next products to have them ready in case to need them
  // const [nextProducts, setNextProducts] = useState({});

  //global state
  const productsState = useSelector(state => state.products)
  const dispatch = useDispatch()

  useEffect(async () => {
    dispatch(setArrayProducts([]))
    dispatch(setNextProducts([]))
    if (selectedCollection) {
      dispatch(setSelectedColl(selectedCollection))
      setNextPageToken("");
      setPrevPageToken("");
      setIsLoading(true);
      const collectionInfo = await api({
        method: "GET",
        endpoint: `/admin/api/2023-01/collections/${selectedCollection}.json?fields=collection_type`,
      });

      console.log("collect info", collectionInfo.collection)

      const { collection: { collection_type, products_count, sort_order
      } } = collectionInfo
      dispatch(setcollectInfo({
        type: collection_type,
        totalProducts: products_count,
        sort_order
      }))

      /* const request2 = await api({
        method: "GET",
        endpoint: `/admin/api/2022-04/collects.json?collection_id=${selectedCollection}&limit=250`,
      });

      console.log(request2)
      const {collects} = request2 */

      const request = await apiWithPagination({
        method: "GET",
        endpoint: `/admin/api/2022-10/collections/${selectedCollection}/products.json?limit=${limit}`,
      });
      const { data, link } = await request.json();
      console.log("first",data)
      paginationHandler(link);
      const arrayProductsIds = data.products.map((prod) => prod.id).join(",");

      const request_variants = await apiWithPagination({
        method: "GET",
        endpoint: `/admin/api/2022-10/products.json?fields=variants,id&ids=${arrayProductsIds}&limit=250`,
      });
      const { data: data_variants } = await request_variants.json();

      const productsNew = data.products.map((product, index) => {
        const correspondingVariant = data_variants.products.find(
          (variant) => variant.id === product.id
        );

        return {
          id: product.id,
          images: product.images,
          title: product.title,
          product_type: product.product_type,
          vendor: product.vendor,
          published_at: product.published_at,
          tags: product.tags,
          variants: correspondingVariant?.variants,
        };
      });

      if (displaySettings.enableLocations == true) {
        setInventoryItemsRequest(productsNew);
      }
      setProducts(productsNew);
      dispatch(setArrayProducts(productsNew))
      setProductsExternal(productsNew);
      setProductsBackup(productsNew);
      setWithVariants(data_variants.products);
      setIsLoading(false);
    } else {
      setIsLoading(true);
      setNextPageToken("");
      setPrevPageToken("");
      dispatch(setArrayProducts([]))
      setProducts([]);
      setIsLoading(false);
    }
    setIsLoading(false);
  }, [selectedCollection]);

  useEffect(_ => {
    if (nextPageToken) {
      console.log("pagination")
      requestPaginate(nextPageToken)
    }else{
      //console.log(productsState.arrayProducts.length,productsState.collectInfo.totalProducts)
    }
  }, [nextPageToken])
  /* useEffect(async () => { 
    console.log("cambio todo")
  }, [productsState.arrayProducts]); */

  useEffect(async () => {
    if (displaySettings.enableLocations && inventoryLevels.length == 0) {
      setInventoryItemsRequest(products);
    }
  }, [displaySettings]);

  const handleSetProducts = useCallback((newProducts) => {
    setProducts(newProducts);
  });
  const handleInventoryLevels = useCallback((newInventoryLevels) => {
    setInventoryLevels(newInventoryLevels);
  });

  /**
   *
   * @param {array} productsArray
   */
  const setInventoryItemsRequest = async (productsArray) => {
    let inventory_item_ids = [];

    let locationsIds = displaySettings.locations
      .filter((location) => {
        return location.selected == true;
      })
      .map((location) => {
        return location.id;
      });

    console.log(locationsIds.join(","));

    productsArray.forEach((product) => {
      product.variants.forEach((variant) => {
        inventory_item_ids.push(variant.inventory_item_id);
      });
    });
    const inventory_item_ids_string = inventory_item_ids.join(",");
    if (inventory_item_ids.length > 250) {
      let inventory_levels = [];
      const originalArray = inventory_item_ids;
      const chunkSize = 250;
      let chunks = [];

      for (let i = 0; i < originalArray.length; i += chunkSize) {
        chunks.push(originalArray.slice(i, i + chunkSize));
      }

      const chunkPromises = chunks.map(async (chunk, chunkIndex) => {
        const inventory_item_ids_string_chunk = chunk.join(",");
        const request = await apiWithPagination({
          method: "GET",
          //endpoint: `/admin/api/2022-10/inventory_levels.json?location_ids=${locationsIds.join(",")}&limit=${250}&inventory_item_ids=${inventory_item_ids_string_chunk}`,
          endpoint: `/admin/api/2022-10/inventory_levels.json?limit=${250}&inventory_item_ids=${inventory_item_ids_string_chunk}`,
        });
        const { data, link } = await request.json();
        return data.inventory_levels;
      });

      Promise.all(chunkPromises).then((values) => {
        inventory_levels = [].concat.apply([], values);
        console.log(inventory_levels);
        handleInventoryLevels(inventory_levels);
      });
    } else {
      const request = await apiWithPagination({
        method: "GET",
        endpoint: `/admin/api/2022-10/inventory_levels.json?location_ids=${locationsIds.join(
          ","
        )}&limit=${250}&inventory_item_ids=${inventory_item_ids_string}`,
      });
      const { data, link } = await request.json();
      console.log(data.inventory_levels);
      handleInventoryLevels(data.inventory_levels);
    }
  };

  const requestPaginate = async (pageToken) => {
    setNextPageToken("");
    setPrevPageToken("");
    setIsLoading(true);
    const request = await apiWithPagination({
      method: "GET",
      endpoint: `/admin/api/2022-10/collections/${selectedCollection}/products.json?limit=${limit}&page_info=${pageToken}`,
    });
    const { data, link } = await request.json();
    const arrayProductsIds = data.products.map((prod) => prod.id).join(",");
    const request_variants = await apiWithPagination({
      method: "GET",
      endpoint: `/admin/api/2022-10/products.json?fields=variants,id&ids=${arrayProductsIds}&limit=250`,
    });
    const { data: data_variants } = await request_variants.json();

    const productsNew = data.products.map((product, index) => {
      const correspondingVariant = data_variants.products.find(
        (variant) => variant.id === product.id
      );

      return {
        id: product.id,
        images: product.images,
        title: product.title,
        product_type: product.product_type,
        vendor: product.vendor,
        published_at: product.published_at,
        tags: product.tags,
        variants: correspondingVariant?.variants,
      };
    });
    //console.log("newArray",productsNew)
    dispatch(setNextProducts([...productsState.nextGroup, ...productsNew]))
    paginationHandler(link);
    /*  setProducts(data.products); */
    setIsLoading(false);
  };
  /**
   *
   * @param {string} link Return of a request with pagination
   * @param {string} collection_id
   */
  const requestRestOfProducts = (link, collection_id) => {
    if (link) {
      const linkArray = link.split(",");
      let nextPage;
      let prevPage;

      const collectionInfo = api({
        method: "GET",
        endpoint: `/admin/api/2022-07/collections/${collection_id}.json?fields=collection_type`,
      });

      return;

      let productCount = api({
        method: "GET",
        endpoint: `/admin/api/2020-01/collects/count.json?collection_id=${collection_id}&status=ACTIVE `,
      });

      if (linkArray.length > 1) {
        nextPage = linkArray[1].split(";")[0];
        prevPage = linkArray[0].split(";")[0];

        nextPage = nextPage.replace(">", "");
        nextPage = nextPage.replace("<", "");
        //setNextPageToken(getParameterByName("page_info", nextPage));
        let nextPageToken = getParameterByName("page_info", nextPage);

        prevPage = prevPage.replace(">", "");
        prevPage = prevPage.replace("<", "");
        //setPrevPageToken(getParameterByName("page_info", prevPage));
      } else {
        let pageFlag = linkArray[0].split(";");

        nextPage = linkArray[0].split(";")[0];
        prevPage = null;

        nextPage = nextPage.replace(">", "");
        nextPage = nextPage.replace("<", "");

        if (pageFlag[1].replace("rel=", "") == ' "next"') {
          setNextPageToken(getParameterByName("page_info", nextPage));
        } else {
          setPrevPageToken(getParameterByName("page_info", nextPage));
        }
      }
    } else {
      console.log("it has not pagination");
    }
  };

  const paginationHandler = (link) => {
    if (link) {
      const linkArray = link.split(",");
      console.log(linkArray);
      let nextPage;
      let prevPage;

      /**
       * TODO: recognize by rel: next or prev
       */
      if (linkArray.length > 1) {
        nextPage = linkArray[1].split(";")[0];
        prevPage = linkArray[0].split(";")[0];

        nextPage = nextPage.replace(">", "");
        nextPage = nextPage.replace("<", "");
        setNextPageToken(getParameterByName("page_info", nextPage));

        prevPage = prevPage.replace(">", "");
        prevPage = prevPage.replace("<", "");
        setPrevPageToken(getParameterByName("page_info", prevPage));
      } else {
        let pageFlag = linkArray[0].split(";");
        console.log();

        nextPage = linkArray[0].split(";")[0];
        prevPage = null;

        nextPage = nextPage.replace(">", "");
        nextPage = nextPage.replace("<", "");

        if (pageFlag[1].replace("rel=", "") == ' "next"') {
          setNextPageToken(getParameterByName("page_info", nextPage));
        } else {
          setPrevPageToken(getParameterByName("page_info", nextPage));
        }
      }
    } else {
      console.log("it has not pagination");
    }
  };

  const getParameterByName = (name, url = window.location.href) => {
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
      results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return "";
    return decodeURIComponent(results[2].replace(/\+/g, " "));
  };

  const onEndHandler = (e) => { };

  return (
    <>
      {isLoading && (
        <Frame>
          <Loading />
        </Frame>
      )}



      {!isLoading && (
        <>
          <ProductsRender
            api={api}
            selectedCollection={selectedCollection}
            columns={columns}
            openBulkModal={openBulkModal}
            setOpenBulkModal={setOpenBulkModal}
            onEndHandler={onEndHandler}
            allProducts={products}
            productWithVariants={productWithVariants}
            productPerPage={productPerPage}
            displaySettings={displaySettings}
            InventoryLevels={inventoryLevels}
          />
        </>
      )}
    </>
  );
};
