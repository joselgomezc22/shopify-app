import { Frame, Loading, Pagination, Grid, Layout } from "@shopify/polaris";
import { useEffect, useState, useRef } from "react";
import { ProductCard } from "./ProductCard";

import { ProductsContainer } from "./ProductsContainer";

export const ProductsGrid = ({
  selectedCollection,
  api,
  apiWithPagination,
  text,
  limit,
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const [nextPageToken, setNextPageToken] = useState("");
  const [prevPageToken, setPrevPageToken] = useState("");
  const [products, setProducts] = useState([]);
  const [flag, setFlag] = useState(false);

  const [reOrderHandler, setReOrderHandler] = useState([]);

  useEffect(async () => {
    if (selectedCollection) {
      setNextPageToken("");
      setPrevPageToken("");
      setIsLoading(true);
      const request = await apiWithPagination({
        method: "GET",
        endpoint: `/admin/api/2022-10/collections/${selectedCollection}/products.json?limit=${limit}`,
      });
      const { data, link } = await request.json();
      paginationHandler(link);

      setProducts(data.products);
      setIsLoading(false);
    } else {
      setIsLoading(true);
      setNextPageToken("");
      setPrevPageToken("");
      setProducts([]);
      setIsLoading(false);
    }

    setIsLoading(false);
  }, [selectedCollection, limit]);

  const requestPaginate = async (pageToken) => {
    setNextPageToken("");
    setPrevPageToken("");
    setIsLoading(true);
    const request = await apiWithPagination({
      method: "GET",
      endpoint: `/admin/api/2022-10/collections/${selectedCollection}/products.json?limit=${limit}&page_info=${pageToken}`,
    });
    const { data, link } = await request.json();
    paginationHandler(link);
    setProducts(data.products);
    setIsLoading(false);
  };

  const changeHandler = (e) => {
    let newIndices = e.newIndicies.map((item) => {
      return {
        id: item.multiDragElement.querySelector(".id_handler").dataset.id,
        index: item.index,
      };
    });

    let currentChangeArray = reOrderHandler;
    console.log("h");
    newIndices.forEach((element) => {
      const objectIndex = currentChangeArray.findIndex(
        (obj) => obj.id === element.id
      );
      if (objectIndex === -1) {
        // if no object with the same id exists, push the newObject
        currentChangeArray.push(element);
      } else {
        // if object with the same id exists, remove it and push the element
        currentChangeArray.splice(objectIndex, 1, element);
      }
    });
  
    setReOrderHandler(currentChangeArray);
    console.log(reOrderHandler);
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

  return (
    <>
      {isLoading && (
        <Frame>
          <Loading />
        </Frame>
      )}
      {JSON.stringify(reOrderHandler)}
      <ProductsContainer onChange={changeHandler} products={products} />
      {(nextPageToken || prevPageToken) && (
        <Pagination
          hasPrevious={prevPageToken}
          onPrevious={() => {
            requestPaginate(prevPageToken);
          }}
          hasNext={nextPageToken}
          onNext={() => {
            requestPaginate(nextPageToken);
          }}
        />
      )}

      <br />
      <br />
      <br />
    </>
  );
};
