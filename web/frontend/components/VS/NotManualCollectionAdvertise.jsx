import { Button, Modal, TextContainer } from "@shopify/polaris";
import { useState, useCallback, useRef, useEffect } from "react";
import { useSelector } from "react-redux";

export const NotManualCollectionAdvertise = ({ api, setSelectedCollection }) => {
  const [active, setActive] = useState(false);

  const productsState = useSelector(state => state.products)

  const handleChange = useCallback(() => setActive(!active), [active]);

  const cancel = () => {
    setSelectedCollection("");
    handleChange();
  }
  const setCollectionToManual = async () => {
    switch(productsState.collectInfo.type){
      case "smart":
        console.log("smart")
        const responseOrder = await api({
          method: "PUT",
          endpoint: `/admin/api/2022-04/smart_collections/${productsState.selectedCollection}/order.json?sort_order=manual`
        });
        break
      case "custom":
        const responseOrderCustom = await api({
          method: "PUT",
          endpoint: `/admin/api/2023-01/custom_collections/${productsState.selectedCollection}.json`,
          data: {
            custom_collection:{
              id: productsState.selectedCollection,
              sort_order: "manual"
            }
          }
        });
        break
    }
    handleChange();
  };
  useEffect(_ => {
    if(productsState.collectInfo.sort_order !== "manual" && productsState.collectInfo.sort_order ){
      handleChange()
    }
  },[productsState.collectInfo])

  return (
    <div>
      <Modal
        open={active}
        onClose={cancel}
        title="Sort Order must be set to manual"
        primaryAction={{
          content: "No, Skip This Collection",
          onAction: cancel,
        }}
        secondaryActions={[
          {
            content: "Set Sort Order to Manual",
            onAction: setCollectionToManual
          },
        ]}
      >
        <Modal.Section>
          <TextContainer>
            <p>The current sort order is best-selling.</p>
          </TextContainer>
        </Modal.Section>
      </Modal>
    </div>
  );
};
