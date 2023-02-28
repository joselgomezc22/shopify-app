import { useEffect, useState, useCallback } from "react";
import { Card, List, TextContainer } from "@shopify/polaris";
import { useAppQuery, useAuthenticatedFetch } from "../../hooks";
import { ProductCardLocations } from "./ProductCardLocations";

export const ProductCard = ({
  product,
  displaySettings,
  variants,
  InventoryLevels,
}) => {
  const fetch = useAuthenticatedFetch();
  const [priceRanges, setPriceRanges] = useState(null);
  const [inventoryLevels, setInventoryLevels] = useState([]);

  useEffect(() => {
    let priceRange = findMinMaxPrice(variants);
    setPriceRanges(priceRange);
  }, [displaySettings, product, variants]);

  useEffect(() => {
    if (InventoryLevels.length > 0) {
      let ownInventoryLevels = compareInventoryAndVariants(
        InventoryLevels,
        variants
      );
      handleSetInventoryLevels(ownInventoryLevels);
    }
  }, [InventoryLevels]);

  const handleSetInventoryLevels = useCallback((invLevels) =>
    setInventoryLevels(invLevels)
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
  function findMinMaxPrice(variants) {
    let minPrice = Number.POSITIVE_INFINITY;
    let maxPrice = Number.NEGATIVE_INFINITY;

    variants?.forEach((variant) => {
      if (variant.price < minPrice) {
        minPrice = variant.price;
      }
      if (variant.price > maxPrice) {
        maxPrice = variant.price;
      }
    });

    return { minPrice, maxPrice };
  }
  function compareInventoryAndVariants(inventoryLevels, variants) {
    return inventoryLevels.filter((inventoryLevel) =>
      variants.some(
        (variant) =>
          variant.inventory_item_id === inventoryLevel.inventory_item_id
      )
    );
  }

  return (
    <>
      <Card
        sectioned
        key={product.id}
        title={displaySettings.title ? product.title : ""}
      >
       
        <img width="100%" src={product.images[0]?.src} alt="" />

        <List>
          {displaySettings.type && (
            <List.Item>
              <TextContainer>Type: {product.product_type}</TextContainer>
            </List.Item>
          )}
          {displaySettings.vendor && (
            <List.Item>
              <TextContainer>Vendor: {product.vendor}</TextContainer>
            </List.Item>
          )}
          {displaySettings.price && (
            <List.Item>
              <TextContainer>
                Price:
                {priceRanges && (
                  <>
                    ${priceRanges.minPrice} - ${priceRanges.maxPrice}
                  </>
                )}
              </TextContainer>
            </List.Item>
          )}
        </List>
        {displaySettings.priceFull && (
          <>
            <h2>Prices per variant</h2>
            <List title="FullPrices">
              {product &&
                product?.variants?.map((variant) => (
                  <List.Item>
                    {variant.title} : ${variant.price}
                  </List.Item>
                ))}
            </List>
          </>
        )}

        {displaySettings.inventory && (
          <List title="FullPrices">
            {product &&
              product?.variants?.map((variant) => (
                <List.Item>
                  {variant.title} : {variant.inventory_quantity}
                </List.Item>
              ))}
          </List>
        )}
        {inventoryLevels.length > 0 && (
          <ProductCardLocations
            product={product}
            displaySettings={displaySettings}
            variants={variants}
            InventoryLevels={InventoryLevels}
            ownInventoryLevels={inventoryLevels}
          />
        )}
        {/*displaySettings.enableLocations && inventoryLevels.length > 0 && (
          <>
            {product.variants &&
              displaySettings?.locations?.map((location) => {
                if (location.selected) {
                  let current = inventoryLevels.filter(
                    (item) => item.location_id === location.id
                  );
                  return (
                    <>
                      {location.name} <br />
                      {product.variants.map((variant) => {
                        let currentVariant = current.filter(
                          (item) =>
                            item.inventory_item_id === variant.inventory_item_id
                        )[0];
                        return (
                          <p>
                            {variant.title} :
                            {currentVariant && (
                              <>
                                {currentVariant?.available != null
                                  ? currentVariant?.available
                            : "n/a"}
                              </>
                            )} 
                          </p>
                        );
                      })}
                    </>
                  );
                }
              })}
          </>
            )*/}
      </Card>
    </>
  );
};
