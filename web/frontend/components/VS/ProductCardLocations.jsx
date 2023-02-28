import { useState, useEffect } from "react";
import { Card, List, TextContainer , Icon } from "@shopify/polaris";
import { LocationMajor } from "@shopify/polaris-icons";


export const ProductCardLocations = ({
  product,
  displaySettings,
  variants,
  InventoryLevels,
  ownInventoryLevels
}) => {
  return (
    <>
      {displaySettings.enableLocations && ownInventoryLevels.length > 0 && (
          <>
            {product.variants.length > 0 &&
              displaySettings?.locations?.map((location) => {
                if (location.selected) {
                  let current = ownInventoryLevels.filter(
                    (item) => item.location_id === location.id
                  );
                  return (
                    <div key={location.id}>
                    
                      <Icon source={LocationMajor} /> {location.name} <br />
                      {product.variants.map((variant,index) => {
                        let currentVariant = current.filter(
                          (item) =>
                            item.inventory_item_id === variant.inventory_item_id
                        )[0];
                        return (
                          <p key={location.id+'_'+variant.id+index}>
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
                    </div>
                  );
                }
              })}
          </>
            )}
    </>
  );
};
