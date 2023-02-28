import { Grid, Button } from "@shopify/polaris";
import { useEffect, useRef } from "react";
import { ProductCard } from "./ProductCard";
import Sortable, { MultiDrag, Swap } from "sortablejs";

export const ProductsContainer = ({ products, onChange }) => {
  const gridEl = useRef();
  useEffect(() => {
    if (gridEl) {
      
      Sortable.create(gridEl.current, {
        multiDrag: true,
        selectedClass: "selected",
        onEnd: (e) => {
          onChange(e);
        },
      });
    }
  }, []);
    
  return (
    <> 
      <div ref={gridEl} className="Polaris-Grid"> 
        {products.length > 0 && (
          <>
            {products.map((product) => (
              <Grid.Cell
                key={product.id}
                columnSpan={{ xs: 3, sm: 3, md: 3, lg: 3, xl: 3 }}
              >
                <span className="id_handler" data-id={product.id}></span>
                <ProductCard product={product} />
              </Grid.Cell>
            ))}
          </>
        )}
      </div>
    </>
  );
};
