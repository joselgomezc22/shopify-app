import { Button, Modal, TextContainer } from "@shopify/polaris";
import { useState, useCallback, useRef } from "react";

export const NotManualCollectionAdvertise = ({ setSelectedCollection }) => {
  const [active, setActive] = useState(true);

  const handleChange = useCallback(() => setActive(!active), [active]);

  const activator = <Button onClick={handleChange}>Open</Button>;

  const setCollectionToManual = () => {};

  return (
    <div>
      <Modal
        open={active}
        onClose={handleChange}
        title="Sort Order must be set to manual"
        primaryAction={{
          content: "No, Skip This Collection",
          onAction: () => {
            setSelectedCollection("");
            handleChange();
          },
        }}
        secondaryActions={[
          {
            content: "Set Sort Order to Manual",
            onAction: () => {
              setCollectionToManual();
              handleChange();
            },
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
