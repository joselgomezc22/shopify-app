import {
  Card,
  Page,
  Layout,
  TextContainer,
  Image,
  Stack,
  Link,
  Heading,
  Select,
  Grid,
  Button,
} from "@shopify/polaris";
import { useEffect } from "react";
import { TitleBar } from "@shopify/app-bridge-react";

import { useState } from "react";
import { trophyImage } from "../assets";

import { ProductsCard } from "../components";
import { DashboardHeading } from "../components/VS/DashboardHeading";

import { useAppQuery, useAuthenticatedFetch } from "../hooks";
import { ProductsGrid } from "../components/VS/ProductsGrid";
import { useDispatch, useSelector } from "react-redux";
import { setFilter } from "../redux/slices/filterSlice";
import { NotManualCollectionAdvertise } from "../components/VS/NotManualCollectionAdvertise";

export default function HomePage() {
  const secondaryActions = [];

  const [collections, setCollections] = useState([]); // array:  [...{label: collection.tittle,value:collection.id}]
  const [selectedCollection, setSelectedCollection] = useState(""); // number : collection.id
  const [limit, setLimit] = useState(250);
  const [columns, setColumns] = useState("3");
  const [productPerPage, setPerPage] = useState("16");
  const [openBulkModal, setOpenBulkModal] = useState(false);

  //global state
  const dispatch = useDispatch();
  const productsState = useSelector((state) => state.products);

  const [products, setProducts] = useState([]);
  const PriActDefValue = {
    content: "Bulk Actions",
    onAction: () => {
      setOpenBulkModal(true);
    },
  };
  const [primaryAction, setPrimaryAction] = useState(null);

  const fetch = useAuthenticatedFetch();

  /**
   * * Display settings states
   */

  const [displaySettings, setDisplay] = useState({
    enableLocations: false,
    title: true,
    price: false,
    priceFull: false,
    type: false,
    vendor: false,
    inventory: false,
    published: false,
    locations: [],
  });
  useEffect(
    (_) => {
      dispatch(setFilter(""));
    },
    [selectedCollection]
  );

  useEffect(
    (_) => {
      if (
        productsState.collectInfo.totalProducts > 2000 &&
        productsState.loadedAllProducts
      ) {
        setPrimaryAction(PriActDefValue);
      } else {
        setPrimaryAction(null);
      }
    },
    [productsState.loadedAllProducts]
  );
  const api = async (body) => {
    /**
     * @Request will always be POST TYPE
     */
    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    };
    const response = await fetch("/api/shopify/proxy", requestOptions);

    if (response.ok) {
      const data = await response.json();
      return data;
    } else {
      console.log(response);
    }
  };
  const apiWithPagination = async (body) => {
    /**
     * @Request will always be POST TYPE
     */
    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    };
    const response = await fetch(
      "/api/shopify/proxy/with-pagination",
      requestOptions
    );

    if (response.ok) {
      const data = await response;
      return data;
    } else {
      console.log(response);
    }
  };

  return (
    <Page fullWidth>
      <NotManualCollectionAdvertise
      api={api}
        setSelectedCollection={setSelectedCollection}
      />
      <TitleBar
        title="Visual Merchandiser 2.0"
        secondaryActions={secondaryActions}
        primaryAction={primaryAction}
      />
      <DashboardHeading
        api={api}
        collections={collections}
        setCollections={setCollections}
        selectedCollection={selectedCollection}
        setSelectedCollection={setSelectedCollection}
        limit={limit}
        setLimit={setLimit}
        columns={columns}
        setColumns={setColumns}
        setPerPage={setPerPage}
        productPerPage={productPerPage}
        displaySettings={displaySettings}
        setDisplay={setDisplay}
        products={products}
      />
      <div className="margin-top">
        <ProductsGrid
          columns={columns}
          limit={limit}
          api={api}
          selectedCollection={selectedCollection}
          apiWithPagination={apiWithPagination}
          openBulkModal={openBulkModal}
          setOpenBulkModal={setOpenBulkModal}
          productPerPage={productPerPage}
          displaySettings={displaySettings}
          setProductsExternal={setProducts}
        />
      </div>
    </Page>
  );
}
